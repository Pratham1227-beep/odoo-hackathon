from datetime import date, timedelta
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.features.auth.models import Organization, User
from app.features.employees.models import Employee
from app.shared.enums import EmployeeStatus, EmploymentType, UserRole


@pytest.mark.asyncio
async def test_intern_lifecycle(client: AsyncClient, db_session: AsyncSession):
    # 1. Setup organization, admin, employee (intern candidate) and mentor
    org = Organization(name="Test Org", code="TSTORG", email="test@org.com")

    db_session.add(org)
    await db_session.flush()

    admin_user = User(
        organization_id=org.id,
        email="admin@test.com",
        password_hash="hashed",
        role=UserRole.ADMIN,
    )
    db_session.add(admin_user)

    intern_emp = Employee(
        organization_id=org.id,
        employee_code="INT001",
        first_name="Aisha",
        last_name="Khan",
        email="aisha@test.com",
        joining_date=date.today(),
        employment_type=EmploymentType.INTERN,
        status=EmployeeStatus.ACTIVE,
    )
    mentor_emp = Employee(
        organization_id=org.id,
        employee_code="EMP001",
        first_name="Rahul",
        last_name="Mehta",
        email="rahul@test.com",
        joining_date=date.today(),
        employment_type=EmploymentType.FULL_TIME,
        status=EmployeeStatus.ACTIVE,
    )
    db_session.add_all([intern_emp, mentor_emp])
    await db_session.commit()

    # Override auth dependency to simulate logged in admin
    from app.features.auth.dependencies import get_current_user
    from app.main import app
    app.dependency_overrides[get_current_user] = lambda: admin_user

    # 2. Create Intern
    payload = {
        "employee_id": str(intern_emp.id),
        "mentor_id": str(mentor_emp.id),
        "college_name": "ABC University",
        "course": "B.Tech Computer Science",
        "graduation_year": 2025,
        "internship_domain": "Backend Engineering",
        "internship_type": "STIPEND",
        "start_date": str(date.today() - timedelta(days=30)),
        "end_date": str(date.today() + timedelta(days=60)),
        "stipend": 15000.0,
        "status": "ACTIVE",
        "current_goal": "Master FastAPI",
    }
    res = await client.post("/api/v1/interns", json=payload)
    assert res.status_code == 201
    intern_data = res.json()
    intern_id = intern_data["id"]
    assert intern_data["employee"]["first_name"] == "Aisha"
    assert intern_data["mentor"]["first_name"] == "Rahul"
    assert intern_data["duration_days"] == 90

    # 3. Add Goal
    goal_payload = {
        "title": "Learn FastAPI & SQLAlchemy",
        "description": "Build REST APIs with async engine",
        "status": "IN_PROGRESS",
    }
    res = await client.post(f"/api/v1/interns/{intern_id}/goals", json=goal_payload)
    assert res.status_code == 201
    goal_id = res.json()["id"]

    # 4. Mark Goal Completed
    res = await client.put(
        f"/api/v1/interns/{intern_id}/goals/{goal_id}",
        json={"status": "COMPLETED"},
    )
    assert res.status_code == 200
    assert res.json()["status"] == "COMPLETED"

    # 5. Submit Final Review
    review_payload = {
        "review_type": "FINAL",
        "technical_skills": 5.0,
        "communication": 4.0,
        "problem_solving": 5.0,
        "teamwork": 4.0,
        "learning_ability": 5.0,
        "overall_rating": 4.6,
        "feedback": "Outstanding performance!",
        "recommend_conversion": True,
    }
    res = await client.post(f"/api/v1/interns/{intern_id}/reviews", json=review_payload)
    assert res.status_code == 201

    # 6. Check Intern Profile Detail
    res = await client.get(f"/api/v1/interns/{intern_id}")
    assert res.status_code == 200
    detail = res.json()
    assert detail["conversion_status"] == "RECOMMENDED"
    assert detail["final_rating"] == 4.6

    # 7. Convert Intern to Employee
    res = await client.post(f"/api/v1/interns/{intern_id}/convert")
    assert res.status_code == 200
    assert res.json()["conversion_status"] == "CONVERTED"

    # Verify Employee is now FULL_TIME
    res = await client.get(f"/api/v1/employees/{intern_emp.id}")
    assert res.status_code == 200
    assert res.json()["employment_type"] == "FULL_TIME"

    # 8. Certificate Generation
    res = await client.get(f"/api/v1/interns/{intern_id}/certificate")
    assert res.status_code == 200
    assert "Certificate of Completion" in res.text
