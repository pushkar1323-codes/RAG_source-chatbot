from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, File, HTTPException, UploadFile

from app.sources.source_manager import SourceManager
from app.sources.source_service import SourceService


UPLOAD_DIRECTORY = (
    Path(__file__).resolve().parents[3]
    / "data"
    / "uploads"
)

SUPPORTED_FILE_TYPES = {
    ".pdf": "pdf",
    ".txt": "txt",
}


router = APIRouter(
    prefix="/sources",
    tags=["Sources"],
)


@router.get("")
def list_sources():
    """
    Return all registered sources.
    """

    source_manager = SourceManager()
    sources = source_manager.list_sources()

    return [
        {
            "source_id": source.source_id,
            "filename": source.filename,
            "type": source.type,
            "path": source.path,
            "url": source.url,
            "metadata": source.metadata,
            "status": source.status,
        }
        for source in sources
    ]


@router.post("")
async def upload_source(
    file: UploadFile = File(...),
):
    """
    Upload and process a supported source file.
    """

    if not file.filename:
        raise ValueError("Filename is required.")

    extension = Path(file.filename).suffix.lower()

    file_type = SUPPORTED_FILE_TYPES.get(extension)

    if not file_type:
        raise HTTPException(
            status_code=415,
            detail=f"Unsupported file type: {extension}",
        )   

    UPLOAD_DIRECTORY.mkdir(
        parents=True,
        exist_ok=True,
    )

    upload_path = (
        UPLOAD_DIRECTORY
        / f"{uuid4()}_{file.filename}"
    )

    contents = await file.read()

    with upload_path.open("wb") as destination:
        destination.write(contents)

    source_service = SourceService()

    try:
        source = source_service.process_file(
            upload_path
        )
    finally:
        if upload_path.exists():
            upload_path.unlink()

    return {
        "source_id": source.source_id,
        "filename": source.filename,
        "type": source.type,
        "path": source.path,
        "url": source.url,
        "metadata": source.metadata,
        "status": source.status,
    }