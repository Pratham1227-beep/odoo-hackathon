from datetime import date
from typing import List, Optional
import uuid
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.permissions import require_role
from app.features.attendance.schemas import (
    AttendanceCorrectionCreate,
    AttendanceCorrectionResponse,
    AttendanceCorrectionReview,
    AttendanceResponse,
    AttendanceSummaryResponse,
    AttendanceUpdate,
    HolidayCreate,
    HolidayResponse,
    HolidayUpdate,
)
from app.features.attendance.service import AttendanceService
from app.features.auth.dependencies import get_current_user
from app.features.auth.models import User
from app.shared.enums import AttendanceStatus, CorrectionStatus, UserRole
from app.shared.pagination import PaginatedResponse

attendance_router = APIRouter(prefix="/attendance", tags=["Attendance"])
holidays_router = APIRouter(prefix="/holidays", tags=["Holidays"])

HR_ROLES = [
    UserRole.HR_MANAGER,
    UserRole.HR_PAYROLL_USER,
    UserRole.HR_PAYROLL_MANAGER,
    UserRole.ADMIN,
]


# ==========================================
# Attendance Endpoints
# ==========================================

@attendance_router.get(
    "/today",
    response_model=Optional[AttendanceResponse],
    summary="Get current user's attendance record for today",
)
async def get_today_attendance(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await AttendanceService.get_today_attendance(db, current_user)


@attendance_router.post(
    "/clock-in",
    response_model=AttendanceResponse,
    summary="Self clock-in for current employee",
)
async def clock_in(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await AttendanceService.clock_in(db, current_user)


@attendance_router.post(
    "/clock-out",
    response_model=AttendanceResponse,
    summary="Self clock-out for current employee",
)
async def clock_out(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await AttendanceService.clock_out(db, current_user)


@attendance_router.get(
    "/summary",
    response_model=AttendanceSummaryResponse,
    summary="Get attendance metrics summary for an employee in a date range",
)
async def get_attendance_summary(
    employee_id: Optional[uuid.UUID] = Query(None, description="Employee ID (HR only, forced to self for EMPLOYEE)"),
    from_date: Optional[date] = Query(None, alias="from", description="Start date"),
    to_date: Optional[date] = Query(None, alias="to", description="End date"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await AttendanceService.get_summary(
        db,
        current_user,
        employee_id=employee_id,
        from_date=from_date,
        to_date=to_date,
    )


@attendance_router.get(
    "/corrections",
    response_model=PaginatedResponse[AttendanceCorrectionResponse],
    summary="List attendance correction requests (HR access)",
)
async def list_corrections(
    status: Optional[CorrectionStatus] = Query(None, description="Filter by status"),
    employee_id: Optional[uuid.UUID] = Query(None, description="Filter by employee ID"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: User = Depends(require_role(*HR_ROLES)),
    db: AsyncSession = Depends(get_db),
):
    return await AttendanceService.list_corrections(
        db,
        current_user.organization_id,
        status=status,
        employee_id=employee_id,
        page=page,
        page_size=page_size,
    )


@attendance_router.patch(
    "/corrections/{correction_id}",
    response_model=AttendanceCorrectionResponse,
    summary="Review (Approve/Reject) an attendance correction request (HR access)",
)
async def review_correction(
    correction_id: uuid.UUID,
    payload: AttendanceCorrectionReview,
    current_user: User = Depends(require_role(*HR_ROLES)),
    db: AsyncSession = Depends(get_db),
):
    return await AttendanceService.review_correction_request(
        db, current_user.organization_id, correction_id, payload, current_user
    )


@attendance_router.post(
    "/{attendance_id}/corrections",
    response_model=AttendanceCorrectionResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Request an attendance correction (Employee self-service for own record)",
)
async def request_correction(
    attendance_id: uuid.UUID,
    payload: AttendanceCorrectionCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await AttendanceService.create_correction_request(
        db, current_user.organization_id, attendance_id, payload, current_user
    )


@attendance_router.patch(
    "/{attendance_id}",
    response_model=AttendanceResponse,
    summary="Direct authorized manual override of an attendance record",
)
async def direct_correction(
    attendance_id: uuid.UUID,
    payload: AttendanceUpdate,
    current_user: User = Depends(require_role(*HR_ROLES)),
    db: AsyncSession = Depends(get_db),
):
    return await AttendanceService.direct_correction(
        db, current_user.organization_id, attendance_id, payload, current_user
    )


@attendance_router.get(
    "",
    response_model=PaginatedResponse[AttendanceResponse],
    summary="List attendance records with filtering (EMPLOYEE role forced to self)",
)
async def list_attendances(
    employee_id: Optional[uuid.UUID] = Query(None, description="Filter by employee ID"),
    from_date: Optional[date] = Query(None, alias="from", description="Start date"),
    to_date: Optional[date] = Query(None, alias="to", description="End date"),
    status: Optional[AttendanceStatus] = Query(None, description="Filter by attendance status"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await AttendanceService.list_attendances(
        db,
        current_user,
        employee_id=employee_id,
        from_date=from_date,
        to_date=to_date,
        status=status,
        page=page,
        page_size=page_size,
    )


# ==========================================
# Holiday Endpoints
# ==========================================

@holidays_router.get(
    "",
    response_model=List[HolidayResponse],
    summary="List organization holidays",
)
async def list_holidays(
    year: Optional[int] = Query(None, description="Filter holidays by calendar year"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await AttendanceService.list_holidays(
        db, current_user.organization_id, year=year
    )


@holidays_router.post(
    "",
    response_model=HolidayResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new holiday (HR access)",
)
async def create_holiday(
    payload: HolidayCreate,
    current_user: User = Depends(require_role(*HR_ROLES)),
    db: AsyncSession = Depends(get_db),
):
    return await AttendanceService.create_holiday(
        db, current_user.organization_id, payload
    )


@holidays_router.patch(
    "/{holiday_id}",
    response_model=HolidayResponse,
    summary="Update holiday details (HR access)",
)
async def update_holiday(
    holiday_id: uuid.UUID,
    payload: HolidayUpdate,
    current_user: User = Depends(require_role(*HR_ROLES)),
    db: AsyncSession = Depends(get_db),
):
    return await AttendanceService.update_holiday(
        db, current_user.organization_id, holiday_id, payload
    )
