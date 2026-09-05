from datetime import date, datetime, timedelta, timezone
from decimal import Decimal
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import create_access_token, hash_password
from app.features.attendance.models import Attendance, Holiday
from app.features.auth.models import Organization, User
from app.features.contracts.models import Contract
from app.features.employees.models import Employee, EmployeeBankDetail
from app.features.payroll.models import (
    PayrollValidationIssue,
    Payrun,
    PayrunEmployee,
    Payslip,
    PayslipDelivery,
    PayslipLine,
)
from app.features.payroll_config.models import (
    EmployeeSalaryComponent,
    SalaryRule,
    SalaryStructure,
    SalaryStructureRule,
)
from app.features.time_off.models import LeaveAllocation, LeaveRequest, LeaveType
from app.shared.enums import (
    AttendanceStatus,
    CalculationType,
    ContractStatus,
    ContractType,
    EmployeeStatus,
    EmploymentType,
    Gender,
    HolidayType,
    LeaveRequestStatus,
    PayrollIssueSeverity,
    PayrunEmployeeStatus,
    PayrunStatus,
    PayslipStatus,
    SalaryComponentValueType,
    SalaryRuleCategory,
    UserRole,
    UserStatus,
    WageType,
)


def auth_header(user: User) -> dict:
    token = create_access_token(
        user_id=str(user.id),
        org_id=str(user.organization_id),
        role=user.role.value if hasattr(user.role, "value") else str(user.role),
        token_version=user.token_version,
    )
    return {"Authorization": f"Bearer {token}"}


async def setup_payroll_test_data(db_session: AsyncSession):
    # 1. Organization
    org = Organization(name="Acme Corp", code="ACM", email="acme@corp.com", timezone="UTC")
    org2 = Organization(name="Beta LLC", code="BET", email="beta@corp.com", timezone="UTC")
    db_session.add_all([org, org2])
    await db_session.commit()
    await db_session.refresh(org)
    await db_session.refresh(org2)

    # 2. Users
    u_admin = User(organization_id=org.id, email="admin@acm.com", password_hash=hash_password("pw"), role=UserRole.ADMIN, status=UserStatus.ACTIVE)
    u_hr = User(organization_id=org.id, email="hr@acm.com", password_hash=hash_password("pw"), role=UserRole.HR_PAYROLL_MANAGER, status=UserStatus.ACTIVE)
    u_emp1 = User(organization_id=org.id, email="emp1@acm.com", password_hash=hash_password("pw"), role=UserRole.EMPLOYEE, status=UserStatus.ACTIVE)
    u_emp2 = User(organization_id=org.id, email="emp2@acm.com", password_hash=hash_password("pw"), role=UserRole.EMPLOYEE, status=UserStatus.ACTIVE)
    u_emp3 = User(organization_id=org.id, email="emp3@acm.com", password_hash=hash_password("pw"), role=UserRole.EMPLOYEE, status=UserStatus.ACTIVE)

    # Org2 User
    u_org2_hr = User(organization_id=org2.id, email="hr@bet.com", password_hash=hash_password("pw"), role=UserRole.HR_PAYROLL_MANAGER, status=UserStatus.ACTIVE)

    db_session.add_all([u_admin, u_hr, u_emp1, u_emp2, u_emp3, u_org2_hr])
    await db_session.commit()

    # 3. Employees in Org
    emp1 = Employee(
        organization_id=org.id,
        user_id=u_emp1.id,
        employee_code="EMP001",
        first_name="Alice",
        last_name="Smith",
        email="emp1@acm.com",
        gender=Gender.FEMALE,
        joining_date=date(2024, 1, 1),
        employment_type=EmploymentType.FULL_TIME,
        status=EmployeeStatus.ACTIVE,
    )
    emp2 = Employee(
        organization_id=org.id,
        user_id=u_emp2.id,
        employee_code="EMP002",
        first_name="Bob",
        last_name="Jones",
        email="emp2@acm.com",
        gender=Gender.MALE,
        joining_date=date(2024, 1, 1),
        employment_type=EmploymentType.FULL_TIME,
        status=EmployeeStatus.ACTIVE,
    )
    emp3 = Employee(
        organization_id=org.id,
        user_id=u_emp3.id,
        employee_code="EMP003",
        first_name="Charlie",
        last_name="Brown",
        email="emp3@acm.com",
        gender=Gender.MALE,
        joining_date=date(2024, 1, 1),
        employment_type=EmploymentType.FULL_TIME,
        status=EmployeeStatus.ACTIVE,
    )
    db_session.add_all([emp1, emp2, emp3])
    await db_session.commit()
    await db_session.refresh(emp1)
    await db_session.refresh(emp2)
    await db_session.refresh(emp3)

    # Primary Bank Details for emp1 and emp2
    bank1 = EmployeeBankDetail(
        organization_id=org.id,
        employee_id=emp1.id,
        bank_name="HDFC Bank",
        account_number="1234567890",
        ifsc_code="HDFC0001234",
        is_primary=True,
    )
    bank2 = EmployeeBankDetail(
        organization_id=org.id,
        employee_id=emp2.id,
        bank_name="ICICI Bank",
        account_number="9876543210",
        ifsc_code="ICIC0005678",
        is_primary=True,
    )
    db_session.add_all([bank1, bank2])
    await db_session.commit()

    # 4. Salary Rules & Salary Structure in Org
    # Rules:
    # 1. BASIC: Fixed 50,000
    # 2. HRA: Percentage 40% of BASIC (20,000)
    # 3. SPECIAL: Fixed 10,000 (Allowance)
    # 4. PF: Percentage 12% of BASIC (Deduction: 6,000)
    # 5. TAX: Formula "GROSS * 0.05" or Fixed 2,000
    rule_basic = SalaryRule(
        organization_id=org.id,
        name="Basic Salary",
        code="BASIC",
        category=SalaryRuleCategory.BASIC,
        calculation_type=CalculationType.FIXED,
        fixed_amount=Decimal("50000.00"),
        sequence=1,
    )
    rule_hra = SalaryRule(
        organization_id=org.id,
        name="House Rent Allowance",
        code="HRA",
        category=SalaryRuleCategory.ALLOWANCE,
        calculation_type=CalculationType.PERCENTAGE,
        percentage=Decimal("40.00"),
        percentage_base="BASIC",
        sequence=2,
    )
    rule_special = SalaryRule(
        organization_id=org.id,
        name="Special Allowance",
        code="SPECIAL",
        category=SalaryRuleCategory.ALLOWANCE,
        calculation_type=CalculationType.FIXED,
        fixed_amount=Decimal("10000.00"),
        sequence=3,
    )
    rule_pf = SalaryRule(
        organization_id=org.id,
        name="Provident Fund",
        code="PF",
        category=SalaryRuleCategory.DEDUCTION,
        calculation_type=CalculationType.PERCENTAGE,
        percentage=Decimal("12.00"),
        percentage_base="BASIC",
        sequence=4,
    )
    rule_pt = SalaryRule(
        organization_id=org.id,
        name="Professional Tax",
        code="PT",
        category=SalaryRuleCategory.DEDUCTION,
        calculation_type=CalculationType.FIXED,
        fixed_amount=Decimal("200.00"),
        sequence=5,
    )
    db_session.add_all([rule_basic, rule_hra, rule_special, rule_pf, rule_pt])
    await db_session.commit()

    # Structure 1: Regular Standard Structure
    struct_std = SalaryStructure(
        organization_id=org.id,
        name="Standard Structure",
        code="STD_STRUCT",
        is_default=True,
    )
    # Structure 2: Empty Structure (no rules)
    struct_empty = SalaryStructure(
        organization_id=org.id,
        name="Empty Structure",
        code="EMPTY_STRUCT",
        is_default=False,
    )
    db_session.add_all([struct_std, struct_empty])
    await db_session.commit()

    sr1 = SalaryStructureRule(organization_id=org.id, salary_structure_id=struct_std.id, salary_rule_id=rule_basic.id, sequence=1)
    sr2 = SalaryStructureRule(organization_id=org.id, salary_structure_id=struct_std.id, salary_rule_id=rule_hra.id, sequence=2)
    sr3 = SalaryStructureRule(organization_id=org.id, salary_structure_id=struct_std.id, salary_rule_id=rule_special.id, sequence=3)
    sr4 = SalaryStructureRule(organization_id=org.id, salary_structure_id=struct_std.id, salary_rule_id=rule_pf.id, sequence=4)
    sr5 = SalaryStructureRule(organization_id=org.id, salary_structure_id=struct_std.id, salary_rule_id=rule_pt.id, sequence=5)
    db_session.add_all([sr1, sr2, sr3, sr4, sr5])
    await db_session.commit()

    # 5. Active Contracts
    # emp1: has active contract with Standard Structure
    contract1 = Contract(
        organization_id=org.id,
        employee_id=emp1.id,
        salary_structure_id=struct_std.id,
        contract_number="CNT-EMP001",
        contract_type=ContractType.PERMANENT,
        start_date=date(2026, 1, 1),
        base_wage=Decimal("50000.00"),
        wage_type=WageType.MONTHLY,
        status=ContractStatus.ACTIVE,
    )
    # emp2: has active contract with Empty Structure (no rules)
    contract2 = Contract(
        organization_id=org.id,
        employee_id=emp2.id,
        salary_structure_id=struct_empty.id,
        contract_number="CNT-EMP002",
        contract_type=ContractType.PERMANENT,
        start_date=date(2026, 1, 1),
        base_wage=Decimal("40000.00"),
        wage_type=WageType.MONTHLY,
        status=ContractStatus.ACTIVE,
    )
    # emp3: NO active contract!

    db_session.add_all([contract1, contract2])
    await db_session.commit()

    return {
        "org": org,
        "org2": org2,
        "admin": u_admin,
        "hr": u_hr,
        "emp1_user": u_emp1,
        "emp2_user": u_emp2,
        "emp3_user": u_emp3,
        "emp1": emp1,
        "emp2": emp2,
        "emp3": emp3,
        "struct_std": struct_std,
        "struct_empty": struct_empty,
        "rule_basic": rule_basic,
        "rule_hra": rule_hra,
        "rule_special": rule_special,
        "rule_pf": rule_pf,
        "contract1": contract1,
        "contract2": contract2,
        "org2_hr": u_org2_hr,
    }


@pytest.mark.asyncio
async def test_payrun_creation_draft_and_pending_status(client: AsyncClient, db_session: AsyncSession):
    data = await setup_payroll_test_data(db_session)
    hr_headers = auth_header(data["hr"])

    # Create payrun for emp1, emp2, emp3
    resp = await client.post(
        "/api/v1/payroll/payruns",
        json={
            "name": "September 2026 Regular Payrun",
            "period_start": "2026-09-01",
            "period_end": "2026-09-30",
            "month": 9,
            "year": 2026,
            "employee_ids": [str(data["emp1"].id), str(data["emp2"].id), str(data["emp3"].id)],
            "notes": "Test payrun",
        },
        headers=hr_headers,
    )
    assert resp.status_code == 201
    payrun_data = resp.json()
    assert payrun_data["status"] == PayrunStatus.DRAFT.value
    assert payrun_data["total_employees"] == 3
    assert payrun_data["processed_employees"] == 0
    assert len(payrun_data["employees"]) == 3
    assert all(e["status"] == PayrunEmployeeStatus.PENDING.value for e in payrun_data["employees"])


@pytest.mark.asyncio
async def test_engine_missing_contract_and_missing_rules_validation(client: AsyncClient, db_session: AsyncSession):
    data = await setup_payroll_test_data(db_session)
    hr_headers = auth_header(data["hr"])

    # Create payrun including emp1 (valid), emp2 (empty rules), emp3 (no contract)
    resp_create = await client.post(
        "/api/v1/payroll/payruns",
        json={
            "name": "September 2026 Payrun",
            "period_start": "2026-09-01",
            "period_end": "2026-09-30",
            "month": 9,
            "year": 2026,
            "employee_ids": [str(data["emp1"].id), str(data["emp2"].id), str(data["emp3"].id)],
        },
        headers=hr_headers,
    )
    payrun_id = resp_create.json()["id"]

    # Process Payrun
    resp_proc = await client.post(f"/api/v1/payroll/payruns/{payrun_id}/process", headers=hr_headers)
    assert resp_proc.status_code == 200
    res_data = resp_proc.json()

    assert res_data["status"] == PayrunStatus.PROCESSED.value
    # emp1 was computed successfully, emp2 and emp3 have issues
    assert res_data["processed_employees"] == 1

    emp_entries = {e["employee_id"]: e for e in res_data["employees"]}
    issues = res_data["issues"]

    # emp3 has NO_ACTIVE_CONTRACT error
    assert emp_entries[str(data["emp3"].id)]["status"] == PayrunEmployeeStatus.ISSUE.value
    assert emp_entries[str(data["emp3"].id)]["is_ready"] is False
    assert any(i["employee_id"] == str(data["emp3"].id) and i["issue_code"] == "NO_ACTIVE_CONTRACT" and i["severity"] == "ERROR" for i in issues)

    # emp2 has NO_SALARY_RULES error
    assert emp_entries[str(data["emp2"].id)]["status"] == PayrunEmployeeStatus.ISSUE.value
    assert emp_entries[str(data["emp2"].id)]["is_ready"] is False
    assert any(i["employee_id"] == str(data["emp2"].id) and i["issue_code"] == "NO_SALARY_RULES" and i["severity"] == "ERROR" for i in issues)

    # emp1 computed successfully
    assert emp_entries[str(data["emp1"].id)]["status"] == PayrunEmployeeStatus.COMPUTED.value
    assert emp_entries[str(data["emp1"].id)]["is_ready"] is True

    # Finalize should fail because emp2 & emp3 are not ready
    resp_fin = await client.post(f"/api/v1/payroll/payruns/{payrun_id}/finalize", headers=hr_headers)
    assert resp_fin.status_code == 400
    assert "unresolved ERROR-severity" in resp_fin.json()["error"]["message"]


@pytest.mark.asyncio
async def test_salary_computation_proration_and_overrides(client: AsyncClient, db_session: AsyncSession):
    data = await setup_payroll_test_data(db_session)
    hr_headers = auth_header(data["hr"])

    # Give emp1 11 worked days out of 22 expected working days in Sept 2026 (exact half proration: factor 0.5)
    # September 2026: 2026-09-01 (Tue) to 2026-09-30 (Wed) -> 22 working days
    for d in range(1, 16):  # Sept 1 to Sept 15
        dt = date(2026, 9, d)
        if dt.weekday() < 5:  # Weekday
            att = Attendance(
                organization_id=data["org"].id,
                employee_id=data["emp1"].id,
                date=dt,
                status=AttendanceStatus.PRESENT,
            )
            db_session.add(att)
    await db_session.commit()

    # Also add an EmployeeSalaryComponent override for emp1: SPECIAL allowance overridden to 20,000 (instead of 10,000)
    override = EmployeeSalaryComponent(
        organization_id=data["org"].id,
        employee_id=data["emp1"].id,
        salary_rule_id=data["rule_special"].id,
        value=Decimal("20000.00"),
        value_type=SalaryComponentValueType.FIXED,
        effective_from=date(2026, 1, 1),
        is_active=True,
    )
    db_session.add(override)
    await db_session.commit()

    # Create payrun for emp1 only
    resp_create = await client.post(
        "/api/v1/payroll/payruns",
        json={
            "name": "Sept 2026 Proration Test",
            "period_start": "2026-09-01",
            "period_end": "2026-09-30",
            "month": 9,
            "year": 2026,
            "employee_ids": [str(data["emp1"].id)],
        },
        headers=hr_headers,
    )
    payrun_id = resp_create.json()["id"]

    # Process Payrun
    resp_proc = await client.post(f"/api/v1/payroll/payruns/{payrun_id}/process", headers=hr_headers)
    assert resp_proc.status_code == 200
    res_data = resp_proc.json()
    pe = res_data["employees"][0]

    # Expected working days: 22. Worked days: 11. Proration factor: 11/22 = 0.5
    assert float(pe["worked_days"]) == 11.0
    assert float(pe["payable_days"]) == 11.0
    assert float(pe["absent_days"]) == 11.0

    # Let's verify line calculations:
    # BASIC: 50,000 * 0.5 = 25,000
    # HRA: 40% of BASIC (25,000 * 0.40 = 10,000, or raw 20,000 * 0.5 = 10,000)
    # SPECIAL: overridden to 20,000 * 0.5 = 10,000 (not 10,000 * 0.5 = 5,000)
    # GROSS: BASIC(25,000) + HRA(10,000) + SPECIAL(10,000) = 45,000
    # PF: 12% of BASIC (25,000 * 0.12 = 3,000)
    # PT: Fixed 200 (Deduction - NOT prorated)
    # Total Deductions: 3,000 + 200 = 3,200
    # NET: 45,000 - 3,200 = 41,800
    assert float(pe["gross_salary"]) == 45000.0
    assert float(pe["total_deductions"]) == 3200.0
    assert float(pe["net_salary"]) == 41800.0

    # Retrieve generated payslip
    resp_slips = await client.get(f"/api/v1/payroll/payslips?employee_id={data['emp1'].id}", headers=hr_headers)
    assert resp_slips.status_code == 200
    slip_id = resp_slips.json()["items"][0]["id"]

    resp_slip_detail = await client.get(f"/api/v1/payroll/payslips/{slip_id}", headers=hr_headers)
    assert resp_slip_detail.status_code == 200
    lines = {l["code"]: float(l["amount"]) for l in resp_slip_detail.json()["lines"]}
    assert lines["BASIC"] == 25000.0
    assert lines["HRA"] == 10000.0
    assert lines["SPECIAL"] == 10000.0
    assert lines["PF"] == 3000.0
    assert lines["PT"] == 200.0


@pytest.mark.asyncio
async def test_formula_rule_evaluation_and_undefined_variable_error(client: AsyncClient, db_session: AsyncSession):
    data = await setup_payroll_test_data(db_session)
    hr_headers = auth_header(data["hr"])

    # Create a rule with valid formula: BONUS = (BASIC + HRA) * 0.10
    rule_bonus = SalaryRule(
        organization_id=data["org"].id,
        name="Bonus",
        code="BONUS",
        category=SalaryRuleCategory.ALLOWANCE,
        calculation_type=CalculationType.FORMULA,
        formula="(BASIC + HRA) * 0.10",
        sequence=6,
    )
    # Create a rule with INVALID/UNDEFINED variable formula: BAD = UNKNOWN_VAR * 2
    rule_bad = SalaryRule(
        organization_id=data["org"].id,
        name="Bad Rule",
        code="BAD",
        category=SalaryRuleCategory.DEDUCTION,
        calculation_type=CalculationType.FORMULA,
        formula="UNKNOWN_VAR * 2",
        sequence=7,
    )
    db_session.add_all([rule_bonus, rule_bad])
    await db_session.commit()

    sr_bonus = SalaryStructureRule(organization_id=data["org"].id, salary_structure_id=data["struct_std"].id, salary_rule_id=rule_bonus.id, sequence=6)
    sr_bad = SalaryStructureRule(organization_id=data["org"].id, salary_structure_id=data["struct_std"].id, salary_rule_id=rule_bad.id, sequence=7)
    db_session.add_all([sr_bonus, sr_bad])
    await db_session.commit()

    # Create and process payrun
    resp_create = await client.post(
        "/api/v1/payroll/payruns",
        json={
            "name": "Formula Test Payrun",
            "period_start": "2026-09-01",
            "period_end": "2026-09-30",
            "month": 9,
            "year": 2026,
            "employee_ids": [str(data["emp1"].id)],
        },
        headers=hr_headers,
    )
    payrun_id = resp_create.json()["id"]

    resp_proc = await client.post(f"/api/v1/payroll/payruns/{payrun_id}/process", headers=hr_headers)
    assert resp_proc.status_code == 200
    res_data = resp_proc.json()

    # Formula evaluation error should be captured as an ERROR issue
    assert res_data["employees"][0]["status"] == PayrunEmployeeStatus.ISSUE.value
    assert res_data["employees"][0]["is_ready"] is False
    assert any(i["issue_code"] == "FORMULA_EVALUATION_ERROR" and "UNKNOWN_VAR" in i["description"] for i in res_data["issues"])


@pytest.mark.asyncio
async def test_payrun_finalization_and_payslip_paid_status(client: AsyncClient, db_session: AsyncSession):
    data = await setup_payroll_test_data(db_session)
    hr_headers = auth_header(data["hr"])

    # Create payrun for emp1 only (clean setup)
    resp_create = await client.post(
        "/api/v1/payroll/payruns",
        json={
            "name": "Finalization Payrun",
            "period_start": "2026-09-01",
            "period_end": "2026-09-30",
            "month": 9,
            "year": 2026,
            "employee_ids": [str(data["emp1"].id)],
        },
        headers=hr_headers,
    )
    payrun_id = resp_create.json()["id"]

    # Process Payrun
    resp_proc = await client.post(f"/api/v1/payroll/payruns/{payrun_id}/process", headers=hr_headers)
    assert resp_proc.status_code == 200
    assert resp_proc.json()["employees"][0]["is_ready"] is True

    # Finalize Payrun
    resp_fin = await client.post(f"/api/v1/payroll/payruns/{payrun_id}/finalize", headers=hr_headers)
    assert resp_fin.status_code == 200
    fin_data = resp_fin.json()
    assert fin_data["status"] == PayrunStatus.FINALIZED.value
    assert fin_data["finalized_at"] is not None

    # Verify payslip status is now PAID
    resp_slip = await client.get(f"/api/v1/payroll/payslips?employee_id={data['emp1'].id}", headers=hr_headers)
    assert resp_slip.status_code == 200
    slip = resp_slip.json()["items"][0]
    assert slip["status"] == PayslipStatus.PAID.value
    assert slip["paid_at"] is not None


@pytest.mark.asyncio
async def test_email_delivery_and_pdf_generation(client: AsyncClient, db_session: AsyncSession):
    data = await setup_payroll_test_data(db_session)
    hr_headers = auth_header(data["hr"])
    emp1_headers = auth_header(data["emp1_user"])

    # 1. Create & process payrun
    resp_create = await client.post(
        "/api/v1/payroll/payruns",
        json={
            "name": "Email & PDF Test Payrun",
            "period_start": "2026-09-01",
            "period_end": "2026-09-30",
            "month": 9,
            "year": 2026,
            "employee_ids": [str(data["emp1"].id)],
        },
        headers=hr_headers,
    )
    payrun_id = resp_create.json()["id"]
    await client.post(f"/api/v1/payroll/payruns/{payrun_id}/process", headers=hr_headers)

    # 2. Emailing a DRAFT / PROCESSED payrun before finalization is rejected (400)
    resp_email_unfin = await client.post(f"/api/v1/payroll/payruns/{payrun_id}/email", headers=hr_headers)
    assert resp_email_unfin.status_code == 400

    # 3. Finalize payrun
    await client.post(f"/api/v1/payroll/payruns/{payrun_id}/finalize", headers=hr_headers)

    # 4. Email payrun succeeds
    resp_email = await client.post(f"/api/v1/payroll/payruns/{payrun_id}/email", headers=hr_headers)
    assert resp_email.status_code == 200
    email_res = resp_email.json()
    assert email_res["total_payslips"] == 1
    assert email_res["sent_count"] == 1

    # 5. Fetch payslip PDF endpoint
    resp_slips = await client.get(f"/api/v1/payroll/payslips?employee_id={data['emp1'].id}", headers=hr_headers)
    slip_id = resp_slips.json()["items"][0]["id"]

    resp_pdf = await client.get(f"/api/v1/payroll/payslips/{slip_id}?format=pdf", headers=emp1_headers)
    assert resp_pdf.status_code == 200
    assert resp_pdf.headers["content-type"] == "application/pdf"
    assert resp_pdf.content.startswith(b"%PDF")


@pytest.mark.asyncio
async def test_employee_payslip_isolation_and_rbac(client: AsyncClient, db_session: AsyncSession):
    data = await setup_payroll_test_data(db_session)
    hr_headers = auth_header(data["hr"])
    emp1_headers = auth_header(data["emp1_user"])
    emp2_headers = auth_header(data["emp2_user"])

    # Create & finalize payrun for emp1
    resp_create = await client.post(
        "/api/v1/payroll/payruns",
        json={
            "name": "Scoping Test Payrun",
            "period_start": "2026-09-01",
            "period_end": "2026-09-30",
            "month": 9,
            "year": 2026,
            "employee_ids": [str(data["emp1"].id)],
        },
        headers=hr_headers,
    )
    payrun_id = resp_create.json()["id"]
    await client.post(f"/api/v1/payroll/payruns/{payrun_id}/process", headers=hr_headers)
    await client.post(f"/api/v1/payroll/payruns/{payrun_id}/finalize", headers=hr_headers)

    # Fetch emp1 payslip ID
    resp_slip = await client.get("/api/v1/payroll/payslips", headers=emp1_headers)
    assert resp_slip.status_code == 200
    assert len(resp_slip.json()["items"]) == 1
    slip_id = resp_slip.json()["items"][0]["id"]

    # emp2 cannot view emp1 payslip (403)
    resp_unauth = await client.get(f"/api/v1/payroll/payslips/{slip_id}", headers=emp2_headers)
    assert resp_unauth.status_code == 403

    # emp2 querying GET /payslips?employee_id=<emp1> is forced to own and sees 0 items
    resp_forced = await client.get(f"/api/v1/payroll/payslips?employee_id={data['emp1'].id}", headers=emp2_headers)
    assert resp_forced.status_code == 200
    assert len(resp_forced.json()["items"]) == 0


@pytest.mark.asyncio
async def test_payroll_dashboard_endpoint(client: AsyncClient, db_session: AsyncSession):
    data = await setup_payroll_test_data(db_session)
    hr_headers = auth_header(data["hr"])
    emp1_headers = auth_header(data["emp1_user"])

    # 1. Non-payroll role gets 403
    resp_unauth = await client.get("/api/v1/payroll/dashboard", headers=emp1_headers)
    assert resp_unauth.status_code == 403

    # 2. HR gets dashboard summary
    resp = await client.get("/api/v1/payroll/dashboard", headers=hr_headers)
    assert resp.status_code == 200
    dash = resp.json()
    assert "latest_payrun" in dash
    assert "ytd_gross" in dash
    assert "ytd_net" in dash
    assert dash["total_employees"] == 3
