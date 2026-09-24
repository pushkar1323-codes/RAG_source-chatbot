from typing import Any

from langchain_chroma import Chroma
from langchain_core.documents import Document


def create_retriever(
    vector_store: Chroma,
    k: int = 4,
    source_ids: list[str] | None = None,
):
    """
    Create an MMR retriever with an optional source filter.
    """

    search_kwargs: dict[str, Any] = {
        "k": k,
        "fetch_k": 10,
    }

    if source_ids:
        search_kwargs["filter"] = {
            "source_id": {
                "$in": source_ids,
            }
        }

    retriever = vector_store.as_retriever(
        search_type="mmr",
        search_kwargs=search_kwargs,
    )

    return retriever


def retrieve_documents(
    retriever,
    query: str,
) -> list[Document]:
    """
    Retrieve relevant documents for a query.
    """

    if not query.strip():
        raise ValueError("Query cannot be empty.")

    documents = retriever.invoke(query)

    return documents