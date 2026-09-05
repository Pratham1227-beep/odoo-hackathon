from typing import Optional
import uuid
from fastapi import APIRouter, Depends, Query, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.permissions import require_role
from app.features.auth.dependencies import get_current_user
from app.features.auth.models import User
from app.features.payroll.schemas import (
    PayrollDashboardResponse,
    PayrunCreate,
    PayrunDetailResponse,
    PayrunResponse,
    PayslipDetailResponse,
    PayslipResponse,
)
from app.features.payroll.service import PayrollService
from app.shared.enums import PayrunStatus, PayslipStatus, UserRole
from app.shared.pagination import PaginatedResponse

router = APIRouter(prefix="/payroll", tags=["Payroll Engine & Payruns"])

PAYROLL_ROLES = [
    UserRole.HR_PAYROLL_USER,
    UserRole.HR_PAYROLL_MANAGER,
    UserRole.ADMIN,
]


# ==========================================
# Payroll Dashboard
# ==========================================

@router.get(
    "/dashboard",
    response_model=PayrollDashboardResponse,
    summary="Payroll summary dashboard (latest payrun status, YTD totals, issues)",
)
async def get_payroll_dashboard(
    current_user: User = Depends(require_role(*PAYROLL_ROLES)),
    db: AsyncSession = Depends(get_db),
):
    return await PayrollService.get_dashboard(db, current_user.organization_id)


# ==========================================
# Payrun Endpoints
# ==========================================

@router.get(
    "/payruns",
    response_model=PaginatedResponse[PayrunResponse],
    summary="List organization payruns with optional status/period filters",
)
async def list_payruns(
    status_filter: Optional[PayrunStatus] = Query(None, alias="status", description="Filter by payrun status"),
    year: Optional[int] = Query(None, description="Filter by calendar year"),
    month: Optional[int] = Query(None, ge=1, le=12, description="Filter by calendar month"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: User = Depends(require_role(*PAYROLL_ROLES)),
    db: AsyncSession = Depends(get_db),
):
    return await PayrollService.list_payruns(
        db,
        current_user.organization_id,
        status=status_filter,
        year=year,
        month=month,
        page=page,
        page_size=page_size,
    )


@router.post(
    "/payruns",
    response_model=PayrunDetailResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new payrun draft for selected employees",
)
async def create_payrun(
    payload: PayrunCreate,
    current_user: User = Depends(require_role(*PAYROLL_ROLES)),
    db: AsyncSession = Depends(get_db),
):
    return await PayrollService.create_payrun(db, current_user, payload)


@router.get(
    "/payruns/{payrunId}",
    response_model=PayrunDetailResponse,
    summary="Get payrun details, employee summary entries, and validation issues",
)
async def get_payrun_detail(
    payrunId: uuid.UUID,
    current_user: User = Depends(require_role(*PAYROLL_ROLES)),
    db: AsyncSession = Depends(get_db),
):
    return await PayrollService.get_payrun(db, current_user.organization_id, payrunId)


@router.post(
    "/payruns/{payrunId}/process",
    response_model=PayrunDetailResponse,
    summary="Execute the payroll calculation engine and generate payslips",
)
async def process_payrun(
    payrunId: uuid.UUID,
    current_user: User = Depends(require_role(*PAYROLL_ROLES)),
    db: AsyncSession = Depends(get_db),
):
    return await PayrollService.process_payrun(db, current_user, payrunId)


@router.post(
    "/payruns/{payrunId}/finalize",
    response_model=PayrunDetailResponse,
    summary="Finalize and lock payrun (marks payslips as PAID)",
)
async def finalize_payrun(
    payrunId: uuid.UUID,
    current_user: User = Depends(require_role(*PAYROLL_ROLES)),
    db: AsyncSession = Depends(get_db),
):
    return await PayrollService.finalize_payrun(db, current_user, payrunId)


@router.post(
    "/payruns/{payrunId}/email",
    summary="Bulk email delivery of generated payslip PDFs for a finalized payrun",
)
async def email_payrun(
    payrunId: uuid.UUID,
    current_user: User = Depends(require_role(*PAYROLL_ROLES)),
    db: AsyncSession = Depends(get_db),
):
    return await PayrollService.email_payrun(db, current_user, payrunId)


# ==========================================
# Payslip Endpoints
# ==========================================

@router.get(
    "/payslips",
    response_model=PaginatedResponse[PayslipResponse],
    summary="List payslips (Employee scoped to self; HR can filter by employee/period)",
)
async def list_payslips(
    employee_id: Optional[uuid.UUID] = Query(None, description="Filter by employee UUID (HR only)"),
    month: Optional[int] = Query(None, ge=1, le=12, description="Filter by calendar month"),
    year: Optional[int] = Query(None, description="Filter by calendar year"),
    status_filter: Optional[PayslipStatus] = Query(None, alias="status", description="Filter by status"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await PayrollService.list_payslips(
        db,
        current_user,
        employee_id=employee_id,
        month=month,
        year=year,
        status=status_filter,
        page=page,
        page_size=page_size,
    )


@router.get(
    "/payslips/{payslipId}",
    summary="Get payslip detail or stream generated PDF (?format=pdf)",
)
async def get_payslip(
    payslipId: uuid.UUID,
    format: Optional[str] = Query(None, description="Set to 'pdf' to stream PDF binary"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if format and format.lower() == "pdf":
        filename, pdf_bytes = await PayrollService.get_payslip_pdf(db, current_user, payslipId)
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={"Content-Disposition": f'attachment; filename="{filename}"'},
        )

    return await PayrollService.get_payslip(db, current_user, payslipId)
