from app.ingestion.pdf_loader import load_pdf
from app.ingestion.text_loader import load_text
from app.processing.chunker import split_documents
from app.ingestion.source_ingestion import ingest_source
from app.sources.source import Source

PDF_PATH = "data/AWS_Exam.pdf"
TEXT_PATH = "data/AWS_Exam.txt"


def test_pdf_loader():
    documents = load_pdf(PDF_PATH)

    assert len(documents) == 13
    assert documents[0].page_content
    assert documents[0].metadata["source"]


def test_text_loader():
    documents = load_text(TEXT_PATH)

    assert len(documents) == 1
    assert documents[0].page_content
    assert documents[0].metadata["source"]


def test_pdf_chunking():
    documents = load_pdf(PDF_PATH)
    chunks = split_documents(documents)

    assert len(chunks) > 0
    assert chunks[0].page_content
    assert chunks[0].metadata["source"]


def test_text_chunking():
    documents = load_text(TEXT_PATH)
    chunks = split_documents(documents)

    assert len(chunks) > 0
    assert chunks[0].page_content
    assert chunks[0].metadata["source"]

def test_source_ingestion():
    source = Source(
        source_id="aws-pdf-test",
        filename="AWS_Exam.pdf",
        type="pdf",
        path=PDF_PATH,
    )

    chunks = ingest_source(source)

    assert len(chunks) > 0

    for chunk in chunks:
        assert chunk.metadata["source_id"] == "aws-pdf-test"
        assert chunk.metadata["filename"] == "AWS_Exam.pdf"
        assert chunk.metadata["file_type"] == "pdf"
        assert chunk.metadata["source"] == PDF_PATH

def test_text_source_ingestion():
    source = Source(
        source_id="aws-text-test",
        filename="AWS_Exam.txt",
        type="txt",
        path=TEXT_PATH,
    )

    chunks = ingest_source(source)

    assert len(chunks) > 0

    for chunk in chunks:
        assert chunk.metadata["source_id"] == "aws-text-test"
        assert chunk.metadata["filename"] == "AWS_Exam.txt"
        assert chunk.metadata["file_type"] == "txt"
        assert chunk.metadata["source"] == TEXT_PATH