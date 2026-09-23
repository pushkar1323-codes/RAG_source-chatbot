from app.ingestion.pdf_loader import load_pdf
from app.processing.chunker import split_documents
from app.embeddings.embedding_service import create_embedding_model


PDF_PATH = "data/AWS_Exam.pdf"


documents = load_pdf(PDF_PATH)
chunks = split_documents(documents)

embedding_model = create_embedding_model()

vector = embedding_model.embed_query(
    "What is Amazon EC2?"
)

print(f"Documents loaded: {len(documents)}")
print(f"Chunks created: {len(chunks)}")
print(f"Embedding dimensions: {len(vector)}")
print(f"First 10 values: {vector[:10]}")