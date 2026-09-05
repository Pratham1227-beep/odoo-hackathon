from datetime import date, datetime, time, timedelta, timezone
from decimal import Decimal
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import create_access_token, hash_password
from app.features.attendance.models import Attendance, AttendanceCorrection, Holiday
from app.features.auth.models import Organization, User
from app.features.employees.models import Employee
from app.features.payroll_config.models import SystemConfig
from app.shared.enums import (
    AttendanceSource,
    AttendanceStatus,
    CorrectionStatus,
    EmployeeStatus,
    EmploymentType,
    Gender,
    HolidayType,
    UserRole,
    UserStatus,
)


async def setup_attendance_test_data(db_session: AsyncSession):
    # 1. Organizations
    org1 = Organization(name="Acme Corp", code="ACM", email="acme@corp.com", timezone="UTC")
    org2 = Organization(name="Beta LLC", code="BET", email="beta@corp.com", timezone="UTC")
    db_session.add_all([org1, org2])
    await db_session.commit()
    await db_session.refresh(org1)
    await db_session.refresh(org2)

    # 2. SystemConfig for late grace minutes in Org 1
    cfg1 = SystemConfig(
        organization_id=org1.id,
        key="attendance.late_grace_minutes",
        value="10",
        category="attendance",
        description="Late arrival grace minutes",
    )
    db_session.add(cfg1)

    # 3. Users in Org 1
    u_admin = User(organization_id=org1.id, email="admin@acm.com", password_hash=hash_password("pw"), role=UserRole.ADMIN, status=UserStatus.ACTIVE)
    u_hr = User(organization_id=org1.id, email="hr@acm.com", password_hash=hash_password("pw"), role=UserRole.HR_MANAGER, status=UserStatus.ACTIVE)
    u_emp1 = User(organization_id=org1.id, email="emp1@acm.com", password_hash=hash_password("pw"), role=UserRole.EMPLOYEE, status=UserStatus.ACTIVE)
    u_emp2 = User(organization_id=org1.id, email="emp2@acm.com", password_hash=hash_password("pw"), role=UserRole.EMPLOYEE, status=UserStatus.ACTIVE)

    # User in Org 2
    u_org2_hr = User(organization_id=org2.id, email="hr@bet.com", password_hash=hash_password("pw"), role=UserRole.HR_MANAGER, status=UserStatus.ACTIVE)

    db_session.add_all([u_admin, u_hr, u_emp1, u_emp2, u_org2_hr])
    await db_session.commit()

    # 4. Employees in Org 1
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
    db_session.add_all([emp1, emp2])
    await db_session.commit()
    await db_session.refresh(emp1)
    await db_session.refresh(emp2)

    tokens = {
        "admin": create_access_token(u_admin.id, org1.id, UserRole.ADMIN.value, 0),
        "hr": create_access_token(u_hr.id, org1.id, UserRole.HR_MANAGER.value, 0),
        "emp1": create_access_token(u_emp1.id, org1.id, UserRole.EMPLOYEE.value, 0),
        "emp2": create_access_token(u_emp2.id, org1.id, UserRole.EMPLOYEE.value, 0),
        "org2_hr": create_access_token(u_org2_hr.id, org2.id, UserRole.HR_MANAGER.value, 0),
    }

    return {
        "org1": org1,
        "org2": org2,
        "tokens": tokens,
        "users": {"admin": u_admin, "hr": u_hr, "emp1": u_emp1, "emp2": u_emp2},
        "employees": {"emp1": emp1, "emp2": emp2},
    }


@pytest.mark.asyncio
async def test_clock_in_and_clock_out_flow(client: AsyncClient, db_session: AsyncSession):
    data = await setup_attendance_test_data(db_session)
    headers_emp1 = {"Authorization": f"Bearer {data['tokens']['emp1']}"}

    # 1. GET /attendance/today before clock-in -> returns null/None
    res_today_before = await client.get("/api/v1/attendance/today", headers=headers_emp1)
    assert res_today_before.status_code == 200
    assert res_today_before.json() is None

    # 2. Clock-out before clock-in -> rejected (400)
    res_clock_out_fail = await client.post("/api/v1/attendance/clock-out", headers=headers_emp1)
    assert res_clock_out_fail.status_code == 400

    # 3. Successful Clock-in
    res_in = await client.post("/api/v1/attendance/clock-in", headers=headers_emp1)
    assert res_in.status_code == 200
    in_data = res_in.json()
    assert in_data["employee_id"] == str(data["employees"]["emp1"].id)
    assert in_data["clock_in"] is not None
    assert in_data["source"] == "SELF"

    # 4. Duplicate Clock-in on same day -> rejected (409 Conflict)
    res_in_dup = await client.post("/api/v1/attendance/clock-in", headers=headers_emp1)
    assert res_in_dup.status_code == 409

    # 5. GET /attendance/today after clock-in -> returns today's record
    res_today_after = await client.get("/api/v1/attendance/today", headers=headers_emp1)
    assert res_today_after.status_code == 200
    assert res_today_after.json()["id"] == in_data["id"]

    # 6. Successful Clock-out
    res_out = await client.post("/api/v1/attendance/clock-out", headers=headers_emp1)
    assert res_out.status_code == 200
    out_data = res_out.json()
    assert out_data["clock_out"] is not None
    assert out_data["work_hours"] is not None

    # 7. Duplicate Clock-out on same day -> rejected (409 Conflict)
    res_out_dup = await client.post("/api/v1/attendance/clock-out", headers=headers_emp1)
    assert res_out_dup.status_code == 409


@pytest.mark.asyncio
async def test_hours_and_status_computation_scenarios(client: AsyncClient, db_session: AsyncSession):
    data = await setup_attendance_test_data(db_session)
    headers_hr = {"Authorization": f"Bearer {data['tokens']['hr']}"}
    emp1_id = data["employees"]["emp1"].id
    org1_id = data["org1"].id

    # Scenario A: On-time full day (9:00 AM to 6:00 PM, 9 gross hrs - 1 hr break = 8.0 work hrs, 0 OT -> PRESENT)
    t_in_ontime = datetime(2025, 3, 10, 9, 5, 0, tzinfo=timezone.utc)
    t_out_ontime = datetime(2025, 3, 10, 18, 5, 0, tzinfo=timezone.utc)

    att_ontime = Attendance(
        organization_id=org1_id,
        employee_id=emp1_id,
        date=date(2025, 3, 10),
        clock_in=t_in_ontime,
    )
    db_session.add(att_ontime)
    await db_session.commit()
    await db_session.refresh(att_ontime)

    res_patch_ontime = await client.patch(
        f"/api/v1/attendance/{att_ontime.id}",
        headers=headers_hr,
        json={"clock_out": t_out_ontime.isoformat()},
    )
    assert res_patch_ontime.status_code == 200
    d_ontime = res_patch_ontime.json()
    assert float(d_ontime["work_hours"]) == 8.0
    assert float(d_ontime["overtime_hours"]) == 0.0
    assert d_ontime["status"] == "PRESENT"
    assert d_ontime["source"] == "MANUAL"

    # Scenario B: Late arrival beyond 10 min grace (9:30 AM to 6:30 PM, 9 gross hrs - 1 hr break = 8.0 work hrs -> LATE)
    t_in_late = datetime(2025, 3, 11, 9, 30, 0, tzinfo=timezone.utc)
    t_out_late = datetime(2025, 3, 11, 18, 30, 0, tzinfo=timezone.utc)

    att_late = Attendance(
        organization_id=org1_id,
        employee_id=emp1_id,
        date=date(2025, 3, 11),
        clock_in=t_in_late,
    )
    db_session.add(att_late)
    await db_session.commit()
    await db_session.refresh(att_late)

    res_patch_late = await client.patch(
        f"/api/v1/attendance/{att_late.id}",
        headers=headers_hr,
        json={"clock_out": t_out_late.isoformat()},
    )
    assert res_patch_late.status_code == 200
    d_late = res_patch_late.json()
    assert float(d_late["work_hours"]) == 8.0
    assert d_late["status"] == "LATE"

    # Scenario C: Overtime scenario (9:00 AM to 9:00 PM, 12 gross hrs - 1 hr break = 11.0 work hrs -> 3.0 OT)
    t_in_ot = datetime(2025, 3, 12, 9, 0, 0, tzinfo=timezone.utc)
    t_out_ot = datetime(2025, 3, 12, 21, 0, 0, tzinfo=timezone.utc)

    att_ot = Attendance(
        organization_id=org1_id,
        employee_id=emp1_id,
        date=date(2025, 3, 12),
        clock_in=t_in_ot,
    )
    db_session.add(att_ot)
    await db_session.commit()
    await db_session.refresh(att_ot)

    res_patch_ot = await client.patch(
        f"/api/v1/attendance/{att_ot.id}",
        headers=headers_hr,
        json={"clock_out": t_out_ot.isoformat()},
    )
    assert res_patch_ot.status_code == 200
    d_ot = res_patch_ot.json()
    assert float(d_ot["work_hours"]) == 11.0
    assert float(d_ot["overtime_hours"]) == 3.0
    assert d_ot["status"] == "PRESENT"

    # Scenario D: Half-day scenario (< 4.0 work hours, e.g. 9:00 AM to 1:00 PM, 4 gross - 1 hr break = 3.0 work hrs -> HALF_DAY)
    t_in_half = datetime(2025, 3, 13, 9, 0, 0, tzinfo=timezone.utc)
    t_out_half = datetime(2025, 3, 13, 13, 0, 0, tzinfo=timezone.utc)

    att_half = Attendance(
        organization_id=org1_id,
        employee_id=emp1_id,
        date=date(2025, 3, 13),
        clock_in=t_in_half,
    )
    db_session.add(att_half)
    await db_session.commit()
    await db_session.refresh(att_half)

    res_patch_half = await client.patch(
        f"/api/v1/attendance/{att_half.id}",
        headers=headers_hr,
        json={"clock_out": t_out_half.isoformat()},
    )
    assert res_patch_half.status_code == 200
    d_half = res_patch_half.json()
    assert float(d_half["work_hours"]) == 3.0
    assert d_half["status"] == "HALF_DAY"


@pytest.mark.asyncio
async def test_employee_attendance_scoping_and_rbac(client: AsyncClient, db_session: AsyncSession):
    data = await setup_attendance_test_data(db_session)
    headers_emp1 = {"Authorization": f"Bearer {data['tokens']['emp1']}"}
    headers_hr = {"Authorization": f"Bearer {data['tokens']['hr']}"}
    emp1_id = data["employees"]["emp1"].id
    emp2_id = data["employees"]["emp2"].id
    org1_id = data["org1"].id

    # Create attendance for emp1 and emp2
    att1 = Attendance(
        organization_id=org1_id,
        employee_id=emp1_id,
        date=date(2025, 3, 1),
        status=AttendanceStatus.PRESENT,
    )
    att2 = Attendance(
        organization_id=org1_id,
        employee_id=emp2_id,
        date=date(2025, 3, 1),
        status=AttendanceStatus.PRESENT,
    )
    db_session.add_all([att1, att2])
    await db_session.commit()

    # 1. EMPLOYEE role queries GET /attendance without params -> sees only own record
    res_list_self = await client.get("/api/v1/attendance", headers=headers_emp1)
    assert res_list_self.status_code == 200
    items = res_list_self.json()["items"]
    assert len(items) == 1
    assert items[0]["employee_id"] == str(emp1_id)

    # 2. EMPLOYEE role attempts to query someone else (emp2) -> silently forced back to own ID!
    res_list_tamper = await client.get(f"/api/v1/attendance?employee_id={emp2_id}", headers=headers_emp1)
    assert res_list_tamper.status_code == 200
    items_tamper = res_list_tamper.json()["items"]
    assert len(items_tamper) == 1
    assert items_tamper[0]["employee_id"] == str(emp1_id)  # Forced to emp1!

    # 3. HR_MANAGER queries with employee_id=emp2 -> sees emp2
    res_list_hr = await client.get(f"/api/v1/attendance?employee_id={emp2_id}", headers=headers_hr)
    assert res_list_hr.status_code == 200
    assert len(res_list_hr.json()["items"]) == 1
    assert res_list_hr.json()["items"][0]["employee_id"] == str(emp2_id)


@pytest.mark.asyncio
async def test_attendance_correction_request_and_review_workflow(client: AsyncClient, db_session: AsyncSession):
    data = await setup_attendance_test_data(db_session)
    headers_emp1 = {"Authorization": f"Bearer {data['tokens']['emp1']}"}
    headers_emp2 = {"Authorization": f"Bearer {data['tokens']['emp2']}"}
    headers_hr = {"Authorization": f"Bearer {data['tokens']['hr']}"}
    emp1_id = data["employees"]["emp1"].id
    org1_id = data["org1"].id

    # Create Attendance for emp1
    att1 = Attendance(
        organization_id=org1_id,
        employee_id=emp1_id,
        date=date(2025, 3, 5),
        clock_in=datetime(2025, 3, 5, 9, 30, 0, tzinfo=timezone.utc),
        clock_out=datetime(2025, 3, 5, 18, 30, 0, tzinfo=timezone.utc),
        work_hours=Decimal("8.00"),
        overtime_hours=Decimal("0.00"),
        status=AttendanceStatus.LATE,
        source=AttendanceSource.SELF,
    )
    db_session.add(att1)
    await db_session.commit()
    await db_session.refresh(att1)

    # 1. emp2 attempts to request correction for emp1's attendance -> Forbidden (403)
    res_req_forbidden = await client.post(
        f"/api/v1/attendance/{att1.id}/corrections",
        headers=headers_emp2,
        json={
            "requested_clock_in": "2025-03-05T09:00:00Z",
            "requested_clock_out": "2025-03-05T18:00:00Z",
            "reason": "Tamper test",
        },
    )
    assert res_req_forbidden.status_code == 403

    # 2. emp1 requests correction for own attendance -> Created (201)
    res_req = await client.post(
        f"/api/v1/attendance/{att1.id}/corrections",
        headers=headers_emp1,
        json={
            "requested_clock_in": "2025-03-05T09:00:00Z",
            "requested_clock_out": "2025-03-05T18:00:00Z",
            "reason": "Forgot badge scan, arrived at 9:00 AM sharp",
        },
    )
    assert res_req.status_code == 201
    corr_data = res_req.json()
    assert corr_data["status"] == "PENDING"
    corr_id = corr_data["id"]

    # 3. HR lists corrections
    res_corr_list = await client.get("/api/v1/attendance/corrections?status=PENDING", headers=headers_hr)
    assert res_corr_list.status_code == 200
    assert len(res_corr_list.json()["items"]) >= 1

    # 4. HR approves correction -> parent Attendance updated and recalculated to PRESENT
    res_approve = await client.patch(
        f"/api/v1/attendance/corrections/{corr_id}",
        headers=headers_hr,
        json={
            "status": "APPROVED",
            "review_comment": "Approved per security log verification",
        },
    )
    assert res_approve.status_code == 200
    assert res_approve.json()["status"] == "APPROVED"
    assert res_approve.json()["reviewed_by_id"] == str(data["users"]["hr"].id)

    # Verify parent Attendance was updated
    await db_session.refresh(att1)
    assert att1.status == AttendanceStatus.PRESENT
    assert att1.source == AttendanceSource.MANUAL
    assert att1.updated_by_id == data["users"]["hr"].id
    assert float(att1.work_hours) == 8.0

    # 5. Create another attendance and correction to test REJECTED
    att_reject = Attendance(
        organization_id=org1_id,
        employee_id=emp1_id,
        date=date(2025, 3, 6),
        clock_in=datetime(2025, 3, 6, 10, 0, 0, tzinfo=timezone.utc),
        clock_out=datetime(2025, 3, 6, 18, 0, 0, tzinfo=timezone.utc),
        work_hours=Decimal("7.00"),
        status=AttendanceStatus.LATE,
    )
    db_session.add(att_reject)
    await db_session.commit()
    await db_session.refresh(att_reject)

    res_req2 = await client.post(
        f"/api/v1/attendance/{att_reject.id}/corrections",
        headers=headers_emp1,
        json={
            "requested_clock_in": "2025-03-06T09:00:00Z",
            "reason": "Traffic delay",
        },
    )
    corr2_id = res_req2.json()["id"]

    res_reject = await client.patch(
        f"/api/v1/attendance/corrections/{corr2_id}",
        headers=headers_hr,
        json={
            "status": "REJECTED",
            "review_comment": "Not valid justification",
        },
    )
    assert res_reject.status_code == 200
    assert res_reject.json()["status"] == "REJECTED"

    # Parent attendance remains untouched (LATE)
    await db_session.refresh(att_reject)
    assert att_reject.status == AttendanceStatus.LATE


@pytest.mark.asyncio
async def test_attendance_summary_endpoint(client: AsyncClient, db_session: AsyncSession):
    data = await setup_attendance_test_data(db_session)
    headers_emp1 = {"Authorization": f"Bearer {data['tokens']['emp1']}"}
    emp1_id = data["employees"]["emp1"].id
    org1_id = data["org1"].id

    # Seed 3 attendance records for emp1 in March 2025:
    # 2025-03-03 (Mon): PRESENT, 0 OT
    # 2025-03-04 (Tue): LATE, 2.0 OT
    # 2025-03-05 (Wed): HALF_DAY, 0 OT
    # 2025-03-06 (Thu): Clocked in but NO clock_out (missing checkout!)
    att1 = Attendance(
        organization_id=org1_id,
        employee_id=emp1_id,
        date=date(2025, 3, 3),
        clock_in=datetime(2025, 3, 3, 9, 0, 0, tzinfo=timezone.utc),
        clock_out=datetime(2025, 3, 3, 18, 0, 0, tzinfo=timezone.utc),
        work_hours=Decimal("8.00"),
        overtime_hours=Decimal("0.00"),
        status=AttendanceStatus.PRESENT,
    )
    att2 = Attendance(
        organization_id=org1_id,
        employee_id=emp1_id,
        date=date(2025, 3, 4),
        clock_in=datetime(2025, 3, 4, 9, 30, 0, tzinfo=timezone.utc),
        clock_out=datetime(2025, 3, 4, 20, 30, 0, tzinfo=timezone.utc),
        work_hours=Decimal("10.00"),
        overtime_hours=Decimal("2.00"),
        status=AttendanceStatus.LATE,
    )
    att3 = Attendance(
        organization_id=org1_id,
        employee_id=emp1_id,
        date=date(2025, 3, 5),
        clock_in=datetime(2025, 3, 5, 9, 0, 0, tzinfo=timezone.utc),
        clock_out=datetime(2025, 3, 5, 13, 0, 0, tzinfo=timezone.utc),
        work_hours=Decimal("3.00"),
        overtime_hours=Decimal("0.00"),
        status=AttendanceStatus.HALF_DAY,
    )
    att4_missing = Attendance(
        organization_id=org1_id,
        employee_id=emp1_id,
        date=date(2025, 3, 6),
        clock_in=datetime(2025, 3, 6, 9, 0, 0, tzinfo=timezone.utc),
        clock_out=None,
        status=None,
    )
    # Add a holiday on 2025-03-07 (Fri)
    hol = Holiday(
        organization_id=org1_id,
        name="Holi Festival",
        date=date(2025, 3, 7),
        type=HolidayType.PUBLIC,
        is_paid=True,
    )

    db_session.add_all([att1, att2, att3, att4_missing, hol])
    await db_session.commit()

    # Query summary for 2025-03-01 to 2025-03-07 (7 days: 5 weekdays: Mon-Fri)
    res = await client.get(
        "/api/v1/attendance/summary?from=2025-03-01&to=2025-03-07",
        headers=headers_emp1,
    )
    assert res.status_code == 200
    summary = res.json()
    assert summary["employee_id"] == str(emp1_id)
    assert summary["present_days"] == 1
    assert summary["late_days"] == 1
    assert summary["half_days"] == 1
    assert summary["total_overtime_hours"] == 2.0
    assert summary["missing_checkout_count"] >= 1
    assert "note" in summary
    assert "absent_days excludes approved leave" in summary["note"]


@pytest.mark.asyncio
async def test_holiday_crud_and_rbac(client: AsyncClient, db_session: AsyncSession):
    data = await setup_attendance_test_data(db_session)
    headers_emp1 = {"Authorization": f"Bearer {data['tokens']['emp1']}"}
    headers_hr = {"Authorization": f"Bearer {data['tokens']['hr']}"}
    headers_org2_hr = {"Authorization": f"Bearer {data['tokens']['org2_hr']}"}

    # 1. Plain employee attempting to create holiday -> 403
    res_emp_create = await client.post(
        "/api/v1/holidays",
        headers=headers_emp1,
        json={
            "name": "New Year Day",
            "date": "2026-01-01",
            "type": "PUBLIC",
            "is_paid": True,
        },
    )
    assert res_emp_create.status_code == 403

    # 2. HR creates holiday in Org 1
    res_create = await client.post(
        "/api/v1/holidays",
        headers=headers_hr,
        json={
            "name": "Republic Day",
            "date": "2026-01-26",
            "type": "PUBLIC",
            "description": "National holiday",
            "is_paid": True,
        },
    )
    assert res_create.status_code == 201
    h_data = res_create.json()
    assert h_data["name"] == "Republic Day"
    h_id = h_data["id"]

    # 3. Duplicate holiday on same date in same Org -> 409
    res_dup = await client.post(
        "/api/v1/holidays",
        headers=headers_hr,
        json={
            "name": "Republic Day Duplicate",
            "date": "2026-01-26",
            "type": "PUBLIC",
        },
    )
    assert res_dup.status_code == 409

    # 4. Plain employee CAN list holidays in own organization
    res_emp_list = await client.get("/api/v1/holidays?year=2026", headers=headers_emp1)
    assert res_emp_list.status_code == 200
    holidays = res_emp_list.json()
    assert len(holidays) == 1
    assert holidays[0]["name"] == "Republic Day"

    # 5. Org 2 HR lists holidays -> isolated, sees 0
    res_org2_list = await client.get("/api/v1/holidays?year=2026", headers=headers_org2_hr)
    assert res_org2_list.status_code == 200
    assert len(res_org2_list.json()) == 0

    # 6. HR updates holiday
    res_patch = await client.patch(
        f"/api/v1/holidays/{h_id}",
        headers=headers_hr,
        json={"description": "Updated national holiday description"},
    )
    assert res_patch.status_code == 200
    assert res_patch.json()["description"] == "Updated national holiday description"
