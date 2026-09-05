from datetime import date, datetime
from decimal import Decimal
from typing import Any, Dict, List, Optional
import uuid
from pydantic import ConfigDict, Field, model_validator

from app.shared.base_schema import BaseSchema, IDSchema, TimestampSchema
from app.shared.enums import (
    CalculationType,
    SalaryComponentValueType,
    SalaryRuleCategory,
)


# ==========================================
# Salary Rule Schemas
# ==========================================

class SalaryRuleBase(BaseSchema):
    name: str = Field(..., min_length=1, max_length=100, description="Salary rule display name")
    code: str = Field(..., min_length=1, max_length=50, description="Unique code for formulas e.g. BASIC")
    category: SalaryRuleCategory = Field(..., description="BASIC, ALLOWANCE, GROSS, DEDUCTION, NET")
    calculation_type: CalculationType = Field(..., description="FIXED, PERCENTAGE, FORMULA")
    fixed_amount: Optional[Decimal] = Field(None, ge=0, description="Required if calculation_type is FIXED")
    percentage: Optional[Decimal] = Field(None, ge=0, le=100, description="Required if calculation_type is PERCENTAGE")
    percentage_base: Optional[str] = Field(None, max_length=50, description="Rule code to which percentage applies")
    formula: Optional[str] = Field(None, description="Plain text formula string e.g. BASIC * 0.5")
    sequence: int = Field(1, ge=0, description="Evaluation sequence")
    taxable: bool = Field(True, description="Whether this component is taxable")
    is_statutory: bool = Field(False, description="Whether this rule is a statutory deduction/contribution")
    is_active: bool = Field(True, description="Whether this rule is active")


class SalaryRuleCreate(SalaryRuleBase):
    @model_validator(mode="after")
    def validate_calculation_pairing(self):
        if self.calculation_type == CalculationType.FIXED:
            if self.fixed_amount is None:
                raise ValueError("fixed_amount is required when calculation_type is FIXED")
        elif self.calculation_type == CalculationType.PERCENTAGE:
            if self.percentage is None:
                raise ValueError("percentage is required when calculation_type is PERCENTAGE")
            if not self.percentage_base or not self.percentage_base.strip():
                raise ValueError("percentage_base rule code is required when calculation_type is PERCENTAGE")
        elif self.calculation_type == CalculationType.FORMULA:
            if not self.formula or not self.formula.strip():
                raise ValueError("formula is required when calculation_type is FORMULA")
        return self


class SalaryRuleUpdate(BaseSchema):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    code: Optional[str] = Field(None, min_length=1, max_length=50)
    category: Optional[SalaryRuleCategory] = None
    calculation_type: Optional[CalculationType] = None
    fixed_amount: Optional[Decimal] = Field(None, ge=0)
    percentage: Optional[Decimal] = Field(None, ge=0, le=100)
    percentage_base: Optional[str] = Field(None, max_length=50)
    formula: Optional[str] = None
    sequence: Optional[int] = Field(None, ge=0)
    taxable: Optional[bool] = None
    is_statutory: Optional[bool] = None
    is_active: Optional[bool] = None


class SalaryRuleResponse(SalaryRuleBase, IDSchema, TimestampSchema):
    organization_id: uuid.UUID


# ==========================================
# Salary Structure Rule & Structure Schemas
# ==========================================

class SalaryStructureRuleItem(BaseSchema):
    rule_id: uuid.UUID = Field(..., description="Salary Rule UUID")
    sequence: int = Field(1, ge=0, description="Per-structure sequence override")
    is_active: bool = Field(True, description="Active status in this structure")


class SalaryStructureRulesUpdate(BaseSchema):
    rules: List[SalaryStructureRuleItem] = Field(..., description="Complete replacement ordered rule set")


class SalaryStructureRuleResponse(BaseSchema):
    id: uuid.UUID
    salary_structure_id: uuid.UUID
    salary_rule_id: uuid.UUID
    sequence: int
    is_active: bool
    salary_rule: Optional[SalaryRuleResponse] = None


class SalaryStructureBase(BaseSchema):
    name: str = Field(..., min_length=1, max_length=100, description="Structure name e.g. Regular Salary")
    code: str = Field(..., min_length=1, max_length=50, description="Structure code")
    description: Optional[str] = Field(None, description="Optional description")
    is_default: bool = Field(False, description="Default structure flag")
    is_active: bool = Field(True, description="Active status")


class SalaryStructureCreate(SalaryStructureBase):
    pass


class SalaryStructureUpdate(BaseSchema):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    code: Optional[str] = Field(None, min_length=1, max_length=50)
    description: Optional[str] = None
    is_default: Optional[bool] = None
    is_active: Optional[bool] = None


class SalaryStructureResponse(SalaryStructureBase, IDSchema, TimestampSchema):
    organization_id: uuid.UUID


class SalaryStructureDetailResponse(SalaryStructureResponse):
    rules: List[SalaryStructureRuleResponse] = Field(default_factory=list)


# ==========================================
# Company Payroll Configuration Schemas
# ==========================================

class CompanyPayrollConfigResponse(BaseSchema):
    pf_enabled: bool = Field(True, description="Provident Fund deduction enabled")
    pf_employee_percentage: Decimal = Field(Decimal("12.00"), description="PF Employee contribution percentage")
    pf_employer_percentage: Decimal = Field(Decimal("12.00"), description="PF Employer contribution percentage")
    esi_enabled: bool = Field(True, description="ESI enabled")
    esi_percentage: Decimal = Field(Decimal("0.75"), description="ESI employee contribution percentage")
    professional_tax_enabled: bool = Field(True, description="Professional Tax enabled")
    tds_enabled: bool = Field(True, description="TDS (Income Tax) deduction enabled")
    default_pay_day: int = Field(30, ge=1, le=31, description="Day of month for payroll processing")
    additional_settings: Dict[str, Any] = Field(default_factory=dict)
    updated_at: Optional[datetime] = None
    updated_by_id: Optional[uuid.UUID] = None


class CompanyPayrollConfigUpdate(BaseSchema):
    pf_enabled: Optional[bool] = None
    pf_employee_percentage: Optional[Decimal] = Field(None, ge=0, le=100)
    pf_employer_percentage: Optional[Decimal] = Field(None, ge=0, le=100)
    esi_enabled: Optional[bool] = None
    esi_percentage: Optional[Decimal] = Field(None, ge=0, le=100)
    professional_tax_enabled: Optional[bool] = None
    tds_enabled: Optional[bool] = None
    default_pay_day: Optional[int] = Field(None, ge=1, le=31)
    additional_settings: Optional[Dict[str, str]] = None


# ==========================================
# Employee Salary Component Schemas
# ==========================================

class EmployeeSalaryComponentItem(BaseSchema):
    salary_rule_id: uuid.UUID
    value: Decimal = Field(..., ge=0, description="Fixed amount or percentage value")
    value_type: SalaryComponentValueType = Field(SalaryComponentValueType.FIXED, description="FIXED or PERCENTAGE")
    effective_from: date = Field(..., description="Effective start date")
    effective_to: Optional[date] = Field(None, description="Optional effective end date")
    is_active: bool = Field(True, description="Active status")


class EmployeeSalaryComponentBulkUpdate(BaseSchema):
    components: List[EmployeeSalaryComponentItem] = Field(..., description="Array of employee salary components")


class EmployeeSalaryComponentResponse(IDSchema, TimestampSchema):
    organization_id: uuid.UUID
    employee_id: uuid.UUID
    salary_rule_id: uuid.UUID
    rule_name: Optional[str] = None
    rule_code: Optional[str] = None
    rule_category: Optional[SalaryRuleCategory] = None
    value: Decimal
    value_type: SalaryComponentValueType
    effective_from: date
    effective_to: Optional[date] = None
    is_active: bool
