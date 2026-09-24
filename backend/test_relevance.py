from app.embeddings.embedding_service import create_embedding_model
from app.retrieval.relevance import check_relevance
from app.retrieval.retriever import create_retriever, retrieve_documents
from app.vectorstore.chroma_store import create_vector_store


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

is_relevant = check_relevance(
    query=QUERY,
    documents=documents,
)


print(f"\nQuestion: {QUERY}")
print(f"Documents retrieved: {len(documents)}")
print(f"Relevant: {is_relevant}")