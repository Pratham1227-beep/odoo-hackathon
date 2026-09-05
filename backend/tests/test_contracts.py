from datetime import date
from decimal import Decimal
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import create_access_token, hash_password
from app.features.auth.models import Organization, User
from app.features.contracts.models import Contract
from app.features.contracts.repository import ContractRepository
from app.features.employees.models import Employee
from app.features.payroll_config.models import SalaryStructure
from app.shared.enums import (
    ContractStatus,
    ContractType,
    EmployeeStatus,
    EmploymentType,
    Gender,
    UserRole,
    UserStatus,
    WageType,
)


async def setup_contract_test_data(db_session: AsyncSession):
    # Tenant 1
    org1 = Organization(name="Acme Corp", code="ACM", email="acme@corp.com")
    db_session.add(org1)
    await db_session.commit()
    await db_session.refresh(org1)

    # Tenant 2
    org2 = Organization(name="Beta LLC", code="BET", email="beta@corp.com")
    db_session.add(org2)
    await db_session.commit()
    await db_session.refresh(org2)

    # Users
    u_admin = User(organization_id=org1.id, email="admin@acm.com", password_hash=hash_password("pw"), role=UserRole.ADMIN, status=UserStatus.ACTIVE)
    u_hr = User(organization_id=org1.id, email="hr@acm.com", password_hash=hash_password("pw"), role=UserRole.HR_MANAGER, status=UserStatus.ACTIVE)
    u_puser = User(organization_id=org1.id, email="puser@acm.com", password_hash=hash_password("pw"), role=UserRole.HR_PAYROLL_USER, status=UserStatus.ACTIVE)
    u_pmgr = User(organization_id=org1.id, email="pmgr@acm.com", password_hash=hash_password("pw"), role=UserRole.HR_PAYROLL_MANAGER, status=UserStatus.ACTIVE)
    u_emp = User(organization_id=org1.id, email="emp@acm.com", password_hash=hash_password("pw"), role=UserRole.EMPLOYEE, status=UserStatus.ACTIVE)
    u_org2_hr = User(organization_id=org2.id, email="hr@bet.com", password_hash=hash_password("pw"), role=UserRole.HR_MANAGER, status=UserStatus.ACTIVE)

    db_session.add_all([u_admin, u_hr, u_puser, u_pmgr, u_emp, u_org2_hr])
    await db_session.commit()

    tokens = {
        "admin": create_access_token(u_admin.id, org1.id, UserRole.ADMIN.value, 0),
        "hr": create_access_token(u_hr.id, org1.id, UserRole.HR_MANAGER.value, 0),
        "puser": create_access_token(u_puser.id, org1.id, UserRole.HR_PAYROLL_USER.value, 0),
        "pmgr": create_access_token(u_pmgr.id, org1.id, UserRole.HR_PAYROLL_MANAGER.value, 0),
        "emp": create_access_token(u_emp.id, org1.id, UserRole.EMPLOYEE.value, 0),
        "org2_hr": create_access_token(u_org2_hr.id, org2.id, UserRole.HR_MANAGER.value, 0),
    }

    # Employee in Org 1
    emp1 = Employee(
        organization_id=org1.id,
        user_id=u_emp.id,
        employee_code="EMP001",
        first_name="Alice",
        last_name="Smith",
        email="emp@acm.com",
        gender=Gender.FEMALE,
        joining_date=date(2024, 1, 1),
        employment_type=EmploymentType.FULL_TIME,
        status=EmployeeStatus.ACTIVE,
    )
    db_session.add(emp1)

    # Salary structure in Org 1
    struct1 = SalaryStructure(
        organization_id=org1.id,
        name="Standard Structure",
        code="STD",
        is_default=True,
    )
    db_session.add(struct1)

    await db_session.commit()
    await db_session.refresh(emp1)
    await db_session.refresh(struct1)

    return {
        "org1": org1,
        "org2": org2,
        "tokens": tokens,
        "employee1": emp1,
        "structure1": struct1,
    }


@pytest.mark.asyncio
async def test_contract_crud_and_rbac(client: AsyncClient, db_session: AsyncSession):
    data = await setup_contract_test_data(db_session)
    headers_hr = {"Authorization": f"Bearer {data['tokens']['hr']}"}
    headers_emp = {"Authorization": f"Bearer {data['tokens']['emp']}"}
    emp_id = str(data["employee1"].id)
    struct_id = str(data["structure1"].id)

    # 1. Plain EMPLOYEE is forbidden from listing/creating contracts
    res_emp_list = await client.get("/api/v1/contracts", headers=headers_emp)
    assert res_emp_list.status_code == 403

    # 2. HR_MANAGER creates DRAFT contract
    res_create = await client.post(
        "/api/v1/contracts",
        headers=headers_hr,
        json={
            "employee_id": emp_id,
            "salary_structure_id": struct_id,
            "contract_type": "PERMANENT",
            "start_date": "2025-01-01",
            "end_date": "2025-12-31",
            "base_wage": 60000.00,
            "wage_type": "MONTHLY",
            "status": "DRAFT",
        },
    )
    assert res_create.status_code == 201
    contract_data = res_create.json()
    assert contract_data["status"] == "DRAFT"
    assert contract_data["contract_number"].startswith("CNT-")
    contract_id = contract_data["id"]

    # 3. HR_MANAGER can read contract detail
    res_get = await client.get(f"/api/v1/contracts/{contract_id}", headers=headers_hr)
    assert res_get.status_code == 200
    assert res_get.json()["employee_name"] == "Alice Smith"

    # 4. HR_MANAGER updates contract
    res_patch = await client.patch(
        f"/api/v1/contracts/{contract_id}",
        headers=headers_hr,
        json={"base_wage": 65000.00},
    )
    assert res_patch.status_code == 200
    assert float(res_patch.json()["base_wage"]) == 65000.00


@pytest.mark.asyncio
async def test_active_contract_overlap_prevention(client: AsyncClient, db_session: AsyncSession):
    data = await setup_contract_test_data(db_session)
    headers_hr = {"Authorization": f"Bearer {data['tokens']['hr']}"}
    emp_id = str(data["employee1"].id)
    struct_id = str(data["structure1"].id)

    # 1. Create first ACTIVE contract: 2025-01-01 to 2025-12-31
    res1 = await client.post(
        "/api/v1/contracts",
        headers=headers_hr,
        json={
            "employee_id": emp_id,
            "salary_structure_id": struct_id,
            "contract_type": "PERMANENT",
            "start_date": "2025-01-01",
            "end_date": "2025-12-31",
            "base_wage": 50000.00,
            "wage_type": "MONTHLY",
            "status": "ACTIVE",
        },
    )
    assert res1.status_code == 201
    c1_id = res1.json()["id"]

    # 2. Attempt to create overlapping ACTIVE contract: 2025-06-01 to 2026-06-01 -> REJECTED (409)
    res_overlap = await client.post(
        "/api/v1/contracts",
        headers=headers_hr,
        json={
            "employee_id": emp_id,
            "salary_structure_id": struct_id,
            "contract_type": "PERMANENT",
            "start_date": "2025-06-01",
            "end_date": "2026-06-01",
            "base_wage": 55000.00,
            "wage_type": "MONTHLY",
            "status": "ACTIVE",
        },
    )
    assert res_overlap.status_code == 409
    assert "overlapping" in res_overlap.json()["error"]["message"].lower()

    # 3. Create non-overlapping DRAFT contract: 2025-06-01 to 2026-06-01 -> SUCCEEDS (as DRAFT)
    res_draft = await client.post(
        "/api/v1/contracts",
        headers=headers_hr,
        json={
            "employee_id": emp_id,
            "salary_structure_id": struct_id,
            "contract_type": "PERMANENT",
            "start_date": "2025-06-01",
            "end_date": "2026-06-01",
            "base_wage": 55000.00,
            "wage_type": "MONTHLY",
            "status": "DRAFT",
        },
    )
    assert res_draft.status_code == 201
    c2_id = res_draft.json()["id"]

    # 4. Attempt to transition draft to ACTIVE while first contract is still ACTIVE -> REJECTED (409)
    res_activate_fail = await client.patch(
        f"/api/v1/contracts/{c2_id}",
        headers=headers_hr,
        json={"status": "ACTIVE"},
    )
    assert res_activate_fail.status_code == 409

    # 5. Terminate first contract first, then activate second -> SUCCEEDS
    res_term = await client.patch(
        f"/api/v1/contracts/{c1_id}",
        headers=headers_hr,
        json={"status": "TERMINATED"},
    )
    assert res_term.status_code == 200

    res_activate_ok = await client.patch(
        f"/api/v1/contracts/{c2_id}",
        headers=headers_hr,
        json={"status": "ACTIVE"},
    )
    assert res_activate_ok.status_code == 200
    assert res_activate_ok.json()["status"] == "ACTIVE"


@pytest.mark.asyncio
async def test_get_active_contract_for_period(client: AsyncClient, db_session: AsyncSession):
    data = await setup_contract_test_data(db_session)
    org_id = data["org1"].id
    emp_id = data["employee1"].id
    struct_id = data["structure1"].id

    # Create active contract from 2025-01-01 to 2025-12-31
    contract = Contract(
        organization_id=org_id,
        employee_id=emp_id,
        salary_structure_id=struct_id,
        contract_number="CNT-TEST-01",
        contract_type=ContractType.PERMANENT,
        start_date=date(2025, 1, 1),
        end_date=date(2025, 12, 31),
        base_wage=Decimal("70000.00"),
        wage_type=WageType.MONTHLY,
        status=ContractStatus.ACTIVE,
    )
    db_session.add(contract)
    await db_session.commit()

    # 1. Query period within active contract range (March 2025) -> returns contract
    res = await ContractRepository.get_active_contract_for_period(
        db_session,
        org_id=org_id,
        employee_id=emp_id,
        period_start=date(2025, 3, 1),
        period_end=date(2025, 3, 31),
    )
    assert res is not None
    assert res.contract_number == "CNT-TEST-01"

    # 2. Query period outside active contract range (March 2026) -> returns None
    res_outside = await ContractRepository.get_active_contract_for_period(
        db_session,
        org_id=org_id,
        employee_id=emp_id,
        period_start=date(2026, 3, 1),
        period_end=date(2026, 3, 31),
    )
    assert res_outside is None
