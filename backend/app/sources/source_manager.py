import hashlib
from pathlib import Path

from app.database.database import SessionLocal
from app.database.models import SourceModel
from app.sources.source import Source


class SourceManager:
    """
    Manages source identity and persistent source registration.
    """

    def generate_source_id(
        self,
        file_path: str | Path,
    ) -> str:
        """
        Generate a stable source ID from file contents.
        """

        path = Path(file_path)

        if not path.exists():
            raise FileNotFoundError(
                f"Source file not found: {path}"
            )

        digest = hashlib.sha256()

        with path.open("rb") as file:
            for chunk in iter(
                lambda: file.read(1024 * 1024),
                b"",
            ):
                digest.update(chunk)

        return digest.hexdigest()

    def register_file(
        self,
        file_path: str | Path,
        file_type: str,
    ) -> Source:
        """
        Register a local file or return the existing source
        if the same file content was already registered.
        """

        path = Path(file_path)

        if not path.exists():
            raise FileNotFoundError(
                f"Source file not found: {path}"
            )

        source_id = self.generate_source_id(path)

        with SessionLocal() as session:
            existing_source = session.get(
                SourceModel,
                source_id,
            )

            if existing_source:
                return self._to_source(existing_source)

            source_model = SourceModel(
                source_id=source_id,
                filename=path.name,
                type=file_type,
                path=str(path),
                status="ready",
            )

            session.add(source_model)
            session.commit()
            session.refresh(source_model)

            return self._to_source(source_model)

    def get_source(
        self,
        source_id: str,
    ) -> Source | None:
        """
        Retrieve a persisted source by ID.
        """

        with SessionLocal() as session:
            source_model = session.get(
                SourceModel,
                source_id,
            )

            if not source_model:
                return None

            return self._to_source(source_model)

    def list_sources(self) -> list[Source]:
        """
        Return all persisted sources.
        """

        with SessionLocal() as session:
            source_models = session.query(
                SourceModel
            ).all()

            return [
                self._to_source(source_model)
                for source_model in source_models
            ]

    @staticmethod
    def _to_source(
        source_model: SourceModel,
    ) -> Source:
        """
        Convert a database source model into a domain Source.
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