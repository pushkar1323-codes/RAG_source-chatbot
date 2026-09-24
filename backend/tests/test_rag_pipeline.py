import hashlib
import re
from pathlib import Path

import pytest
from langchain_core.embeddings import Embeddings

from app.database.database import SessionLocal
from app.database.models import SourceModel
from app.generation.citations import build_citations
from app.ingestion.source_ingestion import ingest_source
from app.rag.rag_service import RAGResponse, RAGService
from app.retrieval.relevance import check_relevance
from app.retrieval.retriever import (
    create_retriever,
    retrieve_documents,
)
from app.sources.source import Source, attach_source_metadata
from app.sources.source_manager import SourceManager
from app.vectorstore.chroma_store import (
    add_documents,
    create_vector_store,
)


class FakeEmbeddingModel(Embeddings):
    """
    Deterministic local embedding model used only by tests.

    The vector is based on hashed token positions so related text
    shares dimensions while remaining independent of external APIs.
    """

    DIMENSION = 3072

    def _embed(self, text: str) -> list[float]:
        vector = [0.0] * self.DIMENSION

        tokens = re.findall(r"\b\w+\b", text.lower())

        for token in tokens:
            digest = hashlib.sha256(
                token.encode("utf-8")
            ).digest()

            index = int.from_bytes(
                digest[:4],
                byteorder="big",
            ) % self.DIMENSION

            vector[index] += 1.0

        magnitude = sum(value * value for value in vector) ** 0.5

        if magnitude == 0:
            return vector

        return [
            value / magnitude
            for value in vector
        ]

    def embed_documents(
        self,
        texts: list[str],
    ) -> list[list[float]]:
        return [
            self._embed(text)
            for text in texts
        ]

    def embed_query(
        self,
        text: str,
    ) -> list[float]:
        return self._embed(text)


@pytest.fixture(autouse=True)
def cleanup_test_sources():
    """
    Remove source records created by tests while preserving
    sources that existed before each test.
    """

    with SessionLocal() as session:
        existing_ids = {
            source.source_id
            for source in session.query(SourceModel).all()
        }

    yield

    with SessionLocal() as session:
        current_sources = session.query(SourceModel).all()

        for source in current_sources:
            if source.source_id not in existing_ids:
                session.delete(source)

        session.commit()


def populate_test_vector_store(vector_store):
    pdf_source = Source(
        source_id="test-aws-pdf",
        filename="AWS_Exam.pdf",
        type="pdf",
        path="data/AWS_Exam.pdf",
    )

    text_source = Source(
        source_id="test-aws-text",
        filename="AWS_Exam.txt",
        type="txt",
        path="data/AWS_Exam.txt",
    )

    pdf_chunks = ingest_source(pdf_source)
    text_chunks = ingest_source(text_source)

    add_documents(
        vector_store,
        pdf_chunks,
    )

    add_documents(
        vector_store,
        text_chunks,
    )


def create_test_vector_store(
    persist_directory,
):
    embedding_model = FakeEmbeddingModel()

    vector_store = create_vector_store(
        embedding_model,
        persist_directory=persist_directory,
    )

    populate_test_vector_store(
        vector_store
    )

    return vector_store


def create_test_retriever(
    source_ids=None,
    persist_directory=None,
):
    vector_store = create_test_vector_store(
        persist_directory=persist_directory,
    )

    return create_retriever(
        vector_store,
        k=4,
        source_ids=source_ids,
    )


def test_retrieval(tmp_path):
    retriever = create_test_retriever(
        source_ids=[
            "test-aws-pdf",
            "test-aws-text",
        ],
        persist_directory=tmp_path / "chroma",
    )

    documents = retrieve_documents(
        retriever,
        "What is Amazon EC2?",
    )

    assert len(documents) == 4


def test_relevance_positive(tmp_path):
    retriever = create_test_retriever(
        source_ids=[
            "test-aws-pdf",
            "test-aws-text",
        ],
        persist_directory=tmp_path / "chroma",
    )

    documents = retrieve_documents(
        retriever,
        "What is EC2?",
    )

    assert check_relevance(
        query="What is EC2?",
        documents=documents,
    ) is True


def test_relevance_negative(tmp_path):
    retriever = create_test_retriever(
        source_ids=[
            "test-aws-pdf",
            "test-aws-text",
        ],
        persist_directory=tmp_path / "chroma",
    )

    documents = retrieve_documents(
        retriever,
        "Who is the current CEO of Microsoft?",
    )

    assert check_relevance(
        query="Who is the current CEO of Microsoft?",
        documents=documents,
    ) is False


def test_citations(tmp_path):
    retriever = create_test_retriever(
        source_ids=[
            "test-aws-pdf",
            "test-aws-text",
        ],
        persist_directory=tmp_path / "chroma",
    )

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


def test_source_model():
    source = Source(
        source_id="test-source-1",
        filename="AWS_Exam.pdf",
        type="pdf",
        path="data/AWS_Exam.pdf",
        metadata={
            "pages": 13,
        },
    )

    assert source.source_id == "test-source-1"
    assert source.filename == "AWS_Exam.pdf"
    assert source.type == "pdf"
    assert source.path == "data/AWS_Exam.pdf"
    assert source.metadata["pages"] == 13
    assert source.status == "ready"


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


def test_source_manager_registers_file():
    manager = SourceManager()

    source = manager.register_file(
        "data/AWS_Exam.pdf",
        "pdf",
    )

    assert source.source_id
    assert source.filename == "AWS_Exam.pdf"
    assert source.type == "pdf"
    assert source.path == str(Path("data/AWS_Exam.pdf"))
    assert source.status == "ready"

    stored_source = manager.get_source(
        source.source_id
    )

    assert stored_source is not None
    assert stored_source.source_id == source.source_id
    assert stored_source.filename == source.filename
    assert stored_source.type == source.type
    assert stored_source.path == source.path


def test_source_manager_reuses_same_file():
    manager = SourceManager()

    first_source = manager.register_file(
        "data/AWS_Exam.pdf",
        "pdf",
    )

    second_source = manager.register_file(
        "data/AWS_Exam.pdf",
        "pdf",
    )

    assert first_source.source_id == second_source.source_id
    assert first_source.filename == second_source.filename
    assert first_source.path == second_source.path


def test_source_manager_reuses_same_content_with_different_filename(
    tmp_path,
):
    manager = SourceManager()

    original_file = tmp_path / "original.txt"
    renamed_file = tmp_path / "renamed.txt"

    content = "This is the same source content."

    original_file.write_text(
        content,
        encoding="utf-8",
    )

    renamed_file.write_text(
        content,
        encoding="utf-8",
    )

    first_source = manager.register_file(
        original_file,
        "txt",
    )

    second_source = manager.register_file(
        renamed_file,
        "txt",
    )

    assert first_source.source_id == second_source.source_id
    assert first_source.filename == second_source.filename


def test_rag_service_relevant_question(
    monkeypatch,
    tmp_path,
):
    embedding_model = FakeEmbeddingModel()

    vector_store = create_test_vector_store(
        persist_directory=tmp_path / "chroma",
    )

    monkeypatch.setattr(
        "app.rag.rag_service.create_vector_store",
        lambda embedding_model: vector_store,
    )

    service = RAGService(
        embedding_model=embedding_model,
        llm=object(),
        k=4,
    )

    def fake_generate_answer(
        llm,
        question,
        context,
    ):
        assert question == "What is EC2?"
        assert context

        return "EC2 provides virtual servers."

    monkeypatch.setattr(
        "app.rag.rag_service.generate_answer",
        fake_generate_answer,
    )

    response = service.ask(
        question="What is EC2?",
        source_ids=[
            "test-aws-pdf",
            "test-aws-text",
        ],
    )

    assert isinstance(
        response,
        RAGResponse,
    )

    assert response.answer == (
        "EC2 provides virtual servers."
    )

    assert len(response.citations) > 0


def test_rag_service_irrelevant_question(
    monkeypatch,
    tmp_path,
):
    embedding_model = FakeEmbeddingModel()

    vector_store = create_test_vector_store(
        persist_directory=tmp_path / "chroma",
    )

    monkeypatch.setattr(
        "app.rag.rag_service.create_vector_store",
        lambda embedding_model: vector_store,
    )

    service = RAGService(
        embedding_model=embedding_model,
        llm=object(),
        k=4,
    )

    def fake_generate_answer(
        llm,
        question,
        context,
    ):
        raise AssertionError(
            "Generation should not happen for an irrelevant question."
        )

    monkeypatch.setattr(
        "app.rag.rag_service.generate_answer",
        fake_generate_answer,
    )

    response = service.ask(
        question="Who is the current CEO of Microsoft?",
        source_ids=[
            "test-aws-pdf",
            "test-aws-text",
        ],
    )

    assert response.answer == (
        "The answer was not found in the provided source."
    )

    assert response.citations == []