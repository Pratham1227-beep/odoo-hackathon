from typing import List, Optional
import uuid
from fastapi import APIRouter, Depends, Query, Response, status
from fastapi.responses import HTMLResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.permissions import require_role
from app.features.auth.dependencies import get_current_user
from app.features.auth.models import User
from app.features.interns.schemas import (
    InternCreate,
    InternDetailResponse,
    InternGoalCreate,
    InternGoalResponse,
    InternGoalUpdate,
    InternResponse,
    InternReviewCreate,
    InternReviewResponse,
    InternStatsResponse,
    InternUpdate,
    UpdateMentorRequest,
    UpdateStatusRequest,
)
from app.features.interns.service import InternService
from app.shared.enums import InternshipStatus, UserRole
from app.shared.pagination import PageParams, PaginatedResponse

router = APIRouter(prefix="/interns", tags=["Interns Lifecycle Management"])


@router.get(
    "/stats",
    response_model=InternStatsResponse,
    summary="Get intern KPI stats overview",
)
async def get_intern_stats(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await InternService.get_stats(db, current_user.organization_id)


@router.get(
    "",
    response_model=PaginatedResponse[InternResponse],
    summary="List interns with filtering and pagination",
)
async def list_interns(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    status: Optional[InternshipStatus] = Query(None, description="Filter by status"),
    department_id: Optional[uuid.UUID] = Query(None, description="Filter by department ID"),
    mentor_id: Optional[uuid.UUID] = Query(None, description="Filter by mentor ID"),
    search: Optional[str] = Query(None, description="Search by intern name, college, domain, email"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    params = PageParams(page=page, page_size=page_size)
    return await InternService.list_interns(
        db=db,
        org_id=current_user.organization_id,
        params=params,
        status=status,
        department_id=department_id,
        mentor_id=mentor_id,
        search=search,
    )


@router.post(
    "",
    response_model=InternDetailResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create intern record from existing employee",
)
async def create_intern(
    payload: InternCreate,
    current_user: User = Depends(require_role(UserRole.ADMIN, UserRole.HR_MANAGER)),
    db: AsyncSession = Depends(get_db),
):
    return await InternService.create_intern(db, current_user.organization_id, payload)


@router.get(
    "/{intern_id}",
    response_model=InternDetailResponse,
    summary="Get intern details by ID",
)
async def get_intern(
    intern_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await InternService.get_intern_by_id(db, current_user.organization_id, intern_id)


@router.put(
    "/{intern_id}",
    response_model=InternDetailResponse,
    summary="Update intern details",
)
async def update_intern(
    intern_id: uuid.UUID,
    payload: InternUpdate,
    current_user: User = Depends(require_role(UserRole.ADMIN, UserRole.HR_MANAGER, UserRole.EMPLOYEE)),
    db: AsyncSession = Depends(get_db),
):
    return await InternService.update_intern(db, current_user.organization_id, intern_id, payload)


@router.patch(
    "/{intern_id}/status",
    response_model=InternDetailResponse,
    summary="Update intern status (e.g. TERMINATED or EXTENDED)",
)
async def update_status(
    intern_id: uuid.UUID,
    payload: UpdateStatusRequest,
    current_user: User = Depends(require_role(UserRole.ADMIN, UserRole.HR_MANAGER)),
    db: AsyncSession = Depends(get_db),
):
    return await InternService.update_status(db, current_user.organization_id, intern_id, payload.status)


@router.patch(
    "/{intern_id}/mentor",
    response_model=InternDetailResponse,
    summary="Assign or change intern mentor",
)
async def update_mentor(
    intern_id: uuid.UUID,
    payload: UpdateMentorRequest,
    current_user: User = Depends(require_role(UserRole.ADMIN, UserRole.HR_MANAGER)),
    db: AsyncSession = Depends(get_db),
):
    return await InternService.update_mentor(db, current_user.organization_id, intern_id, payload.mentor_id)


# Goal Endpoints
@router.post(
    "/{intern_id}/goals",
    response_model=InternGoalResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add goal to intern",
)
async def create_goal(
    intern_id: uuid.UUID,
    payload: InternGoalCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await InternService.create_goal(db, current_user.organization_id, intern_id, payload)


@router.put(
    "/{intern_id}/goals/{goal_id}",
    response_model=InternGoalResponse,
    summary="Update goal details or mark completed",
)
async def update_goal(
    intern_id: uuid.UUID,
    goal_id: uuid.UUID,
    payload: InternGoalUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await InternService.update_goal(db, current_user.organization_id, intern_id, goal_id, payload)


@router.delete(
    "/{intern_id}/goals/{goal_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete intern goal",
)
async def delete_goal(
    intern_id: uuid.UUID,
    goal_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await InternService.delete_goal(db, current_user.organization_id, intern_id, goal_id)


# Review Endpoints
@router.post(
    "/{intern_id}/reviews",
    response_model=InternReviewResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Submit mid-term or final performance review",
)
async def create_review(
    intern_id: uuid.UUID,
    payload: InternReviewCreate,
    current_user: User = Depends(require_role(UserRole.ADMIN, UserRole.HR_MANAGER, UserRole.EMPLOYEE)),
    db: AsyncSession = Depends(get_db),
):
    return await InternService.create_review(
        db, current_user.organization_id, intern_id, payload, current_user.id
    )


# Conversion & Completion Endpoints
@router.post(
    "/{intern_id}/convert",
    summary="Convert intern to full-time employee",
)
async def convert_intern(
    intern_id: uuid.UUID,
    current_user: User = Depends(require_role(UserRole.ADMIN, UserRole.HR_MANAGER)),
    db: AsyncSession = Depends(get_db),
):
    return await InternService.convert_intern_to_employee(db, current_user.organization_id, intern_id)


@router.post(
    "/{intern_id}/complete",
    response_model=InternDetailResponse,
    summary="Mark internship as complete",
)
async def complete_internship(
    intern_id: uuid.UUID,
    current_user: User = Depends(require_role(UserRole.ADMIN, UserRole.HR_MANAGER)),
    db: AsyncSession = Depends(get_db),
):
    return await InternService.complete_internship(db, current_user.organization_id, intern_id)


@router.get(
    "/{intern_id}/certificate",
    summary="Generate internship completion certificate",
)
async def generate_certificate(
    intern_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    intern = await InternService.get_intern_by_id(db, current_user.organization_id, intern_id)
    emp_name = f"{intern.employee.first_name} {intern.employee.last_name}" if intern.employee else "Intern"
    domain = intern.internship_domain
    start = intern.start_date.strftime("%B %d, %Y")
    end = intern.end_date.strftime("%B %d, %Y")
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Internship Certificate - {emp_name}</title>
        <style>
            body {{ font-family: 'Helvetica', 'Arial', sans-serif; background: #f8fafc; padding: 40px; text-align: center; color: #1e293b; }}
            .certificate {{ background: #ffffff; border: 10px solid #2563eb; padding: 50px; border-radius: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); max-width: 800px; margin: 0 auto; }}
            h1 {{ font-size: 36px; color: #1e3a8a; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 2px; }}
            h3 {{ font-weight: 400; color: #64748b; margin-bottom: 30px; }}
            .name {{ font-size: 32px; font-weight: bold; color: #2563eb; margin: 20px 0; border-bottom: 2px solid #e2e8f0; display: inline-block; padding-bottom: 5px; }}
            .content {{ font-size: 18px; line-height: 1.6; color: #334155; margin: 30px 0; }}
            .footer {{ margin-top: 50px; display: flex; justify-content: space-between; font-size: 14px; color: #64748b; }}
            .stamp {{ display: inline-block; padding: 8px 16px; background: #dbeafe; color: #1e40af; border-radius: 20px; font-weight: bold; font-size: 14px; margin-top: 20px; }}
        </style>
    </head>
    <body>
        <div class="certificate">
            <h1>Certificate of Completion</h1>
            <h3>This is proudly presented to</h3>
            <div class="name">{emp_name}</div>
            <div class="content">
                For successfully completing an internship as <strong>{domain} Intern</strong><br/>
                from <strong>{start}</strong> to <strong>{end}</strong>.
                <br/><br/>
                During this tenure, performance and conduct were found to be exemplary.
            </div>
            <div class="stamp">OFFICIALLY VERIFIED & ISSUED BY PEOPLEPAY</div>
            <div class="footer">
                <div>Issue Date: {end}</div>
                <div>Authorized Signatory</div>
            </div>
        </div>
    </body>
    </html>
    """
    return HTMLResponse(content=html_content)
