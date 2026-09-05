from datetime import date, datetime
from decimal import Decimal
from typing import Optional
import uuid
from pydantic import Field, field_validator

from app.shared.base_schema import BaseSchema, IDSchema, TimestampSchema
from app.shared.enums import (
    AttendanceSource,
    AttendanceStatus,
    CorrectionStatus,
    HolidayType,
)


# ==========================================
# Attendance Schemas
# ==========================================

class AttendanceUpdate(BaseSchema):
    clock_in: Optional[datetime] = None
    clock_out: Optional[datetime] = None
    status: Optional[AttendanceStatus] = None


class AttendanceResponse(IDSchema, TimestampSchema):
    organization_id: uuid.UUID
    employee_id: uuid.UUID
    date: date
    clock_in: Optional[datetime] = None
    clock_out: Optional[datetime] = None
    work_hours: Optional[Decimal] = None
    overtime_hours: Decimal = Decimal("0.00")
    status: Optional[AttendanceStatus] = None
    source: AttendanceSource = AttendanceSource.SELF
    updated_by_id: Optional[uuid.UUID] = None


# ==========================================
# Attendance Correction Schemas
# ==========================================

class AttendanceCorrectionCreate(BaseSchema):
    requested_clock_in: Optional[datetime] = None
    requested_clock_out: Optional[datetime] = None
    reason: str = Field(..., min_length=2, description="Reason for correction request")


class AttendanceCorrectionReview(BaseSchema):
    status: CorrectionStatus = Field(..., description="Must be APPROVED or REJECTED")
    review_comment: Optional[str] = Field(None, description="Optional review comment or feedback")

    @field_validator("status")
    @classmethod
    def validate_review_status(cls, v: CorrectionStatus) -> CorrectionStatus:
        if v == CorrectionStatus.PENDING:
            raise ValueError("Review status must be APPROVED or REJECTED, not PENDING")
        return v


class AttendanceCorrectionResponse(IDSchema, TimestampSchema):
    organization_id: uuid.UUID
    attendance_id: uuid.UUID
    requested_by_id: uuid.UUID
    requested_clock_in: Optional[datetime] = None
    requested_clock_out: Optional[datetime] = None
    reason: str
    status: CorrectionStatus
    reviewed_by_id: Optional[uuid.UUID] = None
    review_comment: Optional[str] = None
    reviewed_at: Optional[datetime] = None


# ==========================================
# Holiday Schemas
# ==========================================

class HolidayCreate(BaseSchema):
    name: str = Field(..., min_length=2, max_length=255)
    date: date
    type: HolidayType = HolidayType.PUBLIC
    description: Optional[str] = None
    is_paid: bool = True


class HolidayUpdate(BaseSchema):
    name: Optional[str] = Field(None, min_length=2, max_length=255)
    date: Optional[date] = None
    type: Optional[HolidayType] = None
    description: Optional[str] = None
    is_paid: Optional[bool] = None


class HolidayResponse(IDSchema, TimestampSchema):
    organization_id: uuid.UUID
    name: str
    date: date
    type: HolidayType
    description: Optional[str] = None
    is_paid: bool


# ==========================================
# Summary Schemas
# ==========================================

class AttendanceSummaryResponse(BaseSchema):
    employee_id: uuid.UUID
    from_date: date
    to_date: date
    present_days: int
    late_days: int
    half_days: int
    absent_days: int
    total_overtime_hours: float
    missing_checkout_count: int
    note: str = "absent_days excludes approved leave — Time Off isn't wired in until Phase 5"
