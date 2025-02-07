from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel

from app.v3.auth.schemas import UserResponse


class ArticleBase(BaseModel):
    """Base article model"""

    title: str
    slug: Optional[str]
    content: str
    published_at: Optional[datetime]


class ArticleCreate(ArticleBase):
    """Create article input model"""

    pass


class ArticleUpdate(ArticleBase):
    """Update article input model"""

    pass


class ArticleResponse(ArticleBase):
    """Article response model"""

    id: UUID
    event_id: UUID
    created_by: UserResponse
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime]

    class Config:
        """Pydantic config"""

        orm_mode = True


class ArticleListResponse(BaseModel):
    """Article list response model"""

    articles: list[ArticleResponse]
    total: int
    skip: int
    limit: int
