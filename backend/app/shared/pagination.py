from typing import Generic, Sequence, TypeVar
from pydantic import Field
from app.shared.base_schema import BaseSchema

T = TypeVar("T")


class PageParams(BaseSchema):
    """Standard query parameters for pagination."""
    page: int = Field(default=1, ge=1, description="Page number starting at 1")
    page_size: int = Field(default=20, ge=1, le=100, description="Items per page (1-100)")

    @property
    def offset(self) -> int:
        return (self.page - 1) * self.page_size

    @property
    def limit(self) -> int:
        return self.page_size


class PaginatedResponse(BaseSchema, Generic[T]):
    """Standard generic wrapper for paginated API responses."""
    items: Sequence[T] = Field(..., description="List of items for current page")
    total: int = Field(..., description="Total count of items across all pages")
    page: int = Field(..., description="Current page number")
    page_size: int = Field(..., description="Number of items per page")
    total_pages: int = Field(..., description="Total number of pages")

    @classmethod
    def create(cls, items: Sequence[T], total: int, params: PageParams) -> "PaginatedResponse[T]":
        total_pages = (total + params.page_size - 1) // params.page_size if params.page_size > 0 else 0
        return cls(
            items=items,
            total=total,
            page=params.page,
            page_size=params.page_size,
            total_pages=total_pages,
        )
