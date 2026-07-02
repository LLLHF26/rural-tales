"""阿里云 OSS 对象存储服务"""

import uuid
import asyncio
from pathlib import Path

import oss2
from app.config import settings
from app.utils.timezone import tz_now


def _build_client():
    return oss2.Auth(settings.OSS_ACCESS_KEY_ID, settings.OSS_ACCESS_KEY_SECRET)


def _build_bucket():
    auth = _build_client()
    return oss2.Bucket(auth, settings.OSS_ENDPOINT, settings.OSS_BUCKET_NAME)


async def upload_bytes(data: bytes, filename: str, category: str = "other") -> dict:
    """上传字节内容到 OSS，返回文件信息"""
    bucket = _build_bucket()
    ext = Path(filename).suffix or ".png"
    date_str = tz_now().strftime("%Y/%m/%d")
    object_key = f"resources/{category}/{date_str}/{uuid.uuid4().hex}{ext}"

    await asyncio.to_thread(bucket.put_object, object_key, data)

    url = f"https://{settings.OSS_BUCKET_NAME}.{settings.OSS_ENDPOINT}/{object_key}"
    return {
        "objectKey": object_key,
        "url": url,
        "filename": filename,
        "category": category,
        "size": len(data),
    }


async def delete_object(object_key: str):
    """删除 OSS 文件"""
    bucket = _build_bucket()
    await asyncio.to_thread(bucket.delete_object, object_key)
