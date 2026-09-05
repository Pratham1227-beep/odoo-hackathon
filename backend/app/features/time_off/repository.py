from datetime import date
from typing import Any, Dict, List, Optional, Sequence
import uuid
from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.features.time_off.models import LeaveAllocation, LeaveRequest, LeaveType
from app.shared.enums import LeaveRequestStatus


class LeaveTypeRepository:

    @staticmethod
    async def get_by_id(
        db: AsyncSession,
        org_id: uuid.UUID,
        type_id: uuid.UUID,
    ) -> Optional[LeaveType]:
        stmt = select(LeaveType).where(
            LeaveType.organization_id == org_id,
            LeaveType.id == type_id,
        )
        return (await db.execute(stmt)).scalar_one_or_none()

    @staticmethod
    async def get_by_code(
        db: AsyncSession,
        org_id: uuid.UUID,
        code: str,
    ) -> Optional[LeaveType]:
        stmt = select(LeaveType).where(
            LeaveType.organization_id == org_id,
            LeaveType.code == code.strip().upper(),
        )
        return (await db.execute(stmt)).scalar_one_or_none()

    @staticmethod
    async def list_types(
        db: AsyncSession,
        org_id: uuid.UUID,
        is_active: Optional[bool] = None,
    ) -> Sequence[LeaveType]:
        stmt = select(LeaveType).where(LeaveType.organization_id == org_id)
        if is_active is not None:
            stmt = stmt.where(LeaveType.is_active == is_active)
        stmt = stmt.order_by(LeaveType.code.asc())
        return (await db.execute(stmt)).scalars().all()

    @staticmethod
    async def create(db: AsyncSession, leave_type: LeaveType) -> LeaveType:
        db.add(leave_type)
        await db.commit()
        await db.refresh(leave_type)
        return leave_type

    @staticmethod
    async def update(db: AsyncSession, leave_type: LeaveType, data: Dict[str, Any]) -> LeaveType:
        for key, value in data.items():
            setattr(leave_type, key, value)
        await db.commit()
        await db.refresh(leave_type)
        return leave_type


class LeaveAllocationRepository:

    @staticmethod
    async def get_by_id(
        db: AsyncSession,
        org_id: uuid.UUID,
        allocation_id: uuid.UUID,
    ) -> Optional[LeaveAllocation]:
        stmt = (
            select(LeaveAllocation)
            .where(
                LeaveAllocation.organization_id == org_id,
                LeaveAllocation.id == allocation_id,
            )
            .options(
                selectinload(LeaveAllocation.employee),
                selectinload(LeaveAllocation.leave_type),
                selectinload(LeaveAllocation.allocated_by),
            )
        )
        return (await db.execute(stmt)).scalar_one_or_none()

    @staticmethod
    async def get_by_employee_type_year(
        db: AsyncSession,
        org_id: uuid.UUID,
        employee_id: uuid.UUID,
        leave_type_id: uuid.UUID,
        year: int,
    ) -> Optional[LeaveAllocation]:
        stmt = (
            select(LeaveAllocation)
            .where(
                LeaveAllocation.organization_id == org_id,
                LeaveAllocation.employee_id == employee_id,
                LeaveAllocation.leave_type_id == leave_type_id,
                LeaveAllocation.year == year,
            )
            .options(
                selectinload(LeaveAllocation.employee),
                selectinload(LeaveAllocation.leave_type),
            )
        )
        return (await db.execute(stmt)).scalar_one_or_none()

    @staticmethod
    async def list_allocations(
        db: AsyncSession,
        org_id: uuid.UUID,
        employee_id: Optional[uuid.UUID] = None,
        year: Optional[int] = None,
        leave_type_id: Optional[uuid.UUID] = None,
    ) -> Sequence[LeaveAllocation]:
        stmt = (
            select(LeaveAllocation)
            .where(LeaveAllocation.organization_id == org_id)
            .options(
                selectinload(LeaveAllocation.employee),
                selectinload(LeaveAllocation.leave_type),
            )
        )
        if employee_id is not None:
            stmt = stmt.where(LeaveAllocation.employee_id == employee_id)
        if year is not None:
            stmt = stmt.where(LeaveAllocation.year == year)
        if leave_type_id is not None:
            stmt = stmt.where(LeaveAllocation.leave_type_id == leave_type_id)
        stmt = stmt.order_by(LeaveAllocation.year.desc(), LeaveAllocation.created_at.desc())
        return (await db.execute(stmt)).scalars().all()

    @staticmethod
    async def create(db: AsyncSession, allocation: LeaveAllocation) -> LeaveAllocation:
        db.add(allocation)
        await db.commit()
        await db.refresh(allocation)
        return await LeaveAllocationRepository.get_by_id(db, allocation.organization_id, allocation.id)

    @staticmethod
    async def save(db: AsyncSession, allocation: LeaveAllocation) -> LeaveAllocation:
        await db.commit()
        await db.refresh(allocation)
        return allocation


class LeaveRequestRepository:

    @staticmethod
    async def get_by_id(
        db: AsyncSession,
        org_id: uuid.UUID,
        request_id: uuid.UUID,
    ) -> Optional[LeaveRequest]:
        stmt = (
            select(LeaveRequest)
            .where(
                LeaveRequest.organization_id == org_id,
                LeaveRequest.id == request_id,
            )
            .options(
                selectinload(LeaveRequest.employee),
                selectinload(LeaveRequest.leave_type),
                selectinload(LeaveRequest.reviewed_by),
            )
        )
        return (await db.execute(stmt)).scalar_one_or_none()

    @staticmethod
    async def list_requests(
        db: AsyncSession,
        org_id: uuid.UUID,
        employee_id: Optional[uuid.UUID] = None,
        status: Optional[LeaveRequestStatus] = None,
        leave_type_id: Optional[uuid.UUID] = None,
        year: Optional[int] = None,
    ) -> Sequence[LeaveRequest]:
        stmt = (
            select(LeaveRequest)
            .where(LeaveRequest.organization_id == org_id)
            .options(
                selectinload(LeaveRequest.employee),
                selectinload(LeaveRequest.leave_type),
                selectinload(LeaveRequest.reviewed_by),
            )
        )
        if employee_id is not None:
            stmt = stmt.where(LeaveRequest.employee_id == employee_id)
        if status is not None:
            stmt = stmt.where(LeaveRequest.status == status)
        if leave_type_id is not None:
            stmt = stmt.where(LeaveRequest.leave_type_id == leave_type_id)
        if year is not None:
            # Check if start_date or end_date falls within the year
            stmt = stmt.where(
                or_(
                    LeaveRequest.start_date >= date(year, 1, 1),
                    LeaveRequest.end_date <= date(year, 12, 31),
                )
            )
        stmt = stmt.order_by(LeaveRequest.start_date.desc(), LeaveRequest.created_at.desc())
        return (await db.execute(stmt)).scalars().all()

    @staticmethod
    async def find_overlapping(
        db: AsyncSession,
        org_id: uuid.UUID,
        employee_id: uuid.UUID,
        start_date: date,
        end_date: date,
        exclude_request_id: Optional[uuid.UUID] = None,
    ) -> Optional[LeaveRequest]:
        """Find any existing PENDING or APPROVED request for this employee overlapping [start_date, end_date]."""
        stmt = select(LeaveRequest).where(
            LeaveRequest.organization_id == org_id,
            LeaveRequest.employee_id == employee_id,
            LeaveRequest.status.in_([LeaveRequestStatus.PENDING, LeaveRequestStatus.APPROVED]),
            LeaveRequest.start_date <= end_date,
            LeaveRequest.end_date >= start_date,
        )
        if exclude_request_id is not None:
            stmt = stmt.where(LeaveRequest.id != exclude_request_id)
        return (await db.execute(stmt)).scalars().first()

    @staticmethod
    async def create(db: AsyncSession, request: LeaveRequest) -> LeaveRequest:
        db.add(request)
        await db.commit()
        await db.refresh(request)
        return await LeaveRequestRepository.get_by_id(db, request.organization_id, request.id)

    @staticmethod
    async def save(db: AsyncSession, request: LeaveRequest) -> LeaveRequest:
        await db.commit()
        await db.refresh(request)
        return await LeaveRequestRepository.get_by_id(db, request.organization_id, request.id)
