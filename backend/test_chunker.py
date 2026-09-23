from app.ingestion.pdf_loader import load_pdf
from app.processing.chunker import split_documents


PDF_PATH = "data/AWS_Exam.pdf"


documents = load_pdf(PDF_PATH)
chunks = split_documents(documents)

print(f"Pages loaded: {len(documents)}")
print(f"Chunks created: {len(chunks)}")

if chunks:
    print("\nFirst chunk metadata:")
    print(chunks[0].metadata)

    print("\nFirst 500 characters of first chunk:")
    print(chunks[0].page_content[:500])