from datetime import datetime, timezone
from decimal import Decimal
from typing import List, Optional, Sequence
import uuid
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import BadRequestError, ConflictError, ForbiddenError, NotFoundError
from app.features.attendance.models import Holiday
from app.features.auth.models import User
from app.features.employees.models import Employee
from app.features.time_off.models import LeaveAllocation, LeaveRequest, LeaveType
from app.features.time_off.repository import (
    LeaveAllocationRepository,
    LeaveRequestRepository,
    LeaveTypeRepository,
)
from app.features.time_off.schemas import (
    LeaveAllocationCreate,
    LeaveAllocationResponse,
    LeaveRequestCreate,
    LeaveRequestResponse,
    LeaveRequestReview,
    LeaveTypeCreate,
    LeaveTypeResponse,
    LeaveTypeUpdate,
)
from app.shared.date_utils import calculate_working_days
from app.shared.enums import LeaveRequestStatus, UserRole


class TimeOffService:

    @staticmethod
    async def get_employee_for_user(db: AsyncSession, user: User) -> Optional[Employee]:
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
        return result_email.scalar_one_or_none()

    @staticmethod
    def _to_allocation_response(a: LeaveAllocation) -> LeaveAllocationResponse:
        emp_code = a.employee.employee_code if getattr(a, "employee", None) else None
        emp_name = f"{a.employee.first_name} {a.employee.last_name}" if getattr(a, "employee", None) else None
        lt_name = a.leave_type.name if getattr(a, "leave_type", None) else None
        lt_code = a.leave_type.code if getattr(a, "leave_type", None) else None
        return LeaveAllocationResponse(
            id=a.id,
            organization_id=a.organization_id,
            employee_id=a.employee_id,
            leave_type_id=a.leave_type_id,
            year=a.year,
            allocated_days=a.allocated_days,
            used_days=a.used_days,
            remaining_days=a.remaining_days,
            allocated_by_id=a.allocated_by_id,
            created_at=a.created_at,
            updated_at=a.updated_at,
            leave_type_name=lt_name,
            leave_type_code=lt_code,
            employee_code=emp_code,
            employee_name=emp_name,
        )

    @staticmethod
    def _to_request_response(r: LeaveRequest) -> LeaveRequestResponse:
        emp_code = r.employee.employee_code if getattr(r, "employee", None) else None
        emp_name = f"{r.employee.first_name} {r.employee.last_name}" if getattr(r, "employee", None) else None
        lt_name = r.leave_type.name if getattr(r, "leave_type", None) else None
        lt_code = r.leave_type.code if getattr(r, "leave_type", None) else None
        return LeaveRequestResponse(
            id=r.id,
            organization_id=r.organization_id,
            employee_id=r.employee_id,
            leave_type_id=r.leave_type_id,
            start_date=r.start_date,
            end_date=r.end_date,
            days=r.days,
            reason=r.reason,
            status=r.status,
            reviewed_by_id=r.reviewed_by_id,
            review_comment=r.review_comment,
            reviewed_at=r.reviewed_at,
            created_at=r.created_at,
            updated_at=r.updated_at,
            leave_type_name=lt_name,
            leave_type_code=lt_code,
            employee_code=emp_code,
            employee_name=emp_name,
        )

    # ==========================================
    # Leave Types
    # ==========================================

    @classmethod
    async def list_leave_types(
        cls,
        db: AsyncSession,
        org_id: uuid.UUID,
        is_active: Optional[bool] = None,
    ) -> List[LeaveTypeResponse]:
        types = await LeaveTypeRepository.list_types(db, org_id, is_active=is_active)
        return [LeaveTypeResponse.model_validate(t) for t in types]

    @classmethod
    async def create_leave_type(
        cls,
        db: AsyncSession,
        org_id: uuid.UUID,
        payload: LeaveTypeCreate,
    ) -> LeaveTypeResponse:
        existing = await LeaveTypeRepository.get_by_code(db, org_id, payload.code)
        if existing is not None:
            raise ConflictError(f"Leave type with code '{payload.code}' already exists in this organization")

        leave_type = LeaveType(
            organization_id=org_id,
            name=payload.name,
            code=payload.code,
            description=payload.description,
            default_days=payload.default_days,
            is_paid=payload.is_paid,
            carry_forward=payload.carry_forward,
            max_carry_forward=payload.max_carry_forward,
            requires_approval=payload.requires_approval,
            is_active=payload.is_active,
        )
        created = await LeaveTypeRepository.create(db, leave_type)
        return LeaveTypeResponse.model_validate(created)

    # ==========================================
    # Leave Allocations
    # ==========================================

    @classmethod
    async def list_allocations(
        cls,
        db: AsyncSession,
        current_user: User,
        employee_id: Optional[uuid.UUID] = None,
        year: Optional[int] = None,
        leave_type_id: Optional[uuid.UUID] = None,
    ) -> List[LeaveAllocationResponse]:
        target_employee_id = employee_id

        # If EMPLOYEE role, force filter to self only
        if current_user.role == UserRole.EMPLOYEE:
            emp = await cls.get_employee_for_user(db, current_user)
            if emp is None:
                return []
            target_employee_id = emp.id

        allocations = await LeaveAllocationRepository.list_allocations(
            db,
            current_user.organization_id,
            employee_id=target_employee_id,
            year=year,
            leave_type_id=leave_type_id,
        )
        return [cls._to_allocation_response(a) for a in allocations]

    @classmethod
    async def create_allocation(
        cls,
        db: AsyncSession,
        current_user: User,
        payload: LeaveAllocationCreate,
    ) -> LeaveAllocationResponse:
        # Validate employee
        stmt_emp = select(Employee).where(
            Employee.organization_id == current_user.organization_id,
            Employee.id == payload.employee_id,
        )
        emp = (await db.execute(stmt_emp)).scalar_one_or_none()
        if emp is None:
            raise NotFoundError("Employee not found in this organization")

        # Validate leave type
        leave_type = await LeaveTypeRepository.get_by_id(db, current_user.organization_id, payload.leave_type_id)
        if leave_type is None:
            raise NotFoundError("Leave type not found in this organization")

        # Check unique (employee_id, leave_type_id, year)
        existing = await LeaveAllocationRepository.get_by_employee_type_year(
            db,
            current_user.organization_id,
            payload.employee_id,
            payload.leave_type_id,
            payload.year,
        )
        if existing is not None:
            raise ConflictError("Leave allocation already exists for this employee, leave type, and year")

        allocated_days = Decimal(str(payload.allocated_days))
        used_days = Decimal("0.0")
        remaining_days = allocated_days - used_days

        allocation = LeaveAllocation(
            organization_id=current_user.organization_id,
            employee_id=payload.employee_id,
            leave_type_id=payload.leave_type_id,
            year=payload.year,
            allocated_days=allocated_days,
            used_days=used_days,
            remaining_days=remaining_days,
            allocated_by_id=current_user.id,
        )
        created = await LeaveAllocationRepository.create(db, allocation)
        return cls._to_allocation_response(created)

    # ==========================================
    # Leave Requests
    # ==========================================

    @classmethod
    async def list_requests(
        cls,
        db: AsyncSession,
        current_user: User,
        employee_id: Optional[uuid.UUID] = None,
        status: Optional[LeaveRequestStatus] = None,
        leave_type_id: Optional[uuid.UUID] = None,
        year: Optional[int] = None,
    ) -> List[LeaveRequestResponse]:
        target_employee_id = employee_id

        # If EMPLOYEE role, force filter to self only
        if current_user.role == UserRole.EMPLOYEE:
            emp = await cls.get_employee_for_user(db, current_user)
            if emp is None:
                return []
            target_employee_id = emp.id

        requests = await LeaveRequestRepository.list_requests(
            db,
            current_user.organization_id,
            employee_id=target_employee_id,
            status=status,
            leave_type_id=leave_type_id,
            year=year,
        )
        return [cls._to_request_response(r) for r in requests]

    @classmethod
    async def create_request(
        cls,
        db: AsyncSession,
        current_user: User,
        payload: LeaveRequestCreate,
    ) -> LeaveRequestResponse:
        # 1. Resolve target employee
        if current_user.role == UserRole.EMPLOYEE:
            target_emp = await cls.get_employee_for_user(db, current_user)
            if target_emp is None:
                raise NotFoundError("Employee profile not found for current user")
        else:
            if payload.employee_id is not None:
                stmt_emp = select(Employee).where(
                    Employee.organization_id == current_user.organization_id,
                    Employee.id == payload.employee_id,
                )
                target_emp = (await db.execute(stmt_emp)).scalar_one_or_none()
                if target_emp is None:
                    raise NotFoundError("Employee not found in this organization")
            else:
                target_emp = await cls.get_employee_for_user(db, current_user)
                if target_emp is None:
                    raise BadRequestError("employee_id is required when filing a leave request on behalf of an employee")

        # 2. Validate Leave Type
        leave_type = await LeaveTypeRepository.get_by_id(db, current_user.organization_id, payload.leave_type_id)
        if leave_type is None:
            raise NotFoundError("Leave type not found in this organization")
        if not leave_type.is_active:
            raise BadRequestError("Leave type is inactive")

        # 3. Validate Date Range
        if payload.start_date > payload.end_date:
            raise BadRequestError("start_date cannot be later than end_date")

        # 4. Fetch holidays in date range
        stmt_holidays = select(Holiday.date).where(
            Holiday.organization_id == current_user.organization_id,
            Holiday.date >= payload.start_date,
            Holiday.date <= payload.end_date,
        )
        holiday_dates = set((await db.execute(stmt_holidays)).scalars().all())

        # 5. Compute days
        computed_days = calculate_working_days(
            start_date=payload.start_date,
            end_date=payload.end_date,
            employee=target_emp,
            holiday_dates=holiday_dates,
        )
        if computed_days <= Decimal("0.0"):
            raise BadRequestError("Requested leave period contains 0 working days (all dates fall on weekends or holidays)")

        # 6. Overlap check
        overlap = await LeaveRequestRepository.find_overlapping(
            db,
            current_user.organization_id,
            target_emp.id,
            payload.start_date,
            payload.end_date,
        )
        if overlap is not None:
            raise BadRequestError("Employee already has an overlapping pending or approved leave request")

        # 7. Balance check
        request_year = payload.start_date.year
        allocation = await LeaveAllocationRepository.get_by_employee_type_year(
            db,
            current_user.organization_id,
            target_emp.id,
            leave_type.id,
            request_year,
        )

        if allocation is not None:
            if computed_days > allocation.remaining_days:
                raise BadRequestError(
                    f"Insufficient leave balance: requested {computed_days} day(s), "
                    f"but remaining balance is {allocation.remaining_days} day(s)"
                )

        # 8. Auto-approval logic
        if not leave_type.requires_approval:
            req_status = LeaveRequestStatus.APPROVED
            reviewed_by_id = current_user.id
            reviewed_at = datetime.now(timezone.utc)
            review_comment = "Auto-approved per leave policy"

            if allocation is not None:
                allocation.used_days += computed_days
                allocation.remaining_days = allocation.allocated_days - allocation.used_days
                await db.flush()
        else:
            req_status = LeaveRequestStatus.PENDING
            reviewed_by_id = None
            reviewed_at = None
            review_comment = None

        leave_req = LeaveRequest(
            organization_id=current_user.organization_id,
            employee_id=target_emp.id,
            leave_type_id=leave_type.id,
            start_date=payload.start_date,
            end_date=payload.end_date,
            days=computed_days,
            reason=payload.reason,
            status=req_status,
            reviewed_by_id=reviewed_by_id,
            review_comment=review_comment,
            reviewed_at=reviewed_at,
        )

        created = await LeaveRequestRepository.create(db, leave_req)
        return cls._to_request_response(created)

    @classmethod
    async def review_request(
        cls,
        db: AsyncSession,
        current_user: User,
        request_id: uuid.UUID,
        payload: LeaveRequestReview,
    ) -> LeaveRequestResponse:
        leave_req = await LeaveRequestRepository.get_by_id(db, current_user.organization_id, request_id)
        if leave_req is None:
            raise NotFoundError("Leave request not found")

        if leave_req.status != LeaveRequestStatus.PENDING:
            raise BadRequestError(f"Cannot review leave request with status '{leave_req.status.value}'. Only PENDING requests can be reviewed.")

        if payload.status == LeaveRequestStatus.APPROVED:
            request_year = leave_req.start_date.year
            allocation = await LeaveAllocationRepository.get_by_employee_type_year(
                db,
                current_user.organization_id,
                leave_req.employee_id,
                leave_req.leave_type_id,
                request_year,
            )
            if allocation is not None:
                if leave_req.days > allocation.remaining_days:
                    raise BadRequestError(
                        f"Cannot approve request: required {leave_req.days} day(s), "
                        f"but employee only has {allocation.remaining_days} day(s) remaining"
                    )
                allocation.used_days += leave_req.days
                allocation.remaining_days = allocation.allocated_days - allocation.used_days
                await db.flush()

            leave_req.status = LeaveRequestStatus.APPROVED
            leave_req.reviewed_by_id = current_user.id
            leave_req.reviewed_at = datetime.now(timezone.utc)
            leave_req.review_comment = payload.review_comment

        elif payload.status == LeaveRequestStatus.REJECTED:
            leave_req.status = LeaveRequestStatus.REJECTED
            leave_req.reviewed_by_id = current_user.id
            leave_req.reviewed_at = datetime.now(timezone.utc)
            leave_req.review_comment = payload.review_comment

        else:
            raise BadRequestError("Review status must be either APPROVED or REJECTED")

        saved = await LeaveRequestRepository.save(db, leave_req)

        # Notify employee of decision
        emp_user_id = saved.employee.user_id if saved.employee else None
        if not emp_user_id:
            emp_chk = await db.get(Employee, saved.employee_id)
            if emp_chk:
                emp_user_id = emp_chk.user_id

        if emp_user_id:
            from app.features.notifications.service import NotificationService
            notif_type = "LEAVE_APPROVED" if saved.status == LeaveRequestStatus.APPROVED else "LEAVE_REJECTED"
            action_str = "approved" if saved.status == LeaveRequestStatus.APPROVED else "rejected"
            comment_str = f" Comment: {payload.review_comment}" if payload.review_comment else ""
            await NotificationService.create_notification(
                db=db,
                recipient_id=emp_user_id,
                title=f"Leave request {action_str}",
                message=f"Your leave request from {saved.start_date} to {saved.end_date} has been {action_str}.{comment_str}",
                type=notif_type,
                severity="INFO",
                link=f"/time-off/requests/{saved.id}",
                organization_id=saved.organization_id,
            )

        return cls._to_request_response(saved)

