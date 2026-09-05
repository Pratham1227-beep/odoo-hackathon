from datetime import date
from decimal import Decimal
from typing import List, Optional
import uuid
from sqlalchemy import (
    Boolean,
    Date,
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
    CalculationType,
    SalaryComponentValueType,
    SalaryRuleCategory,
)


class SystemConfig(OrgScopedModel):
    """Generic tenant key-value store for organization settings (e.g. payroll statutory settings)."""
    __tablename__ = "system_configs"
    __table_args__ = (
        UniqueConstraint("organization_id", "key", name="uq_org_system_config_key"),
    )

    key: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    value: Mapped[str] = mapped_column(Text, nullable=False)
    category: Mapped[str] = mapped_column(String(50), default="payroll", nullable=False, index=True)
    description: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    updated_by_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        GUID(),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    # Relationships
    updated_by: Mapped[Optional["User"]] = relationship(  # noqa: F821
        "User",
        lazy="joined",
    )


class SalaryRule(OrgScopedModel):
    """Component salary rule defining allowances, deductions, and statutory calculations."""
    __tablename__ = "salary_rules"
    __table_args__ = (
        UniqueConstraint("organization_id", "code", name="uq_org_salary_rule_code"),
    )

    name: Mapped[str] = mapped_column(String(100), nullable=False)
    code: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    category: Mapped[SalaryRuleCategory] = mapped_column(
        SAEnum(SalaryRuleCategory, name="salary_rule_category_enum", native_enum=False),
        nullable=False,
    )
    calculation_type: Mapped[CalculationType] = mapped_column(
        SAEnum(CalculationType, name="salary_rule_calc_type_enum", native_enum=False),
        nullable=False,
    )
    fixed_amount: Mapped[Optional[Decimal]] = mapped_column(Numeric(12, 2), nullable=True)
    percentage: Mapped[Optional[Decimal]] = mapped_column(Numeric(5, 2), nullable=True)
    percentage_base: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    formula: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    sequence: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    taxable: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_statutory: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # Relationships
    structure_rules: Mapped[List["SalaryStructureRule"]] = relationship(
        "SalaryStructureRule",
        back_populates="salary_rule",
        cascade="all, delete-orphan",
        lazy="selectin",
    )
    employee_components: Mapped[List["EmployeeSalaryComponent"]] = relationship(
        "EmployeeSalaryComponent",
        back_populates="salary_rule",
        cascade="all, delete-orphan",
        lazy="selectin",
    )


class SalaryStructure(OrgScopedModel):
    """Salary Structure bundling an ordered set of salary rules for contracts."""
    __tablename__ = "salary_structures"
    __table_args__ = (
        UniqueConstraint("organization_id", "code", name="uq_org_salary_structure_code"),
    )

    name: Mapped[str] = mapped_column(String(100), nullable=False)
    code: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    is_default: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # Relationships
    structure_rules: Mapped[List["SalaryStructureRule"]] = relationship(
        "SalaryStructureRule",
        back_populates="salary_structure",
        order_by="SalaryStructureRule.sequence",
        cascade="all, delete-orphan",
        lazy="selectin",
    )
    contracts: Mapped[List["Contract"]] = relationship(  # noqa: F821
        "Contract",
        back_populates="salary_structure",
        lazy="selectin",
    )


class SalaryStructureRule(OrgScopedModel):
    """Ordered mapping of Salary Rules assigned to a Salary Structure."""
    __tablename__ = "salary_structure_rules"
    __table_args__ = (
        UniqueConstraint("salary_structure_id", "salary_rule_id", name="uq_structure_rule"),
    )

    salary_structure_id: Mapped[uuid.UUID] = mapped_column(
        GUID(),
        ForeignKey("salary_structures.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    salary_rule_id: Mapped[uuid.UUID] = mapped_column(
        GUID(),
        ForeignKey("salary_rules.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    sequence: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # Relationships
    salary_structure: Mapped["SalaryStructure"] = relationship(
        "SalaryStructure",
        back_populates="structure_rules",
        lazy="joined",
    )
    salary_rule: Mapped["SalaryRule"] = relationship(
        "SalaryRule",
        back_populates="structure_rules",
        lazy="joined",
    )


class EmployeeSalaryComponent(OrgScopedModel):
    """Per-employee salary component overrides or additions."""
    __tablename__ = "employee_salary_components"

    employee_id: Mapped[uuid.UUID] = mapped_column(
        GUID(),
        ForeignKey("employees.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    salary_rule_id: Mapped[uuid.UUID] = mapped_column(
        GUID(),
        ForeignKey("salary_rules.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    value: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    value_type: Mapped[SalaryComponentValueType] = mapped_column(
        SAEnum(SalaryComponentValueType, name="salary_comp_val_type_enum", native_enum=False),
        nullable=False,
    )
    effective_from: Mapped[date] = mapped_column(Date, nullable=False)
    effective_to: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # Relationships
    employee: Mapped["Employee"] = relationship(  # noqa: F821
        "Employee",
        lazy="joined",
    )
    salary_rule: Mapped["SalaryRule"] = relationship(
        "SalaryRule",
        back_populates="employee_components",
        lazy="joined",
    )
