from datetime import date
from typing import Any, Dict, List, Optional
import uuid
from pydantic import EmailStr, Field, field_validator

from app.shared.base_schema import BaseSchema, IDSchema, TimestampSchema
from app.shared.enums import (
    BankAccountType,
    DocumentType,
    EmployeeStatus,
    EmploymentType,
    Gender,
    MaritalStatus,
    UserRole,
)


# ==========================================
# Bank Account Schemas
# ==========================================

class EmployeeBankDetailBase(BaseSchema):
    bank_name: str = Field(..., min_length=2, max_length=100, description="Bank Name e.g. HDFC Bank")
    account_number: str = Field(..., min_length=5, max_length=50, description="Bank Account Number")
    ifsc_code: str = Field(..., min_length=4, max_length=20, description="IFSC / Routing Code")
    branch_name: Optional[str] = Field(None, max_length=100)
    account_type: BankAccountType = BankAccountType.SAVINGS
    is_primary: bool = True

    @field_validator("ifsc_code")
    @classmethod
    def clean_ifsc(cls, v: str) -> str:
        return v.strip().upper()


class EmployeeBankDetailCreate(EmployeeBankDetailBase):
    pass


class EmployeeBankDetailUpdate(BaseSchema):
    bank_name: Optional[str] = Field(None, min_length=2, max_length=100)
    account_number: Optional[str] = Field(None, min_length=5, max_length=50)
    ifsc_code: Optional[str] = Field(None, min_length=4, max_length=20)
    branch_name: Optional[str] = None
    account_type: Optional[BankAccountType] = None
    is_primary: Optional[bool] = None


class EmployeeBankDetailResponse(EmployeeBankDetailBase, IDSchema, TimestampSchema):
    organization_id: uuid.UUID
    employee_id: uuid.UUID


# ==========================================
# Document Schemas
# ==========================================

class EmployeeDocumentCreate(BaseSchema):
    document_type: DocumentType = DocumentType.OTHER
    title: str = Field(..., min_length=2, max_length=255, description="Document title/label")
    file_url: str = Field(..., min_length=5, max_length=1000, description="URL or storage path")
    file_size: Optional[int] = Field(None, description="Size in bytes")
    mime_type: Optional[str] = Field(None, max_length=100)


class EmployeeDocumentResponse(EmployeeDocumentCreate, IDSchema, TimestampSchema):
    organization_id: uuid.UUID
    employee_id: uuid.UUID


# ==========================================
# Employee Nested Summaries
# ==========================================

class EmployeeDepartmentSummary(BaseSchema):
    id: uuid.UUID
    name: str
    code: str


class EmployeeDesignationSummary(BaseSchema):
    id: uuid.UUID
    title: str
    code: str


class EmployeeLocationSummary(BaseSchema):
    id: uuid.UUID
    name: str
    code: str
    city: Optional[str] = None


class EmployeeManagerSummary(BaseSchema):
    id: uuid.UUID
    employee_code: str
    first_name: str
    last_name: str
    email: str


# ==========================================
# Employee Core Schemas
# ==========================================

class EmployeeBase(BaseSchema):
    employee_code: Optional[str] = Field(
        None, max_length=50, description="Unique employee ID / code (auto-generated if empty)"
    )
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(default="", max_length=100)
    email: str = Field(..., description="Corporate or official employee email")
    phone: Optional[str] = Field(None, max_length=50)

    gender: Gender = Gender.NOT_SPECIFIED
    marital_status: Optional[MaritalStatus] = None
    date_of_birth: Optional[date] = None
    joining_date: date = Field(..., description="Date of joining organization")
    exit_date: Optional[date] = None

    department_id: Optional[uuid.UUID] = None
    designation_id: Optional[uuid.UUID] = None
    work_location_id: Optional[uuid.UUID] = None
    manager_id: Optional[uuid.UUID] = None

    employment_type: EmploymentType = EmploymentType.FULL_TIME
    status: EmployeeStatus = EmployeeStatus.ACTIVE

    avatar_url: Optional[str] = None

    # Emergency Contacts
    emergency_contact_name: Optional[str] = Field(None, max_length=100)
    emergency_contact_phone: Optional[str] = Field(None, max_length=50)
    emergency_contact_relation: Optional[str] = Field(None, max_length=50)

    # Statutory IDs
    pan_number: Optional[str] = Field(None, max_length=20)
    aadhaar_number: Optional[str] = Field(None, max_length=20)
    uan_number: Optional[str] = Field(None, max_length=30)
    pf_number: Optional[str] = Field(None, max_length=50)
    esi_number: Optional[str] = Field(None, max_length=50)


class EmployeeCreate(EmployeeBase):
    # Optional login account provisioning
    create_user_account: bool = False
    user_role: UserRole = UserRole.EMPLOYEE
    password: Optional[str] = Field(None, min_length=8, description="Password if provisioning login account")

    # Optional initial bank details
    bank_account: Optional[EmployeeBankDetailCreate] = None


class EmployeeUpdate(BaseSchema):
    first_name: Optional[str] = Field(None, min_length=1, max_length=100)
    last_name: Optional[str] = Field(None, min_length=1, max_length=100)
    email: Optional[str] = None
    phone: Optional[str] = None
    gender: Optional[Gender] = None
    marital_status: Optional[MaritalStatus] = None
    date_of_birth: Optional[date] = None
    joining_date: Optional[date] = None
    exit_date: Optional[date] = None

    department_id: Optional[uuid.UUID] = None
    designation_id: Optional[uuid.UUID] = None
    work_location_id: Optional[uuid.UUID] = None
    manager_id: Optional[uuid.UUID] = None

    employment_type: Optional[EmploymentType] = None
    status: Optional[EmployeeStatus] = None

    avatar_url: Optional[str] = None

    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    emergency_contact_relation: Optional[str] = None

    pan_number: Optional[str] = None
    aadhaar_number: Optional[str] = None
    uan_number: Optional[str] = None
    pf_number: Optional[str] = None
    esi_number: Optional[str] = None


class EmployeeResponse(EmployeeBase, IDSchema, TimestampSchema):
    organization_id: uuid.UUID
    user_id: Optional[uuid.UUID] = None
    full_name: str
    department: Optional[EmployeeDepartmentSummary] = None
    designation: Optional[EmployeeDesignationSummary] = None
    work_location: Optional[EmployeeLocationSummary] = None
    manager: Optional[EmployeeManagerSummary] = None
    bank_account: Optional[EmployeeBankDetailResponse] = None


class EmployeeDetailResponse(EmployeeResponse):
    documents: List[EmployeeDocumentResponse] = []
    direct_reports_count: int = 0
    temporary_password: Optional[str] = None


# ==========================================
# Org Chart & Stats Schemas
# ==========================================

class OrgChartNodeResponse(BaseSchema):
    id: uuid.UUID
    employee_code: str
    name: str
    email: str
    avatar_url: Optional[str] = None
    designation: Optional[str] = None
    department: Optional[str] = None
    children: List["OrgChartNodeResponse"] = []


class EmployeeStatsResponse(BaseSchema):
    total_employees: int
    active_employees: int
    on_leave_employees: int
    probation_employees: int
    terminated_employees: int
    department_distribution: Dict[str, int]
    employment_type_distribution: Dict[str, int]
    new_joiners_this_month: int


# ==========================================
# Bulk Import Schemas
# ==========================================

class BulkEmployeeImportItem(BaseSchema):
    employee_code: Optional[str] = None
    first_name: str
    last_name: str
    email: str
    phone: Optional[str] = None
    gender: Optional[Gender] = Gender.NOT_SPECIFIED
    joining_date: date
    department_code: Optional[str] = None
    designation_code: Optional[str] = None
    work_location_code: Optional[str] = None
    employment_type: Optional[EmploymentType] = EmploymentType.FULL_TIME
    pan_number: Optional[str] = None
    bank_name: Optional[str] = None
    bank_account_number: Optional[str] = None
    bank_ifsc: Optional[str] = None


class BulkEmployeeImportRequest(BaseSchema):
    employees: List[BulkEmployeeImportItem] = Field(..., min_length=1, max_length=500)


class BulkImportRowError(BaseSchema):
    row_index: int
    email: str
    error: str


class BulkImportResponse(BaseSchema):
    total_rows: int
    imported_count: int
    failed_count: int
    errors: List[BulkImportRowError] = []
