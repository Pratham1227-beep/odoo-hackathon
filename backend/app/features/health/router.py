from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.features.health.schemas import DBHealthResponse, SystemHealthResponse
from app.features.health.service import HealthService

router = APIRouter(tags=["Health"])


@router.get(
    "/health",
    response_model=SystemHealthResponse,
    status_code=status.HTTP_200_OK,
    summary="Get System Health",
    description="Returns general system health status, application name, version, and server timestamp.",
)
async def get_health() -> SystemHealthResponse:
    return HealthService.get_system_health()


@router.get(
    "/health/db",
    response_model=DBHealthResponse,
    summary="Get Database Health",
    description="Pings the database to verify connectivity, measure latency, and check DB status.",
)
async def get_db_health(
    response: Response,
    db: AsyncSession = Depends(get_db),
) -> DBHealthResponse:
    db_health, status_code = await HealthService.check_db_health(db)
    response.status_code = status_code
    return db_health
