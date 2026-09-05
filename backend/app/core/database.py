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
        "echo": settings.DEBUG and settings.ENVIRONMENT == "development",
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


engine: AsyncEngine = create_async_engine(
    settings.DATABASE_URL,
    **get_engine_kwargs(settings.DATABASE_URL),
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


async def init_db() -> None:
    """Initialize database tables."""
    import logging
    logger = logging.getLogger("uvicorn.error")

    # Import all models inside init_db to ensure Base.metadata is fully populated without circular import issues
    from app.features.auth.models import Organization, User  # noqa: F401
    from app.features.organization.models import Department, Designation, WorkLocation  # noqa: F401
    from app.features.employees.models import Employee, EmployeeBankDetail, EmployeeDocument  # noqa: F401
    from app.features.payroll_config.models import (  # noqa: F401
        EmployeeSalaryComponent,
        SalaryRule,
        SalaryStructure,
        SalaryStructureRule,
        SystemConfig,
    )
    from app.features.contracts.models import Contract  # noqa: F401
    from app.features.attendance.models import (  # noqa: F401
        Attendance,
        AttendanceCorrection,
        Holiday,
    )
    from app.features.time_off.models import (  # noqa: F401
        LeaveAllocation,
        LeaveRequest,
        LeaveType,
    )
    from app.features.payroll.models import (  # noqa: F401
        PayrollValidationIssue,
        Payrun,
        PayrunEmployee,
        Payslip,
        PayslipDelivery,
        PayslipLine,
    )
    from app.core.audit import AuditLog  # noqa: F401
    from app.features.notifications.models import Notification  # noqa: F401
    from app.features.reports_dashboard.models import AnalyticsSnapshot  # noqa: F401

    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("Database tables initialized successfully.")
    except Exception as e:
        logger.warning(f"Database initialization notice (tables may already exist): {e}")
