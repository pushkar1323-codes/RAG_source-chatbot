import json
import re
from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, File, Header, HTTPException, UploadFile

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

MANIFEST_FILENAME = "manifest.json"

_guest_sources: dict[str, dict[str, Source]] = {}
_loaded_sessions: set[str] = set()


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


def get_session_directory(
    session_id: str,
) -> Path:
    return GUEST_UPLOAD_DIRECTORY / session_id


def get_manifest_path(
    session_id: str,
) -> Path:
    return get_session_directory(session_id) / MANIFEST_FILENAME


def source_to_dict(
    source: Source,
) -> dict:
    return {
        "source_id": source.source_id,
        "filename": source.filename,
        "type": source.type,
        "path": source.path,
        "url": source.url,
        "metadata": source.metadata,
        "status": source.status,
    }


def source_from_dict(
    data: dict,
) -> Source:
    return Source(
        source_id=data["source_id"],
        filename=data["filename"],
        type=data["type"],
        path=data.get("path"),
        url=data.get("url"),
        metadata=data.get("metadata") or {},
        status=data.get("status", "ready"),
    )


def save_session_sources(
    session_id: str,
) -> None:
    session_directory = get_session_directory(
        session_id
    )

    session_directory.mkdir(
        parents=True,
        exist_ok=True,
    )

    manifest_path = get_manifest_path(
        session_id
    )

    temporary_path = manifest_path.with_suffix(
        ".tmp"
    )

    data = [
        source_to_dict(source)
        for source in _guest_sources
        .get(session_id, {})
        .values()
    ]

    temporary_path.write_text(
        json.dumps(
            data,
            ensure_ascii=False,
            indent=2,
        ),
        encoding="utf-8",
    )

    temporary_path.replace(manifest_path)


def load_session_sources(
    session_id: str,
) -> dict[str, Source]:
    manifest_path = get_manifest_path(
        session_id
    )

    if not manifest_path.exists():
        return {}

    try:
        data = json.loads(
            manifest_path.read_text(
                encoding="utf-8"
            )
        )
    except (OSError, json.JSONDecodeError):
        return {}

    sources: dict[str, Source] = {}

    for item in data:
        try:
            source = source_from_dict(item)
        except (KeyError, TypeError):
            continue

        if source.path:
            source_path = Path(source.path)

            if not source_path.exists():
                continue

        sources[source.source_id] = source

    return sources


def get_session_sources(
    session_id: str,
) -> dict[str, Source]:
    if session_id not in _loaded_sessions:
        _guest_sources[session_id] = (
            load_session_sources(session_id)
        )
        _loaded_sessions.add(session_id)

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

    session_directory = get_session_directory(
        session_id
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

        session_sources = get_session_sources(
            session_id
        )

        session_sources[source_id] = source

        save_session_sources(
            session_id
        )

    except Exception:
        if stored_path.exists():
            stored_path.unlink()

        raise

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

    response = rag_service.ask(
        question=request.question,
        source_ids=request.source_ids,
    )

    return {
        "answer": response.answer,
        "citations": response.citations,
    }