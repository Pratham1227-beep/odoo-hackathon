from datetime import date, datetime
from decimal import Decimal
from typing import List, Optional
import uuid
from pydantic import Field, field_validator, model_validator

from app.shared.base_schema import BaseSchema, IDSchema, TimestampSchema
from app.shared.enums import (
    DeliveryStatus,
    PayrollIssueSeverity,
    PayrollIssueStatus,
    PayrunEmployeeStatus,
    PayrunStatus,
    PayslipStatus,
)


# ==========================================
# Payrun Schemas
# ==========================================

class PayrunCreate(BaseSchema):
    name: str = Field(..., min_length=2, max_length=255, description="Descriptive label e.g. September 2026 Regular Payrun")
    period_start: date = Field(..., description="Pay cycle start date (inclusive)")
    period_end: date = Field(..., description="Pay cycle end date (inclusive)")
    month: int = Field(..., ge=1, le=12, description="Payroll calendar month (1-12)")
    year: int = Field(..., ge=2000, le=2100, description="Payroll calendar year")
    employee_ids: List[uuid.UUID] = Field(..., min_length=1, description="List of employee UUIDs included in payrun")
    notes: Optional[str] = Field(None, description="Optional administrative notes")

    @model_validator(mode="after")
    def validate_dates(self) -> "PayrunCreate":
        if self.period_end < self.period_start:
            raise ValueError("period_end cannot be earlier than period_start")
        return self


class PayrunResponse(IDSchema, TimestampSchema):
    organization_id: uuid.UUID
    name: str
    period_start: date
    period_end: date
    month: int
    year: int
    status: PayrunStatus
    total_employees: int
    processed_employees: int
    issue_count: int
    total_gross: Decimal
    total_deductions: Decimal
    total_net: Decimal
    created_by_id: uuid.UUID
    finalized_by_id: Optional[uuid.UUID] = None
    computed_at: Optional[datetime] = None
    finalized_at: Optional[datetime] = None
    notes: Optional[str] = None


# ==========================================
# Payrun Employee Schemas
# ==========================================

class PayrunEmployeeResponse(IDSchema, TimestampSchema):
    organization_id: uuid.UUID
    payrun_id: uuid.UUID
    employee_id: uuid.UUID
    contract_id: Optional[uuid.UUID] = None
    status: PayrunEmployeeStatus
    payable_days: Decimal
    worked_days: Decimal
    leave_days: Decimal
    absent_days: Decimal
    overtime_hours: Decimal
    gross_salary: Decimal
    total_deductions: Decimal
    net_salary: Decimal
    is_ready: bool
    computed_at: Optional[datetime] = None
    employee_name: Optional[str] = None
    employee_code: Optional[str] = None


# ==========================================
# Payroll Validation Issue Schemas
# ==========================================

class PayrollValidationIssueResponse(IDSchema, TimestampSchema):
    organization_id: uuid.UUID
    payrun_id: uuid.UUID
    employee_id: Optional[uuid.UUID] = None
    issue_code: str
    category: str
    severity: PayrollIssueSeverity
    title: str
    description: str
    status: PayrollIssueStatus
    resolution: Optional[str] = None
    resolved_by_id: Optional[uuid.UUID] = None
    resolved_at: Optional[datetime] = None
    employee_name: Optional[str] = None
    employee_code: Optional[str] = None


class PayrunDetailResponse(PayrunResponse):
    employees: List[PayrunEmployeeResponse] = []
    issues: List[PayrollValidationIssueResponse] = []


# ==========================================
# Payslip & Line Schemas
# ==========================================

class PayslipLineResponse(IDSchema, TimestampSchema):
    payslip_id: uuid.UUID
    salary_rule_id: Optional[uuid.UUID] = None
    name: str
    code: str
    category: str
    base_amount: Decimal
    rate: Optional[Decimal] = None
    amount: Decimal
    sequence: int


class PayslipDeliveryResponse(IDSchema, TimestampSchema):
    payslip_id: uuid.UUID
    recipient_email: str
    delivery_type: str
    status: DeliveryStatus
    sent_at: Optional[datetime] = None
    failure_reason: Optional[str] = None


class PayslipResponse(IDSchema, TimestampSchema):
    organization_id: uuid.UUID
    payrun_id: uuid.UUID
    employee_id: uuid.UUID
    contract_id: Optional[uuid.UUID] = None
    payslip_number: str
    period_start: date
    period_end: date
    basic_salary: Decimal
    gross_salary: Decimal
    total_earnings: Decimal
    total_deductions: Decimal
    net_salary: Decimal
    status: PayslipStatus
    pdf_url: Optional[str] = None
    generated_at: datetime
    sent_at: Optional[datetime] = None
    paid_at: Optional[datetime] = None
    employee_name: Optional[str] = None
    employee_code: Optional[str] = None
    payrun_name: Optional[str] = None


class PayslipDetailResponse(PayslipResponse):
    lines: List[PayslipLineResponse] = []
    deliveries: List[PayslipDeliveryResponse] = []


# ==========================================
# Payroll Dashboard Schema
# ==========================================

class PayrollDashboardResponse(BaseSchema):
    latest_payrun: Optional[PayrunResponse] = None
    ytd_gross: Decimal = Decimal("0.00")
    ytd_deductions: Decimal = Decimal("0.00")
    ytd_net: Decimal = Decimal("0.00")
    ytd_processed_payruns: int = 0
    open_issue_count: int = 0
    total_employees: int = 0
