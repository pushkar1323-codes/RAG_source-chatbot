from fastapi import Header, HTTPException

from app.auth.auth_service import get_user_by_id, verify_access_token
from app.database.models import UserModel


def get_current_user(
    authorization: str | None = Header(default=None),
) -> UserModel:
    """
    Resolve the authenticated user from the bearer access token.
    """

    if not authorization:
        raise HTTPException(
            status_code=401,
            detail="Authentication required.",
        )

    scheme, _, token = authorization.partition(" ")

    if scheme.lower() != "bearer" or not token:
        raise HTTPException(
            status_code=401,
            detail="Invalid authorization header.",
        )

    user_id = verify_access_token(token)

    if not user_id:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired access token.",
        )

    user = get_user_by_id(user_id)

    if not user:
        raise HTTPException(
            status_code=401,
            detail="User account not found.",
        )

    return user