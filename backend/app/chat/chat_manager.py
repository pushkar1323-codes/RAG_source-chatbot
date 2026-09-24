from app.database.database import SessionLocal
from app.database.models import ChatModel, MessageModel, SourceModel


class ChatManager:
    """
    Manages persistent chats and their attached sources.
    """

    def create_chat(
        self,
        title: str,
    ) -> ChatModel:
        """
        Create and persist a new chat.
        """

        if not title.strip():
            raise ValueError("Chat title cannot be empty.")

        with SessionLocal() as session:
            chat = ChatModel(
                title=title.strip(),
            )

            session.add(chat)
            session.commit()
            session.refresh(chat)

            return chat

    def get_chat(
        self,
        chat_id: str,
    ) -> ChatModel | None:
        """
        Retrieve a chat by ID.
        """

        with SessionLocal() as session:
            return session.get(
                ChatModel,
                chat_id,
            )

    def list_chats(self) -> list[ChatModel]:
        """
        Return all persisted chats.
        """

        with SessionLocal() as session:
            return (
                session.query(ChatModel)
                .order_by(ChatModel.created_at)
                .all()
            )

    def attach_source(
        self,
        chat_id: str,
        source_id: str,
    ) -> None:
        """
        Attach an existing source to an existing chat.
        """

        with SessionLocal() as session:
            chat = session.get(
                ChatModel,
                chat_id,
            )

            if not chat:
                raise ValueError(
                    f"Chat not found: {chat_id}"
                )

            source = session.get(
                SourceModel,
                source_id,
            )

            if not source:
                raise ValueError(
                    f"Source not found: {source_id}"
                )

            if source not in chat.sources:
                chat.sources.append(source)

            session.commit()

    def get_chat_sources(
        self,
        chat_id: str,
    ) -> list[SourceModel]:
        """
        Return all sources attached to a chat.
        """

        with SessionLocal() as session:
            chat = session.get(
                ChatModel,
                chat_id,
            )

            if not chat:
                raise ValueError(
                    f"Chat not found: {chat_id}"
                )

            return list(chat.sources)

    def add_message(
        self,
        chat_id: str,
        question: str,
        answer: str,
        citations: list[dict] | None = None,
    ) -> MessageModel:
        """
        Store a question, answer, and citations in a chat.
        """

        if not question.strip():
            raise ValueError("Question cannot be empty.")

        if not answer.strip():
            raise ValueError("Answer cannot be empty.")

        with SessionLocal() as session:
            chat = session.get(
                ChatModel,
                chat_id,
            )

            if not chat:
                raise ValueError(
                    f"Chat not found: {chat_id}"
                )

            message = MessageModel(
                chat_id=chat_id,
                question=question.strip(),
                answer=answer.strip(),
                citations=citations or [],
            )

            session.add(message)
            session.commit()
            session.refresh(message)

            return message

    def get_messages(
        self,
        chat_id: str,
    ) -> list[MessageModel]:
        """
        Return all messages belonging to a chat.
        """

        with SessionLocal() as session:
            chat = session.get(
                ChatModel,
                chat_id,
            )

            if not chat:
                raise ValueError(
                    f"Chat not found: {chat_id}"
                )

            return (
                session.query(MessageModel)
                .filter(
                    MessageModel.chat_id == chat_id
                )
                .order_by(MessageModel.created_at)
                .all()
            )