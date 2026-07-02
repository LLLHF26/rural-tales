"""AI 剧本生成服务 —— DeepSeek v4-pro"""

import asyncio
import json
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
import httpx

from app.config import settings
from app.models.village import Village


def _progress(step: int, message: str) -> str:
    return f"event: progress\ndata: {json.dumps({'step': step, 'message': message}, ensure_ascii=False)}\n\n"


def build_script_generation_prompt(village: Village, script_type: str, difficulty: int, duration: int, extra: str = "") -> str:
    """组装剧本生成的 prompt，要求严格基于村庄真实数据"""
    difficulty_labels = {1: "入门", 2: "简单", 3: "中等", 4: "困难", 5: "挑战"}
    type_labels = {"mystery": "悬疑解谜", "history": "历史文化", "family": "亲子探险"}
    type_label = type_labels.get(script_type, script_type)
    diff_label = difficulty_labels.get(difficulty, str(difficulty))
    tags_text = "、".join(village.tags) if village.tags else "暂无"

    cultures_text = ""
    if village.cultures:
        for c in village.cultures:
            type_names = {"history": "历史", "intangible": "非遗", "legend": "传说"}
            ct = type_names.get(c.type, c.type)
            cultures_text += f"- 【{ct}】{c.title}：{c.content}\n"
    else:
        cultures_text = "（暂无文化素材，请根据乡村基本信息进行合理创作）\n"

    spots_text = ""
    spots_coords = ""
    if village.spots:
        for i, s in enumerate(village.spots):
            spots_text += f"- 地点{i+1}：{s.name}（经度{s.lng}，纬度{s.lat}）\n  描述：{s.description or '暂无描述'}\n"
            spots_coords += f"  {s.name}: [{s.lng}, {s.lat}]\n"
    else:
        spots_text = "（暂无实景地点数据）\n"
        spots_coords = "（无）\n"

    extra_section = f"\n【补充需求】\n{extra}" if extra else ""

    return f"""你是一位专业的沉浸式文旅剧本策划师。你必须严格基于下方提供的「{village.name}」真实数据来创作剧本，不允许编造不存在的文化元素或地点。

══════════════════════════════════
【乡村基本信息】—— 必须融入剧本世界观
══════════════════════════════════
- 村庄名称：{village.name}
- 村庄简介：{village.description or '暂无'}
- 地址：{village.address or '暂无'}
- 特色标签：{tags_text}

══════════════════════════════════
【文化素材】—— 必须作为剧情背景、任务谜题、NPC对白的内容来源
══════════════════════════════════
{cultures_text}

══════════════════════════════════
【实景打卡点及真实GPS坐标】—— GPS触发节点和定位任务必须使用这些坐标
══════════════════════════════════
{spots_text}

【可用坐标速查表】
{spots_coords}
══════════════════════════════════
【剧本参数】
══════════════════════════════════
- 类型：{type_label}
- 难度：{diff_label}（共5档：入门/简单/中等/困难/挑战）
- 预计时长：{duration} 分钟
{extra_section}
══════════════════════════════════
【强制规则 —— 违反将导致生成失败】
══════════════════════════════════
1. 所有GPS坐标（triggerLat/triggerLng、targetLat/targetLng）必须从上方的「可用坐标速查表」中选取，禁止编造坐标
2. 每个章节至少引用1个上述实景打卡点作为舞台，节点标题和dialoguePrompt中要出现该地点的真实名称
3. 任务内容（puzzle谜题、剧情对白）必须融入上述文化素材中的具体故事/技艺/传说
4. NPC角色必须与村庄历史或文化素材直接相关（如：非遗传承人、历史事件的见证者、传说人物的后代等）
5. 故事主线（storyline）中要出现村庄真实名称「{village.name}」及至少2个打卡点名称
6. dialoguePrompt必须描述对应打卡点的真实场景特征，而非泛泛的"树林""小路"
7. 直接输出JSON，不要输出markdown代码块```

以下为输出JSON结构：

{{
  "title": "剧本标题（格式：《XXXX》或《{village.name}·XXXX》）",
  "storyline": "故事主线描述，150-300字，必须提及村庄名称和至少2个打卡点",
  "chapters": [
    {{
      "title": "第X章 · 章节名",
      "sortOrder": 1,
      "nodes": [
        {{
          "title": "节点标题（建议包含打卡点名称）",
          "type": "dialogue/task_hub/ending",
          "triggerType": "gps/auto/manual",
          "triggerLat": 使用上方坐标速查表中的纬度,
          "triggerLng": 使用上方坐标速查表中的经度,
          "triggerRadius": 50,
          "dialoguePrompt": "场景描述+AI开场指引（80-150字）",
          "npcName": "对话的NPC姓名（dialogue/task_hub类型必填，必须与上方NPC列表中某位NPC的name完全一致）",
          "config": {{
            "nextNodes": ["下一节点的标题"],
            "hasBranch": true,
            "branchPrompt": "分支选择提示，引导玩家做出选择（30-60字）",
            "branchOptions": [
              {{"id": "branch_1", "label": "选项一文本", "nextNodeId": "目标节点的标题"}},
              {{"id": "branch_2", "label": "选项二文本", "nextNodeId": "目标节点的标题"}}
            ]
          }},
          "tasks": [
            {{
              "type": "gps_checkin/puzzle/photo/choice/ar_scan",
              "title": "任务标题",
              "description": "任务描述，融入文化素材",
              "answer": "答案",
              "retryHint": "答错提示",
              "targetLat": 使用上方坐标速查表中的纬度,
              "targetLng": 使用上方坐标速查表中的经度,
              "targetRadius": 30,
              "rewardItem": {{"itemId": "", "name": "", "icon": "", "description": "", "type": "clue/key/tool"}}
            }}
          ]
        }}
      ]
    }}
  ],
  "npcs": [
    {{
      "name": "NPC姓名（中式姓名）",
      "role": "引导者/伙伴/关键人物",
      "age": 65,
      "personality": "性格描述",
      "appearance": "外貌描述，50字以内",
      "gender": "male/female",
      "description": "角色背景，需与村庄文化相关",
      "systemPrompt": "完整的AI对话system prompt，150-250字",
      "greeting": "首次对话开场白",
      "knowledgeBase": [
        {{"topic": "知识点主题（如：村中古井的传说）", "content": "知识点详细内容（80-200字）", "unlockCondition": "解锁条件（如：npc_relation>=30 或 node_completed:章节号）"}}
      ]
    }}
  ],
  "endings": [
    {{
      "title": "结局标题",
      "description": "结局描述（80-150字）",
      "conditionDesc": "达成条件"
    }}
  ]
}}

最终要求：
- 章节4-6个，每个章节3-5个节点
- 至少3个节点启用分支（hasBranch: true），分支选项2-3个
- config中nextNodeId和nextNodes[]均填写目标节点的标题（导入时会自动转换为真实ID）
- 至少3个不同结局
- 任务8-12个，每个任务必须关联一个文化素材或打卡点
- NPC至少3个（含引导者），必须与村庄文化背景相关
- 每个NPC至少2条knowledgeBase，内容必须来自上方文化素材中的具体故事/技艺/传说，unlockCondition要具体（如"npc_relation>=40"或"node_completed:2"）
- 所有GPS坐标100%来自上方坐标速查表
- 非分支节点可以将hasBranch设为false，branchOptions留空"""


async def stream_script_generation(
    db: AsyncSession,
    village_id: int,
    script_type: str,
    difficulty: int,
    duration: int,
    extra: str = "",
) -> AsyncGenerator[str, None]:
    """流式生成剧本 —— SSE 格式，步骤随实际进度平滑推进"""
    # ── Step 1: 加载乡村数据 ──
    yield _progress(1, "正在分析乡村文化素材……")

    village_result = await db.execute(
        select(Village)
        .where(Village.id == village_id)
        .options(selectinload(Village.spots), selectinload(Village.cultures))
    )
    village = village_result.scalar_one_or_none()
    if not village:
        yield f"event: error\ndata: {json.dumps({'message': '乡村不存在'}, ensure_ascii=False)}\n\n"
        return

    prompt = build_script_generation_prompt(village, script_type, difficulty, duration, extra)
    await asyncio.sleep(0.6)

    # ── Step 2: 构建故事框架 ──
    yield _progress(2, f"已解析「{village.name}」的文化背景，正在构建故事框架……")
    await asyncio.sleep(0.5)

    # ── Step 3: 连接AI ──
    yield _progress(3, "正在连接AI大模型，请耐心等待……")

    try:
        async with httpx.AsyncClient(timeout=180) as client:
            async with client.stream(
                "POST",
                f"{settings.SCRIPT_LLM_BASE_URL}/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {settings.SCRIPT_LLM_API_KEY}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": settings.SCRIPT_LLM_MODEL,
                    "messages": [{"role": "user", "content": prompt}],
                    "max_tokens": settings.SCRIPT_LLM_MAX_TOKENS,
                    "temperature": settings.SCRIPT_LLM_TEMPERATURE,
                    "stream": True,
                },
            ) as response:
                if response.status_code != 200:
                    try:
                        error_body = await response.aread()
                        error_msg = f"AI API返回错误 ({response.status_code})"
                        try:
                            err_json = json.loads(error_body)
                            if "error" in err_json:
                                error_msg = err_json["error"].get("message", error_msg)
                        except Exception:
                            pass
                    except Exception:
                        error_msg = f"AI API返回错误 ({response.status_code})"
                    yield f"event: error\ndata: {json.dumps({'message': error_msg}, ensure_ascii=False)}\n\n"
                    return

                full_text = ""
                reasoning = False
                step_emitted = 3  # track which step we last emitted
                async for line in response.aiter_lines():
                    if line.startswith("data: "):
                        data_str = line[6:]
                        if data_str == "[DONE]":
                            break
                        try:
                            chunk = json.loads(data_str)
                            delta = chunk.get("choices", [{}])[0].get("delta", {})
                            content = delta.get("content", "")
                            reasoning_content = delta.get("reasoning_content", "")

                            # ── Step 4: 推理开始 ──
                            if reasoning_content and step_emitted < 4:
                                reasoning = True
                                step_emitted = 4
                                yield _progress(4, "AI正在深度思考剧情设计……")

                            if content:
                                full_text += content

                                # ── Step 4→5: 推理结束，内容开始生成 ──
                                if step_emitted <= 4:
                                    if reasoning:
                                        step_emitted = 5
                                        yield _progress(5, "思考完成，正在生成剧本内容……")
                                    elif step_emitted == 3:
                                        step_emitted = 4
                                        yield _progress(4, "开始生成剧本内容……")
                                    reasoning = False

                                # ── Step 5→6: 内容过半 ──
                                if step_emitted == 5 and len(full_text) > 2500:
                                    step_emitted = 6
                                    yield _progress(6, f"已生成 {len(full_text)} 字符，正在编排任务与结局……")

                                # ── Step 6: 收尾进度更新 ──
                                if step_emitted == 6 and len(full_text) > 6000:
                                    yield _progress(6, f"已生成 {len(full_text)} 字符，即将完成……")

                        except json.JSONDecodeError:
                            continue

                # 提取 JSON
                json_start = full_text.find("{")
                json_end = full_text.rfind("}") + 1
                if json_start >= 0 and json_end > json_start:
                    json_str = full_text[json_start:json_end]
                    try:
                        result = json.loads(json_str)
                        result['chapterCount'] = len(result.get('chapters', []))
                        result['npcCount'] = len(result.get('npcs', []))
                        result['endingCount'] = len(result.get('endings', []))
                        result['villageName'] = village.name
                        result['villageId'] = village_id
                        result['type'] = script_type
                        result['difficulty'] = difficulty
                        result['estimatedDuration'] = duration
                        yield f"event: result\ndata: {json.dumps(result, ensure_ascii=False)}\n\n"
                    except json.JSONDecodeError:
                        yield f"event: error\ndata: {json.dumps({'message': 'AI返回的JSON格式有误，请重试'}, ensure_ascii=False)}\n\n"
                        return
                else:
                    yield f"event: error\ndata: {json.dumps({'message': 'AI未返回有效的JSON结果'}, ensure_ascii=False)}\n\n"
                    return

        yield f"event: done\ndata: {json.dumps({'message': '剧本框架生成完毕，请在编辑器中审核修改'}, ensure_ascii=False)}\n\n"

    except Exception as e:
        yield f"event: error\ndata: {json.dumps({'message': f'AI服务异常: {str(e)}'}, ensure_ascii=False)}\n\n"
