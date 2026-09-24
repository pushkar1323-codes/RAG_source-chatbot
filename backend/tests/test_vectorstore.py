from app.embeddings.embedding_service import create_embedding_model
from app.vectorstore.chroma_store import (
    CHROMA_DIRECTORY,
    COLLECTION_NAME,
    create_vector_store,
)


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
    assert len(stored_data["ids"]) >= 21