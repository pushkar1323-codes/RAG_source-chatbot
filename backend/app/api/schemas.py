from datetime import datetime

from pydantic import BaseModel


class RegisterRequest(BaseModel):
    """
    Request body for creating a user account.
    """

    email: str
    password: str


class LoginRequest(BaseModel):
    """
    Request body for authenticating a user.
    """

    email: str
    password: str


class UserResponse(BaseModel):
    """
    Authenticated user response.
    """

    id: str
    email: str
    created_at: datetime


class AuthResponse(BaseModel):
    """
    Authentication response containing the user and access token.
    """

    access_token: str
    token_type: str
    user: UserResponse


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


class GuestAskRequest(BaseModel):
    """
    Request body for asking a question in a guest session.
    """

    question: str
    source_ids: list[str]


class GuestAnswerResponse(BaseModel):
    """
    Non-persisted answer returned for a guest session.
    """

    answer: str
    citations: list[CitationResponse]