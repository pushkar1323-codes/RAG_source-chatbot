import hashlib
from pathlib import Path

from app.sources.source import Source


class SourceManager:
    """
    Manages source identity and in-memory source registration.
    """

    def __init__(self):
        self._sources: dict[str, Source] = {}

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

        existing_source = self._sources.get(source_id)

        if existing_source:
            return existing_source

        source = Source(
            source_id=source_id,
            filename=path.name,
            type=file_type,
            path=str(path),
            status="ready",
        )

        self._sources[source_id] = source

        return source

    def get_source(
        self,
        source_id: str,
    ) -> Source | None:
        """
        Retrieve a registered source by ID.
        """

        return self._sources.get(source_id)

    def list_sources(self) -> list[Source]:
        """
        Return all registered sources.
        """

        return list(self._sources.values())