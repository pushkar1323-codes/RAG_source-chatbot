from dataclasses import dataclass, field
from typing import Any

from langchain_core.documents import Document


@dataclass
class Source:
    """
    Represents a source that can be attached to one or more chats.
    """

    source_id: str
    filename: str
    type: str
    path: str | None = None
    url: str | None = None
    metadata: dict[str, Any] = field(default_factory=dict)
    status: str = "ready"


def attach_source_metadata(
    documents: list[Document],
    source: Source,
) -> list[Document]:
    """
    Attach source metadata to every document.
    """

    for document in documents:
        document.metadata.update(
            {
                "source_id": source.source_id,
                "filename": source.filename,
                "file_type": source.type,
            }
        )

        if source.path:
            document.metadata["source"] = source.path

        if source.url:
            document.metadata["url"] = source.url

    return documents