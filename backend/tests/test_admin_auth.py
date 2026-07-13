"""管理端 —— 认证 测试"""
import pytest
from unittest.mock import AsyncMock, MagicMock

from app.models.user import Admin


class TestAdminLogin:
    async def test_login_success(self, anon_client, mock_db):
        """管理员登录成功"""
        from app.utils.security import hash_password

        admin = Admin(id=1, username="admin", password_hash=hash_password("admin123"),
                      nickname="管理员", role="admin", status="active")
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = admin
        mock_db.execute = AsyncMock(return_value=mock_result)

        resp = await anon_client.post("/admin/auth/login", json={
            "username": "admin", "password": "admin123"
        })
        data = resp.json()
        assert data["code"] == 0
        assert "token" in data["data"]
        assert data["data"]["admin"]["username"] == "admin"
        assert data["data"]["admin"]["role"] == "admin"

    async def test_login_wrong_password(self, anon_client, mock_db):
        """管理员密码错误"""
        from app.utils.security import hash_password

        admin = Admin(id=1, username="admin", password_hash=hash_password("correct"))
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = admin
        mock_db.execute = AsyncMock(return_value=mock_result)

        resp = await anon_client.post("/admin/auth/login", json={
            "username": "admin", "password": "wrong"
        })
        assert resp.json()["code"] == 1001

    async def test_login_disabled(self, anon_client, mock_db):
        """被禁用的管理员不能登录"""
        # 查询条件包含 status=="active"，禁用的查不出来
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = None
        mock_db.execute = AsyncMock(return_value=mock_result)

        resp = await anon_client.post("/admin/auth/login", json={
            "username": "disabled_admin", "password": "any"
        })
        assert resp.json()["code"] == 1001


class TestAdminProfile:
    async def test_get_profile(self, admin_client, mock_db):
        """获取管理员信息"""
        resp = await admin_client.get("/admin/auth/profile")
        data = resp.json()
        assert data["code"] == 0
        assert data["data"]["username"] == "admin"

    async def test_profile_unauthorized(self, anon_client):
        """未登录访问 —— FastAPI 对缺失 Header(...) 返回 422"""
        resp = await anon_client.get("/admin/auth/profile")
        assert resp.status_code == 422


class TestChangePassword:
    async def test_change_password_success(self, admin_client, mock_db):
        """修改密码成功"""
        resp = await admin_client.put("/admin/auth/password", json={
            "oldPassword": "admin123", "newPassword": "newpass"
        })
        assert resp.status_code == 200
        assert resp.json()["code"] == 0
