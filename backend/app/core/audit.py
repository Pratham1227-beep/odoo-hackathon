from datetime import date, datetime, timezone
import json
from typing import Any, Optional
import uuid
from fastapi import APIRouter, Depends, Query, Request
from pydantic import BaseModel as PydanticBaseModel
from sqlalchemy import Date, DateTime, ForeignKey, String, Text, desc, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import get_db
from app.core.permissions import require_role
from app.features.auth.models import User
from app.shared.base_model import GUID, OrgScopedModel
from app.shared.enums import UserRole
from app.shared.pagination import PageParams, PaginatedResponse


# ==========================================
# Database Model
# ==========================================

class AuditLog(OrgScopedModel):
    """Audit log entry tracking critical entity mutations and system lifecycle events."""
    __tablename__ = "audit_logs"

    user_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        GUID(),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    action: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    module: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    resource_type: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    resource_id: Mapped[Optional[uuid.UUID]] = mapped_column(GUID(), nullable=True, index=True)
    before: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    after: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    ip_address: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    user_agent: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)

    # Relationships
    user: Mapped[Optional["User"]] = relationship("User", foreign_keys=[user_id], lazy="joined")


# ==========================================
# Pydantic Schemas
# ==========================================

class AuditLogResponse(PydanticBaseModel):
    id: uuid.UUID
    organization_id: uuid.UUID
    user_id: Optional[uuid.UUID] = None
    user_email: Optional[str] = None
    action: str
    module: str
    resource_type: str
    resource_id: Optional[uuid.UUID] = None
    before: Optional[str] = None
    after: Optional[str] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# ==========================================
# Audit Logging Helper
# ==========================================

def _serialize_audit_data(val: Any) -> Optional[str]:
    if val is None:
        return None
    if isinstance(val, str):
        return val
    try:
        if hasattr(val, "model_dump_json"):
            return val.model_dump_json()
        if hasattr(val, "to_dict"):
            return json.dumps(val.to_dict(), default=str)
        return json.dumps(val, default=str)
    except Exception:
        return str(val)


async def log_audit(
    db: AsyncSession,
    user: Optional[User],
    action: str,
    module: str,
    resource_type: str,
    resource_id: Optional[uuid.UUID] = None,
    before: Optional[Any] = None,
    after: Optional[Any] = None,
    request: Optional[Request] = None,
    ip_address: Optional[str] = None,
    user_agent: Optional[str] = None,
    org_id: Optional[uuid.UUID] = None,
) -> AuditLog:
    """Helper to write an AuditLog row across critical mutations in the system."""
    resolved_org_id = org_id or (user.organization_id if user else None)
    if not resolved_org_id:
        raise ValueError("Cannot log audit record without an organization_id")

    # Extract client network information from request if provided
    extracted_ip = ip_address
    extracted_ua = user_agent
    if request:
        if not extracted_ip and request.client:
            extracted_ip = request.client.host
        if not extracted_ua:
            extracted_ua = request.headers.get("user-agent")

    user_id = user.id if user else None

    entry = AuditLog(
        organization_id=resolved_org_id,
        user_id=user_id,
        action=action.upper(),
        module=module.upper(),
        resource_type=resource_type,
        resource_id=resource_id,
        before=_serialize_audit_data(before),
        after=_serialize_audit_data(after),
        ip_address=extracted_ip,
        user_agent=extracted_ua,
    )
    db.add(entry)
    await db.flush()
    await db.commit()
    return entry


# ==========================================
# Router for Audit Logs (Admin only)
# ==========================================

router = APIRouter(prefix="/audit-logs", tags=["Audit Logs"])


@router.get(
    "",
    response_model=PaginatedResponse[AuditLogResponse],
    summary="List organization audit logs with filtering and pagination (ADMIN only)",
)
async def list_audit_logs(
    module: Optional[str] = Query(None, description="Filter by module (e.g. EMPLOYEES, CONTRACTS, PAYROLL, SALARY_CONFIG)"),
    user_id: Optional[uuid.UUID] = Query(None, description="Filter by acting user UUID"),
    action: Optional[str] = Query(None, description="Filter by action (e.g. UPDATE, FINALIZE, CREATE)"),
    from_date: Optional[date] = Query(None, description="Filter records created on or after date"),
    to_date: Optional[date] = Query(None, description="Filter records created on or before date"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    current_user: User = Depends(require_role(UserRole.ADMIN)),
    db: AsyncSession = Depends(get_db),
):
    org_id = current_user.organization_id
    query = select(AuditLog).where(AuditLog.organization_id == org_id)

    if module:
        query = query.where(AuditLog.module == module.strip().upper())
    if user_id:
        query = query.where(AuditLog.user_id == user_id)
    if action:
        query = query.where(AuditLog.action == action.strip().upper())
    if from_date:
        query = query.where(AuditLog.created_at >= datetime.combine(from_date, datetime.min.time(), tzinfo=timezone.utc))
    if to_date:
        query = query.where(AuditLog.created_at <= datetime.combine(to_date, datetime.max.time(), tzinfo=timezone.utc))

    count_query = select(func.count()).select_from(query.subquery())
    total_res = await db.execute(count_query)
    total = total_res.scalar() or 0

    offset = (page - 1) * page_size
    stmt = query.order_by(desc(AuditLog.created_at)).offset(offset).limit(page_size)
    res = await db.execute(stmt)
    items = res.scalars().all()

    responses = []
    for item in items:
        resp = AuditLogResponse(
            id=item.id,
            organization_id=item.organization_id,
            user_id=item.user_id,
            user_email=item.user.email if item.user else None,
            action=item.action,
            module=item.module,
            resource_type=item.resource_type,
            resource_id=item.resource_id,
            before=item.before,
            after=item.after,
            ip_address=item.ip_address,
            user_agent=item.user_agent,
            created_at=item.created_at,
            updated_at=item.updated_at,
        )
        responses.append(resp)

    params = PageParams(page=page, page_size=page_size)
    return PaginatedResponse.create(items=responses, total=total, params=params)
