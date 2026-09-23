from app.embeddings.embedding_service import create_embedding_model
from app.generation.answer_generator import create_llm, generate_answer
from app.retrieval.retriever import create_retriever, retrieve_documents
from app.vectorstore.chroma_store import create_vector_store


# Ask the user for a question
QUERY = input("Ask a question: ")


# 1. Create embedding model
embedding_model = create_embedding_model()

# 2. Open existing ChromaDB
vector_store = create_vector_store(embedding_model)

# 3. Create MMR retriever
retriever = create_retriever(
    vector_store,
    k=4,
)

# 4. Retrieve relevant documents
documents = retrieve_documents(
    retriever,
    QUERY,
)

# 5. Build context from retrieved documents
context = "\n\n".join(
    document.page_content
    for document in documents
)

# 6. Create Gemini generation model
llm = create_llm()

# 7. Generate grounded answer
answer = generate_answer(
    llm=llm,
    question=QUERY,
    context=context,
)


print(f"\nQuestion: {QUERY}")
print(f"Documents retrieved: {len(documents)}")

print("\n--- Generated Answer ---")
print(answer)