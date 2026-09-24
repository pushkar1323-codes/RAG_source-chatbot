from fastapi import FastAPI

from app.api.routes.sources import router as sources_router


app = FastAPI(
    title="RAG API",
    version="1.0.0",
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