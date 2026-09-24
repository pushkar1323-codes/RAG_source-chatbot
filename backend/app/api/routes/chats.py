from fastapi import APIRouter
from pydantic import BaseModel

from app.chat.chat_manager import ChatManager
from app.embeddings.embedding_service import create_embedding_model
from app.rag.rag_service import RAGService


router = APIRouter(
    prefix="/chats",
    tags=["Chats"],
)


@router.post("")
def create_chat(title: str):
    """
    Create a new chat.
    """

    chat_manager = ChatManager()

    chat = chat_manager.create_chat(
        title=title,
    )

    return {
        "id": chat.id,
        "title": chat.title,
        "created_at": chat.created_at,
    }


@router.get("")
def list_chats():
    """
    Return all chats.
    """

    chat_manager = ChatManager()
    chats = chat_manager.list_chats()

    return [
        {
            "id": chat.id,
            "title": chat.title,
            "created_at": chat.created_at,
        }
        for chat in chats
    ]


@router.get("/{chat_id}")
def get_chat(chat_id: str):
    """
    Return a chat by ID.
    """

    chat_manager = ChatManager()

    chat = chat_manager.get_chat(
        chat_id,
    )

    if not chat:
        return {
            "error": "Chat not found."
        }

    return {
        "id": chat.id,
        "title": chat.title,
        "created_at": chat.created_at,
    }


@router.post("/{chat_id}/sources/{source_id}")
def attach_source(
    chat_id: str,
    source_id: str,
):
    """
    Attach an existing source to a chat.
    """

    chat_manager = ChatManager()

    chat_manager.attach_source(
        chat_id=chat_id,
        source_id=source_id,
    )

    return {
        "chat_id": chat_id,
        "source_id": source_id,
        "status": "attached",
    }


@router.get("/{chat_id}/sources")
def get_chat_sources(chat_id: str):
    """
    Return all sources attached to a chat.
    """

    chat_manager = ChatManager()

    sources = chat_manager.get_chat_sources(
        chat_id,
    )

    return [
        {
            "source_id": source.source_id,
            "filename": source.filename,
            "type": source.type,
            "status": source.status,
        }
        for source in sources
    ]


@router.get("/{chat_id}/messages")
def get_chat_messages(chat_id: str):
    """
    Return all messages belonging to a chat.
    """

    chat_manager = ChatManager()

    messages = chat_manager.get_messages(
        chat_id,
    )

    return [
        {
            "id": message.id,
            "question": message.question,
            "answer": message.answer,
            "citations": message.citations,
            "created_at": message.created_at,
        }
        for message in messages
    ]


class MessageRequest(BaseModel):
    """
    Request body for asking a question in a chat.
    """

    question: str


@router.post("/{chat_id}/messages")
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
        return {
            "error": "Chat not found."
        }

    if not request.question.strip():
        return {
            "error": "Question cannot be empty."
        }

    sources = chat_manager.get_chat_sources(
        chat_id
    )

    source_ids = [
        source.source_id
        for source in sources
    ]

    if not source_ids:
        return {
            "error": "No sources are attached to this chat."
        }

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