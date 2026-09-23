from app.embeddings.embedding_service import create_embedding_model
from app.ingestion.pdf_loader import load_pdf
from app.processing.chunker import split_documents
from app.vectorstore.chroma_store import (
    CHROMA_DIRECTORY,
    create_vector_store,
    add_documents,
)


PDF_PATH = "data/AWS_Exam.pdf"


documents = load_pdf(PDF_PATH)

chunks = split_documents(documents)

embedding_model = create_embedding_model()

vector_store = create_vector_store(embedding_model)

document_ids = add_documents(
    vector_store,
    chunks,
)


print(f"Pages loaded: {len(documents)}")
print(f"Chunks created: {len(chunks)}")
print(f"Documents stored in Chroma: {len(document_ids)}")

print("\nFirst stored document ID:")
print(document_ids[0])

print("\nChroma directory:")
print(CHROMA_DIRECTORY)