from datetime import date, datetime, timezone
from typing import Any, Dict, List, Optional
import uuid
from sqlalchemy import extract, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.exceptions import ConflictError, NotFoundError, ValidationError
from app.core.security import hash_password
from app.features.auth.models import User
from app.features.employees.models import (
    Employee,
    EmployeeBankDetail,
    EmployeeDocument,
)
from app.features.employees.schemas import (
    BulkEmployeeImportRequest,
    BulkImportResponse,
    BulkImportRowError,
    EmployeeBankDetailCreate,
    EmployeeBankDetailUpdate,
    EmployeeCreate,
    EmployeeDocumentCreate,
    EmployeeStatsResponse,
    EmployeeUpdate,
    OrgChartNodeResponse,
)
from app.features.organization.models import Department, Designation, WorkLocation
from app.shared.enums import (
    EmployeeStatus,
    EmploymentType,
    Gender,
    UserRole,
    UserStatus,
)
from app.shared.pagination import PageParams, PaginatedResponse


class EmployeeService:

    @staticmethod
    async def _generate_employee_code(db: AsyncSession, org_id: uuid.UUID) -> str:
        """Generate auto-incrementing employee code per organization e.g. EMP0001, EMP0002."""
        count_stmt = select(func.count(Employee.id)).where(Employee.organization_id == org_id)
        current_count = (await db.execute(count_stmt)).scalar() or 0
        candidate_code = f"EMP{current_count + 1:04d}"

        # Ensure uniqueness in case of deleted records
        offset = 1
        while True:
            chk = select(Employee).where(
                Employee.organization_id == org_id,
                Employee.employee_code == candidate_code,
            )
            if not (await db.execute(chk)).scalar_one_or_none():
                return candidate_code
            offset += 1
            candidate_code = f"EMP{current_count + offset:04d}"

    @staticmethod
    def _format_employee_dict(emp: Employee) -> Dict[str, Any]:
        """Convert Employee ORM model into full dictionary response schema."""
        d = emp.to_dict()
        d["full_name"] = f"{emp.first_name} {emp.last_name}".strip()

        if emp.department:
            d["department"] = {
                "id": emp.department.id,
                "name": emp.department.name,
                "code": emp.department.code,
            }
        else:
            d["department"] = None

        if emp.designation:
            d["designation"] = {
                "id": emp.designation.id,
                "title": emp.designation.title,
                "code": emp.designation.code,
            }
        else:
            d["designation"] = None

        if emp.work_location:
            d["work_location"] = {
                "id": emp.work_location.id,
                "name": emp.work_location.name,
                "code": emp.work_location.code,
                "city": emp.work_location.city,
            }
        else:
            d["work_location"] = None

        if emp.manager:
            d["manager"] = {
                "id": emp.manager.id,
                "employee_code": emp.manager.employee_code,
                "first_name": emp.manager.first_name,
                "last_name": emp.manager.last_name,
                "email": emp.manager.email,
            }
        else:
            d["manager"] = None

        if emp.bank_account:
            d["bank_account"] = emp.bank_account.to_dict()
        else:
            d["bank_account"] = None

        return d

    # ==========================================
    # List & Search
    # ==========================================

    @staticmethod
    async def list_employees(
        db: AsyncSession,
        org_id: uuid.UUID,
        params: PageParams,
        search: Optional[str] = None,
        department_id: Optional[uuid.UUID] = None,
        designation_id: Optional[uuid.UUID] = None,
        work_location_id: Optional[uuid.UUID] = None,
        status: Optional[EmployeeStatus] = None,
        employment_type: Optional[EmploymentType] = None,
    ) -> PaginatedResponse[Dict[str, Any]]:
        stmt = (
            select(Employee)
            .where(Employee.organization_id == org_id)
            .options(
                selectinload(Employee.department),
                selectinload(Employee.designation),
                selectinload(Employee.work_location),
                selectinload(Employee.manager),
                selectinload(Employee.bank_account),
            )
        )

        count_stmt = select(func.count(Employee.id)).where(Employee.organization_id == org_id)

        if search:
            search_filter = (
                Employee.first_name.ilike(f"%{search}%")
                | Employee.last_name.ilike(f"%{search}%")
                | Employee.email.ilike(f"%{search}%")
                | Employee.employee_code.ilike(f"%{search}%")
                | (Employee.phone.is_not(None) & Employee.phone.ilike(f"%{search}%"))
            )
            stmt = stmt.where(search_filter)
            count_stmt = count_stmt.where(search_filter)

        if department_id:
            stmt = stmt.where(Employee.department_id == department_id)
            count_stmt = count_stmt.where(Employee.department_id == department_id)

        if designation_id:
            stmt = stmt.where(Employee.designation_id == designation_id)
            count_stmt = count_stmt.where(Employee.designation_id == designation_id)

        if work_location_id:
            stmt = stmt.where(Employee.work_location_id == work_location_id)
            count_stmt = count_stmt.where(Employee.work_location_id == work_location_id)

        if status:
            stmt = stmt.where(Employee.status == status)
            count_stmt = count_stmt.where(Employee.status == status)

        if employment_type:
            stmt = stmt.where(Employee.employment_type == employment_type)
            count_stmt = count_stmt.where(Employee.employment_type == employment_type)

        total_count = (await db.execute(count_stmt)).scalar() or 0

        # Pagination & Ordering
        stmt = stmt.order_by(Employee.created_at.desc()).offset(params.offset).limit(params.limit)
        result = await db.execute(stmt)
        employees = result.scalars().all()

        formatted_items = [EmployeeService._format_employee_dict(emp) for emp in employees]
        return PaginatedResponse.create(items=formatted_items, total=total_count, params=params)

    # ==========================================
    # Get by ID & Detail
    # ==========================================

    @staticmethod
    async def get_employee_by_id(
        db: AsyncSession,
        org_id: uuid.UUID,
        employee_id: uuid.UUID,
    ) -> Dict[str, Any]:
        stmt = (
            select(Employee)
            .where(
                Employee.id == employee_id,
                Employee.organization_id == org_id,
            )
            .options(
                selectinload(Employee.department),
                selectinload(Employee.designation),
                selectinload(Employee.work_location),
                selectinload(Employee.manager),
                selectinload(Employee.bank_account),
                selectinload(Employee.documents),
                selectinload(Employee.direct_reports),
            )
        )
        result = await db.execute(stmt)
        emp = result.scalar_one_or_none()
        if not emp:
            raise NotFoundError("Employee record not found")

        formatted = EmployeeService._format_employee_dict(emp)
        formatted["documents"] = [doc.to_dict() for doc in emp.documents]
        formatted["direct_reports_count"] = len(emp.direct_reports)
        return formatted

    @staticmethod
    async def get_employee_by_user_id(
        db: AsyncSession,
        org_id: uuid.UUID,
        user_id: uuid.UUID,
    ) -> Dict[str, Any]:
        stmt = (
            select(Employee)
            .where(
                Employee.user_id == user_id,
                Employee.organization_id == org_id,
            )
            .options(
                selectinload(Employee.department),
                selectinload(Employee.designation),
                selectinload(Employee.work_location),
                selectinload(Employee.manager),
                selectinload(Employee.bank_account),
                selectinload(Employee.documents),
                selectinload(Employee.direct_reports),
            )
        )
        result = await db.execute(stmt)
        emp = result.scalar_one_or_none()
        if not emp:
            # Fallback by email lookup
            user_stmt = select(User).where(User.id == user_id)
            user = (await db.execute(user_stmt)).scalar_one_or_none()
            if user:
                email_stmt = (
                    select(Employee)
                    .where(Employee.email == user.email, Employee.organization_id == org_id)
                    .options(
                        selectinload(Employee.department),
                        selectinload(Employee.designation),
                        selectinload(Employee.work_location),
                        selectinload(Employee.manager),
                        selectinload(Employee.bank_account),
                        selectinload(Employee.documents),
                        selectinload(Employee.direct_reports),
                    )
                )
                emp = (await db.execute(email_stmt)).scalar_one_or_none()
                if emp and not emp.user_id:
                    emp.user_id = user.id
                    await db.commit()
                    await db.refresh(emp)

        if not emp:
            raise NotFoundError("Employee profile not found for the logged-in user")

        formatted = EmployeeService._format_employee_dict(emp)
        formatted["documents"] = [doc.to_dict() for doc in emp.documents]
        formatted["direct_reports_count"] = len(emp.direct_reports)
        return formatted

    # ==========================================
    # Create Employee
    # ==========================================

    @staticmethod
    async def create_employee(
        db: AsyncSession,
        org_id: uuid.UUID,
        payload: EmployeeCreate,
    ) -> Dict[str, Any]:
        # 1. Resolve employee code
        emp_code = payload.employee_code.strip().upper() if payload.employee_code else await EmployeeService._generate_employee_code(db, org_id)

        # 2. Check unique code
        chk_code = select(Employee).where(
            Employee.organization_id == org_id,
            Employee.employee_code == emp_code,
        )
        if (await db.execute(chk_code)).scalar_one_or_none():
            raise ConflictError(f"Employee code '{emp_code}' is already assigned to another employee")

        # 3. Check unique email in org
        email_clean = payload.email.strip().lower()
        chk_email = select(Employee).where(
            Employee.organization_id == org_id,
            Employee.email == email_clean,
        )
        if (await db.execute(chk_email)).scalar_one_or_none():
            raise ConflictError(f"Employee with email '{email_clean}' already exists in your organization")

        # 4. Validate references (department, designation, work_location, manager)
        if payload.department_id:
            d_chk = select(Department).where(Department.id == payload.department_id, Department.organization_id == org_id)
            if not (await db.execute(d_chk)).scalar_one_or_none():
                raise ValidationError("Specified department does not exist in your organization")

        if payload.designation_id:
            des_chk = select(Designation).where(Designation.id == payload.designation_id, Designation.organization_id == org_id)
            if not (await db.execute(des_chk)).scalar_one_or_none():
                raise ValidationError("Specified designation does not exist in your organization")

        if payload.work_location_id:
            loc_chk = select(WorkLocation).where(WorkLocation.id == payload.work_location_id, WorkLocation.organization_id == org_id)
            if not (await db.execute(loc_chk)).scalar_one_or_none():
                raise ValidationError("Specified work location does not exist in your organization")

        if payload.manager_id:
            mgr_chk = select(Employee).where(Employee.id == payload.manager_id, Employee.organization_id == org_id)
            if not (await db.execute(mgr_chk)).scalar_one_or_none():
                raise ValidationError("Specified reporting manager does not exist in your organization")

        # 5. Handle user account creation if requested
        user_account_id: Optional[uuid.UUID] = None
        if payload.create_user_account:
            # Check if user already exists
            user_stmt = select(User).where(User.email == email_clean)
            existing_user = (await db.execute(user_stmt)).scalar_one_or_none()
            if existing_user:
                if existing_user.organization_id != org_id:
                    raise ConflictError("User account with this email already belongs to another tenant")
                user_account_id = existing_user.id
            else:
                if not payload.password:
                    raise ValidationError("Password is required when creating a user login account")
                new_user = User(
                    organization_id=org_id,
                    email=email_clean,
                    password_hash=hash_password(payload.password),
                    role=payload.user_role or UserRole.EMPLOYEE,
                    status=UserStatus.ACTIVE,
                )
                db.add(new_user)
                await db.flush()
                user_account_id = new_user.id

        # 6. Create Employee Entity
        new_emp = Employee(
            organization_id=org_id,
            user_id=user_account_id,
            employee_code=emp_code,
            first_name=payload.first_name.strip(),
            last_name=payload.last_name.strip(),
            email=email_clean,
            phone=payload.phone,
            gender=payload.gender,
            marital_status=payload.marital_status,
            date_of_birth=payload.date_of_birth,
            joining_date=payload.joining_date,
            exit_date=payload.exit_date,
            department_id=payload.department_id,
            designation_id=payload.designation_id,
            work_location_id=payload.work_location_id,
            manager_id=payload.manager_id,
            employment_type=payload.employment_type,
            status=payload.status,
            avatar_url=payload.avatar_url,
            emergency_contact_name=payload.emergency_contact_name,
            emergency_contact_phone=payload.emergency_contact_phone,
            emergency_contact_relation=payload.emergency_contact_relation,
            pan_number=payload.pan_number.strip().upper() if payload.pan_number else None,
            aadhaar_number=payload.aadhaar_number.strip() if payload.aadhaar_number else None,
            uan_number=payload.uan_number.strip() if payload.uan_number else None,
            pf_number=payload.pf_number.strip() if payload.pf_number else None,
            esi_number=payload.esi_number.strip() if payload.esi_number else None,
        )
        db.add(new_emp)
        await db.flush()

        # 7. Create Bank Details if provided
        if payload.bank_account:
            bank = EmployeeBankDetail(
                organization_id=org_id,
                employee_id=new_emp.id,
                bank_name=payload.bank_account.bank_name.strip(),
                account_number=payload.bank_account.account_number.strip(),
                ifsc_code=payload.bank_account.ifsc_code.strip().upper(),
                branch_name=payload.bank_account.branch_name,
                account_type=payload.bank_account.account_type,
                is_primary=payload.bank_account.is_primary,
            )
            db.add(bank)

        await db.commit()
        return await EmployeeService.get_employee_by_id(db, org_id, new_emp.id)

    # ==========================================
    # Update Employee
    # ==========================================

    @staticmethod
    async def update_employee(
        db: AsyncSession,
        org_id: uuid.UUID,
        employee_id: uuid.UUID,
        payload: EmployeeUpdate,
        current_user: Optional[User] = None,
    ) -> Dict[str, Any]:
        stmt = select(Employee).where(
            Employee.id == employee_id,
            Employee.organization_id == org_id,
        )
        emp = (await db.execute(stmt)).scalar_one_or_none()
        if not emp:
            raise NotFoundError("Employee record not found")

        old_status = emp.status.value if hasattr(emp.status, "value") else str(emp.status)
        update_data = payload.model_dump(exclude_unset=True)

        # Check unique email update
        if "email" in update_data and update_data["email"]:
            email_val = update_data["email"].strip().lower()
            chk = select(Employee).where(
                Employee.organization_id == org_id,
                Employee.email == email_val,
                Employee.id != employee_id,
            )
            if (await db.execute(chk)).scalar_one_or_none():
                raise ConflictError(f"Email '{email_val}' is already registered to another employee")
            update_data["email"] = email_val

        # Manager cycle check
        if "manager_id" in update_data:
            mgr_id = update_data["manager_id"]
            if mgr_id == employee_id:
                raise ValidationError("An employee cannot report to themselves")
            if mgr_id:
                mgr_chk = select(Employee).where(
                    Employee.id == mgr_id,
                    Employee.organization_id == org_id,
                )
                if not (await db.execute(mgr_chk)).scalar_one_or_none():
                    raise ValidationError("Manager does not exist in your organization")

        # Department validation
        if "department_id" in update_data and update_data["department_id"]:
            d_chk = select(Department).where(
                Department.id == update_data["department_id"],
                Department.organization_id == org_id,
            )
            if not (await db.execute(d_chk)).scalar_one_or_none():
                raise ValidationError("Department does not exist in your organization")

        # Designation validation
        if "designation_id" in update_data and update_data["designation_id"]:
            des_chk = select(Designation).where(
                Designation.id == update_data["designation_id"],
                Designation.organization_id == org_id,
            )
            if not (await db.execute(des_chk)).scalar_one_or_none():
                raise ValidationError("Designation does not exist in your organization")

        # Location validation
        if "work_location_id" in update_data and update_data["work_location_id"]:
            loc_chk = select(WorkLocation).where(
                WorkLocation.id == update_data["work_location_id"],
                WorkLocation.organization_id == org_id,
            )
            if not (await db.execute(loc_chk)).scalar_one_or_none():
                raise ValidationError("Work location does not exist in your organization")

        for k, v in update_data.items():
            setattr(emp, k, v)

        new_status = emp.status.value if hasattr(emp.status, "value") else str(emp.status)
        if old_status != new_status or "status" in update_data:
            from app.core.audit import log_audit
            await log_audit(
                db=db,
                user=current_user,
                action="UPDATE",
                module="EMPLOYEES",
                resource_type="EmployeeProfile",
                resource_id=emp.id,
                before={"status": old_status},
                after={"status": new_status},
                org_id=org_id,
            )

        await db.commit()
        return await EmployeeService.get_employee_by_id(db, org_id, employee_id)


    # ==========================================
    # Delete / Terminate Employee
    # ==========================================

    @staticmethod
    async def delete_employee(
        db: AsyncSession,
        org_id: uuid.UUID,
        employee_id: uuid.UUID,
        hard_delete: bool = False,
    ) -> None:
        stmt = select(Employee).where(
            Employee.id == employee_id,
            Employee.organization_id == org_id,
        )
        emp = (await db.execute(stmt)).scalar_one_or_none()
        if not emp:
            raise NotFoundError("Employee record not found")

        if hard_delete:
            # Reassign direct reports manager_id to None before hard deleting
            update_reports = (
                select(Employee)
                .where(Employee.manager_id == employee_id, Employee.organization_id == org_id)
            )
            reports = (await db.execute(update_reports)).scalars().all()
            for rep in reports:
                rep.manager_id = None

            # Reassign department managers to None if any
            dept_stmt = select(Department).where(Department.manager_id == employee_id, Department.organization_id == org_id)
            managed_depts = (await db.execute(dept_stmt)).scalars().all()
            for dept in managed_depts:
                dept.manager_id = None

            await db.delete(emp)
        else:
            # Soft delete: Set status to TERMINATED and exit_date
            emp.status = EmployeeStatus.TERMINATED
            if not emp.exit_date:
                emp.exit_date = date.today()

        await db.commit()

    # ==========================================
    # Org Chart Hierarchy
    # ==========================================

    @staticmethod
    async def get_org_chart(
        db: AsyncSession,
        org_id: uuid.UUID,
    ) -> List[OrgChartNodeResponse]:
        """Build hierarchical organizational chart nodes."""
        stmt = (
            select(Employee)
            .where(
                Employee.organization_id == org_id,
                Employee.status.in_([EmployeeStatus.ACTIVE, EmployeeStatus.PROBATION, EmployeeStatus.ON_LEAVE]),
            )
            .options(
                selectinload(Employee.department),
                selectinload(Employee.designation),
            )
            .order_by(Employee.first_name.asc())
        )
        result = await db.execute(stmt)
        employees = result.scalars().all()

        nodes: Dict[uuid.UUID, Dict[str, Any]] = {}
        for emp in employees:
            nodes[emp.id] = {
                "id": emp.id,
                "employee_code": emp.employee_code,
                "name": f"{emp.first_name} {emp.last_name}".strip(),
                "email": emp.email,
                "avatar_url": emp.avatar_url,
                "designation": emp.designation.title if emp.designation else None,
                "department": emp.department.name if emp.department else None,
                "manager_id": emp.manager_id,
                "children": [],
            }

        roots: List[Dict[str, Any]] = []
        for emp_id, node in nodes.items():
            mgr_id = node["manager_id"]
            if mgr_id and mgr_id in nodes and mgr_id != emp_id:
                nodes[mgr_id]["children"].append(node)
            else:
                roots.append(node)

        def to_chart_node(item: Dict[str, Any]) -> OrgChartNodeResponse:
            return OrgChartNodeResponse(
                id=item["id"],
                employee_code=item["employee_code"],
                name=item["name"],
                email=item["email"],
                avatar_url=item["avatar_url"],
                designation=item["designation"],
                department=item["department"],
                children=[to_chart_node(c) for c in item["children"]],
            )

        return [to_chart_node(r) for r in roots]

    # ==========================================
    # Statistics & Analytics Summary
    # ==========================================

    @staticmethod
    async def get_employee_stats(
        db: AsyncSession,
        org_id: uuid.UUID,
    ) -> EmployeeStatsResponse:
        """Compute organization headcount metrics and department distribution."""
        # Counts by status
        status_stmt = (
            select(Employee.status, func.count(Employee.id))
            .where(Employee.organization_id == org_id)
            .group_by(Employee.status)
        )
        status_results = (await db.execute(status_stmt)).all()
        status_map = {st: count for st, count in status_results}

        total_employees = sum(status_map.values())
        active_employees = status_map.get(EmployeeStatus.ACTIVE, 0)
        on_leave_employees = status_map.get(EmployeeStatus.ON_LEAVE, 0)
        probation_employees = status_map.get(EmployeeStatus.PROBATION, 0)
        terminated_employees = status_map.get(EmployeeStatus.TERMINATED, 0)

        # Department distribution
        dept_stmt = (
            select(Department.name, func.count(Employee.id))
            .join(Employee, Employee.department_id == Department.id)
            .where(Employee.organization_id == org_id, Employee.status != EmployeeStatus.TERMINATED)
            .group_by(Department.name)
        )
        dept_results = (await db.execute(dept_stmt)).all()
        department_distribution = {name: count for name, count in dept_results}

        # Employment type distribution
        emp_type_stmt = (
            select(Employee.employment_type, func.count(Employee.id))
            .where(Employee.organization_id == org_id, Employee.status != EmployeeStatus.TERMINATED)
            .group_by(Employee.employment_type)
        )
        emp_type_results = (await db.execute(emp_type_stmt)).all()
        employment_type_distribution = {
            et.value if hasattr(et, "value") else str(et): count for et, count in emp_type_results
        }

        # New joiners this month
        today = date.today()
        joiners_stmt = select(func.count(Employee.id)).where(
            Employee.organization_id == org_id,
            extract("year", Employee.joining_date) == today.year,
            extract("month", Employee.joining_date) == today.month,
        )
        new_joiners_this_month = (await db.execute(joiners_stmt)).scalar() or 0

        return EmployeeStatsResponse(
            total_employees=total_employees,
            active_employees=active_employees,
            on_leave_employees=on_leave_employees,
            probation_employees=probation_employees,
            terminated_employees=terminated_employees,
            department_distribution=department_distribution,
            employment_type_distribution=employment_type_distribution,
            new_joiners_this_month=new_joiners_this_month,
        )

    # ==========================================
    # Bank Details Management
    # ==========================================

    @staticmethod
    async def upsert_bank_details(
        db: AsyncSession,
        org_id: uuid.UUID,
        employee_id: uuid.UUID,
        payload: EmployeeBankDetailCreate,
    ) -> EmployeeBankDetail:
        # Check employee exists
        emp_chk = select(Employee).where(Employee.id == employee_id, Employee.organization_id == org_id)
        if not (await db.execute(emp_chk)).scalar_one_or_none():
            raise NotFoundError("Employee record not found")

        stmt = select(EmployeeBankDetail).where(
            EmployeeBankDetail.employee_id == employee_id,
            EmployeeBankDetail.organization_id == org_id,
        )
        bank = (await db.execute(stmt)).scalar_one_or_none()

        if bank:
            bank.bank_name = payload.bank_name.strip()
            bank.account_number = payload.account_number.strip()
            bank.ifsc_code = payload.ifsc_code.strip().upper()
            bank.branch_name = payload.branch_name
            bank.account_type = payload.account_type
            bank.is_primary = payload.is_primary
        else:
            bank = EmployeeBankDetail(
                organization_id=org_id,
                employee_id=employee_id,
                bank_name=payload.bank_name.strip(),
                account_number=payload.account_number.strip(),
                ifsc_code=payload.ifsc_code.strip().upper(),
                branch_name=payload.branch_name,
                account_type=payload.account_type,
                is_primary=payload.is_primary,
            )
            db.add(bank)

        await db.commit()
        await db.refresh(bank)
        return bank

    # ==========================================
    # Document Management
    # ==========================================

    @staticmethod
    async def add_employee_document(
        db: AsyncSession,
        org_id: uuid.UUID,
        employee_id: uuid.UUID,
        payload: EmployeeDocumentCreate,
    ) -> EmployeeDocument:
        emp_chk = select(Employee).where(Employee.id == employee_id, Employee.organization_id == org_id)
        if not (await db.execute(emp_chk)).scalar_one_or_none():
            raise NotFoundError("Employee record not found")

        doc = EmployeeDocument(
            organization_id=org_id,
            employee_id=employee_id,
            document_type=payload.document_type,
            title=payload.title.strip(),
            file_url=payload.file_url.strip(),
            file_size=payload.file_size,
            mime_type=payload.mime_type,
        )
        db.add(doc)
        await db.commit()
        await db.refresh(doc)
        return doc

    @staticmethod
    async def list_employee_documents(
        db: AsyncSession,
        org_id: uuid.UUID,
        employee_id: uuid.UUID,
    ) -> List[EmployeeDocument]:
        emp_chk = select(Employee).where(Employee.id == employee_id, Employee.organization_id == org_id)
        if not (await db.execute(emp_chk)).scalar_one_or_none():
            raise NotFoundError("Employee record not found")

        stmt = (
            select(EmployeeDocument)
            .where(
                EmployeeDocument.employee_id == employee_id,
                EmployeeDocument.organization_id == org_id,
            )
            .order_by(EmployeeDocument.created_at.desc())
        )
        result = await db.execute(stmt)
        return list(result.scalars().all())

    @staticmethod
    async def delete_employee_document(
        db: AsyncSession,
        org_id: uuid.UUID,
        employee_id: uuid.UUID,
        document_id: uuid.UUID,
    ) -> None:
        stmt = select(EmployeeDocument).where(
            EmployeeDocument.id == document_id,
            EmployeeDocument.employee_id == employee_id,
            EmployeeDocument.organization_id == org_id,
        )
        doc = (await db.execute(stmt)).scalar_one_or_none()
        if not doc:
            raise NotFoundError("Document not found")

        await db.delete(doc)
        await db.commit()

    # ==========================================
    # Bulk Employee Import
    # ==========================================

    @staticmethod
    async def bulk_import_employees(
        db: AsyncSession,
        org_id: uuid.UUID,
        payload: BulkEmployeeImportRequest,
    ) -> BulkImportResponse:
        """Batch import employee rows with code/email uniqueness checks and master reference resolution."""
        # Cache existing departments, designations, and locations in memory for fast lookup
        dept_rows = (await db.execute(select(Department).where(Department.organization_id == org_id))).scalars().all()
        dept_by_code = {d.code.upper(): d.id for d in dept_rows}

        desig_rows = (await db.execute(select(Designation).where(Designation.organization_id == org_id))).scalars().all()
        desig_by_code = {d.code.upper(): d.id for d in desig_rows}

        loc_rows = (await db.execute(select(WorkLocation).where(WorkLocation.organization_id == org_id))).scalars().all()
        loc_by_code = {loc.code.upper(): loc.id for loc in loc_rows}

        imported_count = 0
        errors: List[BulkImportRowError] = []

        for idx, item in enumerate(payload.employees):
            email_clean = item.email.strip().lower()

            # Check if email exists
            chk_email = select(Employee).where(
                Employee.organization_id == org_id,
                Employee.email == email_clean,
            )
            if (await db.execute(chk_email)).scalar_one_or_none():
                errors.append(BulkImportRowError(row_index=idx, email=email_clean, error=f"Email '{email_clean}' already exists"))
                continue

            # Check / generate employee code
            emp_code = item.employee_code.strip().upper() if item.employee_code else await EmployeeService._generate_employee_code(db, org_id)
            chk_code = select(Employee).where(
                Employee.organization_id == org_id,
                Employee.employee_code == emp_code,
            )
            if (await db.execute(chk_code)).scalar_one_or_none():
                errors.append(BulkImportRowError(row_index=idx, email=email_clean, error=f"Employee code '{emp_code}' already exists"))
                continue

            dept_id = dept_by_code.get(item.department_code.strip().upper()) if item.department_code else None
            desig_id = desig_by_code.get(item.designation_code.strip().upper()) if item.designation_code else None
            loc_id = loc_by_code.get(item.work_location_code.strip().upper()) if item.work_location_code else None

            try:
                emp = Employee(
                    organization_id=org_id,
                    employee_code=emp_code,
                    first_name=item.first_name.strip(),
                    last_name=item.last_name.strip(),
                    email=email_clean,
                    phone=item.phone,
                    gender=item.gender or Gender.NOT_SPECIFIED,
                    joining_date=item.joining_date,
                    department_id=dept_id,
                    designation_id=desig_id,
                    work_location_id=loc_id,
                    employment_type=item.employment_type or EmploymentType.FULL_TIME,
                    status=EmployeeStatus.ACTIVE,
                    pan_number=item.pan_number.strip().upper() if item.pan_number else None,
                )
                db.add(emp)
                await db.flush()

                # Add bank if provided
                if item.bank_account_number and item.bank_name and item.bank_ifsc:
                    bank = EmployeeBankDetail(
                        organization_id=org_id,
                        employee_id=emp.id,
                        bank_name=item.bank_name.strip(),
                        account_number=item.bank_account_number.strip(),
                        ifsc_code=item.bank_ifsc.strip().upper(),
                    )
                    db.add(bank)

                await db.commit()
                imported_count += 1
            except Exception as e:
                await db.rollback()
                errors.append(BulkImportRowError(row_index=idx, email=email_clean, error=str(e)))

        return BulkImportResponse(
            total_rows=len(payload.employees),
            imported_count=imported_count,
            failed_count=len(errors),
            errors=errors,
        )
