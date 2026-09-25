from pathlib import Path
from uuid import uuid4

from app.embeddings.embedding_service import create_embedding_model
from app.ingestion.source_ingestion import ingest_source
from app.sources.source import Source
from app.vectorstore.chroma_store import (
    add_documents,
    create_vector_store,
)


SUPPORTED_FILE_TYPES = {
    ".pdf": "pdf",
    ".txt": "txt",
}


class GuestSourceService:
    """
    Processes temporary guest sources without creating persistent
    user or source records.
    """

    def process_file(
        self,
        file_path: str | Path,
        original_filename: str | None = None,
    ) -> Source:
        """
        Process a temporary guest source and add its chunks to the
        shared vector store without persisting the source in the
        application database.
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

        filename = original_filename or path.name

        source = Source(
            source_id=f"guest-{uuid4()}",
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

        return source