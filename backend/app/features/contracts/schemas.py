from datetime import date, datetime
from decimal import Decimal
from typing import Optional
import uuid
from pydantic import Field

from app.shared.base_schema import BaseSchema, IDSchema, TimestampSchema
from app.shared.enums import ContractStatus, ContractType, WageType


class ContractBase(BaseSchema):
    employee_id: uuid.UUID = Field(..., description="Employee UUID")
    working_schedule_id: Optional[uuid.UUID] = Field(None, description="Optional working schedule override UUID")
    salary_structure_id: uuid.UUID = Field(..., description="Salary Structure UUID")
    contract_number: Optional[str] = Field(None, max_length=50, description="Unique contract identifier code e.g. CNT-0001")
    contract_type: ContractType = Field(ContractType.PERMANENT, description="PERMANENT, FIXED_TERM, PROBATION, CONTRACTOR")
    start_date: date = Field(..., description="Contract start date")
    end_date: Optional[date] = Field(None, description="Contract end date (null for open-ended)")
    base_wage: Decimal = Field(..., ge=0, description="Base salary / wage amount")
    wage_type: WageType = Field(WageType.MONTHLY, description="MONTHLY, DAILY, HOURLY")
    status: ContractStatus = Field(ContractStatus.DRAFT, description="DRAFT, ACTIVE, EXPIRED, TERMINATED")


class ContractCreate(ContractBase):
    pass


class ContractUpdate(BaseSchema):
    employee_id: Optional[uuid.UUID] = None
    working_schedule_id: Optional[uuid.UUID] = None
    salary_structure_id: Optional[uuid.UUID] = None
    contract_number: Optional[str] = Field(None, max_length=50)
    contract_type: Optional[ContractType] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    base_wage: Optional[Decimal] = Field(None, ge=0)
    wage_type: Optional[WageType] = None
    status: Optional[ContractStatus] = None


class ContractResponse(IDSchema, TimestampSchema):
    organization_id: uuid.UUID
    employee_id: uuid.UUID
    working_schedule_id: Optional[uuid.UUID] = None
    salary_structure_id: uuid.UUID
    contract_number: str
    contract_type: ContractType
    start_date: date
    end_date: Optional[date] = None
    base_wage: Decimal
    wage_type: WageType
    status: ContractStatus
    employee_name: Optional[str] = None
    employee_code: Optional[str] = None
    salary_structure_name: Optional[str] = None


class ContractDetailResponse(ContractResponse):
    pass
