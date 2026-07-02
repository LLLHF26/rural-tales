"""FastAPI 应用入口"""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path

from app.config import settings
from app.database import engine, Base, get_redis, _redis
from app.api.admin.router import admin_router
from app.api.mobile.router import mobile_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # 启动时创建表（生产环境应使用 Alembic 迁移）
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    # 关闭时释放资源
    await engine.dispose()
    if _redis is not None:
        try:
            await _redis.aclose()
        except Exception:
            pass


app = FastAPI(
    title=settings.APP_NAME,
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(admin_router)
app.include_router(mobile_router)

# 静态文件（测试前端等）
static_dir = Path(__file__).parent.parent / "static"
if static_dir.exists():
    app.mount("/static", StaticFiles(directory=str(static_dir), html=True), name="static")


@app.get("/")
async def health():
    return {"status": "ok", "app": settings.APP_NAME}

##启动指令：uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload --log-level info
