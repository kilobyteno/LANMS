from sqlalchemy import UUID, Column, ForeignKey, String, Text
from sqlalchemy.orm import declarative_base, relationship

from app.models.base import BaseModel

Base = declarative_base()


class Organisation(BaseModel):
    """Organisation model."""

    __tablename__ = 'organisations'

    name = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    contact_email = Column(String(255), nullable=True)
    contact_phone = Column(String(50), nullable=True)
    address_street = Column(String(255), nullable=True)
    address_city = Column(String(255), nullable=True)
    address_postal_code = Column(String(50), nullable=True)
    address_country = Column(String(255), nullable=True)
    website = Column(String(255), nullable=True)

    created_by_id = Column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=False)
    created_by = relationship('User', back_populates='organisations')

    events = relationship('Event', back_populates='organisation', cascade='all, delete-orphan')
