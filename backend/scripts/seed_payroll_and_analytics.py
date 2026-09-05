import asyncio
from datetime import date, datetime, timezone
from decimal import Decimal
import json
import logging
from pathlib import Path
import sys
import uuid

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from app.core.config import settings
from app.core.database import get_engine_kwargs
from app.features.auth.models import Organization, User
from app.features.contracts.models import Contract
from app.features.employees.models import Employee
from app.features.payroll.models import Payrun, PayrunEmployee, Payslip, PayslipLine
from app.features.reports_dashboard.models import AnalyticsSnapshot
from app.shared.enums import PayrunStatus, PayrunEmployeeStatus, PayslipStatus

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("seed_payroll")

async def run():
    engine = create_async_engine(settings.DATABASE_URL, **get_engine_kwargs(settings.DATABASE_URL))
    session_factory = async_sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)

    async with session_factory() as db:
        stmt_org = select(Organization).where(Organization.code == "PPT")
        org = (await db.execute(stmt_org)).scalar_one_or_none()
        if not org:
            logger.error("Organization PPT not found!")
            return

        org_id = org.id
        admin_user = (await db.execute(select(User).where(User.email == "admin@peoplepay.com"))).scalar_one_or_none()
        admin_id = admin_user.id if admin_user else None

        # 1. Fetch or create Payrun
        chk_pr = select(Payrun).where(
            Payrun.organization_id == org_id,
            Payrun.year == 2026,
            Payrun.month == 8,
        )
        payrun = (await db.execute(chk_pr)).scalar_one_or_none()
        if not payrun:
            payrun = Payrun(
                id=uuid.uuid4(),
                organization_id=org_id,
                name="August 2026 Monthly Payroll",
                period_start=date(2026, 8, 1),
                period_end=date(2026, 8, 31),
                month=8,
                year=2026,
                status=PayrunStatus.FINALIZED,
                total_employees=250,
                processed_employees=250,
                issue_count=0,
                total_gross=Decimal("0.00"),
                total_deductions=Decimal("0.00"),
                total_net=Decimal("0.00"),
                created_by_id=admin_id,
                finalized_by_id=admin_id,
                computed_at=datetime(2026, 8, 31, 18, 0, tzinfo=timezone.utc),
                finalized_at=datetime(2026, 8, 31, 19, 0, tzinfo=timezone.utc),
            )
            db.add(payrun)
            await db.commit()

        # 2. Fetch all employees and contracts
        stmt_emp = select(Employee).where(Employee.organization_id == org_id).order_by(Employee.employee_code.asc())
        employees = (await db.execute(stmt_emp)).scalars().all()

        stmt_cnt = select(Contract).where(Contract.organization_id == org_id)
        contracts = (await db.execute(stmt_cnt)).scalars().all()
        cnt_map = {c.employee_id: c for c in contracts}

        logger.info(f"Processing payroll for {len(employees)} employees...")

        running_gross = Decimal("0.00")
        running_ded = Decimal("0.00")
        running_net = Decimal("0.00")

        pe_batch = []
        slip_batch = []
        line_batch = []

        for emp in employees:
            cnt = cnt_map.get(emp.id)
            wage = cnt.base_wage if cnt else Decimal("60000.00")
            basic = wage
            hra = (basic * Decimal("0.40")).quantize(Decimal("0.01"))
            allowance = Decimal("10000.00")
            pf = (basic * Decimal("0.12")).quantize(Decimal("0.01"))
            pt = Decimal("200.00")
            gross = basic + hra + allowance
            deductions = pf + pt
            net = gross - deductions

            running_gross += gross
            running_ded += deductions
            running_net += net

            cnt_id = cnt.id if cnt else None

            pe = PayrunEmployee(
                id=uuid.uuid4(),
                organization_id=org_id,
                payrun_id=payrun.id,
                employee_id=emp.id,
                contract_id=cnt_id,
                status=PayrunEmployeeStatus.COMPUTED,
                basic_salary=basic,
                gross_salary=gross,
                total_deductions=deductions,
                net_salary=net,
                is_ready=True,
            )
            pe_batch.append(pe)

            slip = Payslip(
                id=uuid.uuid4(),
                organization_id=org_id,
                payrun_id=payrun.id,
                employee_id=emp.id,
                contract_id=cnt_id,
                payslip_number=f"SLIP-202608-{emp.employee_code}",
                period_start=date(2026, 8, 1),
                period_end=date(2026, 8, 31),
                basic_salary=basic,
                gross_salary=gross,
                total_earnings=gross,
                total_deductions=deductions,
                net_salary=net,
                status=PayslipStatus.PAID,
                pdf_url=f"/storage/payslips/202608/SLIP-202608-{emp.employee_code}.pdf",
                generated_at=datetime(2026, 8, 31, 18, 0, tzinfo=timezone.utc),
                paid_at=datetime(2026, 8, 31, 19, 0, tzinfo=timezone.utc),
                sent_at=datetime(2026, 8, 31, 19, 30, tzinfo=timezone.utc),
            )
            slip_batch.append(slip)

            lines_data = [
                ("BASIC", "Basic Salary", "BASIC", basic),
                ("HRA", "House Rent Allowance", "ALLOWANCE", hra),
                ("SPECIAL_ALLOWANCE", "Special Allowance", "ALLOWANCE", allowance),
                ("PF", "Provident Fund", "DEDUCTION", pf),
                ("PT", "Professional Tax", "DEDUCTION", pt),
                ("NET", "Net Payable Salary", "NET", net),
            ]
            for l_code, l_name, l_cat, l_amt in lines_data:
                pl = PayslipLine(
                    id=uuid.uuid4(),
                    organization_id=org_id,
                    payslip_id=slip.id,
                    name=l_name,
                    code=l_code,
                    category=l_cat,
                    amount=l_amt,
                    base_amount=l_amt,
                    sequence=10,
                )
                line_batch.append(pl)

        # Batch insert Payrun Employees and Payslips
        db.add_all(pe_batch)
        db.add_all(slip_batch)
        await db.commit()
        logger.info(f"✅ Committed {len(pe_batch)} PayrunEmployees and {len(slip_batch)} Payslips")

        # Insert lines in chunks of 500
        for i in range(0, len(line_batch), 500):
            chunk = line_batch[i:i+500]
            db.add_all(chunk)
            await db.commit()
            logger.info(f"  Committed {min(i+500, len(line_batch))} / {len(line_batch)} Payslip Lines...")

        # Update Payrun Totals
        await db.execute(text("""
            UPDATE payruns
            SET total_gross = :gross, total_deductions = :ded, total_net = :net,
                total_employees = :count, processed_employees = :count
            WHERE id = :p_id
        """), {
            "gross": running_gross,
            "ded": running_ded,
            "net": running_net,
            "count": len(employees),
            "p_id": payrun.id,
        })
        await db.commit()
        logger.info(f"✅ Updated Payrun Totals: Gross ₹{running_gross:,.2f} | Net ₹{running_net:,.2f}")

        # Analytics Snapshot
        snap = AnalyticsSnapshot(
            id=uuid.uuid4(),
            organization_id=org_id,
            type="PAYROLL_MONTHLY",
            date=date(2026, 8, 1),
            data=json.dumps({
                "total_gross": float(running_gross),
                "total_deductions": float(running_ded),
                "total_net": float(running_net),
                "employee_count": len(employees),
                "avg_salary": float(running_net / len(employees)) if employees else 0.0,
            }),
        )
        db.add(snap)
        await db.commit()
        logger.info("✅ Created Monthly Analytics Snapshot for Dashboard")

    await engine.dispose()
    logger.info("🎉 All Payroll & Analytics records generated successfully!")

if __name__ == "__main__":
    asyncio.run(run())
