import ast
from datetime import date, datetime, timezone
from decimal import Decimal
import logging
from typing import Any, Dict, List, Optional, Set, Tuple
import uuid
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.features.attendance.models import Attendance, Holiday
from app.features.contracts.models import Contract
from app.features.contracts.repository import ContractRepository
from app.features.employees.models import Employee
from app.features.payroll.models import (
    PayrollValidationIssue,
    Payrun,
    PayrunEmployee,
    Payslip,
    PayslipLine,
)
from app.features.payroll_config.models import (
    EmployeeSalaryComponent,
    SalaryRule,
    SalaryStructure,
    SalaryStructureRule,
)
from app.features.time_off.models import LeaveRequest
from app.shared.date_utils import calculate_working_days
from app.shared.enums import (
    AttendanceStatus,
    CalculationType,
    LeaveRequestStatus,
    PayrollIssueSeverity,
    PayrollIssueStatus,
    PayrunEmployeeStatus,
    SalaryComponentValueType,
    SalaryRuleCategory,
)

logger = logging.getLogger("payroll.engine")


class FormulaEvaluator:
    """Safe AST-based arithmetic formula evaluator for salary rules.
    Supports only arithmetic binary operations, constants, and resolved rule codes.
    Never uses eval().
    """

    ALLOWED_OPERATORS = {
        ast.Add: lambda a, b: a + b,
        ast.Sub: lambda a, b: a - b,
        ast.Mult: lambda a, b: a * b,
        ast.Div: lambda a, b: a / b if b != 0 else Decimal("0.00"),
        ast.Mod: lambda a, b: a % b if b != 0 else Decimal("0.00"),
    }

    ALLOWED_UNARY = {
        ast.UAdd: lambda a: +a,
        ast.USub: lambda a: -a,
    }

    @classmethod
    def evaluate(cls, formula_str: str, context: Dict[str, Decimal]) -> Decimal:
        """Parse and evaluate an arithmetic formula expression against rule variables."""
        if not formula_str or not formula_str.strip():
            return Decimal("0.00")

        try:
            tree = ast.parse(formula_str.strip(), mode="eval")
        except SyntaxError as e:
            raise ValueError(f"Syntax error in formula '{formula_str}': {e}")

        return cls._eval_node(tree.body, context)

    @classmethod
    def _eval_node(cls, node: ast.AST, context: Dict[str, Decimal]) -> Decimal:
        if isinstance(node, ast.Constant):
            if isinstance(node.value, (int, float, str)):
                return Decimal(str(node.value))
            raise ValueError(f"Unsupported constant value: {node.value}")

        # Python <3.8 compatibility if Num node present
        if isinstance(node, getattr(ast, "Num", ())) :
            return Decimal(str(node.n))

        if isinstance(node, ast.Name):
            key = node.id
            if key not in context:
                raise ValueError(f"Undefined rule code '{key}' in formula")
            return context[key]

        if isinstance(node, ast.BinOp):
            op_type = type(node.op)
            if op_type not in cls.ALLOWED_OPERATORS:
                raise ValueError(f"Unsupported binary operator: {op_type.__name__}")
            left_val = cls._eval_node(node.left, context)
            right_val = cls._eval_node(node.right, context)
            return cls.ALLOWED_OPERATORS[op_type](left_val, right_val)

        if isinstance(node, ast.UnaryOp):
            op_type = type(node.op)
            if op_type not in cls.ALLOWED_UNARY:
                raise ValueError(f"Unsupported unary operator: {op_type.__name__}")
            operand_val = cls._eval_node(node.operand, context)
            return cls.ALLOWED_UNARY[op_type](operand_val)

        raise ValueError(f"Unsupported expression element: {type(node).__name__}")


class PayrollEngine:

    @classmethod
    async def process_employee(
        cls,
        db: AsyncSession,
        payrun: Payrun,
        payrun_emp: PayrunEmployee,
        slip_seq_num: int,
    ) -> Tuple[PayrunEmployee, List[PayrollValidationIssue], Optional[Payslip]]:
        """Calculate payroll compensation for an individual employee within a payrun."""
        issues: List[PayrollValidationIssue] = []
        org_id = payrun.organization_id
        emp_id = payrun_emp.employee_id

        # Eager load employee profile & details
        stmt_emp = (
            select(Employee)
            .where(Employee.organization_id == org_id, Employee.id == emp_id)
            .options(
                selectinload(Employee.bank_account),
                selectinload(Employee.department),
                selectinload(Employee.designation),
                selectinload(Employee.organization),
            )
        )
        emp = (await db.execute(stmt_emp)).scalar_one_or_none()
        if emp is None:
            issue = PayrollValidationIssue(
                organization_id=org_id,
                payrun_id=payrun.id,
                employee_id=emp_id,
                issue_code="EMPLOYEE_NOT_FOUND",
                category="CONTRACT",
                severity=PayrollIssueSeverity.ERROR,
                title="Employee record not found",
                description="The employee record referenced in this payrun does not exist.",
            )
            issues.append(issue)
            payrun_emp.status = PayrunEmployeeStatus.ISSUE
            payrun_emp.is_ready = False
            return payrun_emp, issues, None

        # =========================================================================
        # Step 1 — Contract lookup
        # =========================================================================
        contract = await ContractRepository.get_active_contract_for_period(
            db, org_id, emp_id, payrun.period_start, payrun.period_end
        )
        if contract is None:
            issue = PayrollValidationIssue(
                organization_id=org_id,
                payrun_id=payrun.id,
                employee_id=emp_id,
                issue_code="NO_ACTIVE_CONTRACT",
                category="CONTRACT",
                severity=PayrollIssueSeverity.ERROR,
                title="No active contract found for period",
                description=(
                    f"Employee {emp.first_name} {emp.last_name} ({emp.employee_code}) has no active "
                    f"contract overlapping the pay period {payrun.period_start} to {payrun.period_end}."
                ),
            )
            issues.append(issue)
            payrun_emp.status = PayrunEmployeeStatus.ISSUE
            payrun_emp.is_ready = False
            return payrun_emp, issues, None

        payrun_emp.contract_id = contract.id

        # =========================================================================
        # Step 2 — Salary structure & rules lookup
        # =========================================================================
        stmt_rules = (
            select(SalaryStructureRule)
            .where(
                SalaryStructureRule.organization_id == org_id,
                SalaryStructureRule.salary_structure_id == contract.salary_structure_id,
                SalaryStructureRule.is_active == True,
            )
            .options(selectinload(SalaryStructureRule.salary_rule))
            .order_by(SalaryStructureRule.sequence.asc())
        )
        structure_rules = (await db.execute(stmt_rules)).scalars().all()
        active_rules = [sr.salary_rule for sr in structure_rules if sr.salary_rule and sr.salary_rule.is_active]

        if not active_rules:
            issue = PayrollValidationIssue(
                organization_id=org_id,
                payrun_id=payrun.id,
                employee_id=emp_id,
                issue_code="NO_SALARY_RULES",
                category="SALARY_CONFIG",
                severity=PayrollIssueSeverity.ERROR,
                title="Salary structure has no active rules",
                description=(
                    f"The salary structure assigned to contract {contract.contract_number} "
                    f"has no active salary rules configured."
                ),
            )
            issues.append(issue)
            payrun_emp.status = PayrunEmployeeStatus.ISSUE
            payrun_emp.is_ready = False
            return payrun_emp, issues, None

        # =========================================================================
        # Step 3 — Attendance & leave aggregation
        # =========================================================================
        # Fetch holidays in period
        stmt_holidays = select(Holiday.date).where(
            Holiday.organization_id == org_id,
            Holiday.date >= payrun.period_start,
            Holiday.date <= payrun.period_end,
        )
        holiday_dates = set((await db.execute(stmt_holidays)).scalars().all())

        expected_working_days = calculate_working_days(
            start_date=payrun.period_start,
            end_date=payrun.period_end,
            employee=emp,
            holiday_dates=holiday_dates,
        )

        # Worked days: distinct attendance dates in period with PRESENT, LATE, or HALF_DAY
        stmt_att = (
            select(func.count(func.distinct(Attendance.date)))
            .where(
                Attendance.organization_id == org_id,
                Attendance.employee_id == emp_id,
                Attendance.date >= payrun.period_start,
                Attendance.date <= payrun.period_end,
                Attendance.status.in_([
                    AttendanceStatus.PRESENT,
                    AttendanceStatus.LATE,
                    AttendanceStatus.HALF_DAY,
                ]),
            )
        )
        worked_days_count = (await db.execute(stmt_att)).scalar() or 0
        worked_days = Decimal(str(worked_days_count))

        # Overtime hours
        stmt_ot = (
            select(func.coalesce(func.sum(Attendance.overtime_hours), 0.00))
            .where(
                Attendance.organization_id == org_id,
                Attendance.employee_id == emp_id,
                Attendance.date >= payrun.period_start,
                Attendance.date <= payrun.period_end,
            )
        )
        overtime_hours = Decimal(str((await db.execute(stmt_ot)).scalar() or "0.00"))

        # Approved Paid Leaves
        stmt_leaves = (
            select(LeaveRequest)
            .where(
                LeaveRequest.organization_id == org_id,
                LeaveRequest.employee_id == emp_id,
                LeaveRequest.status == LeaveRequestStatus.APPROVED,
                LeaveRequest.start_date <= payrun.period_end,
                LeaveRequest.end_date >= payrun.period_start,
            )
            .options(selectinload(LeaveRequest.leave_type))
        )
        leave_requests = (await db.execute(stmt_leaves)).scalars().all()

        leave_days = Decimal("0.0")
        for lr in leave_requests:
            is_paid = lr.leave_type.is_paid if lr.leave_type else True
            if not is_paid:
                continue

            # Gap #4: fully contained vs partial overlap
            if lr.start_date >= payrun.period_start and lr.end_date <= payrun.period_end:
                leave_days += Decimal(str(lr.days))
            else:
                issue = PayrollValidationIssue(
                    organization_id=org_id,
                    payrun_id=payrun.id,
                    employee_id=emp_id,
                    issue_code="PARTIAL_LEAVE_OVERLAP",
                    category="ATTENDANCE",
                    severity=PayrollIssueSeverity.WARNING,
                    title="Leave request partially overlaps payrun period",
                    description=(
                        f"Approved leave from {lr.start_date} to {lr.end_date} ({lr.days} days) "
                        f"crosses the payrun boundary ({payrun.period_start} to {payrun.period_end}). "
                        f"Only fully-contained leave requests are automatically counted."
                    ),
                )
                issues.append(issue)

        payable_days = worked_days + leave_days
        absent_days = max(Decimal("0.0"), expected_working_days - payable_days)

        if expected_working_days > Decimal("0.0"):
            proration_factor = payable_days / expected_working_days
        else:
            proration_factor = Decimal("1.0")

        # =========================================================================
        # Step 4 — Rule evaluation in sequence order
        # =========================================================================
        # Fetch per-employee overrides
        stmt_overrides = select(EmployeeSalaryComponent).where(
            EmployeeSalaryComponent.organization_id == org_id,
            EmployeeSalaryComponent.employee_id == emp_id,
            EmployeeSalaryComponent.is_active == True,
            EmployeeSalaryComponent.effective_from <= payrun.period_end,
            (EmployeeSalaryComponent.effective_to.is_(None)) | (EmployeeSalaryComponent.effective_to >= payrun.period_start),
        )
        overrides_list = (await db.execute(stmt_overrides)).scalars().all()
        overrides_map: Dict[uuid.UUID, EmployeeSalaryComponent] = {o.salary_rule_id: o for o in overrides_list}

        computed: Dict[str, Decimal] = {}
        payslip_lines_data: List[dict] = []

        seq_idx = 1
        for rule in active_rules:
            override = overrides_map.get(rule.id)
            calc_type = rule.calculation_type
            raw_value = Decimal("0.00")
            rate: Optional[Decimal] = None
            base_amount = Decimal("0.00")

            if override is not None:
                if override.value_type == SalaryComponentValueType.FIXED:
                    raw_value = Decimal(str(override.value))
                    base_amount = raw_value
                elif override.value_type == SalaryComponentValueType.PERCENTAGE:
                    rate = Decimal(str(override.value))
                    base_key = rule.percentage_base or "BASIC"
                    if base_key not in computed:
                        issue = PayrollValidationIssue(
                            organization_id=org_id,
                            payrun_id=payrun.id,
                            employee_id=emp_id,
                            issue_code="MISSING_PERCENTAGE_BASE",
                            category="SALARY_CONFIG",
                            severity=PayrollIssueSeverity.ERROR,
                            title=f"Missing base '{base_key}' for rule '{rule.code}'",
                            description=(
                                f"Rule '{rule.code}' depends on base '{base_key}' which has not "
                                f"been computed prior to this sequence."
                            ),
                        )
                        issues.append(issue)
                        payrun_emp.status = PayrunEmployeeStatus.ISSUE
                        payrun_emp.is_ready = False
                        return payrun_emp, issues, None
                    base_amount = computed[base_key]
                    raw_value = base_amount * (rate / Decimal("100"))
            else:
                if calc_type == CalculationType.FIXED:
                    if rule.fixed_amount is not None:
                        raw_value = Decimal(str(rule.fixed_amount))
                    elif rule.category == SalaryRuleCategory.BASIC:
                        raw_value = Decimal(str(contract.base_wage))
                    else:
                        raw_value = Decimal("0.00")
                    base_amount = raw_value

                elif calc_type == CalculationType.PERCENTAGE:
                    rate = Decimal(str(rule.percentage or "0.00"))
                    base_key = rule.percentage_base or "BASIC"
                    if base_key not in computed:
                        issue = PayrollValidationIssue(
                            organization_id=org_id,
                            payrun_id=payrun.id,
                            employee_id=emp_id,
                            issue_code="MISSING_PERCENTAGE_BASE",
                            category="SALARY_CONFIG",
                            severity=PayrollIssueSeverity.ERROR,
                            title=f"Missing base '{base_key}' for rule '{rule.code}'",
                            description=(
                                f"Rule '{rule.code}' depends on base '{base_key}' which has not "
                                f"been computed prior to this sequence."
                            ),
                        )
                        issues.append(issue)
                        payrun_emp.status = PayrunEmployeeStatus.ISSUE
                        payrun_emp.is_ready = False
                        return payrun_emp, issues, None
                    base_amount = computed[base_key]
                    raw_value = base_amount * (rate / Decimal("100"))

                elif calc_type == CalculationType.FORMULA:
                    formula_str = rule.formula or ""
                    try:
                        raw_value = FormulaEvaluator.evaluate(formula_str, computed)
                        base_amount = raw_value
                    except Exception as err:
                        issue = PayrollValidationIssue(
                            organization_id=org_id,
                            payrun_id=payrun.id,
                            employee_id=emp_id,
                            issue_code="FORMULA_EVALUATION_ERROR",
                            category="SALARY_CONFIG",
                            severity=PayrollIssueSeverity.ERROR,
                            title=f"Formula error in rule '{rule.code}'",
                            description=f"Failed evaluating formula '{formula_str}': {err}",
                        )
                        issues.append(issue)
                        payrun_emp.status = PayrunEmployeeStatus.ISSUE
                        payrun_emp.is_ready = False
                        return payrun_emp, issues, None

            # Prorate ONLY for BASIC and ALLOWANCE rules
            category_val = rule.category.value if hasattr(rule.category, "value") else str(rule.category)
            if category_val in (SalaryRuleCategory.BASIC.value, SalaryRuleCategory.ALLOWANCE.value):
                line_amount = round(raw_value * proration_factor, 2)
            else:
                line_amount = round(raw_value, 2)

            computed[rule.code] = line_amount

            payslip_lines_data.append({
                "salary_rule_id": rule.id,
                "name": rule.name,
                "code": rule.code,
                "category": category_val,
                "base_amount": round(base_amount, 2),
                "rate": rate,
                "amount": line_amount,
                "sequence": seq_idx,
            })
            seq_idx += 1

        # =========================================================================
        # Step 5 — Roll-up
        # Assumption: exactly one BASIC-category rule per structure
        # =========================================================================
        basic_lines = [l["amount"] for l in payslip_lines_data if l["category"] == SalaryRuleCategory.BASIC.value]
        basic_salary = sum(basic_lines, Decimal("0.00"))

        gross_rule_lines = [l["amount"] for l in payslip_lines_data if l["category"] == SalaryRuleCategory.GROSS.value]
        if gross_rule_lines:
            gross_salary = gross_rule_lines[0]
        else:
            gross_salary = sum(
                [l["amount"] for l in payslip_lines_data if l["category"] in (SalaryRuleCategory.BASIC.value, SalaryRuleCategory.ALLOWANCE.value)],
                Decimal("0.00"),
            )

        total_earnings = sum(
            [l["amount"] for l in payslip_lines_data if l["category"] in (SalaryRuleCategory.BASIC.value, SalaryRuleCategory.ALLOWANCE.value)],
            Decimal("0.00"),
        )
        total_deductions = sum(
            [l["amount"] for l in payslip_lines_data if l["category"] == SalaryRuleCategory.DEDUCTION.value],
            Decimal("0.00"),
        )

        net_rule_lines = [l["amount"] for l in payslip_lines_data if l["category"] == SalaryRuleCategory.NET.value]
        if net_rule_lines:
            net_salary = net_rule_lines[0]
        else:
            net_salary = gross_salary - total_deductions

        # =========================================================================
        # Step 6 — Additional validation checks
        # =========================================================================
        # Check bank account
        if not emp.bank_account or not emp.bank_account.is_primary:
            issue = PayrollValidationIssue(
                organization_id=org_id,
                payrun_id=payrun.id,
                employee_id=emp_id,
                issue_code="MISSING_BANK_DETAILS",
                category="BANK",
                severity=PayrollIssueSeverity.WARNING,
                title="Missing primary bank details",
                description=(
                    f"Employee {emp.first_name} {emp.last_name} ({emp.employee_code}) has no primary "
                    f"bank account configured for direct disbursement."
                ),
            )
            issues.append(issue)

        # Check duplicate payslip in finalized payruns
        stmt_dup = (
            select(Payslip)
            .join(Payrun, Payslip.payrun_id == Payrun.id)
            .where(
                Payslip.organization_id == org_id,
                Payslip.employee_id == emp_id,
                Payslip.payrun_id != payrun.id,
                Payrun.status == "FINALIZED",
                Payslip.period_start <= payrun.period_end,
                Payslip.period_end >= payrun.period_start,
            )
        )
        dup_slip = (await db.execute(stmt_dup)).scalars().first()
        if dup_slip is not None:
            issue = PayrollValidationIssue(
                organization_id=org_id,
                payrun_id=payrun.id,
                employee_id=emp_id,
                issue_code="DUPLICATE_PAYSLIP",
                category="DUPLICATE",
                severity=PayrollIssueSeverity.WARNING,
                title="Overlapping payslip already finalized",
                description=(
                    f"Employee {emp.first_name} {emp.last_name} already has a payslip ({dup_slip.payslip_number}) "
                    f"in a finalized payrun covering overlapping period {dup_slip.period_start} to {dup_slip.period_end}."
                ),
            )
            issues.append(issue)

        # =========================================================================
        # Step 7 — Persist calculations & generate Payslip + Lines
        # =========================================================================
        has_error = any(i.severity == PayrollIssueSeverity.ERROR for i in issues)

        payrun_emp.payable_days = payable_days
        payrun_emp.worked_days = worked_days
        payrun_emp.leave_days = leave_days
        payrun_emp.absent_days = absent_days
        payrun_emp.overtime_hours = overtime_hours
        payrun_emp.gross_salary = gross_salary
        payrun_emp.total_deductions = total_deductions
        payrun_emp.net_salary = net_salary
        payrun_emp.is_ready = not has_error
        payrun_emp.status = PayrunEmployeeStatus.COMPUTED if not has_error else PayrunEmployeeStatus.ISSUE
        payrun_emp.computed_at = datetime.now(timezone.utc)

        # Generate Payslip & Lines if ready or computed
        payslip_num = f"PS-{payrun.year:04d}-{payrun.month:02d}-{slip_seq_num:04d}"

        payslip = Payslip(
            organization_id=org_id,
            payrun_id=payrun.id,
            employee_id=emp_id,
            contract_id=contract.id,
            payslip_number=payslip_num,
            period_start=payrun.period_start,
            period_end=payrun.period_end,
            basic_salary=basic_salary,
            gross_salary=gross_salary,
            total_earnings=total_earnings,
            total_deductions=total_deductions,
            net_salary=net_salary,
            status="GENERATED",
            generated_at=datetime.now(timezone.utc),
        )

        for ld in payslip_lines_data:
            line = PayslipLine(
                organization_id=org_id,
                salary_rule_id=ld["salary_rule_id"],
                name=ld["name"],
                code=ld["code"],
                category=ld["category"],
                base_amount=ld["base_amount"],
                rate=ld["rate"],
                amount=ld["amount"],
                sequence=ld["sequence"],
            )
            payslip.lines.append(line)

        return payrun_emp, issues, payslip
