from app.ingestion.pdf_loader import load_pdf
from app.ingestion.text_loader import load_text
from app.processing.chunker import split_documents


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