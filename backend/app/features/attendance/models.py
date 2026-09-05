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
    Numeric,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.shared.base_model import GUID, OrgScopedModel
from app.shared.enums import (
    AttendanceSource,
    AttendanceStatus,
    CorrectionStatus,
    HolidayType,
)


class Attendance(OrgScopedModel):
    """Daily clock-in/out attendance record per employee."""
    __tablename__ = "attendances"
    __table_args__ = (
        UniqueConstraint("employee_id", "date", name="uq_attendance_employee_date"),
    )

    employee_id: Mapped[uuid.UUID] = mapped_column(
        GUID(),
        ForeignKey("employees.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    clock_in: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    clock_out: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    work_hours: Mapped[Optional[Decimal]] = mapped_column(Numeric(5, 2), nullable=True)
    overtime_hours: Mapped[Decimal] = mapped_column(Numeric(5, 2), default=Decimal("0.00"), nullable=False)
    status: Mapped[Optional[AttendanceStatus]] = mapped_column(
        SAEnum(AttendanceStatus, name="attendance_status_enum", native_enum=False),
        nullable=True,
        index=True,
    )
    source: Mapped[AttendanceSource] = mapped_column(
        SAEnum(AttendanceSource, name="attendance_source_enum", native_enum=False),
        default=AttendanceSource.SELF,
        nullable=False,
    )
    updated_by_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        GUID(),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    # Relationships
    employee: Mapped["Employee"] = relationship(  # noqa: F821
        "Employee",
        lazy="joined",
    )
    updated_by: Mapped[Optional["User"]] = relationship(  # noqa: F821
        "User",
        foreign_keys=[updated_by_id],
        lazy="joined",
    )
    corrections: Mapped[List["AttendanceCorrection"]] = relationship(
        "AttendanceCorrection",
        back_populates="attendance",
        cascade="all, delete-orphan",
        lazy="selectin",
    )


class AttendanceCorrection(OrgScopedModel):
    """Employee-initiated attendance correction request and review workflow."""
    __tablename__ = "attendance_corrections"

    attendance_id: Mapped[uuid.UUID] = mapped_column(
        GUID(),
        ForeignKey("attendances.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    requested_by_id: Mapped[uuid.UUID] = mapped_column(
        GUID(),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    requested_clock_in: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    requested_clock_out: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    reason: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[CorrectionStatus] = mapped_column(
        SAEnum(CorrectionStatus, name="correction_status_enum", native_enum=False),
        default=CorrectionStatus.PENDING,
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
    attendance: Mapped["Attendance"] = relationship(
        "Attendance",
        back_populates="corrections",
        lazy="joined",
    )
    requested_by: Mapped["User"] = relationship(  # noqa: F821
        "User",
        foreign_keys=[requested_by_id],
        lazy="joined",
    )
    reviewed_by: Mapped[Optional["User"]] = relationship(  # noqa: F821
        "User",
        foreign_keys=[reviewed_by_id],
        lazy="joined",
    )


class Holiday(OrgScopedModel):
    """Company & Public holidays calendar entity."""
    __tablename__ = "holidays"
    __table_args__ = (
        UniqueConstraint("organization_id", "date", name="uq_org_holiday_date"),
    )

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    type: Mapped[HolidayType] = mapped_column(
        SAEnum(HolidayType, name="holiday_type_enum", native_enum=False),
        default=HolidayType.PUBLIC,
        nullable=False,
    )
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    is_paid: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
