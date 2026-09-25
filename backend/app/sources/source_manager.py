import hashlib
from pathlib import Path

from app.database.database import SessionLocal
from app.database.models import SourceModel
from app.sources.source import Source


LEGACY_USER_EMAIL = "legacy@contextbridge.local"


class SourceManager:
    """
    Manages persistent source metadata and ownership.
    """

    def _resolve_user_id(
        self,
        user_id: str | None,
    ) -> str:
        """
        Resolve the owner for a source operation.
        """

        if user_id:
            return user_id

        from app.database.models import UserModel

        with SessionLocal() as session:
            user = (
                session.query(UserModel)
                .filter(
                    UserModel.email == LEGACY_USER_EMAIL,
                )
                .first()
            )

            if not user:
                raise ValueError(
                    "Unable to resolve the source owner."
                )

            return user.id

    def generate_source_id(
        self,
        file_path: str | Path,
    ) -> str:
        """
        Generate a deterministic content hash for a file.
        """

        path = Path(file_path)

        if not path.exists():
            raise FileNotFoundError(
                f"Source file not found: {path}"
            )

        digest = hashlib.sha256()

        with path.open("rb") as source_file:
            for chunk in iter(
                lambda: source_file.read(1024 * 1024),
                b"",
            ):
                digest.update(chunk)

        return digest.hexdigest()

    def generate_user_source_id(
        self,
        file_path: str | Path,
        user_id: str,
    ) -> str:
        """
        Generate a source ID scoped to a specific user.
        """

        content_id = self.generate_source_id(
            file_path,
        )

        digest = hashlib.sha256()

        digest.update(
            f"{user_id}:{content_id}".encode("utf-8")
        )

        return digest.hexdigest()

    def register_file(
        self,
        file_path: str | Path,
        file_type: str,
        filename: str | None = None,
        user_id: str | None = None,
    ) -> Source:
        """
        Register a local file for a user or return the user's
        existing source if the same content was already registered.
        """

        path = Path(file_path)

        if not path.exists():
            raise FileNotFoundError(
                f"Source file not found: {path}"
            )

        resolved_user_id = self._resolve_user_id(
            user_id,
        )

        source_id = self.generate_user_source_id(
            path,
            resolved_user_id,
        )

        with SessionLocal() as session:
            existing_source = session.get(
                SourceModel,
                source_id,
            )

            if existing_source:
                if existing_source.user_id != resolved_user_id:
                    raise ValueError(
                        "Source does not belong to the requested user."
                    )

                return self._to_source(
                    existing_source,
                )

            source_model = SourceModel(
                source_id=source_id,
                user_id=resolved_user_id,
                filename=filename or path.name,
                type=file_type,
                path=str(path),
                status="ready",
            )

            session.add(source_model)
            session.commit()
            session.refresh(source_model)

            return self._to_source(
                source_model,
            )

    def get_source(
        self,
        source_id: str,
        user_id: str | None = None,
    ) -> Source | None:
        """
        Retrieve a source, optionally scoped to a user.
        """

        with SessionLocal() as session:
            source_model = session.get(
                SourceModel,
                source_id,
            )

            if not source_model:
                return None

            if (
                user_id
                and source_model.user_id != user_id
            ):
                return None

            return self._to_source(
                source_model,
            )

    def list_sources(
        self,
        user_id: str | None = None,
    ) -> list[Source]:
        """
        Return sources belonging to a user.
        """

        with SessionLocal() as session:
            query = session.query(
                SourceModel
            )

            if user_id:
                query = query.filter(
                    SourceModel.user_id == user_id,
                )

            sources = (
                query
                .order_by(SourceModel.filename)
                .all()
            )

            return [
                self._to_source(source)
                for source in sources
            ]

    def delete_source(
        self,
        source_id: str,
        user_id: str | None = None,
    ) -> Source | None:
        """
        Delete a source belonging to a user and remove its
        persisted source metadata.
        """

        with SessionLocal() as session:
            source_model = session.get(
                SourceModel,
                source_id,
            )

            if not source_model:
                return None

            if (
                user_id
                and source_model.user_id != user_id
            ):
                return None

            deleted_source = self._to_source(
                source_model,
            )

            source_path = (
                Path(source_model.path)
                if source_model.path
                else None
            )

            session.delete(source_model)
            session.commit()

            if (
                source_path
                and source_path.exists()
            ):
                source_path.unlink()

            return deleted_source

    @staticmethod
    def _to_source(
        source_model: SourceModel,
    ) -> Source:
        """
        Convert a database source model into the domain model.
        """

        return Source(
            source_id=source_model.source_id,
            filename=source_model.filename,
            type=source_model.type,
            path=source_model.path,
            url=source_model.url,
            metadata=source_model.source_metadata,
            status=source_model.status,
        )