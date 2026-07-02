"""FastAPI 依赖注入 —— 认证 & 权限"""

from fastapi import Depends, Header, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.utils.security import decode_token
from app.models.user import User, Admin


async def get_current_user(
    authorization: str = Header(...),
    db: AsyncSession = Depends(get_db),
) -> User:
    token = authorization.removeprefix("Bearer ").strip()
    payload = decode_token(token)
    if payload is None:
        raise HTTPException(status_code=401, detail={"code": 1002, "message": "未登录或Token已过期"})
    user_id = payload.get("user_id")
    if user_id is None:
        raise HTTPException(status_code=401, detail={"code": 1002, "message": "Token无效"})
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if user is None:
        raise HTTPException(status_code=401, detail={"code": 1002, "message": "用户不存在"})
    return user


async def get_optional_user(
    authorization: str | None = Header(None),
    db: AsyncSession = Depends(get_db),
) -> User | None:
    """可选认证 —— 未携带 Token 时返回 None 而非 422"""
    if not authorization:
        return None
    token = authorization.removeprefix("Bearer ").strip()
    payload = decode_token(token)
    if payload is None:
        return None
    user_id = payload.get("user_id")
    if user_id is None:
        return None
    result = await db.execute(select(User).where(User.id == user_id))
    return result.scalar_one_or_none()


async def get_current_admin(
    authorization: str = Header(...),
    db: AsyncSession = Depends(get_db),
) -> Admin:
    token = authorization.removeprefix("Bearer ").strip()
    payload = decode_token(token)
    if payload is None:
        raise HTTPException(status_code=401, detail={"code": 1002, "message": "未登录或Token已过期"})
    admin_id = payload.get("admin_id")
    if admin_id is None:
        raise HTTPException(status_code=403, detail={"code": 1003, "message": "无管理员权限"})
    result = await db.execute(select(Admin).where(Admin.id == admin_id, Admin.status == "active"))
    admin = result.scalar_one_or_none()
    if admin is None:
        raise HTTPException(status_code=403, detail={"code": 1003, "message": "管理员不存在或已禁用"})
    return admin
