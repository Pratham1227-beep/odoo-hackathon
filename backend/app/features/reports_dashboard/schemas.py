from datetime import date, datetime
from decimal import Decimal
from typing import Any, Dict, List, Optional
import uuid
from pydantic import BaseModel, Field

from app.features.payroll.schemas import PayslipResponse
from app.shared.enums import PayrollIssueSeverity


class PeriodFilter(BaseModel):
    month: Optional[int] = None
    year: Optional[int] = None
    from_date: date
    to_date: date


# ==========================================
# 1. Main Executive Dashboard
# ==========================================

class KPICards(BaseModel):
    total_net_salary_paid: Decimal = Decimal("0.00")
    payslips_generated: int = 0
    average_salary: Decimal = Decimal("0.00")
    approved_time_off: float = 0.0
    attendance_health: float = 100.0


class OperationalAlertIssue(BaseModel):
    id: uuid.UUID
    payrun_id: uuid.UUID
    payrun_name: str
    employee_id: Optional[uuid.UUID] = None
    employee_name: Optional[str] = None
    employee_code: Optional[str] = None
    category: str
    severity: PayrollIssueSeverity
    title: str
    description: str


class OperationalAlerts(BaseModel):
    total_open_issues: int = 0
    error_count: int = 0
    warning_count: int = 0
    info_count: int = 0
    issues: List[OperationalAlertIssue] = Field(default_factory=list)


class DepartmentCostBreakdown(BaseModel):
    department_id: Optional[uuid.UUID] = None
    department_name: str
    headcount: int = 0
    total_cost: Decimal = Decimal("0.00")
    avg_cost: Decimal = Decimal("0.00")


class MainDashboardResponse(BaseModel):
    period: PeriodFilter
    kpis: KPICards
    operational_alerts: OperationalAlerts
    department_breakdown: List[DepartmentCostBreakdown] = Field(default_factory=list)


# ==========================================
# 2. Payroll Dashboard
# ==========================================

class MonthlySalaryTrend(BaseModel):
    month: int
    year: int
    date: date
    total_gross: Decimal
    total_deductions: Decimal
    total_net: Decimal
    employee_count: int
    avg_salary: Decimal
    is_live: bool


class PayrollPeriodMetrics(BaseModel):
    total_gross: Decimal = Decimal("0.00")
    total_deductions: Decimal = Decimal("0.00")
    total_net: Decimal = Decimal("0.00")
    avg_gross: Decimal = Decimal("0.00")
    avg_deductions: Decimal = Decimal("0.00")
    avg_net: Decimal = Decimal("0.00")
    employee_count: int = 0


class PayrollDashboardResponse(BaseModel):
    period: PeriodFilter
    metrics: PayrollPeriodMetrics
    salary_cost_by_department: List[DepartmentCostBreakdown] = Field(default_factory=list)
    monthly_trends: List[MonthlySalaryTrend] = Field(default_factory=list)


# ==========================================
# 3. Attendance Dashboard
# ==========================================

class DepartmentAttendanceMetric(BaseModel):
    department_id: Optional[uuid.UUID] = None
    department_name: str
    present_count: int = 0
    late_count: int = 0
    absent_count: int = 0
    half_day_count: int = 0
    total_work_hours: float = 0.0
    total_overtime_hours: float = 0.0
    coverage_percentage: float = 100.0


class AttendanceDashboardResponse(BaseModel):
    period: PeriodFilter
    total_records: int = 0
    present_count: int = 0
    late_count: int = 0
    absent_count: int = 0
    half_day_count: int = 0
    total_work_hours: float = 0.0
    total_overtime_hours: float = 0.0
    missing_checkout_count: int = 0
    manual_edit_count: int = 0
    attendance_coverage_percentage: float = 100.0
    department_breakdown: List[DepartmentAttendanceMetric] = Field(default_factory=list)


# ==========================================
# 4. Employees Dashboard
# ==========================================

class DepartmentHeadcountItem(BaseModel):
    id: Optional[uuid.UUID] = None
    name: str
    count: int = 0
    percentage: float = 0.0


class DesignationHeadcountItem(BaseModel):
    id: Optional[uuid.UUID] = None
    title: str
    count: int = 0
    percentage: float = 0.0


class TypeHeadcountItem(BaseModel):
    type: str
    count: int = 0
    percentage: float = 0.0


class StatusHeadcountItem(BaseModel):
    status: str
    count: int = 0
    percentage: float = 0.0


class DepartmentSummaryItem(BaseModel):
    department_id: Optional[uuid.UUID] = None
    department_name: str
    headcount: int = 0
    active_count: int = 0
    new_hires: int = 0


class EmployeesDashboardResponse(BaseModel):
    period: PeriodFilter
    total_employees: int = 0
    active_employees: int = 0
    new_hires_in_period: int = 0
    by_department: List[DepartmentHeadcountItem] = Field(default_factory=list)
    by_designation: List[DesignationHeadcountItem] = Field(default_factory=list)
    by_employment_type: List[TypeHeadcountItem] = Field(default_factory=list)
    by_status: List[StatusHeadcountItem] = Field(default_factory=list)
    department_summary: List[DepartmentSummaryItem] = Field(default_factory=list)


# ==========================================
# 5. Salary Statement
# ==========================================

class YTDSummary(BaseModel):
    ytd_gross_earnings: Decimal = Decimal("0.00")
    ytd_total_deductions: Decimal = Decimal("0.00")
    ytd_net_salary: Decimal = Decimal("0.00")
    total_payslips: int = 0


class SalaryStatementResponse(BaseModel):
    user_id: uuid.UUID
    employee_id: uuid.UUID
    employee_name: str
    employee_code: str
    department_name: Optional[str] = None
    designation_title: Optional[str] = None
    period: PeriodFilter
    ytd_summary: YTDSummary
    payslips: List[PayslipResponse] = Field(default_factory=list)
