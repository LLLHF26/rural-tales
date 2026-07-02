"""AI 图片生成服务 —— 智谱 CogView-4"""

import json
import uuid
import httpx
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from app.config import settings
from app.services.oss import upload_bytes
from app.models.resource import Resource


async def save_ai_image_to_library(
    db: AsyncSession,
    image_url: str,
    prompt: str,
    category: str = "ai_generated",
) -> str:
    """下载AI生成的图片，上传到OSS并保存到素材库，返回OSS URL"""
    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.get(image_url)
        resp.raise_for_status()
        image_data = resp.content

    safe_prompt = prompt[:30].replace("/", "_").replace("\\", "_").replace(" ", "_")
    filename = f"ai_{safe_prompt}_{uuid.uuid4().hex[:8]}.png"
    content_type = resp.headers.get("content-type", "image/png")

    info = await upload_bytes(image_data, filename, category)

    resource = Resource(
        filename=info["filename"],
        object_key=info["objectKey"],
        url=info["url"],
        category=info["category"],
        size=info["size"],
        mime_type=content_type,
    )
    db.add(resource)
    await db.flush()

    return info["url"]


async def generate_scene_image(description: str, style: str = "realistic", aspect_ratio: str = "16:9") -> dict:
    size_map = {"16:9": "1536x864", "4:3": "1152x864", "1:1": "1024x1024"}
    size = size_map.get(aspect_ratio, "1536x864")

    if style == "realistic":
        style_hint = "写实摄影风格，真实场景，电影质感，自然光线，高清晰度，细节丰富"
        extra_negative = "cartoon, anime, illustration, painting, 3d render"
    else:
        style_hint = f"{style}风格"
        extra_negative = "blurry, low quality, text, signature"

    prompt = f"{description}，{style_hint}"
    negative = f"{settings.IMAGE_NEGATIVE_PROMPT}, {extra_negative}"

    if settings.IMAGE_LLM_PROVIDER == "zhipu":
        return await _generate_zhipu(prompt, negative, size)
    else:
        raise ValueError(f"不支持的图片生成服务商: {settings.IMAGE_LLM_PROVIDER}")


async def generate_npc_portrait(
    name: str, gender: str, age: int, appearance: str, personality: str = "", style: str = "realistic"
) -> dict:
    gender_cn = "男性" if gender == "male" else "女性"
    if style == "realistic":
        style_hint = "写实摄影风格，真人肖像，电影级光影，高清细节，人物特写"
        extra_negative = "cartoon, anime, cgi, 3d, illustration, painting, deformed"
    else:
        style_hint = f"{style}风格"
        extra_negative = "blurry, low quality, text, signature, realistic photo, deformed"

    prompt = (
        f"{gender_cn}角色，姓名{name}，年龄约{age}岁，{appearance}，{personality}，"
        f"{style_hint}，古风服饰，半身像，纯色深色背景"
    )
    negative = f"{settings.IMAGE_NEGATIVE_PROMPT}, {extra_negative}"

    if settings.IMAGE_LLM_PROVIDER == "zhipu":
        return await _generate_zhipu(prompt, negative, "864x1152")
    else:
        raise ValueError(f"不支持的图片生成服务商: {settings.IMAGE_LLM_PROVIDER}")


async def _generate_zhipu(prompt: str, negative_prompt: str, size: str) -> dict:
    """调用智谱 CogView-4 API"""
    async with httpx.AsyncClient(timeout=60) as client:
        resp = await client.post(
            f"{settings.IMAGE_LLM_BASE_URL}/images/generations",
            headers={
                "Authorization": f"Bearer {settings.IMAGE_LLM_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "model": settings.IMAGE_LLM_MODEL,
                "prompt": prompt,
                "negative_prompt": negative_prompt,
                "size": size,
                "n": 1,
            },
        )
        data = resp.json()
        if resp.status_code == 200 and "data" in data:
            image_url = data["data"][0].get("url", "")
            return {"success": True, "imageUrl": image_url, "promptUsed": prompt}
        else:
            return {"success": False, "message": data.get("error", {}).get("message", "图片生成失败")}
