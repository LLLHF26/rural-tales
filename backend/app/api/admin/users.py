"""管理端 —— 用户管理"""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.dependencies import get_current_admin
from app.models.user import User, Admin
from app.models.progress import ScriptProgress, ChatLog, Rating
from app.models.script import Script, ScriptNpc, ScriptNode, ScriptEnding
from app.utils.response import ok, fail

router = APIRouter(prefix="/users", tags=["管理端-用户"])


def _mask_phone(phone: str) -> str:
    if len(phone) >= 11:
        return phone[:3] + "****" + phone[-4:]
    return phone


@router.get("")
async def list_users(
    page: int = Query(1, ge=1),
    pageSize: int = Query(20, ge=1, le=1000),
    keyword: str | None = Query(None),
    startDate: str | None = Query(None),
    endDate: str | None = Query(None),
    db: AsyncSession = Depends(get_db),
    admin: Admin = Depends(get_current_admin),
):
    base = select(User)
    count_base = select(func.count(User.id))

    if keyword:
        kw = f"%{keyword}%"
        base = base.where((User.nickname.like(kw)) | (User.phone.like(kw)))
        count_base = count_base.where((User.nickname.like(kw)) | (User.phone.like(kw)))
    if startDate:
        base = base.where(User.created_at >= startDate)
        count_base = count_base.where(User.created_at >= startDate)
    if endDate:
        base = base.where(User.created_at <= endDate + " 23:59:59")
        count_base = count_base.where(User.created_at <= endDate + " 23:59:59")

    total_result = await db.execute(count_base)
    total = total_result.scalar() or 0

    base = base.order_by(User.created_at.desc()).offset((page - 1) * pageSize).limit(pageSize)
    result = await db.execute(base)
    users = result.scalars().all()

    items = []
    for u in users:
        # count experiences
        exp_count = await db.execute(select(func.count(ScriptProgress.id)).where(ScriptProgress.user_id == u.id))
        comp_count = await db.execute(
            select(func.count(ScriptProgress.id)).where(ScriptProgress.user_id == u.id, ScriptProgress.status == "completed")
        )
        items.append({
            "userId": str(u.id),
            "nickname": u.nickname,
            "avatar": u.avatar,
            "phone": _mask_phone(u.phone),
            "experienceCount": exp_count.scalar() or 0,
            "completedCount": comp_count.scalar() or 0,
            "createdAt": u.created_at.isoformat() if u.created_at else None,
        })

    return ok({"total": total, "page": page, "pageSize": pageSize, "list": items})


@router.get("/{user_id}")
async def get_user_detail(user_id: int, db: AsyncSession = Depends(get_db), admin: Admin = Depends(get_current_admin)):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        return fail(2001, "用户不存在")

    exp_count = await db.execute(select(func.count(ScriptProgress.id)).where(ScriptProgress.user_id == user.id))
    comp_count = await db.execute(
        select(func.count(ScriptProgress.id)).where(ScriptProgress.user_id == user.id, ScriptProgress.status == "completed")
    )
    rating_count = await db.execute(
        select(func.count(Rating.id)).where(Rating.user_id == user.id)
    )

    return ok({
        "userId": str(user.id),
        "nickname": user.nickname,
        "avatar": user.avatar,
        "phone": _mask_phone(user.phone),
        "experienceCount": exp_count.scalar() or 0,
        "completedCount": comp_count.scalar() or 0,
        "ratingCount": rating_count.scalar() or 0,
        "createdAt": user.created_at.isoformat() if user.created_at else None,
    })


@router.get("/{user_id}/progresses")
async def get_user_progresses(
    user_id: int,
    page: int = Query(1, ge=1),
    pageSize: int = Query(20, ge=1, le=1000),
    status: str | None = Query(None),
    db: AsyncSession = Depends(get_db),
    admin: Admin = Depends(get_current_admin),
):
    base = select(ScriptProgress).where(ScriptProgress.user_id == user_id)
    count_base = select(func.count(ScriptProgress.id)).where(ScriptProgress.user_id == user_id)

    if status:
        base = base.where(ScriptProgress.status == status)
        count_base = count_base.where(ScriptProgress.status == status)

    total_result = await db.execute(count_base)
    total = total_result.scalar() or 0

    base = base.order_by(ScriptProgress.started_at.desc()).offset((page - 1) * pageSize).limit(pageSize)
    result = await db.execute(base)
    progresses = result.scalars().all()

    items = []
    for p in progresses:
        script_result = await db.execute(select(Script).where(Script.id == p.script_id))
        script = script_result.scalar_one_or_none()
        total_nodes = 0
        if script:
            chapters_result = await db.execute(
                select(func.count(ScriptNode.id)).where(ScriptNode.script_id == script.id)
            )
            total_nodes = chapters_result.scalar() or 0

        # 耗时（分钟）
        duration_minutes = 0
        if p.started_at and p.completed_at:
            duration_minutes = round((p.completed_at - p.started_at).total_seconds() / 60, 1)

        # 达成结局
        ending_title = ""
        if p.completed_ending_id:
            ending_result = await db.execute(select(ScriptEnding).where(ScriptEnding.id == p.completed_ending_id))
            ending = ending_result.scalar_one_or_none()
            if ending:
                ending_title = ending.title

        items.append({
            "progressId": str(p.id),
            "scriptId": str(p.script_id),
            "scriptTitle": script.title if script else "未知",
            "villageName": "",
            "status": p.status,
            "completedNodeCount": len(p.completed_node_ids) if p.completed_node_ids else 0,
            "totalNodeCount": total_nodes,
            "duration": duration_minutes,
            "endingTitle": ending_title,
            "startedAt": p.started_at.isoformat() if p.started_at else None,
            "completedAt": p.completed_at.isoformat() if p.completed_at else None,
        })

    return ok({"total": total, "page": page, "pageSize": pageSize, "list": items})


@router.get("/{user_id}/progresses/{progress_id}")
async def get_progress_detail(
    user_id: int,
    progress_id: int,
    db: AsyncSession = Depends(get_db),
    admin: Admin = Depends(get_current_admin),
):
    result = await db.execute(select(ScriptProgress).where(ScriptProgress.id == progress_id, ScriptProgress.user_id == user_id))
    progress = result.scalar_one_or_none()
    if not progress:
        return fail(2001, "记录不存在")

    script_result = await db.execute(select(Script).where(Script.id == progress.script_id))
    script = script_result.scalar_one_or_none()

    # chat logs
    chat_result = await db.execute(
        select(ChatLog).where(ChatLog.progress_id == progress.id).order_by(ChatLog.created_at.asc()).limit(100)
    )
    chats = chat_result.scalars().all()

    chat_items = []
    for c in chats:
        npc_result = await db.execute(select(ScriptNpc).where(ScriptNpc.id == c.npc_id))
        npc = npc_result.scalar_one_or_none()
        chat_items.append({
            "npcName": npc.name if npc else "未知",
            "role": c.role,
            "content": c.content,
            "createdAt": c.created_at.isoformat() if c.created_at else None,
        })

    return ok({
        "progressId": str(progress.id),
        "scriptTitle": script.title if script else "未知",
        "status": progress.status,
        "completedNodeIds": progress.completed_node_ids or [],
        "completedTaskIds": progress.completed_task_ids or [],
        "items": progress.items or [],
        "chatLogs": chat_items,
        "startedAt": progress.started_at.isoformat() if progress.started_at else None,
        "completedAt": progress.completed_at.isoformat() if progress.completed_at else None,
    })
