from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class SystemHealthResponse(BaseModel):
    status: str = Field(json_schema_extra={"example": "ok"})
    app_name: str
    version: str
    environment: str
    timestamp: datetime


class DBHealthResponse(BaseModel):
    status: str = Field(json_schema_extra={"example": "healthy"})
    database_type: str
    latency_ms: float
    message: str
    error: Optional[str] = None
