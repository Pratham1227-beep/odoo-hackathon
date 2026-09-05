from typing import List, Optional
import uuid
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.permissions import require_role
from app.features.auth.dependencies import get_current_user
from app.features.auth.models import User
from app.features.auth.schemas import OrganizationResponse
from app.features.organization.schemas import (
    DepartmentCreate,
    DepartmentResponse,
    DepartmentTreeNode,
    DepartmentUpdate,
    DesignationCreate,
    DesignationResponse,
    DesignationUpdate,
    OrganizationUpdateRequest,
    WorkLocationCreate,
    WorkLocationResponse,
    WorkLocationUpdate,
)
from app.features.organization.service import OrganizationService
from app.shared.enums import UserRole

router = APIRouter(tags=["Organization & Master Data"])


# ==========================================
# Organization Settings & Profile
# ==========================================

@router.get(
    "/organization/current",
    response_model=OrganizationResponse,
    summary="Get current tenant organization profile",
)
async def get_current_organization(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await OrganizationService.get_current_organization(db, current_user.organization_id)


@router.put(
    "/organization/current",
    response_model=OrganizationResponse,
    summary="Update current tenant organization settings",
)
async def update_current_organization(
    payload: OrganizationUpdateRequest,
    current_user: User = Depends(require_role(UserRole.ADMIN, UserRole.HR_MANAGER)),
    db: AsyncSession = Depends(get_db),
):
    return await OrganizationService.update_current_organization(db, current_user.organization_id, payload)


# ==========================================
# Work Locations
# ==========================================

@router.get(
    "/work-locations",
    response_model=List[WorkLocationResponse],
    summary="List all work locations / offices",
)
async def list_work_locations(
    search: Optional[str] = Query(None, description="Search by name, code, or city"),
    is_active: Optional[bool] = Query(None, description="Filter active/inactive"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await OrganizationService.list_work_locations(
        db, current_user.organization_id, search=search, is_active=is_active
    )


@router.post(
    "/work-locations",
    response_model=WorkLocationResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new work location",
)
async def create_work_location(
    payload: WorkLocationCreate,
    current_user: User = Depends(require_role(UserRole.ADMIN, UserRole.HR_MANAGER)),
    db: AsyncSession = Depends(get_db),
):
    return await OrganizationService.create_work_location(db, current_user.organization_id, payload)


@router.get(
    "/work-locations/{location_id}",
    response_model=WorkLocationResponse,
    summary="Get work location by ID",
)
async def get_work_location(
    location_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await OrganizationService.get_work_location(db, current_user.organization_id, location_id)


@router.put(
    "/work-locations/{location_id}",
    response_model=WorkLocationResponse,
    summary="Update work location",
)
async def update_work_location(
    location_id: uuid.UUID,
    payload: WorkLocationUpdate,
    current_user: User = Depends(require_role(UserRole.ADMIN, UserRole.HR_MANAGER)),
    db: AsyncSession = Depends(get_db),
):
    return await OrganizationService.update_work_location(
        db, current_user.organization_id, location_id, payload
    )


@router.delete(
    "/work-locations/{location_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete work location",
)
async def delete_work_location(
    location_id: uuid.UUID,
    current_user: User = Depends(require_role(UserRole.ADMIN, UserRole.HR_MANAGER)),
    db: AsyncSession = Depends(get_db),
):
    await OrganizationService.delete_work_location(db, current_user.organization_id, location_id)


# ==========================================
# Departments & Org Tree
# ==========================================

@router.get(
    "/departments/tree",
    response_model=List[DepartmentTreeNode],
    summary="Get hierarchical department organization tree",
)
async def get_department_tree(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await OrganizationService.get_department_tree(db, current_user.organization_id)


@router.get(
    "/departments",
    response_model=List[DepartmentResponse],
    summary="List all departments",
)
async def list_departments(
    search: Optional[str] = Query(None, description="Search by name or code"),
    is_active: Optional[bool] = Query(None, description="Filter active/inactive"),
    parent_department_id: Optional[uuid.UUID] = Query(None, description="Filter by parent department"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await OrganizationService.list_departments(
        db,
        current_user.organization_id,
        search=search,
        is_active=is_active,
        parent_id=parent_department_id,
    )


@router.post(
    "/departments",
    response_model=DepartmentResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new department",
)
async def create_department(
    payload: DepartmentCreate,
    current_user: User = Depends(require_role(UserRole.ADMIN, UserRole.HR_MANAGER)),
    db: AsyncSession = Depends(get_db),
):
    created = await OrganizationService.create_department(db, current_user.organization_id, payload)
    return await OrganizationService.get_department(db, current_user.organization_id, created.id)


@router.get(
    "/departments/{department_id}",
    response_model=DepartmentResponse,
    summary="Get department details by ID",
)
async def get_department(
    department_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await OrganizationService.get_department(db, current_user.organization_id, department_id)


@router.put(
    "/departments/{department_id}",
    response_model=DepartmentResponse,
    summary="Update department",
)
async def update_department(
    department_id: uuid.UUID,
    payload: DepartmentUpdate,
    current_user: User = Depends(require_role(UserRole.ADMIN, UserRole.HR_MANAGER)),
    db: AsyncSession = Depends(get_db),
):
    await OrganizationService.update_department(db, current_user.organization_id, department_id, payload)
    return await OrganizationService.get_department(db, current_user.organization_id, department_id)


@router.delete(
    "/departments/{department_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete department",
)
async def delete_department(
    department_id: uuid.UUID,
    current_user: User = Depends(require_role(UserRole.ADMIN, UserRole.HR_MANAGER)),
    db: AsyncSession = Depends(get_db),
):
    await OrganizationService.delete_department(db, current_user.organization_id, department_id)


# ==========================================
# Designations
# ==========================================

@router.get(
    "/designations",
    response_model=List[DesignationResponse],
    summary="List all designations / job roles",
)
async def list_designations(
    search: Optional[str] = Query(None, description="Search by title or code"),
    department_id: Optional[uuid.UUID] = Query(None, description="Filter by department"),
    is_active: Optional[bool] = Query(None, description="Filter active/inactive"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await OrganizationService.list_designations(
        db,
        current_user.organization_id,
        search=search,
        department_id=department_id,
        is_active=is_active,
    )


@router.post(
    "/designations",
    response_model=DesignationResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new designation",
)
async def create_designation(
    payload: DesignationCreate,
    current_user: User = Depends(require_role(UserRole.ADMIN, UserRole.HR_MANAGER)),
    db: AsyncSession = Depends(get_db),
):
    created = await OrganizationService.create_designation(db, current_user.organization_id, payload)
    return await OrganizationService.get_designation(db, current_user.organization_id, created.id)


@router.get(
    "/designations/{designation_id}",
    response_model=DesignationResponse,
    summary="Get designation by ID",
)
async def get_designation(
    designation_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await OrganizationService.get_designation(db, current_user.organization_id, designation_id)


@router.put(
    "/designations/{designation_id}",
    response_model=DesignationResponse,
    summary="Update designation",
)
async def update_designation(
    designation_id: uuid.UUID,
    payload: DesignationUpdate,
    current_user: User = Depends(require_role(UserRole.ADMIN, UserRole.HR_MANAGER)),
    db: AsyncSession = Depends(get_db),
):
    await OrganizationService.update_designation(
        db, current_user.organization_id, designation_id, payload
    )
    return await OrganizationService.get_designation(db, current_user.organization_id, designation_id)


@router.delete(
    "/designations/{designation_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete designation",
)
async def delete_designation(
    designation_id: uuid.UUID,
    current_user: User = Depends(require_role(UserRole.ADMIN, UserRole.HR_MANAGER)),
    db: AsyncSession = Depends(get_db),
):
    await OrganizationService.delete_designation(db, current_user.organization_id, designation_id)
