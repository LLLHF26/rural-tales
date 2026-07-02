"""管理端 —— 剧本管理（CRUD + 章节/节点/NPC/结局/任务）"""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from pydantic import BaseModel
from app.utils.timezone import tz_now

from app.database import get_db
from app.models.script import Script, ScriptChapter, ScriptNode, ScriptNpc, ScriptEnding, Task, ArResource
from app.models.village import Village
from app.dependencies import get_current_admin
from app.utils.response import ok, fail

router = APIRouter(prefix="/scripts", tags=["管理端-剧本"])


# ---- 剧本 ----

class ScriptBaseReq(BaseModel):
    villageId: int
    title: str
    type: str
    difficulty: int
    estimatedDuration: int
    coverImage: str | None = None
    storyline: str | None = None


class ScriptUpdateReq(BaseModel):
    villageId: int | None = None
    title: str | None = None
    type: str | None = None
    difficulty: int | None = None
    estimatedDuration: int | None = None
    coverImage: str | None = None
    storyline: str | None = None


@router.get("")
async def list_scripts(
    page: int = Query(1, ge=1), pageSize: int = Query(10, ge=1, le=1000),
    villageId: int = Query(None), type: str = Query(None),
    status: str = Query(None), keyword: str = Query(None),
    db: AsyncSession = Depends(get_db), admin=Depends(get_current_admin),
):
    q = select(Script)
    if villageId: q = q.where(Script.village_id == villageId)
    if type: q = q.where(Script.type == type)
    if status: q = q.where(Script.status == status)
    if keyword: q = q.where(Script.title.contains(keyword))

    count_q = select(func.count()).select_from(q.subquery())
    total = (await db.execute(count_q)).scalar()
    rows = (await db.execute(q.order_by(Script.updated_at.desc()).offset((page - 1) * pageSize).limit(pageSize))).scalars().all()

    return ok({
        "total": total, "page": page, "pageSize": pageSize,
        "list": [{
            "scriptId": str(s.id), "title": s.title, "coverImage": s.cover_image,
            "villageName": "", "type": s.type, "typeLabel": {"mystery": "悬疑解谜", "history": "历史文化", "family": "亲子探险"}.get(s.type, s.type),
            "difficulty": s.difficulty, "estimatedDuration": s.estimated_duration,
            "status": s.status, "rating": float(s.rating_avg), "experienceCount": s.experience_count,
            "chapterCount": len(s.chapters or []), "nodeCount": sum(len(ch.nodes or []) for ch in (s.chapters or [])),
            "updatedAt": s.updated_at.isoformat() if s.updated_at else None,
        } for s in rows]
    })


@router.get("/{script_id}")
async def get_script(script_id: int, db: AsyncSession = Depends(get_db), admin=Depends(get_current_admin)):
    s = (await db.execute(select(Script).where(Script.id == script_id))).scalar_one_or_none()
    if not s: return fail(2001, "剧本不存在")

    def _node_json(n):
        return {
            "nodeId": str(n.id), "title": n.title, "type": n.type,
            "sceneImage": n.scene_image, "sceneAudio": n.scene_audio,
            "triggerType": n.trigger_type, "triggerLat": n.trigger_lat,
            "triggerLng": n.trigger_lng, "triggerRadius": n.trigger_radius,
            "dialoguePrompt": n.dialogue_prompt, "npcId": str(n.npc_id) if n.npc_id else None,
            "config": n.config, "sortOrder": n.sort_order,
            "tasks": [_task_json(t) for t in (n.tasks or [])]
        }

    def _task_json(t):
        return {
            "taskId": str(t.id), "type": t.type, "title": t.title,
            "description": t.description, "answer": t.answer, "retryHint": t.retry_hint,
            "rewardItem": t.reward_item,
            "targetLat": t.target_lat, "targetLng": t.target_lng, "targetRadius": t.target_radius,
            "arResourceId": str(t.ar_resource_id) if t.ar_resource_id else None,
        }

    return ok({
        "scriptId": str(s.id), "villageId": str(s.village_id), "villageName": "",
        "title": s.title, "coverImage": s.cover_image, "type": s.type,
        "difficulty": s.difficulty, "estimatedDuration": s.estimated_duration,
        "storyline": s.storyline, "status": s.status,
        "chapters": [{
            "chapterId": str(ch.id), "title": ch.title, "sortOrder": ch.sort_order,
            "nodes": [_node_json(n) for n in (ch.nodes or [])]
        } for ch in (s.chapters or [])],
        "npcs": [{
            "npcId": str(n.id), "name": n.name, "avatar": n.avatar,
            "role": n.role, "age": n.age, "personality": n.personality,
            "description": n.description, "systemPrompt": n.system_prompt,
            "knowledgeBase": n.knowledge_base, "greeting": n.greeting,
        } for n in (s.npcs or [])],
        "endings": [{
            "endingId": str(e.id), "title": e.title, "description": e.description,
            "endingImage": e.ending_image, "conditionDesc": e.condition_desc,
        } for e in (s.endings or [])],
        "createdAt": s.created_at.isoformat() if s.created_at else None,
        "updatedAt": s.updated_at.isoformat() if s.updated_at else None,
    })


@router.post("")
async def create_script(req: ScriptBaseReq, db: AsyncSession = Depends(get_db), admin=Depends(get_current_admin)):
    v = (await db.execute(select(Village).where(Village.id == req.villageId))).scalar_one_or_none()
    if not v: return fail(2001, "所属乡村不存在")
    s = Script(village_id=req.villageId, title=req.title, cover_image=req.coverImage,
               type=req.type, difficulty=req.difficulty, estimated_duration=req.estimatedDuration,
               storyline=req.storyline)
    db.add(s)
    await db.flush()
    return ok({"scriptId": str(s.id)})


@router.put("/{script_id}")
async def update_script(script_id: int, req: ScriptUpdateReq, db: AsyncSession = Depends(get_db), admin=Depends(get_current_admin)):
    s = (await db.execute(select(Script).where(Script.id == script_id))).scalar_one_or_none()
    if not s: return fail(2001, "剧本不存在")
    for field, value in req.model_dump(exclude_none=True).items():
        db_field = {"villageId": "village_id", "coverImage": "cover_image", "estimatedDuration": "estimated_duration"}.get(field, field)
        setattr(s, db_field, value)
    return ok()


class ScriptStatusReq(BaseModel):
    status: str


@router.put("/{script_id}/status")
async def update_status(script_id: int, req: ScriptStatusReq, db: AsyncSession = Depends(get_db), admin=Depends(get_current_admin)):
    status = req.status
    s = (await db.execute(select(Script).where(Script.id == script_id))).scalar_one_or_none()
    if not s: return fail(2001, "剧本不存在")
    if status == "published":
        if not s.chapters: return fail(2003, "剧本至少需要一个章节")
        if not s.npcs: return fail(2003, "剧本至少需要一个NPC")
        s.published_at = tz_now()
    s.status = status
    return ok()


@router.delete("/{script_id}")
async def delete_script(script_id: int, db: AsyncSession = Depends(get_db), admin=Depends(get_current_admin)):
    s = (await db.execute(select(Script).where(Script.id == script_id))).scalar_one_or_none()
    if not s: return fail(2001, "剧本不存在")

    # 按 FK 依赖顺序逐层删除子记录（DB 未建 CASCADE 约束，需手动清理）
    from app.models.progress import ChatLog, ArPhoto, Rating, ScriptProgress
    for model in [ChatLog, ArPhoto, Rating, ScriptProgress, Task, ArResource, ScriptNode, ScriptChapter, ScriptNpc, ScriptEnding]:
        await db.execute(model.__table__.delete().where(model.script_id == script_id))

    await db.flush()
    # 子记录已全删，expire 已加载的 ORM 对象避免 StaleDataError
    db.expire_all()
    await db.delete(s)
    return ok()


# ---- 章节 ----

class ChapterReq(BaseModel):
    title: str
    sortOrder: int = 0


@router.get("/{script_id}/chapters")
async def list_chapters(script_id: int, db: AsyncSession = Depends(get_db), admin=Depends(get_current_admin)):
    rows = (await db.execute(select(ScriptChapter).where(ScriptChapter.script_id == script_id).order_by(ScriptChapter.sort_order))).scalars().all()
    return ok({"list": [{"chapterId": str(c.id), "title": c.title, "sortOrder": c.sort_order} for c in rows]})


@router.post("/{script_id}/chapters")
async def create_chapter(script_id: int, req: ChapterReq, db: AsyncSession = Depends(get_db), admin=Depends(get_current_admin)):
    ch = ScriptChapter(script_id=script_id, title=req.title, sort_order=req.sortOrder)
    db.add(ch)
    await db.flush()
    return ok({"chapterId": str(ch.id)})


@router.put("/{script_id}/chapters/{chapter_id}")
async def update_chapter(script_id: int, chapter_id: int, req: ChapterReq, db: AsyncSession = Depends(get_db), admin=Depends(get_current_admin)):
    ch = (await db.execute(select(ScriptChapter).where(ScriptChapter.id == chapter_id, ScriptChapter.script_id == script_id))).scalar_one_or_none()
    if not ch: return fail(2001, "章节不存在")
    ch.title = req.title; ch.sort_order = req.sortOrder
    return ok()


@router.delete("/{script_id}/chapters/{chapter_id}")
async def delete_chapter(script_id: int, chapter_id: int, db: AsyncSession = Depends(get_db), admin=Depends(get_current_admin)):
    ch = (await db.execute(select(ScriptChapter).where(ScriptChapter.id == chapter_id, ScriptChapter.script_id == script_id))).scalar_one_or_none()
    if not ch: return fail(2001, "章节不存在")
    await db.delete(ch)
    return ok()


# ---- 节点 ----

class NodeReq(BaseModel):
    title: str | None = None
    type: str | None = None
    chapterId: int | None = None
    sceneImage: str | None = None
    sceneAudio: str | None = None
    triggerType: str | None = None
    triggerLat: float | None = None
    triggerLng: float | None = None
    triggerRadius: int | None = None
    dialoguePrompt: str | None = None
    npcId: int | None = None
    config: dict | None = None
    sortOrder: int | None = None


@router.get("/{script_id}/nodes/{node_id}")
async def get_node(script_id: int, node_id: int, db: AsyncSession = Depends(get_db), admin=Depends(get_current_admin)):
    n = (await db.execute(select(ScriptNode).where(ScriptNode.id == node_id, ScriptNode.script_id == script_id))).scalar_one_or_none()
    if not n: return fail(2001, "节点不存在")
    return ok({
        "nodeId": str(n.id), "title": n.title, "type": n.type,
        "chapterId": str(n.chapter_id), "sceneImage": n.scene_image, "sceneAudio": n.scene_audio,
        "triggerType": n.trigger_type, "triggerLat": n.trigger_lat, "triggerLng": n.trigger_lng,
        "triggerRadius": n.trigger_radius, "dialoguePrompt": n.dialogue_prompt,
        "npcId": str(n.npc_id) if n.npc_id else None, "config": n.config, "sortOrder": n.sort_order,
    })


@router.post("/{script_id}/chapters/{chapter_id}/nodes")
async def create_node(script_id: int, chapter_id: int, req: NodeReq, db: AsyncSession = Depends(get_db), admin=Depends(get_current_admin)):
    if not req.title: return fail(4001, "title为必填字段")
    n = ScriptNode(script_id=script_id, chapter_id=chapter_id, title=req.title, type=req.type or "dialogue",
                   scene_image=req.sceneImage, scene_audio=req.sceneAudio,
                   trigger_type=req.triggerType, trigger_lat=req.triggerLat, trigger_lng=req.triggerLng,
                   trigger_radius=req.triggerRadius, dialogue_prompt=req.dialoguePrompt,
                   npc_id=req.npcId, config=req.config, sort_order=req.sortOrder)
    db.add(n)
    await db.flush()
    return ok({"nodeId": str(n.id)})


@router.put("/{script_id}/nodes/{node_id}")
async def update_node(script_id: int, node_id: int, req: NodeReq, db: AsyncSession = Depends(get_db), admin=Depends(get_current_admin)):
    from sqlalchemy.orm.attributes import flag_modified
    n = (await db.execute(select(ScriptNode).where(ScriptNode.id == node_id, ScriptNode.script_id == script_id))).scalar_one_or_none()
    if not n: return fail(2001, "节点不存在")
    mapping = {"sceneImage": "scene_image", "sceneAudio": "scene_audio", "triggerType": "trigger_type",
               "triggerLat": "trigger_lat", "triggerLng": "trigger_lng", "triggerRadius": "trigger_radius",
               "dialoguePrompt": "dialogue_prompt", "npcId": "npc_id", "sortOrder": "sort_order"}
    for field, value in req.model_dump(exclude_none=True).items():
        db_field = mapping.get(field, field)
        if field != "chapterId":
            setattr(n, db_field, value)
            if field == "config":
                flag_modified(n, "config")
    await db.flush()
    return ok()


@router.delete("/{script_id}/nodes/{node_id}")
async def delete_node(script_id: int, node_id: int, db: AsyncSession = Depends(get_db), admin=Depends(get_current_admin)):
    n = (await db.execute(select(ScriptNode).where(ScriptNode.id == node_id, ScriptNode.script_id == script_id))).scalar_one_or_none()
    if not n: return fail(2001, "节点不存在")
    await db.delete(n)
    return ok()


# ---- NPC ----

class NpcReq(BaseModel):
    name: str | None = None
    avatar: str | None = None
    role: str | None = None
    age: int | None = None
    personality: str | None = None
    description: str | None = None
    systemPrompt: str | None = None
    knowledgeBase: list | None = None
    greeting: str | None = None


@router.get("/{script_id}/npcs")
async def list_npcs(script_id: int, db: AsyncSession = Depends(get_db), admin=Depends(get_current_admin)):
    rows = (await db.execute(select(ScriptNpc).where(ScriptNpc.script_id == script_id))).scalars().all()
    return ok({"list": [{"npcId": str(n.id), "name": n.name, "avatar": n.avatar, "role": n.role,
                         "age": n.age, "personality": n.personality, "description": n.description,
                         "systemPrompt": n.system_prompt, "knowledgeBase": n.knowledge_base,
                         "greeting": n.greeting} for n in rows]})


@router.post("/{script_id}/npcs")
async def create_npc(script_id: int, req: NpcReq, db: AsyncSession = Depends(get_db), admin=Depends(get_current_admin)):
    if not req.name: return fail(4001, "name为必填字段")
    if not req.systemPrompt: return fail(4001, "systemPrompt为必填字段")
    n = ScriptNpc(script_id=script_id, name=req.name, avatar=req.avatar, role=req.role, age=req.age,
                  personality=req.personality, description=req.description,
                  system_prompt=req.systemPrompt, knowledge_base=req.knowledgeBase, greeting=req.greeting)
    db.add(n)
    await db.flush()
    return ok({"npcId": str(n.id)})


@router.put("/{script_id}/npcs/{npc_id}")
async def update_npc(script_id: int, npc_id: int, req: NpcReq, db: AsyncSession = Depends(get_db), admin=Depends(get_current_admin)):
    n = (await db.execute(select(ScriptNpc).where(ScriptNpc.id == npc_id, ScriptNpc.script_id == script_id))).scalar_one_or_none()
    if not n: return fail(2001, "NPC不存在")
    mapping = {"systemPrompt": "system_prompt", "knowledgeBase": "knowledge_base"}
    for field, value in req.model_dump(exclude_none=True).items():
        setattr(n, mapping.get(field, field), value)
    return ok()


@router.delete("/{script_id}/npcs/{npc_id}")
async def delete_npc(script_id: int, npc_id: int, db: AsyncSession = Depends(get_db), admin=Depends(get_current_admin)):
    n = (await db.execute(select(ScriptNpc).where(ScriptNpc.id == npc_id, ScriptNpc.script_id == script_id))).scalar_one_or_none()
    if not n: return fail(2001, "NPC不存在")
    await db.delete(n)
    return ok()


# ---- 结局 ----

class EndingReq(BaseModel):
    title: str | None = None
    description: str | None = None
    endingImage: str | None = None
    conditionDesc: str | None = None


@router.get("/{script_id}/endings")
async def list_endings(script_id: int, db: AsyncSession = Depends(get_db), admin=Depends(get_current_admin)):
    rows = (await db.execute(select(ScriptEnding).where(ScriptEnding.script_id == script_id))).scalars().all()
    return ok({"list": [{"endingId": str(e.id), "title": e.title, "description": e.description,
                         "endingImage": e.ending_image, "conditionDesc": e.condition_desc} for e in rows]})


@router.post("/{script_id}/endings")
async def create_ending(script_id: int, req: EndingReq, db: AsyncSession = Depends(get_db), admin=Depends(get_current_admin)):
    if not req.title: return fail(4001, "title为必填字段")
    e = ScriptEnding(script_id=script_id, title=req.title, description=req.description,
                     ending_image=req.endingImage, condition_desc=req.conditionDesc)
    db.add(e)
    await db.flush()
    return ok({"endingId": str(e.id)})


@router.put("/{script_id}/endings/{ending_id}")
async def update_ending(script_id: int, ending_id: int, req: EndingReq, db: AsyncSession = Depends(get_db), admin=Depends(get_current_admin)):
    e = (await db.execute(select(ScriptEnding).where(ScriptEnding.id == ending_id, ScriptEnding.script_id == script_id))).scalar_one_or_none()
    if not e: return fail(2001, "结局不存在")
    mapping = {"endingImage": "ending_image", "conditionDesc": "condition_desc"}
    for field, value in req.model_dump(exclude_none=True).items():
        setattr(e, mapping.get(field, field), value)
    return ok()


@router.delete("/{script_id}/endings/{ending_id}")
async def delete_ending(script_id: int, ending_id: int, db: AsyncSession = Depends(get_db), admin=Depends(get_current_admin)):
    e = (await db.execute(select(ScriptEnding).where(ScriptEnding.id == ending_id, ScriptEnding.script_id == script_id))).scalar_one_or_none()
    if not e: return fail(2001, "结局不存在")
    await db.delete(e)
    return ok()


# ---- 任务 ----

class TaskReq(BaseModel):
    type: str | None = None
    title: str | None = None
    description: str | None = None
    answer: str | None = None
    retryHint: str | None = None
    rewardItem: dict | None = None
    targetLat: float | None = None
    targetLng: float | None = None
    targetRadius: int = 30
    arResourceId: int | None = None
    sortOrder: int = 0


@router.get("/{script_id}/nodes/{node_id}/tasks")
async def list_tasks(script_id: int, node_id: int, db: AsyncSession = Depends(get_db), admin=Depends(get_current_admin)):
    rows = (await db.execute(select(Task).where(Task.node_id == node_id, Task.script_id == script_id).order_by(Task.sort_order))).scalars().all()
    return ok({"list": [{
        "taskId": str(t.id), "type": t.type, "title": t.title, "description": t.description,
        "answer": t.answer, "retryHint": t.retry_hint, "rewardItem": t.reward_item,
        "targetLat": t.target_lat, "targetLng": t.target_lng, "targetRadius": t.target_radius,
        "arResourceId": str(t.ar_resource_id) if t.ar_resource_id else None, "sortOrder": t.sort_order,
    } for t in rows]})


@router.post("/{script_id}/nodes/{node_id}/tasks")
async def create_task(script_id: int, node_id: int, req: TaskReq, db: AsyncSession = Depends(get_db), admin=Depends(get_current_admin)):
    if not req.type: return fail(4001, "type为必填字段")
    if not req.title: return fail(4001, "title为必填字段")
    t = Task(script_id=script_id, node_id=node_id, type=req.type, title=req.title,
             description=req.description, answer=req.answer, retry_hint=req.retryHint,
             reward_item=req.rewardItem, target_lat=req.targetLat, target_lng=req.targetLng,
             target_radius=req.targetRadius, ar_resource_id=req.arResourceId, sort_order=req.sortOrder)
    db.add(t)
    await db.flush()
    return ok({"taskId": str(t.id)})


@router.put("/{script_id}/tasks/{task_id}")
async def update_task(script_id: int, task_id: int, req: TaskReq, db: AsyncSession = Depends(get_db), admin=Depends(get_current_admin)):
    from sqlalchemy.orm.attributes import flag_modified
    t = (await db.execute(select(Task).where(Task.id == task_id, Task.script_id == script_id))).scalar_one_or_none()
    if not t: return fail(2001, "任务不存在")
    mapping = {"retryHint": "retry_hint", "rewardItem": "reward_item", "targetLat": "target_lat",
               "targetLng": "target_lng", "targetRadius": "target_radius", "arResourceId": "ar_resource_id", "sortOrder": "sort_order"}
    for field, value in req.model_dump(exclude_none=True).items():
        db_field = mapping.get(field, field)
        setattr(t, db_field, value)
        if db_field in ("reward_item",):
            flag_modified(t, db_field)
    await db.flush()
    return ok()


@router.delete("/{script_id}/tasks/{task_id}")
async def delete_task(script_id: int, task_id: int, db: AsyncSession = Depends(get_db), admin=Depends(get_current_admin)):
    t = (await db.execute(select(Task).where(Task.id == task_id, Task.script_id == script_id))).scalar_one_or_none()
    if not t: return fail(2001, "任务不存在")
    await db.delete(t)
    return ok()


# ---- AR 资源 ----

class ArResourceReq(BaseModel):
    nodeId: int
    type: str
    name: str
    markerUrl: str | None = None
    markerPreview: str | None = None
    modelUrl: str | None = None
    overlayContent: dict | None = None


@router.get("/{script_id}/ar-resources")
async def list_ar_resources(script_id: int, db: AsyncSession = Depends(get_db), admin=Depends(get_current_admin)):
    rows = (await db.execute(
        select(ArResource).where(ArResource.script_id == script_id).order_by(ArResource.created_at.desc())
    )).scalars().all()
    return ok({"list": [{
        "resourceId": str(r.id), "nodeId": str(r.node_id), "type": r.type, "name": r.name,
        "markerUrl": r.marker_url, "markerPreview": r.marker_preview or r.marker_url,
        "arucoId": r.aruco_id, "modelUrl": r.model_url,
        "overlayContent": r.overlay_content,
        "createdAt": r.created_at.isoformat() if r.created_at else None,
    } for r in rows]})


@router.post("/{script_id}/ar-resources")
async def create_ar_resource(script_id: int, req: ArResourceReq, db: AsyncSession = Depends(get_db), admin=Depends(get_current_admin)):
    r = ArResource(
        script_id=script_id, node_id=req.nodeId, type=req.type, name=req.name,
        marker_url=req.markerUrl, marker_preview=req.markerPreview,
        model_url=req.modelUrl,
        overlay_content=req.overlayContent,
    )
    db.add(r)
    await db.flush()
    if r.type == "npc_model":
        from app.utils.aruco_marker import generate_marker_url
        r.aruco_id = r.id % 50
        r.marker_url = generate_marker_url(r.id)
    return ok({"resourceId": str(r.id), "markerUrl": r.marker_url, "arucoId": r.aruco_id})


@router.put("/{script_id}/ar-resources/{resource_id}")
async def update_ar_resource(script_id: int, resource_id: int, req: ArResourceReq, db: AsyncSession = Depends(get_db), admin=Depends(get_current_admin)):
    r = (await db.execute(select(ArResource).where(ArResource.id == resource_id, ArResource.script_id == script_id))).scalar_one_or_none()
    if not r: return fail(2001, "AR资源不存在")
    mapping = {"nodeId": "node_id", "markerUrl": "marker_url", "markerPreview": "marker_preview",
               "modelUrl": "model_url", "overlayContent": "overlay_content"}
    for field, value in req.model_dump(exclude_none=True).items():
        setattr(r, mapping.get(field, field), value)
    if r.type == "npc_model" and not r.aruco_id:
        from app.utils.aruco_marker import generate_marker_url
        r.aruco_id = r.id % 50
        r.marker_url = generate_marker_url(r.id)
    return ok()


@router.delete("/{script_id}/ar-resources/{resource_id}")
async def delete_ar_resource(script_id: int, resource_id: int, db: AsyncSession = Depends(get_db), admin=Depends(get_current_admin)):
    r = (await db.execute(select(ArResource).where(ArResource.id == resource_id, ArResource.script_id == script_id))).scalar_one_or_none()
    if not r: return fail(2001, "AR资源不存在")
    await db.delete(r)
    return ok()
