from datetime import date, datetime, timedelta, timezone
from decimal import Decimal
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import create_access_token, hash_password
from app.features.attendance.models import Holiday
from app.features.auth.models import Organization, User
from app.features.employees.models import Employee
from app.features.time_off.models import LeaveAllocation, LeaveRequest, LeaveType
from app.shared.enums import (
    EmployeeStatus,
    EmploymentType,
    Gender,
    HolidayType,
    LeaveRequestStatus,
    UserRole,
    UserStatus,
)


async def setup_time_off_test_data(db_session: AsyncSession):
    # 1. Organizations
    org1 = Organization(name="Acme Corp", code="ACM", email="acme@corp.com", timezone="UTC")
    org2 = Organization(name="Beta LLC", code="BET", email="beta@corp.com", timezone="UTC")
    db_session.add_all([org1, org2])
    await db_session.commit()
    await db_session.refresh(org1)
    await db_session.refresh(org2)

    # 2. Users in Org 1
    u_admin = User(organization_id=org1.id, email="admin@acm.com", password_hash=hash_password("pw"), role=UserRole.ADMIN, status=UserStatus.ACTIVE)
    u_hr = User(organization_id=org1.id, email="hr@acm.com", password_hash=hash_password("pw"), role=UserRole.HR_MANAGER, status=UserStatus.ACTIVE)
    u_emp1 = User(organization_id=org1.id, email="emp1@acm.com", password_hash=hash_password("pw"), role=UserRole.EMPLOYEE, status=UserStatus.ACTIVE)
    u_emp2 = User(organization_id=org1.id, email="emp2@acm.com", password_hash=hash_password("pw"), role=UserRole.EMPLOYEE, status=UserStatus.ACTIVE)

    # Users in Org 2
    u_org2_hr = User(organization_id=org2.id, email="hr@bet.com", password_hash=hash_password("pw"), role=UserRole.HR_MANAGER, status=UserStatus.ACTIVE)
    u_org2_emp = User(organization_id=org2.id, email="emp@bet.com", password_hash=hash_password("pw"), role=UserRole.EMPLOYEE, status=UserStatus.ACTIVE)

    db_session.add_all([u_admin, u_hr, u_emp1, u_emp2, u_org2_hr, u_org2_emp])
    await db_session.commit()

    # 3. Employees in Org 1
    emp1 = Employee(
        organization_id=org1.id,
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
        organization_id=org1.id,
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

    # Employee in Org 2
    emp_org2 = Employee(
        organization_id=org2.id,
        user_id=u_org2_emp.id,
        employee_code="BET001",
        first_name="Charlie",
        last_name="Brown",
        email="emp@bet.com",
        gender=Gender.MALE,
        joining_date=date(2024, 1, 1),
        employment_type=EmploymentType.FULL_TIME,
        status=EmployeeStatus.ACTIVE,
    )

    db_session.add_all([emp1, emp2, emp_org2])
    await db_session.commit()

    # 4. Seed a Holiday in Org 1 on a Wednesday: 2026-09-09
    holiday1 = Holiday(
        organization_id=org1.id,
        name="Tech Festival",
        date=date(2026, 9, 9),  # Wednesday
        type=HolidayType.PUBLIC,
        is_paid=True,
    )
    db_session.add(holiday1)
    await db_session.commit()

    return {
        "org1": org1,
        "org2": org2,
        "admin": u_admin,
        "hr": u_hr,
        "emp1_user": u_emp1,
        "emp2_user": u_emp2,
        "emp1": emp1,
        "emp2": emp2,
        "org2_hr": u_org2_hr,
        "org2_emp_user": u_org2_emp,
        "org2_emp": emp_org2,
        "holiday": holiday1,
    }


def auth_header(user: User) -> dict:
    token = create_access_token(
        user_id=str(user.id),
        org_id=str(user.organization_id),
        role=user.role.value if hasattr(user.role, "value") else str(user.role),
        token_version=user.token_version,
    )
    return {"Authorization": f"Bearer {token}"}



@pytest.mark.asyncio
async def test_leave_types_crud_and_rbac(client: AsyncClient, db_session: AsyncSession):
    data = await setup_time_off_test_data(db_session)
    hr_headers = auth_header(data["hr"])
    emp_headers = auth_header(data["emp1_user"])

    # 1. Non-HR cannot create leave type (403)
    resp = await client.post(
        "/api/v1/time-off/types",
        json={
            "name": "Casual Leave",
            "code": "cl",
            "default_days": 12.0,
            "requires_approval": True,
        },
        headers=emp_headers,
    )
    assert resp.status_code == 403

    # 2. HR can create leave type
    resp = await client.post(
        "/api/v1/time-off/types",
        json={
            "name": "Casual Leave",
            "code": "cl",
            "default_days": 12.0,
            "carry_forward": True,
            "max_carry_forward": 5.0,
            "requires_approval": True,
        },
        headers=hr_headers,
    )
    assert resp.status_code == 201
    cl_data = resp.json()
    assert cl_data["code"] == "CL"
    assert float(cl_data["default_days"]) == 12.0
    assert cl_data["carry_forward"] is True
    assert float(cl_data["max_carry_forward"]) == 5.0

    # 3. Duplicate code in same org rejected (409)
    resp_dup = await client.post(
        "/api/v1/time-off/types",
        json={
            "name": "Casual Leave 2",
            "code": "CL",
            "default_days": 10.0,
        },
        headers=hr_headers,
    )
    assert resp_dup.status_code == 409

    # 4. Any authenticated user can list leave types
    resp_list = await client.get("/api/v1/time-off/types", headers=emp_headers)
    assert resp_list.status_code == 200
    types = resp_list.json()
    assert len(types) == 1
    assert types[0]["code"] == "CL"


@pytest.mark.asyncio
async def test_leave_allocations_crud_and_scoping(client: AsyncClient, db_session: AsyncSession):
    data = await setup_time_off_test_data(db_session)
    hr_headers = auth_header(data["hr"])
    emp1_headers = auth_header(data["emp1_user"])
    emp2_headers = auth_header(data["emp2_user"])

    # Create Leave Type
    resp_lt = await client.post(
        "/api/v1/time-off/types",
        json={
            "name": "Paid Time Off",
            "code": "PTO",
            "default_days": 20.0,
            "requires_approval": True,
        },
        headers=hr_headers,
    )
    assert resp_lt.status_code == 201
    lt_id = resp_lt.json()["id"]

    # 1. Non-HR cannot create allocation (403)
    resp = await client.post(
        "/api/v1/time-off/allocations",
        json={
            "employee_id": str(data["emp1"].id),
            "leave_type_id": lt_id,
            "year": 2026,
            "allocated_days": 20.0,
        },
        headers=emp1_headers,
    )
    assert resp.status_code == 403

    # 2. HR creates allocation for emp1 (15 days) and emp2 (20 days)
    resp_alloc1 = await client.post(
        "/api/v1/time-off/allocations",
        json={
            "employee_id": str(data["emp1"].id),
            "leave_type_id": lt_id,
            "year": 2026,
            "allocated_days": 15.0,
            "remaining_days": 999.0,  # Should be ignored/not settable
        },
        headers=hr_headers,
    )
    assert resp_alloc1.status_code == 201
    alloc1_data = resp_alloc1.json()
    assert float(alloc1_data["allocated_days"]) == 15.0
    assert float(alloc1_data["used_days"]) == 0.0
    assert float(alloc1_data["remaining_days"]) == 15.0  # Server-derived

    resp_alloc2 = await client.post(
        "/api/v1/time-off/allocations",
        json={
            "employee_id": str(data["emp2"].id),
            "leave_type_id": lt_id,
            "year": 2026,
            "allocated_days": 20.0,
        },
        headers=hr_headers,
    )
    assert resp_alloc2.status_code == 201

    # 3. Duplicate allocation for same emp/type/year rejected
    resp_dup = await client.post(
        "/api/v1/time-off/allocations",
        json={
            "employee_id": str(data["emp1"].id),
            "leave_type_id": lt_id,
            "year": 2026,
            "allocated_days": 10.0,
        },
        headers=hr_headers,
    )
    assert resp_dup.status_code == 409

    # 4. EMPLOYEE querying GET /allocations is forced to own employee_id even if querying another
    resp_emp1_list = await client.get(
        f"/api/v1/time-off/allocations?employee_id={data['emp2'].id}",
        headers=emp1_headers,
    )
    assert resp_emp1_list.status_code == 200
    emp1_items = resp_emp1_list.json()
    assert len(emp1_items) == 1
    assert emp1_items[0]["employee_id"] == str(data["emp1"].id)
    assert float(emp1_items[0]["allocated_days"]) == 15.0

    # 5. HR can filter by employee_id
    resp_hr_list = await client.get(
        f"/api/v1/time-off/allocations?employee_id={data['emp2'].id}",
        headers=hr_headers,
    )
    assert resp_hr_list.status_code == 200
    hr_items = resp_hr_list.json()
    assert len(hr_items) == 1
    assert hr_items[0]["employee_id"] == str(data["emp2"].id)


@pytest.mark.asyncio
async def test_leave_request_day_computation_and_holidays(client: AsyncClient, db_session: AsyncSession):
    data = await setup_time_off_test_data(db_session)
    hr_headers = auth_header(data["hr"])
    emp1_headers = auth_header(data["emp1_user"])

    # Create Leave Type & Allocation for emp1
    resp_lt = await client.post(
        "/api/v1/time-off/types",
        json={
            "name": "Annual Leave",
            "code": "AL",
            "default_days": 25.0,
            "requires_approval": True,
        },
        headers=hr_headers,
    )
    lt_id = resp_lt.json()["id"]

    await client.post(
        "/api/v1/time-off/allocations",
        json={
            "employee_id": str(data["emp1"].id),
            "leave_type_id": lt_id,
            "year": 2026,
            "allocated_days": 25.0,
        },
        headers=hr_headers,
    )

    # Range: Monday 2026-09-07 to Sunday 2026-09-13 (7 calendar days)
    # Weekdays: Mon(09-07), Tue(09-08), Wed(09-09), Thu(09-10), Fri(09-11) -> 5 weekdays
    # Saturday(09-12), Sunday(09-13) excluded by schedule
    # Wed 2026-09-09 is seeded Holiday -> excluded
    # Expected working days: 4 days (Mon, Tue, Thu, Fri)
    resp_req = await client.post(
        "/api/v1/time-off/requests",
        json={
            "leave_type_id": lt_id,
            "start_date": "2026-09-07",
            "end_date": "2026-09-13",
            "reason": "Family vacation",
        },
        headers=emp1_headers,
    )
    assert resp_req.status_code == 201
    req_data = resp_req.json()
    assert float(req_data["days"]) == 4.0
    assert req_data["status"] == LeaveRequestStatus.PENDING.value
    assert req_data["employee_id"] == str(data["emp1"].id)


@pytest.mark.asyncio
async def test_leave_balance_validation_and_unallocated_skip(client: AsyncClient, db_session: AsyncSession):
    data = await setup_time_off_test_data(db_session)
    hr_headers = auth_header(data["hr"])
    emp1_headers = auth_header(data["emp1_user"])

    # 1. Create Allocated Leave Type with 2 days balance
    resp_lt1 = await client.post(
        "/api/v1/time-off/types",
        json={"name": "Sick Leave", "code": "SL", "default_days": 2.0, "requires_approval": True},
        headers=hr_headers,
    )
    sl_id = resp_lt1.json()["id"]

    await client.post(
        "/api/v1/time-off/allocations",
        json={"employee_id": str(data["emp1"].id), "leave_type_id": sl_id, "year": 2026, "allocated_days": 2.0},
        headers=hr_headers,
    )

    # 2. Request 3 working days (Mon 2026-09-14 to Wed 2026-09-16) -> should fail (insufficient balance)
    resp_excess = await client.post(
        "/api/v1/time-off/requests",
        json={
            "leave_type_id": sl_id,
            "start_date": "2026-09-14",
            "end_date": "2026-09-16",
            "reason": "Recovery",
        },
        headers=emp1_headers,
    )
    assert resp_excess.status_code == 400
    assert "Insufficient leave balance" in resp_excess.json()["error"]["message"]

    # 3. Create Unpaid Leave Type without allocating any quota
    resp_lt2 = await client.post(
        "/api/v1/time-off/types",
        json={"name": "Loss of Pay", "code": "LOP", "default_days": 0.0, "is_paid": False, "requires_approval": True},
        headers=hr_headers,
    )
    lop_id = resp_lt2.json()["id"]

    # Request 5 days of LOP with NO allocation row existing -> should NOT be blocked!
    resp_unallocated = await client.post(
        "/api/v1/time-off/requests",
        json={
            "leave_type_id": lop_id,
            "start_date": "2026-09-14",
            "end_date": "2026-09-18",
            "reason": "Personal time off unpaid",
        },
        headers=emp1_headers,
    )
    assert resp_unallocated.status_code == 201
    assert float(resp_unallocated.json()["days"]) == 5.0
    assert resp_unallocated.json()["status"] == LeaveRequestStatus.PENDING.value


@pytest.mark.asyncio
async def test_auto_approval_flow(client: AsyncClient, db_session: AsyncSession):
    data = await setup_time_off_test_data(db_session)
    hr_headers = auth_header(data["hr"])
    emp1_headers = auth_header(data["emp1_user"])

    # Create Leave Type with requires_approval=False
    resp_lt = await client.post(
        "/api/v1/time-off/types",
        json={
            "name": "Wellness Day",
            "code": "WD",
            "default_days": 5.0,
            "requires_approval": False,
        },
        headers=hr_headers,
    )
    wd_id = resp_lt.json()["id"]

    # Allocate 5 days
    await client.post(
        "/api/v1/time-off/allocations",
        json={"employee_id": str(data["emp1"].id), "leave_type_id": wd_id, "year": 2026, "allocated_days": 5.0},
        headers=hr_headers,
    )

    # File 2 working days: Monday 2026-09-21 to Tuesday 2026-09-22
    resp_req = await client.post(
        "/api/v1/time-off/requests",
        json={
            "leave_type_id": wd_id,
            "start_date": "2026-09-21",
            "end_date": "2026-09-22",
            "reason": "Mental health day",
        },
        headers=emp1_headers,
    )
    assert resp_req.status_code == 201
    req_data = resp_req.json()
    assert req_data["status"] == LeaveRequestStatus.APPROVED.value
    assert float(req_data["days"]) == 2.0
    assert req_data["reviewed_by_id"] == str(data["emp1_user"].id)

    # Check that allocation balance was deducted immediately
    resp_alloc = await client.get("/api/v1/time-off/allocations", headers=emp1_headers)
    assert resp_alloc.status_code == 200
    alloc = next(a for a in resp_alloc.json() if a["leave_type_id"] == wd_id)
    assert float(alloc["used_days"]) == 2.0
    assert float(alloc["remaining_days"]) == 3.0


@pytest.mark.asyncio
async def test_approval_and_rejection_workflow(client: AsyncClient, db_session: AsyncSession):
    data = await setup_time_off_test_data(db_session)
    hr_headers = auth_header(data["hr"])
    emp1_headers = auth_header(data["emp1_user"])

    # Create Leave Type & Allocation (10 days)
    resp_lt = await client.post(
        "/api/v1/time-off/types",
        json={"name": "Earned Leave", "code": "EL", "default_days": 10.0, "requires_approval": True},
        headers=hr_headers,
    )
    el_id = resp_lt.json()["id"]

    await client.post(
        "/api/v1/time-off/allocations",
        json={"employee_id": str(data["emp1"].id), "leave_type_id": el_id, "year": 2026, "allocated_days": 10.0},
        headers=hr_headers,
    )

    # 1. Request 1: 3 days (Mon 2026-10-05 to Wed 2026-10-07)
    resp_req1 = await client.post(
        "/api/v1/time-off/requests",
        json={
            "leave_type_id": el_id,
            "start_date": "2026-10-05",
            "end_date": "2026-10-07",
            "reason": "Trip",
        },
        headers=emp1_headers,
    )
    req1_id = resp_req1.json()["id"]

    # Non-HR cannot review (403)
    resp_unauth = await client.patch(
        f"/api/v1/time-off/requests/{req1_id}",
        json={"status": "APPROVED", "review_comment": "OK"},
        headers=emp1_headers,
    )
    assert resp_unauth.status_code == 403

    # HR Approves Request 1
    resp_app = await client.patch(
        f"/api/v1/time-off/requests/{req1_id}",
        json={"status": "APPROVED", "review_comment": "Enjoy your trip"},
        headers=hr_headers,
    )
    assert resp_app.status_code == 200
    assert resp_app.json()["status"] == LeaveRequestStatus.APPROVED.value
    assert resp_app.json()["review_comment"] == "Enjoy your trip"

    # Allocation used = 3, remaining = 7
    resp_alloc = await client.get("/api/v1/time-off/allocations", headers=emp1_headers)
    alloc = next(a for a in resp_alloc.json() if a["leave_type_id"] == el_id)
    assert float(alloc["used_days"]) == 3.0
    assert float(alloc["remaining_days"]) == 7.0

    # 2. Request 2: 2 days (Mon 2026-10-12 to Tue 2026-10-13)
    resp_req2 = await client.post(
        "/api/v1/time-off/requests",
        json={
            "leave_type_id": el_id,
            "start_date": "2026-10-12",
            "end_date": "2026-10-13",
            "reason": "Doctor visit",
        },
        headers=emp1_headers,
    )
    req2_id = resp_req2.json()["id"]

    # HR Rejects Request 2
    resp_rej = await client.patch(
        f"/api/v1/time-off/requests/{req2_id}",
        json={"status": "REJECTED", "review_comment": "Project deadline collision"},
        headers=hr_headers,
    )
    assert resp_rej.status_code == 200
    assert resp_rej.json()["status"] == LeaveRequestStatus.REJECTED.value

    # Allocation should remain unchanged (used = 3, remaining = 7)
    resp_alloc2 = await client.get("/api/v1/time-off/allocations", headers=emp1_headers)
    alloc2 = next(a for a in resp_alloc2.json() if a["leave_type_id"] == el_id)
    assert float(alloc2["used_days"]) == 3.0
    assert float(alloc2["remaining_days"]) == 7.0


@pytest.mark.asyncio
async def test_overlap_prevention(client: AsyncClient, db_session: AsyncSession):
    data = await setup_time_off_test_data(db_session)
    hr_headers = auth_header(data["hr"])
    emp1_headers = auth_header(data["emp1_user"])

    # Create Leave Type
    resp_lt = await client.post(
        "/api/v1/time-off/types",
        json={"name": "Personal Leave", "code": "PL", "default_days": 20.0, "requires_approval": True},
        headers=hr_headers,
    )
    pl_id = resp_lt.json()["id"]

    # First request: 2026-11-02 (Mon) to 2026-11-06 (Fri)
    resp1 = await client.post(
        "/api/v1/time-off/requests",
        json={
            "leave_type_id": pl_id,
            "start_date": "2026-11-02",
            "end_date": "2026-11-06",
            "reason": "First booking",
        },
        headers=emp1_headers,
    )
    assert resp1.status_code == 201

    # Overlapping request 2: 2026-11-04 (Wed) to 2026-11-10 (Tue) -> Rejected (400)
    resp2 = await client.post(
        "/api/v1/time-off/requests",
        json={
            "leave_type_id": pl_id,
            "start_date": "2026-11-04",
            "end_date": "2026-11-10",
            "reason": "Overlapping booking",
        },
        headers=emp1_headers,
    )
    assert resp2.status_code == 400
    assert "overlapping" in resp2.json()["error"]["message"].lower()

    # Non-overlapping request: 2026-11-09 (Mon) to 2026-11-13 (Fri) -> Allowed (201)
    resp3 = await client.post(
        "/api/v1/time-off/requests",
        json={
            "leave_type_id": pl_id,
            "start_date": "2026-11-09",
            "end_date": "2026-11-13",
            "reason": "Non overlapping booking",
        },
        headers=emp1_headers,
    )
    assert resp3.status_code == 201


@pytest.mark.asyncio
async def test_employee_request_listing_and_forced_scoping(client: AsyncClient, db_session: AsyncSession):
    data = await setup_time_off_test_data(db_session)
    hr_headers = auth_header(data["hr"])
    emp1_headers = auth_header(data["emp1_user"])
    emp2_headers = auth_header(data["emp2_user"])

    # Create Leave Type
    resp_lt = await client.post(
        "/api/v1/time-off/types",
        json={"name": "General Leave", "code": "GL", "default_days": 10.0, "requires_approval": True},
        headers=hr_headers,
    )
    gl_id = resp_lt.json()["id"]

    # emp1 files request
    await client.post(
        "/api/v1/time-off/requests",
        json={"leave_type_id": gl_id, "start_date": "2026-12-01", "end_date": "2026-12-02", "reason": "Emp1 leave"},
        headers=emp1_headers,
    )

    # emp2 files request
    await client.post(
        "/api/v1/time-off/requests",
        json={"leave_type_id": gl_id, "start_date": "2026-12-03", "end_date": "2026-12-04", "reason": "Emp2 leave"},
        headers=emp2_headers,
    )

    # emp1 attempts to query emp2's requests -> forced back to emp1's own requests
    resp = await client.get(
        f"/api/v1/time-off/requests?employee_id={data['emp2'].id}",
        headers=emp1_headers,
    )
    assert resp.status_code == 200
    items = resp.json()
    assert len(items) == 1
    assert items[0]["employee_id"] == str(data["emp1"].id)
    assert items[0]["reason"] == "Emp1 leave"

    # HR queries all requests
    resp_all = await client.get("/api/v1/time-off/requests", headers=hr_headers)
    assert resp_all.status_code == 200
    assert len(resp_all.json()) == 2

    # HR queries emp2 requests specifically
    resp_emp2 = await client.get(f"/api/v1/time-off/requests?employee_id={data['emp2'].id}", headers=hr_headers)
    assert resp_emp2.status_code == 200
    assert len(resp_emp2.json()) == 1
    assert resp_emp2.json()[0]["employee_id"] == str(data["emp2"].id)


@pytest.mark.asyncio
async def test_multi_tenant_isolation(client: AsyncClient, db_session: AsyncSession):
    data = await setup_time_off_test_data(db_session)
    org1_hr = auth_header(data["hr"])
    org2_hr = auth_header(data["org2_hr"])
    org2_emp = auth_header(data["org2_emp_user"])

    # Org1 creates leave type
    resp1 = await client.post(
        "/api/v1/time-off/types",
        json={"name": "Org1 Leave", "code": "O1L", "default_days": 10.0, "requires_approval": True},
        headers=org1_hr,
    )
    lt1_id = resp1.json()["id"]

    # Org2 HR cannot see Org1 leave type
    resp2 = await client.get("/api/v1/time-off/types", headers=org2_hr)
    assert resp2.status_code == 200
    assert len(resp2.json()) == 0

    # Org2 Employee cannot create request using Org1's leave type (404)
    resp3 = await client.post(
        "/api/v1/time-off/requests",
        json={
            "leave_type_id": lt1_id,
            "start_date": "2026-12-07",
            "end_date": "2026-12-08",
            "reason": "Cross-org hack attempt",
        },
        headers=org2_emp,
    )
    assert resp3.status_code == 404
