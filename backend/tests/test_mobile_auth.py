"""移动端 —— 用户认证 测试"""
import pytest
from unittest.mock import AsyncMock, MagicMock

from app.models.user import User


class TestSendCode:
    async def test_send_code_dev_mode(self, anon_client, mock_db):
        """开发模式下发送验证码应返回 expireSeconds"""
        async def mock_send(redis, phone):
            return {"expireSeconds": 300}
        import app.api.mobile.auth as auth_mod
        auth_mod.send_verify_code = mock_send

        resp = await anon_client.post("/v1/user/send-code", json={"phone": "13800138000"})
        assert resp.status_code == 200
        data = resp.json()
        assert data["code"] == 0
        assert data["data"]["expireSeconds"] == 300


class TestSmsLogin:
    async def test_login_new_user(self, anon_client, mock_db):
        """新用户验证码登录 —— 自动注册"""
        import app.api.mobile.auth as auth_mod
        auth_mod.verify_code = AsyncMock(return_value=True)

        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = None  # 用户不存在 → 新用户
        mock_db.execute = AsyncMock(return_value=mock_result)

        resp = await anon_client.post("/v1/user/login", json={"phone": "13800138000", "code": "000000"})
        assert resp.status_code == 200
        data = resp.json()
        assert data["code"] == 0
        assert "token" in data["data"]
        assert data["data"]["user"]["isNewUser"] is True

    async def test_login_existing_user(self, anon_client, mock_db):
        """已存在用户验证码登录"""
        import app.api.mobile.auth as auth_mod
        auth_mod.verify_code = AsyncMock(return_value=True)

        exist_user = User(id=1, phone="13800138000", password_hash="x", nickname="老用户")
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = exist_user
        mock_db.execute = AsyncMock(return_value=mock_result)
        mock_db.flush = AsyncMock()

        resp = await anon_client.post("/v1/user/login", json={"phone": "13800138000", "code": "000000"})
        assert resp.status_code == 200
        data = resp.json()
        assert data["data"]["user"]["isNewUser"] is False
        assert data["data"]["user"]["nickname"] == "老用户"

    async def test_login_wrong_code(self, anon_client, mock_db):
        """验证码错误"""
        import app.api.mobile.auth as auth_mod
        auth_mod.verify_code = AsyncMock(return_value=False)

        resp = await anon_client.post("/v1/user/login", json={"phone": "13800138000", "code": "111111"})
        data = resp.json()
        assert data["code"] == 1001


class TestPasswordLogin:
    async def test_password_login_success(self, anon_client, mock_db):
        """密码登录成功"""
        from app.utils.security import hash_password

        user = User(id=2, phone="13800138001", password_hash=hash_password("123456"), nickname="老王")
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = user
        mock_db.execute = AsyncMock(return_value=mock_result)

        resp = await anon_client.post("/v1/user/login-password", json={"phone": "13800138001", "password": "123456"})
        assert resp.status_code == 200
        data = resp.json()
        assert data["code"] == 0
        assert "token" in data["data"]

    async def test_password_login_wrong(self, anon_client, mock_db):
        """密码错误"""
        from app.utils.security import hash_password

        user = User(id=2, phone="13800138001", password_hash=hash_password("correct"))
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = user
        mock_db.execute = AsyncMock(return_value=mock_result)

        resp = await anon_client.post("/v1/user/login-password", json={"phone": "13800138001", "password": "wrong"})
        data = resp.json()
        assert data["code"] == 1001


class TestProfile:
    async def test_get_profile(self, client, mock_db):
        """获取个人资料"""
        from app.models.progress import ScriptProgress
        # count 查询
        mock_result = MagicMock()
        mock_result.scalar.return_value = 3  # 完成3个剧本
        mock_db.execute = AsyncMock(return_value=mock_result)

        resp = await client.get("/v1/user/profile")
        assert resp.status_code == 200
        data = resp.json()
        assert data["code"] == 0
        assert data["data"]["nickname"] == "测试用户"
        assert data["data"]["completedScriptCount"] == 3

    async def test_update_profile(self, client, mock_db):
        """更新个人资料"""
        resp = await client.put("/v1/user/profile", json={"nickname": "新昵称"})
        assert resp.status_code == 200
        assert resp.json()["code"] == 0

    async def test_get_profile_unauthorized(self, anon_client):
        """未登录访问 —— FastAPI 对缺失 Header(...) 返回 422"""
        resp = await anon_client.get("/v1/user/profile")
        assert resp.status_code == 422
