from pathlib import Path

from langchain_chroma import Chroma
from langchain_core.documents import Document
from langchain_google_genai import GoogleGenerativeAIEmbeddings


PROJECT_ROOT = Path(__file__).resolve().parents[3]

CHROMA_DIRECTORY = PROJECT_ROOT / "backend" / "chroma_db"
COLLECTION_NAME = "rag_documents"


def create_vector_store(
    embedding_model: GoogleGenerativeAIEmbeddings,
) -> Chroma:
    """
    Create or open the persistent Chroma vector store.
    """

    CHROMA_DIRECTORY.mkdir(parents=True, exist_ok=True)

    vector_store = Chroma(
        collection_name=COLLECTION_NAME,
        embedding_function=embedding_model,
        persist_directory=str(CHROMA_DIRECTORY),
    )

    return vector_store


def add_documents(
    vector_store: Chroma,
    documents: list[Document],
) -> list[str]:
    """
    Add documents and their embeddings to the vector store.
    """

    document_ids = vector_store.add_documents(documents)

    return document_ids