"""Payroll Engine: payruns, payrun_employees, payroll_validation_issues, payslips, payslip_lines, payslip_deliveries

Revision ID: 0005_payroll_engine
Revises: 0004_time_off
Create Date: 2026-09-05 15:30:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = "0005_payroll_engine"
down_revision = "0004_time_off"
branch_labels = None
depends_on = None


def uuid_col():
    if op.get_context().dialect.name == "postgresql":
        return postgresql.UUID(as_uuid=True)
    return sa.CHAR(36)


def upgrade() -> None:
    # 1. Payruns
    op.create_table(
        "payruns",
        sa.Column("id", uuid_col(), primary_key=True),
        sa.Column("organization_id", uuid_col(), sa.ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("period_start", sa.Date(), nullable=False),
        sa.Column("period_end", sa.Date(), nullable=False),
        sa.Column("month", sa.Integer(), nullable=False),
        sa.Column("year", sa.Integer(), nullable=False),
        sa.Column("status", sa.String(50), server_default="DRAFT", nullable=False),
        sa.Column("total_employees", sa.Integer(), server_default="0", nullable=False),
        sa.Column("processed_employees", sa.Integer(), server_default="0", nullable=False),
        sa.Column("issue_count", sa.Integer(), server_default="0", nullable=False),
        sa.Column("total_gross", sa.Numeric(14, 2), server_default="0.00", nullable=False),
        sa.Column("total_deductions", sa.Numeric(14, 2), server_default="0.00", nullable=False),
        sa.Column("total_net", sa.Numeric(14, 2), server_default="0.00", nullable=False),
        sa.Column("created_by_id", uuid_col(), sa.ForeignKey("users.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("finalized_by_id", uuid_col(), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("computed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("finalized_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_payruns_id", "payruns", ["id"], unique=False)
    op.create_index("ix_payruns_org_id", "payruns", ["organization_id"], unique=False)
    op.create_index("ix_payruns_status", "payruns", ["status"], unique=False)
    op.create_index("ix_payruns_year_month", "payruns", ["year", "month"], unique=False)

    # 2. Payrun Employees
    op.create_table(
        "payrun_employees",
        sa.Column("id", uuid_col(), primary_key=True),
        sa.Column("organization_id", uuid_col(), sa.ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False),
        sa.Column("payrun_id", uuid_col(), sa.ForeignKey("payruns.id", ondelete="CASCADE"), nullable=False),
        sa.Column("employee_id", uuid_col(), sa.ForeignKey("employees.id", ondelete="CASCADE"), nullable=False),
        sa.Column("contract_id", uuid_col(), sa.ForeignKey("contracts.id", ondelete="SET NULL"), nullable=True),
        sa.Column("status", sa.String(50), server_default="PENDING", nullable=False),
        sa.Column("payable_days", sa.Numeric(5, 1), server_default="0.0", nullable=False),
        sa.Column("worked_days", sa.Numeric(5, 1), server_default="0.0", nullable=False),
        sa.Column("leave_days", sa.Numeric(5, 1), server_default="0.0", nullable=False),
        sa.Column("absent_days", sa.Numeric(5, 1), server_default="0.0", nullable=False),
        sa.Column("overtime_hours", sa.Numeric(6, 2), server_default="0.00", nullable=False),
        sa.Column("gross_salary", sa.Numeric(12, 2), server_default="0.00", nullable=False),
        sa.Column("total_deductions", sa.Numeric(12, 2), server_default="0.00", nullable=False),
        sa.Column("net_salary", sa.Numeric(12, 2), server_default="0.00", nullable=False),
        sa.Column("is_ready", sa.Boolean(), server_default=sa.text("true"), nullable=False),
        sa.Column("computed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.UniqueConstraint("payrun_id", "employee_id", name="uq_payrun_employee"),
    )
    op.create_index("ix_payrun_emp_id", "payrun_employees", ["id"], unique=False)
    op.create_index("ix_payrun_emp_org_id", "payrun_employees", ["organization_id"], unique=False)
    op.create_index("ix_payrun_emp_payrun_id", "payrun_employees", ["payrun_id"], unique=False)
    op.create_index("ix_payrun_emp_emp_id", "payrun_employees", ["employee_id"], unique=False)
    op.create_index("ix_payrun_emp_status", "payrun_employees", ["status"], unique=False)

    # 3. Payroll Validation Issues
    op.create_table(
        "payroll_validation_issues",
        sa.Column("id", uuid_col(), primary_key=True),
        sa.Column("organization_id", uuid_col(), sa.ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False),
        sa.Column("payrun_id", uuid_col(), sa.ForeignKey("payruns.id", ondelete="CASCADE"), nullable=False),
        sa.Column("employee_id", uuid_col(), sa.ForeignKey("employees.id", ondelete="CASCADE"), nullable=True),
        sa.Column("issue_code", sa.String(100), nullable=False),
        sa.Column("category", sa.String(50), nullable=False),
        sa.Column("severity", sa.String(50), server_default="WARNING", nullable=False),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("status", sa.String(50), server_default="OPEN", nullable=False),
        sa.Column("resolution", sa.Text(), nullable=True),
        sa.Column("resolved_by_id", uuid_col(), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("resolved_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_payroll_issues_id", "payroll_validation_issues", ["id"], unique=False)
    op.create_index("ix_payroll_issues_org_id", "payroll_validation_issues", ["organization_id"], unique=False)
    op.create_index("ix_payroll_issues_payrun_id", "payroll_validation_issues", ["payrun_id"], unique=False)
    op.create_index("ix_payroll_issues_emp_id", "payroll_validation_issues", ["employee_id"], unique=False)
    op.create_index("ix_payroll_issues_severity", "payroll_validation_issues", ["severity"], unique=False)
    op.create_index("ix_payroll_issues_status", "payroll_validation_issues", ["status"], unique=False)

    # 4. Payslips
    op.create_table(
        "payslips",
        sa.Column("id", uuid_col(), primary_key=True),
        sa.Column("organization_id", uuid_col(), sa.ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False),
        sa.Column("payrun_id", uuid_col(), sa.ForeignKey("payruns.id", ondelete="CASCADE"), nullable=False),
        sa.Column("employee_id", uuid_col(), sa.ForeignKey("employees.id", ondelete="CASCADE"), nullable=False),
        sa.Column("contract_id", uuid_col(), sa.ForeignKey("contracts.id", ondelete="SET NULL"), nullable=True),
        sa.Column("payslip_number", sa.String(100), nullable=False),
        sa.Column("period_start", sa.Date(), nullable=False),
        sa.Column("period_end", sa.Date(), nullable=False),
        sa.Column("basic_salary", sa.Numeric(12, 2), server_default="0.00", nullable=False),
        sa.Column("gross_salary", sa.Numeric(12, 2), server_default="0.00", nullable=False),
        sa.Column("total_earnings", sa.Numeric(12, 2), server_default="0.00", nullable=False),
        sa.Column("total_deductions", sa.Numeric(12, 2), server_default="0.00", nullable=False),
        sa.Column("net_salary", sa.Numeric(12, 2), server_default="0.00", nullable=False),
        sa.Column("status", sa.String(50), server_default="GENERATED", nullable=False),
        sa.Column("pdf_url", sa.String(500), nullable=True),
        sa.Column("generated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("sent_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("paid_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.UniqueConstraint("organization_id", "payslip_number", name="uq_org_payslip_number"),
    )
    op.create_index("ix_payslips_id", "payslips", ["id"], unique=False)
    op.create_index("ix_payslips_org_id", "payslips", ["organization_id"], unique=False)
    op.create_index("ix_payslips_payrun_id", "payslips", ["payrun_id"], unique=False)
    op.create_index("ix_payslips_emp_id", "payslips", ["employee_id"], unique=False)
    op.create_index("ix_payslips_number", "payslips", ["payslip_number"], unique=False)
    op.create_index("ix_payslips_status", "payslips", ["status"], unique=False)

    # 5. Payslip Lines
    op.create_table(
        "payslip_lines",
        sa.Column("id", uuid_col(), primary_key=True),
        sa.Column("organization_id", uuid_col(), sa.ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False),
        sa.Column("payslip_id", uuid_col(), sa.ForeignKey("payslips.id", ondelete="CASCADE"), nullable=False),
        sa.Column("salary_rule_id", uuid_col(), sa.ForeignKey("salary_rules.id", ondelete="SET NULL"), nullable=True),
        sa.Column("name", sa.String(100), nullable=False),
        sa.Column("code", sa.String(50), nullable=False),
        sa.Column("category", sa.String(50), nullable=False),
        sa.Column("base_amount", sa.Numeric(12, 2), server_default="0.00", nullable=False),
        sa.Column("rate", sa.Numeric(5, 2), nullable=True),
        sa.Column("amount", sa.Numeric(12, 2), nullable=False),
        sa.Column("sequence", sa.Integer(), server_default="1", nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_payslip_lines_id", "payslip_lines", ["id"], unique=False)
    op.create_index("ix_payslip_lines_org_id", "payslip_lines", ["organization_id"], unique=False)
    op.create_index("ix_payslip_lines_payslip_id", "payslip_lines", ["payslip_id"], unique=False)

    # 6. Payslip Deliveries
    op.create_table(
        "payslip_deliveries",
        sa.Column("id", uuid_col(), primary_key=True),
        sa.Column("organization_id", uuid_col(), sa.ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False),
        sa.Column("payslip_id", uuid_col(), sa.ForeignKey("payslips.id", ondelete="CASCADE"), nullable=False),
        sa.Column("recipient_email", sa.String(255), nullable=False),
        sa.Column("delivery_type", sa.String(50), server_default="EMAIL", nullable=False),
        sa.Column("status", sa.String(50), server_default="PENDING", nullable=False),
        sa.Column("sent_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("failure_reason", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_payslip_del_id", "payslip_deliveries", ["id"], unique=False)
    op.create_index("ix_payslip_del_org_id", "payslip_deliveries", ["organization_id"], unique=False)
    op.create_index("ix_payslip_del_payslip_id", "payslip_deliveries", ["payslip_id"], unique=False)
    op.create_index("ix_payslip_del_status", "payslip_deliveries", ["status"], unique=False)


def downgrade() -> None:
    op.drop_table("payslip_deliveries")
    op.drop_table("payslip_lines")
    op.drop_table("payslips")
    op.drop_table("payroll_validation_issues")
    op.drop_table("payrun_employees")
    op.drop_table("payruns")
