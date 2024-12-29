from sqlalchemy import UUID, Column, ForeignKey, Integer
from sqlalchemy.orm import declarative_base, relationship

from app.models.base import BaseModel

Base = declarative_base()


class EventInterest(BaseModel):
    """Event interest model - tracks user's interest in attending an event"""

    __tablename__ = 'event_interests'

    event_id = Column(UUID(as_uuid=True), ForeignKey('events.id'), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=False)
    # 0 = not interested, 1 = interested, 2 = maybe
    status = Column(Integer, nullable=False, default=1)

    # Relationships
    event = relationship('Event', back_populates='interests')
    user = relationship('User', back_populates='event_interests')
