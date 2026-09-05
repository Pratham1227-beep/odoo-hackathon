import calendar
from datetime import date, datetime, timezone
from decimal import Decimal
import json
from typing import Any, Dict, List, Optional, Tuple
import uuid
from sqlalchemy import distinct, extract, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.exceptions import ForbiddenError, NotFoundError
from app.features.attendance.models import Attendance, AttendanceCorrection
from app.features.auth.models import User
from app.features.employees.models import Employee
from app.features.organization.models import Department, Designation
from app.features.payroll.models import PayrollValidationIssue, Payrun, PayrunEmployee, Payslip
from app.features.payroll.schemas import PayslipResponse
from app.features.reports_dashboard.models import AnalyticsSnapshot
from app.features.reports_dashboard.schemas import (
    AttendanceDashboardResponse,
    DepartmentAttendanceMetric,
    DepartmentCostBreakdown,
    DepartmentHeadcountItem,
    DepartmentSummaryItem,
    DesignationHeadcountItem,
    EmployeesDashboardResponse,
    KPICards,
    MainDashboardResponse,
    MonthlySalaryTrend,
    OperationalAlertIssue,
    OperationalAlerts,
    PayrollDashboardResponse,
    PayrollPeriodMetrics,
    PeriodFilter,
    SalaryStatementResponse,
    StatusHeadcountItem,
    TypeHeadcountItem,
    YTDSummary,
)
from app.features.time_off.models import LeaveRequest
from app.shared.enums import (
    AttendanceStatus,
    CorrectionStatus,
    EmployeeStatus,
    EmploymentType,
    LeaveRequestStatus,
    PayrollIssueStatus,
    PayrunEmployeeStatus,
    PayrunStatus,
    PayslipStatus,
    UserRole,
)


class ReportsDashboardService:

    @staticmethod
    def _resolve_period(
        month: Optional[int] = None,
        year: Optional[int] = None,
        from_date: Optional[date] = None,
        to_date: Optional[date] = None,
    ) -> PeriodFilter:
        """Resolve query filters into normalized PeriodFilter bounds."""
        today = datetime.now(timezone.utc).date()

        if month is not None and year is not None:
            _, last_day = calendar.monthrange(year, month)
            return PeriodFilter(
                month=month,
                year=year,
                from_date=date(year, month, 1),
                to_date=date(year, month, last_day),
            )
        elif year is not None and month is None:
            return PeriodFilter(
                month=None,
                year=year,
                from_date=date(year, 1, 1),
                to_date=date(year, 12, 31),
            )
        elif from_date is not None and to_date is not None:
            return PeriodFilter(
                month=None,
                year=None,
                from_date=from_date,
                to_date=to_date,
            )
        elif from_date is not None and to_date is None:
            return PeriodFilter(
                month=None,
                year=None,
                from_date=from_date,
                to_date=today,
            )
        else:
            # Default to current month
            m = today.month
            y = today.year
            _, last_day = calendar.monthrange(y, m)
            return PeriodFilter(
                month=m,
                year=y,
                from_date=date(y, m, 1),
                to_date=date(y, m, last_day),
            )

    # ==========================================
    # 1. Main Executive Dashboard
    # ==========================================

    @classmethod
    async def get_main_dashboard(
        cls,
        db: AsyncSession,
        org_id: uuid.UUID,
        month: Optional[int] = None,
        year: Optional[int] = None,
        from_date: Optional[date] = None,
        to_date: Optional[date] = None,
        department_id: Optional[uuid.UUID] = None,
        employment_type: Optional[EmploymentType] = None,
    ) -> MainDashboardResponse:
        period = cls._resolve_period(month=month, year=year, from_date=from_date, to_date=to_date)

        # 1. Payslips in period
        payslip_query = (
            select(Payslip)
            .join(Employee, Payslip.employee_id == Employee.id)
            .where(
                Payslip.organization_id == org_id,
                Payslip.period_start <= period.to_date,
                Payslip.period_end >= period.from_date,
            )
        )
        if department_id:
            payslip_query = payslip_query.where(Employee.department_id == department_id)
        if employment_type:
            payslip_query = payslip_query.where(Employee.employment_type == employment_type)

        res_slips = await db.execute(payslip_query)
        slips = res_slips.scalars().all()

        payslips_generated = len(slips)
        total_net_salary_paid = sum((s.net_salary for s in slips), Decimal("0.00"))
        average_salary = (
            (total_net_salary_paid / payslips_generated).quantize(Decimal("0.01"))
            if payslips_generated > 0
            else Decimal("0.00")
        )

        # 2. Approved Time Off in period
        leave_query = (
            select(func.sum(LeaveRequest.days))
            .join(Employee, LeaveRequest.employee_id == Employee.id)
            .where(
                LeaveRequest.organization_id == org_id,
                LeaveRequest.status == LeaveRequestStatus.APPROVED,
                LeaveRequest.start_date <= period.to_date,
                LeaveRequest.end_date >= period.from_date,
            )
        )
        if department_id:
            leave_query = leave_query.where(Employee.department_id == department_id)
        if employment_type:
            leave_query = leave_query.where(Employee.employment_type == employment_type)

        leave_res = await db.execute(leave_query)
        approved_time_off = float(leave_res.scalar() or 0.0)

        # 3. Attendance Health in period
        att_query = (
            select(Attendance.status, func.count(Attendance.id))
            .join(Employee, Attendance.employee_id == Employee.id)
            .where(
                Attendance.organization_id == org_id,
                Attendance.date >= period.from_date,
                Attendance.date <= period.to_date,
            )
            .group_by(Attendance.status)
        )
        if department_id:
            att_query = att_query.where(Employee.department_id == department_id)
        if employment_type:
            att_query = att_query.where(Employee.employment_type == employment_type)

        att_res = await db.execute(att_query)
        att_counts = dict(att_res.all())
        total_att = sum(att_counts.values())
        present_healthy = (
            att_counts.get(AttendanceStatus.PRESENT, 0)
            + att_counts.get(AttendanceStatus.LATE, 0)
            + att_counts.get(AttendanceStatus.HALF_DAY, 0)
        )
        attendance_health = round((present_healthy / total_att * 100.0), 2) if total_att > 0 else 100.0

        kpis = KPICards(
            total_net_salary_paid=total_net_salary_paid,
            payslips_generated=payslips_generated,
            average_salary=average_salary,
            approved_time_off=approved_time_off,
            attendance_health=attendance_health,
        )

        # 4. Operational alerts across payruns in period
        issues_query = (
            select(PayrollValidationIssue)
            .join(Payrun, PayrollValidationIssue.payrun_id == Payrun.id)
            .where(
                PayrollValidationIssue.organization_id == org_id,
                PayrollValidationIssue.status == PayrollIssueStatus.OPEN,
                Payrun.period_start <= period.to_date,
                Payrun.period_end >= period.from_date,
            )
            .options(
                selectinload(PayrollValidationIssue.payrun),
                selectinload(PayrollValidationIssue.employee),
            )
        )
        iss_res = await db.execute(issues_query)
        open_issues = iss_res.scalars().all()

        error_cnt = sum(1 for i in open_issues if i.severity.value == "ERROR")
        warn_cnt = sum(1 for i in open_issues if i.severity.value == "WARNING")
        info_cnt = sum(1 for i in open_issues if i.severity.value == "INFO")

        alert_issues = [
            OperationalAlertIssue(
                id=i.id,
                payrun_id=i.payrun_id,
                payrun_name=i.payrun.name if i.payrun else "Payrun",
                employee_id=i.employee_id,
                employee_name=f"{i.employee.first_name} {i.employee.last_name}" if i.employee else None,
                employee_code=i.employee.employee_code if i.employee else None,
                category=i.category,
                severity=i.severity,
                title=i.title,
                description=i.description,
            )
            for i in open_issues
        ]
        operational_alerts = OperationalAlerts(
            total_open_issues=len(open_issues),
            error_count=error_cnt,
            warning_count=warn_cnt,
            info_count=info_cnt,
            issues=alert_issues,
        )

        # 5. Department Headcount + Cost Breakdown
        dept_breakdown = await cls._get_department_cost_breakdown(
            db, org_id, period, department_id, employment_type
        )

        return MainDashboardResponse(
            period=period,
            kpis=kpis,
            operational_alerts=operational_alerts,
            department_breakdown=dept_breakdown,
        )

    # ==========================================
    # 2. Payroll Dashboard
    # ==========================================

    @classmethod
    async def get_payroll_dashboard(
        cls,
        db: AsyncSession,
        org_id: uuid.UUID,
        month: Optional[int] = None,
        year: Optional[int] = None,
        from_date: Optional[date] = None,
        to_date: Optional[date] = None,
        department_id: Optional[uuid.UUID] = None,
        employment_type: Optional[EmploymentType] = None,
    ) -> PayrollDashboardResponse:
        period = cls._resolve_period(month=month, year=year, from_date=from_date, to_date=to_date)

        # Period payslips metrics
        payslip_query = (
            select(Payslip)
            .join(Employee, Payslip.employee_id == Employee.id)
            .where(
                Payslip.organization_id == org_id,
                Payslip.period_start <= period.to_date,
                Payslip.period_end >= period.from_date,
            )
        )
        if department_id:
            payslip_query = payslip_query.where(Employee.department_id == department_id)
        if employment_type:
            payslip_query = payslip_query.where(Employee.employment_type == employment_type)

        res_slips = await db.execute(payslip_query)
        slips = res_slips.scalars().all()

        emp_count = len(slips)
        tot_gross = sum((s.gross_salary for s in slips), Decimal("0.00"))
        tot_ded = sum((s.total_deductions for s in slips), Decimal("0.00"))
        tot_net = sum((s.net_salary for s in slips), Decimal("0.00"))

        avg_gross = (tot_gross / emp_count).quantize(Decimal("0.01")) if emp_count > 0 else Decimal("0.00")
        avg_ded = (tot_ded / emp_count).quantize(Decimal("0.01")) if emp_count > 0 else Decimal("0.00")
        avg_net = (tot_net / emp_count).quantize(Decimal("0.01")) if emp_count > 0 else Decimal("0.00")

        metrics = PayrollPeriodMetrics(
            total_gross=tot_gross,
            total_deductions=tot_ded,
            total_net=tot_net,
            avg_gross=avg_gross,
            avg_deductions=avg_ded,
            avg_net=avg_net,
            employee_count=emp_count,
        )

        dept_costs = await cls._get_department_cost_breakdown(
            db, org_id, period, department_id, employment_type
        )

        # Monthly Trends: Historical from AnalyticsSnapshot + Current/Live month
        monthly_trends = await cls._get_monthly_salary_trends(db, org_id)

        return PayrollDashboardResponse(
            period=period,
            metrics=metrics,
            salary_cost_by_department=dept_costs,
            monthly_trends=monthly_trends,
        )

    # ==========================================
    # 3. Attendance Dashboard
    # ==========================================

    @classmethod
    async def get_attendance_dashboard(
        cls,
        db: AsyncSession,
        org_id: uuid.UUID,
        month: Optional[int] = None,
        year: Optional[int] = None,
        from_date: Optional[date] = None,
        to_date: Optional[date] = None,
        department_id: Optional[uuid.UUID] = None,
        employment_type: Optional[EmploymentType] = None,
    ) -> AttendanceDashboardResponse:
        period = cls._resolve_period(month=month, year=year, from_date=from_date, to_date=to_date)
        today = datetime.now(timezone.utc).date()

        att_query = (
            select(
                Attendance.id,
                Attendance.status,
                Attendance.work_hours,
                Attendance.overtime_hours,
                Attendance.clock_in,
                Attendance.clock_out,
                Attendance.date,
                Attendance.source,
                Employee.department_id,
                Department.name.label("department_name"),
            )
            .join(Employee, Attendance.employee_id == Employee.id)
            .outerjoin(Department, Employee.department_id == Department.id)
            .where(
                Attendance.organization_id == org_id,
                Attendance.date >= period.from_date,
                Attendance.date <= period.to_date,
            )
        )
        if department_id:
            att_query = att_query.where(Employee.department_id == department_id)
        if employment_type:
            att_query = att_query.where(Employee.employment_type == employment_type)

        res = await db.execute(att_query)
        records = res.all()

        total_records = len(records)
        present_count = sum(1 for r in records if r.status == AttendanceStatus.PRESENT)
        late_count = sum(1 for r in records if r.status == AttendanceStatus.LATE)
        absent_count = sum(1 for r in records if r.status == AttendanceStatus.ABSENT)
        half_day_count = sum(1 for r in records if r.status == AttendanceStatus.HALF_DAY)

        # Calculate daily present/absent for today (or latest recorded workday)
        today_records = [r for r in records if r.date == today]
        if not today_records and records:
            latest_date = max(r.date for r in records)
            today_records = [r for r in records if r.date == latest_date]

        present_today_count = sum(
            1 for r in today_records 
            if r.status in [AttendanceStatus.PRESENT, AttendanceStatus.LATE, AttendanceStatus.HALF_DAY]
        )
        absent_today_count = sum(
            1 for r in today_records 
            if r.status == AttendanceStatus.ABSENT
        )

        total_work_hours = round(sum(float(r.work_hours or 0.0) for r in records), 2)
        total_overtime_hours = round(sum(float(r.overtime_hours or 0.0) for r in records), 2)

        # Missing checkout: clock_in set, clock_out null, date < today
        missing_checkout_count = sum(
            1 for r in records if r.clock_in is not None and r.clock_out is None and r.date < today
        )

        # Manual edit count: source == MANUAL
        manual_edit_count = sum(1 for r in records if r.source and r.source.value == "MANUAL")

        coverage_num = present_count + late_count + half_day_count
        attendance_coverage_percentage = (
            round((coverage_num / total_records * 100.0), 2) if total_records > 0 else 100.0
        )

        # Department breakdown
        dept_map: Dict[Optional[uuid.UUID], Dict[str, Any]] = {}
        for r in records:
            d_id = r.department_id
            d_name = r.department_name or "Unassigned"
            if d_id not in dept_map:
                dept_map[d_id] = {
                    "department_id": d_id,
                    "department_name": d_name,
                    "present_count": 0,
                    "late_count": 0,
                    "absent_count": 0,
                    "half_day_count": 0,
                    "total_work_hours": 0.0,
                    "total_overtime_hours": 0.0,
                    "total_records": 0,
                }
            entry = dept_map[d_id]
            entry["total_records"] += 1
            if r.status == AttendanceStatus.PRESENT:
                entry["present_count"] += 1
            elif r.status == AttendanceStatus.LATE:
                entry["late_count"] += 1
            elif r.status == AttendanceStatus.ABSENT:
                entry["absent_count"] += 1
            elif r.status == AttendanceStatus.HALF_DAY:
                entry["half_day_count"] += 1
            entry["total_work_hours"] += float(r.work_hours or 0.0)
            entry["total_overtime_hours"] += float(r.overtime_hours or 0.0)

        dept_metrics: List[DepartmentAttendanceMetric] = []
        for d in dept_map.values():
            tot = d["total_records"]
            cov = (
                round(((d["present_count"] + d["late_count"] + d["half_day_count"]) / tot * 100.0), 2)
                if tot > 0
                else 100.0
            )
            dept_metrics.append(
                DepartmentAttendanceMetric(
                    department_id=d["department_id"],
                    department_name=d["department_name"],
                    present_count=d["present_count"],
                    late_count=d["late_count"],
                    absent_count=d["absent_count"],
                    half_day_count=d["half_day_count"],
                    total_work_hours=round(d["total_work_hours"], 2),
                    total_overtime_hours=round(d["total_overtime_hours"], 2),
                    coverage_percentage=cov,
                )
            )

        return AttendanceDashboardResponse(
            period=period,
            total_records=total_records,
            present_count=present_count,
            late_count=late_count,
            absent_count=absent_count,
            half_day_count=half_day_count,
            present_today_count=present_today_count,
            absent_today_count=absent_today_count,
            total_work_hours=total_work_hours,
            total_overtime_hours=total_overtime_hours,
            missing_checkout_count=missing_checkout_count,
            manual_edit_count=manual_edit_count,
            attendance_coverage_percentage=attendance_coverage_percentage,
            department_breakdown=dept_metrics,
        )


    # ==========================================
    # 4. Employees Dashboard
    # ==========================================

    @classmethod
    async def get_employees_dashboard(
        cls,
        db: AsyncSession,
        org_id: uuid.UUID,
        month: Optional[int] = None,
        year: Optional[int] = None,
        from_date: Optional[date] = None,
        to_date: Optional[date] = None,
        department_id: Optional[uuid.UUID] = None,
        employment_type: Optional[EmploymentType] = None,
    ) -> EmployeesDashboardResponse:
        period = cls._resolve_period(month=month, year=year, from_date=from_date, to_date=to_date)

        query = (
            select(Employee)
            .where(Employee.organization_id == org_id)
            .options(
                selectinload(Employee.department),
                selectinload(Employee.designation),
            )
        )
        if department_id:
            query = query.where(Employee.department_id == department_id)
        if employment_type:
            query = query.where(Employee.employment_type == employment_type)

        res = await db.execute(query)
        employees = res.scalars().all()

        total_employees = len(employees)
        active_employees = sum(1 for e in employees if e.status == EmployeeStatus.ACTIVE)
        new_hires_in_period = sum(
            1
            for e in employees
            if e.joining_date
            and period.from_date <= e.joining_date <= period.to_date
        )

        # Breakdown by Department
        dept_counts: Dict[Optional[uuid.UUID], Dict[str, Any]] = {}
        for e in employees:
            d_id = e.department_id
            d_name = e.department.name if e.department else "Unassigned"
            if d_id not in dept_counts:
                dept_counts[d_id] = {
                    "id": d_id,
                    "name": d_name,
                    "count": 0,
                    "active_count": 0,
                    "new_hires": 0,
                }
            dept_counts[d_id]["count"] += 1
            if e.status == EmployeeStatus.ACTIVE:
                dept_counts[d_id]["active_count"] += 1
            if e.joining_date and period.from_date <= e.joining_date <= period.to_date:
                dept_counts[d_id]["new_hires"] += 1


        by_department = [
            DepartmentHeadcountItem(
                id=d["id"],
                name=d["name"],
                count=d["count"],
                percentage=round((d["count"] / total_employees * 100.0), 2) if total_employees > 0 else 0.0,
            )
            for d in dept_counts.values()
        ]

        department_summary = [
            DepartmentSummaryItem(
                department_id=d["id"],
                department_name=d["name"],
                headcount=d["count"],
                active_count=d["active_count"],
                new_hires=d["new_hires"],
            )
            for d in dept_counts.values()
        ]

        # Breakdown by Designation
        desig_counts: Dict[Optional[uuid.UUID], Dict[str, Any]] = {}
        for e in employees:
            des_id = e.designation_id
            des_title = e.designation.title if e.designation else "Unassigned"
            if des_id not in desig_counts:
                desig_counts[des_id] = {"id": des_id, "title": des_title, "count": 0}
            desig_counts[des_id]["count"] += 1

        by_designation = [
            DesignationHeadcountItem(
                id=d["id"],
                title=d["title"],
                count=d["count"],
                percentage=round((d["count"] / total_employees * 100.0), 2) if total_employees > 0 else 0.0,
            )
            for d in desig_counts.values()
        ]

        # Breakdown by Employment Type
        type_counts: Dict[str, int] = {}
        for e in employees:
            t_val = e.employment_type.value if hasattr(e.employment_type, "value") else str(e.employment_type)
            type_counts[t_val] = type_counts.get(t_val, 0) + 1

        by_employment_type = [
            TypeHeadcountItem(
                type=k,
                count=v,
                percentage=round((v / total_employees * 100.0), 2) if total_employees > 0 else 0.0,
            )
            for k, v in type_counts.items()
        ]

        # Breakdown by Status
        status_counts: Dict[str, int] = {}
        for e in employees:
            s_val = e.status.value if hasattr(e.status, "value") else str(e.status)
            status_counts[s_val] = status_counts.get(s_val, 0) + 1

        by_status = [
            StatusHeadcountItem(
                status=k,
                count=v,
                percentage=round((v / total_employees * 100.0), 2) if total_employees > 0 else 0.0,
            )
            for k, v in status_counts.items()
        ]

        return EmployeesDashboardResponse(
            period=period,
            total_employees=total_employees,
            active_employees=active_employees,
            new_hires_in_period=new_hires_in_period,
            by_department=by_department,
            by_designation=by_designation,
            by_employment_type=by_employment_type,
            by_status=by_status,
            department_summary=department_summary,
        )

    # ==========================================
    # 5. Salary Statement
    # ==========================================

    @classmethod
    async def get_salary_statement(
        cls,
        db: AsyncSession,
        current_user: User,
        target_user_id: uuid.UUID,
        month: Optional[int] = None,
        year: Optional[int] = None,
        from_date: Optional[date] = None,
        to_date: Optional[date] = None,
    ) -> SalaryStatementResponse:
        # Access control: user may only view self statement, unless holding HR_PAYROLL_USER / HR_PAYROLL_MANAGER / ADMIN
        user_role_str = current_user.role.value if hasattr(current_user.role, "value") else str(current_user.role)
        is_payroll_admin = user_role_str in [
            UserRole.HR_PAYROLL_USER.value,
            UserRole.HR_PAYROLL_MANAGER.value,
            UserRole.ADMIN.value,
        ]

        if current_user.id != target_user_id and not is_payroll_admin:
            raise ForbiddenError("You are not authorized to view another employee's salary statement")

        org_id = current_user.organization_id

        # Resolve employee profile for target user
        emp_stmt = (
            select(Employee)
            .where(
                Employee.organization_id == org_id,
                Employee.user_id == target_user_id,
            )
            .options(
                selectinload(Employee.department),
                selectinload(Employee.designation),
            )
        )
        emp_res = await db.execute(emp_stmt)
        employee = emp_res.scalar_one_or_none()

        if not employee:
            # Try lookup by email if user_id unlinked
            user_target_stmt = select(User).where(User.id == target_user_id, User.organization_id == org_id)
            user_target = (await db.execute(user_target_stmt)).scalar_one_or_none()
            if user_target:
                emp_by_email_stmt = (
                    select(Employee)
                    .where(Employee.organization_id == org_id, Employee.email == user_target.email)
                    .options(
                        selectinload(Employee.department),
                        selectinload(Employee.designation),
                    )
                )
                employee = (await db.execute(emp_by_email_stmt)).scalar_one_or_none()

        if not employee:
            raise NotFoundError("Employee profile for the specified user was not found")

        period = cls._resolve_period(month=month, year=year, from_date=from_date, to_date=to_date)

        # Payslips in filtered period
        slips_stmt = (
            select(Payslip)
            .where(
                Payslip.organization_id == org_id,
                Payslip.employee_id == employee.id,
                Payslip.period_start <= period.to_date,
                Payslip.period_end >= period.from_date,
            )
            .options(
                selectinload(Payslip.employee),
                selectinload(Payslip.payrun),
            )
            .order_by(Payslip.period_start.desc())
        )
        slips_res = await db.execute(slips_stmt)
        period_slips = slips_res.scalars().all()

        payslip_responses = [
            PayslipResponse(
                id=s.id,
                organization_id=s.organization_id,
                payrun_id=s.payrun_id,
                employee_id=s.employee_id,
                contract_id=s.contract_id,
                payslip_number=s.payslip_number,
                period_start=s.period_start,
                period_end=s.period_end,
                basic_salary=s.basic_salary,
                gross_salary=s.gross_salary,
                total_earnings=s.total_earnings,
                total_deductions=s.total_deductions,
                net_salary=s.net_salary,
                status=s.status,
                pdf_url=s.pdf_url,
                generated_at=s.generated_at,
                sent_at=s.sent_at,
                paid_at=s.paid_at,
                created_at=s.created_at,
                updated_at=s.updated_at,
                employee_name=f"{employee.first_name} {employee.last_name}",
                employee_code=employee.employee_code,
                payrun_name=s.payrun.name if s.payrun else None,
            )
            for s in period_slips
        ]

        # Compute YTD Totals for current year (or period year)
        ytd_year = period.year or period.from_date.year
        ytd_stmt = select(
            func.sum(Payslip.gross_salary),
            func.sum(Payslip.total_deductions),
            func.sum(Payslip.net_salary),
            func.count(Payslip.id),
        ).where(
            Payslip.organization_id == org_id,
            Payslip.employee_id == employee.id,
            extract("year", Payslip.period_start) == ytd_year,
        )
        ytd_res = await db.execute(ytd_stmt)
        ytd_gross, ytd_ded, ytd_net, ytd_count = ytd_res.first() or (Decimal("0.00"), Decimal("0.00"), Decimal("0.00"), 0)

        ytd_summary = YTDSummary(
            ytd_gross_earnings=ytd_gross or Decimal("0.00"),
            ytd_total_deductions=ytd_ded or Decimal("0.00"),
            ytd_net_salary=ytd_net or Decimal("0.00"),
            total_payslips=ytd_count or 0,
        )

        return SalaryStatementResponse(
            user_id=target_user_id,
            employee_id=employee.id,
            employee_name=f"{employee.first_name} {employee.last_name}",
            employee_code=employee.employee_code,
            department_name=employee.department.name if employee.department else None,
            designation_title=employee.designation.title if employee.designation else None,
            period=period,
            ytd_summary=ytd_summary,
            payslips=payslip_responses,
        )

    # ==========================================
    # Helpers
    # ==========================================

    @classmethod
    async def _get_department_cost_breakdown(
        cls,
        db: AsyncSession,
        org_id: uuid.UUID,
        period: PeriodFilter,
        department_id: Optional[uuid.UUID] = None,
        employment_type: Optional[EmploymentType] = None,
    ) -> List[DepartmentCostBreakdown]:
        """Aggregate department headcount and total gross/net salary costs."""
        # Query all departments in org
        dept_stmt = select(Department).where(Department.organization_id == org_id)
        if department_id:
            dept_stmt = dept_stmt.where(Department.id == department_id)
        dept_res = await db.execute(dept_stmt)
        departments = dept_res.scalars().all()

        results: List[DepartmentCostBreakdown] = []
        for d in departments:
            # Headcount in department
            emp_stmt = select(func.count(Employee.id)).where(
                Employee.organization_id == org_id,
                Employee.department_id == d.id,
                Employee.status == EmployeeStatus.ACTIVE,
            )
            if employment_type:
                emp_stmt = emp_stmt.where(Employee.employment_type == employment_type)
            headcount = (await db.execute(emp_stmt)).scalar() or 0

            # Salary cost from payslips in period
            cost_stmt = (
                select(func.sum(Payslip.net_salary))
                .join(Employee, Payslip.employee_id == Employee.id)
                .where(
                    Payslip.organization_id == org_id,
                    Employee.department_id == d.id,
                    Payslip.period_start <= period.to_date,
                    Payslip.period_end >= period.from_date,
                )
            )
            if employment_type:
                cost_stmt = cost_stmt.where(Employee.employment_type == employment_type)
            total_cost = (await db.execute(cost_stmt)).scalar() or Decimal("0.00")
            avg_cost = (total_cost / headcount).quantize(Decimal("0.01")) if headcount > 0 else Decimal("0.00")

            results.append(
                DepartmentCostBreakdown(
                    department_id=d.id,
                    department_name=d.name,
                    headcount=headcount,
                    total_cost=total_cost,
                    avg_cost=avg_cost,
                )
            )

        return results

    @classmethod
    async def _get_monthly_salary_trends(
        cls,
        db: AsyncSession,
        org_id: uuid.UUID,
    ) -> List[MonthlySalaryTrend]:
        """Fetch historical trends from AnalyticsSnapshot and current month computed live."""
        today = datetime.now(timezone.utc).date()
        current_month_start = date(today.year, today.month, 1)

        # 1. Fetch historical snapshots (prior to current month)
        snap_stmt = (
            select(AnalyticsSnapshot)
            .where(
                AnalyticsSnapshot.organization_id == org_id,
                AnalyticsSnapshot.type == "PAYROLL_MONTHLY",
                AnalyticsSnapshot.date < current_month_start,
            )
            .order_by(AnalyticsSnapshot.date.asc())
        )
        snap_res = await db.execute(snap_stmt)
        snapshots = snap_res.scalars().all()

        trends: List[MonthlySalaryTrend] = []
        for s in snapshots:
            try:
                data = json.loads(s.data)
                trends.append(
                    MonthlySalaryTrend(
                        month=s.date.month,
                        year=s.date.year,
                        date=s.date,
                        total_gross=Decimal(str(data.get("total_gross", 0.0))),
                        total_deductions=Decimal(str(data.get("total_deductions", 0.0))),
                        total_net=Decimal(str(data.get("total_net", 0.0))),
                        employee_count=int(data.get("employee_count", 0)),
                        avg_salary=Decimal(str(data.get("avg_salary", 0.0))),
                        is_live=False,
                    )
                )
            except Exception:
                continue

        # 2. Compute current month live from finalized/processed Payruns and Payslips
        _, last_day = calendar.monthrange(today.year, today.month)
        cur_end = date(today.year, today.month, last_day)

        live_slips_stmt = select(Payslip).where(
            Payslip.organization_id == org_id,
            Payslip.period_start <= cur_end,
            Payslip.period_end >= current_month_start,
        )
        live_res = await db.execute(live_slips_stmt)
        live_slips = live_res.scalars().all()

        live_count = len(live_slips)
        live_gross = sum((sl.gross_salary for sl in live_slips), Decimal("0.00"))
        live_ded = sum((sl.total_deductions for sl in live_slips), Decimal("0.00"))
        live_net = sum((sl.net_salary for sl in live_slips), Decimal("0.00"))
        live_avg = (live_net / live_count).quantize(Decimal("0.01")) if live_count > 0 else Decimal("0.00")

        trends.append(
            MonthlySalaryTrend(
                month=today.month,
                year=today.year,
                date=current_month_start,
                total_gross=live_gross,
                total_deductions=live_ded,
                total_net=live_net,
                employee_count=live_count,
                avg_salary=live_avg,
                is_live=True,
            )
        )

        return trends
