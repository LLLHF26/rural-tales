"""移动端 —— 剧本体验（核心）测试"""
import pytest
from unittest.mock import AsyncMock, MagicMock

from app.models.script import ScriptNode, ScriptNpc, ScriptChapter, Task
from app.models.progress import ScriptProgress


class TestCurrentNode:
    async def test_get_node_with_npc(self, client, mock_db):
        """当前节点 —— 含 NPC 信息"""
        progress = ScriptProgress(id=1, user_id=1, script_id=1, status="playing",
                                  current_node_id=10, completed_node_ids=[], completed_task_ids=[])

        chapter = ScriptChapter(id=1, title="第一章")
        npc = ScriptNpc(id=5, name="村长", avatar="npc.jpg", greeting="你好！")
        node = ScriptNode(id=10, title="古村入口", type="dialogue", chapter_id=1,
                          scene_image="scene.jpg", scene_audio=None,
                          npc_id=5, dialogue_prompt="你来到了古村入口", config={}, sort_order=0)
        node.tasks = []

        mock_result = MagicMock()
        mock_result.scalar_one_or_none.side_effect = [progress, node, chapter, npc]
        mock_db.execute = AsyncMock(return_value=mock_result)

        resp = await client.get("/v1/play/1/current-node")
        data = resp.json()
        assert data["code"] == 0
        assert data["data"]["nodeTitle"] == "古村入口"
        assert data["data"]["chapterTitle"] == "第一章"
        assert data["data"]["npc"]["name"] == "村长"
        assert data["data"]["npc"]["greeting"] == "你好！"

    async def test_no_progress(self, client, mock_db):
        """进度不存在"""
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = None
        mock_db.execute = AsyncMock(return_value=mock_result)

        resp = await client.get("/v1/play/999/current-node")
        assert resp.json()["code"] == 2001


class TestChoose:
    async def test_choose_branch(self, client, mock_db):
        """剧情分支选择"""
        node = ScriptNode(id=10, title="十字路口", type="task_hub", chapter_id=1,
                          npc_id=None, config={
                              "branchOptions": [
                                  {"id": "left", "label": "走向左边", "nextNodeId": 11},
                                  {"id": "right", "label": "走向右边", "nextNodeId": 12},
                              ]
                          })
        progress = ScriptProgress(id=1, user_id=1, script_id=1, status="playing",
                                  current_node_id=10, completed_node_ids=[])

        mock_result = MagicMock()
        mock_result.scalar_one_or_none.side_effect = [progress, node]
        mock_db.execute = AsyncMock(return_value=mock_result)

        resp = await client.post("/v1/play/1/choose", json={"nodeId": 10, "choiceId": "left"})
        data = resp.json()
        assert data["code"] == 0
        assert data["data"]["nextNodeId"] == "11"
        assert "走向左边" in data["data"]["message"]
        assert progress.current_node_id == 11

    async def test_choose_invalid(self, client, mock_db):
        """无效的选择"""
        node = ScriptNode(id=10, title="十字路口", type="task_hub", chapter_id=1,
                          npc_id=None, config={
                              "branchOptions": [{"id": "left", "label": "左", "nextNodeId": 11}]
                          })
        progress = ScriptProgress(id=1, user_id=1, script_id=1, status="playing",
                                  current_node_id=10, completed_node_ids=[])

        mock_result = MagicMock()
        mock_result.scalar_one_or_none.side_effect = [progress, node]
        mock_db.execute = AsyncMock(return_value=mock_result)

        resp = await client.post("/v1/play/1/choose", json={"nodeId": 10, "choiceId": "north"})
        assert resp.json()["code"] == 1001


class TestSubmitTask:
    async def test_puzzle_correct(self, client, mock_db):
        """谜题回答正确"""
        task = Task(id=20, type="puzzle", title="解谜", answer="梅花",
                    retry_hint="", reward_item={"itemId": "clue1", "name": "线索", "type": "clue"})
        node = ScriptNode(id=10, title="谜题点", type="task_hub", chapter_id=1,
                          npc_id=None, config={"nextNodes": [11]})
        progress = ScriptProgress(id=1, user_id=1, script_id=1, status="playing",
                                  current_node_id=10, completed_task_ids=[], completed_node_ids=[],
                                  items=[])

        mock_result = MagicMock()
        mock_result.scalar_one_or_none.side_effect = [progress, task, node]
        mock_db.execute = AsyncMock(return_value=mock_result)

        resp = await client.post("/v1/play/1/task/submit", json={
            "taskId": 20, "nodeId": 10, "answer": "梅花"
        })
        data = resp.json()
        assert data["code"] == 0
        assert data["data"]["success"] is True
        assert data["data"]["nextNodeId"] == "11"
        assert "20" in progress.completed_task_ids

    async def test_puzzle_wrong(self, client, mock_db):
        """谜题回答错误"""
        task = Task(id=20, type="puzzle", title="解谜", answer="梅花",
                    retry_hint="试试植物", reward_item=None)
        progress = ScriptProgress(id=1, user_id=1, script_id=1, status="playing",
                                  current_node_id=10, completed_task_ids=[])

        mock_result = MagicMock()
        mock_result.scalar_one_or_none.side_effect = [progress, task]
        mock_db.execute = AsyncMock(return_value=mock_result)

        resp = await client.post("/v1/play/1/task/submit", json={
            "taskId": 20, "nodeId": 10, "answer": "错误答案"
        })
        data = resp.json()
        assert data["data"]["success"] is False
        assert data["data"]["retryHint"] == "试试植物"


class TestGpsCheckin:
    async def test_gps_within_range(self, client, mock_db):
        """GPS签到 —— 在范围内"""
        task = Task(id=30, type="gps_checkin", title="到达古井",
                    target_lat=30.1234, target_lng=120.5678, target_radius=50,
                    reward_item=None)
        node = ScriptNode(id=10, title="打卡点", type="task_hub", chapter_id=1,
                          npc_id=None, config={})
        progress = ScriptProgress(id=1, user_id=1, script_id=1, status="playing",
                                  current_node_id=10, completed_task_ids=[],
                                  completed_node_ids=[], items=[])

        mock_result = MagicMock()
        mock_result.scalar_one_or_none.side_effect = [progress, task, node]
        mock_db.execute = AsyncMock(return_value=mock_result)

        resp = await client.post("/v1/play/1/task/submit", json={
            "taskId": 30, "nodeId": 10,
            "gpsLat": 30.1235, "gpsLng": 120.5679  # 约 15m 偏差
        })
        data = resp.json()
        assert data["data"]["success"] is True

    async def test_gps_out_of_range(self, client, mock_db):
        """GPS签到 —— 超出范围"""
        task = Task(id=30, type="gps_checkin", title="到达古井",
                    target_lat=30.1234, target_lng=120.5678, target_radius=30,
                    reward_item=None)
        progress = ScriptProgress(id=1, user_id=1, script_id=1, status="playing",
                                  current_node_id=10, completed_task_ids=[])

        mock_result = MagicMock()
        mock_result.scalar_one_or_none.side_effect = [progress, task]
        mock_db.execute = AsyncMock(return_value=mock_result)

        resp = await client.post("/v1/play/1/task/submit", json={
            "taskId": 30, "nodeId": 10,
            "gpsLat": 31.0000, "gpsLng": 121.0000  # 约 100km
        })
        data = resp.json()
        assert data["data"]["success"] is False
        assert "米" in data["data"]["message"]


class TestProgress:
    async def test_get_progress(self, client, mock_db):
        """获取完整进度"""
        from app.models.script import Script

        p = ScriptProgress(id=1, user_id=1, script_id=5, status="playing",
                           current_node_id=10,
                           completed_node_ids=["1", "2"], completed_task_ids=["101"],
                           items=[{"name": "古村钥匙"}],
                           started_at=None, updated_at=None)
        s = Script(id=5, title="古村迷踪")

        mock_result = MagicMock()
        mock_result.scalar_one_or_none.side_effect = [p, s]
        mock_db.execute = AsyncMock(return_value=mock_result)

        resp = await client.get("/v1/play/1/progress")
        data = resp.json()
        assert data["code"] == 0
        assert data["data"]["scriptTitle"] == "古村迷踪"
        assert data["data"]["status"] == "playing"
        assert len(data["data"]["items"]) == 1


class TestEnding:
    async def test_reach_ending(self, client, mock_db):
        """达成结局"""
        from app.models.script import ScriptEnding

        p = ScriptProgress(id=1, user_id=1, script_id=5, status="playing",
                           completed_node_ids=["1", "5"])
        ending = ScriptEnding(id=3, script_id=5, title="圆满结局",
                              description="你解开了谜团")
        all_endings = MagicMock()
        all_endings.all.return_value = [ending]

        mock_result = MagicMock()
        mock_result.scalar_one_or_none.side_effect = [p, ending]
        mock_result.scalars.return_value = all_endings
        mock_db.execute = AsyncMock(return_value=mock_result)

        resp = await client.post("/v1/play/1/ending?endingId=3")
        data = resp.json()
        assert data["code"] == 0
        assert data["data"]["title"] == "圆满结局"
        assert p.status == "completed"
