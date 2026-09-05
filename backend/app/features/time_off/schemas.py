from datetime import date, datetime
from decimal import Decimal
from typing import Any, Optional
import uuid
from pydantic import Field, field_validator, model_validator

from app.shared.base_schema import BaseSchema, IDSchema, TimestampSchema
from app.shared.enums import LeaveRequestStatus


# ==========================================
# Leave Type Schemas
# ==========================================

class LeaveTypeBase(BaseSchema):
    name: str = Field(..., min_length=1, max_length=100, description="Leave type display name e.g. Casual Leave")
    code: str = Field(..., min_length=1, max_length=50, description="Leave type unique code e.g. CL")
    description: Optional[str] = Field(None, description="Detailed description of leave policy")
    default_days: Decimal = Field(..., ge=0, description="Annual default days entitlement")
    is_paid: bool = Field(default=True, description="Whether leave is paid")
    carry_forward: bool = Field(default=False, description="Whether unused days roll over to next year")
    max_carry_forward: Optional[Decimal] = Field(None, ge=0, description="Maximum days eligible for carry forward")
    requires_approval: bool = Field(default=True, description="Whether leave requests require manager/HR approval")
    is_active: bool = Field(default=True, description="Whether leave type is active")

    @field_validator("code")
    @classmethod
    def clean_code(cls, v: str) -> str:
        return v.strip().upper()

    @model_validator(mode="after")
    def validate_carry_forward(self) -> "LeaveTypeBase":
        if self.carry_forward and self.max_carry_forward is None:
            raise ValueError("max_carry_forward is required when carry_forward is True")
        return self


class LeaveTypeCreate(LeaveTypeBase):
    pass


class LeaveTypeUpdate(BaseSchema):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    code: Optional[str] = Field(None, min_length=1, max_length=50)
    description: Optional[str] = None
    default_days: Optional[Decimal] = Field(None, ge=0)
    is_paid: Optional[bool] = None
    carry_forward: Optional[bool] = None
    max_carry_forward: Optional[Decimal] = Field(None, ge=0)
    requires_approval: Optional[bool] = None
    is_active: Optional[bool] = None

    @field_validator("code")
    @classmethod
    def clean_code(cls, v: Optional[str]) -> Optional[str]:
        return v.strip().upper() if v is not None else None

    @model_validator(mode="after")
    def validate_carry_forward(self) -> "LeaveTypeUpdate":
        if self.carry_forward is True and self.max_carry_forward is None:
            raise ValueError("max_carry_forward is required when carry_forward is True")
        return self


class LeaveTypeResponse(LeaveTypeBase, IDSchema, TimestampSchema):
    organization_id: uuid.UUID


# ==========================================
# Leave Allocation Schemas
# ==========================================

class LeaveAllocationCreate(BaseSchema):
    employee_id: uuid.UUID = Field(..., description="Target employee UUID")
    leave_type_id: uuid.UUID = Field(..., description="Leave type UUID")
    year: int = Field(..., ge=2000, le=2100, description="Calendar year for allocation")
    allocated_days: Decimal = Field(..., gt=0, description="Number of days granted")


class LeaveAllocationResponse(IDSchema, TimestampSchema):
    organization_id: uuid.UUID
    employee_id: uuid.UUID
    leave_type_id: uuid.UUID
    year: int
    allocated_days: Decimal
    used_days: Decimal
    remaining_days: Decimal
    allocated_by_id: uuid.UUID
    leave_type_name: Optional[str] = None
    leave_type_code: Optional[str] = None
    employee_code: Optional[str] = None
    employee_name: Optional[str] = None


# ==========================================
# Leave Request Schemas
# ==========================================

class LeaveRequestCreate(BaseSchema):
    employee_id: Optional[uuid.UUID] = Field(None, description="Employee UUID (optional for employee self-filing, required for HR filing on behalf)")
    leave_type_id: uuid.UUID = Field(..., description="Leave type UUID")
    start_date: date = Field(..., description="Start date of leave (inclusive)")
    end_date: date = Field(..., description="End date of leave (inclusive)")
    reason: str = Field(..., min_length=1, max_length=1000, description="Reason for leave request")

    @model_validator(mode="after")
    def validate_dates(self) -> "LeaveRequestCreate":
        if self.end_date < self.start_date:
            raise ValueError("end_date cannot be earlier than start_date")
        return self


class LeaveRequestReview(BaseSchema):
    status: LeaveRequestStatus = Field(..., description="Decision status: APPROVED or REJECTED")
    review_comment: Optional[str] = Field(None, max_length=1000, description="Optional review/rejection comment")

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: LeaveRequestStatus) -> LeaveRequestStatus:
        if v not in (LeaveRequestStatus.APPROVED, LeaveRequestStatus.REJECTED):
            raise ValueError("Status must be either APPROVED or REJECTED")
        return v


class LeaveRequestResponse(IDSchema, TimestampSchema):
    organization_id: uuid.UUID
    employee_id: uuid.UUID
    leave_type_id: uuid.UUID
    start_date: date
    end_date: date
    days: Decimal
    reason: str
    status: LeaveRequestStatus
    reviewed_by_id: Optional[uuid.UUID] = None
    review_comment: Optional[str] = None
    reviewed_at: Optional[datetime] = None
    leave_type_name: Optional[str] = None
    leave_type_code: Optional[str] = None
    employee_code: Optional[str] = None
    employee_name: Optional[str] = None
