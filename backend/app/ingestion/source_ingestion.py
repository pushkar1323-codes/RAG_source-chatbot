from pathlib import Path

from langchain_core.documents import Document

from app.ingestion.pdf_loader import load_pdf
from app.ingestion.text_loader import load_text
from app.processing.chunker import split_documents
from app.sources.source import Source, attach_source_metadata


def ingest_source(source: Source) -> list[Document]:
    """
    Load, chunk, and attach source metadata to a source.
    """

    if source.type == "pdf":
        if not source.path:
            raise ValueError("PDF source requires a path.")

        documents = load_pdf(source.path)

    elif source.type == "txt":
        if not source.path:
            raise ValueError("TXT source requires a path.")

        documents = load_text(source.path)

    else:
        raise ValueError(
            f"Unsupported source type: {source.type}"
        )

    chunks = split_documents(documents)

    chunks = attach_source_metadata(
        chunks,
        source,
    )

    return chunks