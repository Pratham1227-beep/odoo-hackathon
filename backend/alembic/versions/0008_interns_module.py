"""Add interns, intern_goals, and intern_reviews tables

Revision ID: 0008_interns_module
Revises: 0007_add_must_change_password
Create Date: 2026-09-06 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


revision = "0008_interns_module"
down_revision = "0007_add_must_change_password"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # -----------------------------------------------------------------
    # interns table
    # -----------------------------------------------------------------
    op.create_table(
        "interns",
        sa.Column("id", sa.CHAR(36), primary_key=True, nullable=False),
        sa.Column("organization_id", sa.CHAR(36), sa.ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("employee_id", sa.CHAR(36), sa.ForeignKey("employees.id", ondelete="CASCADE"), nullable=False, unique=True, index=True),
        sa.Column("mentor_id", sa.CHAR(36), sa.ForeignKey("employees.id", ondelete="SET NULL"), nullable=True, index=True),
        # Academic / education info
        sa.Column("college_name", sa.String(255), nullable=True),
        sa.Column("course", sa.String(255), nullable=True),
        sa.Column("graduation_year", sa.Integer(), nullable=True),
        # Internship details
        sa.Column("internship_domain", sa.String(100), nullable=False, server_default="Software Engineering"),
        sa.Column("internship_type", sa.String(20), nullable=False, server_default="STIPEND"),
        sa.Column("start_date", sa.Date(), nullable=False),
        sa.Column("end_date", sa.Date(), nullable=False),
        sa.Column("stipend", sa.Float(), nullable=False, server_default="0.0"),
        # Status tracking
        sa.Column("status", sa.String(20), nullable=False, server_default="ACTIVE", index=True),
        sa.Column("current_goal", sa.String(255), nullable=True),
        # Performance / review summary
        sa.Column("final_rating", sa.Float(), nullable=True),
        sa.Column("mentor_feedback", sa.Text(), nullable=True),
        sa.Column("final_feedback", sa.Text(), nullable=True),
        # Conversion lifecycle
        sa.Column("conversion_status", sa.String(20), nullable=False, server_default="NOT_REVIEWED", index=True),
        # Timestamps
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_interns_org_status", "interns", ["organization_id", "status"])

    # -----------------------------------------------------------------
    # intern_goals table
    # -----------------------------------------------------------------
    op.create_table(
        "intern_goals",
        sa.Column("id", sa.CHAR(36), primary_key=True, nullable=False),
        sa.Column("organization_id", sa.CHAR(36), sa.ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("intern_id", sa.CHAR(36), sa.ForeignKey("interns.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("status", sa.String(20), nullable=False, server_default="TODO"),
        sa.Column("due_date", sa.Date(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    # -----------------------------------------------------------------
    # intern_reviews table
    # -----------------------------------------------------------------
    op.create_table(
        "intern_reviews",
        sa.Column("id", sa.CHAR(36), primary_key=True, nullable=False),
        sa.Column("organization_id", sa.CHAR(36), sa.ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("intern_id", sa.CHAR(36), sa.ForeignKey("interns.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("review_type", sa.String(20), nullable=False, server_default="MID_TERM"),
        sa.Column("technical_skills", sa.Float(), nullable=False, server_default="5.0"),
        sa.Column("communication", sa.Float(), nullable=False, server_default="5.0"),
        sa.Column("problem_solving", sa.Float(), nullable=False, server_default="5.0"),
        sa.Column("teamwork", sa.Float(), nullable=False, server_default="5.0"),
        sa.Column("learning_ability", sa.Float(), nullable=False, server_default="5.0"),
        sa.Column("overall_rating", sa.Float(), nullable=False, server_default="5.0"),
        sa.Column("feedback", sa.Text(), nullable=True),
        sa.Column("created_by", sa.CHAR(36), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )


def downgrade() -> None:
    op.drop_table("intern_reviews")
    op.drop_table("intern_goals")
    op.drop_index("ix_interns_org_status", "interns")
    op.drop_table("interns")
