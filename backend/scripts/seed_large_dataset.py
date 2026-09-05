#!/usr/bin/env python3
"""PeoplePay360 - 250+ Users Department-wise and Category-wise Database Seeder.

Seeds:
- 1 Organization (PeoplePay Tech Enterprises)
- 8 Departments (Engineering, Product, Sales, Marketing, HR, Finance, Operations, IT & QA)
- 25+ Designations across multiple Seniority Categories (Executive, Manager, Senior, Mid, Junior, Intern)
- 4 Work Locations (HQ Gurugram, Bangalore Tech Hub, Mumbai Office, Remote)
- 250 Employees with unique codes, full demographic info, PAN, UAN, PF, and Bank Accounts
- 250 User accounts with hashed passwords and appropriate roles
- Standard Admin, HR Manager, Payroll Manager, Payroll User accounts
- Default Salary Structure and 6 Salary Rules (Basic, HRA, Special Allowance, PF, PT, Net)
- 250 Employment Contracts with realistic base wages scaled by designation category
- Leave Types (Annual, Sick, Casual) and 2026 Leave Allocations for all 250 employees
- Realistic Attendance records for the past 30 days
- Finalized Payrun for August 2026 with 250 Payslips and detailed line breakdowns
- Analytics Snapshot for real-time Dashboard KPIs
"""

import asyncio
from datetime import date, datetime, time, timedelta, timezone
from decimal import Decimal
import json
import logging
from pathlib import Path
import random
import sys
import uuid

# Ensure backend root is in sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.core.audit import AuditLog
from app.core.config import settings
from app.core.security import hash_password
from app.features.attendance.models import Attendance, Holiday
from app.features.auth.models import Organization, User
from app.features.contracts.models import Contract
from app.features.employees.models import Employee, EmployeeBankDetail
from app.features.notifications.models import Notification
from app.features.organization.models import Department, Designation, WorkLocation
from app.features.payroll.models import (
    Payrun,
    PayrunEmployee,
    Payslip,
    PayslipLine,
)
from app.features.payroll_config.models import (
    SalaryRule,
    SalaryStructure,
    SalaryStructureRule,
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
    EmployeeStatus,
    EmploymentType,
    Gender,
    HolidayType,
    LeaveRequestStatus,
    MaritalStatus,
    PayrunEmployeeStatus,
    PayrunStatus,
    PayslipStatus,
    SalaryRuleCategory,
    UserRole,
    UserStatus,
    WageType,
)

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("seed_250_users")

FIRST_NAMES_MALE = [
    "Aarav", "Aditya", "Advait", "Alex", "Amit", "Anand", "Ankit", "Arjun", "Aryan", "Ayush",
    "Bharat", "Bhavin", "Chetan", "Daniel", "David", "Deepak", "Dev", "Dhruv", "Gaurav", "Gautam",
    "Harsh", "Hemant", "Ishaan", "James", "Jay", "Karan", "Kartik", "Kunal", "Manish", "Marcus",
    "Mayank", "Mohit", "Naveen", "Nikhil", "Nitin", "Pranav", "Prateek", "Praveen", "Rahul", "Rajat",
    "Rajesh", "Rakesh", "Rishi", "Rohan", "Rohit", "Sachin", "Sameer", "Sanjay", "Saurabh", "Shivam",
    "Shreyas", "Siddharth", "Sumit", "Suraj", "Tarun", "Utkarsh", "Varun", "Vicky", "Vijay", "Vikas",
    "Vikram", "Vinay", "Vipin", "Vishal", "Vivek", "Yash", "Yogesh", "Abhinav", "Akash", "Alok"
]

FIRST_NAMES_FEMALE = [
    "Aadhya", "Aakanksha", "Aditi", "Aishwarya", "Alisha", "Ananya", "Anjali", "Ankita", "Anushka", "Avani",
    "Bhavna", "Charu", "Deepa", "Deepika", "Disha", "Divya", "Garima", "Geeta", "Ishita", "Janhavi",
    "Juhi", "Kajal", "Kalyani", "Kavita", "Khushi", "Kiran", "Komal", "Kritika", "Latika", "Madhu",
    "Manasi", "Meera", "Megha", "Mona", "Muskan", "Nandini", "Neha", "Nidhi", "Nikita", "Nisha",
    "Pallavi", "Payal", "Pooja", "Prachi", "Pragya", "Preeti", "Priya", "Priyanka", "Rachna", "Radha",
    "Radhika", "Rashmi", "Raveena", "Rhea", "Richa", "Riddhi", "Ritu", "Riya", "Sakshi", "Saloni",
    "Samiksha", "Sanya", "Sarita", "Shalini", "Shikha", "Shivani", "Shreya", "Shruti", "Simran", "Sneha",
    "Sonali", "Sonia", "Sonika", "Srishti", "Suman", "Sunita", "Swati", "Tanya", "Tara", "Trisha"
]

LAST_NAMES = [
    "Agarwal", "Ahuja", "Arora", "Bakshi", "Banerjee", "Bansal", "Batra", "Bhandari", "Bhatia", "Bhatt",
    "Bose", "Chadha", "Chakraborty", "Chauhan", "Chawla", "Chopra", "Choudhury", "Das", "Deshmukh", "Dewan",
    "Dhar", "Dua", "Dutta", "Garg", "Ghosh", "Goel", "Grover", "Gupta", "Handa", "Iyer",
    "Jadhav", "Jain", "Jha", "Joshi", "Kapoor", "Kashyap", "Kaul", "Kaur", "Khan", "Khanna",
    "Khatri", "Khurana", "Kohli", "Kulkarni", "Kumar", "Lal", "Mahajan", "Malhotra", "Malik", "Mathur",
    "Mehra", "Mehta", "Mishra", "Mittal", "Mukherjee", "Nair", "Nangia", "Narang", "Natarajan", "Oberoi",
    "Pandey", "Patel", "Pathak", "Patil", "Pillai", "Prasad", "Puri", "Radhakrishnan", "Rao", "Rastogi",
    "Rathore", "Reddy", "Roy", "Sahni", "Saxena", "Sengupta", "Seth", "Sethi", "Sharma", "Shetty",
    "Shukla", "Singh", "Singhal", "Sinha", "Sodhi", "Soni", "Srivastava", "Suri", "Talwar", "Tandon",
    "Thakur", "Tiwari", "Trehan", "Tripathi", "Vaidya", "Varma", "Verma", "Vora", "Vyas", "Yadav"
]

BANKS = [
    ("HDFC Bank Ltd", "HDFC0001234", "Cyber City Branch"),
    ("ICICI Bank Ltd", "ICIC0005678", "MG Road Branch"),
    ("State Bank of India", "SBIN0009012", "Indiranagar Branch"),
    ("Axis Bank Ltd", "UTIB0003456", "Bandra Kurla Complex"),
    ("Kotak Mahindra Bank", "KKBK0007890", "Cyber Hub Branch"),
    ("Standard Chartered", "SCBL0036001", "Barakhamba Road"),
]


async def seed_250_users():
    engine = create_async_engine(settings.DATABASE_URL, echo=False)
    session_factory = async_sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)

    async with session_factory() as db:
        logger.info("=" * 70)
        logger.info("STARTING DATABASE SEEDING: 250+ USERS (DEPARTMENT & CATEGORY-WISE)")
        logger.info("=" * 70)

        # 1. Organization
        stmt_org = select(Organization).where(Organization.code == "PPT")
        org = (await db.execute(stmt_org)).scalar_one_or_none()
        if not org:
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
        else:
            logger.info(f"Using existing Organization: {org.name} (ID: {org.id})")

        org_id = org.id

        # 2. Work Locations
        locations_data = [
            ("Cyber City Campus (HQ)", "GGN-01", "Gurugram", "Haryana", "India", "122002", True),
            ("Tech Central Bangalore", "BLR-01", "Bangalore", "Karnataka", "India", "560001", False),
            ("BKC Financial Centre", "MUM-01", "Mumbai", "Maharashtra", "India", "400051", False),
            ("HITEC City Office", "HYD-01", "Hyderabad", "Telangana", "India", "500081", False),
            ("Remote Work Hub", "REM-01", "All Regions", "Remote", "India", "000000", False),
        ]
        loc_map = {}
        for name, code, city, state, country, pin, is_hq in locations_data:
            chk_loc = select(WorkLocation).where(WorkLocation.organization_id == org_id, WorkLocation.code == code)
            loc = (await db.execute(chk_loc)).scalar_one_or_none()
            if not loc:
                loc = WorkLocation(
                    id=uuid.uuid4(),
                    organization_id=org_id,
                    name=name,
                    code=code,
                    address=f"{name}, Sector 24",
                    city=city,
                    state=state,
                    country=country,
                    postal_code=pin,
                    is_active=True,
                )
                db.add(loc)
                await db.flush()
            loc_map[code] = loc
        logger.info(f"Configured {len(loc_map)} Work Locations")

        # 3. Departments
        departments_data = [
            ("Engineering & Architecture", "ENG", "Core Software Engineering, Cloud Infra, Backend & Frontend"),
            ("Product & Design", "PRD", "Product Strategy, UX/UI Design, User Research & Design Systems"),
            ("Human Resources & Talent", "HRD", "People Operations, Talent Acquisition, Culture & Employee Relations"),
            ("Finance & Accounting", "FIN", "Corporate Finance, Treasury, Statutory Compliance & Payroll"),
            ("Sales & Business Development", "SLS", "Enterprise Sales, Account Management & Global Growth"),
            ("Marketing & Growth", "MKT", "Product Marketing, Brand Communications, Content & Performance Growth"),
            ("Operations & Customer Success", "OPS", "Customer Support, Implementation Services & Tech Ops"),
            ("Quality Assurance & Security", "QAS", "Software Quality Engineering, Test Automation & Cybersecurity"),
        ]
        dept_map = {}
        for name, code, desc in departments_data:
            chk_d = select(Department).where(Department.organization_id == org_id, Department.code == code)
            d = (await db.execute(chk_d)).scalar_one_or_none()
            if not d:
                d = Department(
                    id=uuid.uuid4(),
                    organization_id=org_id,
                    name=name,
                    code=code,
                    description=desc,
                    is_active=True,
                )
                db.add(d)
                await db.flush()
            dept_map[code] = d
        logger.info(f"Configured {len(dept_map)} Departments")

        # 4. Designations by Department with Category & Base Wage
        # (title, code, dept_code, category, min_wage, max_wage)
        designations_data = [
            # Engineering
            ("VP of Engineering", "VPE", "ENG", "Executive", 220000, 260000),
            ("Principal Software Architect", "PSA", "ENG", "Senior", 170000, 210000),
            ("Engineering Manager", "EMG", "ENG", "Manager", 150000, 185000),
            ("Senior Backend Engineer", "SBE", "ENG", "Senior", 110000, 145000),
            ("Senior Frontend Engineer", "SFE", "ENG", "Senior", 105000, 140000),
            ("Senior DevOps / SRE", "SRE", "ENG", "Senior", 115000, 150000),
            ("Backend Developer", "BED", "ENG", "Mid", 75000, 100000),
            ("Frontend Developer", "FED", "ENG", "Mid", 70000, 95000),
            ("DevOps Engineer", "DEV", "ENG", "Mid", 75000, 105000),
            ("Junior Software Engineer", "JSE", "ENG", "Junior", 45000, 65000),
            ("Software Engineering Intern", "SEI", "ENG", "Intern", 30000, 35000),

            # Product & Design
            ("Head of Product", "HOP", "PRD", "Executive", 190000, 230000),
            ("Lead Product Designer", "LPD", "PRD", "Senior", 130000, 165000),
            ("Senior Product Manager", "SPM", "PRD", "Senior", 135000, 170000),
            ("Product Designer (UI/UX)", "PDU", "PRD", "Mid", 75000, 110000),
            ("Associate Product Manager", "APM", "PRD", "Junior", 55000, 75000),

            # Human Resources
            ("Director of People & Culture", "DPC", "HRD", "Executive", 160000, 200000),
            ("HR Manager", "HRM", "HRD", "Manager", 100000, 130000),
            ("Payroll Specialist", "PRS", "HRD", "Mid", 65000, 90000),
            ("Talent Acquisition Specialist", "TAS", "HRD", "Mid", 60000, 85000),
            ("HR Operations Coordinator", "HRC", "HRD", "Junior", 40000, 55000),

            # Finance
            ("Chief Financial Officer", "CFO", "FIN", "Executive", 220000, 270000),
            ("Finance Manager", "FNM", "FIN", "Manager", 120000, 155000),
            ("Senior Financial Analyst", "SFA", "FIN", "Senior", 90000, 125000),
            ("Staff Accountant", "STA", "FIN", "Mid", 60000, 80000),
            ("Junior Accounts Executive", "JAE", "FIN", "Junior", 38000, 50000),

            # Sales & BD
            ("VP of Enterprise Sales", "VPS", "SLS", "Executive", 180000, 230000),
            ("Enterprise Account Executive", "EAE", "SLS", "Senior", 100000, 140000),
            ("Account Executive", "ACE", "SLS", "Mid", 70000, 95000),
            ("Sales Development Rep", "SDR", "SLS", "Junior", 42000, 60000),

            # Marketing
            ("Director of Marketing", "DOM", "MKT", "Executive", 150000, 190000),
            ("Product Marketing Lead", "PML", "MKT", "Senior", 95000, 130000),
            ("Content & Brand Strategist", "CBS", "MKT", "Mid", 65000, 85000),
            ("Growth Marketing Specialist", "GMS", "MKT", "Mid", 65000, 90000),

            # Operations & Customer Success
            ("Head of Customer Success", "HCS", "OPS", "Executive", 140000, 180000),
            ("Customer Success Manager", "CSM", "OPS", "Manager", 85000, 115000),
            ("Support Operations Engineer", "SOE", "OPS", "Mid", 55000, 75000),
            ("Customer Support Specialist", "CSS", "OPS", "Junior", 38000, 50000),

            # QA & Security
            ("QA Lead & Architect", "QAL", "QAS", "Senior", 120000, 155000),
            ("Senior QA Automation Engineer", "SQA", "QAS", "Senior", 90000, 120000),
            ("Security & Compliance Engineer", "SCE", "QAS", "Mid", 80000, 115000),
            ("QA Automation Engineer", "QAE", "QAS", "Mid", 65000, 85000),
            ("QA Manual Tester", "QAT", "QAS", "Junior", 40000, 55000),
        ]

        desig_map = {}
        for title, code, dept_code, category, min_w, max_w in designations_data:
            chk_des = select(Designation).where(Designation.organization_id == org_id, Designation.code == code)
            des = (await db.execute(chk_des)).scalar_one_or_none()
            if not des:
                des = Designation(
                    id=uuid.uuid4(),
                    organization_id=org_id,
                    department_id=dept_map[dept_code].id,
                    title=title,
                    code=code,
                    is_active=True,
                )
                db.add(des)
                await db.flush()
            desig_map[code] = (des, dept_code, category, min_w, max_w)
        logger.info(f"Configured {len(desig_map)} Designations across departments")

        # 5. Salary Structure and Rules
        rules_configs = [
            ("Basic Salary", "BASIC", SalaryRuleCategory.BASIC, CalculationType.FIXED, Decimal("50000.00"), None, None, None, 10, True),
            ("House Rent Allowance", "HRA", SalaryRuleCategory.ALLOWANCE, CalculationType.PERCENTAGE, None, Decimal("40.00"), "BASIC", None, 20, True),
            ("Special Allowance", "SPECIAL_ALLOWANCE", SalaryRuleCategory.ALLOWANCE, CalculationType.FIXED, Decimal("10000.00"), None, None, None, 30, True),
            ("Provident Fund", "PF", SalaryRuleCategory.DEDUCTION, CalculationType.PERCENTAGE, None, Decimal("12.00"), "BASIC", None, 40, True),
            ("Professional Tax", "PT", SalaryRuleCategory.DEDUCTION, CalculationType.FIXED, Decimal("200.00"), None, None, None, 50, True),
            ("Net Payable Salary", "NET", SalaryRuleCategory.NET, CalculationType.FORMULA, None, None, None, "BASIC + HRA + SPECIAL_ALLOWANCE - PF - PT", 100, True),
        ]
        rule_map = {}
        for r_name, r_code, r_cat, r_calc, fixed, pct, pct_base, formula, seq, stat in rules_configs:
            chk_r = select(SalaryRule).where(SalaryRule.organization_id == org_id, SalaryRule.code == r_code)
            rule = (await db.execute(chk_r)).scalar_one_or_none()
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

        # 6. Leave Types
        ltypes_data = [
            ("Paid Annual Leave", "AL", Decimal("18.0"), True),
            ("Sick Leave", "SL", Decimal("12.0"), True),
            ("Casual Leave", "CL", Decimal("8.0"), True),
        ]
        ltype_map = {}
        for lt_name, lt_code, default_days, is_paid in ltypes_data:
            chk_lt = select(LeaveType).where(LeaveType.organization_id == org_id, LeaveType.code == lt_code)
            lt = (await db.execute(chk_lt)).scalar_one_or_none()
            if not lt:
                lt = LeaveType(
                    id=uuid.uuid4(),
                    organization_id=org_id,
                    name=lt_name,
                    code=lt_code,
                    default_days=default_days,
                    is_paid=is_paid,
                    is_active=True,
                )
                db.add(lt)
                await db.flush()
            ltype_map[lt_code] = lt

        # 7. System Seed Admin / Core Accounts
        system_users = [
            ("admin@peoplepay.com", "Admin@123", UserRole.ADMIN, "System Administrator"),
            ("hr@peoplepay.com", "Hr@12345", UserRole.HR_MANAGER, "HR Director"),
            ("payroll.manager@peoplepay.com", "Payroll@12345", UserRole.HR_PAYROLL_MANAGER, "Payroll Manager"),
            ("payroll.user@peoplepay.com", "Payroll@12345", UserRole.HR_PAYROLL_USER, "Payroll Specialist"),
        ]
        core_user_map = {}
        for email, pwd, role, _ in system_users:
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
                    must_change_password=False,
                )
                db.add(usr)
                await db.flush()
            core_user_map[email] = usr

        admin_user = core_user_map["admin@peoplepay.com"]
        default_pwd_hash = hash_password("Employee@123")

        # 8. Generate 250 Distinct Employees distributed across Departments & Categories
        logger.info("Generating 250 Employees with demographic, bank & contract data...")
        random.seed(42)  # Deterministic seed for reproducible data

        # Department distribution targets summing to 250
        # ENG: 80, PRD: 25, HRD: 18, FIN: 22, SLS: 40, MKT: 25, OPS: 22, QAS: 18 -> Total = 250
        dept_distribution = {
            "ENG": 80,
            "PRD": 25,
            "HRD": 18,
            "FIN": 22,
            "SLS": 40,
            "MKT": 25,
            "OPS": 22,
            "QAS": 18,
        }

        # Available designations per department
        dept_desigs = {}
        for des_code, (des_obj, dept_code, category, min_w, max_w) in desig_map.items():
            if dept_code not in dept_desigs:
                dept_desigs[dept_code] = []
            dept_desigs[dept_code].append((des_code, des_obj, category, min_w, max_w))

        used_emails = set()
        for u in core_user_map.values():
            used_emails.add(u.email)

        employees_list = []
        emp_code_counter = 1

        loc_keys = list(loc_map.keys())

        for dept_code, count in dept_distribution.items():
            desigs_in_dept = dept_desigs[dept_code]
            # Ensure top leadership designations appear first
            for i in range(count):
                des_choice = desigs_in_dept[i % len(desigs_in_dept)]
                des_code, des_obj, category, min_w, max_w = des_choice

                is_female = (emp_code_counter % 3 == 0) or (emp_code_counter % 5 == 0)
                fname = random.choice(FIRST_NAMES_FEMALE) if is_female else random.choice(FIRST_NAMES_MALE)
                lname = random.choice(LAST_NAMES)
                gender = Gender.FEMALE if is_female else Gender.MALE

                # Unique email
                base_email = f"{fname.lower()}.{lname.lower()}@peoplepay.com"
                email = base_email
                suffix = 1
                while email in used_emails:
                    email = f"{fname.lower()}.{lname.lower()}{suffix}@peoplepay.com"
                    suffix += 1
                used_emails.add(email)

                # Employee code EMP0001 - EMP0250
                emp_code = f"EMP{emp_code_counter:04d}"

                # Calculate base wage within range
                wage_val = Decimal(str(random.randint(min_w // 1000, max_w // 1000) * 1000))

                # Role assignment
                if des_code in ["DPC", "HRM"]:
                    user_role = UserRole.HR_MANAGER
                elif des_code in ["PRS"]:
                    user_role = UserRole.HR_PAYROLL_USER
                elif des_code in ["CFO", "FNM"]:
                    user_role = UserRole.HR_PAYROLL_MANAGER
                elif des_code in ["VPE", "HOP", "VPS"]:
                    user_role = UserRole.ADMIN
                else:
                    user_role = UserRole.EMPLOYEE

                # Employment Type & Status
                if category == "Intern":
                    emp_type = EmploymentType.INTERN
                    emp_status = EmployeeStatus.ACTIVE
                elif emp_code_counter % 30 == 0:
                    emp_type = EmploymentType.CONTRACT
                    emp_status = EmployeeStatus.ACTIVE
                elif emp_code_counter % 45 == 0:
                    emp_type = EmploymentType.FULL_TIME
                    emp_status = EmployeeStatus.ON_LEAVE
                elif emp_code_counter % 50 == 0:
                    emp_type = EmploymentType.FULL_TIME
                    emp_status = EmployeeStatus.PROBATION
                else:
                    emp_type = EmploymentType.FULL_TIME
                    emp_status = EmployeeStatus.ACTIVE

                # Joining date (staggered from 2021 to 2026)
                join_year = 2021 + (emp_code_counter % 5)
                join_month = 1 + (emp_code_counter % 12)
                join_day = 1 + (emp_code_counter % 25)
                join_date = date(join_year, join_month, join_day)

                # Birth date
                birth_year = 1980 + (emp_code_counter % 20)
                birth_date = date(birth_year, ((emp_code_counter * 3) % 12) + 1, ((emp_code_counter * 7) % 25) + 1)

                # Work Location
                loc_idx = emp_code_counter % len(loc_keys)
                loc_obj = loc_map[loc_keys[loc_idx]]

                employees_list.append({
                    "emp_code": emp_code,
                    "first_name": fname,
                    "last_name": lname,
                    "email": email,
                    "gender": gender,
                    "dept_id": dept_map[dept_code].id,
                    "des_id": des_obj.id,
                    "loc_id": loc_obj.id,
                    "des_code": des_code,
                    "category": category,
                    "wage": wage_val,
                    "role": user_role,
                    "emp_type": emp_type,
                    "status": emp_status,
                    "join_date": join_date,
                    "birth_date": birth_date,
                    "phone": f"+91-{9800000000 + emp_code_counter}",
                    "counter": emp_code_counter,
                })
                emp_code_counter += 1

        logger.info(f"Prepared data for {len(employees_list)} Employees.")

        # 9. Commit Employees, Users, Bank Details, and Contracts in Batches
        logger.info("Writing Employees, Users, Bank Accounts, and Contracts to DB...")
        created_employees = []
        emp_contract_map = {}

        # First pass: Create users & employees
        for item in employees_list:
            # Check or create User
            chk_u = select(User).where(User.email == item["email"])
            usr = (await db.execute(chk_u)).scalar_one_or_none()
            if not usr:
                usr = User(
                    id=uuid.uuid4(),
                    organization_id=org_id,
                    email=item["email"],
                    password_hash=default_pwd_hash,
                    role=item["role"],
                    status=UserStatus.ACTIVE,
                    must_change_password=False,
                )
                db.add(usr)
                await db.flush()

            # Check or create Employee
            chk_e = select(Employee).where(Employee.organization_id == org_id, Employee.employee_code == item["emp_code"])
            emp = (await db.execute(chk_e)).scalar_one_or_none()
            if not emp:
                c_num = item["counter"]
                emp = Employee(
                    id=uuid.uuid4(),
                    organization_id=org_id,
                    user_id=usr.id,
                    employee_code=item["emp_code"],
                    first_name=item["first_name"],
                    last_name=item["last_name"],
                    email=item["email"],
                    phone=item["phone"],
                    gender=item["gender"],
                    marital_status=MaritalStatus.MARRIED if c_num % 2 == 0 else MaritalStatus.SINGLE,
                    date_of_birth=item["birth_date"],
                    joining_date=item["join_date"],
                    department_id=item["dept_id"],
                    designation_id=item["des_id"],
                    work_location_id=item["loc_id"],
                    employment_type=item["emp_type"],
                    status=item["status"],
                    pan_number=f"ABCDE{c_num:04d}F",
                    aadhaar_number=f"5432{c_num:04d}9876",
                    uan_number=f"1009{c_num:04d}8765",
                    pf_number=f"MH/BAN/{c_num:04d}/001",
                    esi_number=f"3100{c_num:04d}7654",
                )
                db.add(emp)
                await db.flush()

                # Bank Details
                bank_info = BANKS[c_num % len(BANKS)]
                bank = EmployeeBankDetail(
                    id=uuid.uuid4(),
                    organization_id=org_id,
                    employee_id=emp.id,
                    bank_name=bank_info[0],
                    account_number=f"50100{c_num:04d}9923",
                    ifsc_code=bank_info[1],
                    branch_name=bank_info[2],
                    account_type=BankAccountType.SALARY,
                    is_primary=True,
                )
                db.add(bank)

                # Contract
                cnt = Contract(
                    id=uuid.uuid4(),
                    organization_id=org_id,
                    employee_id=emp.id,
                    salary_structure_id=struct.id,
                    contract_number=f"CNT-{item['emp_code']}",
                    contract_type=ContractType.PERMANENT if item["emp_type"] == EmploymentType.FULL_TIME else ContractType.CONTRACTOR,
                    start_date=item["join_date"],
                    end_date=None,
                    base_wage=item["wage"],
                    wage_type=WageType.MONTHLY,
                    status=ContractStatus.ACTIVE,
                )
                db.add(cnt)

            created_employees.append((emp, item["wage"], item["emp_code"]))
            emp_contract_map[emp.id] = cnt if 'cnt' in locals() else None

            # Flush periodically
            if len(created_employees) % 50 == 0:
                await db.flush()
                logger.info(f"  Inserted {len(created_employees)} / {len(employees_list)} employee records...")

        await db.commit()
        logger.info(f"✅ Successfully seeded and committed {len(created_employees)} Employees & Users")

        # 10. Establish Department Managers
        logger.info("Setting up department managers via direct SQL...")
        await db.execute(text("""
            UPDATE departments d
            SET manager_id = (
                SELECT e.id FROM employees e 
                WHERE e.department_id = d.id 
                ORDER BY e.employee_code ASC LIMIT 1
            )
            WHERE d.organization_id = :org_id
        """), {"org_id": org_id})
        await db.commit()
        logger.info("✅ Department managers updated.")

        # 11. Leave Allocations & Sample Leave Requests
        logger.info("Seeding 2026 Leave Allocations & Requests for all employees...")
        stmt_existing_allocs = select(LeaveAllocation.employee_id, LeaveAllocation.leave_type_id).where(
            LeaveAllocation.organization_id == org_id,
            LeaveAllocation.year == 2026,
        )
        existing_alloc_set = set((await db.execute(stmt_existing_allocs)).all())

        new_allocs = []
        for emp, wage, code in created_employees:
            for lt_code, lt in ltype_map.items():
                if (emp.id, lt.id) not in existing_alloc_set:
                    alloc = LeaveAllocation(
                        id=uuid.uuid4(),
                        organization_id=org_id,
                        employee_id=emp.id,
                        leave_type_id=lt.id,
                        year=2026,
                        allocated_days=lt.default_days,
                        used_days=Decimal("0.0"),
                        remaining_days=lt.default_days,
                        allocated_by_id=admin_user.id,
                    )
                    new_allocs.append(alloc)
                    existing_alloc_set.add((emp.id, lt.id))

        if new_allocs:
            db.add_all(new_allocs)
            await db.commit()
        logger.info(f"✅ Seeded {len(new_allocs)} Leave Allocations for year 2026.")

        # Sample Leave Requests
        sample_requests = []
        for idx in range(1, 20):
            emp, _, _ = created_employees[idx * 10 % len(created_employees)]
            s_date = date(2026, 8, 5 + (idx % 20))
            e_date = s_date + timedelta(days=(idx % 3) + 1)
            days_count = Decimal(str((e_date - s_date).days + 1))
            status_choice = LeaveRequestStatus.APPROVED if idx % 3 != 0 else LeaveRequestStatus.PENDING

            lr = LeaveRequest(
                id=uuid.uuid4(),
                organization_id=org_id,
                employee_id=emp.id,
                leave_type_id=ltype_map["AL" if idx % 2 == 0 else "SL"].id,
                start_date=s_date,
                end_date=e_date,
                days=days_count,
                reason="Vacation and personal rest" if idx % 2 == 0 else "Medical recovery",
                status=status_choice,
                reviewed_by_id=admin_user.id if status_choice == LeaveRequestStatus.APPROVED else None,
                review_comment="Approved, keep your tasks handed over." if status_choice == LeaveRequestStatus.APPROVED else None,
                reviewed_at=datetime.now(timezone.utc) if status_choice == LeaveRequestStatus.APPROVED else None,
            )
            sample_requests.append(lr)

        db.add_all(sample_requests)
        await db.commit()

        # 12. Attendance Records for the Past 15 Working Days
        logger.info("Generating realistic 15-day attendance history in bulk...")
        today = date(2026, 9, 5)
        stmt_existing_att = select(Attendance.employee_id, Attendance.date).where(
            Attendance.organization_id == org_id,
        )
        existing_att_set = set((await db.execute(stmt_existing_att)).all())

        new_attendances = []
        for d_offset in range(15, 0, -1):
            att_date = today - timedelta(days=d_offset)
            if att_date.weekday() >= 5:  # Skip weekends
                continue

            for idx, (emp, _, _) in enumerate(created_employees):
                if (emp.id, att_date) in existing_att_set:
                    continue

                noise = (d_offset * 13 + idx * 7) % 100
                if noise < 3:
                    status = AttendanceStatus.ABSENT
                    c_in, c_out = None, None
                    w_hrs, ot_hrs = Decimal("0.00"), Decimal("0.00")
                elif noise < 10:
                    status = AttendanceStatus.LATE
                    c_in = datetime.combine(att_date, time(9, 45), tzinfo=timezone.utc)
                    c_out = datetime.combine(att_date, time(18, 30), tzinfo=timezone.utc)
                    w_hrs, ot_hrs = Decimal("7.75"), Decimal("0.00")
                elif noise < 20:
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
                new_attendances.append(att_row)
                existing_att_set.add((emp.id, att_date))

        if new_attendances:
            for i in range(0, len(new_attendances), 500):
                chunk = new_attendances[i:i + 500]
                db.add_all(chunk)
                await db.commit()
                logger.info(f"  Inserted {min(i + 500, len(new_attendances))} / {len(new_attendances)} attendance records...")

        logger.info(f"✅ Created {len(new_attendances)} attendance records.")

        # 13. Finalized Payrun for August 2026 for ALL 250 Employees
        logger.info("Computing August 2026 Payrun and Payslips for all 250 Employees...")
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
                total_employees=len(created_employees),
                processed_employees=len(created_employees),
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
            await db.commit()

        # Query all contracts for created employees
        stmt_contracts = select(Contract).where(Contract.organization_id == org_id)
        all_contracts = (await db.execute(stmt_contracts)).scalars().all()
        contract_by_emp = {c.employee_id: c for c in all_contracts}

        stmt_existing_slips = select(Payslip.employee_id).where(Payslip.payrun_id == payrun.id)
        existing_slip_emps = set((await db.execute(stmt_existing_slips)).scalars().all())

        running_gross = Decimal("0.00")
        running_ded = Decimal("0.00")
        running_net = Decimal("0.00")

        pe_batch = []
        slip_batch = []
        line_batch = []

        for emp, wage, code in created_employees:
            cnt = contract_by_emp.get(emp.id)
            if not cnt:
                continue

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

            if emp.id not in existing_slip_emps:
                pe = PayrunEmployee(
                    id=uuid.uuid4(),
                    organization_id=org_id,
                    payrun_id=payrun.id,
                    employee_id=emp.id,
                    contract_id=cnt.id,
                    status=PayrunEmployeeStatus.COMPUTED,
                    basic_salary=basic,
                    gross_salary=gross,
                    total_deductions=deductions,
                    net_salary=net,
                    is_ready=True,
                )
                pe_batch.append(pe)

                slip = Payslip(
                    id=uuid.uuid4(),
                    organization_id=org_id,
                    payrun_id=payrun.id,
                    employee_id=emp.id,
                    contract_id=cnt.id,
                    payslip_number=f"SLIP-202608-{code}",
                    period_start=date(2026, 8, 1),
                    period_end=date(2026, 8, 31),
                    basic_salary=basic,
                    gross_salary=gross,
                    total_earnings=gross,
                    total_deductions=deductions,
                    net_salary=net,
                    status=PayslipStatus.PAID,
                    pdf_url=f"/storage/payslips/202608/SLIP-202608-{code}.pdf",
                    generated_at=datetime(2026, 8, 31, 18, 0, tzinfo=timezone.utc),
                    paid_at=datetime(2026, 8, 31, 19, 0, tzinfo=timezone.utc),
                    sent_at=datetime(2026, 8, 31, 19, 30, tzinfo=timezone.utc),
                )
                slip_batch.append(slip)

                lines = [
                    ("BASIC", "Basic Salary", "BASIC", basic),
                    ("HRA", "House Rent Allowance", "ALLOWANCE", hra),
                    ("SPECIAL_ALLOWANCE", "Special Allowance", "ALLOWANCE", allowance),
                    ("PF", "Provident Fund", "DEDUCTION", pf),
                    ("PT", "Professional Tax", "DEDUCTION", pt),
                    ("NET", "Net Payable Salary", "NET", net),
                ]
                for l_code, l_name, l_cat, l_amt in lines:
                    pl = PayslipLine(
                        id=uuid.uuid4(),
                        organization_id=org_id,
                        payslip_id=slip.id,
                        name=l_name,
                        code=l_code,
                        category=l_cat,
                        amount=l_amt,
                        base_amount=l_amt,
                        sequence=10,
                    )
                    line_batch.append(pl)

        if pe_batch:
            db.add_all(pe_batch)
            db.add_all(slip_batch)
            await db.commit()
            logger.info(f"✅ Committed {len(pe_batch)} Payrun Employees and {len(slip_batch)} Payslips.")

        if line_batch:
            for i in range(0, len(line_batch), 500):
                chunk = line_batch[i:i + 500]
                db.add_all(chunk)
                await db.commit()
            logger.info(f"✅ Committed {len(line_batch)} Payslip Lines.")


        # Update payrun totals
        await db.execute(text("""
            UPDATE payruns
            SET total_gross = :gross, total_deductions = :ded, total_net = :net
            WHERE id = :p_id
        """), {"gross": running_gross, "ded": running_ded, "net": running_net, "p_id": payrun.id})
        await db.commit()

        # 14. Analytics Snapshot for Real-Time Charts & KPI Cards
        chk_snap = select(AnalyticsSnapshot).where(
            AnalyticsSnapshot.organization_id == org_id,
            AnalyticsSnapshot.date == date(2026, 8, 1),
        )
        snap = (await db.execute(chk_snap)).scalar_one_or_none()
        if not snap:
            snap = AnalyticsSnapshot(
                id=uuid.uuid4(),
                organization_id=org_id,
                type="PAYROLL_MONTHLY",
                date=date(2026, 8, 1),
                data=json.dumps({
                    "total_gross": float(running_gross),
                    "total_deductions": float(running_ded),
                    "total_net": float(running_net),
                    "employee_count": len(created_employees),
                    "avg_salary": float(running_net / len(created_employees)) if created_employees else 0.0,
                }),
            )
            db.add(snap)

        await db.commit()

        logger.info("=" * 70)
        logger.info("🎉 DATABASE SEEDING COMPLETED SUCCESSFULLY!")
        logger.info(f"Total Employees & Users: {len(created_employees)}")
        logger.info(f"Departments:            {len(dept_map)}")
        logger.info(f"Designations:           {len(desig_map)}")
        logger.info(f"Total Monthly Payroll:   ₹{running_net:,.2f}")
        logger.info("=" * 70)
        logger.info("Standard Login Credentials:")
        logger.info("  Admin:           admin@peoplepay.com / Admin@123")
        logger.info("  HR Manager:      hr@peoplepay.com / Hr@12345")
        logger.info("  Payroll Manager: payroll.manager@peoplepay.com / Payroll@12345")
        logger.info("  Payroll User:    payroll.user@peoplepay.com / Payroll@12345")
        logger.info("  Employee Sample: " + created_employees[0][0].email + " / Employee@123")
        logger.info("=" * 70)


if __name__ == "__main__":
    asyncio.run(seed_250_users())
