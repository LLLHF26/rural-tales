"""管理端 —— 乡村管理"""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, delete
from pydantic import BaseModel

from app.database import get_db
from app.models.village import Village, VillageSpot, VillageCulture
from app.models.script import Script
from app.dependencies import get_current_admin
from app.utils.response import ok, fail

router = APIRouter(prefix="/villages", tags=["管理端-乡村"])


# ---- 乡村 CRUD ----

class VillageReq(BaseModel):
    name: str
    description: str | None = None
    coverImage: str | None = None
    lat: float
    lng: float
    address: str | None = None
    tags: list[str] | None = None


@router.get("")
async def list_villages(
    page: int = Query(1, ge=1), pageSize: int = Query(10, ge=1, le=1000),
    keyword: str = Query(None), db: AsyncSession = Depends(get_db),
    admin=Depends(get_current_admin),
):
    q = select(Village)
    if keyword:
        q = q.where(Village.name.contains(keyword))
    count_q = select(func.count()).select_from(q.subquery())
    total = (await db.execute(count_q)).scalar()
    rows = (await db.execute(q.offset((page - 1) * pageSize).limit(pageSize))).scalars().all()

    # 批量查询各乡村的剧本数
    village_ids = [v.id for v in rows]
    script_counts: dict[int, int] = {}
    if village_ids:
        sc_rows = (await db.execute(
            select(Script.village_id, func.count(Script.id))
            .where(Script.village_id.in_(village_ids))
            .group_by(Script.village_id)
        )).all()
        script_counts = {row[0]: row[1] for row in sc_rows}

    return ok({
        "total": total, "page": page, "pageSize": pageSize,
        "list": [{
            "villageId": str(v.id), "name": v.name, "coverImage": v.cover_image,
            "address": v.address, "spotCount": len(v.spots or []),
            "cultureCount": len(v.cultures or []),
            "scriptCount": script_counts.get(v.id, 0), "createdAt": v.created_at.isoformat() if v.created_at else None,
        } for v in rows]
    })


@router.get("/{village_id}")
async def get_village(village_id: int, db: AsyncSession = Depends(get_db), admin=Depends(get_current_admin)):
    v = (await db.execute(select(Village).where(Village.id == village_id))).scalar_one_or_none()
    if not v:
        return fail(2001, "乡村不存在")
    return ok({
        "villageId": str(v.id), "name": v.name, "description": v.description,
        "coverImage": v.cover_image, "lat": v.lat, "lng": v.lng,
        "address": v.address, "tags": v.tags,
        "createdAt": v.created_at.isoformat() if v.created_at else None,
        "updatedAt": v.updated_at.isoformat() if v.updated_at else None,
    })


@router.post("")
async def create_village(req: VillageReq, db: AsyncSession = Depends(get_db), admin=Depends(get_current_admin)):
    v = Village(name=req.name, description=req.description, cover_image=req.coverImage,
                lat=req.lat, lng=req.lng, address=req.address, tags=req.tags)
    db.add(v)
    await db.flush()
    return ok({"villageId": str(v.id)})


@router.put("/{village_id}")
async def update_village(village_id: int, req: VillageReq, db: AsyncSession = Depends(get_db), admin=Depends(get_current_admin)):
    v = (await db.execute(select(Village).where(Village.id == village_id))).scalar_one_or_none()
    if not v:
        return fail(2001, "乡村不存在")
    for field, value in req.model_dump(exclude_none=True).items():
        db_field = "cover_image" if field == "coverImage" else field
        setattr(v, db_field, value)
    return ok()


@router.delete("/{village_id}")
async def delete_village(village_id: int, db: AsyncSession = Depends(get_db), admin=Depends(get_current_admin)):
    v = (await db.execute(select(Village).where(Village.id == village_id))).scalar_one_or_none()
    if not v:
        return fail(2001, "乡村不存在")
    # 先删除关联的剧本、打卡点、文化条目
    await db.execute(delete(Script).where(Script.village_id == village_id))
    await db.execute(delete(VillageSpot).where(VillageSpot.village_id == village_id))
    await db.execute(delete(VillageCulture).where(VillageCulture.village_id == village_id))
    await db.delete(v)
    return ok()


# ---- 打卡点 ----

class SpotReq(BaseModel):
    name: str
    lat: float
    lng: float
    description: str | None = None
    images: list[str] | None = None
    sortOrder: int = 0


@router.get("/{village_id}/spots")
async def list_spots(village_id: int, db: AsyncSession = Depends(get_db), admin=Depends(get_current_admin)):
    rows = (await db.execute(
        select(VillageSpot).where(VillageSpot.village_id == village_id).order_by(VillageSpot.sort_order)
    )).scalars().all()
    return ok({"list": [{"spotId": str(s.id), "name": s.name, "lat": s.lat, "lng": s.lng,
                         "description": s.description, "images": s.images, "sortOrder": s.sort_order} for s in rows]})


@router.post("/{village_id}/spots")
async def create_spot(village_id: int, req: SpotReq, db: AsyncSession = Depends(get_db), admin=Depends(get_current_admin)):
    s = VillageSpot(village_id=village_id, name=req.name, lat=req.lat, lng=req.lng,
                    description=req.description, images=req.images, sort_order=req.sortOrder)
    db.add(s)
    await db.flush()
    return ok({"spotId": str(s.id)})


@router.put("/{village_id}/spots/{spot_id}")
async def update_spot(village_id: int, spot_id: int, req: SpotReq, db: AsyncSession = Depends(get_db), admin=Depends(get_current_admin)):
    s = (await db.execute(select(VillageSpot).where(VillageSpot.id == spot_id, VillageSpot.village_id == village_id))).scalar_one_or_none()
    if not s: return fail(2001, "打卡点不存在")
    for field, value in req.model_dump(exclude_none=True).items():
        db_field = "sort_order" if field == "sortOrder" else field
        setattr(s, db_field, value)
    return ok()


@router.delete("/{village_id}/spots/{spot_id}")
async def delete_spot(village_id: int, spot_id: int, db: AsyncSession = Depends(get_db), admin=Depends(get_current_admin)):
    s = (await db.execute(select(VillageSpot).where(VillageSpot.id == spot_id, VillageSpot.village_id == village_id))).scalar_one_or_none()
    if not s: return fail(2001, "打卡点不存在")
    await db.delete(s)
    return ok()


# ---- 文化条目 ----

class CultureReq(BaseModel):
    type: str
    title: str
    content: str | None = None


@router.get("/{village_id}/cultures")
async def list_cultures(village_id: int, type: str = Query(None), db: AsyncSession = Depends(get_db), admin=Depends(get_current_admin)):
    q = select(VillageCulture).where(VillageCulture.village_id == village_id)
    if type: q = q.where(VillageCulture.type == type)
    rows = (await db.execute(q)).scalars().all()
    return ok({"list": [{"cultureId": str(c.id), "type": c.type, "title": c.title, "content": c.content} for c in rows]})


@router.post("/{village_id}/cultures")
async def create_culture(village_id: int, req: CultureReq, db: AsyncSession = Depends(get_db), admin=Depends(get_current_admin)):
    c = VillageCulture(village_id=village_id, type=req.type, title=req.title, content=req.content)
    db.add(c)
    await db.flush()
    return ok({"cultureId": str(c.id)})


@router.put("/{village_id}/cultures/{culture_id}")
async def update_culture(village_id: int, culture_id: int, req: CultureReq, db: AsyncSession = Depends(get_db), admin=Depends(get_current_admin)):
    c = (await db.execute(select(VillageCulture).where(VillageCulture.id == culture_id, VillageCulture.village_id == village_id))).scalar_one_or_none()
    if not c: return fail(2001, "文化条目不存在")
    c.type = req.type; c.title = req.title; c.content = req.content
    return ok()


@router.delete("/{village_id}/cultures/{culture_id}")
async def delete_culture(village_id: int, culture_id: int, db: AsyncSession = Depends(get_db), admin=Depends(get_current_admin)):
    c = (await db.execute(select(VillageCulture).where(VillageCulture.id == culture_id, VillageCulture.village_id == village_id))).scalar_one_or_none()
    if not c: return fail(2001, "文化条目不存在")
    await db.delete(c)
    return ok()
