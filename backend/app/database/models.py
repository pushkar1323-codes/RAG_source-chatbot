from datetime import datetime, timezone
from uuid import uuid4

from sqlalchemy import DateTime, ForeignKey, JSON, String, Table, Column
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class Base(DeclarativeBase):
    """
    Base class for all database models.
    """

    pass


chat_sources = Table(
    "chat_sources",
    Base.metadata,
    Column(
        "chat_id",
        String,
        ForeignKey("chats.id", ondelete="CASCADE"),
        primary_key=True,
    ),
    Column(
        "source_id",
        String,
        ForeignKey("sources.source_id", ondelete="CASCADE"),
        primary_key=True,
    ),
)


class SourceModel(Base):
    """
    Persistent representation of an ingested source.
    """

    __tablename__ = "sources"

    source_id: Mapped[str] = mapped_column(
        String,
        primary_key=True,
    )

    filename: Mapped[str] = mapped_column(
        String,
        nullable=False,
    )

    type: Mapped[str] = mapped_column(
        String,
        nullable=False,
    )

    path: Mapped[str | None] = mapped_column(
        String,
        nullable=True,
    )

    url: Mapped[str | None] = mapped_column(
        String,
        nullable=True,
    )

    source_metadata: Mapped[dict] = mapped_column(
        "metadata",
        JSON,
        default=dict,
        nullable=False,
    )

    status: Mapped[str] = mapped_column(
        String,
        nullable=False,
        default="ready",
    )

    chats: Mapped[list["ChatModel"]] = relationship(
        secondary=chat_sources,
        back_populates="sources",
    )


class ChatModel(Base):
    """
    Persistent representation of a conversation.
    """

    __tablename__ = "chats"

    id: Mapped[str] = mapped_column(
        String,
        primary_key=True,
        default=lambda: str(uuid4()),
    )

    title: Mapped[str] = mapped_column(
        String,
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )

    sources: Mapped[list[SourceModel]] = relationship(
        secondary=chat_sources,
        back_populates="chats",
    )

    messages: Mapped[list["MessageModel"]] = relationship(
        back_populates="chat",
        cascade="all, delete-orphan",
        order_by="MessageModel.created_at",
    )


class MessageModel(Base):
    """
    Persistent representation of a question and its generated answer.
    """

    __tablename__ = "messages"

    id: Mapped[str] = mapped_column(
        String,
        primary_key=True,
        default=lambda: str(uuid4()),
    )

    chat_id: Mapped[str] = mapped_column(
        String,
        ForeignKey("chats.id", ondelete="CASCADE"),
        nullable=False,
    )

    question: Mapped[str] = mapped_column(
        String,
        nullable=False,
    )

    answer: Mapped[str] = mapped_column(
        String,
        nullable=False,
    )

    citations: Mapped[list] = mapped_column(
        JSON,
        default=list,
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )

    chat: Mapped[ChatModel] = relationship(
        back_populates="messages",
    )