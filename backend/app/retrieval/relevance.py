import re

from langchain_core.documents import Document


STOP_WORDS = {
    "the",
    "what",
    "who",
    "when",
    "where",
    "why",
    "how",
    "is",
    "are",
    "was",
    "were",
    "a",
    "an",
    "of",
    "to",
    "for",
    "in",
    "on",
    "at",
    "and",
    "or",
    "with",
    "from",
}


def check_relevance(
    query: str,
    documents: list[Document],
    min_matches: int = 1,
) -> bool:
    """
    Check whether the retrieved documents contain meaningful
    terms from the query.
    """

    if not query.strip():
        raise ValueError("Query cannot be empty.")

    if not documents:
        return False

    query_terms = {
        term
        for term in re.findall(r"\b\w+\b", query.lower())
        if len(term) > 2 and term not in STOP_WORDS
    }

    if not query_terms:
        return False

    matched_terms = set()

    for document in documents:
        content = document.page_content.lower()

        for term in query_terms:
            if term in content:
                matched_terms.add(term)

    return len(matched_terms) >= min_matches