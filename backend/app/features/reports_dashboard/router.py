from datetime import date
from typing import Optional
import uuid
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.permissions import require_role
from app.features.auth.dependencies import get_current_user
from app.features.auth.models import User
from app.features.reports_dashboard.schemas import (
    AttendanceDashboardResponse,
    EmployeesDashboardResponse,
    MainDashboardResponse,
    PayrollDashboardResponse,
    SalaryStatementResponse,
)
from app.features.reports_dashboard.service import ReportsDashboardService
from app.shared.enums import EmploymentType, UserRole

router = APIRouter(prefix="/reports-dashboard", tags=["Reports & Dashboard"])

# Role groupings
PAYROLL_DASHBOARD_ROLES = [
    UserRole.HR_MANAGER,
    UserRole.HR_PAYROLL_USER,
    UserRole.HR_PAYROLL_MANAGER,
    UserRole.ADMIN,
]

HR_ALL_ROLES = [
    UserRole.HR_MANAGER,
    UserRole.HR_PAYROLL_USER,
    UserRole.HR_PAYROLL_MANAGER,
    UserRole.ADMIN,
]


@router.get(
    "",
    response_model=MainDashboardResponse,
    summary="Get main executive dashboard with real-time KPIs, operational alerts, and department costs",
)
async def get_main_dashboard(
    month: Optional[int] = Query(None, ge=1, le=12, description="Filter by month (1-12)"),
    year: Optional[int] = Query(None, ge=2000, le=2100, description="Filter by 4-digit year"),
    from_date: Optional[date] = Query(None, description="Start date (YYYY-MM-DD)"),
    to_date: Optional[date] = Query(None, description="End date (YYYY-MM-DD)"),
    department_id: Optional[uuid.UUID] = Query(None, description="Filter by department ID"),
    employment_type: Optional[EmploymentType] = Query(None, description="Filter by employment type"),
    current_user: User = Depends(require_role(*PAYROLL_DASHBOARD_ROLES)),
    db: AsyncSession = Depends(get_db),
):
    return await ReportsDashboardService.get_main_dashboard(
        db=db,
        org_id=current_user.organization_id,
        month=month,
        year=year,
        from_date=from_date,
        to_date=to_date,
        department_id=department_id,
        employment_type=employment_type,
    )


@router.get(
    "/payroll",
    response_model=PayrollDashboardResponse,
    summary="Get payroll dashboard with department cost chart data and historical+live monthly trends",
)
async def get_payroll_dashboard(
    month: Optional[int] = Query(None, ge=1, le=12, description="Filter by month (1-12)"),
    year: Optional[int] = Query(None, ge=2000, le=2100, description="Filter by 4-digit year"),
    from_date: Optional[date] = Query(None, description="Start date (YYYY-MM-DD)"),
    to_date: Optional[date] = Query(None, description="End date (YYYY-MM-DD)"),
    department_id: Optional[uuid.UUID] = Query(None, description="Filter by department ID"),
    employment_type: Optional[EmploymentType] = Query(None, description="Filter by employment type"),
    current_user: User = Depends(require_role(*PAYROLL_DASHBOARD_ROLES)),
    db: AsyncSession = Depends(get_db),
):
    return await ReportsDashboardService.get_payroll_dashboard(
        db=db,
        org_id=current_user.organization_id,
        month=month,
        year=year,
        from_date=from_date,
        to_date=to_date,
        department_id=department_id,
        employment_type=employment_type,
    )


@router.get(
    "/attendance",
    response_model=AttendanceDashboardResponse,
    summary="Get attendance health dashboard with live presence, overtime, missing checkouts, and department metrics",
)
async def get_attendance_dashboard(
    month: Optional[int] = Query(None, ge=1, le=12, description="Filter by month (1-12)"),
    year: Optional[int] = Query(None, ge=2000, le=2100, description="Filter by 4-digit year"),
    from_date: Optional[date] = Query(None, description="Start date (YYYY-MM-DD)"),
    to_date: Optional[date] = Query(None, description="End date (YYYY-MM-DD)"),
    department_id: Optional[uuid.UUID] = Query(None, description="Filter by department ID"),
    employment_type: Optional[EmploymentType] = Query(None, description="Filter by employment type"),
    current_user: User = Depends(require_role(*HR_ALL_ROLES)),
    db: AsyncSession = Depends(get_db),
):
    return await ReportsDashboardService.get_attendance_dashboard(
        db=db,
        org_id=current_user.organization_id,
        month=month,
        year=year,
        from_date=from_date,
        to_date=to_date,
        department_id=department_id,
        employment_type=employment_type,
    )


@router.get(
    "/employees",
    response_model=EmployeesDashboardResponse,
    summary="Get workforce demographics dashboard by department, designation, type, and status",
)
async def get_employees_dashboard(
    month: Optional[int] = Query(None, ge=1, le=12, description="Filter by month (1-12)"),
    year: Optional[int] = Query(None, ge=2000, le=2100, description="Filter by 4-digit year"),
    from_date: Optional[date] = Query(None, description="Start date (YYYY-MM-DD)"),
    to_date: Optional[date] = Query(None, description="End date (YYYY-MM-DD)"),
    department_id: Optional[uuid.UUID] = Query(None, description="Filter by department ID"),
    employment_type: Optional[EmploymentType] = Query(None, description="Filter by employment type"),
    current_user: User = Depends(require_role(*HR_ALL_ROLES)),
    db: AsyncSession = Depends(get_db),
):
    return await ReportsDashboardService.get_employees_dashboard(
        db=db,
        org_id=current_user.organization_id,
        month=month,
        year=year,
        from_date=from_date,
        to_date=to_date,
        department_id=department_id,
        employment_type=employment_type,
    )


@router.get(
    "/salary-statement/{userId}",
    response_model=SalaryStatementResponse,
    summary="Get employee payslip history and YTD earnings/deductions summary (Self or Payroll/Admin roles)",
)
async def get_salary_statement(
    userId: uuid.UUID,
    month: Optional[int] = Query(None, ge=1, le=12, description="Filter by month (1-12)"),
    year: Optional[int] = Query(None, ge=2000, le=2100, description="Filter by 4-digit year"),
    from_date: Optional[date] = Query(None, description="Start date (YYYY-MM-DD)"),
    to_date: Optional[date] = Query(None, description="End date (YYYY-MM-DD)"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await ReportsDashboardService.get_salary_statement(
        db=db,
        current_user=current_user,
        target_user_id=userId,
        month=month,
        year=year,
        from_date=from_date,
        to_date=to_date,
    )
