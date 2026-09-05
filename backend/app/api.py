from fastapi import APIRouter
from app.features.auth.router import router as auth_router

api_router = APIRouter()

# Mount feature routers under /api/v1
api_router.include_router(auth_router)
