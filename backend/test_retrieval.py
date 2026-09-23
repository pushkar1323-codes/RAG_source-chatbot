from app.embeddings.embedding_service import create_embedding_model
from app.retrieval.retriever import create_retriever, retrieve_documents
from app.vectorstore.chroma_store import create_vector_store


QUERY = "What is Amazon EC2?"


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


print(f"Query: {QUERY}")
print(f"Documents retrieved: {len(documents)}")


for index, document in enumerate(documents, start=1):
    print(f"\n--- Retrieved Document {index} ---")

    print("\nMetadata:")
    print(document.metadata)

    print("\nContent:")
    print(document.page_content[:500])