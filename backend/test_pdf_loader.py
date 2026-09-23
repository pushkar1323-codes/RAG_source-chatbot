from app.ingestion.pdf_loader import load_pdf


PDF_PATH = "data/AWS_Exam.pdf"


documents = load_pdf(PDF_PATH)

print(f"Pages loaded: {len(documents)}")

if documents:
    print("\nFirst page metadata:")
    print(documents[0].metadata)

    print("\nFirst 500 characters:")
    print(documents[0].page_content[:500])