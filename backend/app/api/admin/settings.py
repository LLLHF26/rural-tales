"""管理端 —— 系统设置（AI配置 + 上传）"""

from fastapi import APIRouter, Depends, UploadFile, File, Form, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from pydantic import BaseModel

from app.database import get_db
from app.dependencies import get_current_admin
from app.models.user import Admin
from app.models.resource import Resource
from app.services.oss import upload_bytes
from app.config import settings
from app.utils.response import ok, fail

router = APIRouter(tags=["管理端-系统设置"])


class AIConfigUpdate(BaseModel):
    llmProvider: str | None = None
    llmModel: str | None = None
    llmApiKey: str | None = None
    llmTemperature: float | None = None
    llmMaxTokens: int | None = None
    imageProvider: str | None = None
    imageModel: str | None = None
    imageApiKey: str | None = None
    imageDefaultStyle: str | None = None
    imageDefaultSize: str | None = None
    imageNegativePrompt: str | None = None


@router.get("/settings/ai")
async def get_ai_config(admin: Admin = Depends(get_current_admin)):
    return ok({
        "llmProvider": settings.SCRIPT_LLM_PROVIDER,
        "llmModel": settings.SCRIPT_LLM_MODEL,
        "llmApiKey": _mask(settings.SCRIPT_LLM_API_KEY),
        "llmTemperature": settings.SCRIPT_LLM_TEMPERATURE,
        "llmMaxTokens": settings.SCRIPT_LLM_MAX_TOKENS,
        "imageProvider": settings.IMAGE_LLM_PROVIDER,
        "imageModel": settings.IMAGE_LLM_MODEL,
        "imageApiKey": _mask(settings.IMAGE_LLM_API_KEY),
        "imageDefaultStyle": settings.IMAGE_DEFAULT_STYLE,
        "imageDefaultSize": settings.IMAGE_DEFAULT_SIZE,
        "imageNegativePrompt": settings.IMAGE_NEGATIVE_PROMPT,
    })


@router.put("/settings/ai")
async def update_ai_config(req: AIConfigUpdate, admin: Admin = Depends(get_current_admin)):
    # 运行时更新 settings 对象（不持久化到 .env 文件）
    if req.llmProvider is not None:
        settings.SCRIPT_LLM_PROVIDER = req.llmProvider
    if req.llmModel is not None:
        settings.SCRIPT_LLM_MODEL = req.llmModel
    if req.llmApiKey is not None and req.llmApiKey != "***":
        settings.SCRIPT_LLM_API_KEY = req.llmApiKey
    if req.llmTemperature is not None:
        settings.SCRIPT_LLM_TEMPERATURE = req.llmTemperature
    if req.llmMaxTokens is not None:
        settings.SCRIPT_LLM_MAX_TOKENS = req.llmMaxTokens
    if req.imageProvider is not None:
        settings.IMAGE_LLM_PROVIDER = req.imageProvider
    if req.imageModel is not None:
        settings.IMAGE_LLM_MODEL = req.imageModel
    if req.imageApiKey is not None and req.imageApiKey != "***":
        settings.IMAGE_LLM_API_KEY = req.imageApiKey
    if req.imageDefaultStyle is not None:
        settings.IMAGE_DEFAULT_STYLE = req.imageDefaultStyle
    if req.imageDefaultSize is not None:
        settings.IMAGE_DEFAULT_SIZE = req.imageDefaultSize
    if req.imageNegativePrompt is not None:
        settings.IMAGE_NEGATIVE_PROMPT = req.imageNegativePrompt
    return ok(None, "AI配置已更新（运行时生效，重启后恢复为.env配置值）")


@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    category: str = Form("other"),
    resource_type: str = Form("image"),
    db: AsyncSession = Depends(get_db),
    admin: Admin = Depends(get_current_admin),
):
    if resource_type == "image":
        if not file.content_type or not file.content_type.startswith("image/"):
            # Allow .mind compiled target files
            if not file.filename or not file.filename.lower().endswith('.mind'):
                return fail(1001, "仅支持图片文件")
    elif resource_type == "audio":
        if not file.content_type or not file.content_type.startswith("audio/"):
            return fail(1001, "仅支持音频文件")
    else:
        return fail(1001, "不支持的文件类型")

    data = await file.read()
    try:
        info = await upload_bytes(data, file.filename, category)
    except Exception as e:
        return fail(2000, f"OSS上传失败: {str(e)}")

    resource = Resource(
        resource_type=resource_type,
        filename=info["filename"],
        object_key=info["objectKey"],
        url=info["url"],
        category=info["category"],
        size=info["size"],
        mime_type=file.content_type,
    )
    db.add(resource)
    await db.flush()

    return ok({
        "resourceId": str(resource.id),
        "url": info["url"],
        "objectKey": info["objectKey"],
        "fileName": info["filename"],
        "category": info["category"],
        "fileSize": info["size"],
        "resourceType": resource_type,
    }, "上传成功")


@router.get("/resources/images")
async def list_images(
    page: int = Query(1, ge=1),
    pageSize: int = Query(12, ge=1, le=1000),
    category: str | None = Query(None),
    db: AsyncSession = Depends(get_db),
    admin: Admin = Depends(get_current_admin),
):
    base = select(Resource)
    count_base = select(func.count(Resource.id))

    # 只查询图片类型（兼容旧数据：resource_type 为空或为 image）
    base = base.where(
        func.coalesce(Resource.resource_type, "image") == "image"
    )
    count_base = count_base.where(
        func.coalesce(Resource.resource_type, "image") == "image"
    )

    if category:
        base = base.where(Resource.category == category)
        count_base = count_base.where(Resource.category == category)

    total_result = await db.execute(count_base)
    total = total_result.scalar() or 0

    base = base.order_by(Resource.created_at.desc()).offset((page - 1) * pageSize).limit(pageSize)
    result = await db.execute(base)
    resources = result.scalars().all()

    items = [{
        "imageId": str(r.id),
        "url": r.url,
        "fileName": r.filename,
        "category": r.category,
        "fileSize": r.size,
        "mimeType": r.mime_type,
        "uploadedAt": r.created_at.isoformat() if r.created_at else None,
    } for r in resources]

    return ok({"total": total, "page": page, "pageSize": pageSize, "list": items})


@router.get("/resources/audio")
async def list_audio(
    page: int = Query(1, ge=1),
    pageSize: int = Query(12, ge=1, le=1000),
    category: str | None = Query(None),
    db: AsyncSession = Depends(get_db),
    admin: Admin = Depends(get_current_admin),
):
    base = select(Resource).where(Resource.resource_type == "audio")
    count_base = select(func.count(Resource.id)).where(Resource.resource_type == "audio")

    if category:
        base = base.where(Resource.category == category)
        count_base = count_base.where(Resource.category == category)

    total_result = await db.execute(count_base)
    total = total_result.scalar() or 0

    base = base.order_by(Resource.created_at.desc()).offset((page - 1) * pageSize).limit(pageSize)
    result = await db.execute(base)
    resources = result.scalars().all()

    items = [{
        "audioId": str(r.id),
        "url": r.url,
        "fileName": r.filename,
        "category": r.category,
        "fileSize": r.size,
        "mimeType": r.mime_type,
        "uploadedAt": r.created_at.isoformat() if r.created_at else None,
    } for r in resources]

    return ok({"total": total, "page": page, "pageSize": pageSize, "list": items})


def _mask(key: str) -> str:
    if not key:
        return ""
    return key[:8] + "****" + key[-4:] if len(key) > 12 else "****"
