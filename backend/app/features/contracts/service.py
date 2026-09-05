from datetime import date
from typing import List, Optional
import uuid
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import ConflictError, NotFoundError, ValidationError
from app.features.contracts.models import Contract
from app.features.contracts.repository import ContractRepository
from app.features.contracts.schemas import (
    ContractCreate,
    ContractDetailResponse,
    ContractResponse,
    ContractUpdate,
)
from app.features.employees.models import Employee
from app.features.payroll_config.models import SalaryStructure
from app.shared.enums import ContractStatus
from app.shared.pagination import PageParams, PaginatedResponse


class ContractService:

    @staticmethod
    async def _generate_contract_number(db: AsyncSession, org_id: uuid.UUID) -> str:
        """Generate auto-incrementing contract number per organization e.g. CNT-0001, CNT-0002."""
        count_stmt = select(func.count(Contract.id)).where(Contract.organization_id == org_id)
        current_count = (await db.execute(count_stmt)).scalar() or 0
        candidate = f"CNT-{current_count + 1:04d}"

        offset = 1
        while True:
            chk = select(Contract).where(
                Contract.organization_id == org_id,
                Contract.contract_number == candidate,
            )
            if not (await db.execute(chk)).scalar_one_or_none():
                return candidate
            offset += 1
            candidate = f"CNT-{current_count + offset:04d}"

    @staticmethod
    def _map_contract_response(c: Contract) -> ContractResponse:
        emp_name = f"{c.employee.first_name} {c.employee.last_name}" if c.employee else None
        emp_code = c.employee.employee_code if c.employee else None
        struct_name = c.salary_structure.name if c.salary_structure else None

        return ContractResponse(
            id=c.id,
            organization_id=c.organization_id,
            employee_id=c.employee_id,
            working_schedule_id=c.working_schedule_id,
            salary_structure_id=c.salary_structure_id,
            contract_number=c.contract_number,
            contract_type=c.contract_type,
            start_date=c.start_date,
            end_date=c.end_date,
            base_wage=c.base_wage,
            wage_type=c.wage_type,
            status=c.status,
            employee_name=emp_name,
            employee_code=emp_code,
            salary_structure_name=struct_name,
            created_at=c.created_at,
            updated_at=c.updated_at,
        )

    @classmethod
    async def create_contract(
        cls,
        db: AsyncSession,
        org_id: uuid.UUID,
        payload: ContractCreate,
    ) -> ContractResponse:
        # Validate Employee
        emp_stmt = select(Employee).where(
            Employee.organization_id == org_id,
            Employee.id == payload.employee_id,
        )
        emp = (await db.execute(emp_stmt)).scalar_one_or_none()
        if not emp:
            raise NotFoundError(f"Employee with ID '{payload.employee_id}' not found")

        # Validate Salary Structure
        struct_stmt = select(SalaryStructure).where(
            SalaryStructure.organization_id == org_id,
            SalaryStructure.id == payload.salary_structure_id,
        )
        struct = (await db.execute(struct_stmt)).scalar_one_or_none()
        if not struct:
            raise NotFoundError(f"Salary structure with ID '{payload.salary_structure_id}' not found")

        # Validate Dates
        if payload.end_date and payload.end_date < payload.start_date:
            raise ValidationError("end_date cannot be earlier than start_date")

        # Validate Contract Number
        contract_number = payload.contract_number
        if contract_number:
            existing = await ContractRepository.get_by_number(db, org_id, contract_number)
            if existing:
                raise ConflictError(f"Contract with number '{contract_number}' already exists")
        else:
            contract_number = await cls._generate_contract_number(db, org_id)

        # Enforce Active Contract Overlap Rule
        if payload.status == ContractStatus.ACTIVE:
            overlapping = await ContractRepository.check_active_contract_overlap(
                db,
                org_id=org_id,
                employee_id=payload.employee_id,
                start_date=payload.start_date,
                end_date=payload.end_date,
            )
            if overlapping:
                raise ConflictError(
                    f"Employee already has an active contract ({overlapping.contract_number}) overlapping with period {payload.start_date} to {payload.end_date or 'indefinite'}"
                )

        contract = Contract(
            organization_id=org_id,
            employee_id=payload.employee_id,
            working_schedule_id=payload.working_schedule_id,
            salary_structure_id=payload.salary_structure_id,
            contract_number=contract_number,
            contract_type=payload.contract_type,
            start_date=payload.start_date,
            end_date=payload.end_date,
            base_wage=payload.base_wage,
            wage_type=payload.wage_type,
            status=payload.status,
        )
        created = await ContractRepository.create(db, contract)
        return cls._map_contract_response(created)

    @classmethod
    async def list_contracts(
        cls,
        db: AsyncSession,
        org_id: uuid.UUID,
        employee_id: Optional[uuid.UUID] = None,
        status: Optional[ContractStatus] = None,
        page: int = 1,
        page_size: int = 20,
    ) -> PaginatedResponse[ContractResponse]:
        items, total = await ContractRepository.list_contracts(
            db, org_id, employee_id=employee_id, status=status, page=page, page_size=page_size
        )
        responses = [cls._map_contract_response(c) for c in items]
        params = PageParams(page=page, page_size=page_size)
        return PaginatedResponse.create(items=responses, total=total, params=params)

    @classmethod
    async def get_contract_by_id(
        cls,
        db: AsyncSession,
        org_id: uuid.UUID,
        contract_id: uuid.UUID,
    ) -> ContractResponse:
        contract = await ContractRepository.get_by_id(db, org_id, contract_id)
        if not contract:
            raise NotFoundError(f"Contract with ID '{contract_id}' not found")
        return cls._map_contract_response(contract)

    @classmethod
    async def update_contract(
        cls,
        db: AsyncSession,
        org_id: uuid.UUID,
        contract_id: uuid.UUID,
        payload: ContractUpdate,
    ) -> ContractResponse:
        contract = await ContractRepository.get_by_id(db, org_id, contract_id)
        if not contract:
            raise NotFoundError(f"Contract with ID '{contract_id}' not found")

        update_dict = payload.model_dump(exclude_unset=True)

        if "employee_id" in update_dict:
            emp_stmt = select(Employee).where(
                Employee.organization_id == org_id,
                Employee.id == update_dict["employee_id"],
            )
            if not (await db.execute(emp_stmt)).scalar_one_or_none():
                raise NotFoundError(f"Employee with ID '{update_dict['employee_id']}' not found")

        if "salary_structure_id" in update_dict:
            struct_stmt = select(SalaryStructure).where(
                SalaryStructure.organization_id == org_id,
                SalaryStructure.id == update_dict["salary_structure_id"],
            )
            if not (await db.execute(struct_stmt)).scalar_one_or_none():
                raise NotFoundError(f"Salary structure with ID '{update_dict['salary_structure_id']}' not found")

        if "contract_number" in update_dict and update_dict["contract_number"] != contract.contract_number:
            existing = await ContractRepository.get_by_number(db, org_id, update_dict["contract_number"])
            if existing and existing.id != contract.id:
                raise ConflictError(f"Contract with number '{update_dict['contract_number']}' already exists")

        # Validate start / end date range
        target_start = update_dict.get("start_date", contract.start_date)
        target_end = update_dict.get("end_date", contract.end_date)
        if target_end and target_end < target_start:
            raise ValidationError("end_date cannot be earlier than start_date")

        # Overlap check if updated status is ACTIVE or if active contract date range changed
        target_status = update_dict.get("status", contract.status)
        target_employee_id = update_dict.get("employee_id", contract.employee_id)

        if target_status == ContractStatus.ACTIVE:
            overlapping = await ContractRepository.check_active_contract_overlap(
                db,
                org_id=org_id,
                employee_id=target_employee_id,
                start_date=target_start,
                end_date=target_end,
                exclude_contract_id=contract.id,
            )
            if overlapping:
                raise ConflictError(
                    f"Employee already has an active contract ({overlapping.contract_number}) overlapping with period {target_start} to {target_end or 'indefinite'}"
                )

        updated = await ContractRepository.update(db, contract, update_dict)
        return cls._map_contract_response(updated)
