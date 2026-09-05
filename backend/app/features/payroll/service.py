from datetime import date, datetime, timezone
from decimal import Decimal
import logging
from typing import Any, Dict, List, Optional, Sequence, Tuple
import uuid
from sqlalchemy import delete, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.exceptions import BadRequestError, ForbiddenError, NotFoundError
from app.features.auth.models import User
from app.features.employees.models import Employee
from app.features.payroll.email_service import send_payslip_emails_for_payrun
from app.features.payroll.engine import PayrollEngine
from app.features.payroll.models import (
    PayrollValidationIssue,
    Payrun,
    PayrunEmployee,
    Payslip,
    PayslipDelivery,
    PayslipLine,
)
from app.features.payroll.pdf import generate_payslip_pdf
from app.features.payroll.repository import (
    PayrollValidationIssueRepository,
    PayrunRepository,
    PayslipRepository,
)
from app.features.payroll.schemas import (
    PayrollDashboardResponse,
    PayrollValidationIssueResponse,
    PayrunCreate,
    PayrunDetailResponse,
    PayrunEmployeeResponse,
    PayrunResponse,
    PayslipDetailResponse,
    PayslipDeliveryResponse,
    PayslipLineResponse,
    PayslipResponse,
)
from app.shared.enums import (
    PayrollIssueSeverity,
    PayrunEmployeeStatus,
    PayrunStatus,
    PayslipStatus,
    UserRole,
)
from app.shared.pagination import PageParams, PaginatedResponse

logger = logging.getLogger("payroll.service")


class PayrollService:

    @staticmethod
    async def get_employee_for_user(db: AsyncSession, user: User) -> Optional[Employee]:
        if hasattr(user, "employee") and user.employee is not None:
            return user.employee

        stmt = select(Employee).where(
            Employee.organization_id == user.organization_id,
            Employee.user_id == user.id,
        )
        emp = (await db.execute(stmt)).scalar_one_or_none()
        if emp is not None:
            return emp

        stmt_email = select(Employee).where(
            Employee.organization_id == user.organization_id,
            Employee.email == user.email,
        )
        return (await db.execute(stmt_email)).scalar_one_or_none()

    @staticmethod
    def _to_payrun_response(p: Payrun) -> PayrunResponse:
        return PayrunResponse(
            id=p.id,
            organization_id=p.organization_id,
            name=p.name,
            period_start=p.period_start,
            period_end=p.period_end,
            month=p.month,
            year=p.year,
            status=p.status,
            total_employees=p.total_employees,
            processed_employees=p.processed_employees,
            issue_count=p.issue_count,
            total_gross=p.total_gross,
            total_deductions=p.total_deductions,
            total_net=p.total_net,
            created_by_id=p.created_by_id,
            finalized_by_id=p.finalized_by_id,
            computed_at=p.computed_at,
            finalized_at=p.finalized_at,
            notes=p.notes,
            created_at=p.created_at,
            updated_at=p.updated_at,
        )

    @staticmethod
    def _to_payrun_emp_response(e: PayrunEmployee) -> PayrunEmployeeResponse:
        emp = getattr(e, "employee", None)
        emp_name = f"{emp.first_name} {emp.last_name}" if emp else None
        emp_code = emp.employee_code if emp else None
        return PayrunEmployeeResponse(
            id=e.id,
            organization_id=e.organization_id,
            payrun_id=e.payrun_id,
            employee_id=e.employee_id,
            contract_id=e.contract_id,
            status=e.status,
            payable_days=e.payable_days,
            worked_days=e.worked_days,
            leave_days=e.leave_days,
            absent_days=e.absent_days,
            overtime_hours=e.overtime_hours,
            gross_salary=e.gross_salary,
            total_deductions=e.total_deductions,
            net_salary=e.net_salary,
            is_ready=e.is_ready,
            computed_at=e.computed_at,
            created_at=e.created_at,
            updated_at=e.updated_at,
            employee_name=emp_name,
            employee_code=emp_code,
        )

    @staticmethod
    def _to_issue_response(i: PayrollValidationIssue) -> PayrollValidationIssueResponse:
        emp = getattr(i, "employee", None)
        emp_name = f"{emp.first_name} {emp.last_name}" if emp else None
        emp_code = emp.employee_code if emp else None
        return PayrollValidationIssueResponse(
            id=i.id,
            organization_id=i.organization_id,
            payrun_id=i.payrun_id,
            employee_id=i.employee_id,
            issue_code=i.issue_code,
            category=i.category,
            severity=i.severity,
            title=i.title,
            description=i.description,
            status=i.status,
            resolution=i.resolution,
            resolved_by_id=i.resolved_by_id,
            resolved_at=i.resolved_at,
            created_at=i.created_at,
            updated_at=i.updated_at,
            employee_name=emp_name,
            employee_code=emp_code,
        )

    @classmethod
    def _to_payrun_detail_response(cls, p: Payrun) -> PayrunDetailResponse:
        emp_responses = [cls._to_payrun_emp_response(e) for e in p.employees]
        issue_responses = [cls._to_issue_response(i) for i in p.issues]
        base_resp = cls._to_payrun_response(p)
        return PayrunDetailResponse(
            **base_resp.model_dump(),
            employees=emp_responses,
            issues=issue_responses,
        )

    @staticmethod
    def _to_payslip_response(s: Payslip) -> PayslipResponse:
        emp = getattr(s, "employee", None)
        emp_name = f"{emp.first_name} {emp.last_name}" if emp else None
        emp_code = emp.employee_code if emp else None
        payrun = getattr(s, "payrun", None)
        payrun_name = payrun.name if payrun else None
        return PayslipResponse(
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
            employee_name=emp_name,
            employee_code=emp_code,
            payrun_name=payrun_name,
        )

    @classmethod
    def _to_payslip_detail_response(cls, s: Payslip) -> PayslipDetailResponse:
        lines_resp = [
            PayslipLineResponse(
                id=l.id,
                payslip_id=l.payslip_id,
                salary_rule_id=l.salary_rule_id,
                name=l.name,
                code=l.code,
                category=l.category,
                base_amount=l.base_amount,
                rate=l.rate,
                amount=l.amount,
                sequence=l.sequence,
                created_at=l.created_at,
                updated_at=l.updated_at,
            )
            for l in (s.lines or [])
        ]
        deliveries_resp = [
            PayslipDeliveryResponse(
                id=d.id,
                payslip_id=d.payslip_id,
                recipient_email=d.recipient_email,
                delivery_type=d.delivery_type,
                status=d.status,
                sent_at=d.sent_at,
                failure_reason=d.failure_reason,
                created_at=d.created_at,
                updated_at=d.updated_at,
            )
            for d in (s.deliveries or [])
        ]
        base_resp = cls._to_payslip_response(s)
        return PayslipDetailResponse(
            **base_resp.model_dump(),
            lines=lines_resp,
            deliveries=deliveries_resp,
        )

    # ==========================================
    # Dashboard
    # ==========================================

    @classmethod
    async def get_dashboard(
        cls,
        db: AsyncSession,
        org_id: uuid.UUID,
    ) -> PayrollDashboardResponse:
        current_year = datetime.now(timezone.utc).year
        ytd_stats = await PayrunRepository.get_ytd_stats(db, org_id, current_year)
        open_issues = await PayrollValidationIssueRepository.count_open_issues(db, org_id)

        # Count active employees
        stmt_emp = select(func.count(Employee.id)).where(Employee.organization_id == org_id)
        total_emps = (await db.execute(stmt_emp)).scalar() or 0

        # Latest payrun
        stmt_latest = (
            select(Payrun)
            .where(Payrun.organization_id == org_id)
            .order_by(Payrun.period_start.desc(), Payrun.created_at.desc())
            .limit(1)
        )
        latest_p = (await db.execute(stmt_latest)).scalar_one_or_none()
        latest_resp = cls._to_payrun_response(latest_p) if latest_p else None

        return PayrollDashboardResponse(
            latest_payrun=latest_resp,
            ytd_gross=ytd_stats["ytd_gross"],
            ytd_deductions=ytd_stats["ytd_deductions"],
            ytd_net=ytd_stats["ytd_net"],
            ytd_processed_payruns=ytd_stats["ytd_processed_payruns"],
            open_issue_count=open_issues,
            total_employees=total_emps,
        )

    # ==========================================
    # Payrun CRUD & Actions
    # ==========================================

    @classmethod
    async def list_payruns(
        cls,
        db: AsyncSession,
        org_id: uuid.UUID,
        status: Optional[PayrunStatus] = None,
        year: Optional[int] = None,
        month: Optional[int] = None,
        page: int = 1,
        page_size: int = 20,
    ) -> PaginatedResponse[PayrunResponse]:
        items, total = await PayrunRepository.list_payruns(
            db, org_id, status=status, year=year, month=month, page=page, page_size=page_size
        )
        resps = [cls._to_payrun_response(p) for p in items]
        params = PageParams(page=page, page_size=page_size)
        return PaginatedResponse.create(resps, total, params)

    @classmethod
    async def create_payrun(
        cls,
        db: AsyncSession,
        current_user: User,
        payload: PayrunCreate,
    ) -> PayrunDetailResponse:
        org_id = current_user.organization_id

        # Validate employee IDs
        stmt_emps = select(Employee).where(
            Employee.organization_id == org_id,
            Employee.id.in_(payload.employee_ids),
        )
        valid_emps = (await db.execute(stmt_emps)).scalars().all()
        if len(valid_emps) != len(set(payload.employee_ids)):
            raise NotFoundError("One or more employee IDs are invalid or belong to another organization")

        payrun = Payrun(
            organization_id=org_id,
            name=payload.name,
            period_start=payload.period_start,
            period_end=payload.period_end,
            month=payload.month,
            year=payload.year,
            status=PayrunStatus.DRAFT,
            total_employees=len(valid_emps),
            processed_employees=0,
            issue_count=0,
            total_gross=Decimal("0.00"),
            total_deductions=Decimal("0.00"),
            total_net=Decimal("0.00"),
            created_by_id=current_user.id,
            notes=payload.notes,
        )

        for emp in valid_emps:
            pe = PayrunEmployee(
                organization_id=org_id,
                employee_id=emp.id,
                status=PayrunEmployeeStatus.PENDING,
                is_ready=True,
            )
            payrun.employees.append(pe)

        created = await PayrunRepository.create(db, payrun)
        return cls._to_payrun_detail_response(created)

    @classmethod
    async def get_payrun(
        cls,
        db: AsyncSession,
        org_id: uuid.UUID,
        payrun_id: uuid.UUID,
    ) -> PayrunDetailResponse:
        payrun = await PayrunRepository.get_by_id(db, org_id, payrun_id)
        if payrun is None:
            raise NotFoundError("Payrun not found")
        return cls._to_payrun_detail_response(payrun)

    @classmethod
    async def process_payrun(
        cls,
        db: AsyncSession,
        current_user: User,
        payrun_id: uuid.UUID,
    ) -> PayrunDetailResponse:
        org_id = current_user.organization_id
        payrun = await PayrunRepository.get_by_id(db, org_id, payrun_id)
        if payrun is None:
            raise NotFoundError("Payrun not found")

        if payrun.status == PayrunStatus.FINALIZED:
            raise BadRequestError("Cannot process an already FINALIZED payrun.")

        payrun.status = PayrunStatus.PROCESSING

        # Clear previously generated validation issues & payslips for a clean re-run
        await db.execute(
            delete(PayrollValidationIssue).where(
                PayrollValidationIssue.organization_id == org_id,
                PayrollValidationIssue.payrun_id == payrun.id,
            )
        )
        await db.execute(
            delete(Payslip).where(
                Payslip.organization_id == org_id,
                Payslip.payrun_id == payrun.id,
            )
        )
        await db.flush()

        all_issues: List[PayrollValidationIssue] = []
        slip_counter = 1

        for pe in payrun.employees:
            pe_updated, issues, payslip = await PayrollEngine.process_employee(
                db=db,
                payrun=payrun,
                payrun_emp=pe,
                slip_seq_num=slip_counter,
            )
            for iss in issues:
                db.add(iss)
                all_issues.append(iss)

            if payslip is not None and pe_updated.is_ready:
                db.add(payslip)
                slip_counter += 1

        # Roll up totals across computed employees
        computed_emps = [e for e in payrun.employees if e.status == PayrunEmployeeStatus.COMPUTED]
        payrun.total_employees = len(payrun.employees)
        payrun.processed_employees = len(computed_emps)
        payrun.issue_count = len(all_issues)
        payrun.total_gross = sum((e.gross_salary for e in computed_emps), Decimal("0.00"))
        payrun.total_deductions = sum((e.total_deductions for e in computed_emps), Decimal("0.00"))
        payrun.total_net = sum((e.net_salary for e in computed_emps), Decimal("0.00"))
        payrun.status = PayrunStatus.PROCESSED
        payrun.computed_at = datetime.now(timezone.utc)

        saved = await PayrunRepository.save(db, payrun)
        return cls._to_payrun_detail_response(saved)

    @classmethod
    async def finalize_payrun(
        cls,
        db: AsyncSession,
        current_user: User,
        payrun_id: uuid.UUID,
    ) -> PayrunDetailResponse:
        org_id = current_user.organization_id
        payrun = await PayrunRepository.get_by_id(db, org_id, payrun_id)
        if payrun is None:
            raise NotFoundError("Payrun not found")

        if payrun.status == PayrunStatus.FINALIZED:
            raise BadRequestError("Payrun is already FINALIZED.")

        if payrun.status != PayrunStatus.PROCESSED:
            raise BadRequestError(f"Payrun must be in PROCESSED status to finalize (current status: {payrun.status.value}).")

        # Check for unready employees / open ERROR issues
        unready = [e for e in payrun.employees if not e.is_ready]
        if unready:
            raise BadRequestError(
                f"Cannot finalize payrun: {len(unready)} employee(s) have unresolved ERROR-severity issues."
            )

        now = datetime.now(timezone.utc)
        payrun.status = PayrunStatus.FINALIZED
        payrun.finalized_by_id = current_user.id
        payrun.finalized_at = now

        # Mark all payslips PAID
        for slip in payrun.payslips:
            slip.status = PayslipStatus.PAID
            slip.paid_at = now

        saved = await PayrunRepository.save(db, payrun)

        # 1. Audit Log
        from app.core.audit import log_audit
        await log_audit(
            db=db,
            user=current_user,
            action="FINALIZE",
            module="PAYROLL",
            resource_type="Payrun",
            resource_id=saved.id,
            before={"status": "PROCESSED"},
            after={"status": "FINALIZED", "total_net": str(saved.total_net), "processed_employees": saved.processed_employees},
            org_id=org_id,
        )

        # 2. Frozen Analytics Snapshot for historical reporting
        import json
        from app.features.reports_dashboard.models import AnalyticsSnapshot
        first_day_of_month = date(saved.year, saved.month, 1)
        avg_salary_val = float(saved.total_net / saved.processed_employees) if saved.processed_employees > 0 else 0.0
        snapshot_data = {
            "total_gross": float(saved.total_gross),
            "total_deductions": float(saved.total_deductions),
            "total_net": float(saved.total_net),
            "employee_count": saved.processed_employees,
            "avg_salary": avg_salary_val,
        }

        snap_stmt = select(AnalyticsSnapshot).where(
            AnalyticsSnapshot.organization_id == org_id,
            AnalyticsSnapshot.type == "PAYROLL_MONTHLY",
            AnalyticsSnapshot.date == first_day_of_month,
        )
        existing_snap = (await db.execute(snap_stmt)).scalar_one_or_none()
        if existing_snap:
            existing_snap.data = json.dumps(snapshot_data)
        else:
            new_snap = AnalyticsSnapshot(
                organization_id=org_id,
                type="PAYROLL_MONTHLY",
                date=first_day_of_month,
                data=json.dumps(snapshot_data),
            )
            db.add(new_snap)

        await db.commit()

        return cls._to_payrun_detail_response(saved)


    @classmethod
    async def email_payrun(
        cls,
        db: AsyncSession,
        current_user: User,
        payrun_id: uuid.UUID,
    ) -> Dict[str, Any]:
        org_id = current_user.organization_id
        payrun = await PayrunRepository.get_by_id(db, org_id, payrun_id)
        if payrun is None:
            raise NotFoundError("Payrun not found")

        if payrun.status != PayrunStatus.FINALIZED:
            raise BadRequestError("Payslips can only be emailed for FINALIZED payruns.")

        deliveries = await send_payslip_emails_for_payrun(db, payrun.payslips)
        sent_count = sum(1 for d in deliveries if d.status.value == "SENT")
        failed_count = sum(1 for d in deliveries if d.status.value == "FAILED")

        return {
            "message": f"Dispatched payslip emails for payrun {payrun.name}",
            "total_payslips": len(payrun.payslips),
            "sent_count": sent_count,
            "failed_count": failed_count,
        }

    # ==========================================
    # Payslips Endpoints
    # ==========================================

    @classmethod
    async def list_payslips(
        cls,
        db: AsyncSession,
        current_user: User,
        employee_id: Optional[uuid.UUID] = None,
        month: Optional[int] = None,
        year: Optional[int] = None,
        status: Optional[PayslipStatus] = None,
        page: int = 1,
        page_size: int = 20,
    ) -> PaginatedResponse[PayslipResponse]:
        target_emp_id = employee_id

        if current_user.role == UserRole.EMPLOYEE:
            emp = await cls.get_employee_for_user(db, current_user)
            if emp is None:
                params = PageParams(page=page, page_size=page_size)
                return PaginatedResponse.create([], 0, params)
            target_emp_id = emp.id

        items, total = await PayslipRepository.list_payslips(
            db,
            current_user.organization_id,
            employee_id=target_emp_id,
            month=month,
            year=year,
            status=status,
            page=page,
            page_size=page_size,
        )
        resps = [cls._to_payslip_response(s) for s in items]
        params = PageParams(page=page, page_size=page_size)
        return PaginatedResponse.create(resps, total, params)

    @classmethod
    async def get_payslip(
        cls,
        db: AsyncSession,
        current_user: User,
        payslip_id: uuid.UUID,
    ) -> PayslipDetailResponse:
        slip = await PayslipRepository.get_by_id(db, current_user.organization_id, payslip_id)
        if slip is None:
            raise NotFoundError("Payslip not found")

        if current_user.role == UserRole.EMPLOYEE:
            emp = await cls.get_employee_for_user(db, current_user)
            if emp is None or slip.employee_id != emp.id:
                raise ForbiddenError("Access denied to requested payslip")

        return cls._to_payslip_detail_response(slip)

    @classmethod
    async def get_payslip_pdf(
        cls,
        db: AsyncSession,
        current_user: User,
        payslip_id: uuid.UUID,
    ) -> Tuple[str, bytes]:
        slip = await PayslipRepository.get_by_id(db, current_user.organization_id, payslip_id)
        if slip is None:
            raise NotFoundError("Payslip not found")

        if current_user.role == UserRole.EMPLOYEE:
            emp = await cls.get_employee_for_user(db, current_user)
            if emp is None or slip.employee_id != emp.id:
                raise ForbiddenError("Access denied to requested payslip")

        file_path, pdf_bytes = generate_payslip_pdf(slip)
        return f"{slip.payslip_number}.pdf", pdf_bytes
