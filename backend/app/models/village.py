"""乡村 & 打卡点 & 文化条目"""

from datetime import datetime
from sqlalchemy import String, Text, DateTime, Integer, Float, JSON, ForeignKey, func, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class Village(Base):
    __tablename__ = "villages"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    cover_image: Mapped[str | None] = mapped_column(String(500))
    lat: Mapped[float] = mapped_column(Float, nullable=False)
    lng: Mapped[float] = mapped_column(Float, nullable=False)
    address: Mapped[str | None] = mapped_column(String(300))
    tags: Mapped[dict | None] = mapped_column(JSON)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())

    spots: Mapped[list["VillageSpot"]] = relationship(back_populates="village", lazy="selectin")
    cultures: Mapped[list["VillageCulture"]] = relationship(back_populates="village", lazy="selectin")


class VillageSpot(Base):
    __tablename__ = "village_spots"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    village_id: Mapped[int] = mapped_column(ForeignKey("villages.id"), nullable=False)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    lat: Mapped[float] = mapped_column(Float, nullable=False)
    lng: Mapped[float] = mapped_column(Float, nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    images: Mapped[dict | None] = mapped_column(JSON)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)

    village: Mapped["Village"] = relationship(back_populates="spots")


class VillageCulture(Base):
    __tablename__ = "village_cultures"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    village_id: Mapped[int] = mapped_column(ForeignKey("villages.id"), nullable=False)
    type: Mapped[str] = mapped_column(SAEnum("history", "intangible", "legend"), nullable=False)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    content: Mapped[str | None] = mapped_column(Text)

    village: Mapped["Village"] = relationship(back_populates="cultures")
