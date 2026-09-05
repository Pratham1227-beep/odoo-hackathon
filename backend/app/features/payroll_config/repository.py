from typing import Any, Dict, List, Optional, Sequence
import uuid
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.features.payroll_config.models import (
    EmployeeSalaryComponent,
    SalaryRule,
    SalaryStructure,
    SalaryStructureRule,
    SystemConfig,
)


class SalaryRuleRepository:

    @staticmethod
    async def get_by_id(db: AsyncSession, org_id: uuid.UUID, rule_id: uuid.UUID) -> Optional[SalaryRule]:
        stmt = select(SalaryRule).where(
            SalaryRule.organization_id == org_id,
            SalaryRule.id == rule_id,
        )
        return (await db.execute(stmt)).scalar_one_or_none()

    @staticmethod
    async def get_by_code(db: AsyncSession, org_id: uuid.UUID, code: str) -> Optional[SalaryRule]:
        stmt = select(SalaryRule).where(
            SalaryRule.organization_id == org_id,
            SalaryRule.code == code,
        )
        return (await db.execute(stmt)).scalar_one_or_none()

    @staticmethod
    async def list_rules(
        db: AsyncSession,
        org_id: uuid.UUID,
        is_active: Optional[bool] = None,
    ) -> Sequence[SalaryRule]:
        stmt = select(SalaryRule).where(SalaryRule.organization_id == org_id)
        if is_active is not None:
            stmt = stmt.where(SalaryRule.is_active == is_active)
        stmt = stmt.order_by(SalaryRule.sequence, SalaryRule.code)
        return (await db.execute(stmt)).scalars().all()

    @staticmethod
    async def create(db: AsyncSession, rule: SalaryRule) -> SalaryRule:
        db.add(rule)
        await db.commit()
        await db.refresh(rule)
        return rule

    @staticmethod
    async def update(db: AsyncSession, rule: SalaryRule, data: Dict[str, Any]) -> SalaryRule:
        for key, value in data.items():
            setattr(rule, key, value)
        await db.commit()
        await db.refresh(rule)
        return rule


class SalaryStructureRepository:

    @staticmethod
    async def get_by_id(
        db: AsyncSession,
        org_id: uuid.UUID,
        structure_id: uuid.UUID,
        include_rules: bool = True,
    ) -> Optional[SalaryStructure]:
        stmt = (
            select(SalaryStructure)
            .where(
                SalaryStructure.organization_id == org_id,
                SalaryStructure.id == structure_id,
            )
            .execution_options(populate_existing=True)
        )
        if include_rules:
            stmt = stmt.options(
                selectinload(SalaryStructure.structure_rules).selectinload(SalaryStructureRule.salary_rule)
            )
        return (await db.execute(stmt)).scalar_one_or_none()

    @staticmethod
    async def get_by_code(db: AsyncSession, org_id: uuid.UUID, code: str) -> Optional[SalaryStructure]:
        stmt = select(SalaryStructure).where(
            SalaryStructure.organization_id == org_id,
            SalaryStructure.code == code,
        )
        return (await db.execute(stmt)).scalar_one_or_none()

    @staticmethod
    async def list_structures(
        db: AsyncSession,
        org_id: uuid.UUID,
        is_active: Optional[bool] = None,
    ) -> Sequence[SalaryStructure]:
        stmt = select(SalaryStructure).where(SalaryStructure.organization_id == org_id)
        if is_active is not None:
            stmt = stmt.where(SalaryStructure.is_active == is_active)
        stmt = stmt.order_by(SalaryStructure.name)
        return (await db.execute(stmt)).scalars().all()

    @staticmethod
    async def create(db: AsyncSession, structure: SalaryStructure) -> SalaryStructure:
        db.add(structure)
        await db.commit()
        await db.refresh(structure)
        return structure

    @staticmethod
    async def update(db: AsyncSession, structure: SalaryStructure, data: Dict[str, Any]) -> SalaryStructure:
        for key, value in data.items():
            setattr(structure, key, value)
        await db.commit()
        await db.refresh(structure)
        return structure

    @staticmethod
    async def replace_structure_rules(
        db: AsyncSession,
        org_id: uuid.UUID,
        structure_id: uuid.UUID,
        rules_items: List[Dict[str, Any]],
    ) -> List[SalaryStructureRule]:
        # Delete existing mappings
        del_stmt = delete(SalaryStructureRule).where(
            SalaryStructureRule.salary_structure_id == structure_id
        )
        await db.execute(del_stmt)

        # Create new mappings
        new_mappings = []
        for item in rules_items:
            mapping = SalaryStructureRule(
                organization_id=org_id,
                salary_structure_id=structure_id,
                salary_rule_id=item["rule_id"],
                sequence=item.get("sequence", 1),
                is_active=item.get("is_active", True),
            )
            db.add(mapping)
            new_mappings.append(mapping)

        await db.commit()
        db.expire_all()
        return new_mappings


class SystemConfigRepository:

    @staticmethod
    async def get_by_category(
        db: AsyncSession,
        org_id: uuid.UUID,
        category: str = "payroll",
    ) -> Sequence[SystemConfig]:
        stmt = select(SystemConfig).where(
            SystemConfig.organization_id == org_id,
            SystemConfig.category == category,
        )
        return (await db.execute(stmt)).scalars().all()

    @staticmethod
    async def get_by_key(
        db: AsyncSession,
        org_id: uuid.UUID,
        key: str,
    ) -> Optional[SystemConfig]:
        stmt = select(SystemConfig).where(
            SystemConfig.organization_id == org_id,
            SystemConfig.key == key,
        )
        return (await db.execute(stmt)).scalar_one_or_none()

    @staticmethod
    async def upsert_key(
        db: AsyncSession,
        org_id: uuid.UUID,
        key: str,
        value: str,
        category: str = "payroll",
        description: Optional[str] = None,
        updated_by_id: Optional[uuid.UUID] = None,
    ) -> SystemConfig:
        stmt = select(SystemConfig).where(
            SystemConfig.organization_id == org_id,
            SystemConfig.key == key,
        )
        config = (await db.execute(stmt)).scalar_one_or_none()
        if config:
            config.value = value
            config.updated_by_id = updated_by_id
            if description is not None:
                config.description = description
        else:
            config = SystemConfig(
                organization_id=org_id,
                key=key,
                value=value,
                category=category,
                description=description,
                updated_by_id=updated_by_id,
            )
            db.add(config)
        await db.commit()
        await db.refresh(config)
        return config


class EmployeeSalaryComponentRepository:

    @staticmethod
    async def get_by_employee_id(
        db: AsyncSession,
        org_id: uuid.UUID,
        employee_id: uuid.UUID,
    ) -> Sequence[EmployeeSalaryComponent]:
        stmt = (
            select(EmployeeSalaryComponent)
            .where(
                EmployeeSalaryComponent.organization_id == org_id,
                EmployeeSalaryComponent.employee_id == employee_id,
            )
            .options(selectinload(EmployeeSalaryComponent.salary_rule))
            .order_by(EmployeeSalaryComponent.effective_from.desc())
        )
        return (await db.execute(stmt)).scalars().all()

    @staticmethod
    async def replace_components(
        db: AsyncSession,
        org_id: uuid.UUID,
        employee_id: uuid.UUID,
        components_data: List[Dict[str, Any]],
    ) -> Sequence[EmployeeSalaryComponent]:
        # Delete existing components for this employee
        del_stmt = delete(EmployeeSalaryComponent).where(
            EmployeeSalaryComponent.organization_id == org_id,
            EmployeeSalaryComponent.employee_id == employee_id,
        )
        await db.execute(del_stmt)

        created = []
        for item in components_data:
            comp = EmployeeSalaryComponent(
                organization_id=org_id,
                employee_id=employee_id,
                salary_rule_id=item["salary_rule_id"],
                value=item["value"],
                value_type=item["value_type"],
                effective_from=item["effective_from"],
                effective_to=item.get("effective_to"),
                is_active=item.get("is_active", True),
            )
            db.add(comp)
            created.append(comp)

        await db.commit()
        return await EmployeeSalaryComponentRepository.get_by_employee_id(db, org_id, employee_id)
