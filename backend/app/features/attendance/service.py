from datetime import date, datetime, time, timedelta, timezone
from decimal import Decimal
from typing import List, Optional, Tuple
import uuid
import zoneinfo
from sqlalchemy import extract, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import (
    BadRequestError,
    ConflictError,
    ForbiddenError,
    NotFoundError,
)
from app.features.attendance.models import Attendance, AttendanceCorrection, Holiday
from app.features.attendance.schemas import (
    AttendanceCorrectionCreate,
    AttendanceCorrectionReview,
    AttendanceCorrectionResponse,
    AttendanceResponse,
    AttendanceSummaryResponse,
    AttendanceUpdate,
    HolidayCreate,
    HolidayResponse,
    HolidayUpdate,
)
from app.features.auth.models import User
from app.features.employees.models import Employee
from app.features.payroll_config.models import SystemConfig
from app.shared.enums import (
    AttendanceSource,
    AttendanceStatus,
    CorrectionStatus,
    UserRole,
)
from app.shared.pagination import PaginatedResponse


class AttendanceService:

    @staticmethod
    async def get_employee_for_user(db: AsyncSession, user: User) -> Employee:
        """Resolve Employee model corresponding to the user profile."""
        if hasattr(user, "employee") and user.employee is not None:
            return user.employee

        stmt = select(Employee).where(
            Employee.organization_id == user.organization_id,
            Employee.user_id == user.id,
        )
        result = await db.execute(stmt)
        emp = result.scalar_one_or_none()
        if emp is not None:
            return emp

        stmt_email = select(Employee).where(
            Employee.organization_id == user.organization_id,
            Employee.email == user.email,
        )
        result_email = await db.execute(stmt_email)
        emp_email = result_email.scalar_one_or_none()
        if emp_email is not None:
            return emp_email

        raise BadRequestError("No employee profile associated with current user account")

    @staticmethod
    async def _get_late_grace_minutes(db: AsyncSession, org_id: uuid.UUID) -> int:
        """Fetch attendance.late_grace_minutes from SystemConfig, defaulting to 10."""
        stmt = select(SystemConfig).where(
            SystemConfig.organization_id == org_id,
            SystemConfig.key == "attendance.late_grace_minutes",
        )
        res = await db.execute(stmt)
        cfg = res.scalar_one_or_none()
        if cfg and cfg.value:
            try:
                return int(cfg.value)
            except ValueError:
                return 10
        return 10

    @staticmethod
    def _get_working_schedule_params(employee: Employee) -> Tuple[time, float, int]:
        """Determine start_time, hours_per_day, and break_minutes from employee schedule or defaults.
        
        Returns: (start_time, hours_per_day, break_minutes)
        """
        schedule = getattr(employee, "schedule", None) or getattr(employee, "working_schedule", None)
        if schedule:
            start_t = getattr(schedule, "start_time", time(9, 0))
            hours_day = float(getattr(schedule, "hours_per_day", 8.0))
            break_mins = int(getattr(schedule, "break_minutes", 60))
            return start_t, hours_day, break_mins
        return time(9, 0), 8.0, 60

    @classmethod
    def _compute_hours_and_status(
        cls,
        clock_in: datetime,
        clock_out: datetime,
        start_time: time,
        hours_per_day: float,
        break_minutes: int,
        late_grace_minutes: int,
        org_tz_name: str = "Asia/Kolkata",
    ) -> Tuple[Decimal, Decimal, AttendanceStatus]:
        """Compute work_hours, overtime_hours, and status for attendance clock-out."""
        # Normalize timezones if one is naive and one is aware
        c_in = clock_in
        c_out = clock_out
        if c_in.tzinfo is None and c_out.tzinfo is not None:
            c_in = c_in.replace(tzinfo=c_out.tzinfo)
        elif c_in.tzinfo is not None and c_out.tzinfo is None:
            c_out = c_out.replace(tzinfo=c_in.tzinfo)

        gross_seconds = (c_out - c_in).total_seconds()
        if gross_seconds < 0:
            gross_seconds = 0

        gross_hours = gross_seconds / 3600.0
        break_hours = break_minutes / 60.0
        work_hours = max(0.0, gross_hours - break_hours)
        overtime_hours = max(0.0, work_hours - hours_per_day)

        # Determine late status based on clock_in local time vs start_time + grace
        try:
            if c_in.tzinfo is not None:
                tz = zoneinfo.ZoneInfo(org_tz_name)
                clock_in_local = c_in.astimezone(tz)
            else:
                clock_in_local = c_in
            clock_in_t = clock_in_local.time()
        except Exception:
            clock_in_t = c_in.time()


        start_dt = datetime.combine(date.today(), start_time)
        grace_dt = start_dt + timedelta(minutes=late_grace_minutes)
        grace_t = grace_dt.time()

        if clock_in_t > grace_t:
            status = AttendanceStatus.LATE
        else:
            status = AttendanceStatus.PRESENT

        if work_hours < (hours_per_day / 2.0):
            status = AttendanceStatus.HALF_DAY

        work_hours_dec = Decimal(str(round(work_hours, 2)))
        overtime_hours_dec = Decimal(str(round(overtime_hours, 2)))
        return work_hours_dec, overtime_hours_dec, status

    # ==========================================
    # Clock-In / Clock-Out
    # ==========================================

    @classmethod
    async def clock_in(cls, db: AsyncSession, user: User) -> Attendance:
        """Self clock-in for current user's employee profile."""
        employee = await cls.get_employee_for_user(db, user)
        today_date = datetime.now(timezone.utc).date()

        stmt = select(Attendance).where(
            Attendance.organization_id == user.organization_id,
            Attendance.employee_id == employee.id,
            Attendance.date == today_date,
        )
        res = await db.execute(stmt)
        attendance = res.scalar_one_or_none()

        if attendance and attendance.clock_in is not None:
            raise ConflictError("Already clocked in for today")

        now = datetime.now(timezone.utc)
        if not attendance:
            attendance = Attendance(
                organization_id=user.organization_id,
                employee_id=employee.id,
                date=today_date,
                clock_in=now,
                source=AttendanceSource.SELF,
                status=None,
            )
            db.add(attendance)
        else:
            attendance.clock_in = now
            attendance.source = AttendanceSource.SELF

        await db.commit()
        await db.refresh(attendance)
        return attendance

    @classmethod
    async def clock_out(cls, db: AsyncSession, user: User) -> Attendance:
        """Self clock-out for current user's employee profile."""
        employee = await cls.get_employee_for_user(db, user)
        today_date = datetime.now(timezone.utc).date()

        stmt = select(Attendance).where(
            Attendance.organization_id == user.organization_id,
            Attendance.employee_id == employee.id,
            Attendance.date == today_date,
        )
        res = await db.execute(stmt)
        attendance = res.scalar_one_or_none()

        if not attendance or attendance.clock_in is None:
            raise BadRequestError("Cannot clock out without prior clock-in for today")

        if attendance.clock_out is not None:
            raise ConflictError("Already clocked out for today")

        now = datetime.now(timezone.utc)
        attendance.clock_out = now

        # Compute schedule parameters, late grace, and hours/status
        start_time, hours_per_day, break_minutes = cls._get_working_schedule_params(employee)
        late_grace = await cls._get_late_grace_minutes(db, user.organization_id)
        org_tz = user.organization.timezone if user.organization and user.organization.timezone else "Asia/Kolkata"

        work_hrs, ot_hrs, calc_status = cls._compute_hours_and_status(
            clock_in=attendance.clock_in,
            clock_out=now,
            start_time=start_time,
            hours_per_day=hours_per_day,
            break_minutes=break_minutes,
            late_grace_minutes=late_grace,
            org_tz_name=org_tz,
        )

        attendance.work_hours = work_hrs
        attendance.overtime_hours = ot_hrs
        attendance.status = calc_status

        await db.commit()
        await db.refresh(attendance)
        return attendance

    # ==========================================
    # Direct Correction & Attendance Queries
    # ==========================================

    @classmethod
    async def direct_correction(
        cls,
        db: AsyncSession,
        org_id: uuid.UUID,
        attendance_id: uuid.UUID,
        payload: AttendanceUpdate,
        current_user: User,
    ) -> Attendance:
        """Authorized direct override of an attendance record."""
        stmt = select(Attendance).where(
            Attendance.id == attendance_id,
            Attendance.organization_id == org_id,
        )
        res = await db.execute(stmt)
        attendance = res.scalar_one_or_none()

        if not attendance:
            raise NotFoundError("Attendance record not found")

        if payload.clock_in is not None:
            attendance.clock_in = payload.clock_in
        if payload.clock_out is not None:
            attendance.clock_out = payload.clock_out

        # If both clock_in and clock_out are set, recompute hours and default status
        if attendance.clock_in and attendance.clock_out:
            start_time, hours_per_day, break_minutes = cls._get_working_schedule_params(attendance.employee)
            late_grace = await cls._get_late_grace_minutes(db, org_id)
            org_tz = current_user.organization.timezone if current_user.organization else "Asia/Kolkata"

            work_hrs, ot_hrs, calc_status = cls._compute_hours_and_status(
                clock_in=attendance.clock_in,
                clock_out=attendance.clock_out,
                start_time=start_time,
                hours_per_day=hours_per_day,
                break_minutes=break_minutes,
                late_grace_minutes=late_grace,
                org_tz_name=org_tz,
            )
            attendance.work_hours = work_hrs
            attendance.overtime_hours = ot_hrs
            attendance.status = calc_status

        if payload.status is not None:
            attendance.status = payload.status

        attendance.source = AttendanceSource.MANUAL
        attendance.updated_by_id = current_user.id

        await db.commit()
        await db.refresh(attendance)
        return attendance

    @classmethod
    async def list_attendances(
        cls,
        db: AsyncSession,
        current_user: User,
        employee_id: Optional[uuid.UUID] = None,
        from_date: Optional[date] = None,
        to_date: Optional[date] = None,
        status: Optional[AttendanceStatus] = None,
        page: int = 1,
        page_size: int = 20,
    ) -> PaginatedResponse[AttendanceResponse]:
        """List attendance records with filtering and pagination. EMPLOYEE role forced to own ID."""
        org_id = current_user.organization_id
        target_employee_id = employee_id

        if current_user.role == UserRole.EMPLOYEE:
            emp = await cls.get_employee_for_user(db, current_user)
            target_employee_id = emp.id

        stmt = select(Attendance).where(Attendance.organization_id == org_id)

        if target_employee_id:
            stmt = stmt.where(Attendance.employee_id == target_employee_id)
        if from_date:
            stmt = stmt.where(Attendance.date >= from_date)
        if to_date:
            stmt = stmt.where(Attendance.date <= to_date)
        if status:
            stmt = stmt.where(Attendance.status == status)

        stmt = stmt.order_by(Attendance.date.desc())

        # Count total
        count_stmt = select(func.count()).select_from(stmt.subquery())
        total_res = await db.execute(count_stmt)
        total = total_res.scalar() or 0

        # Paginate
        offset = (page - 1) * page_size
        stmt = stmt.offset(offset).limit(page_size)
        res = await db.execute(stmt)
        items = res.scalars().all()

        return PaginatedResponse(
            items=[AttendanceResponse.model_validate(item) for item in items],
            total=total,
            page=page,
            page_size=page_size,
            total_pages=(total + page_size - 1) // page_size if page_size > 0 else 1,
        )

    @classmethod
    async def get_today_attendance(cls, db: AsyncSession, current_user: User) -> Optional[Attendance]:
        """Get today's attendance for the authenticated employee."""
        employee = await cls.get_employee_for_user(db, current_user)
        today_date = datetime.now(timezone.utc).date()

        stmt = select(Attendance).where(
            Attendance.organization_id == current_user.organization_id,
            Attendance.employee_id == employee.id,
            Attendance.date == today_date,
        )
        res = await db.execute(stmt)
        return res.scalar_one_or_none()

    # ==========================================
    # Correction Requests Workflow
    # ==========================================

    @classmethod
    async def create_correction_request(
        cls,
        db: AsyncSession,
        org_id: uuid.UUID,
        attendance_id: uuid.UUID,
        payload: AttendanceCorrectionCreate,
        current_user: User,
    ) -> AttendanceCorrection:
        """Employee requests attendance correction for their own record."""
        stmt = select(Attendance).where(
            Attendance.id == attendance_id,
            Attendance.organization_id == org_id,
        )
        res = await db.execute(stmt)
        attendance = res.scalar_one_or_none()

        if not attendance:
            raise NotFoundError("Attendance record not found")

        # Ownership verification: must match current user's employee profile
        employee = await cls.get_employee_for_user(db, current_user)
        if attendance.employee_id != employee.id:
            raise ForbiddenError("You can only request corrections for your own attendance records")

        correction = AttendanceCorrection(
            organization_id=org_id,
            attendance_id=attendance.id,
            requested_by_id=current_user.id,
            requested_clock_in=payload.requested_clock_in,
            requested_clock_out=payload.requested_clock_out,
            reason=payload.reason,
            status=CorrectionStatus.PENDING,
        )
        db.add(correction)
        await db.commit()
        await db.refresh(correction)
        return correction

    @classmethod
    async def list_corrections(
        cls,
        db: AsyncSession,
        org_id: uuid.UUID,
        status: Optional[CorrectionStatus] = None,
        employee_id: Optional[uuid.UUID] = None,
        page: int = 1,
        page_size: int = 20,
    ) -> PaginatedResponse[AttendanceCorrectionResponse]:
        """List attendance correction requests (HR access)."""
        stmt = (
            select(AttendanceCorrection)
            .join(Attendance, AttendanceCorrection.attendance_id == Attendance.id)
            .where(AttendanceCorrection.organization_id == org_id)
        )

        if status:
            stmt = stmt.where(AttendanceCorrection.status == status)
        if employee_id:
            stmt = stmt.where(Attendance.employee_id == employee_id)

        stmt = stmt.order_by(AttendanceCorrection.created_at.desc())

        count_stmt = select(func.count()).select_from(stmt.subquery())
        total_res = await db.execute(count_stmt)
        total = total_res.scalar() or 0

        offset = (page - 1) * page_size
        stmt = stmt.offset(offset).limit(page_size)
        res = await db.execute(stmt)
        items = res.scalars().all()

        return PaginatedResponse(
            items=[AttendanceCorrectionResponse.model_validate(item) for item in items],
            total=total,
            page=page,
            page_size=page_size,
            total_pages=(total + page_size - 1) // page_size if page_size > 0 else 1,
        )

    @classmethod
    async def review_correction_request(
        cls,
        db: AsyncSession,
        org_id: uuid.UUID,
        correction_id: uuid.UUID,
        payload: AttendanceCorrectionReview,
        current_user: User,
    ) -> AttendanceCorrection:
        """HR approves or rejects an attendance correction request."""
        stmt = select(AttendanceCorrection).where(
            AttendanceCorrection.id == correction_id,
            AttendanceCorrection.organization_id == org_id,
        )
        res = await db.execute(stmt)
        correction = res.scalar_one_or_none()

        if not correction:
            raise NotFoundError("Attendance correction request not found")

        if correction.status != CorrectionStatus.PENDING:
            raise BadRequestError("Attendance correction request has already been processed")

        correction.status = payload.status
        correction.reviewed_by_id = current_user.id
        correction.review_comment = payload.review_comment
        correction.reviewed_at = datetime.now(timezone.utc)

        if payload.status == CorrectionStatus.APPROVED:
            attendance = correction.attendance
            if correction.requested_clock_in is not None:
                attendance.clock_in = correction.requested_clock_in
            if correction.requested_clock_out is not None:
                attendance.clock_out = correction.requested_clock_out

            if attendance.clock_in and attendance.clock_out:
                start_time, hours_per_day, break_minutes = cls._get_working_schedule_params(attendance.employee)
                late_grace = await cls._get_late_grace_minutes(db, org_id)
                org_tz = current_user.organization.timezone if current_user.organization else "Asia/Kolkata"

                work_hrs, ot_hrs, calc_status = cls._compute_hours_and_status(
                    clock_in=attendance.clock_in,
                    clock_out=attendance.clock_out,
                    start_time=start_time,
                    hours_per_day=hours_per_day,
                    break_minutes=break_minutes,
                    late_grace_minutes=late_grace,
                    org_tz_name=org_tz,
                )
                attendance.work_hours = work_hrs
                attendance.overtime_hours = ot_hrs
                attendance.status = calc_status

            attendance.source = AttendanceSource.MANUAL
            attendance.updated_by_id = current_user.id

        await db.commit()
        await db.refresh(correction)

        # Notify employee of correction review decision
        emp = correction.attendance.employee if correction.attendance else None
        emp_user_id = emp.user_id if emp else None
        if emp_user_id:
            from app.features.notifications.service import NotificationService
            status_str = "approved" if correction.status == CorrectionStatus.APPROVED else "rejected"
            comment_str = f" Comment: {payload.review_comment}" if payload.review_comment else ""
            corr_date = correction.attendance.date if correction.attendance else ""
            await NotificationService.create_notification(
                db=db,
                recipient_id=emp_user_id,
                title=f"Attendance correction {status_str}",
                message=f"Your attendance correction request for {corr_date} has been {status_str}.{comment_str}",
                type="CORRECTION_REVIEWED",
                severity="INFO",
                link=f"/attendance/corrections/{correction.id}",
                organization_id=org_id,
            )
            await db.commit()

        return correction


    # ==========================================
    # Attendance Summary
    # ==========================================

    @classmethod
    async def get_summary(
        cls,
        db: AsyncSession,
        current_user: User,
        employee_id: Optional[uuid.UUID] = None,
        from_date: Optional[date] = None,
        to_date: Optional[date] = None,
    ) -> AttendanceSummaryResponse:
        """Aggregated metrics summary for specified or self employee within date range."""
        org_id = current_user.organization_id
        target_emp_id = employee_id

        if current_user.role == UserRole.EMPLOYEE:
            emp = await cls.get_employee_for_user(db, current_user)
            target_emp_id = emp.id
        elif target_emp_id is None:
            emp = await cls.get_employee_for_user(db, current_user)
            target_emp_id = emp.id

        today = datetime.now(timezone.utc).date()
        if not to_date:
            to_date = today
        if not from_date:
            from_date = to_date.replace(day=1)

        # Query attendance records in date range
        stmt = select(Attendance).where(
            Attendance.organization_id == org_id,
            Attendance.employee_id == target_emp_id,
            Attendance.date >= from_date,
            Attendance.date <= to_date,
        )
        res = await db.execute(stmt)
        attendances = res.scalars().all()

        present_days = sum(1 for a in attendances if a.status == AttendanceStatus.PRESENT)
        late_days = sum(1 for a in attendances if a.status == AttendanceStatus.LATE)
        half_days = sum(1 for a in attendances if a.status == AttendanceStatus.HALF_DAY)
        total_overtime = sum(float(a.overtime_hours or 0.0) for a in attendances)

        # Count missing checkouts: rows with clock_in set, clock_out null, and date < today
        stmt_missing = select(func.count()).where(
            Attendance.organization_id == org_id,
            Attendance.employee_id == target_emp_id,
            Attendance.clock_in.isnot(None),
            Attendance.clock_out.is_(None),
            Attendance.date < today,
        )
        res_missing = await db.execute(stmt_missing)
        missing_checkout_count = res_missing.scalar() or 0

        # Compute approximate absent days:
        # working_days (Mon-Fri) up to min(to_date, today) - holidays - attended_days
        eval_to = min(to_date, today)
        eval_from = from_date

        working_days_count = 0
        if eval_from <= eval_to:
            curr = eval_from
            while curr <= eval_to:
                if curr.weekday() < 5:  # Monday to Friday
                    working_days_count += 1
                curr += timedelta(days=1)

        # Fetch holidays in eval range
        stmt_holidays = select(Holiday).where(
            Holiday.organization_id == org_id,
            Holiday.date >= eval_from,
            Holiday.date <= eval_to,
        )
        res_holidays = await db.execute(stmt_holidays)
        holidays = res_holidays.scalars().all()
        holiday_working_days = sum(1 for h in holidays if h.date.weekday() < 5)

        attended_days = sum(1 for a in attendances if a.status in [AttendanceStatus.PRESENT, AttendanceStatus.LATE, AttendanceStatus.HALF_DAY] and a.date <= eval_to)
        absent_days = max(0, working_days_count - holiday_working_days - attended_days)

        return AttendanceSummaryResponse(
            employee_id=target_emp_id,
            from_date=from_date,
            to_date=to_date,
            present_days=present_days,
            late_days=late_days,
            half_days=half_days,
            absent_days=absent_days,
            total_overtime_hours=round(total_overtime, 2),
            missing_checkout_count=missing_checkout_count,
            note="absent_days excludes approved leave — Time Off isn't wired in until Phase 5",
        )

    # ==========================================
    # Holidays CRUD
    # ==========================================

    @classmethod
    async def list_holidays(
        cls,
        db: AsyncSession,
        org_id: uuid.UUID,
        year: Optional[int] = None,
    ) -> List[Holiday]:
        """List holidays for organization, optionally filtered by year."""
        stmt = select(Holiday).where(Holiday.organization_id == org_id)
        if year:
            stmt = stmt.where(extract("year", Holiday.date) == year)

        stmt = stmt.order_by(Holiday.date.asc())
        res = await db.execute(stmt)
        return res.scalars().all()

    @classmethod
    async def create_holiday(
        cls,
        db: AsyncSession,
        org_id: uuid.UUID,
        payload: HolidayCreate,
    ) -> Holiday:
        """Create a new holiday record."""
        stmt = select(Holiday).where(
            Holiday.organization_id == org_id,
            Holiday.date == payload.date,
        )
        res = await db.execute(stmt)
        if res.scalar_one_or_none():
            raise ConflictError(f"A holiday already exists on {payload.date}")

        holiday = Holiday(
            organization_id=org_id,
            name=payload.name,
            date=payload.date,
            type=payload.type,
            description=payload.description,
            is_paid=payload.is_paid,
        )
        db.add(holiday)
        await db.commit()
        await db.refresh(holiday)
        return holiday

    @classmethod
    async def update_holiday(
        cls,
        db: AsyncSession,
        org_id: uuid.UUID,
        holiday_id: uuid.UUID,
        payload: HolidayUpdate,
    ) -> Holiday:
        """Update an existing holiday record."""
        stmt = select(Holiday).where(
            Holiday.id == holiday_id,
            Holiday.organization_id == org_id,
        )
        res = await db.execute(stmt)
        holiday = res.scalar_one_or_none()

        if not holiday:
            raise NotFoundError("Holiday not found")

        if payload.name is not None:
            holiday.name = payload.name
        if payload.date is not None:
            if payload.date != holiday.date:
                stmt_chk = select(Holiday).where(
                    Holiday.organization_id == org_id,
                    Holiday.date == payload.date,
                    Holiday.id != holiday_id,
                )
                chk_res = await db.execute(stmt_chk)
                if chk_res.scalar_one_or_none():
                    raise ConflictError(f"A holiday already exists on {payload.date}")
            holiday.date = payload.date
        if payload.type is not None:
            holiday.type = payload.type
        if payload.description is not None:
            holiday.description = payload.description
        if payload.is_paid is not None:
            holiday.is_paid = payload.is_paid

        await db.commit()
        await db.refresh(holiday)
        return holiday
