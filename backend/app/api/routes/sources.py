from pathlib import Path
from uuid import uuid4

from fastapi import (
    APIRouter,
    Depends,
    File,
    HTTPException,
    UploadFile,
)

from app.auth.dependencies import get_current_user
from app.database.models import UserModel
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
def list_sources(
    current_user: UserModel = Depends(get_current_user),
):
    """
    Return all sources belonging to the authenticated user.
    """

    source_manager = SourceManager()

    sources = source_manager.list_sources(
        user_id=current_user.id,
    )

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
    current_user: UserModel = Depends(get_current_user),
):
    """
    Upload and process a supported source file for the
    authenticated user.
    """

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
            upload_path,
            original_filename=file.filename,
            user_id=current_user.id,
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


@router.delete("/{source_id}")
def delete_source(
    source_id: str,
    current_user: UserModel = Depends(get_current_user),
):
    """
    Permanently delete a source belonging to the authenticated user.
    """

    source_service = SourceService()

    source = source_service.delete_source(
        source_id,
        user_id=current_user.id,
    )

    if not source:
        raise HTTPException(
            status_code=404,
            detail="Source not found.",
        )

    return {
        "source_id": source.source_id,
        "filename": source.filename,
        "status": "deleted",
    }