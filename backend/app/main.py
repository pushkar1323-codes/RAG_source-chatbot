from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes.chats import router as chats_router
from app.api.routes.sources import router as sources_router


app = FastAPI(
    title="RAG API",
    version="1.0.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check():
    """
    Check whether the API is running.
    """

    return {
        "status": "ok",
    }


app.include_router(sources_router)
app.include_router(chats_router)