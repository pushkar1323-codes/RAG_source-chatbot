from fastapi import APIRouter, HTTPException

from app.api.schemas import (
    ChatResponse,
    MessageRequest,
    MessageResponse,
    SourceResponse,
)
from app.chat.chat_manager import ChatManager
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
def create_chat(title: str):
    """
    Create a new chat.
    """

    chat_manager = ChatManager()

    chat = chat_manager.create_chat(
        title=title,
    )

    return chat


@router.get(
    "",
    response_model=list[ChatResponse],
)
def list_chats():
    """
    Return all chats.
    """

    chat_manager = ChatManager()

    return chat_manager.list_chats()


@router.get(
    "/{chat_id}",
    response_model=ChatResponse,
)
def get_chat(chat_id: str):
    """
    Return a chat by ID.
    """

    chat_manager = ChatManager()

    chat = chat_manager.get_chat(
        chat_id,
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
):
    """
    Attach an existing source to a chat.
    """

    chat_manager = ChatManager()

    try:
        chat_manager.attach_source(
            chat_id=chat_id,
            source_id=source_id,
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


@router.get(
    "/{chat_id}/sources",
    response_model=list[SourceResponse],
)
def get_chat_sources(chat_id: str):
    """
    Return all sources attached to a chat.
    """

    chat_manager = ChatManager()

    try:
        sources = chat_manager.get_chat_sources(
            chat_id,
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
):
    """
    Ask a question in a chat and persist the generated response.
    """

    chat_manager = ChatManager()

    chat = chat_manager.get_chat(chat_id)

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

    sources = chat_manager.get_chat_sources(
        chat_id,
    )

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

    response = rag_service.ask(
        question=request.question,
        source_ids=source_ids,
    )

    message = chat_manager.add_message(
        chat_id=chat_id,
        question=request.question,
        answer=response.answer,
        citations=response.citations,
    )

    return {
        "message_id": message.id,
        "chat_id": chat_id,
        "question": message.question,
        "answer": message.answer,
        "citations": message.citations,
        "created_at": message.created_at,
    }


@router.get(
    "/{chat_id}/messages",
    response_model=list[MessageResponse],
)
def get_chat_messages(chat_id: str):
    """
    Return all messages belonging to a chat.
    """

    chat_manager = ChatManager()

    try:
        messages = chat_manager.get_messages(
            chat_id,
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