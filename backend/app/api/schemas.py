from datetime import datetime

from pydantic import BaseModel


class MessageRequest(BaseModel):
    """
    Request body for asking a question in a chat.
    """

    question: str


class ChatResponse(BaseModel):
    """
    Chat response.
    """

    id: str
    title: str
    created_at: datetime


class SourceResponse(BaseModel):
    """
    Source response.
    """

    source_id: str
    filename: str
    type: str
    status: str


class CitationResponse(BaseModel):
    """
    Citation returned with an answer.
    """

    source: str | None = None
    page: str | None = None


class MessageResponse(BaseModel):
    """
    Persisted chat message response.
    """

    message_id: str
    chat_id: str
    question: str
    answer: str
    citations: list[CitationResponse]
    created_at: datetime