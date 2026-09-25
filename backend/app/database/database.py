from pathlib import Path
from uuid import uuid4

from sqlalchemy import create_engine, event, inspect, text
from sqlalchemy.orm import sessionmaker

from app.database.models import Base, UserModel


PROJECT_ROOT = Path(__file__).resolve().parents[3]

DATABASE_DIRECTORY = PROJECT_ROOT / "backend" / "data"
DATABASE_DIRECTORY.mkdir(parents=True, exist_ok=True)

DATABASE_PATH = DATABASE_DIRECTORY / "rag.db"

DATABASE_URL = f"sqlite:///{DATABASE_PATH}"


engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
)


@event.listens_for(engine, "connect")
def enable_sqlite_foreign_keys(dbapi_connection, connection_record):
    """
    Enable SQLite foreign-key enforcement for cascade behavior.
    """

    cursor = dbapi_connection.cursor()

    try:
        cursor.execute("PRAGMA foreign_keys=ON")
    finally:
        cursor.close()


SessionLocal = sessionmaker(
    bind=engine,
    autoflush=False,
    autocommit=False,
)


def _column_exists(
    table_name: str,
    column_name: str,
) -> bool:
    """
    Return whether a column exists in a database table.
    """

    inspector = inspect(engine)

    columns = inspector.get_columns(
        table_name,
    )

    return any(
        column["name"] == column_name
        for column in columns
    )


def _table_exists(
    table_name: str,
) -> bool:
    """
    Return whether a database table exists.
    """

    inspector = inspect(engine)

    return table_name in inspector.get_table_names()


def _migrate_ownership() -> None:
    """
    Add ownership fields to the existing SQLite database.
    """

    with engine.begin() as connection:
        if not _table_exists("users"):
            UserModel.__table__.create(
                bind=connection,
                checkfirst=True,
            )

        result = connection.execute(
            text(
                """
                SELECT id
                FROM users
                WHERE email = :email
                LIMIT 1
                """
            ),
            {
                "email": "legacy@contextbridge.local",
            },
        )

        legacy_user = result.first()

        if legacy_user:
            legacy_user_id = legacy_user[0]
        else:
            legacy_user_id = str(uuid4())

            connection.execute(
                text(
                    """
                    INSERT INTO users (
                        id,
                        email,
                        password_hash,
                        created_at
                    )
                    VALUES (
                        :id,
                        :email,
                        :password_hash,
                        CURRENT_TIMESTAMP
                    )
                    """
                ),
                {
                    "id": legacy_user_id,
                    "email": "legacy@contextbridge.local",
                    "password_hash": "legacy-account",
                },
            )

        if _table_exists("sources") and not _column_exists(
            "sources",
            "user_id",
        ):
            connection.execute(
                text(
                    """
                    ALTER TABLE sources
                    ADD COLUMN user_id VARCHAR
                    """
                )
            )

            connection.execute(
                text(
                    """
                    UPDATE sources
                    SET user_id = :user_id
                    WHERE user_id IS NULL
                    """
                ),
                {
                    "user_id": legacy_user_id,
                },
            )

        if _table_exists("chats") and not _column_exists(
            "chats",
            "user_id",
        ):
            connection.execute(
                text(
                    """
                    ALTER TABLE chats
                    ADD COLUMN user_id VARCHAR
                    """
                )
            )

            connection.execute(
                text(
                    """
                    UPDATE chats
                    SET user_id = :user_id
                    WHERE user_id IS NULL
                    """
                ),
                {
                    "user_id": legacy_user_id,
                },
            )


def init_database() -> None:
    """
    Create and migrate the application database.
    """

    Base.metadata.create_all(bind=engine)

    _migrate_ownership()