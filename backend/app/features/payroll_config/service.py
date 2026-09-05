from decimal import Decimal
import re
from typing import Any, Dict, List, Optional, Set
import uuid
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import ConflictError, NotFoundError, ValidationError
from app.features.auth.models import User
from app.features.employees.models import Employee
from app.features.payroll_config.models import (
    EmployeeSalaryComponent,
    SalaryRule,
    SalaryStructure,
    SalaryStructureRule,
    SystemConfig,
)
from app.features.payroll_config.repository import (
    EmployeeSalaryComponentRepository,
    SalaryRuleRepository,
    SalaryStructureRepository,
    SystemConfigRepository,
)
from app.features.payroll_config.schemas import (
    CompanyPayrollConfigResponse,
    CompanyPayrollConfigUpdate,
    EmployeeSalaryComponentBulkUpdate,
    EmployeeSalaryComponentItem,
    EmployeeSalaryComponentResponse,
    SalaryRuleCreate,
    SalaryRuleResponse,
    SalaryRuleUpdate,
    SalaryStructureCreate,
    SalaryStructureDetailResponse,
    SalaryStructureResponse,
    SalaryStructureRuleResponse,
    SalaryStructureRulesUpdate,
    SalaryStructureUpdate,
)
from app.shared.enums import (
    CalculationType,
    SalaryComponentValueType,
    SalaryRuleCategory,
)

DEFAULT_PAYROLL_CONFIG: Dict[str, str] = {
    "pf_enabled": "true",
    "pf_employee_percentage": "12.00",
    "pf_employer_percentage": "12.00",
    "esi_enabled": "true",
    "esi_percentage": "0.75",
    "professional_tax_enabled": "true",
    "tds_enabled": "true",
    "default_pay_day": "30",
}

MATH_IDENTIFIERS: Set[str] = {
    "min", "max", "round", "abs", "ceil", "floor", "sum", "if", "else", "then", "and", "or", "not"
}


class SalaryRuleService:

    @classmethod
    async def _validate_rule_pairing(
        cls,
        db: AsyncSession,
        org_id: uuid.UUID,
        calculation_type: CalculationType,
        fixed_amount: Optional[Decimal],
        percentage: Optional[Decimal],
        percentage_base: Optional[str],
        formula: Optional[str],
        current_rule_code: Optional[str] = None,
    ) -> None:
        if calculation_type == CalculationType.FIXED:
            if fixed_amount is None:
                raise ValidationError("fixed_amount is required when calculation_type is FIXED")

        elif calculation_type == CalculationType.PERCENTAGE:
            if percentage is None:
                raise ValidationError("percentage is required when calculation_type is PERCENTAGE")
            if not percentage_base or not percentage_base.strip():
                raise ValidationError("percentage_base rule code is required when calculation_type is PERCENTAGE")

            # Validate that percentage_base exists in the organization
            base_rule = await SalaryRuleRepository.get_by_code(db, org_id, percentage_base.strip())
            if not base_rule:
                raise ValidationError(f"Referenced percentage_base rule '{percentage_base}' does not exist")

        elif calculation_type == CalculationType.FORMULA:
            if not formula or not formula.strip():
                raise ValidationError("formula string is required when calculation_type is FORMULA")

            # Extract variable identifiers from formula e.g. "BASIC * 0.5 + HRA"
            tokens = re.findall(r"[A-Za-z_][A-Za-z0-9_]*", formula)
            existing_rules = await SalaryRuleRepository.list_rules(db, org_id)
            existing_codes = {r.code for r in existing_rules}
            if current_rule_code:
                existing_codes.add(current_rule_code)

            for token in tokens:
                if token.lower() in MATH_IDENTIFIERS:
                    continue
                if token not in existing_codes:
                    raise ValidationError(
                        f"Formula references unknown rule code '{token}'. Ensure all referenced rules exist in the organization."
                    )

    @classmethod
    async def create_rule(
        cls,
        db: AsyncSession,
        org_id: uuid.UUID,
        payload: SalaryRuleCreate,
        current_user: Optional[User] = None,
    ) -> SalaryRuleResponse:

        existing = await SalaryRuleRepository.get_by_code(db, org_id, payload.code)
        if existing:
            raise ConflictError(f"Salary rule with code '{payload.code}' already exists")

        await cls._validate_rule_pairing(
            db,
            org_id,
            calculation_type=payload.calculation_type,
            fixed_amount=payload.fixed_amount,
            percentage=payload.percentage,
            percentage_base=payload.percentage_base,
            formula=payload.formula,
            current_rule_code=payload.code,
        )

        rule = SalaryRule(
            organization_id=org_id,
            name=payload.name,
            code=payload.code,
            category=payload.category,
            calculation_type=payload.calculation_type,
            fixed_amount=payload.fixed_amount,
            percentage=payload.percentage,
            percentage_base=payload.percentage_base,
            formula=payload.formula,
            sequence=payload.sequence,
            taxable=payload.taxable,
            is_statutory=payload.is_statutory,
            is_active=payload.is_active,
        )
        created = await SalaryRuleRepository.create(db, rule)

        from app.core.audit import log_audit
        await log_audit(
            db=db,
            user=current_user,
            action="CREATE",
            module="SALARY_CONFIG",
            resource_type="SalaryRule",
            resource_id=created.id,
            after={"code": created.code, "name": created.name, "category": created.category.value if hasattr(created.category, "value") else str(created.category)},
            org_id=org_id,
        )

        return SalaryRuleResponse.model_validate(created)

    @classmethod
    async def list_rules(
        cls,
        db: AsyncSession,
        org_id: uuid.UUID,
        is_active: Optional[bool] = None,
    ) -> List[SalaryRuleResponse]:
        rules = await SalaryRuleRepository.list_rules(db, org_id, is_active=is_active)
        return [SalaryRuleResponse.model_validate(r) for r in rules]

    @classmethod
    async def get_rule_by_id(
        cls,
        db: AsyncSession,
        org_id: uuid.UUID,
        rule_id: uuid.UUID,
    ) -> SalaryRuleResponse:
        rule = await SalaryRuleRepository.get_by_id(db, org_id, rule_id)
        if not rule:
            raise NotFoundError(f"Salary rule with ID '{rule_id}' not found")
        return SalaryRuleResponse.model_validate(rule)

    @classmethod
    async def update_rule(
        cls,
        db: AsyncSession,
        org_id: uuid.UUID,
        rule_id: uuid.UUID,
        payload: SalaryRuleUpdate,
        current_user: Optional[User] = None,
    ) -> SalaryRuleResponse:
        rule = await SalaryRuleRepository.get_by_id(db, org_id, rule_id)
        if not rule:
            raise NotFoundError(f"Salary rule with ID '{rule_id}' not found")

        old_state = {"code": rule.code, "name": rule.name, "category": rule.category.value if hasattr(rule.category, "value") else str(rule.category)}
        update_dict = payload.model_dump(exclude_unset=True)
        if "code" in update_dict and update_dict["code"] != rule.code:
            existing = await SalaryRuleRepository.get_by_code(db, org_id, update_dict["code"])
            if existing and existing.id != rule.id:
                raise ConflictError(f"Salary rule with code '{update_dict['code']}' already exists")

        # Check merged values for validation
        new_calc_type = update_dict.get("calculation_type", rule.calculation_type)
        new_fixed = update_dict.get("fixed_amount", rule.fixed_amount)
        new_percentage = update_dict.get("percentage", rule.percentage)
        new_base = update_dict.get("percentage_base", rule.percentage_base)
        new_formula = update_dict.get("formula", rule.formula)
        rule_code = update_dict.get("code", rule.code)

        await cls._validate_rule_pairing(
            db,
            org_id,
            calculation_type=new_calc_type,
            fixed_amount=new_fixed,
            percentage=new_percentage,
            percentage_base=new_base,
            formula=new_formula,
            current_rule_code=rule_code,
        )

        updated = await SalaryRuleRepository.update(db, rule, update_dict)

        from app.core.audit import log_audit
        await log_audit(
            db=db,
            user=current_user,
            action="UPDATE",
            module="SALARY_CONFIG",
            resource_type="SalaryRule",
            resource_id=updated.id,
            before=old_state,
            after={"code": updated.code, "name": updated.name, "category": updated.category.value if hasattr(updated.category, "value") else str(updated.category)},
            org_id=org_id,
        )

        return SalaryRuleResponse.model_validate(updated)



class SalaryStructureService:

    @classmethod
    async def create_structure(
        cls,
        db: AsyncSession,
        org_id: uuid.UUID,
        payload: SalaryStructureCreate,
    ) -> SalaryStructureResponse:
        existing = await SalaryStructureRepository.get_by_code(db, org_id, payload.code)
        if existing:
            raise ConflictError(f"Salary structure with code '{payload.code}' already exists")

        structure = SalaryStructure(
            organization_id=org_id,
            name=payload.name,
            code=payload.code,
            description=payload.description,
            is_default=payload.is_default,
            is_active=payload.is_active,
        )
        created = await SalaryStructureRepository.create(db, structure)
        return SalaryStructureResponse.model_validate(created)

    @classmethod
    async def list_structures(
        cls,
        db: AsyncSession,
        org_id: uuid.UUID,
        is_active: Optional[bool] = None,
    ) -> List[SalaryStructureResponse]:
        structures = await SalaryStructureRepository.list_structures(db, org_id, is_active=is_active)
        return [SalaryStructureResponse.model_validate(s) for s in structures]

    @classmethod
    async def get_structure_detail(
        cls,
        db: AsyncSession,
        org_id: uuid.UUID,
        structure_id: uuid.UUID,
    ) -> SalaryStructureDetailResponse:
        structure = await SalaryStructureRepository.get_by_id(db, org_id, structure_id, include_rules=True)
        if not structure:
            raise NotFoundError(f"Salary structure with ID '{structure_id}' not found")

        rule_responses = []
        for sr in structure.structure_rules:
            rule_responses.append(
                SalaryStructureRuleResponse(
                    id=sr.id,
                    salary_structure_id=sr.salary_structure_id,
                    salary_rule_id=sr.salary_rule_id,
                    sequence=sr.sequence,
                    is_active=sr.is_active,
                    salary_rule=SalaryRuleResponse.model_validate(sr.salary_rule) if sr.salary_rule else None,
                )
            )

        resp = SalaryStructureDetailResponse.model_validate(structure)
        resp.rules = rule_responses
        return resp

    @classmethod
    async def update_structure(
        cls,
        db: AsyncSession,
        org_id: uuid.UUID,
        structure_id: uuid.UUID,
        payload: SalaryStructureUpdate,
    ) -> SalaryStructureResponse:
        structure = await SalaryStructureRepository.get_by_id(db, org_id, structure_id, include_rules=False)
        if not structure:
            raise NotFoundError(f"Salary structure with ID '{structure_id}' not found")

        update_dict = payload.model_dump(exclude_unset=True)
        if "code" in update_dict and update_dict["code"] != structure.code:
            existing = await SalaryStructureRepository.get_by_code(db, org_id, update_dict["code"])
            if existing and existing.id != structure.id:
                raise ConflictError(f"Salary structure with code '{update_dict['code']}' already exists")

        updated = await SalaryStructureRepository.update(db, structure, update_dict)
        return SalaryStructureResponse.model_validate(updated)

    @classmethod
    async def replace_structure_rules(
        cls,
        db: AsyncSession,
        org_id: uuid.UUID,
        structure_id: uuid.UUID,
        payload: SalaryStructureRulesUpdate,
    ) -> SalaryStructureDetailResponse:
        structure = await SalaryStructureRepository.get_by_id(db, org_id, structure_id, include_rules=False)
        if not structure:
            raise NotFoundError(f"Salary structure with ID '{structure_id}' not found")

        # Validate that all rule_ids exist in this organization
        rule_items = [r.model_dump() for r in payload.rules]
        for item in rule_items:
            rule = await SalaryRuleRepository.get_by_id(db, org_id, item["rule_id"])
            if not rule:
                raise NotFoundError(f"Salary rule with ID '{item['rule_id']}' not found in organization")

        await SalaryStructureRepository.replace_structure_rules(db, org_id, structure_id, rule_items)
        return await cls.get_structure_detail(db, org_id, structure_id)


class PayrollConfigService:

    @classmethod
    async def get_company_payroll_config(
        cls,
        db: AsyncSession,
        org_id: uuid.UUID,
    ) -> CompanyPayrollConfigResponse:
        configs = await SystemConfigRepository.get_by_category(db, org_id, category="payroll")
        kv_map = {c.key: c.value for c in configs}

        latest_updated_at = max([c.updated_at for c in configs], default=None) if configs else None
        latest_updated_by = configs[0].updated_by_id if configs else None

        def get_bool(key: str, default: str) -> bool:
            return kv_map.get(key, default).lower() in ("true", "1", "t", "yes")

        def get_decimal(key: str, default: str) -> Decimal:
            try:
                return Decimal(kv_map.get(key, default))
            except Exception:
                return Decimal(default)

        def get_int(key: str, default: str) -> int:
            try:
                return int(kv_map.get(key, default))
            except Exception:
                return int(default)

        additional = {
            k: v for k, v in kv_map.items()
            if k not in DEFAULT_PAYROLL_CONFIG
        }

        return CompanyPayrollConfigResponse(
            pf_enabled=get_bool("pf_enabled", DEFAULT_PAYROLL_CONFIG["pf_enabled"]),
            pf_employee_percentage=get_decimal("pf_employee_percentage", DEFAULT_PAYROLL_CONFIG["pf_employee_percentage"]),
            pf_employer_percentage=get_decimal("pf_employer_percentage", DEFAULT_PAYROLL_CONFIG["pf_employer_percentage"]),
            esi_enabled=get_bool("esi_enabled", DEFAULT_PAYROLL_CONFIG["esi_enabled"]),
            esi_percentage=get_decimal("esi_percentage", DEFAULT_PAYROLL_CONFIG["esi_percentage"]),
            professional_tax_enabled=get_bool("professional_tax_enabled", DEFAULT_PAYROLL_CONFIG["professional_tax_enabled"]),
            tds_enabled=get_bool("tds_enabled", DEFAULT_PAYROLL_CONFIG["tds_enabled"]),
            default_pay_day=get_int("default_pay_day", DEFAULT_PAYROLL_CONFIG["default_pay_day"]),
            additional_settings=additional,
            updated_at=latest_updated_at,
            updated_by_id=latest_updated_by,
        )

    @classmethod
    async def update_company_payroll_config(
        cls,
        db: AsyncSession,
        org_id: uuid.UUID,
        payload: CompanyPayrollConfigUpdate,
        updated_by_id: Optional[uuid.UUID] = None,
    ) -> CompanyPayrollConfigResponse:
        fields = payload.model_dump(exclude_unset=True)

        if "pf_enabled" in fields and fields["pf_enabled"] is not None:
            await SystemConfigRepository.upsert_key(
                db, org_id, "pf_enabled", str(fields["pf_enabled"]).lower(), category="payroll", updated_by_id=updated_by_id
            )
        if "pf_employee_percentage" in fields and fields["pf_employee_percentage"] is not None:
            await SystemConfigRepository.upsert_key(
                db, org_id, "pf_employee_percentage", str(fields["pf_employee_percentage"]), category="payroll", updated_by_id=updated_by_id
            )
        if "pf_employer_percentage" in fields and fields["pf_employer_percentage"] is not None:
            await SystemConfigRepository.upsert_key(
                db, org_id, "pf_employer_percentage", str(fields["pf_employer_percentage"]), category="payroll", updated_by_id=updated_by_id
            )
        if "esi_enabled" in fields and fields["esi_enabled"] is not None:
            await SystemConfigRepository.upsert_key(
                db, org_id, "esi_enabled", str(fields["esi_enabled"]).lower(), category="payroll", updated_by_id=updated_by_id
            )
        if "esi_percentage" in fields and fields["esi_percentage"] is not None:
            await SystemConfigRepository.upsert_key(
                db, org_id, "esi_percentage", str(fields["esi_percentage"]), category="payroll", updated_by_id=updated_by_id
            )
        if "professional_tax_enabled" in fields and fields["professional_tax_enabled"] is not None:
            await SystemConfigRepository.upsert_key(
                db, org_id, "professional_tax_enabled", str(fields["professional_tax_enabled"]).lower(), category="payroll", updated_by_id=updated_by_id
            )
        if "tds_enabled" in fields and fields["tds_enabled"] is not None:
            await SystemConfigRepository.upsert_key(
                db, org_id, "tds_enabled", str(fields["tds_enabled"]).lower(), category="payroll", updated_by_id=updated_by_id
            )
        if "default_pay_day" in fields and fields["default_pay_day"] is not None:
            await SystemConfigRepository.upsert_key(
                db, org_id, "default_pay_day", str(fields["default_pay_day"]), category="payroll", updated_by_id=updated_by_id
            )
        if "additional_settings" in fields and fields["additional_settings"]:
            for k, v in fields["additional_settings"].items():
                await SystemConfigRepository.upsert_key(
                    db, org_id, k, str(v), category="payroll", updated_by_id=updated_by_id
                )

        return await cls.get_company_payroll_config(db, org_id)


class EmployeeSalaryComponentService:

    @classmethod
    async def _resolve_employee(
        cls,
        db: AsyncSession,
        org_id: uuid.UUID,
        user_or_employee_id: uuid.UUID,
    ) -> Employee:
        stmt = select(Employee).where(
            Employee.organization_id == org_id,
            (Employee.user_id == user_or_employee_id) | (Employee.id == user_or_employee_id),
        )
        emp = (await db.execute(stmt)).scalar_one_or_none()
        if not emp:
            raise NotFoundError(f"Employee profile for user/employee ID '{user_or_employee_id}' not found")
        return emp

    @classmethod
    async def get_employee_salary_components(
        cls,
        db: AsyncSession,
        org_id: uuid.UUID,
        user_or_employee_id: uuid.UUID,
    ) -> List[EmployeeSalaryComponentResponse]:
        emp = await cls._resolve_employee(db, org_id, user_or_employee_id)
        comps = await EmployeeSalaryComponentRepository.get_by_employee_id(db, org_id, emp.id)

        responses = []
        for c in comps:
            responses.append(
                EmployeeSalaryComponentResponse(
                    id=c.id,
                    organization_id=c.organization_id,
                    employee_id=c.employee_id,
                    salary_rule_id=c.salary_rule_id,
                    rule_name=c.salary_rule.name if c.salary_rule else None,
                    rule_code=c.salary_rule.code if c.salary_rule else None,
                    rule_category=c.salary_rule.category if c.salary_rule else None,
                    value=c.value,
                    value_type=c.value_type,
                    effective_from=c.effective_from,
                    effective_to=c.effective_to,
                    is_active=c.is_active,
                    created_at=c.created_at,
                    updated_at=c.updated_at,
                )
            )
        return responses

    @classmethod
    async def update_employee_salary_components(
        cls,
        db: AsyncSession,
        org_id: uuid.UUID,
        user_or_employee_id: uuid.UUID,
        payload: EmployeeSalaryComponentBulkUpdate,
    ) -> List[EmployeeSalaryComponentResponse]:
        emp = await cls._resolve_employee(db, org_id, user_or_employee_id)

        # Validate that all salary_rule_ids belong to the organization
        items_data = [item.model_dump() for item in payload.components]
        for item in items_data:
            rule = await SalaryRuleRepository.get_by_id(db, org_id, item["salary_rule_id"])
            if not rule:
                raise NotFoundError(f"Salary rule with ID '{item['salary_rule_id']}' not found in organization")

        await EmployeeSalaryComponentRepository.replace_components(db, org_id, emp.id, items_data)
        return await cls.get_employee_salary_components(db, org_id, emp.id)
