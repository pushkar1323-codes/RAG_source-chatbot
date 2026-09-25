import base64
import hashlib
import hmac
import json
import os
import re
import secrets
import time

from app.database.database import SessionLocal
from app.database.models import UserModel


TOKEN_EXPIRATION_SECONDS = 60 * 60 * 24 * 7

EMAIL_PATTERN = re.compile(
    r"^[^@\s]+@[^@\s]+\.[^@\s]+$"
)


def _get_token_secret() -> bytes:
    """
    Return the secret used to sign authentication tokens.
    """

    secret = os.getenv(
        "AUTH_SECRET_KEY",
        "development-only-context-bridge-secret",
    )

    return secret.encode("utf-8")


def _normalize_email(email: str) -> str:
    """
    Normalize and validate an email address.
    """

    normalized = email.strip().lower()

    if not EMAIL_PATTERN.match(normalized):
        raise ValueError("Please provide a valid email address.")

    return normalized


def _hash_password(
    password: str,
) -> str:
    """
    Hash a password using PBKDF2-HMAC-SHA256.
    """

    if len(password) < 8:
        raise ValueError(
            "Password must be at least 8 characters long."
        )

    salt = secrets.token_bytes(16)

    password_hash = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt,
        200_000,
    )

    encoded_salt = base64.urlsafe_b64encode(
        salt,
    ).decode("ascii")

    encoded_hash = base64.urlsafe_b64encode(
        password_hash,
    ).decode("ascii")

    return f"pbkdf2_sha256$200000${encoded_salt}${encoded_hash}"


def _verify_password(
    password: str,
    stored_hash: str,
) -> bool:
    """
    Verify a password against a stored PBKDF2 hash.
    """

    try:
        algorithm, iterations, encoded_salt, encoded_hash = (
            stored_hash.split("$")
        )

        if algorithm != "pbkdf2_sha256":
            return False

        salt = base64.urlsafe_b64decode(
            encoded_salt.encode("ascii"),
        )

        expected_hash = base64.urlsafe_b64decode(
            encoded_hash.encode("ascii"),
        )

        actual_hash = hashlib.pbkdf2_hmac(
            "sha256",
            password.encode("utf-8"),
            salt,
            int(iterations),
        )

        return hmac.compare_digest(
            actual_hash,
            expected_hash,
        )

    except (
        ValueError,
        TypeError,
        UnicodeError,
    ):
        return False


def register_user(
    email: str,
    password: str,
) -> UserModel:
    """
    Create and persist a new user account.
    """

    normalized_email = _normalize_email(email)
    password_hash = _hash_password(password)

    with SessionLocal() as session:
        existing_user = (
            session.query(UserModel)
            .filter(
                UserModel.email == normalized_email,
            )
            .first()
        )

        if existing_user:
            raise ValueError(
                "An account with this email already exists."
            )

        user = UserModel(
            email=normalized_email,
            password_hash=password_hash,
        )

        session.add(user)
        session.commit()
        session.refresh(user)

        return user


def authenticate_user(
    email: str,
    password: str,
) -> UserModel | None:
    """
    Authenticate a user using email and password.
    """

    normalized_email = _normalize_email(email)

    with SessionLocal() as session:
        user = (
            session.query(UserModel)
            .filter(
                UserModel.email == normalized_email,
            )
            .first()
        )

        if not user:
            return None

        if not _verify_password(
            password,
            user.password_hash,
        ):
            return None

        return user


def create_access_token(
    user_id: str,
) -> str:
    """
    Create a signed access token for a user.
    """

    payload = {
        "user_id": user_id,
        "exp": int(time.time())
        + TOKEN_EXPIRATION_SECONDS,
    }

    payload_bytes = json.dumps(
        payload,
        separators=(",", ":"),
    ).encode("utf-8")

    encoded_payload = base64.urlsafe_b64encode(
        payload_bytes,
    ).decode("ascii").rstrip("=")

    signature = hmac.new(
        _get_token_secret(),
        encoded_payload.encode("ascii"),
        hashlib.sha256,
    ).digest()

    encoded_signature = base64.urlsafe_b64encode(
        signature,
    ).decode("ascii").rstrip("=")

    return f"{encoded_payload}.{encoded_signature}"


def verify_access_token(
    token: str,
) -> str | None:
    """
    Verify an access token and return its user ID.
    """

    try:
        encoded_payload, encoded_signature = token.split(
            ".",
            1,
        )

        expected_signature = hmac.new(
            _get_token_secret(),
            encoded_payload.encode("ascii"),
            hashlib.sha256,
        ).digest()

        provided_signature = base64.urlsafe_b64decode(
            (
                encoded_signature
                + "="
                * (-len(encoded_signature) % 4)
            ).encode("ascii"),
        )

        if not hmac.compare_digest(
            expected_signature,
            provided_signature,
        ):
            return None

        payload_bytes = base64.urlsafe_b64decode(
            (
                encoded_payload
                + "="
                * (-len(encoded_payload) % 4)
            ).encode("ascii"),
        )

        payload = json.loads(
            payload_bytes.decode("utf-8"),
        )

        user_id = payload.get("user_id")
        expiration = payload.get("exp")

        if not isinstance(user_id, str):
            return None

        if not isinstance(expiration, int):
            return None

        if expiration <= int(time.time()):
            return None

        return user_id

    except (
        ValueError,
        TypeError,
        UnicodeError,
        json.JSONDecodeError,
    ):
        return None


def get_user_by_id(
    user_id: str,
) -> UserModel | None:
    """
    Retrieve a user by ID.
    """

    with SessionLocal() as session:
        return session.get(
            UserModel,
            user_id,
        )