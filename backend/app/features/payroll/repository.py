from datetime import date
from decimal import Decimal
from typing import Any, Dict, List, Optional, Sequence, Tuple
import uuid
from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.features.employees.models import Employee
from app.features.organization.models import Department, Designation
from app.features.payroll.models import (
    PayrollValidationIssue,
    Payrun,
    PayrunEmployee,
    Payslip,
    PayslipDelivery,
    PayslipLine,
)
from app.shared.enums import PayrollIssueStatus, PayrunStatus, PayslipStatus
from app.shared.pagination import PageParams, PaginatedResponse


class PayrunRepository:

    @staticmethod
    async def get_by_id(
        db: AsyncSession,
        org_id: uuid.UUID,
        payrun_id: uuid.UUID,
    ) -> Optional[Payrun]:
        stmt = (
            select(Payrun)
            .where(Payrun.organization_id == org_id, Payrun.id == payrun_id)
            .options(
                selectinload(Payrun.employees).selectinload(PayrunEmployee.employee),
                selectinload(Payrun.employees).selectinload(PayrunEmployee.contract),
                selectinload(Payrun.issues).selectinload(PayrollValidationIssue.employee),
                selectinload(Payrun.payslips),
                selectinload(Payrun.created_by),
                selectinload(Payrun.finalized_by),
            )
        )
        return (await db.execute(stmt)).scalar_one_or_none()

    @staticmethod
    async def list_payruns(
        db: AsyncSession,
        org_id: uuid.UUID,
        status: Optional[PayrunStatus] = None,
        year: Optional[int] = None,
        month: Optional[int] = None,
        page: int = 1,
        page_size: int = 20,
    ) -> Tuple[Sequence[Payrun], int]:
        stmt = select(Payrun).where(Payrun.organization_id == org_id)
        count_stmt = select(func.count(Payrun.id)).where(Payrun.organization_id == org_id)

        if status is not None:
            stmt = stmt.where(Payrun.status == status)
            count_stmt = count_stmt.where(Payrun.status == status)
        if year is not None:
            stmt = stmt.where(Payrun.year == year)
            count_stmt = count_stmt.where(Payrun.year == year)
        if month is not None:
            stmt = stmt.where(Payrun.month == month)
            count_stmt = count_stmt.where(Payrun.month == month)

        total = (await db.execute(count_stmt)).scalar() or 0
        stmt = (
            stmt.order_by(Payrun.year.desc(), Payrun.month.desc(), Payrun.created_at.desc())
            .offset((page - 1) * page_size)
            .limit(page_size)
        )
        items = (await db.execute(stmt)).scalars().all()
        return items, total

    @staticmethod
    async def create(db: AsyncSession, payrun: Payrun) -> Payrun:
        db.add(payrun)
        await db.commit()
        await db.refresh(payrun)
        return await PayrunRepository.get_by_id(db, payrun.organization_id, payrun.id)

    @staticmethod
    async def save(db: AsyncSession, payrun: Payrun) -> Payrun:
        await db.commit()
        await db.refresh(payrun)
        return await PayrunRepository.get_by_id(db, payrun.organization_id, payrun.id)

    @staticmethod
    async def get_ytd_stats(
        db: AsyncSession,
        org_id: uuid.UUID,
        year: int,
    ) -> Dict[str, Any]:
        stmt = select(
            func.coalesce(func.sum(Payrun.total_gross), 0.00),
            func.coalesce(func.sum(Payrun.total_deductions), 0.00),
            func.coalesce(func.sum(Payrun.total_net), 0.00),
            func.count(Payrun.id),
        ).where(
            Payrun.organization_id == org_id,
            Payrun.year == year,
            Payrun.status.in_([PayrunStatus.PROCESSED, PayrunStatus.FINALIZED]),
        )
        res = (await db.execute(stmt)).first()
        if res:
            return {
                "ytd_gross": Decimal(str(res[0])),
                "ytd_deductions": Decimal(str(res[1])),
                "ytd_net": Decimal(str(res[2])),
                "ytd_processed_payruns": int(res[3]),
            }
        return {
            "ytd_gross": Decimal("0.00"),
            "ytd_deductions": Decimal("0.00"),
            "ytd_net": Decimal("0.00"),
            "ytd_processed_payruns": 0,
        }


class PayrollValidationIssueRepository:

    @staticmethod
    async def count_open_issues(db: AsyncSession, org_id: uuid.UUID) -> int:
        stmt = select(func.count(PayrollValidationIssue.id)).where(
            PayrollValidationIssue.organization_id == org_id,
            PayrollValidationIssue.status == PayrollIssueStatus.OPEN,
        )
        return (await db.execute(stmt)).scalar() or 0


class PayslipRepository:

    @staticmethod
    async def get_by_id(
        db: AsyncSession,
        org_id: uuid.UUID,
        payslip_id: uuid.UUID,
    ) -> Optional[Payslip]:
        stmt = (
            select(Payslip)
            .where(Payslip.organization_id == org_id, Payslip.id == payslip_id)
            .options(
                selectinload(Payslip.employee).selectinload(Employee.department),
                selectinload(Payslip.employee).selectinload(Employee.designation),
                selectinload(Payslip.employee).selectinload(Employee.organization),
                selectinload(Payslip.payrun),
                selectinload(Payslip.lines),
                selectinload(Payslip.deliveries),
            )
        )
        return (await db.execute(stmt)).scalar_one_or_none()

    @staticmethod
    async def list_payslips(
        db: AsyncSession,
        org_id: uuid.UUID,
        employee_id: Optional[uuid.UUID] = None,
        month: Optional[int] = None,
        year: Optional[int] = None,
        status: Optional[PayslipStatus] = None,
        page: int = 1,
        page_size: int = 20,
    ) -> Tuple[Sequence[Payslip], int]:
        stmt = (
            select(Payslip)
            .where(Payslip.organization_id == org_id)
            .options(
                selectinload(Payslip.employee),
                selectinload(Payslip.payrun),
                selectinload(Payslip.lines),
            )
        )
        count_stmt = select(func.count(Payslip.id)).where(Payslip.organization_id == org_id)

        if employee_id is not None:
            stmt = stmt.where(Payslip.employee_id == employee_id)
            count_stmt = count_stmt.where(Payslip.employee_id == employee_id)

        if status is not None:
            stmt = stmt.where(Payslip.status == status)
            count_stmt = count_stmt.where(Payslip.status == status)

        if year is not None:
            stmt = stmt.join(Payrun, Payslip.payrun_id == Payrun.id).where(Payrun.year == year)
            count_stmt = count_stmt.join(Payrun, Payslip.payrun_id == Payrun.id).where(Payrun.year == year)

        if month is not None:
            if year is None:
                stmt = stmt.join(Payrun, Payslip.payrun_id == Payrun.id)
                count_stmt = count_stmt.join(Payrun, Payslip.payrun_id == Payrun.id)
            stmt = stmt.where(Payrun.month == month)
            count_stmt = count_stmt.where(Payrun.month == month)

        total = (await db.execute(count_stmt)).scalar() or 0
        stmt = (
            stmt.order_by(Payslip.period_start.desc(), Payslip.created_at.desc())
            .offset((page - 1) * page_size)
            .limit(page_size)
        )
        items = (await db.execute(stmt)).scalars().all()
        return items, total

    @staticmethod
    async def count_all_for_period(
        db: AsyncSession,
        org_id: uuid.UUID,
        year: int,
        month: int,
    ) -> int:
        stmt = (
            select(func.count(Payslip.id))
            .join(Payrun, Payslip.payrun_id == Payrun.id)
            .where(
                Payslip.organization_id == org_id,
                Payrun.year == year,
                Payrun.month == month,
            )
        )
        return (await db.execute(stmt)).scalar() or 0
