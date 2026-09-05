from datetime import date
from typing import List, Optional
import uuid
from pydantic import Field, field_validator

from app.shared.base_schema import BaseSchema, IDSchema, TimestampSchema
from app.shared.enums import (
    ConversionStatus,
    GoalStatus,
    InternshipStatus,
    InternshipType,
    ReviewType,
)


# ==========================================
# Intern Goal Schemas
# ==========================================

class InternGoalBase(BaseSchema):
    title: str = Field(..., min_length=1, max_length=255, description="Goal title")
    description: Optional[str] = Field(None, description="Detailed description")
    status: GoalStatus = GoalStatus.TODO
    due_date: Optional[date] = None


class InternGoalCreate(InternGoalBase):
    pass


class InternGoalUpdate(BaseSchema):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    status: Optional[GoalStatus] = None
    due_date: Optional[date] = None


class InternGoalResponse(InternGoalBase, IDSchema, TimestampSchema):
    organization_id: uuid.UUID
    intern_id: uuid.UUID


# ==========================================
# Intern Review Schemas
# ==========================================

class InternReviewBase(BaseSchema):
    review_type: ReviewType = ReviewType.MID_TERM
    technical_skills: float = Field(5.0, ge=1.0, le=5.0)
    communication: float = Field(5.0, ge=1.0, le=5.0)
    problem_solving: float = Field(5.0, ge=1.0, le=5.0)
    teamwork: float = Field(5.0, ge=1.0, le=5.0)
    learning_ability: float = Field(5.0, ge=1.0, le=5.0)
    overall_rating: float = Field(5.0, ge=1.0, le=5.0)
    feedback: Optional[str] = None

    @field_validator("overall_rating", mode="before")
    @classmethod
    def calculate_rating(cls, v, info):
        # We can accept provided rating or auto-compute if needed
        return v


class InternReviewCreate(InternReviewBase):
    recommend_conversion: Optional[bool] = None


class InternReviewResponse(InternReviewBase, IDSchema, TimestampSchema):
    organization_id: uuid.UUID
    intern_id: uuid.UUID
    created_by: Optional[uuid.UUID] = None


# ==========================================
# Employee Nested Summaries for Intern
# ==========================================

class InternEmployeeSummary(BaseSchema):
    id: uuid.UUID
    employee_code: str
    first_name: str
    last_name: str
    email: str
    phone: Optional[str] = None
    department_id: Optional[uuid.UUID] = None
    department_name: Optional[str] = None
    designation_name: Optional[str] = None
    avatar_url: Optional[str] = None


# ==========================================
# Attendance & Payroll Integration Summaries
# ==========================================

class InternAttendanceSummary(BaseSchema):
    attendance_percentage: float = 100.0
    present_days: int = 0
    absent_days: int = 0
    leave_days: int = 0
    total_working_days: int = 0


# ==========================================
# Intern Core Schemas
# ==========================================

class InternBase(BaseSchema):
    college_name: Optional[str] = Field(None, max_length=255)
    course: Optional[str] = Field(None, max_length=255)
    graduation_year: Optional[int] = Field(None, ge=1990, le=2040)
    internship_domain: str = Field(..., max_length=100)
    internship_type: InternshipType = InternshipType.STIPEND
    start_date: date
    end_date: date
    stipend: float = Field(0.0, ge=0.0)
    status: InternshipStatus = InternshipStatus.ACTIVE
    current_goal: Optional[str] = Field(None, max_length=255)

    @field_validator("end_date")
    @classmethod
    def validate_dates(cls, v: date, info):
        if "start_date" in info.data and v < info.data["start_date"]:
            raise ValueError("end_date cannot be before start_date")
        return v


class InternCreate(InternBase):
    employee_id: uuid.UUID
    mentor_id: Optional[uuid.UUID] = None


class InternUpdate(BaseSchema):
    college_name: Optional[str] = None
    course: Optional[str] = None
    graduation_year: Optional[int] = None
    internship_domain: Optional[str] = None
    internship_type: Optional[InternshipType] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    stipend: Optional[float] = Field(None, ge=0.0)
    status: Optional[InternshipStatus] = None
    current_goal: Optional[str] = None
    mentor_id: Optional[uuid.UUID] = None


class UpdateStatusRequest(BaseSchema):
    status: InternshipStatus


class UpdateMentorRequest(BaseSchema):
    mentor_id: uuid.UUID


class InternResponse(InternBase, IDSchema, TimestampSchema):
    organization_id: uuid.UUID
    employee_id: uuid.UUID
    mentor_id: Optional[uuid.UUID] = None
    conversion_status: ConversionStatus = ConversionStatus.NOT_REVIEWED
    final_rating: Optional[float] = None
    mentor_feedback: Optional[str] = None
    final_feedback: Optional[str] = None

    employee: Optional[InternEmployeeSummary] = None
    mentor: Optional[InternEmployeeSummary] = None

    # Calculated metrics
    duration_days: int = 0
    days_completed: int = 0
    days_remaining: int = 0
    progress_percentage: float = 0.0


class InternDetailResponse(InternResponse):
    goals: List[InternGoalResponse] = []
    reviews: List[InternReviewResponse] = []
    attendance_summary: Optional[InternAttendanceSummary] = None


class InternStatsResponse(BaseSchema):
    active_interns: int = 0
    ending_soon: int = 0
    average_progress: float = 0.0
    conversion_candidates: int = 0
