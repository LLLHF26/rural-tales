"""移动端 —— AR 互动"""

import io
import logging
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
import httpx
from app.database import get_db
from app.utils.timezone import tz_now
from app.models.script import Task, ArResource, ScriptNode
from app.models.progress import ScriptProgress, ArPhoto
from app.dependencies import get_current_user
from app.utils.response import ok, fail

logger = logging.getLogger(__name__)


async def _image_similarity(url_a: str, url_b: str) -> float:
    """下载两张图片并计算多维度相似度（0~1，越高越相似）"""
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            resp_a = await client.get(url_a)
            resp_b = await client.get(url_b)
            if resp_a.status_code != 200 or resp_b.status_code != 200:
                logger.warning(f"AR图片下载失败: a={resp_a.status_code} b={resp_b.status_code}")
                return 0.0
            img_a_data = resp_a.content
            img_b_data = resp_b.content
    except Exception as e:
        logger.warning(f"AR图片下载异常: {e}")
        return 0.0

    try:
        from PIL import Image
    except ImportError:
        logger.warning("Pillow 未安装，跳过 AR 标记验证")
        return 1.0

    try:
        a_orig = Image.open(io.BytesIO(img_a_data))
        b_orig = Image.open(io.BytesIO(img_b_data))
        a = a_orig.convert("L")
        b = b_orig.convert("L")
    except Exception as e:
        logger.warning(f"AR图片打开失败: {e}")
        return 0.0

    # 诊断：检查图片是否有效（非纯色/黑帧）
    a_arr = list(a.getdata())
    b_arr = list(b.getdata())
    a_mean = sum(a_arr) / len(a_arr)
    b_mean = sum(b_arr) / len(b_arr)
    logger.info(f"AR图片诊断: 帧尺寸={a_orig.size} 均灰度={a_mean:.1f} | 标记尺寸={b_orig.size} 均灰度={b_mean:.1f}")

    # 感知哈希 —— 32x32 = 1024-bit，更多细节
    def _phash(img: Image.Image, size: int = 32) -> int:
        small = img.resize((size, size), Image.LANCZOS)
        pixels = list(small.getdata())
        avg = sum(pixels) / len(pixels)
        return sum((1 << i) for i, p in enumerate(pixels) if p > avg)

    ha = _phash(a)
    hb = _phash(b)
    diff = (ha ^ hb).bit_count()
    # 1024-bit hash，允许 40% 差异
    phash_sim = max(0.0, 1.0 - diff / 410.0)

    # 直方图相似度（捕获整体明暗分布）
    a_small = a.resize((32, 32), Image.LANCZOS)
    b_small = b.resize((32, 32), Image.LANCZOS)
    hist_a = a_small.histogram()
    hist_b = b_small.histogram()
    sum_a = sum(hist_a)
    sum_b = sum(hist_b)
    if sum_a > 0 and sum_b > 0:
        hist_sim = sum(min(ha_i / sum_a, hb_i / sum_b) for ha_i, hb_i in zip(hist_a, hist_b))
    else:
        hist_sim = 0.0

    combined = 0.5 * phash_sim + 0.5 * hist_sim
    logger.info(f"AR相似度: phash_diff={diff}/1024 phash_sim={phash_sim:.3f} hist_sim={hist_sim:.3f} combined={combined:.3f}")
    return combined

router = APIRouter(prefix="/ar", tags=["移动端-AR"])


@router.get("/resource/{task_id}")
async def get_ar_resource(task_id: int, db: AsyncSession = Depends(get_db), user=Depends(get_current_user)):
    task = (await db.execute(select(Task).where(Task.id == task_id))).scalar_one_or_none()
    if not task or task.type != "ar_scan":
        return fail(2001, "AR资源不存在")

    ar_res = None
    if task.ar_resource_id:
        ar_res = (await db.execute(select(ArResource).where(ArResource.id == task.ar_resource_id))).scalar_one_or_none()

    # 读取 .patt 文件内容
    patt_content = None
    if ar_res and ar_res.marker_url:
        from pathlib import Path
        patt_path = Path("static") / ar_res.marker_url.replace("/static/", "").replace(".png", ".patt")
        if patt_path.exists():
            patt_content = patt_path.read_text()

    return ok({
        "taskId": str(task.id), "title": task.title, "hint": task.description,
        "markerUrl": ar_res.marker_url if ar_res else None,
        "markerPreview": (ar_res.marker_preview or ar_res.marker_url) if ar_res else None,
        "arucoId": ar_res.aruco_id if ar_res else None,
        "modelUrl": ar_res.model_url if ar_res else None,
        "overlayContent": ar_res.overlay_content if ar_res else {},
        "arType": ar_res.type if ar_res else None,
        "pattContent": patt_content,
    })


class ArDetectReq(BaseModel):
    taskId: int
    photoUrl: str


@router.post("/detect")
async def ar_detect(req: ArDetectReq, db: AsyncSession = Depends(get_db), user=Depends(get_current_user)):
    """实时 AR 帧检测 —— 比对用户上传的帧与标记图"""
    task = (await db.execute(select(Task).where(Task.id == req.taskId))).scalar_one_or_none()
    if not task or task.type != "ar_scan":
        return fail(2001, "任务不存在")
    if not task.ar_resource_id:
        return ok({"matched": False})

    ar_res = (await db.execute(select(ArResource).where(ArResource.id == task.ar_resource_id))).scalar_one_or_none()
    if not ar_res or not ar_res.marker_url:
        return ok({"matched": False})

    sim = await _image_similarity(req.photoUrl, ar_res.marker_url)
    return ok({"matched": sim >= 0.3, "similarity": round(sim, 2)})


class ArCollectReq(BaseModel):
    taskId: int
    itemId: str
    nodeId: int | None = None
    photoUrl: str | None = None


@router.post("/{progress_id}/ar-collect")
async def ar_collect(progress_id: int, req: ArCollectReq, db: AsyncSession = Depends(get_db), user=Depends(get_current_user)):
    progress = (await db.execute(select(ScriptProgress).where(ScriptProgress.id == progress_id, ScriptProgress.user_id == user.id))).scalar_one_or_none()
    if not progress: return fail(2001, "进度不存在")

    task = (await db.execute(select(Task).where(Task.id == req.taskId))).scalar_one_or_none()
    if not task: return fail(2001, "任务不存在")

    # 验证扫描照片与标记图的相似度
    if req.photoUrl and task.ar_resource_id:
        ar_res = (await db.execute(select(ArResource).where(ArResource.id == task.ar_resource_id))).scalar_one_or_none()
        if ar_res and ar_res.marker_url:
            sim = await _image_similarity(req.photoUrl, ar_res.marker_url)
            if sim < 0.3:
                return fail(2002, "未能识别标记图，请对准标记图案重新拍摄")

    # 先查询节点（在修改 progress 之前，避免 autoflush 导致行锁冲突）
    node = None
    if req.nodeId:
        node = (await db.execute(select(ScriptNode).where(ScriptNode.id == req.nodeId))).scalar_one_or_none()

    completed = list(progress.completed_task_ids or [])
    if str(req.taskId) not in completed:
        completed.append(str(req.taskId))
    progress.completed_task_ids = completed

    item = task.reward_item or {"itemId": req.itemId, "name": "未知道具", "icon": "", "type": "key"}
    items = list(progress.items or [])
    item_entry = {**item, "acquiredAt": tz_now().isoformat()}
    items.append(item_entry)
    progress.items = items

    # 扫描照片 URL 已随 item 记录在 items 中，无需单独存 ar_photos

    # 检查当前节点是否所有任务都已完成，若是则推进到下一节点
    next_node_id = None
    if node:
        all_done = all(
            str(t.id) in progress.completed_task_ids
            for t in (node.tasks or [])
        )
        logger.info(f"ar_collect: node_id={req.nodeId}, all_tasks={[t.id for t in (node.tasks or [])]}, completed={progress.completed_task_ids}, all_done={all_done}")
        if all_done:
            # 分支节点：不自动找 nextNodeId，等用户选分支后再确定目标节点
            has_branch = node.config.get("hasBranch", False) if node.config else False
            if not has_branch:
                next_nodes = node.config.get("nextNodes", []) if node.config else []
                # 兜底：如果没配置 nextNodes，按 sort_order 找下一节点（同章节→下一章）
                if not next_nodes and node.chapter_id:
                    next_in_chapter = (await db.execute(
                        select(ScriptNode).where(
                            ScriptNode.chapter_id == node.chapter_id,
                            ScriptNode.sort_order > node.sort_order
                        ).order_by(ScriptNode.sort_order).limit(1)
                    )).scalar_one_or_none()
                    if not next_in_chapter:
                        from app.models.script import ScriptChapter
                        cur_chapter = (await db.execute(
                            select(ScriptChapter).where(ScriptChapter.id == node.chapter_id)
                        )).scalar_one_or_none()
                        if cur_chapter:
                            next_chapter = (await db.execute(
                                select(ScriptChapter).where(
                                    ScriptChapter.script_id == node.script_id,
                                    ScriptChapter.sort_order > cur_chapter.sort_order
                                ).order_by(ScriptChapter.sort_order).limit(1)
                            )).scalar_one_or_none()
                            if next_chapter:
                                next_in_chapter = (await db.execute(
                                    select(ScriptNode).where(
                                        ScriptNode.chapter_id == next_chapter.id
                                    ).order_by(ScriptNode.sort_order).limit(1)
                                )).scalar_one_or_none()
                    if next_in_chapter:
                        next_nodes = [next_in_chapter.id]
                        logger.info(f"ar_collect: 未配置nextNodes，按顺序推进到 node_id={next_in_chapter.id}")
                logger.info(f"ar_collect: next_nodes={next_nodes}")
                if next_nodes:
                    next_node_id = int(next_nodes[0])
            else:
                logger.info(f"ar_collect: 节点有分支，不自动推进，等待用户选择")
            # 标记当前节点完成
            completed_nodes = list(progress.completed_node_ids or [])
            if str(req.nodeId) not in completed_nodes:
                completed_nodes.append(str(req.nodeId))
            progress.completed_node_ids = completed_nodes

    return ok({"success": True, "item": item, "nextNodeId": str(next_node_id) if next_node_id else None})


class ArPhotoReq(BaseModel):
    npcId: int
    photoUrl: str


@router.post("/{progress_id}/ar-photo")
async def ar_photo(progress_id: int, req: ArPhotoReq, db: AsyncSession = Depends(get_db), user=Depends(get_current_user)):
    progress = (await db.execute(select(ScriptProgress).where(ScriptProgress.id == progress_id, ScriptProgress.user_id == user.id))).scalar_one_or_none()
    if not progress: return fail(2001, "进度不存在")

    photo = ArPhoto(user_id=user.id, progress_id=progress_id, script_id=progress.script_id,
                    npc_id=req.npcId, photo_url=req.photoUrl)
    db.add(photo)
    await db.flush()
    return ok({"photoId": str(photo.id), "photoUrl": req.photoUrl, "savedAt": photo.created_at.isoformat() if photo.created_at else None})
