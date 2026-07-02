"""JWT & 密码工具"""

from datetime import datetime, timedelta

import bcrypt
from jose import jwt, JWTError

from app.config import settings
from app.utils.timezone import tz_now


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode(), hashed.encode())


def create_token(payload: dict, expires_hours: int | None = None) -> str:
    data = payload.copy()
    hours = expires_hours or settings.JWT_EXPIRE_HOURS
    data["exp"] = tz_now() + timedelta(hours=hours)
    data["iat"] = tz_now()
    return jwt.encode(data, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def decode_token(token: str) -> dict | None:
    try:
        return jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
    except JWTError:
        return None
