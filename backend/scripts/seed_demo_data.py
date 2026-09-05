#!/usr/bin/env python3
"""PeoplePay360 - Demo Data Seed Script.

Populates a comprehensive and realistic multi-tenant organization ready for
end-to-end demo walkthroughs (Employee-to-Payslip and Leave Allocation-to-Approval).
"""

import asyncio
import calendar
from datetime import date, datetime, time, timedelta, timezone
from decimal import Decimal
import json
import logging
import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.core.audit import AuditLog, log_audit
from app.core.config import settings
from app.core.security import hash_password
from app.features.attendance.models import Attendance, AttendanceCorrection, Holiday
from app.features.auth.models import Organization, User
from app.features.contracts.models import Contract
from app.features.employees.models import Employee, EmployeeBankDetail
from app.features.notifications.models import Notification
from app.features.organization.models import Department, Designation, WorkLocation
from app.features.payroll.models import (
    PayrollValidationIssue,
    Payrun,
    PayrunEmployee,
    Payslip,
    PayslipDelivery,
    PayslipLine,
)
from app.features.payroll_config.models import (
    SalaryRule,
    SalaryStructure,
    SalaryStructureRule,
    SystemConfig,
)
from app.features.reports_dashboard.models import AnalyticsSnapshot
from app.features.time_off.models import LeaveAllocation, LeaveRequest, LeaveType
from app.shared.enums import (
    AttendanceSource,
    AttendanceStatus,
    BankAccountType,
    CalculationType,
    ContractStatus,
    ContractType,
    CorrectionStatus,
    DeliveryStatus,
    EmployeeStatus,
    EmploymentType,
    Gender,
    HolidayType,
    LeaveRequestStatus,
    MaritalStatus,
    PayrollIssueSeverity,
    PayrollIssueStatus,
    PayrunEmployeeStatus,
    PayrunStatus,
    PayslipStatus,
    SalaryRuleCategory,
    UserRole,
    UserStatus,
    WageType,
)

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("seed_demo_data")


async def seed_all():
    engine = create_async_engine(settings.DATABASE_URL, echo=False)
    session_factory = async_sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)

    async with session_factory() as db:
        logger.info("Checking for existing demo organization...")
        stmt_org = select(Organization).where(Organization.code == "PPT")
        existing_org = (await db.execute(stmt_org)).scalar_one_or_none()

        if existing_org:
            logger.info(f"Demo organization already exists (ID: {existing_org.id}). Re-seeding / ensuring records...")
            org = existing_org
        else:
            # 1. Create Organization
            org = Organization(
                id=uuid.uuid4(),
                name="PeoplePay Tech Enterprises",
                code="PPT",
                email="contact@peoplepay.com",
                phone="+91-9876543210",
                currency="INR",
                timezone="Asia/Kolkata",
                country="India",
                address="Tower 4, Cyber City, Phase 2, Gurugram, Haryana 122002",
                status="ACTIVE",
            )
            db.add(org)
            await db.flush()
            logger.info(f"Created Organization: {org.name} (ID: {org.id})")

        org_id = org.id

        # 2. Create Users
        logger.info("Seeding system and demo users...")
        users_data = [
            ("admin@peoplepay.com", "Admin@123", UserRole.ADMIN, "System Administrator"),
            ("hr@peoplepay.com", "Hr@12345", UserRole.HR_MANAGER, "HR Manager"),
            ("payroll.manager@peoplepay.com", "Payroll@12345", UserRole.HR_PAYROLL_MANAGER, "Payroll Manager"),
            ("payroll.user@peoplepay.com", "Payroll@12345", UserRole.HR_PAYROLL_USER, "Payroll Specialist"),
            ("alex.turner@peoplepay.com", "Alex@12345", UserRole.EMPLOYEE, "Alex Turner"),
            ("priya.sharma@peoplepay.com", "Priya@12345", UserRole.EMPLOYEE, "Priya Sharma"),
            ("rahul.verma@peoplepay.com", "Rahul@12345", UserRole.EMPLOYEE, "Rahul Verma"),
            ("sneha.patel@peoplepay.com", "Sneha@12345", UserRole.EMPLOYEE, "Sneha Patel"),
        ]

        user_map = {}
        for email, pwd, role, _ in users_data:
            chk = select(User).where(User.email == email)
            usr = (await db.execute(chk)).scalar_one_or_none()
            if not usr:
                usr = User(
                    id=uuid.uuid4(),
                    organization_id=org_id,
                    email=email,
                    password_hash=hash_password(pwd),
                    role=role,
                    status=UserStatus.ACTIVE,
                )
                db.add(usr)
                await db.flush()
            user_map[email] = usr

        admin_user = user_map["admin@peoplepay.com"]

        # 3. Create Departments
        logger.info("Seeding departments...")
        dept_configs = [
            ("Engineering", "ENG", "Core Software Engineering & Platform Infrastructure"),
            ("Product & Design", "PRD", "Product Strategy, UX/UI Design & Research"),
            ("Sales & Marketing", "SLS", "Enterprise Growth, Sales & Brand Marketing"),
            ("Human Resources", "HRD", "People Operations, Talent & Workplace Culture"),
        ]
        dept_map = {}
        for name, code, desc in dept_configs:
            chk = select(Department).where(Department.organization_id == org_id, Department.code == code)
            d = (await db.execute(chk)).scalar_one_or_none()
            if not d:
                d = Department(
                    id=uuid.uuid4(),
                    organization_id=org_id,
                    name=name,
                    code=code,
                    description=desc,
                )
                db.add(d)
                await db.flush()
            dept_map[code] = d

        # 4. Create Designations
        logger.info("Seeding designations...")
        desig_configs = [
            ("Senior Software Engineer", "SSE", dept_map["ENG"].id),
            ("Backend Developer", "BED", dept_map["ENG"].id),
            ("Frontend Engineer", "FED", dept_map["ENG"].id),
            ("Senior Product Designer", "SPD", dept_map["PRD"].id),
            ("Product Manager", "PRM", dept_map["PRD"].id),
            ("Enterprise Account Executive", "EAE", dept_map["SLS"].id),
            ("Marketing Lead", "MKT", dept_map["SLS"].id),
            ("HR Operations Specialist", "HRS", dept_map["HRD"].id),
        ]
        desig_map = {}
        for title, code, d_id in desig_configs:
            chk = select(Designation).where(Designation.organization_id == org_id, Designation.code == code)
            des = (await db.execute(chk)).scalar_one_or_none()
            if not des:
                des = Designation(
                    id=uuid.uuid4(),
                    organization_id=org_id,
                    department_id=d_id,
                    title=title,
                    code=code,
                )
                db.add(des)
                await db.flush()
            desig_map[code] = des

        # 5. Work Locations
        logger.info("Seeding work locations...")
        locations = [
            ("Cyber City Campus", "GGN-01", "Gurugram", "Haryana", "India", True),
            ("Tech Central Bangalore", "BLR-01", "Bangalore", "Karnataka", "India", False),
        ]
        loc_map = {}
        for name, code, city, state, country, is_hq in locations:
            chk = select(WorkLocation).where(WorkLocation.organization_id == org_id, WorkLocation.code == code)
            loc = (await db.execute(chk)).scalar_one_or_none()
            if not loc:
                loc = WorkLocation(
                    id=uuid.uuid4(),
                    organization_id=org_id,
                    name=name,
                    code=code,
                    city=city,
                    state=state,
                    country=country,
                    is_headquarters=is_hq,
                )
                db.add(loc)
                await db.flush()
            loc_map[code] = loc

        # 6. Employees (12 employees)
        logger.info("Seeding employees with full bank & statutory details...")
        emp_raw_data = [
            ("EMP0001", "Alex", "Turner", "alex.turner@peoplepay.com", "ENG", "SSE", "GGN-01", EmploymentType.FULL_TIME, EmployeeStatus.ACTIVE, "alex.turner@peoplepay.com", date(2023, 1, 15), Decimal("95000.00")),
            ("EMP0002", "Priya", "Sharma", "priya.sharma@peoplepay.com", "ENG", "BED", "GGN-01", EmploymentType.FULL_TIME, EmployeeStatus.ACTIVE, "priya.sharma@peoplepay.com", date(2023, 3, 1), Decimal("75000.00")),
            ("EMP0003", "Rahul", "Verma", "rahul.verma@peoplepay.com", "ENG", "FED", "BLR-01", EmploymentType.FULL_TIME, EmployeeStatus.ACTIVE, "rahul.verma@peoplepay.com", date(2023, 6, 10), Decimal("70000.00")),
            ("EMP0004", "Sneha", "Patel", "sneha.patel@peoplepay.com", "PRD", "SPD", "GGN-01", EmploymentType.FULL_TIME, EmployeeStatus.ACTIVE, "sneha.patel@peoplepay.com", date(2023, 2, 20), Decimal("85000.00")),
            ("EMP0005", "Marcus", "Vance", "marcus.vance@peoplepay.com", "PRD", "PRM", "BLR-01", EmploymentType.FULL_TIME, EmployeeStatus.ACTIVE, None, date(2023, 4, 15), Decimal("90000.00")),
            ("EMP0006", "Ananya", "Deshmukh", "ananya.deshmukh@peoplepay.com", "SLS", "EAE", "GGN-01", EmploymentType.FULL_TIME, EmployeeStatus.ACTIVE, None, date(2023, 5, 1), Decimal("80000.00")),
            ("EMP0007", "David", "Kim", "david.kim@peoplepay.com", "SLS", "MKT", "GGN-01", EmploymentType.FULL_TIME, EmployeeStatus.ACTIVE, None, date(2023, 7, 10), Decimal("65000.00")),
            ("EMP0008", "Rohan", "Kapoor", "rohan.kapoor@peoplepay.com", "HRD", "HRS", "GGN-01", EmploymentType.FULL_TIME, EmployeeStatus.ACTIVE, None, date(2023, 1, 10), Decimal("60000.00")),
            ("EMP0009", "Vikram", "Singh", "vikram.singh@peoplepay.com", "ENG", "BED", "BLR-01", EmploymentType.CONTRACT, EmployeeStatus.ACTIVE, None, date(2024, 1, 10), Decimal("55000.00")),
            ("EMP0010", "Neha", "Gupta", "neha.gupta@peoplepay.com", "PRD", "SPD", "GGN-01", EmploymentType.INTERN, EmployeeStatus.ACTIVE, None, date(2024, 5, 1), Decimal("30000.00")),
            ("EMP0011", "Karan", "Malhotra", "karan.malhotra@peoplepay.com", "SLS", "EAE", "GGN-01", EmploymentType.FULL_TIME, EmployeeStatus.ON_LEAVE, None, date(2023, 8, 15), Decimal("72000.00")),
            ("EMP0012", "Tara", "Bose", "tara.bose@peoplepay.com", "ENG", "FED", "BLR-01", EmploymentType.FULL_TIME, EmployeeStatus.PROBATION, None, date(2024, 6, 1), Decimal("68000.00")),
        ]

        employee_map = {}
        for code, fname, lname, email, d_code, des_code, loc_code, emp_type, emp_status, u_email, j_date, wage in emp_raw_data:
            chk = select(Employee).where(Employee.organization_id == org_id, Employee.employee_code == code)
            emp = (await db.execute(chk)).scalar_one_or_none()
            user_obj = user_map.get(u_email) if u_email else None
            u_id = user_obj.id if user_obj else None

            if not emp:
                emp = Employee(
                    id=uuid.uuid4(),
                    organization_id=org_id,
                    user_id=u_id,
                    employee_code=code,
                    first_name=fname,
                    last_name=lname,
                    email=email,
                    phone=f"+91-98{code[3:]}12345",
                    gender=Gender.MALE if fname in ["Alex", "Rahul", "Marcus", "David", "Rohan", "Vikram", "Karan"] else Gender.FEMALE,
                    marital_status=MaritalStatus.SINGLE,
                    date_of_birth=date(1995, 5, 12),
                    joining_date=j_date,
                    department_id=dept_map[d_code].id,
                    designation_id=desig_map[des_code].id,
                    work_location_id=loc_map[loc_code].id,
                    employment_type=emp_type,
                    status=emp_status,
                    pan_number=f"ABCDE{code[3:]}24F",
                    pf_number=f"MH/BAN/{code[3:]}/001",
                )
                db.add(emp)
                await db.flush()

                # Add Bank details
                bank = EmployeeBankDetail(
                    id=uuid.uuid4(),
                    organization_id=org_id,
                    employee_id=emp.id,
                    bank_name="HDFC Bank Ltd",
                    account_number=f"501002{code[3:]}891",
                    ifsc_code="HDFC0001234",
                    branch_name="Cyber City Branch",
                    account_type=BankAccountType.SALARY,
                    is_primary=True,
                )
                db.add(bank)
                await db.flush()

            employee_map[code] = (emp, wage)

        # 7. Salary Rules & Salary Structure
        logger.info("Seeding salary rules and structures...")
        rules_data = [
            ("Basic Salary", "BASIC", SalaryRuleCategory.BASIC, CalculationType.FIXED, Decimal("50000.00"), None, None, None, 10, True),
            ("House Rent Allowance", "HRA", SalaryRuleCategory.ALLOWANCE, CalculationType.PERCENTAGE, None, Decimal("40.00"), "BASIC", None, 20, True),
            ("Special Allowance", "SPECIAL_ALLOWANCE", SalaryRuleCategory.ALLOWANCE, CalculationType.FIXED, Decimal("10000.00"), None, None, None, 30, True),
            ("Provident Fund", "PF", SalaryRuleCategory.DEDUCTION, CalculationType.PERCENTAGE, None, Decimal("12.00"), "BASIC", None, 40, True),
            ("Professional Tax", "PT", SalaryRuleCategory.DEDUCTION, CalculationType.FIXED, Decimal("200.00"), None, None, None, 50, True),
            ("Net Payable Salary", "NET", SalaryRuleCategory.NET, CalculationType.FORMULA, None, None, None, "BASIC + HRA + SPECIAL_ALLOWANCE - PF - PT", 100, True),
        ]

        rule_map = {}
        for r_name, r_code, r_cat, r_calc, fixed, pct, pct_base, formula, seq, stat in rules_data:
            chk = select(SalaryRule).where(SalaryRule.organization_id == org_id, SalaryRule.code == r_code)
            rule = (await db.execute(chk)).scalar_one_or_none()
            if not rule:
                rule = SalaryRule(
                    id=uuid.uuid4(),
                    organization_id=org_id,
                    name=r_name,
                    code=r_code,
                    category=r_cat,
                    calculation_type=r_calc,
                    fixed_amount=fixed,
                    percentage=pct,
                    percentage_base=pct_base,
                    formula=formula,
                    sequence=seq,
                    taxable=True,
                    is_statutory=stat,
                    is_active=True,
                )
                db.add(rule)
                await db.flush()
            rule_map[r_code] = rule

        # Salary Structure
        chk_struct = select(SalaryStructure).where(SalaryStructure.organization_id == org_id, SalaryStructure.code == "STD_CORP")
        struct = (await db.execute(chk_struct)).scalar_one_or_none()
        if not struct:
            struct = SalaryStructure(
                id=uuid.uuid4(),
                organization_id=org_id,
                name="Standard Corporate Salary Structure",
                code="STD_CORP",
                description="Default structure with Basic, 40% HRA, Special Allowance, PF, PT and Net",
                is_default=True,
                is_active=True,
            )
            db.add(struct)
            await db.flush()

            # Attach rules to structure
            for r_code, rule_obj in rule_map.items():
                sr_link = SalaryStructureRule(
                    id=uuid.uuid4(),
                    organization_id=org_id,
                    salary_structure_id=struct.id,
                    salary_rule_id=rule_obj.id,
                    sequence=rule_obj.sequence,
                    is_active=True,
                )
                db.add(sr_link)
            await db.flush()

        # 8. Active Contracts
        logger.info("Seeding employee employment contracts...")
        contract_map = {}
        for code, (emp, wage) in employee_map.items():
            chk_cnt = select(Contract).where(Contract.organization_id == org_id, Contract.employee_id == emp.id)
            cnt = (await db.execute(chk_cnt)).scalar_one_or_none()
            if not cnt:
                cnt = Contract(
                    id=uuid.uuid4(),
                    organization_id=org_id,
                    employee_id=emp.id,
                    salary_structure_id=struct.id,
                    contract_number=f"CNT-{code[3:]}",
                    contract_type=ContractType.PERMANENT if emp.employment_type == EmploymentType.FULL_TIME else ContractType.CONTRACTOR,
                    start_date=emp.joining_date,
                    end_date=None,
                    base_wage=wage,
                    wage_type=WageType.MONTHLY,
                    status=ContractStatus.ACTIVE,
                )
                db.add(cnt)
                await db.flush()
            contract_map[emp.id] = cnt

        # 9. Leave Types & Allocations
        logger.info("Seeding leave types, allocations, and requests...")
        ltypes = [
            ("Paid Annual Leave", "AL", 18, True),
            ("Sick Leave", "SL", 12, True),
            ("Casual Leave", "CL", 8, True),
        ]
        ltype_map = {}
        for lt_name, lt_code, default_days, is_paid in ltypes:
            chk_lt = select(LeaveType).where(LeaveType.organization_id == org_id, LeaveType.code == lt_code)
            lt = (await db.execute(chk_lt)).scalar_one_or_none()
            if not lt:
                lt = LeaveType(
                    id=uuid.uuid4(),
                    organization_id=org_id,
                    name=lt_name,
                    code=lt_code,
                    days_per_year=default_days,
                    is_paid=is_paid,
                    is_active=True,
                )
                db.add(lt)
                await db.flush()
            ltype_map[lt_code] = lt

        # Allocations for 2026
        for code, (emp, _) in employee_map.items():
            for lt_code, lt in ltype_map.items():
                chk_alloc = select(LeaveAllocation).where(
                    LeaveAllocation.organization_id == org_id,
                    LeaveAllocation.employee_id == emp.id,
                    LeaveAllocation.leave_type_id == lt.id,
                    LeaveAllocation.year == 2026,
                )
                alloc = (await db.execute(chk_alloc)).scalar_one_or_none()
                if not alloc:
                    alloc = LeaveAllocation(
                        id=uuid.uuid4(),
                        organization_id=org_id,
                        employee_id=emp.id,
                        leave_type_id=lt.id,
                        year=2026,
                        allocated_days=lt.days_per_year,
                        used_days=Decimal("0.0"),
                        remaining_days=lt.days_per_year,
                        allocated_by_id=admin_user.id,
                    )
                    db.add(alloc)
            await db.flush()

        # Leave Requests (mix of APPROVED, PENDING, REJECTED)
        alex_emp, _ = employee_map["EMP0001"]
        priya_emp, _ = employee_map["EMP0002"]
        rahul_emp, _ = employee_map["EMP0003"]

        sample_requests = [
            (alex_emp.id, ltype_map["AL"].id, date(2026, 8, 10), date(2026, 8, 12), Decimal("3.0"), "Family vacation", LeaveRequestStatus.APPROVED, admin_user.id, "Approved, enjoy!"),
            (priya_emp.id, ltype_map["SL"].id, date(2026, 8, 18), date(2026, 8, 19), Decimal("2.0"), "Fever and rest", LeaveRequestStatus.APPROVED, admin_user.id, "Take care and rest."),
            (rahul_emp.id, ltype_map["CL"].id, date(2026, 9, 15), date(2026, 9, 16), Decimal("2.0"), "Personal errand", LeaveRequestStatus.PENDING, None, None),
            (alex_emp.id, ltype_map["CL"].id, date(2026, 9, 22), date(2026, 9, 23), Decimal("2.0"), "Long weekend trip", LeaveRequestStatus.PENDING, None, None),
        ]
        for e_id, lt_id, s_d, e_d, days, reason, req_stat, rev_by, rev_comm in sample_requests:
            chk_lr = select(LeaveRequest).where(
                LeaveRequest.organization_id == org_id,
                LeaveRequest.employee_id == e_id,
                LeaveRequest.start_date == s_d,
            )
            lr = (await db.execute(chk_lr)).scalar_one_or_none()
            if not lr:
                lr = LeaveRequest(
                    id=uuid.uuid4(),
                    organization_id=org_id,
                    employee_id=e_id,
                    leave_type_id=lt_id,
                    start_date=s_d,
                    end_date=e_d,
                    days=days,
                    reason=reason,
                    status=req_stat,
                    reviewed_by_id=rev_by,
                    review_comment=rev_comm,
                    reviewed_at=datetime.now(timezone.utc) if rev_by else None,
                )
                db.add(lr)
        await db.flush()

        # 10. Attendance Records (~30 days)
        logger.info("Seeding realistic 30-day attendance history...")
        today = date(2026, 9, 5)
        for d_offset in range(30, 0, -1):
            att_date = today - timedelta(days=d_offset)
            if att_date.weekday() >= 5:  # Skip weekends
                continue

            for idx, (code, (emp, _)) in enumerate(employee_map.items()):
                chk_att = select(Attendance).where(
                    Attendance.organization_id == org_id,
                    Attendance.employee_id == emp.id,
                    Attendance.date == att_date,
                )
                if (await db.execute(chk_att)).scalar_one_or_none():
                    continue

                # Realistic status distribution
                if (d_offset + idx) % 15 == 0:
                    status = AttendanceStatus.ABSENT
                    c_in, c_out = None, None
                    w_hrs, ot_hrs = Decimal("0.00"), Decimal("0.00")
                elif (d_offset + idx) % 7 == 0:
                    status = AttendanceStatus.LATE
                    c_in = datetime.combine(att_date, time(9, 45), tzinfo=timezone.utc)
                    c_out = datetime.combine(att_date, time(18, 30), tzinfo=timezone.utc)
                    w_hrs, ot_hrs = Decimal("7.75"), Decimal("0.00")
                elif (d_offset + idx) % 9 == 0:
                    status = AttendanceStatus.PRESENT
                    c_in = datetime.combine(att_date, time(9, 0), tzinfo=timezone.utc)
                    c_out = datetime.combine(att_date, time(20, 0), tzinfo=timezone.utc)
                    w_hrs, ot_hrs = Decimal("10.00"), Decimal("2.00")
                else:
                    status = AttendanceStatus.PRESENT
                    c_in = datetime.combine(att_date, time(9, 0), tzinfo=timezone.utc)
                    c_out = datetime.combine(att_date, time(18, 0), tzinfo=timezone.utc)
                    w_hrs, ot_hrs = Decimal("8.00"), Decimal("0.00")

                att_row = Attendance(
                    id=uuid.uuid4(),
                    organization_id=org_id,
                    employee_id=emp.id,
                    date=att_date,
                    clock_in=c_in,
                    clock_out=c_out,
                    work_hours=w_hrs,
                    overtime_hours=ot_hrs,
                    status=status,
                    source=AttendanceSource.SELF,
                )
                db.add(att_row)
        await db.flush()

        # 11. Finalized Payrun for August 2026
        logger.info("Seeding finalized historical Payrun & generated Payslips...")
        chk_pr = select(Payrun).where(
            Payrun.organization_id == org_id,
            Payrun.year == 2026,
            Payrun.month == 8,
        )
        payrun = (await db.execute(chk_pr)).scalar_one_or_none()
        if not payrun:
            payrun = Payrun(
                id=uuid.uuid4(),
                organization_id=org_id,
                name="August 2026 Monthly Payroll",
                period_start=date(2026, 8, 1),
                period_end=date(2026, 8, 31),
                month=8,
                year=2026,
                status=PayrunStatus.FINALIZED,
                total_employees=len(employee_map),
                processed_employees=len(employee_map),
                issue_count=0,
                total_gross=Decimal("0.00"),
                total_deductions=Decimal("0.00"),
                total_net=Decimal("0.00"),
                created_by_id=admin_user.id,
                finalized_by_id=admin_user.id,
                computed_at=datetime(2026, 8, 31, 18, 0, tzinfo=timezone.utc),
                finalized_at=datetime(2026, 8, 31, 19, 0, tzinfo=timezone.utc),
            )
            db.add(payrun)
            await db.flush()

            running_gross = Decimal("0.00")
            running_ded = Decimal("0.00")
            running_net = Decimal("0.00")

            for code, (emp, wage) in employee_map.items():
                basic = wage
                hra = (basic * Decimal("0.40")).quantize(Decimal("0.01"))
                allowance = Decimal("10000.00")
                pf = (basic * Decimal("0.12")).quantize(Decimal("0.01"))
                pt = Decimal("200.00")
                gross = basic + hra + allowance
                deductions = pf + pt
                net = gross - deductions

                running_gross += gross
                running_ded += deductions
                running_net += net

                # Payrun Employee
                pe = PayrunEmployee(
                    id=uuid.uuid4(),
                    organization_id=org_id,
                    payrun_id=payrun.id,
                    employee_id=emp.id,
                    contract_id=contract_map[emp.id].id,
                    status=PayrunEmployeeStatus.COMPUTED,
                    basic_salary=basic,
                    gross_salary=gross,
                    total_deductions=deductions,
                    net_salary=net,
                    is_ready=True,
                )
                db.add(pe)

                # Payslip
                slip = Payslip(
                    id=uuid.uuid4(),
                    organization_id=org_id,
                    payrun_id=payrun.id,
                    employee_id=emp.id,
                    contract_id=contract_map[emp.id].id,
                    payslip_number=f"SLIP-202608-{code[3:]}",
                    period_start=date(2026, 8, 1),
                    period_end=date(2026, 8, 31),
                    basic_salary=basic,
                    gross_salary=gross,
                    total_earnings=gross,
                    total_deductions=deductions,
                    net_salary=net,
                    status=PayslipStatus.PAID,
                    pdf_url=f"/storage/payslips/202608/SLIP-202608-{code[3:]}.pdf",
                    generated_at=datetime(2026, 8, 31, 18, 0, tzinfo=timezone.utc),
                    paid_at=datetime(2026, 8, 31, 19, 0, tzinfo=timezone.utc),
                    sent_at=datetime(2026, 8, 31, 19, 30, tzinfo=timezone.utc),
                )
                db.add(slip)
                await db.flush()

                # Payslip Lines
                lines = [
                    ("BASIC", "Basic Salary", SalaryRuleCategory.BASIC, basic),
                    ("HRA", "House Rent Allowance", SalaryRuleCategory.ALLOWANCE, hra),
                    ("SPECIAL_ALLOWANCE", "Special Allowance", SalaryRuleCategory.ALLOWANCE, allowance),
                    ("PF", "Provident Fund", SalaryRuleCategory.DEDUCTION, pf),
                    ("PT", "Professional Tax", SalaryRuleCategory.DEDUCTION, pt),
                    ("NET", "Net Payable Salary", SalaryRuleCategory.NET, net),
                ]
                for l_code, l_name, l_cat, l_amt in lines:
                    pl = PayslipLine(
                        id=uuid.uuid4(),
                        organization_id=org_id,
                        payslip_id=slip.id,
                        rule_code=l_code,
                        rule_name=l_name,
                        category=l_cat,
                        amount=l_amt,
                    )
                    db.add(pl)

            payrun.total_gross = running_gross
            payrun.total_deductions = running_ded
            payrun.total_net = running_net

            # 12. AnalyticsSnapshot for August 2026
            avg_sal = float(running_net / len(employee_map))
            snap = AnalyticsSnapshot(
                id=uuid.uuid4(),
                organization_id=org_id,
                type="PAYROLL_MONTHLY",
                date=date(2026, 8, 1),
                data=json.dumps({
                    "total_gross": float(running_gross),
                    "total_deductions": float(running_ded),
                    "total_net": float(running_net),
                    "employee_count": len(employee_map),
                    "avg_salary": avg_sal,
                }),
            )
            db.add(snap)

        # 13. Audit Log Entries
        logger.info("Seeding audit log records...")
        audit_samples = [
            (admin_user.id, "UPDATE", "EMPLOYEES", "EmployeeProfile", alex_emp.id, '{"status": "PROBATION"}', '{"status": "ACTIVE"}'),
            (admin_user.id, "UPDATE", "CONTRACTS", "Contract", contract_map[alex_emp.id].id, '{"status": "DRAFT"}', '{"status": "ACTIVE"}'),
            (admin_user.id, "CREATE", "SALARY_CONFIG", "SalaryRule", rule_map["BASIC"].id, None, '{"code": "BASIC", "name": "Basic Salary"}'),
            (admin_user.id, "FINALIZE", "PAYROLL", "Payrun", payrun.id if payrun else uuid.uuid4(), '{"status": "PROCESSED"}', '{"status": "FINALIZED"}'),
        ]
        for u_id, act, mod, r_type, r_id, before, after in audit_samples:
            entry = AuditLog(
                id=uuid.uuid4(),
                organization_id=org_id,
                user_id=u_id,
                action=act,
                module=mod,
                resource_type=r_type,
                resource_id=r_id,
                before=before,
                after=after,
                ip_address="127.0.0.1",
                user_agent="PeoplePayDemoClient/1.0",
            )
            db.add(entry)

        # 14. In-App Notifications
        logger.info("Seeding user notifications...")
        for u_email, u_obj in user_map.items():
            notif = Notification(
                id=uuid.uuid4(),
                organization_id=org_id,
                recipient_id=u_obj.id,
                title="Welcome to PeoplePay360",
                message="Your PeoplePay360 workplace account is configured and ready.",
                type="SYSTEM_WELCOME",
                severity="INFO",
                is_read=False,
            )
            db.add(notif)

        await db.commit()
        logger.info("✅ Demo data seeded successfully!")
        logger.info("=" * 60)
        logger.info("Demo User Credentials:")
        logger.info("  Admin:            admin@peoplepay.com / Admin@123")
        logger.info("  HR Manager:       hr@peoplepay.com / Hr@12345")
        logger.info("  Payroll Manager:  payroll.manager@peoplepay.com / Payroll@12345")
        logger.info("  Employee:         alex.turner@peoplepay.com / Alex@12345")
        logger.info("=" * 60)


if __name__ == "__main__":
    asyncio.run(seed_all())
