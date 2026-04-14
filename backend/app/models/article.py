from sqlalchemy import UUID, Column, DateTime, ForeignKey, String, Text
from sqlalchemy.orm import declarative_base, relationship

from app.models.base import BaseModel

Base = declarative_base()


class Article(BaseModel):
    """Article model for events."""

    __tablename__ = 'articles'

    title = Column(String(255), nullable=False, index=True)
    slug = Column(String(255), nullable=False, index=True)
    content = Column(Text, nullable=False)

    event_id = Column(UUID(as_uuid=True), ForeignKey('events.id'), nullable=False)
    event = relationship('Event', back_populates='articles')

    created_by_id = Column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=False)
    created_by = relationship('User', back_populates='articles')

    published_at = Column(DateTime, nullable=True)
