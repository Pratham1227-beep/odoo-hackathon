from datetime import date
from typing import List, Optional
import uuid
from sqlalchemy import (
    Boolean,
    Date,
    Enum as SAEnum,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.shared.base_model import GUID, OrgScopedModel
from app.shared.enums import (
    BankAccountType,
    DocumentType,
    EmployeeStatus,
    EmploymentType,
    Gender,
    MaritalStatus,
)


class Employee(OrgScopedModel):
    """Core Employee record scoped strictly per tenant organization."""
    __tablename__ = "employees"
    __table_args__ = (
        UniqueConstraint("organization_id", "employee_code", name="uq_org_employee_code"),
        UniqueConstraint("organization_id", "email", name="uq_org_employee_email"),
    )

    # Optional Link to User Account for Portal/Dashboard Login
    user_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        GUID(),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        unique=True,
        index=True,
    )

    employee_code: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    first_name: Mapped[str] = mapped_column(String(100), nullable=False)
    last_name: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    phone: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)

    gender: Mapped[Gender] = mapped_column(
        SAEnum(Gender, name="employee_gender", native_enum=False),
        default=Gender.NOT_SPECIFIED,
        nullable=False,
    )
    marital_status: Mapped[Optional[MaritalStatus]] = mapped_column(
        SAEnum(MaritalStatus, name="employee_marital_status", native_enum=False),
        nullable=True,
    )
    date_of_birth: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    joining_date: Mapped[date] = mapped_column(Date, nullable=False)
    exit_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)

    # Org Structure references
    department_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        GUID(),
        ForeignKey("departments.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    designation_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        GUID(),
        ForeignKey("designations.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    work_location_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        GUID(),
        ForeignKey("work_locations.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    manager_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        GUID(),
        ForeignKey("employees.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    employment_type: Mapped[EmploymentType] = mapped_column(
        SAEnum(EmploymentType, name="employee_employment_type", native_enum=False),
        default=EmploymentType.FULL_TIME,
        nullable=False,
    )
    status: Mapped[EmployeeStatus] = mapped_column(
        SAEnum(EmployeeStatus, name="employee_status_enum", native_enum=False),
        default=EmployeeStatus.ACTIVE,
        nullable=False,
    )

    avatar_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)

    # Emergency Contact
    emergency_contact_name: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    emergency_contact_phone: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    emergency_contact_relation: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)

    # Statutory & Tax Identification (Indian Context & General)
    pan_number: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    aadhaar_number: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    uan_number: Mapped[Optional[str]] = mapped_column(String(30), nullable=True)
    pf_number: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    esi_number: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)

    # Relationships
    organization: Mapped["Organization"] = relationship(  # noqa: F821
        "Organization",
        back_populates="employees",
        lazy="joined",
    )
    user: Mapped[Optional["User"]] = relationship(  # noqa: F821
        "User",
        back_populates="employee",
        lazy="joined",
    )
    department: Mapped[Optional["Department"]] = relationship(  # noqa: F821
        "Department",
        foreign_keys=[department_id],
        back_populates="employees",
        lazy="joined",
    )
    designation: Mapped[Optional["Designation"]] = relationship(  # noqa: F821
        "Designation",
        foreign_keys=[designation_id],
        back_populates="employees",
        lazy="joined",
    )
    work_location: Mapped[Optional["WorkLocation"]] = relationship(  # noqa: F821
        "WorkLocation",
        foreign_keys=[work_location_id],
        back_populates="employees",
        lazy="joined",
    )
    manager: Mapped[Optional["Employee"]] = relationship(
        "Employee",
        remote_side="Employee.id",
        foreign_keys=[manager_id],
        back_populates="direct_reports",
        lazy="joined",
    )
    direct_reports: Mapped[List["Employee"]] = relationship(
        "Employee",
        foreign_keys=[manager_id],
        back_populates="manager",
        lazy="selectin",
    )
    bank_account: Mapped[Optional["EmployeeBankDetail"]] = relationship(
        "EmployeeBankDetail",
        back_populates="employee",
        uselist=False,
        cascade="all, delete-orphan",
        lazy="joined",
    )
    documents: Mapped[List["EmployeeDocument"]] = relationship(
        "EmployeeDocument",
        back_populates="employee",
        cascade="all, delete-orphan",
        lazy="selectin",
    )


class EmployeeBankDetail(OrgScopedModel):
    """Bank account details for salary disbursement and statutory verification."""
    __tablename__ = "employee_bank_details"
    __table_args__ = (
        UniqueConstraint("employee_id", name="uq_employee_bank_account"),
    )

    employee_id: Mapped[uuid.UUID] = mapped_column(
        GUID(),
        ForeignKey("employees.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
        index=True,
    )
    bank_name: Mapped[str] = mapped_column(String(100), nullable=False)
    account_number: Mapped[str] = mapped_column(String(50), nullable=False)
    ifsc_code: Mapped[str] = mapped_column(String(20), nullable=False)
    branch_name: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    account_type: Mapped[BankAccountType] = mapped_column(
        SAEnum(BankAccountType, name="bank_account_type", native_enum=False),
        default=BankAccountType.SAVINGS,
        nullable=False,
    )
    is_primary: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # Relationships
    employee: Mapped["Employee"] = relationship(
        "Employee",
        back_populates="bank_account",
        lazy="joined",
    )


class EmployeeDocument(OrgScopedModel):
    """KYC, Onboarding, Contract and Tax documents attached to an employee."""
    __tablename__ = "employee_documents"

    employee_id: Mapped[uuid.UUID] = mapped_column(
        GUID(),
        ForeignKey("employees.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    document_type: Mapped[DocumentType] = mapped_column(
        SAEnum(DocumentType, name="document_type_enum", native_enum=False),
        default=DocumentType.OTHER,
        nullable=False,
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    file_url: Mapped[str] = mapped_column(String(1000), nullable=False)
    file_size: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    mime_type: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)

    # Relationships
    employee: Mapped["Employee"] = relationship(
        "Employee",
        back_populates="documents",
        lazy="joined",
    )
