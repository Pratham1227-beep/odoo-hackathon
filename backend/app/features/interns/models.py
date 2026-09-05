import uuid
from datetime import date, datetime
from typing import List, Optional
from sqlalchemy import (
    Date,
    Enum as SAEnum,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.shared.base_model import GUID, OrgScopedModel
from app.shared.enums import (
    ConversionStatus,
    GoalStatus,
    InternshipStatus,
    InternshipType,
    ReviewType,
)


class Intern(OrgScopedModel):
    """Intern model tracking internship-specific details linked to an existing Employee."""
    __tablename__ = "interns"

    employee_id: Mapped[uuid.UUID] = mapped_column(
        GUID(),
        ForeignKey("employees.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
        index=True,
    )
    mentor_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        GUID(),
        ForeignKey("employees.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    college_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    course: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    graduation_year: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    internship_domain: Mapped[str] = mapped_column(String(100), nullable=False, default="Software Engineering")
    internship_type: Mapped[InternshipType] = mapped_column(
        SAEnum(InternshipType, name="internship_type_enum", native_enum=False),
        default=InternshipType.STIPEND,
        nullable=False,
    )

    start_date: Mapped[date] = mapped_column(Date, nullable=False)
    end_date: Mapped[date] = mapped_column(Date, nullable=False)
    stipend: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)

    status: Mapped[InternshipStatus] = mapped_column(
        SAEnum(InternshipStatus, name="internship_status_enum", native_enum=False),
        default=InternshipStatus.ACTIVE,
        nullable=False,
        index=True,
    )
    current_goal: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    
    final_rating: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    mentor_feedback: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    final_feedback: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    conversion_status: Mapped[ConversionStatus] = mapped_column(
        SAEnum(ConversionStatus, name="conversion_status_enum", native_enum=False),
        default=ConversionStatus.NOT_REVIEWED,
        nullable=False,
        index=True,
    )

    # Relationships
    employee: Mapped["Employee"] = relationship(  # noqa: F821
        "Employee",
        foreign_keys=[employee_id],
        lazy="joined",
    )
    mentor: Mapped[Optional["Employee"]] = relationship(  # noqa: F821
        "Employee",
        foreign_keys=[mentor_id],
        lazy="joined",
    )
    goals: Mapped[List["InternGoal"]] = relationship(
        "InternGoal",
        back_populates="intern",
        cascade="all, delete-orphan",
        lazy="select",
    )
    reviews: Mapped[List["InternReview"]] = relationship(
        "InternReview",
        back_populates="intern",
        cascade="all, delete-orphan",
        lazy="select",
    )


class InternGoal(OrgScopedModel):
    """Lightweight goal for an intern."""
    __tablename__ = "intern_goals"

    intern_id: Mapped[uuid.UUID] = mapped_column(
        GUID(),
        ForeignKey("interns.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    status: Mapped[GoalStatus] = mapped_column(
        SAEnum(GoalStatus, name="goal_status_enum", native_enum=False),
        default=GoalStatus.TODO,
        nullable=False,
    )
    due_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)

    # Relationship
    intern: Mapped["Intern"] = relationship("Intern", back_populates="goals", lazy="joined")


class InternReview(OrgScopedModel):
    """Performance evaluation record for an intern."""
    __tablename__ = "intern_reviews"

    intern_id: Mapped[uuid.UUID] = mapped_column(
        GUID(),
        ForeignKey("interns.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    review_type: Mapped[ReviewType] = mapped_column(
        SAEnum(ReviewType, name="review_type_enum", native_enum=False),
        default=ReviewType.MID_TERM,
        nullable=False,
    )

    technical_skills: Mapped[float] = mapped_column(Float, default=5.0, nullable=False)
    communication: Mapped[float] = mapped_column(Float, default=5.0, nullable=False)
    problem_solving: Mapped[float] = mapped_column(Float, default=5.0, nullable=False)
    teamwork: Mapped[float] = mapped_column(Float, default=5.0, nullable=False)
    learning_ability: Mapped[float] = mapped_column(Float, default=5.0, nullable=False)
    overall_rating: Mapped[float] = mapped_column(Float, default=5.0, nullable=False)

    feedback: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_by: Mapped[Optional[uuid.UUID]] = mapped_column(
        GUID(),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )

    # Relationship
    intern: Mapped["Intern"] = relationship("Intern", back_populates="reviews", lazy="joined")
