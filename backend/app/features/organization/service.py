from typing import Any, Dict, List, Optional
import uuid
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.exceptions import ConflictError, NotFoundError, ValidationError
from app.features.auth.models import Organization
from app.features.organization.models import Department, Designation, WorkLocation
from app.features.organization.schemas import (
    DepartmentCreate,
    DepartmentTreeNode,
    DepartmentUpdate,
    DesignationCreate,
    DesignationUpdate,
    OrganizationUpdateRequest,
    WorkLocationCreate,
    WorkLocationUpdate,
)


class OrganizationService:
    # ==========================================
    # Organization Profile & Settings
    # ==========================================

    @staticmethod
    async def get_current_organization(db: AsyncSession, org_id: uuid.UUID) -> Organization:
        stmt = select(Organization).where(Organization.id == org_id)
        result = await db.execute(stmt)
        org = result.scalar_one_or_none()
        if not org:
            raise NotFoundError("Organization not found")
        return org

    @staticmethod
    async def update_current_organization(
        db: AsyncSession,
        org_id: uuid.UUID,
        payload: OrganizationUpdateRequest,
    ) -> Organization:
        org = await OrganizationService.get_current_organization(db, org_id)
        update_data = payload.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(org, field, value)
        await db.commit()
        await db.refresh(org)
        return org

    # ==========================================
    # Work Location CRUD
    # ==========================================

    @staticmethod
    async def list_work_locations(
        db: AsyncSession,
        org_id: uuid.UUID,
        search: Optional[str] = None,
        is_active: Optional[bool] = None,
    ) -> List[Dict[str, Any]]:
        # Import Employee dynamically or query count
        from app.features.employees.models import Employee

        stmt = (
            select(
                WorkLocation,
                func.count(Employee.id).label("employee_count"),
            )
            .outerjoin(Employee, (Employee.work_location_id == WorkLocation.id) & (Employee.organization_id == org_id))
            .where(WorkLocation.organization_id == org_id)
            .group_by(WorkLocation.id)
            .order_by(WorkLocation.name.asc())
        )

        if search:
            stmt = stmt.where(
                WorkLocation.name.ilike(f"%{search}%") | WorkLocation.code.ilike(f"%{search}%") | WorkLocation.city.ilike(f"%{search}%")
            )
        if is_active is not None:
            stmt = stmt.where(WorkLocation.is_active == is_active)

        result = await db.execute(stmt)
        rows = result.all()

        output = []
        for loc, emp_count in rows:
            loc_dict = loc.to_dict()
            loc_dict["employee_count"] = emp_count
            output.append(loc_dict)
        return output

    @staticmethod
    async def get_work_location(
        db: AsyncSession,
        org_id: uuid.UUID,
        location_id: uuid.UUID,
    ) -> Dict[str, Any]:
        from app.features.employees.models import Employee

        stmt = (
            select(
                WorkLocation,
                func.count(Employee.id).label("employee_count"),
            )
            .outerjoin(Employee, (Employee.work_location_id == WorkLocation.id) & (Employee.organization_id == org_id))
            .where(
                WorkLocation.id == location_id,
                WorkLocation.organization_id == org_id,
            )
            .group_by(WorkLocation.id)
        )
        result = await db.execute(stmt)
        row = result.first()
        if not row:
            raise NotFoundError("Work location not found")

        loc, emp_count = row
        loc_dict = loc.to_dict()
        loc_dict["employee_count"] = emp_count
        return loc_dict

    @staticmethod
    async def create_work_location(
        db: AsyncSession,
        org_id: uuid.UUID,
        payload: WorkLocationCreate,
    ) -> WorkLocation:
        # Check duplicate code
        stmt = select(WorkLocation).where(
            WorkLocation.organization_id == org_id,
            WorkLocation.code == payload.code.strip().upper(),
        )
        existing = (await db.execute(stmt)).scalar_one_or_none()
        if existing:
            raise ConflictError(f"Work location with code '{payload.code}' already exists")

        new_loc = WorkLocation(
            organization_id=org_id,
            name=payload.name.strip(),
            code=payload.code.strip().upper(),
            address=payload.address,
            city=payload.city,
            state=payload.state,
            country=payload.country,
            postal_code=payload.postal_code,
            is_active=payload.is_active,
        )
        db.add(new_loc)
        await db.commit()
        await db.refresh(new_loc)
        return new_loc

    @staticmethod
    async def update_work_location(
        db: AsyncSession,
        org_id: uuid.UUID,
        location_id: uuid.UUID,
        payload: WorkLocationUpdate,
    ) -> WorkLocation:
        stmt = select(WorkLocation).where(
            WorkLocation.id == location_id,
            WorkLocation.organization_id == org_id,
        )
        loc = (await db.execute(stmt)).scalar_one_or_none()
        if not loc:
            raise NotFoundError("Work location not found")

        update_data = payload.model_dump(exclude_unset=True)
        if "code" in update_data and update_data["code"]:
            code_val = update_data["code"].strip().upper()
            chk = select(WorkLocation).where(
                WorkLocation.organization_id == org_id,
                WorkLocation.code == code_val,
                WorkLocation.id != location_id,
            )
            if (await db.execute(chk)).scalar_one_or_none():
                raise ConflictError(f"Work location code '{code_val}' is already in use")
            update_data["code"] = code_val

        if "name" in update_data and update_data["name"]:
            update_data["name"] = update_data["name"].strip()

        for k, v in update_data.items():
            setattr(loc, k, v)

        await db.commit()
        await db.refresh(loc)
        return loc

    @staticmethod
    async def delete_work_location(
        db: AsyncSession,
        org_id: uuid.UUID,
        location_id: uuid.UUID,
    ) -> None:
        from app.features.employees.models import Employee

        stmt = select(WorkLocation).where(
            WorkLocation.id == location_id,
            WorkLocation.organization_id == org_id,
        )
        loc = (await db.execute(stmt)).scalar_one_or_none()
        if not loc:
            raise NotFoundError("Work location not found")

        # Check assigned employees
        emp_stmt = select(func.count(Employee.id)).where(
            Employee.work_location_id == location_id,
            Employee.organization_id == org_id,
        )
        count = (await db.execute(emp_stmt)).scalar() or 0
        if count > 0:
            raise ValidationError(
                f"Cannot delete work location with {count} assigned employee(s). Please reassign them first or set location to inactive."
            )

        await db.delete(loc)
        await db.commit()

    # ==========================================
    # Department CRUD & Hierarchy Tree
    # ==========================================

    @staticmethod
    async def list_departments(
        db: AsyncSession,
        org_id: uuid.UUID,
        search: Optional[str] = None,
        is_active: Optional[bool] = None,
        parent_id: Optional[uuid.UUID] = None,
    ) -> List[Dict[str, Any]]:
        from app.features.employees.models import Employee

        stmt = (
            select(
                Department,
                func.count(Employee.id).label("employee_count"),
            )
            .outerjoin(Employee, (Employee.department_id == Department.id) & (Employee.organization_id == org_id))
            .where(Department.organization_id == org_id)
            .options(
                selectinload(Department.manager),
            )
            .group_by(Department.id)
            .order_by(Department.name.asc())
        )

        if search:
            stmt = stmt.where(
                Department.name.ilike(f"%{search}%") | Department.code.ilike(f"%{search}%")
            )
        if is_active is not None:
            stmt = stmt.where(Department.is_active == is_active)
        if parent_id is not None:
            stmt = stmt.where(Department.parent_department_id == parent_id)

        result = await db.execute(stmt)
        rows = result.all()

        output = []
        for dept, emp_count in rows:
            d_dict = dept.to_dict()
            d_dict["employee_count"] = emp_count
            if dept.manager:
                d_dict["manager"] = {
                    "id": dept.manager.id,
                    "employee_code": dept.manager.employee_code,
                    "first_name": dept.manager.first_name,
                    "last_name": dept.manager.last_name,
                    "email": dept.manager.email,
                }
            else:
                d_dict["manager"] = None
            output.append(d_dict)
        return output

    @staticmethod
    async def get_department(
        db: AsyncSession,
        org_id: uuid.UUID,
        department_id: uuid.UUID,
    ) -> Dict[str, Any]:
        from app.features.employees.models import Employee

        stmt = (
            select(
                Department,
                func.count(Employee.id).label("employee_count"),
            )
            .outerjoin(Employee, (Employee.department_id == Department.id) & (Employee.organization_id == org_id))
            .where(
                Department.id == department_id,
                Department.organization_id == org_id,
            )
            .options(
                selectinload(Department.manager),
            )
            .group_by(Department.id)
        )
        result = await db.execute(stmt)
        row = result.first()
        if not row:
            raise NotFoundError("Department not found")

        dept, emp_count = row
        d_dict = dept.to_dict()
        d_dict["employee_count"] = emp_count
        if dept.manager:
            d_dict["manager"] = {
                "id": dept.manager.id,
                "employee_code": dept.manager.employee_code,
                "first_name": dept.manager.first_name,
                "last_name": dept.manager.last_name,
                "email": dept.manager.email,
            }
        else:
            d_dict["manager"] = None
        return d_dict

    @staticmethod
    async def create_department(
        db: AsyncSession,
        org_id: uuid.UUID,
        payload: DepartmentCreate,
    ) -> Department:
        # Check code uniqueness within tenant
        stmt = select(Department).where(
            Department.organization_id == org_id,
            Department.code == payload.code.strip().upper(),
        )
        if (await db.execute(stmt)).scalar_one_or_none():
            raise ConflictError(f"Department with code '{payload.code}' already exists")

        # Validate parent department belongs to org
        if payload.parent_department_id:
            parent_stmt = select(Department).where(
                Department.id == payload.parent_department_id,
                Department.organization_id == org_id,
            )
            if not (await db.execute(parent_stmt)).scalar_one_or_none():
                raise ValidationError("Parent department does not exist in your organization")

        # Validate manager belongs to org
        if payload.manager_id:
            from app.features.employees.models import Employee
            mgr_stmt = select(Employee).where(
                Employee.id == payload.manager_id,
                Employee.organization_id == org_id,
            )
            if not (await db.execute(mgr_stmt)).scalar_one_or_none():
                raise ValidationError("Designated manager does not exist in your organization")

        dept = Department(
            organization_id=org_id,
            name=payload.name.strip(),
            code=payload.code.strip().upper(),
            description=payload.description,
            parent_department_id=payload.parent_department_id,
            manager_id=payload.manager_id,
            is_active=payload.is_active,
        )
        db.add(dept)
        await db.commit()
        await db.refresh(dept)
        return dept

    @staticmethod
    async def update_department(
        db: AsyncSession,
        org_id: uuid.UUID,
        department_id: uuid.UUID,
        payload: DepartmentUpdate,
    ) -> Department:
        stmt = select(Department).where(
            Department.id == department_id,
            Department.organization_id == org_id,
        )
        dept = (await db.execute(stmt)).scalar_one_or_none()
        if not dept:
            raise NotFoundError("Department not found")

        update_data = payload.model_dump(exclude_unset=True)

        if "code" in update_data and update_data["code"]:
            code_val = update_data["code"].strip().upper()
            chk = select(Department).where(
                Department.organization_id == org_id,
                Department.code == code_val,
                Department.id != department_id,
            )
            if (await db.execute(chk)).scalar_one_or_none():
                raise ConflictError(f"Department code '{code_val}' is already in use")
            update_data["code"] = code_val

        if "name" in update_data and update_data["name"]:
            update_data["name"] = update_data["name"].strip()

        if "parent_department_id" in update_data:
            parent_id = update_data["parent_department_id"]
            if parent_id == department_id:
                raise ValidationError("Department cannot be its own parent")
            if parent_id:
                parent_chk = select(Department).where(
                    Department.id == parent_id,
                    Department.organization_id == org_id,
                )
                if not (await db.execute(parent_chk)).scalar_one_or_none():
                    raise ValidationError("Parent department does not exist in your organization")

        if "manager_id" in update_data and update_data["manager_id"]:
            from app.features.employees.models import Employee
            mgr_chk = select(Employee).where(
                Employee.id == update_data["manager_id"],
                Employee.organization_id == org_id,
            )
            if not (await db.execute(mgr_chk)).scalar_one_or_none():
                raise ValidationError("Manager does not exist in your organization")

        for k, v in update_data.items():
            setattr(dept, k, v)

        await db.commit()
        await db.refresh(dept)
        return dept

    @staticmethod
    async def delete_department(
        db: AsyncSession,
        org_id: uuid.UUID,
        department_id: uuid.UUID,
    ) -> None:
        from app.features.employees.models import Employee

        stmt = select(Department).where(
            Department.id == department_id,
            Department.organization_id == org_id,
        )
        dept = (await db.execute(stmt)).scalar_one_or_none()
        if not dept:
            raise NotFoundError("Department not found")

        # Check sub-departments
        sub_stmt = select(func.count(Department.id)).where(
            Department.parent_department_id == department_id,
            Department.organization_id == org_id,
        )
        sub_count = (await db.execute(sub_stmt)).scalar() or 0
        if sub_count > 0:
            raise ValidationError(
                f"Cannot delete department with {sub_count} active sub-department(s). Reassign them first."
            )

        # Check assigned employees
        emp_stmt = select(func.count(Employee.id)).where(
            Employee.department_id == department_id,
            Employee.organization_id == org_id,
        )
        emp_count = (await db.execute(emp_stmt)).scalar() or 0
        if emp_count > 0:
            raise ValidationError(
                f"Cannot delete department with {emp_count} assigned employee(s). Reassign them first."
            )

        await db.delete(dept)
        await db.commit()

    @staticmethod
    async def get_department_tree(
        db: AsyncSession,
        org_id: uuid.UUID,
    ) -> List[DepartmentTreeNode]:
        """Build hierarchical tree structure for departments in the organization."""
        from app.features.employees.models import Employee

        stmt = (
            select(
                Department,
                func.count(Employee.id).label("employee_count"),
            )
            .outerjoin(Employee, (Employee.department_id == Department.id) & (Employee.organization_id == org_id))
            .where(Department.organization_id == org_id, Department.is_active == True)  # noqa: E712
            .options(
                selectinload(Department.manager),
            )
            .group_by(Department.id)
            .order_by(Department.name.asc())
        )
        result = await db.execute(stmt)
        rows = result.all()

        nodes: Dict[uuid.UUID, Dict[str, Any]] = {}
        for dept, count in rows:
            mgr = None
            if dept.manager:
                mgr = {
                    "id": dept.manager.id,
                    "employee_code": dept.manager.employee_code,
                    "first_name": dept.manager.first_name,
                    "last_name": dept.manager.last_name,
                    "email": dept.manager.email,
                }
            nodes[dept.id] = {
                "id": dept.id,
                "name": dept.name,
                "code": dept.code,
                "is_active": dept.is_active,
                "manager": mgr,
                "employee_count": count,
                "parent_department_id": dept.parent_department_id,
                "children": [],
            }

        roots: List[DepartmentTreeNode] = []
        for d_id, node_dict in nodes.items():
            p_id = node_dict["parent_department_id"]
            if p_id and p_id in nodes:
                nodes[p_id]["children"].append(node_dict)
            else:
                roots.append(node_dict)  # Top level

        def to_tree_node(item: Dict[str, Any]) -> DepartmentTreeNode:
            return DepartmentTreeNode(
                id=item["id"],
                name=item["name"],
                code=item["code"],
                is_active=item["is_active"],
                manager=item["manager"],
                employee_count=item["employee_count"],
                children=[to_tree_node(child) for child in item["children"]],
            )

        return [to_tree_node(r) for r in roots]

    # ==========================================
    # Designation CRUD
    # ==========================================

    @staticmethod
    async def list_designations(
        db: AsyncSession,
        org_id: uuid.UUID,
        search: Optional[str] = None,
        department_id: Optional[uuid.UUID] = None,
        is_active: Optional[bool] = None,
    ) -> List[Dict[str, Any]]:
        from app.features.employees.models import Employee

        stmt = (
            select(
                Designation,
                func.count(Employee.id).label("employee_count"),
            )
            .outerjoin(Employee, (Employee.designation_id == Designation.id) & (Employee.organization_id == org_id))
            .where(Designation.organization_id == org_id)
            .options(
                selectinload(Designation.department),
            )
            .group_by(Designation.id)
            .order_by(Designation.title.asc())
        )

        if search:
            stmt = stmt.where(
                Designation.title.ilike(f"%{search}%") | Designation.code.ilike(f"%{search}%")
            )
        if department_id:
            stmt = stmt.where(Designation.department_id == department_id)
        if is_active is not None:
            stmt = stmt.where(Designation.is_active == is_active)

        result = await db.execute(stmt)
        rows = result.all()

        output = []
        for desig, emp_count in rows:
            d_dict = desig.to_dict()
            d_dict["employee_count"] = emp_count
            if desig.department:
                d_dict["department"] = {
                    "id": desig.department.id,
                    "name": desig.department.name,
                    "code": desig.department.code,
                }
            else:
                d_dict["department"] = None
            output.append(d_dict)
        return output

    @staticmethod
    async def get_designation(
        db: AsyncSession,
        org_id: uuid.UUID,
        designation_id: uuid.UUID,
    ) -> Dict[str, Any]:
        from app.features.employees.models import Employee

        stmt = (
            select(
                Designation,
                func.count(Employee.id).label("employee_count"),
            )
            .outerjoin(Employee, (Employee.designation_id == Designation.id) & (Employee.organization_id == org_id))
            .where(
                Designation.id == designation_id,
                Designation.organization_id == org_id,
            )
            .options(
                selectinload(Designation.department),
            )
            .group_by(Designation.id)
        )
        result = await db.execute(stmt)
        row = result.first()
        if not row:
            raise NotFoundError("Designation not found")

        desig, emp_count = row
        d_dict = desig.to_dict()
        d_dict["employee_count"] = emp_count
        if desig.department:
            d_dict["department"] = {
                "id": desig.department.id,
                "name": desig.department.name,
                "code": desig.department.code,
            }
        else:
            d_dict["department"] = None
        return d_dict

    @staticmethod
    async def create_designation(
        db: AsyncSession,
        org_id: uuid.UUID,
        payload: DesignationCreate,
    ) -> Designation:
        # Check uniqueness of code
        stmt = select(Designation).where(
            Designation.organization_id == org_id,
            Designation.code == payload.code.strip().upper(),
        )
        if (await db.execute(stmt)).scalar_one_or_none():
            raise ConflictError(f"Designation with code '{payload.code}' already exists")

        # Validate department
        if payload.department_id:
            dept_chk = select(Department).where(
                Department.id == payload.department_id,
                Department.organization_id == org_id,
            )
            if not (await db.execute(dept_chk)).scalar_one_or_none():
                raise ValidationError("Department does not exist in your organization")

        desig = Designation(
            organization_id=org_id,
            title=payload.title.strip(),
            code=payload.code.strip().upper(),
            description=payload.description,
            department_id=payload.department_id,
            is_active=payload.is_active,
        )
        db.add(desig)
        await db.commit()
        await db.refresh(desig)
        return desig

    @staticmethod
    async def update_designation(
        db: AsyncSession,
        org_id: uuid.UUID,
        designation_id: uuid.UUID,
        payload: DesignationUpdate,
    ) -> Designation:
        stmt = select(Designation).where(
            Designation.id == designation_id,
            Designation.organization_id == org_id,
        )
        desig = (await db.execute(stmt)).scalar_one_or_none()
        if not desig:
            raise NotFoundError("Designation not found")

        update_data = payload.model_dump(exclude_unset=True)

        if "code" in update_data and update_data["code"]:
            code_val = update_data["code"].strip().upper()
            chk = select(Designation).where(
                Designation.organization_id == org_id,
                Designation.code == code_val,
                Designation.id != designation_id,
            )
            if (await db.execute(chk)).scalar_one_or_none():
                raise ConflictError(f"Designation code '{code_val}' is already in use")
            update_data["code"] = code_val

        if "title" in update_data and update_data["title"]:
            update_data["title"] = update_data["title"].strip()

        if "department_id" in update_data and update_data["department_id"]:
            dept_chk = select(Department).where(
                Department.id == update_data["department_id"],
                Department.organization_id == org_id,
            )
            if not (await db.execute(dept_chk)).scalar_one_or_none():
                raise ValidationError("Department does not exist in your organization")

        for k, v in update_data.items():
            setattr(desig, k, v)

        await db.commit()
        await db.refresh(desig)
        return desig

    @staticmethod
    async def delete_designation(
        db: AsyncSession,
        org_id: uuid.UUID,
        designation_id: uuid.UUID,
    ) -> None:
        from app.features.employees.models import Employee

        stmt = select(Designation).where(
            Designation.id == designation_id,
            Designation.organization_id == org_id,
        )
        desig = (await db.execute(stmt)).scalar_one_or_none()
        if not desig:
            raise NotFoundError("Designation not found")

        # Check assigned employees
        emp_stmt = select(func.count(Employee.id)).where(
            Employee.designation_id == designation_id,
            Employee.organization_id == org_id,
        )
        emp_count = (await db.execute(emp_stmt)).scalar() or 0
        if emp_count > 0:
            raise ValidationError(
                f"Cannot delete designation with {emp_count} assigned employee(s). Reassign them first."
            )

        await db.delete(desig)
        await db.commit()
