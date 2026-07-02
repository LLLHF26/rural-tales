"""移动端 —— 用户认证"""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from redis.asyncio import Redis
from datetime import datetime, timezone

from app.database import get_db, get_redis
from sqlalchemy import select, func
from app.models.user import User
from app.models.script import Script, ScriptNode, ScriptChapter, ScriptEnding
from app.models.progress import ScriptProgress
from app.dependencies import get_current_user
from app.utils.security import hash_password, verify_password, create_token
from app.utils.response import ok, fail
from app.services.sms import send_verify_code, verify_code

router = APIRouter(prefix="/user", tags=["移动端-用户"])


class SendCodeReq(BaseModel):
    phone: str


class LoginReq(BaseModel):
    phone: str
    code: str


class PasswordLoginReq(BaseModel):
    phone: str
    password: str


class SetPasswordReq(BaseModel):
    phone: str
    code: str
    password: str


@router.post("/send-code")
async def send_code(req: SendCodeReq, redis: Redis | None = Depends(get_redis)):
    result = await send_verify_code(redis, req.phone)
    return ok({"expireSeconds": result["expireSeconds"]})


@router.post("/login")
async def login(req: LoginReq, db: AsyncSession = Depends(get_db), redis: Redis | None = Depends(get_redis)):
    if not await verify_code(redis, req.phone, req.code):
        return fail(1001, "验证码错误或已过期")

    result = await db.execute(select(User).where(User.phone == req.phone))
    user = result.scalar_one_or_none()
    is_new = False
    if user is None:
        user = User(phone=req.phone, password_hash=hash_password(req.phone),
                     nickname=f"游客{req.phone[-4:]}")
        db.add(user)
        await db.flush()
        is_new = True

    token = create_token({"user_id": user.id})
    return ok({
        "token": token, "expireAt": None,
        "user": {"userId": str(user.id), "nickname": user.nickname, "avatar": user.avatar,
                 "phone": f"{req.phone[:3]}****{req.phone[-4:]}", "isNewUser": is_new}
    })


@router.post("/login-password")
async def login_password(req: PasswordLoginReq, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.phone == req.phone))
    user = result.scalar_one_or_none()
    if not user or not verify_password(req.password, user.password_hash):
        return fail(1001, "账号或密码错误")
    token = create_token({"user_id": user.id})
    return ok({
        "token": token, "expireAt": None,
        "user": {"userId": str(user.id), "nickname": user.nickname, "avatar": user.avatar,
                 "phone": f"{req.phone[:3]}****{req.phone[-4:]}", "isNewUser": False}
    })


@router.post("/set-password")
async def set_password(req: SetPasswordReq, db: AsyncSession = Depends(get_db), redis: Redis | None = Depends(get_redis)):
    if not await verify_code(redis, req.phone, req.code):
        return fail(1001, "验证码错误或已过期")
    result = await db.execute(select(User).where(User.phone == req.phone))
    user = result.scalar_one_or_none()
    if not user:
        return fail(2001, "用户不存在")
    user.password_hash = hash_password(req.password)
    return ok()


@router.get("/profile")
async def get_profile(db: AsyncSession = Depends(get_db), user=Depends(get_current_user)):
    completed = (await db.execute(
        select(func.count()).select_from(ScriptProgress).where(
            ScriptProgress.user_id == user.id, ScriptProgress.status == "completed"
        )
    )).scalar()
    return ok({
        "userId": str(user.id), "nickname": user.nickname, "avatar": user.avatar,
        "phone": f"{user.phone[:3]}****{user.phone[-4:]}", "completedScriptCount": completed or 0,
        "createdAt": user.created_at.isoformat() if user.created_at else None,
    })


@router.get("/scripts")
async def get_my_scripts(
    status: str | None = Query(None),
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user),
):
    q = select(ScriptProgress).where(ScriptProgress.user_id == user.id)
    if status:
        q = q.where(ScriptProgress.status == status)
    q = q.order_by(ScriptProgress.updated_at.desc())
    progresses = (await db.execute(q)).scalars().all()

    script_ids = [p.script_id for p in progresses]
    list_data = []
    if script_ids:
        scripts_result = await db.execute(select(Script).where(Script.id.in_(script_ids)))
        scripts = {s.id: s for s in scripts_result.scalars().all()}

        node_counts = {}
        nodes_result = await db.execute(
            select(ScriptNode.script_id, func.count(ScriptNode.id))
            .where(ScriptNode.script_id.in_(script_ids))
            .group_by(ScriptNode.script_id)
        )
        for sid, cnt in nodes_result.all():
            node_counts[sid] = cnt

        # 批量查询当前节点和结局信息
        playing_node_ids = [p.current_node_id for p in progresses if p.status == "playing" and p.current_node_id]
        node_map = {}
        chapter_map = {}
        if playing_node_ids:
            nodes_result = await db.execute(select(ScriptNode).where(ScriptNode.id.in_(playing_node_ids)))
            for n in nodes_result.scalars().all():
                node_map[n.id] = n
            chapter_ids = list(set(n.chapter_id for n in node_map.values() if n.chapter_id))
            if chapter_ids:
                chapters_result = await db.execute(select(ScriptChapter).where(ScriptChapter.id.in_(chapter_ids)))
                chapter_map = {c.id: c for c in chapters_result.scalars().all()}
        completed_ending_ids = [p.completed_ending_id for p in progresses if p.status == "completed" and p.completed_ending_id]
        ending_map = {}
        if completed_ending_ids:
            endings_result = await db.execute(select(ScriptEnding).where(ScriptEnding.id.in_(completed_ending_ids)))
            ending_map = {e.id: e for e in endings_result.scalars().all()}

        # 已完成的但没有记录ending_id的，尝试找脚本的结局作为兜底
        completed_no_ending = [p.script_id for p in progresses if p.status == "completed" and not p.completed_ending_id]
        script_ending_map = {}
        if completed_no_ending:
            endings_result = await db.execute(
                select(ScriptEnding).where(ScriptEnding.script_id.in_(completed_no_ending))
            )
            for e in endings_result.scalars().all():
                if e.script_id not in script_ending_map:
                    script_ending_map[e.script_id] = e

        for p in progresses:
            script = scripts.get(p.script_id)
            if not script:
                continue
            completed = len(p.completed_node_ids) if p.completed_node_ids else 0
            total = node_counts.get(p.script_id, 0)
            progress_label = ""
            if p.status == "completed":
                e = ending_map.get(p.completed_ending_id) if p.completed_ending_id else None
                if not e:
                    e = script_ending_map.get(p.script_id)
                progress_label = f"已完成 · {e.title}" if e else "已完成"
            elif p.status == "playing" and p.current_node_id:
                n = node_map.get(p.current_node_id)
                if n:
                    ch = chapter_map.get(n.chapter_id) if n.chapter_id else None
                    ch_title = ch.title if ch else ""
                    progress_label = f"{ch_title} · {n.title}" if ch_title else n.title
                else:
                    progress_label = "进行中"
            elif p.status == "playing":
                progress_label = "进行中"
            list_data.append({
                "progressId": str(p.id),
                "title": script.title,
                "coverImage": script.cover_image,
                "completedNodeCount": completed,
                "totalNodeCount": total,
                "status": p.status,
                "progressLabel": progress_label,
            })

    return ok({"list": list_data})


class UpdateProfileReq(BaseModel):
    nickname: str | None = None
    avatar: str | None = None


@router.put("/profile")
async def update_profile(req: UpdateProfileReq, db: AsyncSession = Depends(get_db), user=Depends(get_current_user)):
    if req.nickname is not None:
        user.nickname = req.nickname
    if req.avatar is not None:
        user.avatar = req.avatar
    return ok()
