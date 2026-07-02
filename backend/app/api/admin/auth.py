"""管理端 —— 认证"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from app.database import get_db
from app.utils.timezone import tz_now
from app.models.user import Admin
from app.dependencies import get_current_admin
from app.utils.security import hash_password, verify_password, create_token
from app.utils.response import ok, fail

router = APIRouter(prefix="/auth", tags=["管理端-认证"])


class LoginReq(BaseModel):
    username: str
    password: str


class PasswordReq(BaseModel):
    oldPassword: str
    newPassword: str


@router.post("/login")
async def login(req: LoginReq, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Admin).where(Admin.username == req.username, Admin.status == "active")
    )
    admin = result.scalar_one_or_none()
    if not admin or not verify_password(req.password, admin.password_hash):
        return fail(1001, "账号或密码错误")

    admin.last_login_at = tz_now()
    token = create_token({"admin_id": admin.id, "role": admin.role})

    return ok({
        "token": token,
        "expireAt": None,
        "admin": {
            "adminId": str(admin.id),
            "username": admin.username,
            "nickname": admin.nickname,
            "avatar": admin.avatar,
            "role": admin.role,
        }
    })


@router.get("/profile")
async def profile(admin: Admin = Depends(get_current_admin)):
    return ok({
        "adminId": str(admin.id),
        "username": admin.username,
        "nickname": admin.nickname,
        "avatar": admin.avatar,
        "role": admin.role,
        "lastLoginAt": admin.last_login_at.isoformat() if admin.last_login_at else None,
    })


@router.put("/password")
async def change_password(req: PasswordReq, admin: Admin = Depends(get_current_admin), db: AsyncSession = Depends(get_db)):
    if not verify_password(req.oldPassword, admin.password_hash):
        return fail(1001, "旧密码错误")
    admin.password_hash = hash_password(req.newPassword)
    return ok()
