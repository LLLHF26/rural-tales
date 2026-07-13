"""测试共享 fixtures"""
import asyncio
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from httpx import ASGITransport, AsyncClient

# ———— 在导入 app 之前 mock 掉 database 模块 ————
_mock_engine = MagicMock()
_mock_sessionmaker = MagicMock()
_mock_redis = AsyncMock()

with patch("app.database.engine", _mock_engine), patch(
    "app.database.async_session", _mock_sessionmaker
), patch("app.database._redis", _mock_redis):
    from app.main import app
    from app.dependencies import get_current_user, get_current_admin
    from app.models.user import User, Admin


@pytest.fixture(autouse=True)
def _reset_dependency_overrides():
    """每个测试前重置依赖覆盖"""
    app.dependency_overrides.clear()
    yield
    app.dependency_overrides.clear()


# ===================== Mock 数据库 session =====================

class MockSession:
    """模拟 AsyncSession —— 按需在具体测试中配置 execute / scalar 返回值"""

    def __init__(self):
        self.added: list = []
        self.deleted: list = []
        self.committed = False
        self.rolled_back = False

    async def execute(self, *args, **kwargs):
        raise NotImplementedError("请在测试中 mock MockSession.execute")

    async def flush(self, *args, **kwargs):
        pass

    async def commit(self):
        self.committed = True

    async def rollback(self):
        self.rolled_back = True

    def add(self, obj):
        self.added.append(obj)

    async def delete(self, obj):
        self.deleted.append(obj)

    async def __aenter__(self):
        return self

    async def __aexit__(self, *args):
        pass


@pytest.fixture
def mock_db():
    """返回 MockSession 实例，setUp 中配置其 execute """
    return MockSession()


@pytest.fixture
def app_with_db(mock_db):
    """将 get_db 覆盖为 mock_db"""
    async def _get_db():
        yield mock_db

    from app.database import get_db
    app.dependency_overrides[get_db] = _get_db
    return app


# ===================== Mock 认证 =====================

@pytest.fixture
def mock_user():
    """普通用户"""
    from app.utils.security import hash_password
    return User(
        id=1, phone="13800138000", password_hash=hash_password("123456"),
        nickname="测试用户", avatar="",
    )


@pytest.fixture
def mock_admin():
    """管理员"""
    from app.utils.security import hash_password
    return Admin(
        id=1, username="admin", password_hash=hash_password("admin123"),
        nickname="管理员", role="admin", status="active",
    )


@pytest.fixture
def auth_headers():
    """携带有效 user token 的请求头"""
    from app.utils.security import create_token
    token = create_token({"user_id": 1})
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def admin_headers():
    """携带有效 admin token 的请求头"""
    from app.utils.security import create_token
    token = create_token({"admin_id": 1, "role": "admin"})
    return {"Authorization": f"Bearer {token}"}


# ===================== AsyncClient =====================

@pytest.fixture
async def client(app_with_db, mock_db, mock_user):
    """带认证的移动端客户端 —— 自动注入 get_current_user"""
    async def _get_user():
        return mock_user

    app_with_db.dependency_overrides[get_current_user] = _get_user

    transport = ASGITransport(app=app_with_db)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac


@pytest.fixture
async def anon_client(app_with_db, mock_db):
    """无认证客户端"""
    transport = ASGITransport(app=app_with_db)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac


@pytest.fixture
async def admin_client(app_with_db, mock_db, mock_admin):
    """管理端客户端 —— 自动注入 get_current_admin"""
    async def _get_admin():
        return mock_admin

    app_with_db.dependency_overrides[get_current_admin] = _get_admin

    transport = ASGITransport(app=app_with_db)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
