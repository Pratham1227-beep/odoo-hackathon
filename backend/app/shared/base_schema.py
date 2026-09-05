from datetime import datetime
import uuid
from pydantic import BaseModel as PydanticBaseModel, ConfigDict, Field


class BaseSchema(PydanticBaseModel):
    """Base Pydantic v2 schema for all request/response schemas with standard config."""
    model_config = ConfigDict(
        from_attributes=True,
        populate_by_name=True,
        arbitrary_types_allowed=True,
    )


class IDSchema(BaseSchema):
    """Schema mixin for UUID identifier."""
    id: uuid.UUID = Field(..., description="Unique identifier (UUID)")


class TimestampSchema(BaseSchema):
    """Schema mixin for audit timestamps."""
    created_at: datetime = Field(..., description="Timestamp when record was created")
    updated_at: datetime = Field(..., description="Timestamp when record was last updated")


class MessageResponse(BaseSchema):
    """Generic message response."""
    message: str
    success: bool = True
