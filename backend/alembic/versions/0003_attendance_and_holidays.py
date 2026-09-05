"""Attendance, attendance corrections, holidays migration and attendance system config seeding

Revision ID: 0003_attendance_and_holidays
Revises: 0002_salary_config_and_contracts
Create Date: 2026-09-05 13:30:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
import uuid

# revision identifiers, used by Alembic.
revision = "0003_attendance_and_holidays"
down_revision = "0002_salary_config_and_contracts"
branch_labels = None
depends_on = None


def uuid_col():
    if op.get_context().dialect.name == "postgresql":
        return postgresql.UUID(as_uuid=True)
    return sa.CHAR(36)


def upgrade() -> None:
    # 1. Attendances
    op.create_table(
        "attendances",
        sa.Column("id", uuid_col(), primary_key=True),
        sa.Column("organization_id", uuid_col(), sa.ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False),
        sa.Column("employee_id", uuid_col(), sa.ForeignKey("employees.id", ondelete="CASCADE"), nullable=False),
        sa.Column("date", sa.Date(), nullable=False),
        sa.Column("clock_in", sa.DateTime(timezone=True), nullable=True),
        sa.Column("clock_out", sa.DateTime(timezone=True), nullable=True),
        sa.Column("work_hours", sa.Numeric(5, 2), nullable=True),
        sa.Column("overtime_hours", sa.Numeric(5, 2), server_default="0.00", nullable=False),
        sa.Column("status", sa.String(50), nullable=True),
        sa.Column("source", sa.String(50), server_default="SELF", nullable=False),
        sa.Column("updated_by_id", uuid_col(), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.UniqueConstraint("employee_id", "date", name="uq_attendance_employee_date"),
    )
    op.create_index("ix_attendances_id", "attendances", ["id"], unique=False)
    op.create_index("ix_attendances_org_id", "attendances", ["organization_id"], unique=False)
    op.create_index("ix_attendances_employee_id", "attendances", ["employee_id"], unique=False)
    op.create_index("ix_attendances_date", "attendances", ["date"], unique=False)
    op.create_index("ix_attendances_status", "attendances", ["status"], unique=False)

    # 2. Attendance Corrections
    op.create_table(
        "attendance_corrections",
        sa.Column("id", uuid_col(), primary_key=True),
        sa.Column("organization_id", uuid_col(), sa.ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False),
        sa.Column("attendance_id", uuid_col(), sa.ForeignKey("attendances.id", ondelete="CASCADE"), nullable=False),
        sa.Column("requested_by_id", uuid_col(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("requested_clock_in", sa.DateTime(timezone=True), nullable=True),
        sa.Column("requested_clock_out", sa.DateTime(timezone=True), nullable=True),
        sa.Column("reason", sa.Text(), nullable=False),
        sa.Column("status", sa.String(50), server_default="PENDING", nullable=False),
        sa.Column("reviewed_by_id", uuid_col(), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("review_comment", sa.Text(), nullable=True),
        sa.Column("reviewed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_attendance_corr_id", "attendance_corrections", ["id"], unique=False)
    op.create_index("ix_attendance_corr_org_id", "attendance_corrections", ["organization_id"], unique=False)
    op.create_index("ix_attendance_corr_att_id", "attendance_corrections", ["attendance_id"], unique=False)
    op.create_index("ix_attendance_corr_req_by", "attendance_corrections", ["requested_by_id"], unique=False)
    op.create_index("ix_attendance_corr_status", "attendance_corrections", ["status"], unique=False)

    # 3. Holidays
    op.create_table(
        "holidays",
        sa.Column("id", uuid_col(), primary_key=True),
        sa.Column("organization_id", uuid_col(), sa.ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("date", sa.Date(), nullable=False),
        sa.Column("type", sa.String(50), server_default="PUBLIC", nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("is_paid", sa.Boolean(), server_default=sa.text("true"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.UniqueConstraint("organization_id", "date", name="uq_org_holiday_date"),
    )
    op.create_index("ix_holidays_id", "holidays", ["id"], unique=False)
    op.create_index("ix_holidays_org_id", "holidays", ["organization_id"], unique=False)
    op.create_index("ix_holidays_date", "holidays", ["date"], unique=False)

    # 4. Seed default system config for existing organizations
    bind = op.get_bind()
    org_res = bind.execute(sa.text("SELECT id FROM organizations")).fetchall()
    for row in org_res:
        org_id = row[0]
        cfg_id = str(uuid.uuid4())
        bind.execute(
            sa.text(
                "INSERT INTO system_configs (id, organization_id, key, value, category, description, created_at, updated_at) "
                "VALUES (:id, :org_id, 'attendance.late_grace_minutes', '10', 'attendance', 'Grace period in minutes before marking attendance as late', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)"
            ),
            {"id": cfg_id, "org_id": org_id},
        )


def downgrade() -> None:
    op.drop_table("holidays")
    op.drop_table("attendance_corrections")
    op.drop_table("attendances")
