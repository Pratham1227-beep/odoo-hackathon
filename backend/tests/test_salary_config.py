from datetime import date
from decimal import Decimal
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import create_access_token, hash_password
from app.features.auth.models import Organization, User
from app.features.employees.models import Employee
from app.shared.enums import (
    CalculationType,
    EmployeeStatus,
    EmploymentType,
    Gender,
    SalaryComponentValueType,
    SalaryRuleCategory,
    UserRole,
    UserStatus,
)


async def setup_test_tenant(db_session: AsyncSession):
    org = Organization(
        name="Global Corp",
        code="GLB",
        email="info@glb.com",
    )
    db_session.add(org)
    await db_session.commit()
    await db_session.refresh(org)

    roles = [
        ("admin@glb.com", UserRole.ADMIN),
        ("hrmanager@glb.com", UserRole.HR_MANAGER),
        ("payrolluser@glb.com", UserRole.HR_PAYROLL_USER),
        ("payrollmgr@glb.com", UserRole.HR_PAYROLL_MANAGER),
        ("employee@glb.com", UserRole.EMPLOYEE),
    ]
    tokens = {}
    users = {}

    for email, role in roles:
        user = User(
            organization_id=org.id,
            email=email,
            password_hash=hash_password("Password123!"),
            role=role,
            status=UserStatus.ACTIVE,
        )
        db_session.add(user)
        await db_session.commit()
        await db_session.refresh(user)
        users[role] = user
        tokens[role] = create_access_token(
            user.id,
            org.id,
            role.value,
            0,
        )

    # Create an employee profile for the employee user
    emp = Employee(
        organization_id=org.id,
        user_id=users[UserRole.EMPLOYEE].id,
        employee_code="EMP0001",
        first_name="John",
        last_name="Doe",
        email="employee@glb.com",
        gender=Gender.MALE,
        joining_date=date(2025, 1, 1),
        employment_type=EmploymentType.FULL_TIME,
        status=EmployeeStatus.ACTIVE,
    )
    db_session.add(emp)
    await db_session.commit()
    await db_session.refresh(emp)

    return {
        "org": org,
        "users": users,
        "tokens": tokens,
        "employee": emp,
    }


@pytest.mark.asyncio
async def test_salary_rule_validation_and_crud(client: AsyncClient, db_session: AsyncSession):
    ctx = await setup_test_tenant(db_session)
    headers_mgr = {"Authorization": f"Bearer {ctx['tokens'][UserRole.HR_PAYROLL_MANAGER]}"}
    headers_user = {"Authorization": f"Bearer {ctx['tokens'][UserRole.HR_PAYROLL_USER]}"}
    headers_hr = {"Authorization": f"Bearer {ctx['tokens'][UserRole.HR_MANAGER]}"}
    headers_emp = {"Authorization": f"Bearer {ctx['tokens'][UserRole.EMPLOYEE]}"}

    # 1. Reject FIXED rule with missing fixed_amount
    res = await client.post(
        "/api/v1/salary-rules",
        headers=headers_mgr,
        json={
            "name": "Basic Salary",
            "code": "BASIC",
            "category": "BASIC",
            "calculation_type": "FIXED",
        },
    )
    assert res.status_code == 422

    # 2. Reject PERCENTAGE rule with missing percentage or percentage_base
    res = await client.post(
        "/api/v1/salary-rules",
        headers=headers_mgr,
        json={
            "name": "HRA Allowance",
            "code": "HRA",
            "category": "ALLOWANCE",
            "calculation_type": "PERCENTAGE",
            "percentage": 50.0,
            # missing percentage_base
        },
    )
    assert res.status_code == 422

    # 3. Reject FORMULA rule with missing formula
    res = await client.post(
        "/api/v1/salary-rules",
        headers=headers_mgr,
        json={
            "name": "Special Allowance",
            "code": "SPECIAL",
            "category": "ALLOWANCE",
            "calculation_type": "FORMULA",
            # missing formula
        },
    )
    assert res.status_code == 422

    # 4. Successfully create FIXED rule: BASIC
    res_basic = await client.post(
        "/api/v1/salary-rules",
        headers=headers_mgr,
        json={
            "name": "Basic Pay",
            "code": "BASIC",
            "category": "BASIC",
            "calculation_type": "FIXED",
            "fixed_amount": 50000.00,
            "sequence": 1,
            "taxable": True,
        },
    )
    assert res_basic.status_code == 201
    basic_data = res_basic.json()
    assert basic_data["code"] == "BASIC"
    basic_id = basic_data["id"]

    # 5. Successfully create PERCENTAGE rule: HRA referencing BASIC
    res_hra = await client.post(
        "/api/v1/salary-rules",
        headers=headers_mgr,
        json={
            "name": "House Rent Allowance",
            "code": "HRA",
            "category": "ALLOWANCE",
            "calculation_type": "PERCENTAGE",
            "percentage": 40.0,
            "percentage_base": "BASIC",
            "sequence": 2,
            "taxable": True,
        },
    )
    assert res_hra.status_code == 201

    # 6. Reject FORMULA rule referencing non-existent rule code
    res_bad_formula = await client.post(
        "/api/v1/salary-rules",
        headers=headers_mgr,
        json={
            "name": "Performance Bonus",
            "code": "BONUS",
            "category": "ALLOWANCE",
            "calculation_type": "FORMULA",
            "formula": "BASIC * 0.1 + NON_EXISTENT_CODE",
            "sequence": 3,
        },
    )
    assert res_bad_formula.status_code == 422

    # 7. Successfully create valid FORMULA rule referencing BASIC and HRA
    res_formula = await client.post(
        "/api/v1/salary-rules",
        headers=headers_mgr,
        json={
            "name": "Gross Salary",
            "code": "GROSS",
            "category": "GROSS",
            "calculation_type": "FORMULA",
            "formula": "BASIC + HRA",
            "sequence": 4,
        },
    )
    assert res_formula.status_code == 201

    # 8. Test RBAC on Salary Rules
    # HR_PAYROLL_USER can list & get detail (Read)
    res_list = await client.get("/api/v1/salary-rules", headers=headers_user)
    assert res_list.status_code == 200
    assert len(res_list.json()) == 3

    res_detail = await client.get(f"/api/v1/salary-rules/{basic_id}", headers=headers_user)
    assert res_detail.status_code == 200

    # HR_PAYROLL_USER cannot write (403)
    res_unauth_write = await client.post(
        "/api/v1/salary-rules",
        headers=headers_user,
        json={
            "name": "Unauthorized Rule",
            "code": "UNAUTH",
            "category": "ALLOWANCE",
            "calculation_type": "FIXED",
            "fixed_amount": 100,
        },
    )
    assert res_unauth_write.status_code == 403

    # HR_MANAGER has no access to payroll features (403)
    res_hr_read = await client.get("/api/v1/salary-rules", headers=headers_hr)
    assert res_hr_read.status_code == 403

    # EMPLOYEE has no access (403)
    res_emp_read = await client.get("/api/v1/salary-rules", headers=headers_emp)
    assert res_emp_read.status_code == 403


@pytest.mark.asyncio
async def test_salary_structure_and_rules_replacement(client: AsyncClient, db_session: AsyncSession):
    ctx = await setup_test_tenant(db_session)
    headers_mgr = {"Authorization": f"Bearer {ctx['tokens'][UserRole.HR_PAYROLL_MANAGER]}"}
    headers_user = {"Authorization": f"Bearer {ctx['tokens'][UserRole.HR_PAYROLL_USER]}"}

    # Create two rules
    r1 = (await client.post(
        "/api/v1/salary-rules",
        headers=headers_mgr,
        json={"name": "Basic", "code": "BASIC", "category": "BASIC", "calculation_type": "FIXED", "fixed_amount": 1000},
    )).json()

    r2 = (await client.post(
        "/api/v1/salary-rules",
        headers=headers_mgr,
        json={"name": "HRA", "code": "HRA", "category": "ALLOWANCE", "calculation_type": "PERCENTAGE", "percentage": 50, "percentage_base": "BASIC"},
    )).json()

    r3 = (await client.post(
        "/api/v1/salary-rules",
        headers=headers_mgr,
        json={"name": "PF", "code": "PF", "category": "DEDUCTION", "calculation_type": "PERCENTAGE", "percentage": 12, "percentage_base": "BASIC"},
    )).json()

    # 1. Create Salary Structure
    res_struct = await client.post(
        "/api/v1/salary-structures",
        headers=headers_mgr,
        json={
            "name": "Regular Full Time",
            "code": "REG_FT",
            "description": "Standard corporate salary structure",
            "is_default": True,
        },
    )
    assert res_struct.status_code == 201
    struct_id = res_struct.json()["id"]

    # 2. Set initial rules [r1, r2]
    res_rules_1 = await client.patch(
        f"/api/v1/salary-structures/{struct_id}/rules",
        headers=headers_mgr,
        json={
            "rules": [
                {"rule_id": r1["id"], "sequence": 1, "is_active": True},
                {"rule_id": r2["id"], "sequence": 2, "is_active": True},
            ]
        },
    )
    assert res_rules_1.status_code == 200
    data1 = res_rules_1.json()
    assert len(data1["rules"]) == 2
    assert [r["salary_rule_id"] for r in data1["rules"]] == [r1["id"], r2["id"]]

    # 3. Replace rules with [r1, r3] (verify replacement, not append)
    res_rules_2 = await client.patch(
        f"/api/v1/salary-structures/{struct_id}/rules",
        headers=headers_mgr,
        json={
            "rules": [
                {"rule_id": r1["id"], "sequence": 10, "is_active": True},
                {"rule_id": r3["id"], "sequence": 20, "is_active": True},
            ]
        },
    )
    assert res_rules_2.status_code == 200
    data2 = res_rules_2.json()
    assert len(data2["rules"]) == 2
    assert [r["salary_rule_id"] for r in data2["rules"]] == [r1["id"], r3["id"]]
    assert data2["rules"][0]["sequence"] == 10
    assert data2["rules"][1]["sequence"] == 20

    # 4. Verify detail endpoint returns joined rule details
    res_detail = await client.get(f"/api/v1/salary-structures/{struct_id}", headers=headers_user)
    assert res_detail.status_code == 200
    detail_data = res_detail.json()
    assert detail_data["rules"][0]["salary_rule"]["code"] == "BASIC"
    assert detail_data["rules"][1]["salary_rule"]["code"] == "PF"


@pytest.mark.asyncio
async def test_company_payroll_config_and_employee_salary_components(client: AsyncClient, db_session: AsyncSession):
    ctx = await setup_test_tenant(db_session)
    headers_mgr = {"Authorization": f"Bearer {ctx['tokens'][UserRole.HR_PAYROLL_MANAGER]}"}
    headers_user = {"Authorization": f"Bearer {ctx['tokens'][UserRole.HR_PAYROLL_USER]}"}
    emp_user_id = ctx["users"][UserRole.EMPLOYEE].id

    # 1. GET default company payroll config
    res_config = await client.get("/api/v1/payroll-config", headers=headers_user)
    assert res_config.status_code == 200
    config_data = res_config.json()
    assert config_data["pf_enabled"] is True
    assert float(config_data["pf_employee_percentage"]) == 12.00
    assert config_data["default_pay_day"] == 30

    # 2. PATCH payroll config partially (e.g. only esi_percentage & default_pay_day)
    res_patch = await client.patch(
        "/api/v1/payroll-config",
        headers=headers_mgr,
        json={
            "esi_percentage": 1.75,
            "default_pay_day": 28,
        },
    )
    assert res_patch.status_code == 200
    patched_data = res_patch.json()
    assert float(patched_data["esi_percentage"]) == 1.75
    assert patched_data["default_pay_day"] == 28
    # Untouched keys remain unchanged
    assert patched_data["pf_enabled"] is True
    assert float(patched_data["pf_employee_percentage"]) == 12.00

    # 3. Create a salary rule for employee component
    rule = (await client.post(
        "/api/v1/salary-rules",
        headers=headers_mgr,
        json={"name": "Special Allowance", "code": "SA", "category": "ALLOWANCE", "calculation_type": "FIXED", "fixed_amount": 5000},
    )).json()

    # 4. Upsert employee salary components
    res_comp_update = await client.patch(
        f"/api/v1/payroll-config/salary/{emp_user_id}",
        headers=headers_mgr,
        json={
            "components": [
                {
                    "salary_rule_id": rule["id"],
                    "value": 7500.00,
                    "value_type": "FIXED",
                    "effective_from": "2025-01-01",
                    "is_active": True,
                }
            ]
        },
    )
    assert res_comp_update.status_code == 200
    comp_list = res_comp_update.json()
    assert len(comp_list) == 1
    assert comp_list[0]["rule_name"] == "Special Allowance"
    assert comp_list[0]["rule_code"] == "SA"
    assert comp_list[0]["rule_category"] == "ALLOWANCE"
    assert float(comp_list[0]["value"]) == 7500.00

    # 5. GET employee salary components
    res_comp_get = await client.get(f"/api/v1/payroll-config/salary/{emp_user_id}", headers=headers_user)
    assert res_comp_get.status_code == 200
    assert len(res_comp_get.json()) == 1
    assert res_comp_get.json()[0]["rule_code"] == "SA"
