# Document RAG Chatbot

> A source-grounded AI chatbot that lets users upload documents, ask questions, and receive answers based only on the provided sources.

[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-Backend-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-Frontend-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Frontend-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![RAG](https://img.shields.io/badge/Architecture-RAG-0B2545)](#architecture)
[![Tests](https://img.shields.io/badge/Backend%20Tests-20%20passed-success)](#testing)

**[Live Demo](YOUR_DEPLOYMENT_URL)** · **[API Docs](YOUR_API_DOCS_URL)**

---

## Overview

Document RAG Chatbot is a Retrieval-Augmented Generation (RAG) application that provides grounded answers from user-provided documents. Rather than generating answers from general knowledge, the system retrieves relevant context from the user's uploaded sources and generates responses based on that context — with citations.

**Core capabilities:**

- Upload and manage PDF/TXT documents in a personal source library
- Create conversations scoped to selected sources
- Ask questions and receive source-grounded answers with citations
- Resume and extend previous conversations
- Try the app as a guest, or create an account to persist history

---

## Screenshots

| Home | Document Chat |
|---|---|
| ![Home]<img width="1447" height="1078" alt="image" src="https://github.com/user-attachments/assets/d02141c0-0734-41b6-b647-ea9836801c06" />
 | ![Chat Interface]<img width="1462" height="1078" alt="image" src="https://github.com/user-attachments/assets/6cf9dd88-6fd3-47bb-803b-00c1cf161d00" />
 |

| Conversation History | Source Library |
|---|---|
| ![Chat]<img width="1461" height="1078" alt="image" src="https://github.com/user-attachments/assets/8e13d06d-8beb-4de7-9d88-cb9d1b66c02c" />
 | ![Source]<img width="1326" height="1062" alt="image" src="https://github.com/user-attachments/assets/558bec48-82f9-422c-bf69-3c7b3433a7c4" />
 |

---

## Architecture

```text
React (TypeScript + Vite)
        │
     REST API
        │
   FastAPI Backend
        │
   ┌────┼────────────────┐
   │    │                │
Sources  Chat          Auth
Service  Service        Service
   │       │
Ingestion  RAG Engine
& Chunking    │
   │      ChromaDB
Embeddings────┘
                │
          Gemini LLM
```

## RAG Pipeline

1. **Upload** — user uploads a PDF or TXT document
2. **Ingestion** — backend extracts readable text
3. **Chunking** — text is split into overlapping chunks (size: 1000, overlap: 200)
4. **Embeddings** — chunks are embedded via `gemini-embedding-001`
5. **Vector storage** — embeddings are stored in ChromaDB
6. **Retrieval** — relevant chunks retrieved via vector similarity + MMR
7. **Generation** — retrieved context passed to `gemini-3.6-flash`
8. **Response** — answer returned with citations

---

## Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | React, TypeScript, Vite, React Router |
| Backend | Python, FastAPI, SQLAlchemy, SQLite, Pydantic |
| AI / RAG | Google Gemini (`gemini-embedding-001`, `gemini-3.6-flash`), LangChain, ChromaDB |
| Document Processing | PyPDFLoader, TextLoader, Recursive Character Text Splitter |

---

## Project Structure

```text
document-rag-chatbot/
├── backend/
│   ├── app/            # ingestion, embeddings, vectorstore, retrieval, generation, rag, database, chat, auth
│   ├── api/             # schemas, routes (auth, sources, chats, guest), main.py
│   ├── tests/
│   ├── data/
│   └── chroma_db/
├── frontend/
│   └── src/              # components, context, pages
├── screenshots/
├── .env.example
└── requirements.txt
```

---

## API Overview

| Resource | Endpoints |
|---|---|
| Auth | `POST /auth/register` · `POST /auth/login` · `GET /auth/me` |
| Sources | `GET/POST /sources` · `DELETE /sources/{source_id}` |
| Conversations | `POST/GET /chats` · `GET /chats/{chat_id}` |
| Conversation Sources | `POST/DELETE/GET /chats/{chat_id}/sources` |
| Messages | `POST/GET /chats/{chat_id}/messages` |
| Guest | `GET/POST /guest/sources` · `POST /guest/ask` |

---

## Getting Started

### Prerequisites

- Python 3.11+
- Node.js & npm
- Git
- Google Gemini API key

### Setup

```bash
git clone https://github.com/YOUR_USERNAME/document-rag-chatbot.git
cd document-rag-chatbot
```

**Backend:**

```bash
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

Create a `.env` file based on `.env.example`:

```env
GEMINI_API_KEY=your_gemini_api_key
AUTH_SECRET_KEY=your_secret_key
```

Run the backend:

```bash
uvicorn app.main:app --app-dir backend --reload
```

- App: `http://localhost:8000`
- Docs: `http://localhost:8000/docs`

**Frontend:**

```bash
cd frontend
npm install
npm run dev
```

- App: `http://localhost:5173`

---

## Testing

```bash
cd backend
pytest -q
```

Current status: **20 passed**

```bash
cd frontend
npm run build
```

---

## Security & Data Isolation

- All authenticated endpoints require a `Bearer` access token
- Sources and conversations are scoped to their owning user
- A source must belong to the same user as a conversation before it can be attached
- Guest sources are scoped to a temporary session identifier and are not persisted to any user account

---

## Source Lifecycle

- **Detach from conversation** — removes the source from that conversation only; it remains in the user's library
- **Delete from library** — permanently removes the database record, physical file, and associated vector documents

---

## Design Principles

- **Grounded over generic** — answers are built from the user's own sources, not unrestricted generation
- **Source-aware conversations** — each conversation explicitly controls which sources are in scope
- **Separation of concerns** — ingestion, embeddings, retrieval, generation, auth, and chat management are independent backend components

---

## Current Limitations

- Supported formats limited to PDF and TXT
- Guest source state is temporary and non-persistent
- Generation is dependent on Gemini API quota

## Roadmap

- DOCX / Markdown / web page ingestion
- Multi-document comparison
- Streaming responses
- Reranking and advanced retrieval
- Conversation sharing & team workspaces
- Usage analytics

---

## Deployment

| Component | Suggested Platforms |
|---|---|
| Frontend | Vercel, Netlify |
| Backend | Render, Railway, AWS |

Configure environment variables and ensure the backend can securely access the database, vector store, and Gemini API.

---

<p align="center">Built with React, FastAPI, ChromaDB, and Gemini</p>
