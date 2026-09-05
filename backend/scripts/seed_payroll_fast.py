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

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("seed_payroll_fast")

async def run():
    engine = create_async_engine(settings.DATABASE_URL, **get_engine_kwargs(settings.DATABASE_URL))
    session_factory = async_sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)

    async with session_factory() as db:
        # Get Organization ID
        org_res = await db.execute(text("SELECT id FROM organizations WHERE code = 'PPT' LIMIT 1"))
        org_id_row = org_res.first()
        if not org_id_row:
            logger.error("Organization PPT not found!")
            return
        org_id = org_id_row[0]

        # Get Admin User ID
        admin_res = await db.execute(text("SELECT id FROM users WHERE email = 'admin@peoplepay.com' LIMIT 1"))
        admin_row = admin_res.first()
        admin_id = admin_row[0] if admin_row else None

        # 1. Create or get Payrun
        pr_res = await db.execute(text("SELECT id FROM payruns WHERE organization_id = :org_id AND year = 2026 AND month = 8"), {"org_id": org_id})
        pr_row = pr_res.first()
        if not pr_row:
            payrun_id = uuid.uuid4()
            await db.execute(text("""
                INSERT INTO payruns (
                    id, organization_id, name, period_start, period_end, month, year,
                    status, total_employees, processed_employees, issue_count,
                    total_gross, total_deductions, total_net, created_by_id, finalized_by_id,
                    computed_at, finalized_at, created_at, updated_at
                ) VALUES (
                    :id, :org_id, 'August 2026 Monthly Payroll', '2026-08-01', '2026-08-31', 8, 2026,
                    'FINALIZED', 250, 250, 0, 0, 0, 0, :admin_id, :admin_id,
                    '2026-08-31 18:00:00+00', '2026-08-31 19:00:00+00', now(), now()
                )
            """), {"id": payrun_id, "org_id": org_id, "admin_id": admin_id})
            await db.commit()
        else:
            payrun_id = pr_row[0]

        # 2. Get all employees and their contracts
        emp_res = await db.execute(text("""
            SELECT e.id, e.employee_code, c.id as contract_id, COALESCE(c.base_wage, 60000) as base_wage
            FROM employees e
            LEFT JOIN contracts c ON c.employee_id = e.id AND c.organization_id = :org_id
            WHERE e.organization_id = :org_id
            ORDER BY e.employee_code ASC
        """), {"org_id": org_id})
        employees = emp_res.all()

        logger.info(f"Generating payroll for {len(employees)} employees...")

        running_gross = Decimal("0.00")
        running_ded = Decimal("0.00")
        running_net = Decimal("0.00")

        pe_inserts = []
        slip_inserts = []
        line_inserts = []

        for emp_id, emp_code, cnt_id, wage in employees:
            basic = Decimal(str(wage))
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

            pe_id = uuid.uuid4()
            slip_id = uuid.uuid4()

            pe_inserts.append({
                "id": pe_id, "org_id": org_id, "payrun_id": payrun_id,
                "employee_id": emp_id, "contract_id": cnt_id,
                "status": "COMPUTED", "payable_days": Decimal("31.0"),
                "worked_days": Decimal("22.0"), "leave_days": Decimal("0.0"),
                "absent_days": Decimal("0.0"), "overtime_hours": Decimal("0.00"),
                "gross": gross, "deductions": deductions, "net": net, "is_ready": True
            })

            slip_inserts.append({
                "id": slip_id, "org_id": org_id, "payrun_id": payrun_id,
                "employee_id": emp_id, "contract_id": cnt_id,
                "payslip_number": f"SLIP-202608-{emp_code}",
                "period_start": date(2026, 8, 1), "period_end": date(2026, 8, 31),
                "basic": basic, "gross": gross, "total_earnings": gross,
                "total_deductions": deductions, "net": net, "status": "PAID",
                "pdf_url": f"/storage/payslips/202608/SLIP-202608-{emp_code}.pdf"
            })

            lines = [
                ("Basic Salary", "BASIC", "BASIC", basic),
                ("House Rent Allowance", "HRA", "ALLOWANCE", hra),
                ("Special Allowance", "SPECIAL_ALLOWANCE", "ALLOWANCE", allowance),
                ("Provident Fund", "PF", "DEDUCTION", pf),
                ("Professional Tax", "PT", "DEDUCTION", pt),
                ("Net Payable Salary", "NET", "NET", net),
            ]
            for l_name, l_code, l_cat, l_amt in lines:
                line_inserts.append({
                    "id": uuid.uuid4(), "org_id": org_id, "payslip_id": slip_id,
                    "name": l_name, "code": l_code, "category": l_cat,
                    "amount": l_amt, "base_amount": l_amt, "sequence": 10
                })

        # Check existing payslips
        existing_slips = (await db.execute(text("SELECT count(*) FROM payslips WHERE payrun_id = :p_id"), {"p_id": payrun_id})).scalar()
        if existing_slips == 0:
            logger.info("Inserting PayrunEmployees...")
            await db.execute(text("""
                INSERT INTO payrun_employees (
                    id, organization_id, payrun_id, employee_id, contract_id,
                    status, payable_days, worked_days, leave_days, absent_days, overtime_hours,
                    gross_salary, total_deductions, net_salary, is_ready, computed_at,
                    created_at, updated_at
                ) VALUES (
                    :id, :org_id, :payrun_id, :employee_id, :contract_id,
                    :status, :payable_days, :worked_days, :leave_days, :absent_days, :overtime_hours,
                    :gross, :deductions, :net, :is_ready, now(),
                    now(), now()
                )
            """), pe_inserts)
            await db.commit()


            logger.info("Inserting Payslips...")
            await db.execute(text("""
                INSERT INTO payslips (
                    id, organization_id, payrun_id, employee_id, contract_id,
                    payslip_number, period_start, period_end, basic_salary, gross_salary,
                    total_earnings, total_deductions, net_salary, status, pdf_url,
                    generated_at, paid_at, sent_at, created_at, updated_at
                ) VALUES (
                    :id, :org_id, :payrun_id, :employee_id, :contract_id,
                    :payslip_number, :period_start, :period_end, :basic, :gross,
                    :total_earnings, :total_deductions, :net, :status, :pdf_url,
                    '2026-08-31 18:00:00+00', '2026-08-31 19:00:00+00', '2026-08-31 19:30:00+00', now(), now()
                )
            """), slip_inserts)
            await db.commit()

            logger.info(f"Inserting {len(line_inserts)} PayslipLines...")
            # Chunk line inserts
            for i in range(0, len(line_inserts), 500):
                chunk = line_inserts[i:i+500]
                await db.execute(text("""
                    INSERT INTO payslip_lines (
                        id, organization_id, payslip_id, name, code, category,
                        amount, base_amount, sequence, created_at, updated_at
                    ) VALUES (
                        :id, :org_id, :payslip_id, :name, :code, :category,
                        :amount, :base_amount, :sequence, now(), now()
                    )
                """), chunk)
                await db.commit()

            # Update Payrun
            await db.execute(text("""
                UPDATE payruns
                SET total_gross = :gross, total_deductions = :ded, total_net = :net,
                    total_employees = :count, processed_employees = :count
                WHERE id = :p_id
            """), {
                "gross": running_gross, "ded": running_ded, "net": running_net,
                "count": len(employees), "p_id": payrun_id
            })
            await db.commit()
            logger.info(f"✅ Payrun updated: Gross ₹{running_gross:,.2f} | Net ₹{running_net:,.2f}")

        # Analytics Snapshot
        snap_count = (await db.execute(text("SELECT count(*) FROM analytics_snapshots WHERE organization_id = :org_id"), {"org_id": org_id})).scalar()
        if snap_count == 0:
            await db.execute(text("""
                INSERT INTO analytics_snapshots (
                    id, organization_id, type, date, data, created_at, updated_at
                ) VALUES (
                    :id, :org_id, 'PAYROLL_MONTHLY', '2026-08-01', :data, now(), now()
                )
            """), {
                "id": uuid.uuid4(),
                "org_id": org_id,
                "data": json.dumps({
                    "total_gross": float(running_gross),
                    "total_deductions": float(running_ded),
                    "total_net": float(running_net),
                    "employee_count": len(employees),
                    "avg_salary": float(running_net / len(employees)) if employees else 0.0,
                })
            })
            await db.commit()
            logger.info("✅ Analytics Snapshot created.")

    await engine.dispose()
    logger.info("🎉 Done!")

if __name__ == "__main__":
    asyncio.run(run())
