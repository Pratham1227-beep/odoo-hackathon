from datetime import date
from decimal import Decimal
from typing import Optional
import uuid
from sqlalchemy import (
    Date,
    Enum as SAEnum,
    ForeignKey,
    Numeric,
    String,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.shared.base_model import GUID, OrgScopedModel
from app.shared.enums import ContractStatus, ContractType, WageType


class Contract(OrgScopedModel):
    """Employee Employment and Compensation Contract scoped strictly per organization."""
    __tablename__ = "contracts"
    __table_args__ = (
        UniqueConstraint("organization_id", "contract_number", name="uq_org_contract_number"),
    )

    employee_id: Mapped[uuid.UUID] = mapped_column(
        GUID(),
        ForeignKey("employees.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    working_schedule_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        GUID(),
        nullable=True,
        index=True,
    )
    salary_structure_id: Mapped[uuid.UUID] = mapped_column(
        GUID(),
        ForeignKey("salary_structures.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    contract_number: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    contract_type: Mapped[ContractType] = mapped_column(
        SAEnum(ContractType, name="contract_type_enum", native_enum=False),
        default=ContractType.PERMANENT,
        nullable=False,
    )
    start_date: Mapped[date] = mapped_column(Date, nullable=False)
    end_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    base_wage: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    wage_type: Mapped[WageType] = mapped_column(
        SAEnum(WageType, name="wage_type_enum", native_enum=False),
        default=WageType.MONTHLY,
        nullable=False,
    )
    status: Mapped[ContractStatus] = mapped_column(
        SAEnum(ContractStatus, name="contract_status_enum", native_enum=False),
        default=ContractStatus.DRAFT,
        nullable=False,
    )

    # Relationships
    employee: Mapped["Employee"] = relationship(  # noqa: F821
        "Employee",
        lazy="joined",
    )
    salary_structure: Mapped["SalaryStructure"] = relationship(  # noqa: F821
        "SalaryStructure",
        back_populates="contracts",
        lazy="joined",
    )
