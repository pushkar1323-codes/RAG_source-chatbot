from app.embeddings.embedding_service import create_embedding_model
from app.vectorstore.chroma_store import (
    CHROMA_DIRECTORY,
    COLLECTION_NAME,
    create_vector_store,
)


embedding_model = create_embedding_model()

vector_store = create_vector_store(embedding_model)

stored_data = vector_store.get()

stored_ids = stored_data["ids"]

print(f"Chroma directory: {CHROMA_DIRECTORY}")
print(f"Collection name: {COLLECTION_NAME}")
print(f"Stored documents: {len(stored_ids)}")

if stored_ids:
    print("\nFirst stored document ID:")
    print(stored_ids[0])