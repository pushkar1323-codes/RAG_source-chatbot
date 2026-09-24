from langchain_core.documents import Document


def build_citations(documents: list[Document]) -> list[dict]:
    """
    Build unique source citations from retrieved documents.
    """

    citations = []
    seen = set()

    for document in documents:
        metadata = document.metadata

        citation = {
            "source": metadata.get("source"),
            "page": metadata.get("page_label"),
        }

        citation_key = (
            citation["source"],
            citation["page"],
        )

        if citation_key in seen:
            continue

        seen.add(citation_key)
        citations.append(citation)

    return citations