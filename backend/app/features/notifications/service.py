from datetime import datetime, timezone
from typing import Optional
import uuid
from sqlalchemy import desc, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundError
from app.features.auth.models import User
from app.features.notifications.models import Notification
from app.features.notifications.schemas import NotificationResponse
from app.shared.pagination import PageParams, PaginatedResponse


class NotificationService:

    @staticmethod
    async def create_notification(
        db: AsyncSession,
        recipient_id: uuid.UUID,
        title: str,
        message: str,
        type: str,
        severity: str = "INFO",
        link: Optional[str] = None,
        organization_id: Optional[uuid.UUID] = None,
    ) -> Notification:
        """Helper to create and persist an in-app notification."""
        resolved_org_id = organization_id
        if not resolved_org_id:
            user_stmt = select(User.organization_id).where(User.id == recipient_id)
            user_res = await db.execute(user_stmt)
            resolved_org_id = user_res.scalar_one_or_none()

        if not resolved_org_id:
            # Fallback if user not found or recipient has no org
            raise ValueError(f"Unable to resolve organization for recipient {recipient_id}")

        notif = Notification(
            organization_id=resolved_org_id,
            recipient_id=recipient_id,
            title=title,
            message=message,
            type=type,
            severity=severity,
            link=link,
            is_read=False,
            read_at=None,
        )
        db.add(notif)
        await db.flush()
        return notif

    @staticmethod
    async def list_notifications(
        db: AsyncSession,
        user: User,
        is_read: Optional[bool] = None,
        page: int = 1,
        page_size: int = 20,
    ) -> PaginatedResponse[NotificationResponse]:
        """Fetch notifications for the current authenticated user."""
        query = select(Notification).where(
            Notification.organization_id == user.organization_id,
            Notification.recipient_id == user.id,
        )

        if is_read is not None:
            query = query.where(Notification.is_read == is_read)

        count_query = select(func.count()).select_from(query.subquery())
        total_res = await db.execute(count_query)
        total = total_res.scalar() or 0

        offset = (page - 1) * page_size
        stmt = query.order_by(desc(Notification.created_at)).offset(offset).limit(page_size)
        res = await db.execute(stmt)
        items = res.scalars().all()

        responses = [NotificationResponse.model_validate(n) for n in items]
        params = PageParams(page=page, page_size=page_size)
        return PaginatedResponse.create(items=responses, total=total, params=params)

    @staticmethod
    async def mark_as_read(
        db: AsyncSession,
        user: User,
        notification_id: uuid.UUID,
    ) -> NotificationResponse:
        """Mark own notification as read."""
        stmt = select(Notification).where(
            Notification.id == notification_id,
            Notification.recipient_id == user.id,
            Notification.organization_id == user.organization_id,
        )
        res = await db.execute(stmt)
        notif = res.scalar_one_or_none()

        if not notif:
            raise NotFoundError("Notification not found")

        if not notif.is_read:
            notif.is_read = True
            notif.read_at = datetime.now(timezone.utc)
            await db.commit()
            await db.refresh(notif)

        return NotificationResponse.model_validate(notif)
