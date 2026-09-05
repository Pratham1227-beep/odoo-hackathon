from datetime import date
from typing import Optional
from sqlalchemy import Date, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.shared.base_model import OrgScopedModel


class AnalyticsSnapshot(OrgScopedModel):
    """Immutable point-in-time snapshot of finalized historical analytics data."""
    __tablename__ = "analytics_snapshots"

    type: Mapped[str] = mapped_column(String(100), default="PAYROLL_MONTHLY", nullable=False, index=True)
    date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    data: Mapped[str] = mapped_column(Text, nullable=False)
    meta_data: Mapped[Optional[str]] = mapped_column("metadata", Text, nullable=True)

    @property
    def metadata_val(self) -> Optional[str]:
        return self.meta_data

    @metadata_val.setter
    def metadata_val(self, val: Optional[str]) -> None:
        self.meta_data = val
