from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.exceptions import CredentialsException, ForbiddenException
from app.core.security import decode_token
from app.features.users.models import User
from app.features.users.repository import UserRepository

security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db),
) -> User:
    token = credentials.credentials
    payload = decode_token(token)
    if not payload or payload.get("type") != "access":
        raise CredentialsException("Invalid or expired access token")

    user_id: str = payload.get("sub")
    if not user_id:
        raise CredentialsException("Token payload missing subject identifier")

    user_repo = UserRepository(db)
    user = await user_repo.get_by_id(user_id)
    if not user:
        raise CredentialsException("User associated with token not found")

    if not user.is_active:
        raise CredentialsException("User account is inactive")

    return user


async def get_current_active_superuser(
    current_user: User = Depends(get_current_user),
) -> User:
    if not current_user.is_superuser:
        raise ForbiddenException("Superuser privileges required")
    return current_user
