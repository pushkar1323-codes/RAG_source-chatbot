from pathlib import Path

from langchain_community.document_loaders import TextLoader
from langchain_core.documents import Document


def load_text(file_path: str | Path) -> list[Document]:
    """
    Load a text file and return it as LangChain Document objects.
    """

    path = Path(file_path)

    if not path.exists():
        raise FileNotFoundError(f"Text file not found: {path}")

    if path.suffix.lower() != ".txt":
        raise ValueError(f"Expected a TXT file, got: {path.suffix}")

    loader = TextLoader(
        str(path),
        encoding="utf-8",
    )

    documents = loader.load()

    return documents