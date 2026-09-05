from typing import List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.exceptions import EntityNotFoundException
from app.features.auth.dependencies import get_current_user
from app.features.users.models import User
from app.features.users.repository import UserRepository
from app.features.users.schemas import UserRead

router = APIRouter(prefix="/users", tags=["Users"])


@router.get(
    "",
    response_model=List[UserRead],
    summary="List Users",
    description="Retrieve a paginated list of users (requires authentication).",
)
async def list_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> List[UserRead]:
    user_repo = UserRepository(db)
    users = await user_repo.list_users(skip=skip, limit=limit)
    return [UserRead.model_validate(u) for u in users]


@router.get(
    "/{user_id}",
    response_model=UserRead,
    summary="Get User By ID",
    description="Retrieve a specific user by ID.",
)
async def get_user_by_id(
    user_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> UserRead:
    user_repo = UserRepository(db)
    user = await user_repo.get_by_id(user_id)
    if not user:
        raise EntityNotFoundException(entity_name="User", identifier=user_id)
    return UserRead.model_validate(user)
