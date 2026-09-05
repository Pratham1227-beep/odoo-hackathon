import uuid
from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.exceptions import ForbiddenError, UnauthorizedError
from app.core.security import decode_token
from app.features.auth.models import Organization, User
from app.shared.enums import OrganizationStatus, UserRole, UserStatus

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    """Validate Bearer JWT token, verify user and token_version match DB state."""
    payload = decode_token(token)
    if payload.get("type") != "access":
        raise UnauthorizedError("Invalid token type (expected access token)")

    user_id_str = payload.get("sub")
    if not user_id_str:
        raise UnauthorizedError("Token payload missing subject identifier")

    try:
        user_uuid = uuid.UUID(user_id_str)
    except ValueError:
        raise UnauthorizedError("Invalid user ID in token payload")

    token_version = payload.get("token_version", 0)

    # Fetch user with organization
    stmt = (
        select(User)
        .where(User.id == user_uuid)
    )
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()

    if not user:
        raise UnauthorizedError("User associated with token not found")

    if user.status != UserStatus.ACTIVE:
        raise ForbiddenError("User account is inactive or suspended")

    if user.organization and user.organization.status != OrganizationStatus.ACTIVE:
        raise ForbiddenError("Organization subscription is inactive or suspended")

    # Verify token_version has not been bumped
    if user.token_version != token_version:
        raise UnauthorizedError("Token has been invalidated (please log in again)")

    return user


async def get_current_active_admin(
    current_user: User = Depends(get_current_user),
) -> User:
    """Dependency helper to enforce admin role."""
    if current_user.role != UserRole.ADMIN:
        raise ForbiddenError("Administrator access required")
    return current_user
