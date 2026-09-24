from pathlib import Path

from app.embeddings.embedding_service import create_embedding_model
from app.ingestion.source_ingestion import ingest_source
from app.sources.source import Source
from app.sources.source_manager import SourceManager
from app.vectorstore.chroma_store import add_documents, create_vector_store


SUPPORTED_FILE_TYPES = {
    ".pdf": "pdf",
    ".txt": "txt",
}


class SourceService:
    """
    Coordinates source registration, ingestion, embedding,
    and vector storage.
    """

    def __init__(self):
        self.source_manager = SourceManager()

    def process_file(
        self,
        file_path: str | Path,
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

        source_id = self.source_manager.generate_source_id(
            path
        )

        existing_source = self.source_manager.get_source(
            source_id
        )

        if existing_source:
            return existing_source

        source = Source(
            source_id=source_id,
            filename=path.name,
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
        )

        return source