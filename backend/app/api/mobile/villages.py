"""移动端 —— 村庄"""

import math
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.database import get_db
from app.models.village import Village
from app.models.script import Script
from app.utils.response import ok

router = APIRouter(prefix="/villages", tags=["移动端-村庄"])


def haversine(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """计算两点间距离(km)"""
    r = 6371
    dlat = math.radians(lat2 - lat1)
    dlng = math.radians(lng2 - lng1)
    a = math.sin(dlat / 2) ** 2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlng / 2) ** 2
    return round(r * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a)), 1)


@router.get("")
async def list_villages(
    page: int = Query(1, ge=1),
    pageSize: int = Query(10, ge=1, le=20),
    keyword: str = Query(None),
    sort: str = Query("name"),
    lat: float = Query(None),
    lng: float = Query(None),
    db: AsyncSession = Depends(get_db),
):
    q = select(Village)
    if keyword:
        q = q.where(Village.name.contains(keyword))

    if sort == "scripts":
        script_cnt = select(func.count(Script.id)).where(
            Script.village_id == Village.id, Script.status == "published"
        ).correlate(Village).scalar_subquery()
        q = q.order_by(script_cnt.desc())
    else:
        q = q.order_by(Village.name)

    # 距离排序需全量查再分页
    if sort == "distance" and lat is not None and lng is not None:
        all_villages = (await db.execute(q)).scalars().all()
        items = []
        for v in all_villages:
            count = (await db.execute(
                select(func.count(Script.id)).where(
                    Script.village_id == v.id, Script.status == "published"
                )
            )).scalar() or 0
            items.append({
                "villageId": str(v.id),
                "name": v.name,
                "coverImage": v.cover_image,
                "description": v.description,
                "tags": v.tags or [],
                "scriptCount": count,
                "distance": haversine(lat, lng, v.lat, v.lng),
            })
        items.sort(key=lambda x: x["distance"])
        total = len(items)
        items = items[(page - 1) * pageSize : page * pageSize]
    else:
        count_q = select(func.count()).select_from(q.subquery())
        total = (await db.execute(count_q)).scalar()
        villages = (await db.execute(q.offset((page - 1) * pageSize).limit(pageSize))).scalars().all()
        items = []
        for v in villages:
            count = (await db.execute(
                select(func.count(Script.id)).where(
                    Script.village_id == v.id, Script.status == "published"
                )
            )).scalar() or 0
            distance = haversine(lat, lng, v.lat, v.lng) if lat is not None and lng is not None else None
            items.append({
                "villageId": str(v.id),
                "name": v.name,
                "coverImage": v.cover_image,
                "description": v.description,
                "tags": v.tags or [],
                "scriptCount": count,
                "distance": distance,
            })

    return ok({"list": items, "total": total, "page": page, "pageSize": pageSize})


@router.get("/{village_id}")
async def get_village(village_id: int, db: AsyncSession = Depends(get_db)):
    v = (await db.execute(select(Village).where(Village.id == village_id))).scalar_one_or_none()
    if not v:
        from app.utils.response import fail
        return fail(3001, "村庄不存在")

    script_count = (await db.execute(
        select(func.count(Script.id)).where(
            Script.village_id == v.id, Script.status == "published"
        )
    )).scalar() or 0

    scripts = (await db.execute(
        select(Script).where(Script.village_id == v.id, Script.status == "published")
        .order_by(Script.rating_avg.desc()).limit(6)
    )).scalars().all()

    return ok({
        "villageId": str(v.id),
        "name": v.name,
        "coverImage": v.cover_image,
        "description": v.description,
        "address": v.address,
        "lat": v.lat,
        "lng": v.lng,
        "tags": v.tags or [],
        "scriptCount": script_count,
        "scripts": [{
            "scriptId": str(s.id),
            "title": s.title,
            "coverImage": s.cover_image,
            "type": s.type,
            "typeLabel": {"mystery": "悬疑解谜", "history": "历史文化", "family": "亲子互动", "couple": "情侣探险", "team": "团队协作"}.get(s.type, s.type),
            "difficulty": s.difficulty,
            "rating": float(s.rating_avg),
            "experienceCount": s.experience_count,
        } for s in scripts],
        "spots": [{
            "spotId": str(sp.id),
            "name": sp.name,
            "lat": sp.lat,
            "lng": sp.lng,
            "description": sp.description,
            "images": sp.images or [],
        } for sp in (v.spots or [])],
        "cultures": [{
            "cultureId": str(c.id),
            "type": c.type,
            "typeLabel": {"history": "历史典故", "intangible": "非遗文化", "legend": "民间传说"}.get(c.type, c.type),
            "title": c.title,
            "content": c.content,
        } for c in (v.cultures or [])],
    })
