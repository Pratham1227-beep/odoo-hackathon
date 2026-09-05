"""Initial migration: organizations and users tables

Revision ID: 0001_initial
Revises: 
Create Date: 2026-09-05 11:10:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = "0001_initial"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # 1. Create organizations table
    op.create_table(
        "organizations",
        sa.Column("id", sa.CHAR(36) if op.get_context().dialect.name != "postgresql" else postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()") if op.get_context().dialect.name == "postgresql" else None),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("code", sa.String(50), nullable=False),
        sa.Column("email", sa.String(255), nullable=False),
        sa.Column("phone", sa.String(50), nullable=True),
        sa.Column("currency", sa.String(10), server_default="INR", nullable=False),
        sa.Column("timezone", sa.String(50), server_default="Asia/Kolkata", nullable=False),
        sa.Column("country", sa.String(100), server_default="India", nullable=False),
        sa.Column("address", sa.String(500), nullable=True),
        sa.Column("logo_url", sa.String(500), nullable=True),
        sa.Column("status", sa.String(50), server_default="ACTIVE", nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_organizations_id", "organizations", ["id"], unique=False)
    op.create_index("ix_organizations_code", "organizations", ["code"], unique=True)

    # 2. Create users table
    op.create_table(
        "users",
        sa.Column("id", sa.CHAR(36) if op.get_context().dialect.name != "postgresql" else postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()") if op.get_context().dialect.name == "postgresql" else None),
        sa.Column("organization_id", sa.CHAR(36) if op.get_context().dialect.name != "postgresql" else postgresql.UUID(as_uuid=True), sa.ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False),
        sa.Column("email", sa.String(255), nullable=False),
        sa.Column("password_hash", sa.String(255), nullable=False),
        sa.Column("role", sa.String(50), server_default="EMPLOYEE", nullable=False),
        sa.Column("status", sa.String(50), server_default="ACTIVE", nullable=False),
        sa.Column("token_version", sa.Integer(), server_default="0", nullable=False),
        sa.Column("must_change_password", sa.Boolean(), server_default="0", nullable=False),
        sa.Column("last_login", sa.DateTime(timezone=True), nullable=True),
        sa.Column("otp_code_hash", sa.String(255), nullable=True),
        sa.Column("otp_expires_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_users_id", "users", ["id"], unique=False)
    op.create_index("ix_users_email", "users", ["email"], unique=True)
    op.create_index("ix_users_organization_id", "users", ["organization_id"], unique=False)


def downgrade() -> None:
    op.drop_table("users")
    op.drop_table("organizations")
