from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from app.core.config import settings
from app.shared.base_model import Base


def get_engine_kwargs(database_url: str) -> dict:
    """Return engine arguments tailored for SQLite vs PostgreSQL."""
    kwargs: dict = {
        "echo": False,
        "future": True,
    }
    if database_url.startswith("sqlite"):
        kwargs["connect_args"] = {"check_same_thread": False}
    else:
        # PostgreSQL / asyncpg pool configuration
        kwargs["pool_pre_ping"] = True
        kwargs["pool_size"] = 10
        kwargs["max_overflow"] = 20
    return kwargs


db_url = settings.DATABASE_URL
if db_url.startswith("postgresql://"):
    db_url = db_url.replace("postgresql://", "postgresql+asyncpg://", 1)

engine: AsyncEngine = create_async_engine(
    db_url,
    **get_engine_kwargs(db_url),
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Dependency that provides an async database session."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


def import_all_models() -> None:
    """Import all SQLAlchemy models so relationships and mappers are registered."""
    import app.features.organization.models  # noqa: F401
    import app.features.auth.models  # noqa: F401
    import app.features.employees.models  # noqa: F401
    import app.features.contracts.models  # noqa: F401
    import app.features.attendance.models  # noqa: F401
    import app.features.time_off.models  # noqa: F401
    import app.features.payroll_config.models  # noqa: F401
    import app.features.payroll.models  # noqa: F401
    import app.features.reports_dashboard.models  # noqa: F401
    import app.features.notifications.models  # noqa: F401
    import app.core.audit  # noqa: F401

# Register all models on module load
import_all_models()


async def init_db() -> None:
    """Initialize database tables."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

