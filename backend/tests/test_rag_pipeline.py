from app.embeddings.embedding_service import create_embedding_model
from app.generation.citations import build_citations
from app.retrieval.relevance import check_relevance
from app.retrieval.retriever import (
    create_retriever,
    retrieve_documents,
)
from app.ingestion.source_ingestion import ingest_source
from app.sources.source import Source, attach_source_metadata
from app.vectorstore.chroma_store import (
    add_documents,
    create_vector_store,
)
from app.sources.source_manager import SourceManager
from pathlib import Path
from app.rag.rag_service import RAGResponse, RAGService


def populate_test_vector_store(vector_store):
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

    add_documents(
        vector_store,
        pdf_chunks,
    )

    add_documents(
        vector_store,
        text_chunks,
    )

def create_test_retriever(
    source_ids=None,
):
    embedding_model = create_embedding_model()

    vector_store = create_vector_store(
        embedding_model
    )

    stored_data = vector_store.get()

    if not stored_data["ids"]:
        populate_test_vector_store(vector_store)

    return create_retriever(
        vector_store,
        k=4,
        source_ids=source_ids,
    )


def test_retrieval():
    retriever = create_test_retriever(
        source_ids=["aws-pdf", "aws-text"]
    )

    documents = retrieve_documents(
        retriever,
        "What is Amazon EC2?",
    )

    assert len(documents) == 4


def test_relevance_positive():
    retriever = create_test_retriever(
        source_ids=["aws-pdf", "aws-text"]
    )

    documents = retrieve_documents(
        retriever,
        "What is EC2?",
    )

    assert check_relevance(
        query="What is EC2?",
        documents=documents,
    ) is True


def test_relevance_negative():
    retriever = create_test_retriever(
        source_ids=["aws-pdf", "aws-text"]
    )

    documents = retrieve_documents(
        retriever,
        "Who is the current CEO of Microsoft?",
    )

    assert check_relevance(
        query="Who is the current CEO of Microsoft?",
        documents=documents,
    ) is False


def test_citations():
    retriever = create_test_retriever(
        source_ids=["aws-pdf", "aws-text"]
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
            "pages": 13
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

    assert manager.get_source(
        source.source_id
    ) is source


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
    assert first_source is second_source
    assert len(manager.list_sources()) == 1


def test_source_manager_reuses_same_content_with_different_filename(tmp_path):
    manager = SourceManager()

    original_file = tmp_path / "original.txt"
    renamed_file = tmp_path / "renamed.txt"

    content = "This is the same source content."

    original_file.write_text(content, encoding="utf-8")
    renamed_file.write_text(content, encoding="utf-8")

    first_source = manager.register_file(
        original_file,
        "txt",
    )

    second_source = manager.register_file(
        renamed_file,
        "txt",
    )

    assert first_source.source_id == second_source.source_id
    assert len(manager.list_sources()) == 1


def test_rag_service_relevant_question(monkeypatch):
    embedding_model = create_embedding_model()

    service = RAGService(
        embedding_model=embedding_model,
        llm=object(),
        k=4,
    )

    def fake_generate_answer(llm, question, context):
        assert question == "What is EC2?"
        assert context
        return "EC2 provides virtual servers."

    monkeypatch.setattr(
        "app.rag.rag_service.generate_answer",
        fake_generate_answer,
    )

    response = service.ask(
        question="What is EC2?",
        source_ids=["aws-pdf", "aws-text"],
    )

    assert isinstance(response, RAGResponse)
    assert response.answer == "EC2 provides virtual servers."
    assert len(response.citations) > 0


def test_rag_service_irrelevant_question(monkeypatch):
    embedding_model = create_embedding_model()

    service = RAGService(
        embedding_model=embedding_model,
        llm=object(),
        k=4,
    )

    def fake_generate_answer(llm, question, context):
        raise AssertionError(
            "Generation should not happen for an irrelevant question."
        )

    monkeypatch.setattr(
        "app.rag.rag_service.generate_answer",
        fake_generate_answer,
    )

    response = service.ask(
        question="Who is the current CEO of Microsoft?",
        source_ids=["aws-pdf", "aws-text"],
    )

    assert response.answer == (
        "The answer was not found in the provided source."
    )

    assert response.citations == []