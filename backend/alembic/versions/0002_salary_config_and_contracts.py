"""Salary config, salary rules, salary structures, employee salary components, and contracts migration

Revision ID: 0002_salary_config_and_contracts
Revises: 0001_initial
Create Date: 2026-09-05 12:30:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = "0002_salary_config_and_contracts"
down_revision = "0001_initial"
branch_labels = None
depends_on = None


def uuid_col():
    if op.get_context().dialect.name == "postgresql":
        return postgresql.UUID(as_uuid=True)
    return sa.CHAR(36)


def upgrade() -> None:
    # 1. System Configs
    op.create_table(
        "system_configs",
        sa.Column("id", uuid_col(), primary_key=True),
        sa.Column("organization_id", uuid_col(), sa.ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False),
        sa.Column("key", sa.String(100), nullable=False),
        sa.Column("value", sa.Text(), nullable=False),
        sa.Column("category", sa.String(50), server_default="payroll", nullable=False),
        sa.Column("description", sa.String(255), nullable=True),
        sa.Column("updated_by_id", uuid_col(), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.UniqueConstraint("organization_id", "key", name="uq_org_system_config_key"),
    )
    op.create_index("ix_system_configs_id", "system_configs", ["id"], unique=False)
    op.create_index("ix_system_configs_org_id", "system_configs", ["organization_id"], unique=False)
    op.create_index("ix_system_configs_key", "system_configs", ["key"], unique=False)
    op.create_index("ix_system_configs_category", "system_configs", ["category"], unique=False)

    # 2. Salary Structures
    op.create_table(
        "salary_structures",
        sa.Column("id", uuid_col(), primary_key=True),
        sa.Column("organization_id", uuid_col(), sa.ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False),
        sa.Column("name", sa.String(100), nullable=False),
        sa.Column("code", sa.String(50), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("is_default", sa.Boolean(), server_default=sa.text("false"), nullable=False),
        sa.Column("is_active", sa.Boolean(), server_default=sa.text("true"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.UniqueConstraint("organization_id", "code", name="uq_org_salary_structure_code"),
    )
    op.create_index("ix_salary_structures_id", "salary_structures", ["id"], unique=False)
    op.create_index("ix_salary_structures_org_id", "salary_structures", ["organization_id"], unique=False)
    op.create_index("ix_salary_structures_code", "salary_structures", ["code"], unique=False)

    # 3. Salary Rules
    op.create_table(
        "salary_rules",
        sa.Column("id", uuid_col(), primary_key=True),
        sa.Column("organization_id", uuid_col(), sa.ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False),
        sa.Column("name", sa.String(100), nullable=False),
        sa.Column("code", sa.String(50), nullable=False),
        sa.Column("category", sa.String(50), nullable=False),
        sa.Column("calculation_type", sa.String(50), nullable=False),
        sa.Column("fixed_amount", sa.Numeric(12, 2), nullable=True),
        sa.Column("percentage", sa.Numeric(5, 2), nullable=True),
        sa.Column("percentage_base", sa.String(50), nullable=True),
        sa.Column("formula", sa.Text(), nullable=True),
        sa.Column("sequence", sa.Integer(), server_default="1", nullable=False),
        sa.Column("taxable", sa.Boolean(), server_default=sa.text("true"), nullable=False),
        sa.Column("is_statutory", sa.Boolean(), server_default=sa.text("false"), nullable=False),
        sa.Column("is_active", sa.Boolean(), server_default=sa.text("true"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.UniqueConstraint("organization_id", "code", name="uq_org_salary_rule_code"),
    )
    op.create_index("ix_salary_rules_id", "salary_rules", ["id"], unique=False)
    op.create_index("ix_salary_rules_org_id", "salary_rules", ["organization_id"], unique=False)
    op.create_index("ix_salary_rules_code", "salary_rules", ["code"], unique=False)

    # 4. Salary Structure Rules (Join Table)
    op.create_table(
        "salary_structure_rules",
        sa.Column("id", uuid_col(), primary_key=True),
        sa.Column("organization_id", uuid_col(), sa.ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False),
        sa.Column("salary_structure_id", uuid_col(), sa.ForeignKey("salary_structures.id", ondelete="CASCADE"), nullable=False),
        sa.Column("salary_rule_id", uuid_col(), sa.ForeignKey("salary_rules.id", ondelete="CASCADE"), nullable=False),
        sa.Column("sequence", sa.Integer(), server_default="1", nullable=False),
        sa.Column("is_active", sa.Boolean(), server_default=sa.text("true"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.UniqueConstraint("salary_structure_id", "salary_rule_id", name="uq_structure_rule"),
    )
    op.create_index("ix_salary_structure_rules_id", "salary_structure_rules", ["id"], unique=False)
    op.create_index("ix_salary_structure_rules_structure_id", "salary_structure_rules", ["salary_structure_id"], unique=False)
    op.create_index("ix_salary_structure_rules_rule_id", "salary_structure_rules", ["salary_rule_id"], unique=False)

    # 5. Employee Salary Components
    op.create_table(
        "employee_salary_components",
        sa.Column("id", uuid_col(), primary_key=True),
        sa.Column("organization_id", uuid_col(), sa.ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False),
        sa.Column("employee_id", uuid_col(), sa.ForeignKey("employees.id", ondelete="CASCADE"), nullable=False),
        sa.Column("salary_rule_id", uuid_col(), sa.ForeignKey("salary_rules.id", ondelete="CASCADE"), nullable=False),
        sa.Column("value", sa.Numeric(12, 2), nullable=False),
        sa.Column("value_type", sa.String(50), nullable=False),
        sa.Column("effective_from", sa.Date(), nullable=False),
        sa.Column("effective_to", sa.Date(), nullable=True),
        sa.Column("is_active", sa.Boolean(), server_default=sa.text("true"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_emp_sal_comp_id", "employee_salary_components", ["id"], unique=False)
    op.create_index("ix_emp_sal_comp_employee_id", "employee_salary_components", ["employee_id"], unique=False)
    op.create_index("ix_emp_sal_comp_rule_id", "employee_salary_components", ["salary_rule_id"], unique=False)

    # 6. Contracts
    op.create_table(
        "contracts",
        sa.Column("id", uuid_col(), primary_key=True),
        sa.Column("organization_id", uuid_col(), sa.ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False),
        sa.Column("employee_id", uuid_col(), sa.ForeignKey("employees.id", ondelete="CASCADE"), nullable=False),
        sa.Column("working_schedule_id", uuid_col(), nullable=True),
        sa.Column("salary_structure_id", uuid_col(), sa.ForeignKey("salary_structures.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("contract_number", sa.String(50), nullable=False),
        sa.Column("contract_type", sa.String(50), server_default="PERMANENT", nullable=False),
        sa.Column("start_date", sa.Date(), nullable=False),
        sa.Column("end_date", sa.Date(), nullable=True),
        sa.Column("base_wage", sa.Numeric(12, 2), nullable=False),
        sa.Column("wage_type", sa.String(50), server_default="MONTHLY", nullable=False),
        sa.Column("status", sa.String(50), server_default="DRAFT", nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.UniqueConstraint("organization_id", "contract_number", name="uq_org_contract_number"),
    )
    op.create_index("ix_contracts_id", "contracts", ["id"], unique=False)
    op.create_index("ix_contracts_org_id", "contracts", ["organization_id"], unique=False)
    op.create_index("ix_contracts_employee_id", "contracts", ["employee_id"], unique=False)
    op.create_index("ix_contracts_contract_number", "contracts", ["contract_number"], unique=False)


def downgrade() -> None:
    op.drop_table("contracts")
    op.drop_table("employee_salary_components")
    op.drop_table("salary_structure_rules")
    op.drop_table("salary_rules")
    op.drop_table("salary_structures")
    op.drop_table("system_configs")
