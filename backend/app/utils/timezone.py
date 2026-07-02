"""时间工具 —— 统一使用北京时间 (UTC+8)"""
from datetime import datetime, timezone, timedelta

BEIJING_TZ = timezone(timedelta(hours=8))


def tz_now() -> datetime:
    """返回北京时间当前时间 (timezone-aware)"""
    return datetime.now(BEIJING_TZ)
