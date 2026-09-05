from datetime import date, datetime, timezone
from decimal import Decimal
from typing import List, Optional
import uuid
from sqlalchemy import (
    Boolean,
    Date,
    DateTime,
    Enum as SAEnum,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.shared.base_model import GUID, OrgScopedModel
from app.shared.enums import (
    DeliveryStatus,
    PayrollIssueSeverity,
    PayrollIssueStatus,
    PayrunEmployeeStatus,
    PayrunStatus,
    PayslipStatus,
)


class Payrun(OrgScopedModel):
    """Payroll execution run scoped per organization, tracking calculation and finalization state."""
    __tablename__ = "payruns"

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    period_start: Mapped[date] = mapped_column(Date, nullable=False)
    period_end: Mapped[date] = mapped_column(Date, nullable=False)
    month: Mapped[int] = mapped_column(Integer, nullable=False)
    year: Mapped[int] = mapped_column(Integer, nullable=False)
    status: Mapped[PayrunStatus] = mapped_column(
        SAEnum(PayrunStatus, name="payrun_status_enum", native_enum=False),
        default=PayrunStatus.DRAFT,
        nullable=False,
        index=True,
    )
    total_employees: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    processed_employees: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    issue_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    total_gross: Mapped[Decimal] = mapped_column(Numeric(14, 2), default=Decimal("0.00"), nullable=False)
    total_deductions: Mapped[Decimal] = mapped_column(Numeric(14, 2), default=Decimal("0.00"), nullable=False)
    total_net: Mapped[Decimal] = mapped_column(Numeric(14, 2), default=Decimal("0.00"), nullable=False)
    created_by_id: Mapped[uuid.UUID] = mapped_column(
        GUID(),
        ForeignKey("users.id", ondelete="RESTRICT"),
        nullable=False,
    )
    finalized_by_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        GUID(),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )
    computed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    finalized_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Relationships
    created_by: Mapped["User"] = relationship("User", foreign_keys=[created_by_id], lazy="joined")  # noqa: F821
    finalized_by: Mapped[Optional["User"]] = relationship("User", foreign_keys=[finalized_by_id], lazy="joined")  # noqa: F821
    employees: Mapped[List["PayrunEmployee"]] = relationship(
        "PayrunEmployee",
        back_populates="payrun",
        cascade="all, delete-orphan",
        lazy="select",
    )
    issues: Mapped[List["PayrollValidationIssue"]] = relationship(
        "PayrollValidationIssue",
        back_populates="payrun",
        cascade="all, delete-orphan",
        lazy="select",
    )
    payslips: Mapped[List["Payslip"]] = relationship(
        "Payslip",
        back_populates="payrun",
        cascade="all, delete-orphan",
        lazy="select",
    )


class PayrunEmployee(OrgScopedModel):
    """Per-employee calculation entry within a payrun."""
    __tablename__ = "payrun_employees"
    __table_args__ = (
        UniqueConstraint("payrun_id", "employee_id", name="uq_payrun_employee"),
    )

    payrun_id: Mapped[uuid.UUID] = mapped_column(
        GUID(),
        ForeignKey("payruns.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    employee_id: Mapped[uuid.UUID] = mapped_column(
        GUID(),
        ForeignKey("employees.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    contract_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        GUID(),
        ForeignKey("contracts.id", ondelete="SET NULL"),
        nullable=True,
    )
    status: Mapped[PayrunEmployeeStatus] = mapped_column(
        SAEnum(PayrunEmployeeStatus, name="payrun_emp_status_enum", native_enum=False),
        default=PayrunEmployeeStatus.PENDING,
        nullable=False,
        index=True,
    )
    payable_days: Mapped[Decimal] = mapped_column(Numeric(5, 1), default=Decimal("0.0"), nullable=False)
    worked_days: Mapped[Decimal] = mapped_column(Numeric(5, 1), default=Decimal("0.0"), nullable=False)
    leave_days: Mapped[Decimal] = mapped_column(Numeric(5, 1), default=Decimal("0.0"), nullable=False)
    absent_days: Mapped[Decimal] = mapped_column(Numeric(5, 1), default=Decimal("0.0"), nullable=False)
    overtime_hours: Mapped[Decimal] = mapped_column(Numeric(6, 2), default=Decimal("0.00"), nullable=False)
    gross_salary: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=Decimal("0.00"), nullable=False)
    total_deductions: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=Decimal("0.00"), nullable=False)
    net_salary: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=Decimal("0.00"), nullable=False)
    is_ready: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    computed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    # Relationships
    payrun: Mapped["Payrun"] = relationship("Payrun", back_populates="employees", lazy="joined")
    employee: Mapped["Employee"] = relationship("Employee", lazy="joined")  # noqa: F821
    contract: Mapped[Optional["Contract"]] = relationship("Contract", lazy="joined")  # noqa: F821


class PayrollValidationIssue(OrgScopedModel):
    """Validation or configuration discrepancies discovered during payroll processing."""
    __tablename__ = "payroll_validation_issues"

    payrun_id: Mapped[uuid.UUID] = mapped_column(
        GUID(),
        ForeignKey("payruns.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    employee_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        GUID(),
        ForeignKey("employees.id", ondelete="CASCADE"),
        nullable=True,
        index=True,
    )
    issue_code: Mapped[str] = mapped_column(String(100), nullable=False)
    category: Mapped[str] = mapped_column(String(50), nullable=False)
    severity: Mapped[PayrollIssueSeverity] = mapped_column(
        SAEnum(PayrollIssueSeverity, name="payroll_issue_severity_enum", native_enum=False),
        default=PayrollIssueSeverity.WARNING,
        nullable=False,
        index=True,
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[PayrollIssueStatus] = mapped_column(
        SAEnum(PayrollIssueStatus, name="payroll_issue_status_enum", native_enum=False),
        default=PayrollIssueStatus.OPEN,
        nullable=False,
        index=True,
    )
    resolution: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    resolved_by_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        GUID(),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )
    resolved_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    # Relationships
    payrun: Mapped["Payrun"] = relationship("Payrun", back_populates="issues", lazy="joined")
    employee: Mapped[Optional["Employee"]] = relationship("Employee", lazy="joined")  # noqa: F821
    resolved_by: Mapped[Optional["User"]] = relationship("User", foreign_keys=[resolved_by_id], lazy="joined")  # noqa: F821


class Payslip(OrgScopedModel):
    """Official generated payslip representing finalized compensation for an employee period."""
    __tablename__ = "payslips"
    __table_args__ = (
        UniqueConstraint("organization_id", "payslip_number", name="uq_org_payslip_number"),
    )

    payrun_id: Mapped[uuid.UUID] = mapped_column(
        GUID(),
        ForeignKey("payruns.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    employee_id: Mapped[uuid.UUID] = mapped_column(
        GUID(),
        ForeignKey("employees.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    contract_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        GUID(),
        ForeignKey("contracts.id", ondelete="SET NULL"),
        nullable=True,
    )
    payslip_number: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    period_start: Mapped[date] = mapped_column(Date, nullable=False)
    period_end: Mapped[date] = mapped_column(Date, nullable=False)
    basic_salary: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=Decimal("0.00"), nullable=False)
    gross_salary: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=Decimal("0.00"), nullable=False)
    total_earnings: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=Decimal("0.00"), nullable=False)
    total_deductions: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=Decimal("0.00"), nullable=False)
    net_salary: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=Decimal("0.00"), nullable=False)
    status: Mapped[PayslipStatus] = mapped_column(
        SAEnum(PayslipStatus, name="payslip_status_enum", native_enum=False),
        default=PayslipStatus.GENERATED,
        nullable=False,
        index=True,
    )
    pdf_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    generated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    sent_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    paid_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    # Relationships
    payrun: Mapped["Payrun"] = relationship("Payrun", back_populates="payslips", lazy="joined")
    employee: Mapped["Employee"] = relationship("Employee", lazy="joined")  # noqa: F821
    contract: Mapped[Optional["Contract"]] = relationship("Contract", lazy="joined")  # noqa: F821
    lines: Mapped[List["PayslipLine"]] = relationship(
        "PayslipLine",
        back_populates="payslip",
        cascade="all, delete-orphan",
        order_by="PayslipLine.sequence",
        lazy="select",
    )
    deliveries: Mapped[List["PayslipDelivery"]] = relationship(
        "PayslipDelivery",
        back_populates="payslip",
        cascade="all, delete-orphan",
        lazy="select",
    )


class PayslipLine(OrgScopedModel):
    """Detailed line item breakdown within a payslip."""
    __tablename__ = "payslip_lines"

    payslip_id: Mapped[uuid.UUID] = mapped_column(
        GUID(),
        ForeignKey("payslips.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    salary_rule_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        GUID(),
        ForeignKey("salary_rules.id", ondelete="SET NULL"),
        nullable=True,
    )
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    code: Mapped[str] = mapped_column(String(50), nullable=False)
    category: Mapped[str] = mapped_column(String(50), nullable=False)
    base_amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=Decimal("0.00"), nullable=False)
    rate: Mapped[Optional[Decimal]] = mapped_column(Numeric(5, 2), nullable=True)
    amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    sequence: Mapped[int] = mapped_column(Integer, default=1, nullable=False)

    # Relationships
    payslip: Mapped["Payslip"] = relationship("Payslip", back_populates="lines", lazy="joined")
    salary_rule: Mapped[Optional["SalaryRule"]] = relationship("SalaryRule", lazy="joined")  # noqa: F821


class PayslipDelivery(OrgScopedModel):
    """Email delivery log record for an individual payslip."""
    __tablename__ = "payslip_deliveries"

    payslip_id: Mapped[uuid.UUID] = mapped_column(
        GUID(),
        ForeignKey("payslips.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    recipient_email: Mapped[str] = mapped_column(String(255), nullable=False)
    delivery_type: Mapped[str] = mapped_column(String(50), default="EMAIL", nullable=False)
    status: Mapped[DeliveryStatus] = mapped_column(
        SAEnum(DeliveryStatus, name="delivery_status_enum", native_enum=False),
        default=DeliveryStatus.PENDING,
        nullable=False,
        index=True,
    )
    sent_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    failure_reason: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Relationships
    payslip: Mapped["Payslip"] = relationship("Payslip", back_populates="deliveries", lazy="joined")
