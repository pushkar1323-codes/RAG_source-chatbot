from pathlib import Path

from langchain_chroma import Chroma
from langchain_core.documents import Document
from langchain_core.embeddings import Embeddings


PROJECT_ROOT = Path(__file__).resolve().parents[3]

CHROMA_DIRECTORY = PROJECT_ROOT / "backend" / "chroma_db"
COLLECTION_NAME = "rag_documents"


def create_vector_store(
    embedding_model: Embeddings,
    persist_directory: str | Path | None = None,
) -> Chroma:
    """
    Create or open the persistent Chroma vector store.
    """

    directory = Path(
        persist_directory
        if persist_directory is not None
        else CHROMA_DIRECTORY
    )

    directory.mkdir(
        parents=True,
        exist_ok=True,
    )

    vector_store = Chroma(
        collection_name=COLLECTION_NAME,
        embedding_function=embedding_model,
        persist_directory=str(directory),
    )

    return vector_store


def add_documents(
    vector_store: Chroma,
    documents: list[Document],
) -> list[str]:
    """
    Add documents and their embeddings to the vector store.
    """

    document_ids = vector_store.add_documents(
        documents
    )

    return document_ids