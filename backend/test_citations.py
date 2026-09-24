from app.embeddings.embedding_service import create_embedding_model
from app.retrieval.retriever import create_retriever, retrieve_documents
from app.vectorstore.chroma_store import create_vector_store
from app.generation.citations import build_citations


QUERY = input("Ask a question: ")


embedding_model = create_embedding_model()

vector_store = create_vector_store(embedding_model)

retriever = create_retriever(
    vector_store,
    k=4,
)

documents = retrieve_documents(
    retriever,
    QUERY,
)

citations = build_citations(documents)


print(f"\nQuestion: {QUERY}")
print(f"Documents retrieved: {len(documents)}")

print("\n--- Citations ---")

for citation in citations:
    print(citation)