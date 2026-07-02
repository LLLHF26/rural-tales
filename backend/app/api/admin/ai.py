"""管理端 —— AI 剧本生成 & 图片生成"""

from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel

from app.database import get_db
from app.dependencies import get_current_admin
from app.services.ai_script import stream_script_generation
from app.services.ai_image import generate_scene_image, generate_npc_portrait, save_ai_image_to_library
from app.utils.response import ok, fail

router = APIRouter(prefix="/ai", tags=["管理端-AI生成"])


class GenerateScriptReq(BaseModel):
    villageId: int
    type: str
    difficulty: int
    estimatedDuration: int
    extraRequirement: str = ""


class GenerateSceneReq(BaseModel):
    scriptId: str
    description: str
    style: str = "realistic"
    aspectRatio: str = "16:9"


class GenerateNpcReq(BaseModel):
    scriptId: str
    npcId: str | None = None
    name: str
    gender: str
    age: int
    appearance: str
    personality: str = ""
    style: str = "game_art"


@router.post("/generate-script")
async def generate_script(req: GenerateScriptReq, db: AsyncSession = Depends(get_db), admin=Depends(get_current_admin)):
    return StreamingResponse(
        stream_script_generation(db, req.villageId, req.type, req.difficulty, req.estimatedDuration, req.extraRequirement),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "Connection": "keep-alive", "X-Accel-Buffering": "no"}
    )


class GenerateImageReq(BaseModel):
    prompt: str
    size: str = "1024x1024"
    style: str = "realistic"


@router.post("/generate-image")
async def generate_image(req: GenerateImageReq, db: AsyncSession = Depends(get_db), admin=Depends(get_current_admin)):
    result = await generate_scene_image(req.prompt, req.style)
    if not result.get("success"):
        return fail(3003, result.get("message", "图片生成失败"))
    try:
        oss_url = await save_ai_image_to_library(db, result["imageUrl"], req.prompt)
        return ok({"url": oss_url})
    except Exception:
        return ok({"url": result["imageUrl"]})


@router.post("/generate-scene-image")
async def generate_scene(req: GenerateSceneReq, db: AsyncSession = Depends(get_db), admin=Depends(get_current_admin)):
    result = await generate_scene_image(req.description, req.style, req.aspectRatio)
    if not result.get("success"):
        return fail(3003, result.get("message", "图片生成失败"))
    try:
        oss_url = await save_ai_image_to_library(db, result["imageUrl"], req.description, "scene")
        return ok({"taskId": "gen_scene_001", "status": "completed", "images": [{"url": oss_url}]})
    except Exception:
        return ok({"taskId": "gen_scene_001", "status": "completed", "images": [{"url": result["imageUrl"]}]})


@router.post("/generate-npc-portrait")
async def generate_npc(req: GenerateNpcReq, db: AsyncSession = Depends(get_db), admin=Depends(get_current_admin)):
    result = await generate_npc_portrait(req.name, req.gender, req.age, req.appearance, req.personality, req.style)
    if not result.get("success"):
        return fail(3003, result.get("message", "图片生成失败"))
    try:
        oss_url = await save_ai_image_to_library(db, result["imageUrl"], req.name, "npc")
        return ok({"taskId": "gen_npc_001", "status": "completed", "images": [{"url": oss_url}]})
    except Exception:
        return ok({"taskId": "gen_npc_001", "status": "completed", "images": [{"url": result["imageUrl"]}]})
