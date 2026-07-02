"""剧本 & 章节 & 节点 & NPC & 结局 & 任务 & AR资源"""

from datetime import datetime
from sqlalchemy import String, Text, DateTime, Integer, Float, JSON, ForeignKey, func, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class Script(Base):
    __tablename__ = "scripts"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    village_id: Mapped[int] = mapped_column(ForeignKey("villages.id"), nullable=False)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    cover_image: Mapped[str | None] = mapped_column(String(500))
    type: Mapped[str] = mapped_column(SAEnum("mystery", "history", "family", "couple", "team"), nullable=False)
    difficulty: Mapped[int] = mapped_column(Integer, nullable=False)
    estimated_duration: Mapped[int] = mapped_column(Integer, nullable=False)
    storyline: Mapped[str | None] = mapped_column(Text)
    status: Mapped[str] = mapped_column(SAEnum("draft", "published", "offline"), default="draft")
    rating_avg: Mapped[float] = mapped_column(Float, default=0)
    rating_count: Mapped[int] = mapped_column(Integer, default=0)
    experience_count: Mapped[int] = mapped_column(Integer, default=0)
    published_at: Mapped[datetime | None] = mapped_column(DateTime)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())

    chapters: Mapped[list["ScriptChapter"]] = relationship(back_populates="script", lazy="selectin", order_by="ScriptChapter.sort_order")
    npcs: Mapped[list["ScriptNpc"]] = relationship(back_populates="script", lazy="selectin")
    endings: Mapped[list["ScriptEnding"]] = relationship(back_populates="script", lazy="selectin")


class ScriptChapter(Base):
    __tablename__ = "script_chapters"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    script_id: Mapped[int] = mapped_column(ForeignKey("scripts.id", ondelete="CASCADE"), nullable=False)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)

    script: Mapped["Script"] = relationship(back_populates="chapters")
    nodes: Mapped[list["ScriptNode"]] = relationship(back_populates="chapter", lazy="selectin", order_by="ScriptNode.sort_order")


class ScriptNpc(Base):
    __tablename__ = "script_npcs"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    script_id: Mapped[int] = mapped_column(ForeignKey("scripts.id", ondelete="CASCADE"), nullable=False)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    avatar: Mapped[str | None] = mapped_column(String(500))
    role: Mapped[str | None] = mapped_column(String(50))
    age: Mapped[int | None] = mapped_column(Integer)
    personality: Mapped[str | None] = mapped_column(String(200))
    description: Mapped[str | None] = mapped_column(Text)
    system_prompt: Mapped[str] = mapped_column(Text, nullable=False)
    knowledge_base: Mapped[dict | None] = mapped_column(JSON)
    greeting: Mapped[str | None] = mapped_column(String(500))
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())

    script: Mapped["Script"] = relationship(back_populates="npcs")


class ScriptNode(Base):
    __tablename__ = "script_nodes"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    script_id: Mapped[int] = mapped_column(ForeignKey("scripts.id", ondelete="CASCADE"), nullable=False)
    chapter_id: Mapped[int] = mapped_column(ForeignKey("script_chapters.id", ondelete="CASCADE"), nullable=False)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    type: Mapped[str] = mapped_column(SAEnum("dialogue", "task_hub", "ending"), nullable=False)
    scene_image: Mapped[str | None] = mapped_column(String(500))
    scene_audio: Mapped[str | None] = mapped_column(String(500))
    trigger_type: Mapped[str] = mapped_column(SAEnum("gps", "auto", "manual"), default="auto")
    trigger_lat: Mapped[float | None] = mapped_column(Float)
    trigger_lng: Mapped[float | None] = mapped_column(Float)
    trigger_radius: Mapped[int] = mapped_column(Integer, default=30)
    dialogue_prompt: Mapped[str | None] = mapped_column(Text)
    npc_id: Mapped[int | None] = mapped_column(ForeignKey("script_npcs.id", ondelete="SET NULL"))
    config: Mapped[dict] = mapped_column(JSON, nullable=False)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)

    chapter: Mapped["ScriptChapter"] = relationship(back_populates="nodes")
    npc: Mapped["ScriptNpc | None"] = relationship()
    tasks: Mapped[list["Task"]] = relationship(back_populates="node", lazy="selectin", order_by="Task.sort_order")


class ScriptEnding(Base):
    __tablename__ = "script_endings"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    script_id: Mapped[int] = mapped_column(ForeignKey("scripts.id", ondelete="CASCADE"), nullable=False)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    ending_image: Mapped[str | None] = mapped_column(String(500))
    condition_desc: Mapped[str | None] = mapped_column(String(500))

    script: Mapped["Script"] = relationship(back_populates="endings")


class ArResource(Base):
    __tablename__ = "ar_resources"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    script_id: Mapped[int] = mapped_column(ForeignKey("scripts.id", ondelete="CASCADE"), nullable=False)
    node_id: Mapped[int] = mapped_column(ForeignKey("script_nodes.id", ondelete="CASCADE"), nullable=False)
    type: Mapped[str] = mapped_column(SAEnum("recognition_image", "collectable", "npc_model"), nullable=False)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    marker_url: Mapped[str | None] = mapped_column(String(500))
    marker_preview: Mapped[str | None] = mapped_column(String(500))
    aruco_id: Mapped[int | None] = mapped_column(Integer, unique=True)
    model_url: Mapped[str | None] = mapped_column(String(500))
    overlay_content: Mapped[dict | None] = mapped_column(JSON)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())


class Task(Base):
    __tablename__ = "tasks"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    script_id: Mapped[int] = mapped_column(ForeignKey("scripts.id", ondelete="CASCADE"), nullable=False)
    node_id: Mapped[int] = mapped_column(ForeignKey("script_nodes.id", ondelete="CASCADE"), nullable=False)
    type: Mapped[str] = mapped_column(SAEnum("gps_checkin", "puzzle", "photo", "choice", "ar_scan"), nullable=False)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    answer: Mapped[str | None] = mapped_column(String(500))
    retry_hint: Mapped[str | None] = mapped_column(String(300))
    reward_item: Mapped[dict | None] = mapped_column(JSON)
    target_lat: Mapped[float | None] = mapped_column(Float)
    target_lng: Mapped[float | None] = mapped_column(Float)
    target_radius: Mapped[int] = mapped_column(Integer, default=30)
    ar_resource_id: Mapped[int | None] = mapped_column(ForeignKey("ar_resources.id", ondelete="SET NULL"))
    sort_order: Mapped[int] = mapped_column(Integer, default=0)

    node: Mapped["ScriptNode"] = relationship(back_populates="tasks")
