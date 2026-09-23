from langchain_chroma import Chroma
from langchain_core.documents import Document


def create_retriever(
    vector_store: Chroma,
    k: int = 4,
):
    """
    Create an MMR retriever from the Chroma vector store.
    """

    retriever = vector_store.as_retriever(
        search_type="mmr",
        search_kwargs={
            "k": k,
            "fetch_k": 10,
        },
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