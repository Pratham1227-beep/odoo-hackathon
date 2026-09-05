from datetime import date
from typing import Any, Dict, List, Optional, Sequence, Tuple
import uuid
from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.features.contracts.models import Contract
from app.shared.enums import ContractStatus
from app.shared.pagination import PageParams, PaginatedResponse


class ContractRepository:

    @staticmethod
    async def get_by_id(
        db: AsyncSession,
        org_id: uuid.UUID,
        contract_id: uuid.UUID,
    ) -> Optional[Contract]:
        stmt = (
            select(Contract)
            .where(
                Contract.organization_id == org_id,
                Contract.id == contract_id,
            )
            .options(
                selectinload(Contract.employee),
                selectinload(Contract.salary_structure),
            )
        )
        return (await db.execute(stmt)).scalar_one_or_none()

    @staticmethod
    async def get_by_number(
        db: AsyncSession,
        org_id: uuid.UUID,
        contract_number: str,
    ) -> Optional[Contract]:
        stmt = (
            select(Contract)
            .where(
                Contract.organization_id == org_id,
                Contract.contract_number == contract_number,
            )
            .options(
                selectinload(Contract.employee),
                selectinload(Contract.salary_structure),
            )
        )
        return (await db.execute(stmt)).scalar_one_or_none()

    @staticmethod
    async def list_contracts(
        db: AsyncSession,
        org_id: uuid.UUID,
        employee_id: Optional[uuid.UUID] = None,
        status: Optional[ContractStatus] = None,
        page: int = 1,
        page_size: int = 20,
    ) -> Tuple[Sequence[Contract], int]:
        stmt = (
            select(Contract)
            .where(Contract.organization_id == org_id)
            .options(
                selectinload(Contract.employee),
                selectinload(Contract.salary_structure),
            )
        )
        count_stmt = select(func.count(Contract.id)).where(Contract.organization_id == org_id)

        if employee_id:
            stmt = stmt.where(Contract.employee_id == employee_id)
            count_stmt = count_stmt.where(Contract.employee_id == employee_id)

        if status:
            stmt = stmt.where(Contract.status == status)
            count_stmt = count_stmt.where(Contract.status == status)

        total = (await db.execute(count_stmt)).scalar() or 0
        stmt = stmt.order_by(Contract.start_date.desc()).offset((page - 1) * page_size).limit(page_size)
        items = (await db.execute(stmt)).scalars().all()
        return items, total

    @staticmethod
    async def create(db: AsyncSession, contract: Contract) -> Contract:
        db.add(contract)
        await db.commit()
        await db.refresh(contract)
        return await ContractRepository.get_by_id(db, contract.organization_id, contract.id)  # reload joined

    @staticmethod
    async def update(db: AsyncSession, contract: Contract, data: Dict[str, Any]) -> Contract:
        for key, value in data.items():
            setattr(contract, key, value)
        await db.commit()
        await db.refresh(contract)
        return await ContractRepository.get_by_id(db, contract.organization_id, contract.id)

    @staticmethod
    async def check_active_contract_overlap(
        db: AsyncSession,
        org_id: uuid.UUID,
        employee_id: uuid.UUID,
        start_date: date,
        end_date: Optional[date] = None,
        exclude_contract_id: Optional[uuid.UUID] = None,
    ) -> Optional[Contract]:
        """Find any existing ACTIVE contract for this employee that overlaps the given [start_date, end_date]."""
        stmt = select(Contract).where(
            Contract.organization_id == org_id,
            Contract.employee_id == employee_id,
            Contract.status == ContractStatus.ACTIVE,
        )
        if exclude_contract_id:
            stmt = stmt.where(Contract.id != exclude_contract_id)

        # Overlap condition:
        # existing.start_date <= (new.end_date or date.max)
        # AND (existing.end_date IS NULL OR existing.end_date >= new.start_date)
        if end_date is not None:
            stmt = stmt.where(Contract.start_date <= end_date)

        stmt = stmt.where(
            or_(
                Contract.end_date.is_(None),
                Contract.end_date >= start_date,
            )
        )
        return (await db.execute(stmt)).scalars().first()

    @staticmethod
    async def get_active_contract_for_period(
        db: AsyncSession,
        org_id: uuid.UUID,
        employee_id: uuid.UUID,
        period_start: date,
        period_end: date,
    ) -> Optional[Contract]:
        """Returns the contract where status=ACTIVE, start_date <= period_end, and (end_date IS NULL OR end_date >= period_start)."""
        stmt = (
            select(Contract)
            .where(
                Contract.organization_id == org_id,
                Contract.employee_id == employee_id,
                Contract.status == ContractStatus.ACTIVE,
                Contract.start_date <= period_end,
                or_(
                    Contract.end_date.is_(None),
                    Contract.end_date >= period_start,
                ),
            )
            .options(
                selectinload(Contract.employee),
                selectinload(Contract.salary_structure),
            )
        )
        return (await db.execute(stmt)).scalars().first()
