from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database.models import Base


PROJECT_ROOT = Path(__file__).resolve().parents[3]

DATABASE_DIRECTORY = PROJECT_ROOT / "backend" / "data"
DATABASE_DIRECTORY.mkdir(parents=True, exist_ok=True)

DATABASE_PATH = DATABASE_DIRECTORY / "rag.db"

DATABASE_URL = f"sqlite:///{DATABASE_PATH}"


engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
)


SessionLocal = sessionmaker(
    bind=engine,
    autoflush=False,
    autocommit=False,
)


def init_database() -> None:
    """
    Create all database tables if they do not already exist.
    """

    Base.metadata.create_all(bind=engine)