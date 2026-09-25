from app.database.database import SessionLocal
from app.database.models import ChatModel, MessageModel, SourceModel


LEGACY_USER_EMAIL = "legacy@contextbridge.local"


class ChatManager:
    """
    Manages persistent chats and their attached sources.
    """

    def _resolve_user_id(
        self,
        user_id: str | None,
    ) -> str:
        """
        Resolve the owner for a chat operation.
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
                    "Unable to resolve the chat owner."
                )

            return user.id

    def create_chat(
        self,
        title: str,
        user_id: str | None = None,
    ) -> ChatModel:
        """
        Create and persist a new chat for a user.
        """

        if not title.strip():
            raise ValueError("Chat title cannot be empty.")

        resolved_user_id = self._resolve_user_id(
            user_id,
        )

        with SessionLocal() as session:
            chat = ChatModel(
                user_id=resolved_user_id,
                title=title.strip(),
            )

            session.add(chat)
            session.commit()
            session.refresh(chat)

            return chat

    def get_chat(
        self,
        chat_id: str,
        user_id: str | None = None,
    ) -> ChatModel | None:
        """
        Retrieve a chat belonging to a user.
        """

        with SessionLocal() as session:
            chat = session.get(
                ChatModel,
                chat_id,
            )

            if not chat:
                return None

            if user_id and chat.user_id != user_id:
                return None

            return chat

    def list_chats(
        self,
        user_id: str | None = None,
    ) -> list[ChatModel]:
        """
        Return chats belonging to a user.
        """

        with SessionLocal() as session:
            query = session.query(
                ChatModel
            )

            if user_id:
                query = query.filter(
                    ChatModel.user_id == user_id,
                )

            return (
                query
                .order_by(ChatModel.created_at)
                .all()
            )

    def attach_source(
        self,
        chat_id: str,
        source_id: str,
        user_id: str | None = None,
    ) -> None:
        """
        Attach a source belonging to the chat owner.
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

            if user_id and chat.user_id != user_id:
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

            if source.user_id != chat.user_id:
                raise ValueError(
                    "Source does not belong to this chat owner."
                )

            if source not in chat.sources:
                chat.sources.append(source)

            session.commit()

    def detach_source(
        self,
        chat_id: str,
        source_id: str,
        user_id: str | None = None,
    ) -> bool:
        """
        Remove a source from a user's chat without deleting
        the source itself.
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

            if user_id and chat.user_id != user_id:
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

            if source.user_id != chat.user_id:
                raise ValueError(
                    "Source does not belong to this chat owner."
                )

            if source not in chat.sources:
                return False

            chat.sources.remove(source)

            session.commit()

            return True

    def get_chat_sources(
        self,
        chat_id: str,
        user_id: str | None = None,
    ) -> list[SourceModel]:
        """
        Return all sources attached to a user's chat.
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

            if user_id and chat.user_id != user_id:
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
        user_id: str | None = None,
    ) -> MessageModel:
        """
        Store a question, answer, and citations in a user's chat.
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

            if user_id and chat.user_id != user_id:
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
        user_id: str | None = None,
    ) -> list[MessageModel]:
        """
        Return all messages belonging to a user's chat.
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

            if user_id and chat.user_id != user_id:
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