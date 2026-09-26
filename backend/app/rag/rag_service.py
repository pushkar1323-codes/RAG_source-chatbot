from dataclasses import dataclass

from fastapi import HTTPException

from app.generation.answer_generator import create_llm, generate_answer
from app.generation.citations import build_citations
from app.retrieval.relevance import check_relevance
from app.retrieval.retriever import create_retriever, retrieve_documents
from app.vectorstore.chroma_store import create_vector_store


@dataclass
class RAGResponse:
    answer: str
    citations: list[dict]


class RAGService:
    """
    Coordinates retrieval, relevance checking, generation,
    and citation construction.
    """

    def __init__(
        self,
        embedding_model,
        llm=None,
        k: int = 4,
    ):
        self.vector_store = create_vector_store(
            embedding_model
        )

        self.llm = llm or create_llm()
        self.k = k

    @staticmethod
    def _handle_generation_error(exc: Exception) -> None:
        """
        Convert temporary Gemini provider failures into
        appropriate HTTP responses.
        """

        error_text = str(exc).upper()
        error_type = type(exc).__name__.upper()

        is_rate_limit = (
            "429" in error_text
            or "RESOURCE_EXHAUSTED" in error_text
            or "RATELIMIT" in error_type
        )

        if is_rate_limit:
            raise HTTPException(
                status_code=429,
                detail=(
                    "AI generation is temporarily unavailable because "
                    "the Gemini API quota or rate limit has been exceeded. "
                    "Please try again later."
                ),
            ) from exc

        is_service_unavailable = (
            "503" in error_text
            or "UNAVAILABLE" in error_text
            or "OVERLOADED" in error_text
            or "HIGH DEMAND" in error_text
            or "TEMPORARILY UNAVAILABLE" in error_text
        )

        if is_service_unavailable:
            raise HTTPException(
                status_code=503,
                detail=(
                    "AI generation is temporarily unavailable because "
                    "the Gemini service is experiencing high demand. "
                    "Please try again shortly."
                ),
            ) from exc

        raise exc

    def ask(
        self,
        question: str,
        source_ids: list[str],
    ) -> RAGResponse:
        """
        Answer a question using only the selected sources.
        """

        if not question.strip():
            raise ValueError("Question cannot be empty.")

        if not source_ids:
            raise ValueError(
                "At least one source must be selected."
            )

        retriever = create_retriever(
            self.vector_store,
            k=self.k,
            source_ids=source_ids,
        )

        documents = retrieve_documents(
            retriever,
            question,
        )

        if not check_relevance(
            query=question,
            documents=documents,
        ):
            return RAGResponse(
                answer=(
                    "The answer was not found in "
                    "the provided source."
                ),
                citations=[],
            )

        context = "\n\n".join(
            document.page_content
            for document in documents
        )

        try:
            answer = generate_answer(
                llm=self.llm,
                question=question,
                context=context,
            )
        except Exception as exc:
            self._handle_generation_error(exc)

        citations = build_citations(
            documents
        )

        return RAGResponse(
            answer=answer,
            citations=citations,
        )