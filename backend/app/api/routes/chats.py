from fastapi import APIRouter, Depends, HTTPException
from langchain_google_genai.chat_models import GoogleRateLimitError

from app.api.schemas import (
    ChatResponse,
    MessageRequest,
    MessageResponse,
    SourceResponse,
)
from app.auth.dependencies import get_current_user
from app.chat.chat_manager import ChatManager
from app.database.models import UserModel
from app.embeddings.embedding_service import create_embedding_model
from app.rag.rag_service import RAGService


router = APIRouter(
    prefix="/chats",
    tags=["Chats"],
)


@router.post(
    "",
    response_model=ChatResponse,
)
def create_chat(
    title: str,
    current_user: UserModel = Depends(get_current_user),
):
    """
    Create a new chat for the authenticated user.
    """

    chat_manager = ChatManager()

    try:
        chat = chat_manager.create_chat(
            title=title,
            user_id=current_user.id,
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        ) from exc

    return chat


@router.get(
    "",
    response_model=list[ChatResponse],
)
def list_chats(
    current_user: UserModel = Depends(get_current_user),
):
    """
    Return chats belonging to the authenticated user.
    """

    chat_manager = ChatManager()

    return chat_manager.list_chats(
        user_id=current_user.id,
    )


@router.get(
    "/{chat_id}",
    response_model=ChatResponse,
)
def get_chat(
    chat_id: str,
    current_user: UserModel = Depends(get_current_user),
):
    """
    Return a chat belonging to the authenticated user.
    """

    chat_manager = ChatManager()

    chat = chat_manager.get_chat(
        chat_id,
        user_id=current_user.id,
    )

    if not chat:
        raise HTTPException(
            status_code=404,
            detail="Chat not found.",
        )

    return chat


@router.post(
    "/{chat_id}/sources/{source_id}",
)
def attach_source(
    chat_id: str,
    source_id: str,
    current_user: UserModel = Depends(get_current_user),
):
    """
    Attach an existing source belonging to the authenticated
    user to one of their chats.
    """

    chat_manager = ChatManager()

    try:
        chat_manager.attach_source(
            chat_id=chat_id,
            source_id=source_id,
            user_id=current_user.id,
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=404,
            detail=str(exc),
        ) from exc

    return {
        "chat_id": chat_id,
        "source_id": source_id,
        "status": "attached",
    }


@router.delete(
    "/{chat_id}/sources/{source_id}",
)
def detach_source(
    chat_id: str,
    source_id: str,
    current_user: UserModel = Depends(get_current_user),
):
    """
    Remove a source from a user's chat without deleting
    the source itself.
    """

    chat_manager = ChatManager()

    try:
        removed = chat_manager.detach_source(
            chat_id=chat_id,
            source_id=source_id,
            user_id=current_user.id,
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=404,
            detail=str(exc),
        ) from exc

    if not removed:
        raise HTTPException(
            status_code=404,
            detail="Source is not attached to this chat.",
        )

    return {
        "chat_id": chat_id,
        "source_id": source_id,
        "status": "detached",
    }


@router.get(
    "/{chat_id}/sources",
    response_model=list[SourceResponse],
)
def get_chat_sources(
    chat_id: str,
    current_user: UserModel = Depends(get_current_user),
):
    """
    Return sources attached to a chat belonging to the
    authenticated user.
    """

    chat_manager = ChatManager()

    try:
        sources = chat_manager.get_chat_sources(
            chat_id,
            user_id=current_user.id,
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=404,
            detail=str(exc),
        ) from exc

    return sources


@router.post(
    "/{chat_id}/messages",
    response_model=MessageResponse,
)
def create_message(
    chat_id: str,
    request: MessageRequest,
    current_user: UserModel = Depends(get_current_user),
):
    """
    Ask a question in a chat belonging to the authenticated user
    and persist the generated response.
    """

    chat_manager = ChatManager()

    chat = chat_manager.get_chat(
        chat_id,
        user_id=current_user.id,
    )

    if not chat:
        raise HTTPException(
            status_code=404,
            detail="Chat not found.",
        )

    if not request.question.strip():
        raise HTTPException(
            status_code=400,
            detail="Question cannot be empty.",
        )

    try:
        sources = chat_manager.get_chat_sources(
            chat_id,
            user_id=current_user.id,
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=404,
            detail=str(exc),
        ) from exc

    source_ids = [
        source.source_id
        for source in sources
    ]

    if not source_ids:
        raise HTTPException(
            status_code=400,
            detail="No sources are attached to this chat.",
        )

    embedding_model = create_embedding_model()

    rag_service = RAGService(
        embedding_model=embedding_model,
    )

    try:
        response = rag_service.ask(
            question=request.question,
            source_ids=source_ids,
        )
    except GoogleRateLimitError as exc:
        raise HTTPException(
            status_code=429,
            detail=(
                "AI generation is temporarily unavailable because "
                "the Gemini API quota has been exceeded. "
                "Please try again later."
            ),
        ) from exc

    try:
        message = chat_manager.add_message(
            chat_id=chat_id,
            question=request.question,
            answer=response.answer,
            citations=response.citations,
            user_id=current_user.id,
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=404,
            detail=str(exc),
        ) from exc

    return {
        "message_id": message.id,
        "chat_id": message.chat_id,
        "question": message.question,
        "answer": message.answer,
        "citations": message.citations,
        "created_at": message.created_at,
    }


@router.get(
    "/{chat_id}/messages",
    response_model=list[MessageResponse],
)
def get_chat_messages(
    chat_id: str,
    current_user: UserModel = Depends(get_current_user),
):
    """
    Return messages belonging to a chat owned by the
    authenticated user.
    """

    chat_manager = ChatManager()

    try:
        messages = chat_manager.get_messages(
            chat_id,
            user_id=current_user.id,
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=404,
            detail=str(exc),
        ) from exc

    return [
        {
            "message_id": message.id,
            "chat_id": message.chat_id,
            "question": message.question,
            "answer": message.answer,
            "citations": message.citations,
            "created_at": message.created_at,
        }
        for message in messages
    ]