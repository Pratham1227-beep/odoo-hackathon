"""Dashboard, Audit Logs, and Notifications

Revision ID: 0006_dashboard_audit_notifications
Revises: 0005_payroll_engine
Create Date: 2026-09-05 16:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = "0006_dashboard_audit_notifications"
down_revision = "0005_payroll_engine"
branch_labels = None
depends_on = None


def uuid_col():
    if op.get_context().dialect.name == "postgresql":
        return postgresql.UUID(as_uuid=True)
    return sa.CHAR(36)


def upgrade() -> None:
    # 1. Analytics Snapshots
    op.create_table(
        "analytics_snapshots",
        sa.Column("id", uuid_col(), primary_key=True),
        sa.Column("organization_id", uuid_col(), sa.ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False),
        sa.Column("type", sa.String(100), server_default="PAYROLL_MONTHLY", nullable=False),
        sa.Column("date", sa.Date(), nullable=False),
        sa.Column("data", sa.Text(), nullable=False),
        sa.Column("metadata", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_analytics_snapshots_id", "analytics_snapshots", ["id"], unique=False)
    op.create_index("ix_analytics_snapshots_org_id", "analytics_snapshots", ["organization_id"], unique=False)
    op.create_index("ix_analytics_snapshots_type", "analytics_snapshots", ["type"], unique=False)
    op.create_index("ix_analytics_snapshots_date", "analytics_snapshots", ["date"], unique=False)

    # 2. Notifications
    op.create_table(
        "notifications",
        sa.Column("id", uuid_col(), primary_key=True),
        sa.Column("organization_id", uuid_col(), sa.ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False),
        sa.Column("recipient_id", uuid_col(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("message", sa.Text(), nullable=False),
        sa.Column("type", sa.String(100), nullable=False),
        sa.Column("severity", sa.String(50), server_default="INFO", nullable=False),
        sa.Column("is_read", sa.Boolean(), server_default=sa.text("false"), nullable=False),
        sa.Column("link", sa.String(500), nullable=True),
        sa.Column("read_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_notifications_id", "notifications", ["id"], unique=False)
    op.create_index("ix_notifications_org_id", "notifications", ["organization_id"], unique=False)
    op.create_index("ix_notifications_recipient_id", "notifications", ["recipient_id"], unique=False)
    op.create_index("ix_notifications_type", "notifications", ["type"], unique=False)
    op.create_index("ix_notifications_is_read", "notifications", ["is_read"], unique=False)

    # 3. Audit Logs
    op.create_table(
        "audit_logs",
        sa.Column("id", uuid_col(), primary_key=True),
        sa.Column("organization_id", uuid_col(), sa.ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False),
        sa.Column("user_id", uuid_col(), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("action", sa.String(100), nullable=False),
        sa.Column("module", sa.String(100), nullable=False),
        sa.Column("resource_type", sa.String(100), nullable=False),
        sa.Column("resource_id", uuid_col(), nullable=True),
        sa.Column("before", sa.Text(), nullable=True),
        sa.Column("after", sa.Text(), nullable=True),
        sa.Column("ip_address", sa.String(100), nullable=True),
        sa.Column("user_agent", sa.String(500), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_audit_logs_id", "audit_logs", ["id"], unique=False)
    op.create_index("ix_audit_logs_org_id", "audit_logs", ["organization_id"], unique=False)
    op.create_index("ix_audit_logs_user_id", "audit_logs", ["user_id"], unique=False)
    op.create_index("ix_audit_logs_action", "audit_logs", ["action"], unique=False)
    op.create_index("ix_audit_logs_module", "audit_logs", ["module"], unique=False)
    op.create_index("ix_audit_logs_resource_type", "audit_logs", ["resource_type"], unique=False)
    op.create_index("ix_audit_logs_resource_id", "audit_logs", ["resource_id"], unique=False)


def downgrade() -> None:
    op.drop_table("audit_logs")
    op.drop_table("notifications")
    op.drop_table("analytics_snapshots")
