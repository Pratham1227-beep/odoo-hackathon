from datetime import date, datetime, timezone
from decimal import Decimal
import json
import uuid
import pytest
from httpx import AsyncClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.audit import AuditLog
from app.core.security import create_access_token, hash_password
from app.features.attendance.models import Attendance
from app.features.auth.models import Organization, User
from app.features.contracts.models import Contract
from app.features.employees.models import Employee
from app.features.notifications.models import Notification
from app.features.organization.models import Department, Designation
from app.features.payroll.models import Payrun, Payslip
from app.features.payroll_config.models import SalaryRule, SalaryStructure, SalaryStructureRule
from app.features.reports_dashboard.models import AnalyticsSnapshot
from app.shared.enums import (
    AttendanceStatus,
    CalculationType,
    ContractStatus,
    ContractType,
    EmployeeStatus,
    EmploymentType,
    Gender,
    PayrunStatus,
    PayslipStatus,
    SalaryRuleCategory,
    UserRole,
    WageType,
)


@pytest.fixture
async def setup_org_and_users(db_session: AsyncSession):
    # Org 1
    org1 = Organization(
        id=uuid.uuid4(),
        name="Org Alpha",
        code="ALPHA",
        email="alpha@test.com",
        currency="INR",
        timezone="Asia/Kolkata",
    )
    # Org 2
    org2 = Organization(
        id=uuid.uuid4(),
        name="Org Beta",
        code="BETA",
        email="beta@test.com",
        currency="INR",
        timezone="Asia/Kolkata",
    )
    db_session.add_all([org1, org2])
    await db_session.flush()

    # Users in Org 1
    admin_u = User(
        id=uuid.uuid4(),
        organization_id=org1.id,
        email="admin@alpha.com",
        password_hash=hash_password("admin123"),
        role=UserRole.ADMIN,
    )
    hr_u = User(
        id=uuid.uuid4(),
        organization_id=org1.id,
        email="hr@alpha.com",
        password_hash=hash_password("hr123"),
        role=UserRole.HR_MANAGER,
    )
    payroll_u = User(
        id=uuid.uuid4(),
        organization_id=org1.id,
        email="payroll@alpha.com",
        password_hash=hash_password("payroll123"),
        role=UserRole.HR_PAYROLL_USER,
    )
    emp_u = User(
        id=uuid.uuid4(),
        organization_id=org1.id,
        email="emp@alpha.com",
        password_hash=hash_password("emp123"),
        role=UserRole.EMPLOYEE,
    )

    # User in Org 2
    org2_admin = User(
        id=uuid.uuid4(),
        organization_id=org2.id,
        email="admin@beta.com",
        password_hash=hash_password("admin123"),
        role=UserRole.ADMIN,
    )

    db_session.add_all([admin_u, hr_u, payroll_u, emp_u, org2_admin])
    await db_session.flush()

    # Department & Designation in Org 1
    dept_eng = Department(
        id=uuid.uuid4(),
        organization_id=org1.id,
        name="Engineering",
        code="ENG",
    )
    dept_sales = Department(
        id=uuid.uuid4(),
        organization_id=org1.id,
        name="Sales",
        code="SALES",
    )
    db_session.add_all([dept_eng, dept_sales])
    await db_session.flush()

    desig_swe = Designation(
        id=uuid.uuid4(),
        organization_id=org1.id,
        department_id=dept_eng.id,
        title="Software Engineer",
        code="SWE",
    )
    db_session.add(desig_swe)
    await db_session.flush()

    # Employees in Org 1
    emp1 = Employee(
        id=uuid.uuid4(),
        organization_id=org1.id,
        user_id=emp_u.id,
        employee_code="EMP001",
        first_name="Alice",
        last_name="Alpha",
        email="emp@alpha.com",
        gender=Gender.FEMALE,
        joining_date=date(2025, 1, 1),
        department_id=dept_eng.id,
        designation_id=desig_swe.id,
        employment_type=EmploymentType.FULL_TIME,
        status=EmployeeStatus.ACTIVE,
    )
    emp2 = Employee(
        id=uuid.uuid4(),
        organization_id=org1.id,
        employee_code="EMP002",
        first_name="Bob",
        last_name="Alpha",
        email="bob@alpha.com",
        gender=Gender.MALE,
        joining_date=date(2025, 2, 1),
        department_id=dept_sales.id,
        employment_type=EmploymentType.CONTRACT,
        status=EmployeeStatus.ACTIVE,
    )
    # Employee in Org 2
    emp_org2 = Employee(
        id=uuid.uuid4(),
        organization_id=org2.id,
        employee_code="BETA001",
        first_name="Beta",
        last_name="User",
        email="beta@beta.com",
        gender=Gender.MALE,
        joining_date=date(2025, 1, 1),
        employment_type=EmploymentType.FULL_TIME,
        status=EmployeeStatus.ACTIVE,
    )
    db_session.add_all([emp1, emp2, emp_org2])
    await db_session.flush()

    # Structure and Contract
    struct = SalaryStructure(
        id=uuid.uuid4(),
        organization_id=org1.id,
        name="Standard Structure",
        code="STD",
    )
    db_session.add(struct)
    await db_session.flush()

    contract1 = Contract(
        id=uuid.uuid4(),
        organization_id=org1.id,
        employee_id=emp1.id,
        salary_structure_id=struct.id,
        contract_number="CNT-001",
        contract_type=ContractType.PERMANENT,
        start_date=date(2025, 1, 1),
        base_wage=Decimal("80000.00"),
        wage_type=WageType.MONTHLY,
        status=ContractStatus.ACTIVE,
    )
    db_session.add(contract1)
    await db_session.flush()

    await db_session.commit()

    tokens = {
        "admin": create_access_token(admin_u.id, org1.id, "ADMIN"),
        "hr": create_access_token(hr_u.id, org1.id, "HR_MANAGER"),
        "payroll": create_access_token(payroll_u.id, org1.id, "HR_PAYROLL_USER"),
        "emp": create_access_token(emp_u.id, org1.id, "EMPLOYEE"),
        "org2_admin": create_access_token(org2_admin.id, org2.id, "ADMIN"),
    }

    return {
        "org1": org1,
        "org2": org2,
        "admin_u": admin_u,
        "hr_u": hr_u,
        "payroll_u": payroll_u,
        "emp_u": emp_u,
        "emp1": emp1,
        "emp2": emp2,
        "contract1": contract1,
        "struct": struct,
        "dept_eng": dept_eng,
        "tokens": tokens,
    }


# ==========================================
# 1. RBAC on Dashboard Routes
# ==========================================

@pytest.mark.asyncio
async def test_dashboard_rbac_permissions(client: AsyncClient, setup_org_and_users):
    data = setup_org_and_users
    tokens = data["tokens"]

    # 1. Main Dashboard (/reports-dashboard)
    # HR_MANAGER must get 403 Forbidden
    resp = await client.get("/api/v1/reports-dashboard", headers={"Authorization": f"Bearer {tokens['hr']}"})
    assert resp.status_code == 403

    # HR_PAYROLL_USER and ADMIN must get 200 OK
    resp = await client.get("/api/v1/reports-dashboard", headers={"Authorization": f"Bearer {tokens['payroll']}"})
    assert resp.status_code == 200

    resp = await client.get("/api/v1/reports-dashboard", headers={"Authorization": f"Bearer {tokens['admin']}"})
    assert resp.status_code == 200

    # 2. Payroll Dashboard (/reports-dashboard/payroll)
    # HR_MANAGER must get 403 Forbidden
    resp = await client.get("/api/v1/reports-dashboard/payroll", headers={"Authorization": f"Bearer {tokens['hr']}"})
    assert resp.status_code == 403

    # Payroll roles and ADMIN get 200 OK
    resp = await client.get("/api/v1/reports-dashboard/payroll", headers={"Authorization": f"Bearer {tokens['payroll']}"})
    assert resp.status_code == 200

    # 3. Attendance Dashboard (/reports-dashboard/attendance)
    # Allowed for HR_MANAGER as well
    resp = await client.get("/api/v1/reports-dashboard/attendance", headers={"Authorization": f"Bearer {tokens['hr']}"})
    assert resp.status_code == 200

    # 4. Employees Dashboard (/reports-dashboard/employees)
    # Allowed for HR_MANAGER as well
    resp = await client.get("/api/v1/reports-dashboard/employees", headers={"Authorization": f"Bearer {tokens['hr']}"})
    assert resp.status_code == 200


# ==========================================
# 2. Monthly Trends: Historical Snapshot vs Live
# ==========================================

@pytest.mark.asyncio
async def test_monthly_trends_historical_snapshot_and_live(client: AsyncClient, db_session: AsyncSession, setup_org_and_users):
    data = setup_org_and_users
    org1 = data["org1"]
    tokens = data["tokens"]

    # Insert a historical snapshot for past month (e.g. 2026-07-01)
    snap = AnalyticsSnapshot(
        id=uuid.uuid4(),
        organization_id=org1.id,
        type="PAYROLL_MONTHLY",
        date=date(2026, 7, 1),
        data=json.dumps({
            "total_gross": 100000.00,
            "total_deductions": 15000.00,
            "total_net": 85000.00,
            "employee_count": 2,
            "avg_salary": 42500.00,
        }),
    )
    db_session.add(snap)
    await db_session.commit()

    resp = await client.get("/api/v1/reports-dashboard/payroll", headers={"Authorization": f"Bearer {tokens['payroll']}"})
    assert resp.status_code == 200
    res_data = resp.json()
    trends = res_data["monthly_trends"]
    assert len(trends) >= 2  # Historical snapshot + current month live

    # Find the historical trend
    hist_trend = next((t for t in trends if t["date"] == "2026-07-01"), None)
    assert hist_trend is not None
    assert hist_trend["is_live"] is False
    assert float(hist_trend["total_net"]) == 85000.00

    # Current month trend must be is_live=True
    live_trend = next((t for t in trends if t["is_live"] is True), None)
    assert live_trend is not None


# ==========================================
# 3. Notification Flow (Leave Approval -> Notification -> Read)
# ==========================================

@pytest.mark.asyncio
async def test_notification_workflow(client: AsyncClient, setup_org_and_users):
    data = setup_org_and_users
    tokens = data["tokens"]
    emp1 = data["emp1"]

    # 1. Create leave type via API
    resp_lt = await client.post(
        "/api/v1/time-off/types",
        json={
            "name": "Annual Leave",
            "code": "AL",
            "default_days": "15.0",
            "is_paid": True,
        },
        headers={"Authorization": f"Bearer {tokens['admin']}"},
    )
    assert resp_lt.status_code == 201
    lt_id = resp_lt.json()["id"]

    # 2. Create leave allocation for employee via API
    resp_alloc = await client.post(
        "/api/v1/time-off/allocations",
        json={
            "employee_id": str(emp1.id),
            "leave_type_id": lt_id,
            "year": 2026,
            "allocated_days": "15.0",
        },
        headers={"Authorization": f"Bearer {tokens['admin']}"},
    )
    assert resp_alloc.status_code == 201

    # 3. Create leave request via API as employee
    resp_req = await client.post(
        "/api/v1/time-off/requests",
        json={
            "leave_type_id": lt_id,
            "start_date": "2026-09-10",
            "end_date": "2026-09-11",
            "reason": "Vacation",
        },
        headers={"Authorization": f"Bearer {tokens['emp']}"},
    )
    assert resp_req.status_code == 201
    leave_req_id = resp_req.json()["id"]

    # 4. Approve leave request as Admin
    resp_app = await client.patch(
        f"/api/v1/time-off/requests/{leave_req_id}",
        json={"status": "APPROVED", "review_comment": "Approved by manager"},
        headers={"Authorization": f"Bearer {tokens['admin']}"},
    )
    assert resp_app.status_code == 200

    # 5. Employee checks notifications
    resp_notif = await client.get(
        "/api/v1/notifications",
        headers={"Authorization": f"Bearer {tokens['emp']}"},
    )
    assert resp_notif.status_code == 200
    notifs = resp_notif.json()["items"]
    assert len(notifs) >= 1
    leave_notif = next((n for n in notifs if n["type"] == "LEAVE_APPROVED"), None)
    assert leave_notif is not None
    assert leave_notif["is_read"] is False

    # 6. Mark notification as read
    resp_read = await client.patch(
        f"/api/v1/notifications/{leave_notif['id']}/read",
        headers={"Authorization": f"Bearer {tokens['emp']}"},
    )
    assert resp_read.status_code == 200
    assert resp_read.json()["is_read"] is True


# ==========================================
# 4. Audit Log Verification
# ==========================================

@pytest.mark.asyncio
async def test_audit_logs_rbac_and_generation(client: AsyncClient, setup_org_and_users):
    data = setup_org_and_users
    tokens = data["tokens"]
    emp1 = data["emp1"]
    contract1 = data["contract1"]

    # Non-admin user gets 403 on /audit-logs
    resp_forbid = await client.get("/api/v1/audit-logs", headers={"Authorization": f"Bearer {tokens['hr']}"})
    assert resp_forbid.status_code == 403

    # Admin performs employee status update
    resp_emp_up = await client.put(
        f"/api/v1/employees/{emp1.id}",
        json={"status": "ON_LEAVE"},
        headers={"Authorization": f"Bearer {tokens['admin']}"},
    )
    assert resp_emp_up.status_code == 200

    # Admin performs contract status update (triggers CONTRACTS audit log)
    resp_cnt_up = await client.patch(
        f"/api/v1/contracts/{contract1.id}",
        json={"status": "EXPIRED"},
        headers={"Authorization": f"Bearer {tokens['admin']}"},
    )
    assert resp_cnt_up.status_code == 200

    # Admin creates salary rule
    resp_rule = await client.post(
        "/api/v1/salary-rules",
        json={
            "name": "Audit Test Rule",
            "code": "AUDIT_RULE",
            "category": "ALLOWANCE",
            "calculation_type": "FIXED",
            "fixed_amount": "5000.00",
            "sequence": 25,
        },
        headers={"Authorization": f"Bearer {tokens['admin']}"},
    )
    assert resp_rule.status_code == 201

    # Admin checks audit logs
    resp_logs = await client.get("/api/v1/audit-logs", headers={"Authorization": f"Bearer {tokens['admin']}"})
    assert resp_logs.status_code == 200
    logs = resp_logs.json()["items"]
    assert len(logs) >= 3

    modules = {l["module"] for l in logs}
    assert "EMPLOYEES" in modules
    assert "CONTRACTS" in modules
    assert "SALARY_CONFIG" in modules


# ==========================================
# 5. Salary Statement (Self vs Admin vs Forbidden)
# ==========================================

@pytest.mark.asyncio
async def test_salary_statement_access_control(client: AsyncClient, setup_org_and_users):
    data = setup_org_and_users
    tokens = data["tokens"]
    emp_u = data["emp_u"]
    hr_u = data["hr_u"]

    # Employee views own salary statement -> 200 OK
    resp_self = await client.get(
        f"/api/v1/reports-dashboard/salary-statement/{emp_u.id}",
        headers={"Authorization": f"Bearer {tokens['emp']}"},
    )
    assert resp_self.status_code == 200
    assert resp_self.json()["user_id"] == str(emp_u.id)

    # HR Manager views employee salary statement -> 403 Forbidden (restricted to payroll roles/admin/self)
    resp_hr = await client.get(
        f"/api/v1/reports-dashboard/salary-statement/{emp_u.id}",
        headers={"Authorization": f"Bearer {tokens['hr']}"},
    )
    assert resp_hr.status_code == 403

    # Payroll user views employee salary statement -> 200 OK
    resp_payroll = await client.get(
        f"/api/v1/reports-dashboard/salary-statement/{emp_u.id}",
        headers={"Authorization": f"Bearer {tokens['payroll']}"},
    )
    assert resp_payroll.status_code == 200


# ==========================================
# 6. Org-Scoping Verification
# ==========================================

@pytest.mark.asyncio
async def test_org_scoping_dashboards(client: AsyncClient, setup_org_and_users):
    data = setup_org_and_users
    tokens = data["tokens"]

    # Org 1 Employees Dashboard
    resp1 = await client.get("/api/v1/reports-dashboard/employees", headers={"Authorization": f"Bearer {tokens['admin']}"})
    assert resp1.status_code == 200
    assert resp1.json()["total_employees"] == 2

    # Org 2 Employees Dashboard
    resp2 = await client.get("/api/v1/reports-dashboard/employees", headers={"Authorization": f"Bearer {tokens['org2_admin']}"})
    assert resp2.status_code == 200
    assert resp2.json()["total_employees"] == 1
