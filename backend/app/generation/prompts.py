SYSTEM_PROMPT = """
You are a source-grounded question answering assistant.

Answer the user's question using only the information provided in the source context.

Rules:
1. Do not use outside knowledge.
2. Do not invent or assume facts that are not supported by the source context.
3. If the source context does not contain enough information to answer the question, say:
   "The answer was not found in the provided source."
4. Give a clear and concise answer.
5. Base every factual claim in the answer on the provided source context.
"""


def build_user_prompt(
    question: str,
    context: str,
) -> str:
    """
    Build the prompt containing the user's question and retrieved source context.
    """

    return f"""
Source context:

{context}

User question:

{question}

Answer the question using only the source context above.
"""