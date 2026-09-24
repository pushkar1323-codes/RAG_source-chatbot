from app.embeddings.embedding_service import create_embedding_model
from app.generation.citations import build_citations
from app.retrieval.relevance import check_relevance
from app.retrieval.retriever import (
    create_retriever,
    retrieve_documents,
)
from app.vectorstore.chroma_store import create_vector_store


def create_test_retriever():
    embedding_model = create_embedding_model()

    vector_store = create_vector_store(
        embedding_model
    )

    return create_retriever(
        vector_store,
        k=4,
    )


def test_retrieval():
    retriever = create_test_retriever()

    documents = retrieve_documents(
        retriever,
        "What is Amazon EC2?",
    )

    assert len(documents) == 4


def test_relevance_positive():
    retriever = create_test_retriever()

    documents = retrieve_documents(
        retriever,
        "What is EC2?",
    )

    assert check_relevance(
        query="What is EC2?",
        documents=documents,
    ) is True


def test_relevance_negative():
    retriever = create_test_retriever()

    documents = retrieve_documents(
        retriever,
        "Who is the current CEO of Microsoft?",
    )

    assert check_relevance(
        query="Who is the current CEO of Microsoft?",
        documents=documents,
    ) is False


def test_citations():
    retriever = create_test_retriever()

    documents = retrieve_documents(
        retriever,
        "What is EC2?",
    )

    citations = build_citations(documents)

    assert len(citations) > 0

    citation_keys = {
        (
            citation["source"],
            citation["page"],
        )
        for citation in citations
    }

    assert len(citation_keys) == len(citations)
    