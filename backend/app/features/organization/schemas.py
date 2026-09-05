from typing import List, Optional
import uuid
from pydantic import Field

from app.shared.base_schema import BaseSchema, IDSchema, TimestampSchema
from app.shared.enums import OrganizationStatus


class OrganizationUpdateRequest(BaseSchema):
    """Payload to update organization tenant settings."""
    name: Optional[str] = Field(None, min_length=2, max_length=255)
    phone: Optional[str] = Field(None, max_length=50)
    currency: Optional[str] = Field(None, min_length=2, max_length=10)
    timezone: Optional[str] = Field(None, min_length=2, max_length=50)
    country: Optional[str] = Field(None, min_length=2, max_length=100)
    address: Optional[str] = Field(None, max_length=500)
    logo_url: Optional[str] = Field(None, max_length=500)


# ==========================================
# Work Location Schemas
# ==========================================

class WorkLocationBase(BaseSchema):
    name: str = Field(..., min_length=2, max_length=255, description="Location/Branch name")
    code: str = Field(..., min_length=2, max_length=50, description="Unique code e.g. HQ-BLR")
    address: Optional[str] = Field(None, max_length=500)
    city: Optional[str] = Field(None, max_length=100)
    state: Optional[str] = Field(None, max_length=100)
    country: str = Field(default="India", max_length=100)
    postal_code: Optional[str] = Field(None, max_length=20)
    is_active: bool = True


class WorkLocationCreate(WorkLocationBase):
    pass


class WorkLocationUpdate(BaseSchema):
    name: Optional[str] = Field(None, min_length=2, max_length=255)
    code: Optional[str] = Field(None, min_length=2, max_length=50)
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    postal_code: Optional[str] = None
    is_active: Optional[bool] = None


class WorkLocationResponse(WorkLocationBase, IDSchema, TimestampSchema):
    organization_id: uuid.UUID
    employee_count: Optional[int] = 0


# ==========================================
# Department Schemas
# ==========================================

class DepartmentBase(BaseSchema):
    name: str = Field(..., min_length=2, max_length=255, description="Department name e.g. Engineering")
    code: str = Field(..., min_length=2, max_length=50, description="Department code e.g. ENG")
    description: Optional[str] = None
    parent_department_id: Optional[uuid.UUID] = None
    manager_id: Optional[uuid.UUID] = None
    is_active: bool = True


class DepartmentCreate(DepartmentBase):
    pass


class DepartmentUpdate(BaseSchema):
    name: Optional[str] = Field(None, min_length=2, max_length=255)
    code: Optional[str] = Field(None, min_length=2, max_length=50)
    description: Optional[str] = None
    parent_department_id: Optional[uuid.UUID] = None
    manager_id: Optional[uuid.UUID] = None
    is_active: Optional[bool] = None


class DepartmentManagerSummary(BaseSchema):
    id: uuid.UUID
    employee_code: str
    first_name: str
    last_name: str
    email: str


class DepartmentResponse(DepartmentBase, IDSchema, TimestampSchema):
    organization_id: uuid.UUID
    manager: Optional[DepartmentManagerSummary] = None
    employee_count: Optional[int] = 0


class DepartmentTreeNode(BaseSchema):
    id: uuid.UUID
    name: str
    code: str
    is_active: bool
    manager: Optional[DepartmentManagerSummary] = None
    employee_count: int = 0
    children: List["DepartmentTreeNode"] = []


# ==========================================
# Designation Schemas
# ==========================================

class DesignationBase(BaseSchema):
    title: str = Field(..., min_length=2, max_length=255, description="Job title e.g. Senior Software Engineer")
    code: str = Field(..., min_length=2, max_length=50, description="Job code e.g. SSE-01")
    description: Optional[str] = None
    department_id: Optional[uuid.UUID] = None
    is_active: bool = True


class DesignationCreate(DesignationBase):
    pass


class DesignationUpdate(BaseSchema):
    title: Optional[str] = Field(None, min_length=2, max_length=255)
    code: Optional[str] = Field(None, min_length=2, max_length=50)
    description: Optional[str] = None
    department_id: Optional[uuid.UUID] = None
    is_active: Optional[bool] = None


class DesignationDepartmentSummary(BaseSchema):
    id: uuid.UUID
    name: str
    code: str


class DesignationResponse(DesignationBase, IDSchema, TimestampSchema):
    organization_id: uuid.UUID
    department: Optional[DesignationDepartmentSummary] = None
    employee_count: Optional[int] = 0
