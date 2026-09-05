"""add must_change_password to users table

Revision ID: 0007_add_must_change_password
Revises: 0006_dashboard_audit_notifications
Create Date: 2026-09-05 20:10:00.000000

"""
from alembic import op
import sqlalchemy as sa


revision = "0007_add_must_change_password"
down_revision = "0006_dashboard_audit_notifications"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "users",
        sa.Column("must_change_password", sa.Boolean(), server_default="0", nullable=False),
    )


def downgrade() -> None:
    op.drop_column("users", "must_change_password")
