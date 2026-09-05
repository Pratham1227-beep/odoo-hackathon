from typing import List, Optional
import uuid
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.permissions import require_role
from app.features.auth.dependencies import get_current_user
from app.features.auth.models import User
from app.features.time_off.schemas import (
    LeaveAllocationCreate,
    LeaveAllocationResponse,
    LeaveRequestCreate,
    LeaveRequestResponse,
    LeaveRequestReview,
    LeaveTypeCreate,
    LeaveTypeResponse,
)
from app.features.time_off.service import TimeOffService
from app.shared.enums import LeaveRequestStatus, UserRole

router = APIRouter(prefix="/time-off", tags=["Time Off"])

HR_ROLES = [
    UserRole.HR_MANAGER,
    UserRole.HR_PAYROLL_USER,
    UserRole.HR_PAYROLL_MANAGER,
    UserRole.ADMIN,
]


# ==========================================
# Leave Types Endpoints
# ==========================================

@router.get(
    "/types",
    response_model=List[LeaveTypeResponse],
    summary="List active leave types in organization",
)
async def list_leave_types(
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await TimeOffService.list_leave_types(
        db, current_user.organization_id, is_active=is_active
    )


@router.post(
    "/types",
    response_model=LeaveTypeResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new leave type (HR access)",
)
async def create_leave_type(
    payload: LeaveTypeCreate,
    current_user: User = Depends(require_role(*HR_ROLES)),
    db: AsyncSession = Depends(get_db),
):
    return await TimeOffService.create_leave_type(
        db, current_user.organization_id, payload
    )


# ==========================================
# Leave Allocations Endpoints
# ==========================================

@router.get(
    "/allocations",
    response_model=List[LeaveAllocationResponse],
    summary="List leave allocations (scoped to employee or filtered by HR)",
)
async def list_allocations(
    employee_id: Optional[uuid.UUID] = Query(None, description="Filter by employee UUID (HR only)"),
    year: Optional[int] = Query(None, description="Filter by calendar year"),
    leave_type_id: Optional[uuid.UUID] = Query(None, description="Filter by leave type UUID"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await TimeOffService.list_allocations(
        db,
        current_user,
        employee_id=employee_id,
        year=year,
        leave_type_id=leave_type_id,
    )


@router.post(
    "/allocations",
    response_model=LeaveAllocationResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Grant annual leave allocation to an employee (HR access)",
)
async def create_allocation(
    payload: LeaveAllocationCreate,
    current_user: User = Depends(require_role(*HR_ROLES)),
    db: AsyncSession = Depends(get_db),
):
    return await TimeOffService.create_allocation(db, current_user, payload)


# ==========================================
# Leave Requests Endpoints
# ==========================================

@router.get(
    "/requests",
    response_model=List[LeaveRequestResponse],
    summary="List leave requests (scoped to employee or filtered by HR)",
)
async def list_requests(
    employee_id: Optional[uuid.UUID] = Query(None, description="Filter by employee UUID (HR only)"),
    status_filter: Optional[LeaveRequestStatus] = Query(None, alias="status", description="Filter by request status"),
    leave_type_id: Optional[uuid.UUID] = Query(None, description="Filter by leave type UUID"),
    year: Optional[int] = Query(None, description="Filter by year"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await TimeOffService.list_requests(
        db,
        current_user,
        employee_id=employee_id,
        status=status_filter,
        leave_type_id=leave_type_id,
        year=year,
    )


@router.post(
    "/requests",
    response_model=LeaveRequestResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Submit a new leave request (Employee self-filing or HR on-behalf)",
)
async def create_request(
    payload: LeaveRequestCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await TimeOffService.create_request(db, current_user, payload)


@router.patch(
    "/requests/{requestId}",
    response_model=LeaveRequestResponse,
    summary="Approve or reject a pending leave request (HR access)",
)
async def review_request(
    requestId: uuid.UUID,
    payload: LeaveRequestReview,
    current_user: User = Depends(require_role(*HR_ROLES)),
    db: AsyncSession = Depends(get_db),
):
    return await TimeOffService.review_request(db, current_user, requestId, payload)
