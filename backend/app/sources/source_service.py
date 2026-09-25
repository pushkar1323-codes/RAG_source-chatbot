from pathlib import Path

from app.database.database import SessionLocal
from app.database.models import UserModel
from app.embeddings.embedding_service import create_embedding_model
from app.ingestion.source_ingestion import ingest_source
from app.sources.source import Source
from app.sources.source_manager import SourceManager
from app.vectorstore.chroma_store import (
    add_documents,
    create_vector_store,
    delete_source_documents,
)


SUPPORTED_FILE_TYPES = {
    ".pdf": "pdf",
    ".txt": "txt",
}

LEGACY_USER_EMAIL = "legacy@contextbridge.local"


class SourceService:
    """
    Coordinates source registration, ingestion, embedding,
    vector storage, and source deletion.
    """

    def __init__(self):
        self.source_manager = SourceManager()

    def _resolve_user_id(
        self,
        user_id: str | None,
    ) -> str:
        """
        Resolve a user ID for source processing.

        Authenticated API requests provide an explicit user ID.
        The legacy account is retained for existing internal callers
        and development data.
        """

        if user_id:
            return user_id

        with SessionLocal() as session:
            user = (
                session.query(UserModel)
                .filter(
                    UserModel.email == LEGACY_USER_EMAIL,
                )
                .first()
            )

            if not user:
                raise ValueError(
                    "Unable to resolve the source owner."
                )

            return user.id

    def process_file(
        self,
        file_path: str | Path,
        original_filename: str | None = None,
        user_id: str | None = None,
    ) -> Source:
        """
        Process a local file and make it available for RAG.
        """

        path = Path(file_path)

        if not path.exists():
            raise FileNotFoundError(
                f"Source file not found: {path}"
            )

        file_type = SUPPORTED_FILE_TYPES.get(
            path.suffix.lower()
        )

        if not file_type:
            raise ValueError(
                f"Unsupported file type: {path.suffix}"
            )

        resolved_user_id = self._resolve_user_id(
            user_id
        )

        source_id = (
            self.source_manager.generate_user_source_id(
                path,
                resolved_user_id,
            )
        )

        existing_source = self.source_manager.get_source(
            source_id,
            user_id=resolved_user_id,
        )

        if existing_source:
            return existing_source

        filename = original_filename or path.name

        source = Source(
            source_id=source_id,
            filename=filename,
            type=file_type,
            path=str(path),
            status="ready",
        )

        chunks = ingest_source(source)

        embedding_model = create_embedding_model()

        vector_store = create_vector_store(
            embedding_model
        )

        add_documents(
            vector_store,
            chunks,
        )

        source = self.source_manager.register_file(
            path,
            file_type,
            filename=filename,
            user_id=resolved_user_id,
        )

        return source

    def delete_source(
        self,
        source_id: str,
        user_id: str | None = None,
    ) -> Source | None:
        """
        Permanently delete a user's source from the vector store
        and persistent source storage.
        """

        resolved_user_id = self._resolve_user_id(
            user_id
        )

        source = self.source_manager.get_source(
            source_id,
            user_id=resolved_user_id,
        )

        if not source:
            return None

        embedding_model = create_embedding_model()

        vector_store = create_vector_store(
            embedding_model
        )

        delete_source_documents(
            vector_store,
            source_id,
        )

        return self.source_manager.delete_source(
            source_id,
            user_id=resolved_user_id,
        )