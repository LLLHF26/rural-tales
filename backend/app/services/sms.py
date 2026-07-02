"""短信验证码服务"""

import random
import time
from redis.asyncio import Redis
from app.config import settings

# 开发模式下的内存存储 { phone: (code, expire_at) }
_memory_store: dict[str, tuple[str, float]] = {}


async def send_verify_code(redis: Redis | None, phone: str) -> dict:
    """发送验证码，开发环境直接返回"""
    code = "123456"

    if redis is not None:
        key = f"sms_code:{phone}"
        await redis.setex(key, 300, code)
    else:
        _memory_store[phone] = (code, time.time() + 300)

    if settings.SMS_DEBUG_MODE:
        return {"success": True, "expireSeconds": 300, "debugCode": code}

    return {"success": True, "expireSeconds": 300}


async def verify_code(redis: Redis | None, phone: str, code: str) -> bool:
    """校验验证码"""
    if redis is not None:
        key = f"sms_code:{phone}"
        stored = await redis.get(key)
        if stored is None:
            return False
        if stored != code:
            return False
        await redis.delete(key)
        return True

    entry = _memory_store.get(phone)
    if entry is None:
        return False
    stored_code, expire_at = entry
    if time.time() > expire_at:
        del _memory_store[phone]
        return False
    if stored_code != code:
        return False
    del _memory_store[phone]
    return True
