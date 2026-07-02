"""剧本进度 & 对话 & 评分 & AR合影"""

from datetime import datetime
from sqlalchemy import String, Text, DateTime, Integer, JSON, ForeignKey, func, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base


class ScriptProgress(Base):
    __tablename__ = "script_progresses"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    script_id: Mapped[int] = mapped_column(ForeignKey("scripts.id"), nullable=False)
    status: Mapped[str] = mapped_column(SAEnum("playing", "completed"), default="playing")
    current_node_id: Mapped[int | None] = mapped_column(ForeignKey("script_nodes.id"))
    completed_node_ids: Mapped[dict | None] = mapped_column(JSON)
    completed_task_ids: Mapped[dict | None] = mapped_column(JSON)
    items: Mapped[dict | None] = mapped_column(JSON)
    started_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    completed_at: Mapped[datetime | None] = mapped_column(DateTime)
    completed_ending_id: Mapped[int | None] = mapped_column(Integer, nullable=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())


class ChatLog(Base):
    __tablename__ = "chat_logs"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    script_id: Mapped[int] = mapped_column(ForeignKey("scripts.id"), nullable=False)
    progress_id: Mapped[int] = mapped_column(ForeignKey("script_progresses.id", ondelete="CASCADE"), nullable=False)
    npc_id: Mapped[int] = mapped_column(ForeignKey("script_npcs.id"), nullable=False)
    node_id: Mapped[int | None] = mapped_column(Integer)
    role: Mapped[str] = mapped_column(SAEnum("user", "npc"), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())


class Rating(Base):
    __tablename__ = "ratings"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    script_id: Mapped[int] = mapped_column(ForeignKey("scripts.id"), nullable=False)
    rating: Mapped[int] = mapped_column(Integer, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())


class ArPhoto(Base):
    __tablename__ = "ar_photos"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    progress_id: Mapped[int] = mapped_column(ForeignKey("script_progresses.id", ondelete="CASCADE"), nullable=False)
    script_id: Mapped[int] = mapped_column(ForeignKey("scripts.id"), nullable=False)
    npc_id: Mapped[int] = mapped_column(ForeignKey("script_npcs.id"), nullable=False)
    photo_url: Mapped[str] = mapped_column(String(500), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
