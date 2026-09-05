from typing import Optional
import uuid
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.permissions import require_role
from app.features.auth.models import User
from app.features.contracts.schemas import (
    ContractCreate,
    ContractResponse,
    ContractUpdate,
)
from app.features.contracts.service import ContractService
from app.shared.enums import ContractStatus, UserRole
from app.shared.pagination import PaginatedResponse

router = APIRouter(prefix="/contracts", tags=["Contracts"])

CONTRACT_ROLES = [
    UserRole.HR_MANAGER,
    UserRole.HR_PAYROLL_USER,
    UserRole.HR_PAYROLL_MANAGER,
    UserRole.ADMIN,
]


@router.get(
    "",
    response_model=PaginatedResponse[ContractResponse],
    summary="List employee contracts with optional filtering and pagination",
)
async def list_contracts(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    employee_id: Optional[uuid.UUID] = Query(None, description="Filter by employee UUID"),
    status: Optional[ContractStatus] = Query(None, description="Filter by contract status"),
    current_user: User = Depends(require_role(*CONTRACT_ROLES)),
    db: AsyncSession = Depends(get_db),
):
    return await ContractService.list_contracts(
        db,
        current_user.organization_id,
        employee_id=employee_id,
        status=status,
        page=page,
        page_size=page_size,
    )


@router.post(
    "",
    response_model=ContractResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new employee contract",
)
async def create_contract(
    payload: ContractCreate,
    current_user: User = Depends(require_role(*CONTRACT_ROLES)),
    db: AsyncSession = Depends(get_db),
):
    return await ContractService.create_contract(
        db, current_user.organization_id, payload
    )


@router.get(
    "/{contract_id}",
    response_model=ContractResponse,
    summary="Get employee contract detail",
)
async def get_contract(
    contract_id: uuid.UUID,
    current_user: User = Depends(require_role(*CONTRACT_ROLES)),
    db: AsyncSession = Depends(get_db),
):
    return await ContractService.get_contract_by_id(
        db, current_user.organization_id, contract_id
    )


@router.patch(
    "/{contract_id}",
    response_model=ContractResponse,
    summary="Update contract details or status transition (enforces active overlap prevention)",
)
async def update_contract(
    contract_id: uuid.UUID,
    payload: ContractUpdate,
    current_user: User = Depends(require_role(*CONTRACT_ROLES)),
    db: AsyncSession = Depends(get_db),
):
    return await ContractService.update_contract(
        db, current_user.organization_id, contract_id, payload, current_user=current_user
    )

