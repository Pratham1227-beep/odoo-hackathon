import asyncio
from pathlib import Path
import sys
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.core.config import settings
from app.shared.base_model import Base
import app.features.attendance.models  # noqa: F401
import app.features.auth.models  # noqa: F401
import app.features.contracts.models  # noqa: F401
import app.features.employees.models  # noqa: F401
import app.features.notifications.models  # noqa: F401
import app.features.organization.models  # noqa: F401
import app.features.payroll.models  # noqa: F401
import app.features.payroll_config.models  # noqa: F401
import app.features.reports_dashboard.models  # noqa: F401
import app.features.time_off.models  # noqa: F401
import app.core.audit  # noqa: F401

from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy.schema import CreateTable

async def setup():
    engine = create_async_engine(settings.DATABASE_URL, echo=False)
    async with engine.begin() as conn:
        print("Creating tables in topological dependency order...")
        for table in Base.metadata.sorted_tables:
            print(f"Creating table: {table.name}")
            try:
                await conn.run_sync(lambda sync_conn: table.create(sync_conn, checkfirst=True))
                print(f"  -> Created/verified {table.name}")
            except Exception as e:
                print(f"  -> Error on {table.name}: {e}")
    print("Schema initialization finished!")
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(setup())
