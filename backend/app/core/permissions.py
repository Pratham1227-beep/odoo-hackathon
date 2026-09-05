from typing import Sequence
from fastapi import Depends
from app.core.exceptions import ForbiddenError
from app.features.auth.dependencies import get_current_user
from app.features.auth.models import User
from app.shared.enums import UserRole


def require_role(*allowed_roles: UserRole | str):
    """FastAPI dependency factory to enforce RBAC permissions on routes.
    Checks current_user.role against allowed set and raises ForbiddenError(403) otherwise.
    """
    target_roles = {
        r.value if isinstance(r, UserRole) else str(r)
        for r in allowed_roles
    }

    async def role_checker(current_user: User = Depends(get_current_user)) -> User:
        user_role_str = current_user.role.value if hasattr(current_user.role, "value") else str(current_user.role)
        if user_role_str not in target_roles and user_role_str != UserRole.ADMIN.value:
            raise ForbiddenError(
                f"Access denied. Required roles: {sorted(list(target_roles))}"
            )
        return current_user

    return role_checker
