"""管理端 —— 管理员账号管理（仅 super_admin）"""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel

from app.database import get_db
from app.dependencies import get_current_admin
from app.models.user import Admin
from app.utils.security import hash_password
from app.utils.response import ok, fail

router = APIRouter(prefix="/admins", tags=["管理端-管理员"])


class CreateAdminReq(BaseModel):
    username: str
    password: str
    nickname: str
    role: str = "admin"


class UpdateAdminReq(BaseModel):
    username: str | None = None
    password: str | None = None
    nickname: str | None = None
    role: str | None = None
    status: str | None = None


def _admin_to_dict(a: Admin) -> dict:
    return {
        "adminId": str(a.id),
        "username": a.username,
        "nickname": a.nickname,
        "role": a.role,
        "status": a.status,
        "lastLoginAt": a.last_login_at.isoformat() if a.last_login_at else None,
        "createdAt": a.created_at.isoformat() if a.created_at else None,
    }


@router.get("")
async def list_admins(db: AsyncSession = Depends(get_db), admin: Admin = Depends(get_current_admin)):
    if admin.role != "super_admin":
        return fail(1003, "仅超级管理员可查看管理员列表")
    result = await db.execute(select(Admin).order_by(Admin.created_at.desc()))
    admins = result.scalars().all()
    return ok({"list": [_admin_to_dict(a) for a in admins]})


@router.post("")
async def create_admin(req: CreateAdminReq, db: AsyncSession = Depends(get_db), admin: Admin = Depends(get_current_admin)):
    if admin.role != "super_admin":
        return fail(1003, "仅超级管理员可创建管理员")
    existing = await db.execute(select(Admin).where(Admin.username == req.username))
    if existing.scalar_one_or_none():
        return fail(2002, "管理员账号已存在")
    new_admin = Admin(
        username=req.username,
        password_hash=hash_password(req.password),
        nickname=req.nickname,
        role=req.role,
        status="active",
    )
    db.add(new_admin)
    await db.commit()
    await db.refresh(new_admin)
    return ok({"adminId": str(new_admin.id)})


@router.put("/{admin_id}")
async def update_admin(admin_id: int, req: UpdateAdminReq, db: AsyncSession = Depends(get_db), admin: Admin = Depends(get_current_admin)):
    if admin.role != "super_admin":
        return fail(1003, "仅超级管理员可编辑管理员")
    result = await db.execute(select(Admin).where(Admin.id == admin_id))
    target = result.scalar_one_or_none()
    if not target:
        return fail(2001, "管理员不存在")
    if req.username is not None:
        target.username = req.username
    if req.password is not None:
        target.password_hash = hash_password(req.password)
    if req.nickname is not None:
        target.nickname = req.nickname
    if req.role is not None:
        target.role = req.role
    if req.status is not None:
        target.status = req.status
    await db.commit()
    return ok(None)


@router.delete("/{admin_id}")
async def delete_admin(admin_id: int, db: AsyncSession = Depends(get_db), admin: Admin = Depends(get_current_admin)):
    if admin.role != "super_admin":
        return fail(1003, "仅超级管理员可删除管理员")
    if int(admin_id) == admin.id:
        return fail(2002, "不能删除自己")
    result = await db.execute(select(Admin).where(Admin.id == admin_id))
    target = result.scalar_one_or_none()
    if not target:
        return fail(2001, "管理员不存在")
    await db.delete(target)
    await db.commit()
    return ok(None)
