from datetime import date, datetime
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
from app.shared.enums import LeaveRequestStatus


class LeaveType(OrgScopedModel):
    """Leave policy configuration defining rules for a category of time off."""
    __tablename__ = "leave_types"
    __table_args__ = (
        UniqueConstraint("organization_id", "code", name="uq_org_leave_type_code"),
    )

    name: Mapped[str] = mapped_column(String(100), nullable=False)
    code: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    default_days: Mapped[Decimal] = mapped_column(Numeric(5, 1), nullable=False)
    is_paid: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    carry_forward: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    max_carry_forward: Mapped[Optional[Decimal]] = mapped_column(Numeric(5, 1), nullable=True)
    requires_approval: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # Relationships
    allocations: Mapped[List["LeaveAllocation"]] = relationship(
        "LeaveAllocation",
        back_populates="leave_type",
        cascade="all, delete-orphan",
        lazy="selectin",
    )
    leave_requests: Mapped[List["LeaveRequest"]] = relationship(
        "LeaveRequest",
        back_populates="leave_type",
        cascade="all, delete-orphan",
        lazy="selectin",
    )


class LeaveAllocation(OrgScopedModel):
    """Annual leave quota allocation assigned to an employee."""
    __tablename__ = "leave_allocations"
    __table_args__ = (
        UniqueConstraint("organization_id", "employee_id", "leave_type_id", "year", name="uq_leave_alloc_emp_type_year"),
    )

    employee_id: Mapped[uuid.UUID] = mapped_column(
        GUID(),
        ForeignKey("employees.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    leave_type_id: Mapped[uuid.UUID] = mapped_column(
        GUID(),
        ForeignKey("leave_types.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    year: Mapped[int] = mapped_column(Integer, nullable=False, index=True)
    allocated_days: Mapped[Decimal] = mapped_column(Numeric(5, 1), nullable=False)
    used_days: Mapped[Decimal] = mapped_column(Numeric(5, 1), default=Decimal("0.0"), nullable=False)
    remaining_days: Mapped[Decimal] = mapped_column(Numeric(5, 1), nullable=False)
    allocated_by_id: Mapped[uuid.UUID] = mapped_column(
        GUID(),
        ForeignKey("users.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )

    # Relationships
    employee: Mapped["Employee"] = relationship(  # noqa: F821
        "Employee",
        lazy="joined",
    )
    leave_type: Mapped["LeaveType"] = relationship(
        "LeaveType",
        back_populates="allocations",
        lazy="joined",
    )
    allocated_by: Mapped["User"] = relationship(  # noqa: F821
        "User",
        foreign_keys=[allocated_by_id],
        lazy="joined",
    )


class LeaveRequest(OrgScopedModel):
    """Employee time off application record and approval state."""
    __tablename__ = "leave_requests"

    employee_id: Mapped[uuid.UUID] = mapped_column(
        GUID(),
        ForeignKey("employees.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    leave_type_id: Mapped[uuid.UUID] = mapped_column(
        GUID(),
        ForeignKey("leave_types.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    start_date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    end_date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    days: Mapped[Decimal] = mapped_column(Numeric(5, 1), nullable=False)
    reason: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[LeaveRequestStatus] = mapped_column(
        SAEnum(LeaveRequestStatus, name="leave_request_status_enum", native_enum=False),
        default=LeaveRequestStatus.PENDING,
        nullable=False,
        index=True,
    )
    reviewed_by_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        GUID(),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    review_comment: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    reviewed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    # Relationships
    employee: Mapped["Employee"] = relationship(  # noqa: F821
        "Employee",
        lazy="joined",
    )
    leave_type: Mapped["LeaveType"] = relationship(
        "LeaveType",
        back_populates="leave_requests",
        lazy="joined",
    )
    reviewed_by: Mapped[Optional["User"]] = relationship(  # noqa: F821
        "User",
        foreign_keys=[reviewed_by_id],
        lazy="joined",
    )
