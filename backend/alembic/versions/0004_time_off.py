"""Time off: leave types, leave allocations, and leave requests

Revision ID: 0004_time_off
Revises: 0003_attendance_and_holidays
Create Date: 2026-09-05 15:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = "0004_time_off"
down_revision = "0003_attendance_and_holidays"
branch_labels = None
depends_on = None


def uuid_col():
    if op.get_context().dialect.name == "postgresql":
        return postgresql.UUID(as_uuid=True)
    return sa.CHAR(36)


def upgrade() -> None:
    # 1. Leave Types
    op.create_table(
        "leave_types",
        sa.Column("id", uuid_col(), primary_key=True),
        sa.Column("organization_id", uuid_col(), sa.ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False),
        sa.Column("name", sa.String(100), nullable=False),
        sa.Column("code", sa.String(50), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("default_days", sa.Numeric(5, 1), nullable=False),
        sa.Column("is_paid", sa.Boolean(), server_default=sa.text("true"), nullable=False),
        sa.Column("carry_forward", sa.Boolean(), server_default=sa.text("false"), nullable=False),
        sa.Column("max_carry_forward", sa.Numeric(5, 1), nullable=True),
        sa.Column("requires_approval", sa.Boolean(), server_default=sa.text("true"), nullable=False),
        sa.Column("is_active", sa.Boolean(), server_default=sa.text("true"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.UniqueConstraint("organization_id", "code", name="uq_org_leave_type_code"),
    )
    op.create_index("ix_leave_types_id", "leave_types", ["id"], unique=False)
    op.create_index("ix_leave_types_org_id", "leave_types", ["organization_id"], unique=False)
    op.create_index("ix_leave_types_code", "leave_types", ["code"], unique=False)

    # 2. Leave Allocations
    op.create_table(
        "leave_allocations",
        sa.Column("id", uuid_col(), primary_key=True),
        sa.Column("organization_id", uuid_col(), sa.ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False),
        sa.Column("employee_id", uuid_col(), sa.ForeignKey("employees.id", ondelete="CASCADE"), nullable=False),
        sa.Column("leave_type_id", uuid_col(), sa.ForeignKey("leave_types.id", ondelete="CASCADE"), nullable=False),
        sa.Column("year", sa.Integer(), nullable=False),
        sa.Column("allocated_days", sa.Numeric(5, 1), nullable=False),
        sa.Column("used_days", sa.Numeric(5, 1), server_default="0.0", nullable=False),
        sa.Column("remaining_days", sa.Numeric(5, 1), nullable=False),
        sa.Column("allocated_by_id", uuid_col(), sa.ForeignKey("users.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.UniqueConstraint("organization_id", "employee_id", "leave_type_id", "year", name="uq_leave_alloc_emp_type_year"),
    )
    op.create_index("ix_leave_alloc_id", "leave_allocations", ["id"], unique=False)
    op.create_index("ix_leave_alloc_org_id", "leave_allocations", ["organization_id"], unique=False)
    op.create_index("ix_leave_alloc_emp_id", "leave_allocations", ["employee_id"], unique=False)
    op.create_index("ix_leave_alloc_type_id", "leave_allocations", ["leave_type_id"], unique=False)
    op.create_index("ix_leave_alloc_year", "leave_allocations", ["year"], unique=False)

    # 3. Leave Requests
    op.create_table(
        "leave_requests",
        sa.Column("id", uuid_col(), primary_key=True),
        sa.Column("organization_id", uuid_col(), sa.ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False),
        sa.Column("employee_id", uuid_col(), sa.ForeignKey("employees.id", ondelete="CASCADE"), nullable=False),
        sa.Column("leave_type_id", uuid_col(), sa.ForeignKey("leave_types.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("start_date", sa.Date(), nullable=False),
        sa.Column("end_date", sa.Date(), nullable=False),
        sa.Column("days", sa.Numeric(5, 1), nullable=False),
        sa.Column("reason", sa.Text(), nullable=False),
        sa.Column("status", sa.String(50), server_default="PENDING", nullable=False),
        sa.Column("reviewed_by_id", uuid_col(), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("review_comment", sa.Text(), nullable=True),
        sa.Column("reviewed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_leave_req_id", "leave_requests", ["id"], unique=False)
    op.create_index("ix_leave_req_org_id", "leave_requests", ["organization_id"], unique=False)
    op.create_index("ix_leave_req_emp_id", "leave_requests", ["employee_id"], unique=False)
    op.create_index("ix_leave_req_type_id", "leave_requests", ["leave_type_id"], unique=False)
    op.create_index("ix_leave_req_status", "leave_requests", ["status"], unique=False)
    op.create_index("ix_leave_req_start_date", "leave_requests", ["start_date"], unique=False)
    op.create_index("ix_leave_req_end_date", "leave_requests", ["end_date"], unique=False)


def downgrade() -> None:
    op.drop_table("leave_requests")
    op.drop_table("leave_allocations")
    op.drop_table("leave_types")
