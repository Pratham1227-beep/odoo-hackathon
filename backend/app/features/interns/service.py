from datetime import date, datetime
from typing import List, Optional
import uuid
from fastapi import HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.exceptions import NotFoundError, ValidationError
from app.features.attendance.models import Attendance
from app.features.employees.models import Employee
from app.features.interns.models import Intern, InternGoal, InternReview
from app.features.interns.schemas import (
    InternAttendanceSummary,
    InternCreate,
    InternDetailResponse,
    InternEmployeeSummary,
    InternGoalCreate,
    InternGoalResponse,
    InternGoalUpdate,
    InternResponse,
    InternReviewCreate,
    InternReviewResponse,
    InternStatsResponse,
    InternUpdate,
)
from app.shared.enums import (
    AttendanceStatus,
    ConversionStatus,
    EmploymentType,
    GoalStatus,
    InternshipStatus,
    ReviewType,
)
from app.shared.pagination import PageParams, PaginatedResponse


class InternService:
    @staticmethod
    def _compute_metrics(intern: Intern) -> dict:
        today = date.today()
        total_days = max(1, (intern.end_date - intern.start_date).days)
        if today < intern.start_date:
            days_completed = 0
        elif today > intern.end_date:
            days_completed = total_days
        else:
            days_completed = (today - intern.start_date).days

        days_remaining = max(0, (intern.end_date - today).days)
        progress_pct = round(min(100.0, max(0.0, (days_completed / total_days) * 100.0)), 1)

        return {
            "duration_days": total_days,
            "days_completed": days_completed,
            "days_remaining": days_remaining,
            "progress_percentage": progress_pct,
        }

    @staticmethod
    def _map_employee_summary(emp: Optional[Employee]) -> Optional[InternEmployeeSummary]:
        if not emp:
            return None
        return InternEmployeeSummary(
            id=emp.id,
            employee_code=emp.employee_code,
            first_name=emp.first_name,
            last_name=emp.last_name,
            email=emp.email,
            phone=emp.phone,
            department_id=emp.department_id,
            department_name=emp.department.name if emp.department else None,
            designation_name=emp.designation.title if emp.designation else None,
            avatar_url=emp.avatar_url,
        )

    @classmethod
    def _build_intern_response(
        cls,
        intern: Intern,
        attendance_summary: Optional[InternAttendanceSummary] = None,
        goals: Optional[List[InternGoal]] = None,
        reviews: Optional[List[InternReview]] = None,
    ) -> InternDetailResponse:
        metrics = cls._compute_metrics(intern)
        emp_summary = cls._map_employee_summary(intern.employee)
        mentor_summary = cls._map_employee_summary(intern.mentor)

        goal_responses = [InternGoalResponse.model_validate(g) for g in (goals if goals is not None else intern.goals or [])]
        review_responses = [InternReviewResponse.model_validate(r) for r in (reviews if reviews is not None else intern.reviews or [])]

        return InternDetailResponse(
            id=intern.id,
            created_at=intern.created_at,
            updated_at=intern.updated_at,
            organization_id=intern.organization_id,
            employee_id=intern.employee_id,
            mentor_id=intern.mentor_id,
            college_name=intern.college_name,
            course=intern.course,
            graduation_year=intern.graduation_year,
            internship_domain=intern.internship_domain,
            internship_type=intern.internship_type,
            start_date=intern.start_date,
            end_date=intern.end_date,
            stipend=intern.stipend,
            status=intern.status,
            current_goal=intern.current_goal,
            conversion_status=intern.conversion_status,
            final_rating=intern.final_rating,
            mentor_feedback=intern.mentor_feedback,
            final_feedback=intern.final_feedback,
            employee=emp_summary,
            mentor=mentor_summary,
            duration_days=metrics["duration_days"],
            days_completed=metrics["days_completed"],
            days_remaining=metrics["days_remaining"],
            progress_percentage=metrics["progress_percentage"],
            goals=goal_responses,
            reviews=review_responses,
            attendance_summary=attendance_summary,
        )

    @classmethod
    async def create_intern(cls, db: AsyncSession, org_id: uuid.UUID, payload: InternCreate) -> InternDetailResponse:
        # Verify employee exists and belongs to org
        emp_stmt = select(Employee).where(Employee.id == payload.employee_id, Employee.organization_id == org_id)
        emp_res = await db.execute(emp_stmt)
        emp = emp_res.scalar_one_or_none()
        if not emp:
            raise NotFoundError("Employee not found")

        # Verify not already an intern
        existing_stmt = select(Intern).where(Intern.employee_id == payload.employee_id, Intern.organization_id == org_id)
        existing_res = await db.execute(existing_stmt)
        if existing_res.scalar_one_or_none():
            raise ValidationError("This employee is already registered as an intern")

        # Verify mentor if specified
        mentor = None
        if payload.mentor_id:
            mentor_stmt = select(Employee).where(Employee.id == payload.mentor_id, Employee.organization_id == org_id)
            mentor_res = await db.execute(mentor_stmt)
            mentor = mentor_res.scalar_one_or_none()
            if not mentor:
                raise NotFoundError("Mentor employee not found")


        # Set employee's employment_type to INTERN if not already
        emp.employment_type = EmploymentType.INTERN

        intern = Intern(
            organization_id=org_id,
            employee_id=payload.employee_id,
            mentor_id=payload.mentor_id,
            college_name=payload.college_name,
            course=payload.course,
            graduation_year=payload.graduation_year,
            internship_domain=payload.internship_domain,
            internship_type=payload.internship_type,
            start_date=payload.start_date,
            end_date=payload.end_date,
            stipend=payload.stipend,
            status=payload.status,
            current_goal=payload.current_goal,
            conversion_status=ConversionStatus.NOT_REVIEWED,
        )
        db.add(intern)
        await db.commit()
        await db.refresh(intern)

        # Reload with relations
        return await cls.get_intern_by_id(db, org_id, intern.id)

    @classmethod
    async def get_intern_by_id(cls, db: AsyncSession, org_id: uuid.UUID, intern_id: uuid.UUID) -> InternDetailResponse:
        stmt = (
            select(Intern)
            .options(
                selectinload(Intern.employee).selectinload(Employee.department),
                selectinload(Intern.employee).selectinload(Employee.designation),
                selectinload(Intern.mentor).selectinload(Employee.department),
                selectinload(Intern.mentor).selectinload(Employee.designation),
                selectinload(Intern.goals),
                selectinload(Intern.reviews),
            )
            .where(Intern.id == intern_id, Intern.organization_id == org_id)
        )
        res = await db.execute(stmt)
        intern = res.scalar_one_or_none()
        if not intern:
            raise NotFoundError("Intern record not found")

        # Fetch attendance summary from existing Attendance table
        att_stmt = select(Attendance).where(Attendance.employee_id == intern.employee_id)
        att_res = await db.execute(att_stmt)
        attendances = att_res.scalars().all()

        total_working = len(attendances)
        present = sum(1 for a in attendances if a.status in (AttendanceStatus.PRESENT, AttendanceStatus.LATE, AttendanceStatus.HALF_DAY))
        absent = sum(1 for a in attendances if a.status == AttendanceStatus.ABSENT)
        leave = 0 # Can be calculated from time_off if present

        pct = round((present / total_working * 100.0), 1) if total_working > 0 else 100.0
        att_summary = InternAttendanceSummary(
            attendance_percentage=pct,
            present_days=present,
            absent_days=absent,
            leave_days=leave,
            total_working_days=total_working,
        )

        return cls._build_intern_response(intern, attendance_summary=att_summary)

    @classmethod
    async def list_interns(
        cls,
        db: AsyncSession,
        org_id: uuid.UUID,
        params: PageParams,
        status: Optional[InternshipStatus] = None,
        department_id: Optional[uuid.UUID] = None,
        mentor_id: Optional[uuid.UUID] = None,
        search: Optional[str] = None,
    ) -> PaginatedResponse[InternResponse]:
        query = (
            select(Intern)
            .join(Employee, Intern.employee_id == Employee.id)
            .options(
                selectinload(Intern.employee).selectinload(Employee.department),
                selectinload(Intern.employee).selectinload(Employee.designation),
                selectinload(Intern.mentor).selectinload(Employee.department),
                selectinload(Intern.mentor).selectinload(Employee.designation),
            )
            .where(Intern.organization_id == org_id)
        )

        if status:
            query = query.where(Intern.status == status)
        if mentor_id:
            query = query.where(Intern.mentor_id == mentor_id)
        if department_id:
            query = query.where(Employee.department_id == department_id)
        if search:
            pattern = f"%{search}%"
            query = query.where(
                (Employee.first_name.ilike(pattern))
                | (Employee.last_name.ilike(pattern))
                | (Employee.email.ilike(pattern))
                | (Intern.internship_domain.ilike(pattern))
                | (Intern.college_name.ilike(pattern))
            )

        # Count total
        count_stmt = select(func.count()).select_from(query.subquery())
        total_res = await db.execute(count_stmt)
        total = total_res.scalar() or 0

        # Execute paginated
        query = query.order_by(Intern.created_at.desc()).offset(params.offset).limit(params.limit)
        res = await db.execute(query)
        interns = res.scalars().all()

        items = [cls._build_intern_response(i, goals=[], reviews=[]) for i in interns]
        return PaginatedResponse.create(items=items, total=total, params=params)

    @classmethod
    async def update_intern(
        cls, db: AsyncSession, org_id: uuid.UUID, intern_id: uuid.UUID, payload: InternUpdate
    ) -> InternDetailResponse:
        stmt = select(Intern).where(Intern.id == intern_id, Intern.organization_id == org_id)
        res = await db.execute(stmt)
        intern = res.scalar_one_or_none()
        if not intern:
            raise NotFoundError("Intern record not found")

        data = payload.model_dump(exclude_unset=True)
        if "mentor_id" in data and data["mentor_id"] is not None:
            mentor_stmt = select(Employee).where(Employee.id == data["mentor_id"], Employee.organization_id == org_id)
            m_res = await db.execute(mentor_stmt)
            if not m_res.scalar_one_or_none():
                raise NotFoundError("Mentor employee not found")

        for key, val in data.items():
            setattr(intern, key, val)

        await db.commit()
        return await cls.get_intern_by_id(db, org_id, intern.id)

    @classmethod
    async def update_status(
        cls, db: AsyncSession, org_id: uuid.UUID, intern_id: uuid.UUID, status: InternshipStatus
    ) -> InternDetailResponse:
        return await cls.update_intern(db, org_id, intern_id, InternUpdate(status=status))

    @classmethod
    async def update_mentor(
        cls, db: AsyncSession, org_id: uuid.UUID, intern_id: uuid.UUID, mentor_id: uuid.UUID
    ) -> InternDetailResponse:
        return await cls.update_intern(db, org_id, intern_id, InternUpdate(mentor_id=mentor_id))

    # Goal operations
    @classmethod
    async def create_goal(
        cls, db: AsyncSession, org_id: uuid.UUID, intern_id: uuid.UUID, payload: InternGoalCreate
    ) -> InternGoalResponse:
        intern_stmt = select(Intern).where(Intern.id == intern_id, Intern.organization_id == org_id)
        res = await db.execute(intern_stmt)
        if not res.scalar_one_or_none():
            raise NotFoundError("Intern record not found")

        goal = InternGoal(
            organization_id=org_id,
            intern_id=intern_id,
            title=payload.title,
            description=payload.description,
            status=payload.status,
            due_date=payload.due_date,
        )
        db.add(goal)
        await db.commit()
        await db.refresh(goal)
        return InternGoalResponse.model_validate(goal)

    @classmethod
    async def update_goal(
        cls, db: AsyncSession, org_id: uuid.UUID, intern_id: uuid.UUID, goal_id: uuid.UUID, payload: InternGoalUpdate
    ) -> InternGoalResponse:
        stmt = select(InternGoal).where(
            InternGoal.id == goal_id,
            InternGoal.intern_id == intern_id,
            InternGoal.organization_id == org_id,
        )
        res = await db.execute(stmt)
        goal = res.scalar_one_or_none()
        if not goal:
            raise NotFoundError("Goal not found")

        for key, val in payload.model_dump(exclude_unset=True).items():
            setattr(goal, key, val)

        await db.commit()
        await db.refresh(goal)
        return InternGoalResponse.model_validate(goal)

    @classmethod
    async def delete_goal(
        cls, db: AsyncSession, org_id: uuid.UUID, intern_id: uuid.UUID, goal_id: uuid.UUID
    ) -> None:
        stmt = select(InternGoal).where(
            InternGoal.id == goal_id,
            InternGoal.intern_id == intern_id,
            InternGoal.organization_id == org_id,
        )
        res = await db.execute(stmt)
        goal = res.scalar_one_or_none()
        if not goal:
            raise NotFoundError("Goal not found")

        await db.delete(goal)
        await db.commit()

    # Review operations
    @classmethod
    async def create_review(
        cls,
        db: AsyncSession,
        org_id: uuid.UUID,
        intern_id: uuid.UUID,
        payload: InternReviewCreate,
        current_user_id: uuid.UUID,
    ) -> InternReviewResponse:
        intern_stmt = select(Intern).where(Intern.id == intern_id, Intern.organization_id == org_id)
        res = await db.execute(intern_stmt)
        intern = res.scalar_one_or_none()
        if not intern:
            raise NotFoundError("Intern record not found")

        overall = round(
            (
                payload.technical_skills
                + payload.communication
                + payload.problem_solving
                + payload.teamwork
                + payload.learning_ability
            )
            / 5.0,
            1,
        )

        review = InternReview(
            organization_id=org_id,
            intern_id=intern_id,
            review_type=payload.review_type,
            technical_skills=payload.technical_skills,
            communication=payload.communication,
            problem_solving=payload.problem_solving,
            teamwork=payload.teamwork,
            learning_ability=payload.learning_ability,
            overall_rating=overall,
            feedback=payload.feedback,
            created_by=current_user_id,
        )
        db.add(review)

        # Update intern summary fields if final review
        if payload.review_type == ReviewType.FINAL:
            intern.final_rating = overall
            intern.final_feedback = payload.feedback
            if payload.recommend_conversion:
                intern.conversion_status = ConversionStatus.RECOMMENDED

        await db.commit()
        await db.refresh(review)
        return InternReviewResponse.model_validate(review)

    # Conversion & Completion
    @classmethod
    async def convert_intern_to_employee(
        cls, db: AsyncSession, org_id: uuid.UUID, intern_id: uuid.UUID
    ) -> dict:
        stmt = (
            select(Intern)
            .options(selectinload(Intern.employee), selectinload(Intern.reviews))
            .where(Intern.id == intern_id, Intern.organization_id == org_id)
        )
        res = await db.execute(stmt)
        intern = res.scalar_one_or_none()
        if not intern:
            raise NotFoundError("Intern record not found")

        if intern.conversion_status == ConversionStatus.CONVERTED:
            raise ValidationError("This intern has already been converted.")

        # Business Rule: Final review should be required before conversion
        has_final = any(r.review_type == ReviewType.FINAL for r in intern.reviews)
        if not has_final and intern.final_rating is None:
            raise ValidationError("Final review is required before conversion.")

        # Update Employee status/employment_type
        emp = intern.employee
        emp.employment_type = EmploymentType.FULL_TIME

        # Update Intern conversion status and mark internship completed
        intern.conversion_status = ConversionStatus.CONVERTED
        intern.status = InternshipStatus.COMPLETED

        await db.commit()
        return {
            "message": f"Intern {emp.first_name} {emp.last_name} successfully converted to full-time employee",
            "employee_id": str(emp.id),
            "intern_id": str(intern.id),
            "conversion_status": intern.conversion_status.value,
        }

    @classmethod
    async def complete_internship(
        cls, db: AsyncSession, org_id: uuid.UUID, intern_id: uuid.UUID
    ) -> InternDetailResponse:
        stmt = select(Intern).where(Intern.id == intern_id, Intern.organization_id == org_id)
        res = await db.execute(stmt)
        intern = res.scalar_one_or_none()
        if not intern:
            raise NotFoundError("Intern record not found")


        intern.status = InternshipStatus.COMPLETED
        if intern.conversion_status == ConversionStatus.NOT_REVIEWED:
            intern.conversion_status = ConversionStatus.NOT_CONVERTED

        await db.commit()
        return await cls.get_intern_by_id(db, org_id, intern.id)

    @classmethod
    async def get_stats(cls, db: AsyncSession, org_id: uuid.UUID) -> InternStatsResponse:
        today = date.today()
        stmt = select(Intern).where(Intern.organization_id == org_id)
        res = await db.execute(stmt)
        interns = res.scalars().all()

        active = [i for i in interns if i.status == InternshipStatus.ACTIVE]
        ending_soon = [
            i
            for i in active
            if 0 <= (i.end_date - today).days <= 7
        ]
        
        # Calculate progress
        progs = [cls._compute_metrics(i)["progress_percentage"] for i in active]
        avg_prog = round(sum(progs) / len(progs), 1) if progs else 0.0

        conversion_candidates = [
            i
            for i in interns
            if i.conversion_status in (ConversionStatus.RECOMMENDED, ConversionStatus.NOT_REVIEWED)
            and (i.final_rating or 0) >= 4.0
        ]

        return InternStatsResponse(
            active_interns=len(active),
            ending_soon=len(ending_soon),
            average_progress=avg_prog,
            conversion_candidates=len(conversion_candidates),
        )
