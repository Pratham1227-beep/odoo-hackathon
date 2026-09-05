from fastapi import APIRouter
from app.features.auth.router import router as auth_router
from app.features.employees.router import router as employees_router
from app.features.organization.router import router as organization_router

api_router = APIRouter()

# Mount feature routers under /api/v1
api_router.include_router(auth_router)
api_router.include_router(organization_router)
api_router.include_router(employees_router)
