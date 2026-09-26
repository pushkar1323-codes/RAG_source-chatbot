import re
from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, File, Header, HTTPException, UploadFile
from langchain_google_genai.chat_models import GoogleRateLimitError

from app.api.schemas import (
    CitationResponse,
    GuestAnswerResponse,
    GuestAskRequest,
    SourceResponse,
)
from app.embeddings.embedding_service import create_embedding_model
from app.ingestion.source_ingestion import ingest_source
from app.rag.rag_service import RAGService
from app.sources.source import Source
from app.vectorstore.chroma_store import add_documents, create_vector_store


router = APIRouter(
    prefix="/guest",
    tags=["Guest"],
)

GUEST_UPLOAD_DIRECTORY = (
    Path(__file__).resolve().parents[3]
    / "data"
    / "guest_uploads"
)

SUPPORTED_FILE_TYPES = {
    ".pdf": "pdf",
    ".txt": "txt",
}

_guest_sources: dict[str, dict[str, Source]] = {}


def get_guest_session(
    session_id: str | None,
) -> str:
    if not session_id:
        raise HTTPException(
            status_code=400,
            detail="Valid guest session is required.",
        )

    if not re.fullmatch(
        r"[0-9a-fA-F-]{36}",
        session_id,
    ):
        raise HTTPException(
            status_code=400,
            detail="Invalid guest session.",
        )

    return session_id


def get_session_sources(
    session_id: str,
) -> dict[str, Source]:
    return _guest_sources.setdefault(
        session_id,
        {},
    )


@router.get(
    "/sources",
    response_model=list[SourceResponse],
)
def list_guest_sources(
    x_guest_session_id: str | None = Header(default=None),
):
    session_id = get_guest_session(
        x_guest_session_id
    )

    return list(
        get_session_sources(session_id).values()
    )


@router.post(
    "/sources",
    response_model=SourceResponse,
)
async def upload_guest_source(
    file: UploadFile = File(...),
    x_guest_session_id: str | None = Header(default=None),
):
    session_id = get_guest_session(
        x_guest_session_id
    )

    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="Filename is required.",
        )

    extension = Path(file.filename).suffix.lower()

    file_type = SUPPORTED_FILE_TYPES.get(extension)

    if not file_type:
        raise HTTPException(
            status_code=415,
            detail=f"Unsupported file type: {extension}",
        )

    session_directory = (
        GUEST_UPLOAD_DIRECTORY / session_id
    )

    session_directory.mkdir(
        parents=True,
        exist_ok=True,
    )

    stored_path = (
        session_directory
        / f"{uuid4()}_{file.filename}"
    )

    contents = await file.read()

    if not contents:
        raise HTTPException(
            status_code=400,
            detail="Uploaded file is empty.",
        )

    stored_path.write_bytes(contents)

    source_id = f"guest-{session_id}-{uuid4()}"

    source = Source(
        source_id=source_id,
        filename=file.filename,
        type=file_type,
        path=str(stored_path),
        status="ready",
    )

    try:
        chunks = ingest_source(source)

        embedding_model = create_embedding_model()

        vector_store = create_vector_store(
            embedding_model,
        )

        add_documents(
            vector_store,
            chunks,
        )

    except Exception:
        if stored_path.exists():
            stored_path.unlink()

        raise

    get_session_sources(session_id)[
        source_id
    ] = source

    return source


@router.post(
    "/ask",
    response_model=GuestAnswerResponse,
)
def ask_guest(
    request: GuestAskRequest,
    x_guest_session_id: str | None = Header(default=None),
):
    session_id = get_guest_session(
        x_guest_session_id
    )

    if not request.question.strip():
        raise HTTPException(
            status_code=400,
            detail="Question cannot be empty.",
        )

    if not request.source_ids:
        raise HTTPException(
            status_code=400,
            detail="At least one source is required.",
        )

    session_sources = get_session_sources(
        session_id
    )

    missing_sources = [
        source_id
        for source_id in request.source_ids
        if source_id not in session_sources
    ]

    if missing_sources:
        raise HTTPException(
            status_code=404,
            detail="One or more guest sources were not found.",
        )

    embedding_model = create_embedding_model()

    rag_service = RAGService(
        embedding_model=embedding_model,
    )

    try:
        response = rag_service.ask(
            question=request.question,
            source_ids=request.source_ids,
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

    return {
        "answer": response.answer,
        "citations": response.citations,
    }