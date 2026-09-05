from typing import List, Optional
import uuid
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.permissions import require_role
from app.features.auth.dependencies import get_current_user
from app.features.auth.models import User
from app.features.employees.schemas import (
    BulkEmployeeImportRequest,
    BulkImportResponse,
    EmployeeBankDetailCreate,
    EmployeeBankDetailResponse,
    EmployeeCreate,
    EmployeeDetailResponse,
    EmployeeDocumentCreate,
    EmployeeDocumentResponse,
    EmployeeResponse,
    EmployeeStatsResponse,
    EmployeeUpdate,
    OrgChartNodeResponse,
)
from app.features.employees.service import EmployeeService
from app.shared.enums import EmployeeStatus, EmploymentType, UserRole
from app.shared.pagination import PageParams, PaginatedResponse

router = APIRouter(prefix="/employees", tags=["Employees & Org Chart"])


# ==========================================
# Self Employee Profile & Summary Stats
# ==========================================

@router.get(
    "/me",
    response_model=EmployeeDetailResponse,
    summary="Get current logged-in employee profile",
)
async def get_my_employee_profile(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await EmployeeService.get_employee_by_user_id(
        db, current_user.organization_id, current_user.id
    )


@router.get(
    "/org-chart",
    response_model=List[OrgChartNodeResponse],
    summary="Get interactive company organization chart",
)
async def get_company_org_chart(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await EmployeeService.get_org_chart(db, current_user.organization_id)


@router.get(
    "/stats/summary",
    response_model=EmployeeStatsResponse,
    summary="Get employee headcount metrics, departmental distribution, and new joiners",
)
async def get_employee_stats_summary(
    current_user: User = Depends(require_role(UserRole.ADMIN, UserRole.HR_MANAGER, UserRole.HR_PAYROLL_MANAGER)),
    db: AsyncSession = Depends(get_db),
):
    return await EmployeeService.get_employee_stats(db, current_user.organization_id)


@router.post(
    "/bulk-import",
    response_model=BulkImportResponse,
    summary="Bulk import employee records with validation",
)
async def bulk_import_employees(
    payload: BulkEmployeeImportRequest,
    current_user: User = Depends(require_role(UserRole.ADMIN, UserRole.HR_MANAGER)),
    db: AsyncSession = Depends(get_db),
):
    return await EmployeeService.bulk_import_employees(db, current_user.organization_id, payload)


# ==========================================
# Employee Directory & CRUD
# ==========================================

@router.get(
    "",
    response_model=PaginatedResponse[EmployeeResponse],
    summary="List employees directory with filtering and pagination",
)
async def list_employees(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    search: Optional[str] = Query(None, description="Search by name, email, employee code, or phone"),
    department_id: Optional[uuid.UUID] = Query(None, description="Filter by department ID"),
    designation_id: Optional[uuid.UUID] = Query(None, description="Filter by designation ID"),
    work_location_id: Optional[uuid.UUID] = Query(None, description="Filter by location ID"),
    status_filter: Optional[EmployeeStatus] = Query(None, alias="status", description="Filter by employee status"),
    employment_type: Optional[EmploymentType] = Query(None, description="Filter by employment type"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    params = PageParams(page=page, page_size=page_size)
    return await EmployeeService.list_employees(
        db=db,
        org_id=current_user.organization_id,
        params=params,
        search=search,
        department_id=department_id,
        designation_id=designation_id,
        work_location_id=work_location_id,
        status=status_filter,
        employment_type=employment_type,
    )


@router.post(
    "",
    response_model=EmployeeDetailResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new employee record",
)
async def create_employee(
    payload: EmployeeCreate,
    current_user: User = Depends(require_role(UserRole.ADMIN, UserRole.HR_MANAGER)),
    db: AsyncSession = Depends(get_db),
):
    return await EmployeeService.create_employee(db, current_user.organization_id, payload)


@router.get(
    "/{employee_id}",
    response_model=EmployeeDetailResponse,
    summary="Get full employee profile details by ID",
)
async def get_employee(
    employee_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await EmployeeService.get_employee_by_id(db, current_user.organization_id, employee_id)


@router.put(
    "/{employee_id}",
    response_model=EmployeeDetailResponse,
    summary="Update employee details",
)
async def update_employee(
    employee_id: uuid.UUID,
    payload: EmployeeUpdate,
    current_user: User = Depends(require_role(UserRole.ADMIN, UserRole.HR_MANAGER)),
    db: AsyncSession = Depends(get_db),
):
    return await EmployeeService.update_employee(
        db, current_user.organization_id, employee_id, payload, current_user=current_user
    )



@router.delete(
    "/{employee_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete or terminate employee",
)
async def delete_employee(
    employee_id: uuid.UUID,
    hard_delete: bool = Query(False, description="Whether to permanently purge instead of setting to TERMINATED"),
    current_user: User = Depends(require_role(UserRole.ADMIN, UserRole.HR_MANAGER)),
    db: AsyncSession = Depends(get_db),
):
    await EmployeeService.delete_employee(
        db, current_user.organization_id, employee_id, hard_delete=hard_delete
    )


# ==========================================
# Bank Account Details Management
# ==========================================

@router.post(
    "/{employee_id}/bank-account",
    response_model=EmployeeBankDetailResponse,
    summary="Add or update employee bank account details",
)
async def upsert_bank_account(
    employee_id: uuid.UUID,
    payload: EmployeeBankDetailCreate,
    current_user: User = Depends(require_role(UserRole.ADMIN, UserRole.HR_MANAGER, UserRole.HR_PAYROLL_MANAGER)),
    db: AsyncSession = Depends(get_db),
):
    return await EmployeeService.upsert_bank_details(
        db, current_user.organization_id, employee_id, payload
    )


# ==========================================
# Employee Documents
# ==========================================

@router.get(
    "/{employee_id}/documents",
    response_model=List[EmployeeDocumentResponse],
    summary="List all documents attached to an employee",
)
async def list_employee_documents(
    employee_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await EmployeeService.list_employee_documents(
        db, current_user.organization_id, employee_id
    )


@router.post(
    "/{employee_id}/documents",
    response_model=EmployeeDocumentResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Attach document record to an employee",
)
async def add_employee_document(
    employee_id: uuid.UUID,
    payload: EmployeeDocumentCreate,
    current_user: User = Depends(require_role(UserRole.ADMIN, UserRole.HR_MANAGER)),
    db: AsyncSession = Depends(get_db),
):
    return await EmployeeService.add_employee_document(
        db, current_user.organization_id, employee_id, payload
    )


@router.delete(
    "/{employee_id}/documents/{document_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete employee document",
)
async def delete_employee_document(
    employee_id: uuid.UUID,
    document_id: uuid.UUID,
    current_user: User = Depends(require_role(UserRole.ADMIN, UserRole.HR_MANAGER)),
    db: AsyncSession = Depends(get_db),
):
    await EmployeeService.delete_employee_document(
        db, current_user.organization_id, employee_id, document_id
    )
