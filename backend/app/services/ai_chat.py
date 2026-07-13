"""AI NPC 对话服务 —— DeepSeek v4-flash 非思考模式"""

import re
import json
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import httpx

from app.config import settings
from app.models.script import ScriptNpc, ScriptNode, Script, Task
from app.models.progress import ScriptProgress, ChatLog


def build_npc_system_prompt(npc: ScriptNpc, node: ScriptNode | None, progress: ScriptProgress) -> str:
    """组装 NPC 对话的 system prompt"""
    prompt = npc.system_prompt

    # 对话风格指导
    prompt += ("\n\n【你的说话风格】："
               "\n- 用口语化的语言，像真人一样说话，不要显得像AI或机器人"
               "\n- 适当使用语气词（呢、啊、吧、嘛），让对话更生动自然"
               "\n- 根据你的角色身份调整说话方式，村长就庄重些，年轻人就活泼些"
               "\n- 每次回复保持在2-4句话，不要太长，像真实聊天一样"
               "\n- 适当反问游客，引导对话继续，不要一个人说个不停")

    if node and node.dialogue_prompt:
        prompt += f"\n\n【当前场景】：{node.dialogue_prompt}"

    if node and node.title:
        prompt += f"\n【当前剧情阶段】：{node.title}"

    # 双角色模式：旁白 vs NPC
    prompt += ("\n\n【双角色模式】："
               "\n- 当游客直接和你说话（如'你好''你是谁''这里有什么'）→ 你作为NPC角色回答"
               "\n- 当游客描述自己的行动（如'探索周围''四处看看''走向前方''观察环境'）→ 用 [旁白] 开头，以第三人称叙述发生了什么"
               "\n- [旁白]模式示例：'[旁白] 你沿着青石板路向前走去，两旁是斑驳的老墙。忽然一只花猫从墙头跃下，消失在拐角处。'"
               "\n- 旁白要生动有画面感，像小说描写一样，80字左右即可")

    # 当前场景中可用的任务
    if node and node.tasks:
        task_list = []
        for t in node.tasks:
            if str(t.id) not in (progress.completed_task_ids or []):
                task_info = f"- 任务ID={t.id}：{t.title}（{t.description or '无描述'}），类型：{t.type}"
                if t.type == 'gps_checkin':
                    task_info += "，需要游客前往指定地点"
                elif t.type == 'puzzle':
                    task_info += "，需要游客解开谜题"
                elif t.type == 'ar_scan':
                    task_info += "，需要游客用AR扫描标记图"
                elif t.type == 'photo':
                    task_info += "，需要游客拍照记录"
                task_list.append(task_info)
        if task_list:
            prompt += "\n【当前可引导的任务】：\n" + "\n".join(task_list)
            prompt += ("\n\n⚠️ 任务触发规则（重要！）："
                      "\n- 当游客表达了想要做某件事的意愿时（如'我想去…''我来扫描…''我准备好…''我试试…''带我去…'），你必须在回复末尾加上 [TASK:任务ID]"
                      "\n- 当对话内容已经自然指向某个任务时（如游客问路对应GPS任务、游客想解谜对应puzzle任务），也要触发"
                      "\n- 格式示例：[TASK:1] （必须是上方列表中的任务ID数字）"
                      "\n- 每个回复最多触发一个任务"
                      "\n- 闲聊、打招呼、了解背景故事时不要触发，正常交流即可"
                      "\n- 你应该主动引导游客去完成任务，比如提到'你可以去祠堂看看'或'要不试试解这个谜题'，让游客产生意愿后自然触发")

    # 当前节点的分支选项
    if node and node.config and node.config.get("hasBranch"):
        branches = node.config.get("branchOptions", [])
        if branches:
            branch_list = []
            for b in branches:
                branch_list.append(f"- 选项ID={b.get('id')}：{b.get('label')}")
            prompt += "\n【当前可用的剧情分支】：\n" + "\n".join(branch_list)
            # 检查是否所有任务已完成
            all_tasks_done = False
            if node.tasks and progress.completed_task_ids:
                all_tasks_done = all(
                    str(t.id) in progress.completed_task_ids
                    for t in node.tasks
                )
            if all_tasks_done:
                prompt += ("\n\n🔀 分支选择规则（重要！当前所有任务已完成，你必须立即引导游客做出选择）："
                          "\n- 在本次回复末尾必须加上 [CHOICE:选项ID]"
                          "\n- 用自然的语言向游客介绍所有可选的选项，然后让游客做出决定")
            else:
                prompt += ("\n\n🔀 分支选择规则："
                          "\n- 当所有任务完成后，引导游客在以上分支中做出选择"
                          "\n- 当游客明确表达了选择某个分支的意愿时，你必须在回复末尾加上 [CHOICE:选项ID]")
            prompt += ("\n- 格式示例：[CHOICE:a1] （必须是上方列表中的选项ID）"
                      "\n- 每个回复最多触发一个分支选择")

    unlocked_clues = []
    if progress.items:
        for item in progress.items:
            unlocked_clues.append(item.get("name", ""))
    if unlocked_clues:
        prompt += f"\n【游客已解锁线索】：{', '.join(unlocked_clues)}"

    completed_tasks = progress.completed_task_ids or []
    if completed_tasks:
        prompt += f"\n【游客已完成任务数】：{len(completed_tasks)}个"

    return prompt


def build_hint(node: ScriptNode | None, progress: ScriptProgress, triggered_tasks: list) -> str:
    """根据当前场景生成下一步行动提示"""
    hints = []

    # 有任务刚被触发
    if triggered_tasks:
        task_names = [t['title'] for t in triggered_tasks]
        hints.append(f"你可以尝试完成「{'、'.join(task_names)}」")

    # 当前节点还有未触发的任务
    if node and node.tasks:
        pending = [t for t in node.tasks if str(t.id) not in (progress.completed_task_ids or [])]
        already_triggered = [t['taskId'] for t in triggered_tasks]
        still_pending = [t for t in pending if str(t.id) not in already_triggered]
        if still_pending:
            t = still_pending[0]
            if t.type == 'gps_checkin':
                hints.append(f"对NPC说'我想去{t.title}'或'能告诉我怎么走吗'来触发任务")
            elif t.type == 'puzzle':
                hints.append(f"对NPC说'我准备好接受{t.title}的挑战了'来触发任务")
            elif t.type == 'ar_scan':
                hints.append(f"对NPC说'我来扫描{t.title}'来触发AR任务")
            else:
                hints.append(f"对NPC说'我想尝试{t.title}'来触发任务")

    # 节点有分支选项
    if node and node.config and node.config.get("hasBranch"):
        hints.append("你需要做出选择来推动剧情发展")

    # 通用提示
    if not hints:
        hints.append("继续探索周围环境，与NPC交流获取线索")

    hints.append("输入你想说的话或行动来推进剧情")
    return "；".join(hints)


async def get_recent_chat_history(
    db: AsyncSession, progress_id: int, npc_id: int, rounds: int = None
) -> list[dict]:
    """获取最近的对话历史"""
    if rounds is None:
        rounds = settings.CHAT_CONTEXT_ROUNDS
    result = await db.execute(
        select(ChatLog)
        .where(ChatLog.progress_id == progress_id, ChatLog.npc_id == npc_id)
        .order_by(ChatLog.created_at.desc())
        .limit(rounds * 2)
    )
    logs = result.scalars().all()
    history = []
    for log in reversed(logs):
        history.append({"role": log.role, "content": log.content})
    return history


async def stream_npc_chat(
    db: AsyncSession,
    progress_id: int,
    npc_id: int,
    user_message: str,
    node_id: int,
) -> AsyncGenerator[str, None]:
    """流式 NPC 对话 —— SSE 格式"""
    npc_result = await db.execute(select(ScriptNpc).where(ScriptNpc.id == npc_id))
    npc = npc_result.scalar_one_or_none()
    if not npc:
        yield f"event: error\ndata: {json.dumps({'message': 'NPC不存在'}, ensure_ascii=False)}\n\n"
        return

    node = None
    if node_id:
        node_result = await db.execute(select(ScriptNode).where(ScriptNode.id == node_id))
        node = node_result.scalar_one_or_none()

    progress_result = await db.execute(select(ScriptProgress).where(ScriptProgress.id == progress_id))
    progress = progress_result.scalar_one_or_none()
    if not progress:
        yield f"event: error\ndata: {json.dumps({'message': '进度不存在'})}\n\n"
        return

    system_prompt = build_npc_system_prompt(npc, node, progress)
    history = await get_recent_chat_history(db, progress_id, npc_id)

    messages = [{"role": "system", "content": system_prompt}]
    messages.extend(history)
    messages.append({"role": "user", "content": user_message})

    # 保存用户消息（系统通知不保存，避免污染聊天记录）
    if not user_message.startswith("[系统通知]"):
        db.add(ChatLog(
            user_id=progress.user_id, script_id=progress.script_id,
            progress_id=progress_id, npc_id=npc_id, node_id=node_id,
            role="user", content=user_message,
        ))
    await db.commit()

    extra_body = {}
    if not settings.CHAT_LLM_ENABLE_THINKING:
        extra_body = {"thinking": {"type": "disabled"}}

    full_reply = ""
    try:
        async with httpx.AsyncClient(timeout=60) as client:
            async with client.stream(
                "POST",
                f"{settings.CHAT_LLM_BASE_URL}/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {settings.CHAT_LLM_API_KEY}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": settings.CHAT_LLM_MODEL,
                    "messages": messages,
                    "max_tokens": settings.CHAT_LLM_MAX_TOKENS,
                    "temperature": settings.CHAT_LLM_TEMPERATURE,
                    "stream": True,
                    **extra_body,
                },
            ) as response:
                async for line in response.aiter_lines():
                    if line.startswith("data: "):
                        data_str = line[6:]
                        if data_str == "[DONE]":
                            break
                        try:
                            chunk = json.loads(data_str)
                            delta = chunk.get("choices", [{}])[0].get("delta", {})
                            content = delta.get("content", "")
                            if content:
                                full_reply += content
                                yield f"event: message\ndata: {json.dumps({'text': content}, ensure_ascii=False)}\n\n"
                        except json.JSONDecodeError:
                            continue

        # 检测 AI 回复中的任务触发标记（兼容半角:和全角：，可选空格）
        triggered_tasks = []
        clean_reply = full_reply
        task_pattern = re.compile(r'\[TASK[：:\s]*(\d+)\]')
        for match in task_pattern.finditer(full_reply):
            task_id = int(match.group(1))
            if task_id not in [t['taskId'] for t in triggered_tasks]:
                task = (await db.execute(select(Task).where(Task.id == task_id))).scalar_one_or_none()
                if task and str(task_id) not in (progress.completed_task_ids or []):
                    triggered_tasks.append({
                        "taskId": str(task.id),
                        "type": task.type,
                        "title": task.title,
                        "description": task.description or "",
                    })
        clean_reply = task_pattern.sub('', clean_reply).strip()
        # 清理 AI 可能输出的各种不完整标记（无ID或ID不合法）
        clean_reply = re.sub(r'\[TASK[：:\s]*[^\]]*\]', '', clean_reply).strip()

        # ---- 后端自动任务触发（不依赖 AI 输出 [TASK:N]）----
        if node and node.tasks and not triggered_tasks:
            completed_ids = set(progress.completed_task_ids or [])
            pending_tasks = [t for t in node.tasks if str(t.id) not in completed_ids]
            user_lower = user_message.lower()
            # 关键词 → 任务类型/标题匹配
            keyword_task_map = {
                'gps_checkin': ['去', '走', '出发', '前往', '带路', '怎么走', '在哪', '哪里', '位置', '签到', '到达'],
                'puzzle': ['谜题', '密码', '解谜', '答案', '线索', '暗语', '族谱', '破译', '试试', '挑战'],
                'ar_scan': ['扫描', '扫码', 'ar', 'AR', '拍照识别', '牌匾'],
                'photo': ['拍照', '合影', '照片', '拍一张'],
                'choice': ['选择', '决定', '我选', '我要'],
            }
            for task in pending_tasks:
                matched = False
                # 按任务类型匹配关键词
                type_keywords = keyword_task_map.get(task.type, [])
                if any(kw in user_lower for kw in type_keywords):
                    matched = True
                # 按任务标题匹配（用户提到了任务名）
                if task.title and len(task.title) >= 2:
                    title_chars = set(task.title)
                    overlap = sum(1 for c in user_message if c in title_chars)
                    if overlap >= 2 and overlap / len(task.title) >= 0.4:
                        matched = True
                if matched:
                    triggered_tasks.append({
                        "taskId": str(task.id),
                        "type": task.type,
                        "title": task.title,
                        "description": task.description or "",
                    })
                    break  # 每次最多触发一个任务

        # 检测 AI 回复中的分支选择触发标记
        triggered_choices = []
        choice_pattern = re.compile(r'\[CHOICE[：:\s]*([^\]]+)\]')
        for match in choice_pattern.finditer(full_reply):
            choice_id = match.group(1).strip()
            if node and node.config and node.config.get("hasBranch"):
                branches = node.config.get("branchOptions", [])
                chosen = next((b for b in branches if str(b.get("id")) == choice_id), None)
                if chosen and choice_id not in [c['id'] for c in triggered_choices]:
                    triggered_choices.append({
                        "id": chosen.get("id"),
                        "label": chosen.get("label"),
                    })
        clean_reply = choice_pattern.sub('', clean_reply).strip()
        clean_reply = re.sub(r'\[CHOICE[：:\s]*[^\]]*\]', '', clean_reply).strip()

        # 发送任务事件
        for t in triggered_tasks:
            yield f"event: task\ndata: {json.dumps(t, ensure_ascii=False)}\n\n"

        # 发送分支选项事件
        for c in triggered_choices:
            yield f"event: choice\ndata: {json.dumps(c, ensure_ascii=False)}\n\n"

        hint = build_hint(node, progress, triggered_tasks)
        yield f"event: done\ndata: {json.dumps({'newClues': [], 'hint': hint}, ensure_ascii=False)}\n\n"

    except Exception as e:
        yield f"event: error\ndata: {json.dumps({'message': f'AI服务异常: {str(e)}'}, ensure_ascii=False)}\n\n"
        clean_reply = full_reply or "抱歉，我一时不知该说什么……"

    # 保存 NPC 回复（去除任务标记后的干净文本）
    if clean_reply:
        db.add(ChatLog(
            user_id=progress.user_id, script_id=progress.script_id,
            progress_id=progress_id, npc_id=npc_id, node_id=node_id,
            role="npc", content=clean_reply,
        ))
