import asyncio
from pathlib import Path
import sys
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from sqlalchemy import select, func, text
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from app.core.config import settings
from app.core.database import get_engine_kwargs

async def check():
    engine = create_async_engine(settings.DATABASE_URL, **get_engine_kwargs(settings.DATABASE_URL))
    session_factory = async_sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)
    
    async with session_factory() as db:
        tables = [
            "organizations",
            "departments",
            "designations",
            "work_locations",
            "users",
            "employees",
            "employee_bank_details",
            "contracts",
            "leave_allocations",
            "leave_requests",
            "attendances",
            "payruns",
            "payrun_employees",
            "payslips",
            "payslip_lines",
            "analytics_snapshots"
        ]
        print("=" * 50)
        print("DATABASE RECORD COUNTS IN SUPABASE POSTGRESQL:")
        print("=" * 50)
        for t in tables:
            try:
                res = await db.execute(text(f"SELECT COUNT(*) FROM {t}"))
                count = res.scalar()
                print(f"  {t:<25}: {count}")
            except Exception as e:
                print(f"  {t:<25}: Error ({e})")
        print("=" * 50)
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(check())
