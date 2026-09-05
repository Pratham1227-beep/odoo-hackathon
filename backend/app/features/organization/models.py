from typing import List, Optional
import uuid
from sqlalchemy import Boolean, ForeignKey, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.shared.base_model import GUID, OrgScopedModel


class WorkLocation(OrgScopedModel):
    """Work Location / Office branch within an organization."""
    __tablename__ = "work_locations"
    __table_args__ = (
        UniqueConstraint("organization_id", "code", name="uq_org_work_location_code"),
    )

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    code: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    address: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    city: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    state: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    country: Mapped[str] = mapped_column(String(100), default="India", nullable=False)
    postal_code: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # Relationships
    organization: Mapped["Organization"] = relationship(  # noqa: F821
        "Organization",
        back_populates="work_locations",
        lazy="joined",
    )
    employees: Mapped[List["Employee"]] = relationship(  # noqa: F821
        "Employee",
        back_populates="work_location",
        lazy="select",
    )


class Department(OrgScopedModel):
    """Department entity supporting hierarchical parent-child structure."""
    __tablename__ = "departments"
    __table_args__ = (
        UniqueConstraint("organization_id", "code", name="uq_org_department_code"),
    )

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    code: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    parent_department_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        GUID(),
        ForeignKey("departments.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    manager_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        GUID(),
        ForeignKey("employees.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # Relationships
    organization: Mapped["Organization"] = relationship(  # noqa: F821
        "Organization",
        back_populates="departments",
        lazy="joined",
    )
    parent_department: Mapped[Optional["Department"]] = relationship(
        "Department",
        remote_side="Department.id",
        back_populates="sub_departments",
        lazy="joined",
    )
    sub_departments: Mapped[List["Department"]] = relationship(
        "Department",
        back_populates="parent_department",
        lazy="select",
    )
    manager: Mapped[Optional["Employee"]] = relationship(  # noqa: F821
        "Employee",
        foreign_keys=[manager_id],
        lazy="joined",
        post_update=True,
    )
    designations: Mapped[List["Designation"]] = relationship(
        "Designation",
        back_populates="department",
        lazy="select",
    )
    employees: Mapped[List["Employee"]] = relationship(  # noqa: F821
        "Employee",
        foreign_keys="Employee.department_id",
        back_populates="department",
        lazy="select",
    )


class Designation(OrgScopedModel):
    """Designation / Job Role within an organization and optional department."""
    __tablename__ = "designations"
    __table_args__ = (
        UniqueConstraint("organization_id", "code", name="uq_org_designation_code"),
    )

    title: Mapped[str] = mapped_column(String(255), nullable=False)
    code: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    department_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        GUID(),
        ForeignKey("departments.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # Relationships
    organization: Mapped["Organization"] = relationship(  # noqa: F821
        "Organization",
        back_populates="designations",
        lazy="joined",
    )
    department: Mapped[Optional["Department"]] = relationship(
        "Department",
        back_populates="designations",
        lazy="joined",
    )
    employees: Mapped[List["Employee"]] = relationship(  # noqa: F821
        "Employee",
        foreign_keys="Employee.designation_id",
        back_populates="designation",
        lazy="select",
    )

