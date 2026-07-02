"""移动端 —— 剧本浏览"""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from pydantic import BaseModel

from app.database import get_db
from app.models.script import Script
from app.models.progress import ScriptProgress, Rating
from app.models.village import Village
from app.dependencies import get_current_user, get_optional_user, get_current_admin
from app.utils.response import ok, fail
from app.utils.timezone import tz_now

router = APIRouter(prefix="/scripts", tags=["移动端-剧本"])


@router.get("")
async def list_scripts(
    page: int = Query(1, ge=1), pageSize: int = Query(10, ge=1, le=20),
    villageId: int = Query(None), type: str = Query(None),
    keyword: str = Query(None), sort: str = Query("hot"),
    db: AsyncSession = Depends(get_db),
):
    q = select(Script).where(Script.status == "published")
    if villageId: q = q.where(Script.village_id == villageId)
    if type: q = q.where(Script.type == type)
    if keyword: q = q.where(Script.title.contains(keyword))

    if sort == "newest":
        q = q.order_by(Script.published_at.desc())
    elif sort == "rating":
        q = q.order_by(Script.rating_avg.desc())
    else:
        q = q.order_by(Script.experience_count.desc())

    count_q = select(func.count()).select_from(q.subquery())
    total = (await db.execute(count_q)).scalar()
    rows = (await db.execute(q.offset((page - 1) * pageSize).limit(pageSize))).scalars().all()

    def _script_brief(s: Script) -> str:
        if s.storyline:
            return s.storyline[:80] + ("…" if len(s.storyline) > 80 else "")
        return ""

    return ok({
        "total": total, "page": page, "pageSize": pageSize,
        "list": [{
            "scriptId": str(s.id), "title": s.title, "coverImage": s.cover_image,
            "villageName": "", "type": s.type,
            "typeLabel": {"mystery": "悬疑解谜", "history": "历史文化", "family": "亲子互动", "couple": "情侣探险", "team": "团队协作"}.get(s.type, s.type),
            "difficulty": s.difficulty, "estimatedDuration": s.estimated_duration,
            "rating": float(s.rating_avg), "experienceCount": s.experience_count,
            "brief": _script_brief(s),
            "tags": s.tags if hasattr(s, 'tags') else [],
        } for s in rows]
    })


@router.get("/recommend")
async def recommend(limit: int = Query(6), db: AsyncSession = Depends(get_db)):
    rows = (await db.execute(
        select(Script).where(Script.status == "published").order_by(Script.rating_avg.desc()).limit(limit)
    )).scalars().all()
    return ok({"list": [{
        "scriptId": str(s.id), "title": s.title, "coverImage": s.cover_image,
        "villageName": "", "type": s.type,
        "typeLabel": {"mystery": "悬疑解谜", "history": "历史文化", "family": "亲子互动", "couple": "情侣探险", "team": "团队协作"}.get(s.type, s.type),
        "difficulty": s.difficulty, "estimatedDuration": s.estimated_duration,
        "rating": float(s.rating_avg), "experienceCount": s.experience_count,
        "brief": (s.storyline[:80] + "…") if s.storyline and len(s.storyline) > 80 else (s.storyline or ""),
        "tags": [],
    } for s in rows]})


@router.get("/{script_id}")
async def get_script(script_id: int, db: AsyncSession = Depends(get_db), user=Depends(get_optional_user)):
    s = (await db.execute(select(Script).where(Script.id == script_id))).scalar_one_or_none()
    if not s: return fail(2001, "剧本不存在")

    # 查询村庄信息
    v = (await db.execute(select(Village).where(Village.id == s.village_id))).scalar_one_or_none()
    village_name = v.name if v else ""
    village_address = v.address if v else ""

    # 查看用户是否已评分 & 已达成结局
    user_rating = None
    unlocked_ending_ids = set()
    if user:
        r = (await db.execute(select(Rating).where(Rating.user_id == user.id, Rating.script_id == script_id))).scalar_one_or_none()
        if r: user_rating = r.rating
        # 查询用户所有进度中的已完成节点 & 进行中的进度
        active_progress_id = None
        progresses = (await db.execute(
            select(ScriptProgress).where(ScriptProgress.user_id == user.id, ScriptProgress.script_id == script_id)
        )).scalars().all()
        for p in progresses:
            if p.completed_ending_id:
                unlocked_ending_ids.add(str(p.completed_ending_id))
            if p.status == "playing":
                active_progress_id = str(p.id)

    # 动态计算完成率
    total_completed = (await db.execute(
        select(func.count()).select_from(ScriptProgress).where(
            ScriptProgress.script_id == script_id,
            ScriptProgress.status == "completed"
        )
    )).scalar() or 0
    completion_rate = round(total_completed / max(s.experience_count or 1, 1), 2)

    return ok({
        "scriptId": str(s.id), "title": s.title, "coverImage": s.cover_image,
        "villageId": str(s.village_id), "villageName": village_name, "villageAddress": village_address,
        "villageLocation": None, "type": s.type,
        "typeLabel": {"mystery": "悬疑解谜", "history": "历史文化", "family": "亲子互动", "couple": "情侣探险", "team": "团队协作"}.get(s.type, s.type),
        "difficulty": s.difficulty, "estimatedDuration": s.estimated_duration,
        "rating": float(s.rating_avg), "ratingCount": s.rating_count,
        "experienceCount": s.experience_count, "completionRate": completion_rate,
        "storyline": s.storyline,
        "npcs": [{"npcId": str(n.id), "name": n.name, "avatar": n.avatar, "role": n.role, "description": n.description} for n in (s.npcs or [])],
        "chapterCount": len(s.chapters or []), "endingCount": len(s.endings or []),
        "endings": [{
            "endingId": str(e.id), "title": e.title, "description": e.description,
            "endingImage": e.ending_image, "conditionDesc": e.condition_desc,
            "unlocked": str(e.id) in unlocked_ending_ids,
        } for e in (s.endings or [])],
        "tags": [], "userRating": user_rating, "activeProgressId": active_progress_id,
        "publishAt": s.published_at.isoformat() if s.published_at else None,
    })


@router.post("/{script_id}/claim")
async def claim_script(script_id: int, db: AsyncSession = Depends(get_db), user=Depends(get_current_user)):
    s = (await db.execute(select(Script).where(Script.id == script_id, Script.status == "published"))).scalar_one_or_none()
    if not s: return fail(2001, "剧本不存在或未发布")

    # 检查是否已有进行中的进度
    existing = (await db.execute(
        select(ScriptProgress).where(ScriptProgress.user_id == user.id, ScriptProgress.script_id == script_id, ScriptProgress.status == "playing")
    )).scalar_one_or_none()
    if existing:
        return fail(2002, "你已领取过该剧本，请继续体验")

    first_node = None
    if s.chapters:
        for ch in s.chapters:
            if ch.nodes:
                first_node = ch.nodes[0]
                break

    progress = ScriptProgress(user_id=user.id, script_id=script_id, status="playing",
                              current_node_id=first_node.id if first_node else None,
                              completed_node_ids=[], completed_task_ids=[], items=[],
                              started_at=tz_now())
    db.add(progress)
    s.experience_count = (s.experience_count or 0) + 1
    await db.flush()
    return ok({
        "progressId": str(progress.id), "scriptId": str(script_id), "status": "playing",
        "currentNodeId": str(first_node.id) if first_node else None,
        "startedAt": progress.started_at.isoformat(),
    })


@router.post("/{script_id}/rate")
async def rate_script(script_id: int, rating: int = Query(..., ge=1, le=5), db: AsyncSession = Depends(get_db), user=Depends(get_current_user)):
    s = (await db.execute(select(Script).where(Script.id == script_id))).scalar_one_or_none()
    if not s: return fail(2001, "剧本不存在")

    existing = (await db.execute(select(Rating).where(Rating.user_id == user.id, Rating.script_id == script_id))).scalar_one_or_none()
    if existing:
        return fail(2002, "您已评过分")

    db.add(Rating(user_id=user.id, script_id=script_id, rating=rating))
    s.rating_count = (s.rating_count or 0) + 1
    all_ratings = (await db.execute(select(func.avg(Rating.rating)).where(Rating.script_id == script_id))).scalar()
    s.rating_avg = float(all_ratings) if all_ratings else rating
    return ok()
