"""数据库 & Redis 连接"""

from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy import event
from redis.asyncio import Redis

from app.config import settings

engine = create_async_engine(settings.db_url, echo=settings.APP_DEBUG, pool_size=20, max_overflow=10)


@event.listens_for(engine.sync_engine, "connect")
def _set_db_timezone(dbapi_conn, connection_record):
    cursor = dbapi_conn.cursor()
    cursor.execute("SET time_zone = '+08:00'")
    cursor.close()


async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


async def get_db() -> AsyncSession:
    async with async_session() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise


_redis: Redis | None = None
_redis_attempted: bool = False


async def get_redis() -> Redis | None:
    global _redis, _redis_attempted
    if not _redis_attempted:
        _redis_attempted = True
        try:
            _redis = Redis.from_url(settings.redis_url, decode_responses=True, socket_connect_timeout=2)
            await _redis.ping()
        except Exception:
            _redis = None
    return _redis
