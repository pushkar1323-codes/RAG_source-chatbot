from langchain_google_genai import ChatGoogleGenerativeAI

from app.generation.prompts import SYSTEM_PROMPT, build_user_prompt


GENERATION_MODEL = "gemini-3.6-flash"


def create_llm() -> ChatGoogleGenerativeAI:
    """
    Create the Gemini language model used for answer generation.
    """

    return ChatGoogleGenerativeAI(
        model=GENERATION_MODEL,
    )


def generate_answer(
    llm: ChatGoogleGenerativeAI,
    question: str,
    context: str,
) -> str:
    """
    Generate a source-grounded answer using the retrieved context.
    """

    if not question.strip():
        raise ValueError("Question cannot be empty.")

    if not context.strip():
        raise ValueError("Context cannot be empty.")

    user_prompt = build_user_prompt(
        question=question,
        context=context,
    )

    response = llm.invoke(
        [
            ("system", SYSTEM_PROMPT),
            ("human", user_prompt),
        ]
    )

    return response.text