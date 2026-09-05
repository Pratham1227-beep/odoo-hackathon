from datetime import datetime
from typing import List, Optional
import uuid
from sqlalchemy import DateTime, Enum as SAEnum, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.shared.base_model import BaseModel, GUID
from app.shared.enums import OrganizationStatus, UserRole, UserStatus


class Organization(BaseModel):
    """Tenant organization entity."""
    __tablename__ = "organizations"

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    code: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False)
    phone: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    currency: Mapped[str] = mapped_column(String(10), default="INR", nullable=False)
    timezone: Mapped[str] = mapped_column(String(50), default="Asia/Kolkata", nullable=False)
    country: Mapped[str] = mapped_column(String(100), default="India", nullable=False)
    address: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    logo_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    status: Mapped[OrganizationStatus] = mapped_column(
        SAEnum(OrganizationStatus, name="organization_status", native_enum=False),
        default=OrganizationStatus.ACTIVE,
        nullable=False,
    )

    # Relationships
    users: Mapped[List["User"]] = relationship(
        "User",
        back_populates="organization",
        cascade="all, delete-orphan",
        lazy="selectin",
    )
    work_locations: Mapped[List["WorkLocation"]] = relationship(  # noqa: F821
        "WorkLocation",
        back_populates="organization",
        cascade="all, delete-orphan",
        lazy="selectin",
    )
    departments: Mapped[List["Department"]] = relationship(  # noqa: F821
        "Department",
        back_populates="organization",
        cascade="all, delete-orphan",
        lazy="selectin",
    )
    designations: Mapped[List["Designation"]] = relationship(  # noqa: F821
        "Designation",
        back_populates="organization",
        cascade="all, delete-orphan",
        lazy="selectin",
    )
    employees: Mapped[List["Employee"]] = relationship(  # noqa: F821
        "Employee",
        back_populates="organization",
        cascade="all, delete-orphan",
        lazy="selectin",
    )


class User(BaseModel):
    """User account entity for authentication and RBAC."""
    __tablename__ = "users"

    organization_id: Mapped[uuid.UUID] = mapped_column(
        GUID(),
        ForeignKey("organizations.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        index=True,
        nullable=False,
    )
    password_hash: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )
    role: Mapped[UserRole] = mapped_column(
        SAEnum(UserRole, name="user_role", native_enum=False),
        default=UserRole.EMPLOYEE,
        nullable=False,
    )
    status: Mapped[UserStatus] = mapped_column(
        SAEnum(UserStatus, name="user_status", native_enum=False),
        default=UserStatus.ACTIVE,
        nullable=False,
    )
    token_version: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False,
    )
    last_login: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    # OTP tracking for forgot-password
    otp_code_hash: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    otp_expires_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    # Relationships
    organization: Mapped["Organization"] = relationship(
        "Organization",
        back_populates="users",
        lazy="joined",
    )
    employee: Mapped[Optional["Employee"]] = relationship(  # noqa: F821
        "Employee",
        back_populates="user",
        uselist=False,
        lazy="joined",
    )
