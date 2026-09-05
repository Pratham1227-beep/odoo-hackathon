from typing import List, Optional
import uuid
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.permissions import require_role
from app.features.auth.models import User
from app.features.payroll_config.schemas import (
    CompanyPayrollConfigResponse,
    CompanyPayrollConfigUpdate,
    EmployeeSalaryComponentBulkUpdate,
    EmployeeSalaryComponentResponse,
    SalaryRuleCreate,
    SalaryRuleResponse,
    SalaryRuleUpdate,
    SalaryStructureCreate,
    SalaryStructureDetailResponse,
    SalaryStructureResponse,
    SalaryStructureRulesUpdate,
    SalaryStructureUpdate,
)
from app.features.payroll_config.service import (
    EmployeeSalaryComponentService,
    PayrollConfigService,
    SalaryRuleService,
    SalaryStructureService,
)
from app.shared.enums import UserRole

router = APIRouter(tags=["Payroll Configuration, Salary Structures & Rules"])

# Allowed roles for Read & Write
PAYROLL_READ_ROLES = [UserRole.HR_PAYROLL_USER, UserRole.HR_PAYROLL_MANAGER, UserRole.ADMIN]
PAYROLL_WRITE_ROLES = [UserRole.HR_PAYROLL_MANAGER, UserRole.ADMIN]


# ==========================================
# Salary Structures Routes
# ==========================================

@router.get(
    "/salary-structures",
    response_model=List[SalaryStructureResponse],
    summary="List all salary structures for the organization",
)
async def list_salary_structures(
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
    current_user: User = Depends(require_role(*PAYROLL_READ_ROLES)),
    db: AsyncSession = Depends(get_db),
):
    return await SalaryStructureService.list_structures(
        db, current_user.organization_id, is_active=is_active
    )


@router.post(
    "/salary-structures",
    response_model=SalaryStructureResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new salary structure",
)
async def create_salary_structure(
    payload: SalaryStructureCreate,
    current_user: User = Depends(require_role(*PAYROLL_WRITE_ROLES)),
    db: AsyncSession = Depends(get_db),
):
    return await SalaryStructureService.create_structure(
        db, current_user.organization_id, payload
    )


@router.get(
    "/salary-structures/{structure_id}",
    response_model=SalaryStructureDetailResponse,
    summary="Get salary structure detail including its ordered rule sequence",
)
async def get_salary_structure_detail(
    structure_id: uuid.UUID,
    current_user: User = Depends(require_role(*PAYROLL_READ_ROLES)),
    db: AsyncSession = Depends(get_db),
):
    return await SalaryStructureService.get_structure_detail(
        db, current_user.organization_id, structure_id
    )


@router.patch(
    "/salary-structures/{structure_id}",
    response_model=SalaryStructureResponse,
    summary="Update salary structure metadata",
)
async def update_salary_structure(
    structure_id: uuid.UUID,
    payload: SalaryStructureUpdate,
    current_user: User = Depends(require_role(*PAYROLL_WRITE_ROLES)),
    db: AsyncSession = Depends(get_db),
):
    return await SalaryStructureService.update_structure(
        db, current_user.organization_id, structure_id, payload
    )


@router.patch(
    "/salary-structures/{structure_id}/rules",
    response_model=SalaryStructureDetailResponse,
    summary="Replace the full ordered set of salary rules for a structure",
)
async def replace_salary_structure_rules(
    structure_id: uuid.UUID,
    payload: SalaryStructureRulesUpdate,
    current_user: User = Depends(require_role(*PAYROLL_WRITE_ROLES)),
    db: AsyncSession = Depends(get_db),
):
    return await SalaryStructureService.replace_structure_rules(
        db, current_user.organization_id, structure_id, payload
    )


# ==========================================
# Salary Rules Routes
# ==========================================

@router.get(
    "/salary-rules",
    response_model=List[SalaryRuleResponse],
    summary="List all salary rules for the organization",
)
async def list_salary_rules(
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
    current_user: User = Depends(require_role(*PAYROLL_READ_ROLES)),
    db: AsyncSession = Depends(get_db),
):
    return await SalaryRuleService.list_rules(
        db, current_user.organization_id, is_active=is_active
    )


@router.post(
    "/salary-rules",
    response_model=SalaryRuleResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new salary rule with calculation pairing validation",
)
async def create_salary_rule(
    payload: SalaryRuleCreate,
    current_user: User = Depends(require_role(*PAYROLL_WRITE_ROLES)),
    db: AsyncSession = Depends(get_db),
):
    return await SalaryRuleService.create_rule(
        db, current_user.organization_id, payload, current_user=current_user
    )


@router.get(
    "/salary-rules/{rule_id}",
    response_model=SalaryRuleResponse,
    summary="Get salary rule detail",
)
async def get_salary_rule(
    rule_id: uuid.UUID,
    current_user: User = Depends(require_role(*PAYROLL_READ_ROLES)),
    db: AsyncSession = Depends(get_db),
):
    return await SalaryRuleService.get_rule_by_id(
        db, current_user.organization_id, rule_id
    )


@router.patch(
    "/salary-rules/{rule_id}",
    response_model=SalaryRuleResponse,
    summary="Update salary rule configuration and re-validate calculation pairing",
)
async def update_salary_rule(
    rule_id: uuid.UUID,
    payload: SalaryRuleUpdate,
    current_user: User = Depends(require_role(*PAYROLL_WRITE_ROLES)),
    db: AsyncSession = Depends(get_db),
):
    return await SalaryRuleService.update_rule(
        db, current_user.organization_id, rule_id, payload, current_user=current_user
    )



# ==========================================
# Company-Wide & Employee Payroll Configuration
# ==========================================

@router.get(
    "/payroll-config",
    response_model=CompanyPayrollConfigResponse,
    summary="Get aggregated company payroll settings (PF, ESI, TDS, PT)",
)
async def get_company_payroll_config(
    current_user: User = Depends(require_role(*PAYROLL_READ_ROLES)),
    db: AsyncSession = Depends(get_db),
):
    return await PayrollConfigService.get_company_payroll_config(
        db, current_user.organization_id
    )


@router.patch(
    "/payroll-config",
    response_model=CompanyPayrollConfigResponse,
    summary="Update company payroll configuration settings",
)
async def update_company_payroll_config(
    payload: CompanyPayrollConfigUpdate,
    current_user: User = Depends(require_role(*PAYROLL_WRITE_ROLES)),
    db: AsyncSession = Depends(get_db),
):
    return await PayrollConfigService.update_company_payroll_config(
        db, current_user.organization_id, payload, updated_by_id=current_user.id
    )


@router.get(
    "/payroll-config/salary/{userId}",
    response_model=List[EmployeeSalaryComponentResponse],
    summary="Get employee salary component overrides joined with rule metadata",
)
async def get_employee_salary_components(
    userId: uuid.UUID,
    current_user: User = Depends(require_role(*PAYROLL_READ_ROLES)),
    db: AsyncSession = Depends(get_db),
):
    return await EmployeeSalaryComponentService.get_employee_salary_components(
        db, current_user.organization_id, userId
    )


@router.patch(
    "/payroll-config/salary/{userId}",
    response_model=List[EmployeeSalaryComponentResponse],
    summary="Upsert employee salary components for the specified employee/user",
)
async def update_employee_salary_components(
    userId: uuid.UUID,
    payload: EmployeeSalaryComponentBulkUpdate,
    current_user: User = Depends(require_role(*PAYROLL_WRITE_ROLES)),
    db: AsyncSession = Depends(get_db),
):
    return await EmployeeSalaryComponentService.update_employee_salary_components(
        db, current_user.organization_id, userId, payload
    )
