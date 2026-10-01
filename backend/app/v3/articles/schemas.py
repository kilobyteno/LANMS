from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.v3.auth.schemas import UserResponse
from app.v3.uuid_types import UUID7


class ArticleBase(BaseModel):
    """Base article model"""

    title: str
    slug: str | None
    content: str
    published_at: datetime | None


class ArticleCreate(ArticleBase):
    """Create article input model"""

    pass


class ArticleUpdate(ArticleBase):
    """Update article input model"""

    pass


class ArticleResponse(ArticleBase):
    """Article response model"""

    model_config = ConfigDict(from_attributes=True)

    id: UUID7
    event_id: UUID7
    created_by: UserResponse
    created_at: datetime
    updated_at: datetime
    deleted_at: datetime | None


class ArticleListResponse(BaseModel):
    """Article list response model"""

    articles: list[ArticleResponse]
    total: int
    skip: int
    limit: int
