from fastapi import APIRouter, Depends, HTTPException

from app.api.schemas import (
    AuthResponse,
    LoginRequest,
    RegisterRequest,
    UserResponse,
)
from app.auth.auth_service import (
    authenticate_user,
    create_access_token,
    register_user,
)
from app.auth.dependencies import get_current_user
from app.database.models import UserModel


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)


@router.post(
    "/register",
    response_model=AuthResponse,
)
def register(request: RegisterRequest):
    """
    Register a new user account and return an access token.
    """

    try:
        user = register_user(
            email=request.email,
            password=request.password,
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        ) from exc

    access_token = create_access_token(
        user.id,
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "created_at": user.created_at,
        },
    }


@router.post(
    "/login",
    response_model=AuthResponse,
)
def login(request: LoginRequest):
    """
    Authenticate an existing user and return an access token.
    """

    try:
        user = authenticate_user(
            email=request.email,
            password=request.password,
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        ) from exc

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password.",
        )

    access_token = create_access_token(
        user.id,
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "created_at": user.created_at,
        },
    }


@router.get(
    "/me",
    response_model=UserResponse,
)
def get_me(
    current_user: UserModel = Depends(get_current_user),
):
    """
    Return the currently authenticated user.
    """

    return {
        "id": current_user.id,
        "email": current_user.email,
        "created_at": current_user.created_at,
    }