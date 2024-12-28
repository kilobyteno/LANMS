from sqlalchemy import UUID, Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import declarative_base, relationship

from app.models.base import BaseModel

Base = declarative_base()


class Event(BaseModel):
    """Event model."""

    __tablename__ = 'events'

    title = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)

    max_participants = Column(Integer, nullable=True)
    website = Column(String(255), nullable=True)

    contact_email = Column(String(255), nullable=True)
    contact_phone_code = Column(String(12), nullable=True, comment='Phone number with country code, e.g. +47')
    contact_phone_number = Column(String(32), nullable=True, comment='Phone number with country code, e.g. 99887766')

    maps_url = Column(String(255), nullable=True)
    address_street = Column(String(255), nullable=True)
    address_city = Column(String(255), nullable=True)
    address_postal_code = Column(String(50), nullable=True)
    address_country = Column(String(255), nullable=True)

    start_at = Column(DateTime, nullable=False)
    end_at = Column(DateTime, nullable=False)

    organisation_id = Column(UUID(as_uuid=True), ForeignKey('organisations.id'), nullable=False)
    organisation = relationship('Organisation', back_populates='events')

    created_by_id = Column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=False)
    created_by = relationship('User', back_populates='events')

    interests = relationship('EventInterest', back_populates='event')
