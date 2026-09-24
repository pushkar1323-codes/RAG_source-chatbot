from pathlib import Path

from langchain_chroma import Chroma
from langchain_core.documents import Document
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from app.sources.source import Source, attach_source_metadata

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

def test_source_metadata_propagation():
    from langchain_core.documents import Document

    source = Source(
        source_id="test-source-1",
        filename="AWS_Exam.pdf",
        type="pdf",
        path="data/AWS_Exam.pdf",
    )

    documents = [
        Document(
            page_content="Amazon EC2 provides virtual servers.",
            metadata={
                "page": 1,
                "page_label": "2",
            },
        )
    ]

    documents = attach_source_metadata(
        documents,
        source,
    )

    metadata = documents[0].metadata

    assert metadata["source_id"] == "test-source-1"
    assert metadata["filename"] == "AWS_Exam.pdf"
    assert metadata["file_type"] == "pdf"
    assert metadata["source"] == "data/AWS_Exam.pdf"

    assert metadata["page"] == 1
    assert metadata["page_label"] == "2"