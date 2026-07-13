"""AI 服务层单元测试 —— 剧本生成 & NPC对话 & 图片生成"""
import json
import pytest
from unittest.mock import AsyncMock, MagicMock, patch


def _make_httpx_mock():
    """创建正确配置的 httpx.AsyncClient mock"""
    mock = MagicMock()
    mock.__aenter__ = AsyncMock(return_value=mock)
    mock.__aexit__ = AsyncMock(return_value=None)
    return mock


class _AsyncIter:
    """将普通 list 包装为异步迭代器"""
    def __init__(self, items):
        self._items = iter(items)
    def __aiter__(self):
        return self
    async def __anext__(self):
        try:
            return next(self._items)
        except StopIteration:
            raise StopAsyncIteration


def _mock_stream_response(lines: list[str]) -> MagicMock:
    """创建模拟的 SSE 流响应，aiter_lines() 返回可 async for 的迭代器"""
    resp = MagicMock()
    resp.aiter_lines = MagicMock(return_value=_AsyncIter(lines))
    return resp


# ======================== 剧本 Prompt 构建 ========================

class TestBuildScriptPrompt:
    def test_prompt_contains_village_info(self):
        from app.services.ai_script import build_script_generation_prompt
        from app.models.village import Village

        v = Village(id=1, name="古樟村", description="一个古老村落", lat=30.0, lng=120.0, address="浙江某地")
        v.cultures = []
        v.spots = []

        prompt = build_script_generation_prompt(v, "mystery", 3, 60)

        assert "古樟村" in prompt
        assert "古老村落" in prompt
        assert "浙江某地" in prompt
        assert "悬疑解谜" in prompt
        assert "60 分钟" in prompt
        assert "3/5" in prompt

    def test_prompt_contains_cultures(self):
        from app.services.ai_script import build_script_generation_prompt
        from app.models.village import Village, VillageCulture

        v = Village(id=1, name="古村", description="", lat=30.0, lng=120.0, address="")
        v.cultures = [
            VillageCulture(id=1, village_id=1, type="history", title="千年古樟", content="村口有一棵千年古樟树"),
            VillageCulture(id=2, village_id=1, type="legend", title="龙井传说", content="古井中有龙栖息"),
        ]
        v.spots = []

        prompt = build_script_generation_prompt(v, "history", 3, 60)
        assert "千年古樟" in prompt
        assert "村口有一棵千年古樟树" in prompt
        assert "龙井传说" in prompt

    def test_prompt_contains_spots_with_coords(self):
        from app.services.ai_script import build_script_generation_prompt
        from app.models.village import Village, VillageSpot

        v = Village(id=1, name="古村", description="", lat=30.0, lng=120.0, address="")
        v.cultures = []
        v.spots = [VillageSpot(id=1, village_id=1, name="古井", lat=30.1234, lng=120.5678, description="一口古井")]

        prompt = build_script_generation_prompt(v, "mystery", 3, 60)
        assert "古井" in prompt
        assert "30.1234" in prompt
        assert "120.5678" in prompt

    def test_prompt_includes_extra_requirement(self):
        from app.services.ai_script import build_script_generation_prompt
        from app.models.village import Village

        v = Village(id=1, name="古村", description="", lat=30.0, lng=120.0, address="")
        v.cultures = []
        v.spots = []

        prompt = build_script_generation_prompt(v, "family", 2, 30, extra="适合5岁儿童")
        assert "适合5岁儿童" in prompt
        assert "亲子探险" in prompt

    def test_prompt_contains_json_schema(self):
        from app.services.ai_script import build_script_generation_prompt
        from app.models.village import Village

        v = Village(id=1, name="古村", description="", lat=30.0, lng=120.0, address="")
        v.cultures = []
        v.spots = []

        prompt = build_script_generation_prompt(v, "mystery", 3, 60)
        assert '"title"' in prompt
        assert '"chapters"' in prompt
        assert '"npcs"' in prompt
        assert '"endings"' in prompt
        assert 'JSON' in prompt


# ======================== 剧本 SSE 流式生成 ========================

class TestStreamScriptGeneration:
    async def test_village_not_found(self):
        from app.services.ai_script import stream_script_generation

        mock_db = MagicMock()
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = None
        mock_db.execute = AsyncMock(return_value=mock_result)

        events = []
        async for chunk in stream_script_generation(mock_db, 999, "mystery", 3, 60):
            events.append(chunk)

        assert len(events) == 1
        assert "event: error" in events[0]
        assert "乡村不存在" in events[0]

    async def test_progress_events_then_result(self):
        from app.services.ai_script import stream_script_generation
        from app.models.village import Village

        v = Village(id=1, name="古村", description="", lat=30.0, lng=120.0, address="")
        v.cultures = []
        v.spots = []

        mock_db = MagicMock()
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = v
        mock_db.execute = AsyncMock(return_value=mock_result)

        fake_script = {
            "title": "《古村迷踪》",
            "storyline": "一段故事",
            "chapters": [{"title": "第一章", "sortOrder": 1, "nodes": []}],
            "npcs": [{"name": "村长", "role": "引导者", "age": 65, "personality": "和蔼",
                       "description": "", "systemPrompt": "你是村长", "greeting": "欢迎"}],
            "endings": [{"title": "好结局", "description": "", "conditionDesc": ""}],
        }
        json_str = json.dumps(fake_script)
        lines = [f'data: {json.dumps({"choices": [{"delta": {"content": ch}}]})}\n' for ch in json_str]
        lines.append("data: [DONE]\n")

        mock_response = _mock_stream_response(lines)

        mock_client = _make_httpx_mock()
        mock_client.stream.return_value.__aenter__ = AsyncMock(return_value=mock_response)

        with patch("app.services.ai_script.httpx.AsyncClient", return_value=mock_client):
            events = []
            async for chunk in stream_script_generation(mock_db, 1, "mystery", 3, 60):
                events.append(chunk)

        progress_events = [e for e in events if "event: progress" in e]
        result_events = [e for e in events if "event: result" in e]
        done_events = [e for e in events if "event: done" in e]

        assert len(progress_events) == 5
        assert len(result_events) == 1
        assert len(done_events) == 1

        result_data = json.loads(result_events[0].split("data: ")[1])
        assert result_data["title"] == "《古村迷踪》"

    async def test_invalid_json_from_ai(self):
        from app.services.ai_script import stream_script_generation
        from app.models.village import Village

        v = Village(id=1, name="古村", description="", lat=30.0, lng=120.0, address="")
        v.cultures = []
        v.spots = []

        mock_db = MagicMock()
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = v
        mock_db.execute = AsyncMock(return_value=mock_result)

        invalid = '{"title": "test", broken: yes}'
        lines = [f'data: {json.dumps({"choices": [{"delta": {"content": ch}}]})}\n' for ch in invalid]
        lines.append("data: [DONE]\n")

        mock_response = _mock_stream_response(lines)

        mock_client = _make_httpx_mock()
        mock_client.stream.return_value.__aenter__ = AsyncMock(return_value=mock_response)

        with patch("app.services.ai_script.httpx.AsyncClient", return_value=mock_client):
            events = []
            async for chunk in stream_script_generation(mock_db, 1, "mystery", 3, 60):
                events.append(chunk)

        error_events = [e for e in events if "event: error" in e]
        assert len(error_events) == 1
        assert "JSON格式有误" in error_events[0]

    async def test_no_json_in_response(self):
        from app.services.ai_script import stream_script_generation
        from app.models.village import Village

        v = Village(id=1, name="古村", description="", lat=30.0, lng=120.0, address="")
        v.cultures = []
        v.spots = []

        mock_db = MagicMock()
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = v
        mock_db.execute = AsyncMock(return_value=mock_result)

        plain = "抱歉，无法生成……"
        lines = [f'data: {json.dumps({"choices": [{"delta": {"content": ch}}]})}\n' for ch in plain]
        lines.append("data: [DONE]\n")

        mock_response = _mock_stream_response(lines)

        mock_client = _make_httpx_mock()
        mock_client.stream.return_value.__aenter__ = AsyncMock(return_value=mock_response)

        with patch("app.services.ai_script.httpx.AsyncClient", return_value=mock_client):
            events = []
            async for chunk in stream_script_generation(mock_db, 1, "mystery", 3, 60):
                events.append(chunk)

        error_events = [e for e in events if "event: error" in e]
        assert len(error_events) == 1
        assert "未返回" in error_events[0]

    async def test_api_exception(self):
        from app.services.ai_script import stream_script_generation
        from app.models.village import Village

        v = Village(id=1, name="古村", description="", lat=30.0, lng=120.0, address="")
        v.cultures = []
        v.spots = []

        mock_db = MagicMock()
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = v
        mock_db.execute = AsyncMock(return_value=mock_result)

        mock_client = _make_httpx_mock()
        mock_client.stream.return_value.__aenter__.side_effect = Exception("Connection refused")

        with patch("app.services.ai_script.httpx.AsyncClient", return_value=mock_client):
            events = []
            async for chunk in stream_script_generation(mock_db, 1, "mystery", 3, 60):
                events.append(chunk)

        error_events = [e for e in events if "event: error" in e]
        assert len(error_events) == 1
        assert "AI服务异常" in error_events[0]


# ======================== NPC 对话 Prompt 构建 ========================

class TestBuildNpcPrompt:
    def test_prompt_includes_npc_config(self):
        from app.services.ai_chat import build_npc_system_prompt
        from app.models.script import ScriptNpc
        from app.models.progress import ScriptProgress

        npc = ScriptNpc(id=1, name="村长", system_prompt="你是古樟村的老村长，熟知村里一切。")
        progress = ScriptProgress(id=1, user_id=1, script_id=1, items=[],
                                  completed_task_ids=[])

        prompt = build_npc_system_prompt(npc, None, progress)
        assert "你是古樟村的老村长" in prompt

    def test_prompt_includes_node_context(self):
        from app.services.ai_chat import build_npc_system_prompt
        from app.models.script import ScriptNpc, ScriptNode
        from app.models.progress import ScriptProgress

        npc = ScriptNpc(id=1, name="村长", system_prompt="你是村长。")
        node = ScriptNode(id=10, title="古井旁", dialogue_prompt="游客来到了古井旁，村长正在打水。",
                          type="dialogue", chapter_id=1, config={}, sort_order=0)
        progress = ScriptProgress(id=1, user_id=1, script_id=1, items=[],
                                  completed_task_ids=[])

        prompt = build_npc_system_prompt(npc, node, progress)
        assert "古井旁" in prompt
        assert "游客来到了古井旁" in prompt

    def test_prompt_includes_unlocked_clues(self):
        from app.services.ai_chat import build_npc_system_prompt
        from app.models.script import ScriptNpc
        from app.models.progress import ScriptProgress

        npc = ScriptNpc(id=1, name="村长", system_prompt="你是村长。")
        progress = ScriptProgress(id=1, user_id=1, script_id=1,
                                  items=[{"name": "老照片"}, {"name": "铜钥匙"}],
                                  completed_task_ids=[])

        prompt = build_npc_system_prompt(npc, None, progress)
        assert "老照片" in prompt
        assert "铜钥匙" in prompt

# ======================== NPC 对话 SSE 流式 ========================

class TestStreamNpcChat:
    async def test_npc_not_found(self):
        from app.services.ai_chat import stream_npc_chat

        mock_db = MagicMock()
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = None
        mock_db.execute = AsyncMock(return_value=mock_result)

        events = []
        async for chunk in stream_npc_chat(mock_db, 1, 999, "你好", 10):
            events.append(chunk)

        assert len(events) == 1
        assert "NPC不存在" in events[0]

    async def test_normal_chat_flow(self):
        from app.services.ai_chat import stream_npc_chat
        from app.models.script import ScriptNpc, ScriptNode
        from app.models.progress import ScriptProgress

        npc = ScriptNpc(id=1, name="村长", system_prompt="你是村长。")
        node = ScriptNode(id=10, title="村口", dialogue_prompt="", type="dialogue",
                          chapter_id=1, config={}, sort_order=0)
        progress = ScriptProgress(id=1, user_id=1, script_id=1, items=[],
                                  completed_task_ids=[])

        # 3 个实体查询 + 1 个历史查询
        mock_results = []
        for entity in [npc, node, progress]:
            mr = MagicMock()
            mr.scalar_one_or_none.return_value = entity
            mock_results.append(mr)
        mr_history = MagicMock()
        mr_history.scalars.return_value.all.return_value = []
        mock_results.append(mr_history)

        mock_db = MagicMock()
        mock_db.execute = AsyncMock(side_effect=mock_results)

        reply = "欢迎来到古樟村！"
        lines = [f'data: {json.dumps({"choices": [{"delta": {"content": ch}}]})}\n' for ch in reply]
        lines.append("data: [DONE]\n")

        mock_response = _mock_stream_response(lines)

        mock_client = _make_httpx_mock()
        mock_client.stream.return_value.__aenter__ = AsyncMock(return_value=mock_response)

        with patch("app.services.ai_chat.httpx.AsyncClient", return_value=mock_client):
            events = []
            async for chunk in stream_npc_chat(mock_db, 1, 1, "你好", 10):
                events.append(chunk)

        message_events = [e for e in events if "event: message" in e]
        done_events = [e for e in events if "event: done" in e]

        assert len(message_events) >= 4
        assert len(done_events) == 1
        assert len(mock_db.add.call_args_list) == 2


# ======================== AI 图片生成 ========================

class TestGenerateSceneImage:
    async def test_scene_image_success(self):
        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.json = MagicMock(return_value={"data": [{"url": "https://oss.example.com/scene.png"}]})

        mock_client = _make_httpx_mock()
        mock_client.post = AsyncMock(return_value=mock_resp)

        with patch("app.services.ai_image.httpx.AsyncClient", return_value=mock_client):
            from app.services.ai_image import generate_scene_image
            result = await generate_scene_image("古樟树下", style="realistic", aspect_ratio="16:9")

        assert result["success"] is True
        assert "imageUrl" in result
        call_json = mock_client.post.call_args[1]["json"]
        assert "traditional Chinese village" in call_json["prompt"]
        assert call_json["size"] == "1920x1080"

    async def test_scene_image_custom_ratio(self):
        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.json = MagicMock(return_value={"data": [{"url": "https://oss.example.com/scene.png"}]})

        mock_client = _make_httpx_mock()
        mock_client.post = AsyncMock(return_value=mock_resp)

        with patch("app.services.ai_image.httpx.AsyncClient", return_value=mock_client):
            from app.services.ai_image import generate_scene_image
            await generate_scene_image("村口", aspect_ratio="1:1")

        assert mock_client.post.call_args[1]["json"]["size"] == "1080x1080"

    async def test_scene_image_api_failure(self):
        mock_resp = MagicMock()
        mock_resp.status_code = 400
        mock_resp.json = MagicMock(return_value={"error": {"message": "content filtered"}})

        mock_client = _make_httpx_mock()
        mock_client.post = AsyncMock(return_value=mock_resp)

        with patch("app.services.ai_image.httpx.AsyncClient", return_value=mock_client):
            from app.services.ai_image import generate_scene_image
            result = await generate_scene_image("test")

        assert result["success"] is False


class TestGenerateNpcPortrait:
    async def test_npc_portrait_male(self):
        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.json = MagicMock(return_value={"data": [{"url": "https://oss.example.com/npc.png"}]})

        mock_client = _make_httpx_mock()
        mock_client.post = AsyncMock(return_value=mock_resp)

        with patch("app.services.ai_image.httpx.AsyncClient", return_value=mock_client):
            from app.services.ai_image import generate_npc_portrait
            result = await generate_npc_portrait("李老伯", "male", 65, "白发苍苍", "和蔼可亲")

        assert result["success"] is True
        prompt = mock_client.post.call_args[1]["json"]["prompt"]
        assert "男性" in prompt
        assert "李老伯" in prompt
        assert "65" in prompt
        assert mock_client.post.call_args[1]["json"]["size"] == "1080x1440"

    async def test_npc_portrait_female(self):
        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.json = MagicMock(return_value={"data": [{"url": "https://oss.example.com/npc.png"}]})

        mock_client = _make_httpx_mock()
        mock_client.post = AsyncMock(return_value=mock_resp)

        with patch("app.services.ai_image.httpx.AsyncClient", return_value=mock_client):
            from app.services.ai_image import generate_npc_portrait
            await generate_npc_portrait("阿香", "female", 28, "长发及腰", "温柔善良")

        prompt = mock_client.post.call_args[1]["json"]["prompt"]
        assert "女性" in prompt
        assert "阿香" in prompt


# ======================== Admin AI 接口集成测试 ========================

class TestAdminAiEndpoint:
    async def test_generate_script_endpoint_requires_auth(self, anon_client):
        resp = await anon_client.post("/admin/ai/generate-script", json={
            "villageId": 1, "type": "mystery", "difficulty": 3, "estimatedDuration": 60
        })
        assert resp.status_code == 422

    async def test_generate_scene_image_endpoint(self, admin_client):
        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.json = MagicMock(return_value={"data": [{"url": "https://oss.example.com/scene.png"}]})

        mock_client = _make_httpx_mock()
        mock_client.post = AsyncMock(return_value=mock_resp)

        with patch("app.services.ai_image.httpx.AsyncClient", return_value=mock_client):
            resp = await admin_client.post("/admin/ai/generate-scene-image", json={
                "scriptId": "1", "description": "古樟树下"
            })

        data = resp.json()
        assert data["code"] == 0
        assert data["data"]["status"] == "completed"
        assert len(data["data"]["images"]) == 1

    async def test_generate_npc_portrait_endpoint(self, admin_client):
        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.json = MagicMock(return_value={"data": [{"url": "https://oss.example.com/npc.png"}]})

        mock_client = _make_httpx_mock()
        mock_client.post = AsyncMock(return_value=mock_resp)

        with patch("app.services.ai_image.httpx.AsyncClient", return_value=mock_client):
            resp = await admin_client.post("/admin/ai/generate-npc-portrait", json={
                "scriptId": "1", "name": "村长", "gender": "male", "age": 65,
                "appearance": "白发苍苍", "personality": "和蔼"
            })

        data = resp.json()
        assert data["code"] == 0
        assert data["data"]["status"] == "completed"

    async def test_image_generation_failure(self, admin_client):
        mock_resp = MagicMock()
        mock_resp.status_code = 400
        mock_resp.json = MagicMock(return_value={"error": {"message": "quota exceeded"}})

        mock_client = _make_httpx_mock()
        mock_client.post = AsyncMock(return_value=mock_resp)

        with patch("app.services.ai_image.httpx.AsyncClient", return_value=mock_client):
            resp = await admin_client.post("/admin/ai/generate-scene-image", json={
                "scriptId": "1", "description": "test"
            })

        data = resp.json()
        assert data["code"] == 3003
