"""管理端 —— 仪表盘"""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from datetime import datetime, timedelta

from app.database import get_db
from app.utils.timezone import tz_now
from app.models.user import User
from app.models.village import Village
from app.models.script import Script
from app.models.progress import ScriptProgress, Rating
from app.dependencies import get_current_admin
from app.utils.response import ok

router = APIRouter(prefix="/dashboard", tags=["管理端-仪表盘"])


@router.get("/overview")
async def overview(db: AsyncSession = Depends(get_db), admin=Depends(get_current_admin)):
    user_count = (await db.execute(select(func.count()).select_from(User))).scalar()
    village_count = (await db.execute(select(func.count()).select_from(Village))).scalar()
    script_count = (await db.execute(select(func.count()).select_from(Script))).scalar()
    pub_count = (await db.execute(select(func.count()).select_from(Script).where(Script.status == "published"))).scalar()
    exp_count = (await db.execute(select(func.count()).select_from(ScriptProgress))).scalar()
    avg_rating = (await db.execute(select(func.avg(Rating.rating)).select_from(Rating))).scalar() or 0

    today = tz_now().replace(hour=0, minute=0, second=0, microsecond=0)
    today_exp = (await db.execute(select(func.count()).select_from(ScriptProgress).where(ScriptProgress.started_at >= today))).scalar()
    today_complete = (await db.execute(select(func.count()).select_from(ScriptProgress).where(
        ScriptProgress.status == "completed", ScriptProgress.completed_at >= today
    ))).scalar()

    completed_total = (await db.execute(select(func.count()).select_from(ScriptProgress).where(
        ScriptProgress.status == "completed"
    ))).scalar() or 0
    completion_rate = round(completed_total / exp_count * 100, 1) if exp_count > 0 else 0

    return ok({
        "villageCount": village_count, "scriptCount": script_count,
        "publishedScriptCount": pub_count, "userCount": user_count,
        "todayExperienceCount": today_exp, "todayCompletedCount": today_complete or 0,
        "todayOnlineCount": 0,
        "avgRating": round(float(avg_rating), 1), "totalExperienceCount": exp_count,
        "totalCompletedCount": completed_total,
        "completionRate": completion_rate,
    })


@router.get("/trend")
async def trend(days: int = Query(7), db: AsyncSession = Depends(get_db), admin=Depends(get_current_admin)):
    today = tz_now().replace(hour=0, minute=0, second=0, microsecond=0)
    daily_active = []
    daily_complete = []
    for i in range(days - 1, -1, -1):
        d = today - timedelta(days=i)
        next_d = d + timedelta(days=1)
        cnt = (await db.execute(select(func.count()).select_from(ScriptProgress).where(
            ScriptProgress.started_at >= d, ScriptProgress.started_at < next_d
        ))).scalar()
        daily_active.append({"date": d.strftime("%Y-%m-%d"), "count": cnt})
        comp = (await db.execute(select(func.count()).select_from(ScriptProgress).where(
            ScriptProgress.status == "completed",
            ScriptProgress.completed_at >= d, ScriptProgress.completed_at < next_d
        ))).scalar()
        daily_complete.append({"date": d.strftime("%Y-%m-%d"), "count": comp})
    return ok({"dailyActive": daily_active, "dailyComplete": daily_complete})


@router.get("/hot-scripts")
async def hot_scripts(limit: int = Query(10), db: AsyncSession = Depends(get_db), admin=Depends(get_current_admin)):
    rows = (await db.execute(
        select(Script).where(Script.status == "published").order_by(Script.experience_count.desc()).limit(limit)
    )).scalars().all()

    items = []
    for s in rows:
        completed = (await db.execute(
            select(func.count(ScriptProgress.id)).where(
                ScriptProgress.script_id == s.id, ScriptProgress.status == "completed"
            )
        )).scalar() or 0
        items.append({
            "scriptId": str(s.id), "title": s.title, "villageName": "",
            "experienceCount": s.experience_count, "rating": float(s.rating_avg),
            "completionRate": round(completed / max(s.experience_count or 1, 1), 2),
        })
    return ok({"list": items})
