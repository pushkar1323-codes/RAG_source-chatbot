from app.embeddings.embedding_service import create_embedding_model
from app.vectorstore.chroma_store import (
    CHROMA_DIRECTORY,
    COLLECTION_NAME,
    create_vector_store,
)
from app.ingestion.source_ingestion import ingest_source
from app.sources.source import Source
from app.vectorstore.chroma_store import add_documents

def test_embedding_model():
    embedding_model = create_embedding_model()

    vector = embedding_model.embed_query(
        "What is Amazon EC2?"
    )

    assert len(vector) == 3072


def test_chroma_persistence():
    embedding_model = create_embedding_model()

    vector_store = create_vector_store(
        embedding_model
    )

    stored_data = vector_store.get()

    assert CHROMA_DIRECTORY.exists()
    assert COLLECTION_NAME == "rag_documents"
    assert len(stored_data["ids"]) > 0

def test_source_isolated_storage():
    embedding_model = create_embedding_model()

    vector_store = create_vector_store(
        embedding_model
    )

    pdf_source = Source(
        source_id="aws-pdf",
        filename="AWS_Exam.pdf",
        type="pdf",
        path="data/AWS_Exam.pdf",
    )

    text_source = Source(
        source_id="aws-text",
        filename="AWS_Exam.txt",
        type="txt",
        path="data/AWS_Exam.txt",
    )

    pdf_chunks = ingest_source(pdf_source)
    text_chunks = ingest_source(text_source)

    pdf_ids = add_documents(
        vector_store,
        pdf_chunks,
    )

    text_ids = add_documents(
        vector_store,
        text_chunks,
    )

    assert len(pdf_ids) > 0
    assert len(text_ids) > 0

    stored_data = vector_store.get(
        include=["metadatas"]
    )

    source_ids = {
        metadata["source_id"]
        for metadata in stored_data["metadatas"]
    }

    assert "aws-pdf" in source_ids
    assert "aws-text" in source_ids