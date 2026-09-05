from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import CredentialsException, DuplicateEntityException
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    verify_password,
)
from app.features.auth.schemas import Token
from app.features.users.models import User
from app.features.users.repository import UserRepository
from app.features.users.schemas import UserCreate, UserRead


class AuthService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.user_repo = UserRepository(db)

    async def register(self, user_in: UserCreate) -> tuple[UserRead, Token]:
        existing_user = await self.user_repo.get_by_email(user_in.email)
        if existing_user:
            raise DuplicateEntityException(entity_name="User", field="email", value=user_in.email)

        hashed_pw = hash_password(user_in.password)
        user = await self.user_repo.create(user_in, hashed_password=hashed_pw)

        access_token = create_access_token(subject=user.id)
        refresh_token = create_refresh_token(subject=user.id)

        token = Token(access_token=access_token, refresh_token=refresh_token)
        user_read = UserRead.model_validate(user)
        return user_read, token

    async def authenticate(self, email: str, password: str) -> tuple[User, Token]:
        user = await self.user_repo.get_by_email(email)
        if not user or not verify_password(password, user.hashed_password):
            raise CredentialsException("Invalid email or password")
        if not user.is_active:
            raise CredentialsException("User account is inactive")

        access_token = create_access_token(subject=user.id)
        refresh_token = create_refresh_token(subject=user.id)
        token = Token(access_token=access_token, refresh_token=refresh_token)
        return user, token

    async def refresh_tokens(self, refresh_token_str: str) -> Token:
        payload = decode_token(refresh_token_str)
        if not payload or payload.get("type") != "refresh":
            raise CredentialsException("Invalid or expired refresh token")

        user_id = payload.get("sub")
        if not user_id:
            raise CredentialsException("Invalid token payload")

        user = await self.user_repo.get_by_id(user_id)
        if not user or not user.is_active:
            raise CredentialsException("User associated with token not found or inactive")

        new_access_token = create_access_token(subject=user.id)
        new_refresh_token = create_refresh_token(subject=user.id)
        return Token(access_token=new_access_token, refresh_token=new_refresh_token)
