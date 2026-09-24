import hashlib
import re

from langchain_core.embeddings import Embeddings

from app.vectorstore.chroma_store import (
    CHROMA_DIRECTORY,
    COLLECTION_NAME,
    create_vector_store,
)
from app.ingestion.source_ingestion import ingest_source
from app.sources.source import Source
from app.vectorstore.chroma_store import add_documents


class FakeEmbeddingModel(Embeddings):
    """
    Deterministic local embedding model used only by tests.
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


def test_embedding_model():
    embedding_model = FakeEmbeddingModel()

    vector = embedding_model.embed_query(
        "What is Amazon EC2?"
    )

    assert len(vector) == 3072


def test_chroma_persistence(tmp_path):
    embedding_model = FakeEmbeddingModel()

    persist_directory = tmp_path / "chroma"

    vector_store = create_vector_store(
        embedding_model,
        persist_directory=persist_directory,
    )

    source = Source(
        source_id="test-persistence",
        filename="AWS_Exam.txt",
        type="txt",
        path="data/AWS_Exam.txt",
    )

    chunks = ingest_source(source)

    document_ids = add_documents(
        vector_store,
        chunks,
    )

    assert len(document_ids) > 0
    assert persist_directory.exists()
    assert COLLECTION_NAME == "rag_documents"

    reopened_store = create_vector_store(
        embedding_model,
        persist_directory=persist_directory,
    )

    stored_data = reopened_store.get()

    assert len(stored_data["ids"]) > 0


def test_source_isolated_storage(tmp_path):
    embedding_model = FakeEmbeddingModel()

    vector_store = create_vector_store(
        embedding_model,
        persist_directory=tmp_path / "chroma",
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