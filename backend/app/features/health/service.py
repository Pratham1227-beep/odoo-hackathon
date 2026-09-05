import time
from datetime import datetime, timezone
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.features.health.schemas import DBHealthResponse, SystemHealthResponse


class HealthService:
    @staticmethod
    def get_system_health() -> SystemHealthResponse:
        return SystemHealthResponse(
            status="ok",
            app_name=settings.PROJECT_NAME,
            version=settings.VERSION,
            environment=settings.ENVIRONMENT,
            timestamp=datetime.now(timezone.utc),
        )

    @staticmethod
    async def check_db_health(db: AsyncSession) -> tuple[DBHealthResponse, int]:
        """Ping database with SELECT 1 and measure latency."""
        start_time = time.perf_counter()
        db_type = "sqlite" if settings.DATABASE_URL.startswith("sqlite") else "postgresql"
        
        try:
            result = await db.execute(text("SELECT 1"))
            result.scalar()
            latency = (time.perf_counter() - start_time) * 1000  # ms
            
            response = DBHealthResponse(
                status="healthy",
                database_type=db_type,
                latency_ms=round(latency, 2),
                message="Database connection established successfully",
            )
            return response, 200
        except Exception as err:
            latency = (time.perf_counter() - start_time) * 1000
            response = DBHealthResponse(
                status="unhealthy",
                database_type=db_type,
                latency_ms=round(latency, 2),
                message="Database connection failed",
                error=str(err),
            )
            return response, 503
