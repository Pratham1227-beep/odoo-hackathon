from fastapi import APIRouter, Depends, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.features.auth.dependencies import get_current_user
from app.features.auth.schemas import LoginRequest, RefreshTokenRequest, Token
from app.features.auth.service import AuthService
from app.features.users.models import User
from app.features.users.schemas import UserCreate, UserRead

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post(
    "/register",
    status_code=status.HTTP_201_CREATED,
    summary="Register new user",
    description="Registers a new user in the system and returns user info along with access and refresh tokens.",
)
async def register(
    user_in: UserCreate,
    db: AsyncSession = Depends(get_db),
) -> dict:
    auth_service = AuthService(db)
    user, token = await auth_service.register(user_in)
    return {
        "user": user,
        "token": token,
    }


@router.post(
    "/login",
    response_model=Token,
    summary="User Login",
    description="Authenticates user with email & password and returns JWT access & refresh tokens.",
)
async def login(
    login_data: LoginRequest,
    db: AsyncSession = Depends(get_db),
) -> Token:
    auth_service = AuthService(db)
    _, token = await auth_service.authenticate(login_data.email, login_data.password)
    return token


@router.post(
    "/login/oauth2",
    response_model=Token,
    summary="OAuth2 Compatible Login Form",
    description="Standard OAuth2 form login for OpenAPI Swagger UI compatibility.",
)
async def login_oauth2(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db),
) -> Token:
    auth_service = AuthService(db)
    _, token = await auth_service.authenticate(form_data.username, form_data.password)
    return token


@router.post(
    "/refresh",
    response_model=Token,
    summary="Refresh Access Token",
    description="Exchanges a valid refresh token for a new set of access and refresh tokens.",
)
async def refresh_token(
    refresh_data: RefreshTokenRequest,
    db: AsyncSession = Depends(get_db),
) -> Token:
    auth_service = AuthService(db)
    return await auth_service.refresh_tokens(refresh_data.refresh_token)


@router.get(
    "/me",
    response_model=UserRead,
    summary="Get Current Authenticated User",
    description="Returns the profile details of the currently authenticated user.",
)
async def get_me(
    current_user: User = Depends(get_current_user),
) -> UserRead:
    return UserRead.model_validate(current_user)
