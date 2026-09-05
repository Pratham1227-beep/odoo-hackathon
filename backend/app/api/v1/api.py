from fastapi import APIRouter

from app.features.auth.router import router as auth_router
from app.features.health.router import router as health_router
from app.features.users.router import router as users_router

api_router = APIRouter()

# Include health routes at top-level / or under api_router
api_router.include_router(health_router)
api_router.include_router(auth_router)
api_router.include_router(users_router)
