from datetime import datetime
from typing import Optional
import uuid
from pydantic import BaseModel, Field


class NotificationBase(BaseModel):
    title: str = Field(..., max_length=255)
    message: str
    type: str = Field(..., max_length=100)
    severity: str = Field(default="INFO", max_length=50)
    link: Optional[str] = Field(None, max_length=500)


class NotificationCreate(NotificationBase):
    recipient_id: uuid.UUID
    organization_id: Optional[uuid.UUID] = None


class NotificationResponse(NotificationBase):
    id: uuid.UUID
    organization_id: uuid.UUID
    recipient_id: uuid.UUID
    is_read: bool
    read_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
