"""管理端 —— 数据分析"""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, case, text
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.dependencies import get_current_admin
from app.models.user import User, Admin
from app.models.progress import ScriptProgress, Rating
from app.models.script import Script, ScriptNode, Task, ScriptChapter
from app.models.village import Village
from app.utils.response import ok, fail

router = APIRouter(prefix="/analytics", tags=["管理端-数据分析"])


@router.get("/scripts-overview")
async def scripts_overview(
    villageId: int | None = Query(None),
    db: AsyncSession = Depends(get_db),
    admin: Admin = Depends(get_current_admin),
):
    base = select(Script)
    if villageId:
        base = base.where(Script.village_id == villageId)
    result = await db.execute(base.order_by(Script.experience_count.desc()))
    scripts = result.scalars().all()

    items = []
    for s in scripts:
        completed = (await db.execute(
            select(func.count(ScriptProgress.id)).where(
                ScriptProgress.script_id == s.id,
                ScriptProgress.status == "completed"
            )
        )).scalar() or 0
        # avg duration in seconds for completed progresses (MySQL compatible)
        avg_dur = (await db.execute(
            select(func.avg(
                func.timestampdiff(text('SECOND'), ScriptProgress.started_at, ScriptProgress.completed_at)
            )).where(
                ScriptProgress.script_id == s.id,
                ScriptProgress.status == "completed"
            )
        )).scalar()
        avg_minutes = round(float(avg_dur) / 60, 1) if avg_dur else 0
        items.append({
            "scriptId": str(s.id),
            "title": s.title,
            "experienceCount": s.experience_count or 0,
            "completedCount": completed,
            "completionRate": round(completed / max(s.experience_count or 1, 1), 2),
            "avgDuration": avg_minutes,
            "avgRating": round(s.rating_avg or 0, 1),
            "ratingCount": s.rating_count or 0,
        })

    return ok({"list": items})


@router.get("/scripts/{script_id}/node-funnel")
async def node_funnel(script_id: int, db: AsyncSession = Depends(get_db), admin: Admin = Depends(get_current_admin)):
    script_result = await db.execute(select(Script).where(Script.id == script_id))
    script = script_result.scalar_one_or_none()
    if not script:
        return fail(2001, "剧本不存在")

    # get all nodes for this script
    chapters_result = await db.execute(
        select(ScriptChapter).where(ScriptChapter.script_id == script_id).order_by(ScriptChapter.sort_order)
    )
    chapters = chapters_result.scalars().all()

    nodes_list = []
    for ch in chapters:
        nodes_result = await db.execute(
            select(ScriptNode).where(ScriptNode.chapter_id == ch.id).order_by(ScriptNode.sort_order)
        )
        nodes = nodes_result.scalars().all()
        nodes_list.extend(nodes)

    items = []
    total_experiences = await db.execute(
        select(func.count(ScriptProgress.id)).where(ScriptProgress.script_id == script_id)
    )
    total = total_experiences.scalar() or 1  # avoid division by zero

    for node in nodes_list:
        node_id_str = str(node.id)
        # Count progresses that have this node in completed_node_ids
        enter_count = await db.execute(
            select(func.count(ScriptProgress.id)).where(
                ScriptProgress.script_id == script_id,
                ScriptProgress.completed_node_ids.contains([node_id_str])
            )
        )
        enter = enter_count.scalar() or 0

        items.append({
            "nodeId": node_id_str,
            "title": node.title,
            "enterCount": enter,
            "completeCount": enter,
            "rate": round(enter / total, 2) if total > 0 else 0,
        })

    return ok({"nodes": items})


@router.get("/scripts/{script_id}/task-stats")
async def task_stats(script_id: int, db: AsyncSession = Depends(get_db), admin: Admin = Depends(get_current_admin)):
    tasks_result = await db.execute(select(Task).where(Task.script_id == script_id).order_by(Task.sort_order))
    tasks = tasks_result.scalars().all()

    items = []
    for t in tasks:
        items.append({
            "taskId": str(t.id),
            "title": t.title,
            "type": t.type,
            "attemptCount": 0,
            "passCount": 0,
            "passRate": 0,
            "avgAttempts": 0,
            "avgDurationSeconds": 0,
        })

    return ok({"list": items})


@router.get("/user-profile")
async def user_profile(db: AsyncSession = Depends(get_db), admin: Admin = Depends(get_current_admin)):
    total_result = await db.execute(select(func.count(User.id)))
    total_users = total_result.scalar() or 0

    # active users (hardcoded — 需要 Redis 会话统计)
    progress_result = await db.execute(select(func.count(func.distinct(ScriptProgress.user_id))))
    active_users = progress_result.scalar() or 0

    # script type distribution
    mystery_count = (await db.execute(select(func.count(Script.id)).where(Script.type == "mystery"))).scalar() or 0
    history_count = (await db.execute(select(func.count(Script.id)).where(Script.type == "history"))).scalar() or 0
    family_count = (await db.execute(select(func.count(Script.id)).where(Script.type == "family"))).scalar() or 0
    total_scripts = mystery_count + history_count + family_count

    return ok({
        "totalUsers": total_users,
        "activeUsers7d": active_users,
        "activeUsers30d": active_users,
        "scriptTypeDistribution": {
            "mystery": round(mystery_count / max(total_scripts, 1), 2),
            "history": round(history_count / max(total_scripts, 1), 2),
            "family": round(family_count / max(total_scripts, 1), 2),
        },
        "avgScriptPerUser": 0,
        "avgRatingPerUser": 0,
    })


@router.get("/ratings")
async def ratings_list(
    page: int = Query(1, ge=1),
    pageSize: int = Query(20, ge=1, le=1000),
    scriptId: int | None = Query(None),
    rating: int | None = Query(None),
    db: AsyncSession = Depends(get_db),
    admin: Admin = Depends(get_current_admin),
):
    base = select(Rating)
    count_base = select(func.count(Rating.id))

    if scriptId:
        base = base.where(Rating.script_id == scriptId)
        count_base = count_base.where(Rating.script_id == scriptId)
    if rating:
        base = base.where(Rating.rating == rating)
        count_base = count_base.where(Rating.rating == rating)

    total_result = await db.execute(count_base)
    total = total_result.scalar() or 0

    base = base.order_by(Rating.created_at.desc()).offset((page - 1) * pageSize).limit(pageSize)
    result = await db.execute(base)
    ratings = result.scalars().all()

    items = []
    for r in ratings:
        user_result = await db.execute(select(User).where(User.id == r.user_id))
        user = user_result.scalar_one_or_none()
        script_result = await db.execute(select(Script).where(Script.id == r.script_id))
        script = script_result.scalar_one_or_none()

        items.append({
            "ratingId": str(r.id),
            "userId": str(r.user_id),
            "userNickname": user.nickname if user else "未知",
            "scriptId": str(r.script_id),
            "scriptTitle": script.title if script else "未知",
            "rating": r.rating,
            "createdAt": r.created_at.isoformat() if r.created_at else None,
        })

    return ok({"total": total, "page": page, "pageSize": pageSize, "list": items})
