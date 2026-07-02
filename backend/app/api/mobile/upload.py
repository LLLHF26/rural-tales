"""移动端 —— 文件上传"""

from fastapi import APIRouter, Depends, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user
from app.models.resource import Resource
from app.services.oss import upload_bytes
from app.utils.response import ok, fail

router = APIRouter(tags=["移动端-文件"])


@router.post("/upload")
async def upload(
    file: UploadFile = File(...),
    category: str = Form("avatar"),
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user),
):
    if not file.content_type or not file.content_type.startswith("image/"):
        return fail(1001, "仅支持图片文件")

    data = await file.read()
    try:
        info = await upload_bytes(data, file.filename, category)
    except Exception as e:
        return fail(2000, f"上传失败: {str(e)}")

    resource = Resource(
        resource_type="image",
        filename=info["filename"],
        object_key=info["objectKey"],
        url=info["url"],
        category=info["category"],
        size=info["size"],
        mime_type=file.content_type,
    )
    db.add(resource)
    await db.flush()

    return ok({"url": info["url"]})
