"""移动端 —— 剧本浏览 测试"""
import pytest
from unittest.mock import AsyncMock, MagicMock

from app.models.script import Script, ScriptNpc, ScriptChapter


def _make_script(id: int, title: str, **kw):
    s = Script(id=id, title=title, village_id=1, type="mystery",
               difficulty=3, estimated_duration=60,
               rating_avg=4.5, experience_count=120,
               cover_image="cover.jpg", storyline="故事梗概",
               rating_count=10,
               status="published", published_at=None)
    for k, v in kw.items():
        setattr(s, k, v)
    return s


class TestListScripts:
    async def test_list_default(self, anon_client, mock_db):
        """默认列表 —— 按热门排序"""
        s1 = _make_script(1, "古村迷踪")
        s2 = _make_script(2, "湖底奇案")

        # count 查询
        mock_count = MagicMock()
        mock_count.scalar.return_value = 2
        # 列表查询
        mock_list = MagicMock()
        mock_list.scalars.return_value.all.return_value = [s1, s2]

        mock_db.execute = AsyncMock(side_effect=[mock_count, mock_list])

        resp = await anon_client.get("/v1/scripts")
        data = resp.json()
        assert data["code"] == 0
        assert data["data"]["total"] == 2
        assert len(data["data"]["list"]) == 2
        assert data["data"]["list"][0]["title"] == "古村迷踪"

    async def test_list_with_filters(self, anon_client, mock_db):
        """按类型和关键词筛选"""
        mock_count = MagicMock()
        mock_count.scalar.return_value = 1
        mock_list = MagicMock()
        mock_list.scalars.return_value.all.return_value = [_make_script(3, "祠堂秘闻")]

        mock_db.execute = AsyncMock(side_effect=[mock_count, mock_list])

        resp = await anon_client.get("/v1/scripts?type=mystery&keyword=祠堂&sort=newest")
        assert resp.json()["code"] == 0

    async def test_pagination(self, anon_client, mock_db):
        """分页参数"""
        mock_count = MagicMock()
        mock_count.scalar.return_value = 25
        mock_list = MagicMock()
        mock_list.scalars.return_value.all.return_value = []

        mock_db.execute = AsyncMock(side_effect=[mock_count, mock_list])

        resp = await anon_client.get("/v1/scripts?page=2&pageSize=5")
        data = resp.json()
        assert data["data"]["page"] == 2
        assert data["data"]["pageSize"] == 5
        assert data["data"]["total"] == 25


class TestRecommend:
    async def test_recommend(self, anon_client, mock_db):
        """推荐列表"""
        mock_list = MagicMock()
        mock_list.scalars.return_value.all.return_value = [
            _make_script(1, "推荐A"), _make_script(2, "推荐B"), _make_script(3, "推荐C"),
        ]
        mock_db.execute = AsyncMock(return_value=mock_list)

        resp = await anon_client.get("/v1/scripts/recommend?limit=3")
        data = resp.json()
        assert len(data["data"]["list"]) == 3


class TestScriptDetail:
    async def test_detail(self, client, mock_db, mock_user):
        """剧本详情 —— 含NPC信息"""
        npc = ScriptNpc(id=1, name="村长", avatar="a.jpg", role="引导者", description="老村长")
        s = _make_script(1, "古村迷踪")
        s.npcs = [npc]
        s.chapters = []
        s.endings = []

        mock_result = MagicMock()
        mock_result.scalar_one_or_none.side_effect = [s, None]  # script → 有, rating → None
        mock_db.execute = AsyncMock(return_value=mock_result)

        resp = await client.get("/v1/scripts/1")
        data = resp.json()
        assert data["code"] == 0
        assert data["data"]["title"] == "古村迷踪"
        assert len(data["data"]["npcs"]) == 1


class TestClaimScript:
    async def test_claim_success(self, client, mock_db, mock_user):
        """首次领取剧本"""
        chapter = ScriptChapter(id=1, title="第一章", sort_order=1)
        from app.models.script import ScriptNode
        chapter.nodes = [ScriptNode(id=10, title="起点", type="dialogue", config={}, sort_order=0)]

        s = _make_script(1, "古村迷踪")
        s.chapters = [chapter]

        mock_result = MagicMock()
        # 1. 查剧本 2. 查现有进度(无)
        mock_result.scalar_one_or_none.side_effect = [s, None]
        mock_db.execute = AsyncMock(return_value=mock_result)
        mock_db.flush = AsyncMock()

        resp = await client.post("/v1/scripts/1/claim")
        data = resp.json()
        assert data["code"] == 0
        assert data["data"]["scriptId"] == "1"
        assert data["data"]["status"] == "playing"
        assert data["data"]["currentNodeId"] == "10"

    async def test_claim_duplicate(self, client, mock_db, mock_user):
        """重复领取"""
        from app.models.progress import ScriptProgress

        s = _make_script(1, "古村迷踪")
        existing = ScriptProgress(id=5, user_id=1, script_id=1, status="playing")

        mock_result = MagicMock()
        mock_result.scalar_one_or_none.side_effect = [s, existing]
        mock_db.execute = AsyncMock(return_value=mock_result)

        resp = await client.post("/v1/scripts/1/claim")
        data = resp.json()
        assert data["code"] == 2002  # 已领取
