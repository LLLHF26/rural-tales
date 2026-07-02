"""移动端 —— 剧本体验（核心）"""

import math
import json
import logging
from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from pydantic import BaseModel
from app.utils.timezone import tz_now

from app.database import get_db
from app.models.script import Script, ScriptNode, ScriptNpc, ScriptChapter, ScriptEnding, Task
from app.models.progress import ScriptProgress, ChatLog
from app.dependencies import get_current_user
from app.services.ai_chat import stream_npc_chat, get_recent_chat_history
from app.utils.response import ok, fail

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/play", tags=["移动端-剧本体验"])


def _node_json(n: ScriptNode) -> dict:
    return {
        "nodeId": str(n.id), "chapterTitle": "", "nodeTitle": n.title,
        "type": n.type, "sceneImage": n.scene_image, "sceneAudio": n.scene_audio,
        "npc": None,
        "tasks": [{
            "taskId": str(t.id), "type": t.type, "title": t.title,
            "description": t.description,
            "targetGps": {"lat": t.target_lat, "lng": t.target_lng, "radius": t.target_radius} if t.target_lat else None
        } for t in (n.tasks or [])],
        "nextNodes": n.config.get("nextNodes", []) if n.config else [],
        "hasBranch": n.config.get("hasBranch", False) if n.config else False,
        "branchPrompt": n.config.get("branchPrompt", "") if n.config else "",
        "branchOptions": n.config.get("branchOptions", []) if n.config else [],
    }


@router.get("/{progress_id}/current-node")
async def get_current_node(progress_id: int, db: AsyncSession = Depends(get_db), user=Depends(get_current_user)):
    progress = (await db.execute(select(ScriptProgress).where(ScriptProgress.id == progress_id, ScriptProgress.user_id == user.id))).scalar_one_or_none()
    if not progress: return fail(2001, "进度不存在")
    if not progress.current_node_id: return fail(2001, "当前无进行中节点")

    node = (await db.execute(select(ScriptNode).where(ScriptNode.id == progress.current_node_id))).scalar_one_or_none()
    if not node: return fail(2001, "节点不存在")

    # 获取章节名
    chapter_title = ""
    chapter = (await db.execute(select(ScriptChapter).where(ScriptChapter.id == node.chapter_id))).scalar_one_or_none()
    if chapter: chapter_title = chapter.title

    data = _node_json(node)
    data["chapterTitle"] = chapter_title

    # 填充 NPC 信息
    if node.npc_id:
        npc = (await db.execute(select(ScriptNpc).where(ScriptNpc.id == node.npc_id))).scalar_one_or_none()
        if npc:
            data["npc"] = {
                "npcId": str(npc.id), "name": npc.name, "avatar": npc.avatar,
                "role": npc.role or "", "description": npc.description or "",
                "greeting": npc.greeting or node.dialogue_prompt or "你好，旅人。",
            }

    # 兜底：如果没配置 nextNodes，按 sort_order 找下一节点（同章节→下一章）
    if not data["nextNodes"] and node.chapter_id:
        has_branch = node.config.get("hasBranch", False) if node.config else False
        if not has_branch:
            next_node = (await db.execute(
                select(ScriptNode).where(
                    ScriptNode.chapter_id == node.chapter_id,
                    ScriptNode.sort_order > node.sort_order
                ).order_by(ScriptNode.sort_order).limit(1)
            )).scalar_one_or_none()
            if not next_node and chapter:
                # 本章没找到，找下一章的第一个节点
                next_chapter = (await db.execute(
                    select(ScriptChapter).where(
                        ScriptChapter.script_id == node.script_id,
                        ScriptChapter.sort_order > chapter.sort_order
                    ).order_by(ScriptChapter.sort_order).limit(1)
                )).scalar_one_or_none()
                if next_chapter:
                    next_node = (await db.execute(
                        select(ScriptNode).where(
                            ScriptNode.chapter_id == next_chapter.id
                        ).order_by(ScriptNode.sort_order).limit(1)
                    )).scalar_one_or_none()
            if next_node:
                data["nextNodes"] = [next_node.id]

    # 结局节点：查找对应的结局信息
    if node.type == "ending":
        ending_id = node.config.get("endingId") if node.config else None
        ending = None
        if ending_id:
            ending = (await db.execute(select(ScriptEnding).where(ScriptEnding.id == ending_id, ScriptEnding.script_id == progress.script_id))).scalar_one_or_none()
        if not ending:
            ending = (await db.execute(
                select(ScriptEnding).where(ScriptEnding.script_id == progress.script_id).limit(1)
            )).scalars().first()
        if ending:
            data["ending"] = {
                "endingId": str(ending.id), "title": ending.title,
                "description": ending.description, "endingImage": ending.ending_image,
            }

    return ok(data)


class ChatReq(BaseModel):
    npcId: int
    message: str
    nodeId: int


@router.post("/{progress_id}/chat")
async def chat(progress_id: int, req: ChatReq,
               db: AsyncSession = Depends(get_db), user=Depends(get_current_user)):
    return StreamingResponse(
        stream_npc_chat(db, progress_id, req.npcId, req.message, req.nodeId),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "Connection": "keep-alive", "X-Accel-Buffering": "no"}
    )


@router.post("/{progress_id}/opening")
async def opening(progress_id: int, db: AsyncSession = Depends(get_db), user=Depends(get_current_user)):
    """进入剧本时自动发送 AI 开场叙事"""
    progress = (await db.execute(select(ScriptProgress).where(ScriptProgress.id == progress_id, ScriptProgress.user_id == user.id))).scalar_one_or_none()
    if not progress: return fail(2001, "进度不存在")
    if not progress.current_node_id: return fail(2001, "当前无进行中节点")

    node = (await db.execute(select(ScriptNode).where(ScriptNode.id == progress.current_node_id))).scalar_one_or_none()
    if not node: return fail(2001, "节点不存在")

    npc = (await db.execute(select(ScriptNpc).where(ScriptNpc.id == node.npc_id))).scalar_one_or_none() if node.npc_id else None
    if not npc: return fail(2001, "当前节点无NPC")

    script = (await db.execute(select(Script).where(Script.id == progress.script_id))).scalar_one_or_none()

    # 开场提示词：引导 AI 根据场景展开叙事
    opening_message = f"[系统通知] 游客刚刚到达了「{node.title}」。请你作为{npc.name}，以自然的方式主动向游客打招呼，描述周围的环境和氛围，并引导游客开始探索。"
    if node.dialogue_prompt:
        opening_message += f"\n场景信息：{node.dialogue_prompt}"
    if script:
        opening_message += f"\n剧本背景：{script.storyline[:200] if script.storyline else '无'}"

    return StreamingResponse(
        stream_npc_chat(db, progress_id, npc.id, opening_message, node.id),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "Connection": "keep-alive", "X-Accel-Buffering": "no"}
    )


@router.get("/{progress_id}/chat-history/{npc_id}")
async def get_chat_history(progress_id: int, npc_id: int,
                           db: AsyncSession = Depends(get_db), user=Depends(get_current_user)):
    """加载与指定 NPC 的对话历史"""
    progress = (await db.execute(select(ScriptProgress).where(ScriptProgress.id == progress_id, ScriptProgress.user_id == user.id))).scalar_one_or_none()
    if not progress: return fail(2001, "进度不存在")
    history = await get_recent_chat_history(db, progress_id, npc_id)
    return ok({"messages": history})


class ChooseReq(BaseModel):
    nodeId: int
    choiceId: str


@router.post("/{progress_id}/choose")
async def choose(progress_id: int, req: ChooseReq, db: AsyncSession = Depends(get_db), user=Depends(get_current_user)):
    progress = (await db.execute(select(ScriptProgress).where(ScriptProgress.id == progress_id, ScriptProgress.user_id == user.id))).scalar_one_or_none()
    if not progress: return fail(2001, "进度不存在")

    node = (await db.execute(select(ScriptNode).where(ScriptNode.id == req.nodeId))).scalar_one_or_none()
    if not node or not node.config:
        return fail(2001, "节点不存在")

    branch_options = node.config.get("branchOptions", [])
    chosen = next((opt for opt in branch_options if opt.get("id") == req.choiceId), None)
    if not chosen: return fail(1001, "无效的选择")

    next_node_id = chosen.get("nextNodeId")
    if next_node_id:
        # 不立即推进 current_node_id，等前端点击"前往下一节"后再推进
        # 标记当前节点完成
        completed = list(progress.completed_node_ids or [])
        if str(req.nodeId) not in completed:
            completed.append(str(req.nodeId))
        progress.completed_node_ids = completed

        return ok({"nextNodeId": str(int(next_node_id)), "message": f"你选择了：{chosen.get('label', '')}"})
    return fail(2001, "无法找到下一节点")


class TaskSubmitReq(BaseModel):
    taskId: int
    nodeId: int
    answer: str | None = None
    photoUrl: str | None = None
    gpsLat: float | None = None
    gpsLng: float | None = None


@router.post("/{progress_id}/task/submit")
async def submit_task(progress_id: int, req: TaskSubmitReq, db: AsyncSession = Depends(get_db), user=Depends(get_current_user)):
    progress = (await db.execute(select(ScriptProgress).where(ScriptProgress.id == progress_id, ScriptProgress.user_id == user.id))).scalar_one_or_none()
    if not progress: return fail(2001, "进度不存在")

    task = (await db.execute(select(Task).where(Task.id == req.taskId))).scalar_one_or_none()
    if not task: return fail(2001, "任务不存在")

    success = False
    message = ""
    retry_hint = task.retry_hint or ""

    if task.type == "gps_checkin":
        success = True
        message = f"你已到达{task.title}！"

    elif task.type == "puzzle":
        if req.answer and task.answer:
            if req.answer.strip().lower() == task.answer.strip().lower():
                success = True
                message = f"答案正确！{task.reward_item.get('description', '') if task.reward_item else ''}"
            else:
                message = "答案不太对，再想想看……"
        else:
            return fail(1001, "谜题需要提供答案")

    elif task.type == "choice":
        success = True
        message = "你做出了选择。"

    else:
        success = True
        message = "任务完成！"

    if success:
        reward = task.reward_item

        # 先查询节点（在修改 progress 之前，避免 autoflush 导致行锁冲突）
        node = (await db.execute(select(ScriptNode).where(ScriptNode.id == req.nodeId))).scalar_one_or_none()
        next_node_id = None

        completed = list(progress.completed_task_ids or [])
        if str(req.taskId) not in completed:
            completed.append(str(req.taskId))
        progress.completed_task_ids = completed

        if reward:
            items = list(progress.items or [])
            reward["acquiredAt"] = tz_now().isoformat()
            items.append(reward)
            progress.items = items

        if node:
            all_done = all(
                str(t.id) in progress.completed_task_ids
                for t in (node.tasks or [])
            )
            logger.info(f"submit_task: node_id={req.nodeId}, all_tasks={[t.id for t in (node.tasks or [])]}, completed={progress.completed_task_ids}, all_done={all_done}")
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
                            logger.info(f"submit_task: 未配置nextNodes，按顺序推进到 node_id={next_in_chapter.id}")
                    logger.info(f"submit_task: next_nodes={next_nodes}")
                    if next_nodes:
                        next_node_id = int(next_nodes[0])
                else:
                    logger.info(f"submit_task: 节点有分支，不自动推进，等待用户选择")
                # 标记当前节点完成
                completed_nodes = list(progress.completed_node_ids or [])
                if str(req.nodeId) not in completed_nodes:
                    completed_nodes.append(str(req.nodeId))
                progress.completed_node_ids = completed_nodes

        return ok({
            "success": True, "message": message,
            "reward": {"item": reward} if reward else None,
            "nextNodeId": str(next_node_id) if next_node_id else None,
        })
    else:
        return ok({"success": False, "message": message, "retryHint": retry_hint})


@router.post("/{progress_id}/gps-checkin")
async def gps_checkin(progress_id: int, nodeId: int = Query(...), taskId: int = Query(...),
                      lat: float = Query(...), lng: float = Query(...),
                      db: AsyncSession = Depends(get_db), user=Depends(get_current_user)):
    return await submit_task(progress_id, TaskSubmitReq(taskId=taskId, nodeId=nodeId, gpsLat=lat, gpsLng=lng), db, user)


class AdvanceNodeReq(BaseModel):
    nextNodeId: int


@router.post("/{progress_id}/advance-node")
async def advance_node(progress_id: int, req: AdvanceNodeReq, db: AsyncSession = Depends(get_db), user=Depends(get_current_user)):
    """用户点击"前往下一节"后，正式推进到下一节点"""
    progress = (await db.execute(select(ScriptProgress).where(ScriptProgress.id == progress_id, ScriptProgress.user_id == user.id))).scalar_one_or_none()
    if not progress: return fail(2001, "进度不存在")

    progress.current_node_id = req.nextNodeId
    logger.info(f"advance_node: progress_id={progress_id} → node_id={req.nextNodeId}")
    return ok({"nextNodeId": str(req.nextNodeId)})


@router.get("/{progress_id}/progress")
async def get_progress(progress_id: int, db: AsyncSession = Depends(get_db), user=Depends(get_current_user)):
    p = (await db.execute(select(ScriptProgress).where(ScriptProgress.id == progress_id, ScriptProgress.user_id == user.id))).scalar_one_or_none()
    if not p: return fail(2001, "进度不存在")
    script = (await db.execute(select(Script).where(Script.id == p.script_id))).scalar_one_or_none()
    # 统计总节点数
    total_nodes = sum(len(ch.nodes or []) for ch in (script.chapters or [])) if script else 0
    # 统计总任务数
    total_tasks = 0
    if script:
        for ch in (script.chapters or []):
            for node in (ch.nodes or []):
                total_tasks += len(node.tasks or [])
    return ok({
        "progressId": str(p.id), "scriptId": str(p.script_id),
        "scriptTitle": script.title if script else "",
        "status": p.status, "currentNodeId": str(p.current_node_id) if p.current_node_id else None,
        "completedNodeIds": p.completed_node_ids or [],
        "completedTaskIds": p.completed_task_ids or [],
        "totalNodeCount": total_nodes, "totalTaskCount": total_tasks,
        "items": p.items or [],
        "startedAt": p.started_at.isoformat() if p.started_at else None,
        "updatedAt": p.updated_at.isoformat() if p.updated_at else None,
    })


@router.get("/{progress_id}/items")
async def get_items(progress_id: int, db: AsyncSession = Depends(get_db), user=Depends(get_current_user)):
    p = (await db.execute(select(ScriptProgress).where(ScriptProgress.id == progress_id, ScriptProgress.user_id == user.id))).scalar_one_or_none()
    if not p: return fail(2001, "进度不存在")
    return ok({"items": p.items or []})


class EndingReq(BaseModel):
    endingId: int

@router.post("/{progress_id}/ending")
async def reach_ending(progress_id: int, req: EndingReq,
                       db: AsyncSession = Depends(get_db), user=Depends(get_current_user)):
    p = (await db.execute(select(ScriptProgress).where(ScriptProgress.id == progress_id, ScriptProgress.user_id == user.id))).scalar_one_or_none()
    if not p: return fail(2001, "进度不存在")

    ending = (await db.execute(select(ScriptEnding).where(ScriptEnding.id == req.endingId))).scalar_one_or_none()
    if not ending: return fail(2001, "结局不存在")

    p.status = "completed"
    p.completed_at = tz_now()
    p.completed_ending_id = req.endingId
    duration_seconds = int((p.completed_at - p.started_at).total_seconds()) if p.started_at else 0

    all_endings = (await db.execute(select(ScriptEnding).where(ScriptEnding.script_id == p.script_id))).scalars().all()

    return ok({
        "endingId": str(ending.id), "title": ending.title, "description": ending.description,
        "endingImage": ending.ending_image, "totalDuration": duration_seconds,
        "allEndings": [{
            "endingId": str(e.id), "title": e.title,
            "unlocked": str(e.id) == str(req.endingId)
        } for e in all_endings],
    })


@router.get("/user/scripts")
async def user_scripts(status: str = Query(None), db: AsyncSession = Depends(get_db), user=Depends(get_current_user)):
    q = select(ScriptProgress).where(ScriptProgress.user_id == user.id)
    if status: q = q.where(ScriptProgress.status == status)
    q = q.order_by(ScriptProgress.updated_at.desc())
    rows = (await db.execute(q)).scalars().all()
    result = []
    for p in rows:
        script = (await db.execute(select(Script).where(Script.id == p.script_id))).scalar_one_or_none()
        # 构建进度描述
        progress_label = ""
        if p.status == "completed" and p.completed_ending_id:
            ending = (await db.execute(select(ScriptEnding).where(ScriptEnding.id == p.completed_ending_id))).scalar_one_or_none()
            progress_label = f"已完成 · {ending.title}" if ending else "已完成"
        elif p.status == "playing" and p.current_node_id:
            node = (await db.execute(select(ScriptNode).where(ScriptNode.id == p.current_node_id))).scalar_one_or_none()
            if node:
                chapter = (await db.execute(select(ScriptChapter).where(ScriptChapter.id == node.chapter_id))).scalar_one_or_none()
                chapter_title = chapter.title if chapter else ""
                progress_label = f"{chapter_title} · {node.title}" if chapter_title else node.title
            else:
                progress_label = "进行中"
        elif p.status == "playing":
            progress_label = "进行中"
        result.append({
            "progressId": str(p.id), "scriptId": str(p.script_id),
            "title": script.title if script else "", "coverImage": script.cover_image if script else "",
            "status": p.status,
            "progressLabel": progress_label,
            "completedNodeCount": len(p.completed_node_ids or []),
            "totalNodeCount": sum(len(ch.nodes or []) for ch in (script.chapters or [])) if script else 0,
            "lastPlayedAt": p.updated_at.isoformat() if p.updated_at else None,
        })
    return ok({"list": result})


def _haversine(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """计算两点间距离（米）"""
    R = 6371000
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlam = math.radians(lng2 - lng1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlam / 2) ** 2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
