from sqlalchemy import Column, DateTime, String, UniqueConstraint
from sqlalchemy.orm import declarative_base, relationship

from .base import BaseModel

Base = declarative_base()


class User(BaseModel):
    """User model"""

    __tablename__ = 'users'

    name = Column(String(256), nullable=False)
    email = Column(String(320), unique=True, index=True)
    password = Column(String(256), nullable=False)
    phone_code = Column(String(12), nullable=True, comment='Phone number with country code, e.g. +47')
    phone_number = Column(String(32), nullable=True, comment='Phone number with country code, e.g. 99887766')

    referrer = Column(String, default=None, nullable=True, comment='Who/what referred this user')
    photo_url = Column(String, nullable=True)

    email_verified_at = Column(DateTime, nullable=True)
    privacy_policy_accepted_at = Column(DateTime, nullable=True)
    terms_of_service_accepted_at = Column(DateTime, nullable=True)
    refresh_token = Column(String, nullable=True)

    organisations = relationship('Organisation', back_populates='created_by')
    events = relationship('Event', back_populates='created_by')
    event_interests = relationship('EventInterest', back_populates='user')
    articles = relationship('Article', back_populates='created_by')

    __table_args__ = (UniqueConstraint('phone_code', 'phone_number', name='_phone_code_phone_number_uc'),)

    @property
    def phone(self):
        """Return phone number with country code"""
        return f'{self.phone_code}{self.phone_number}'


class Otp(BaseModel):
    """OTP model."""

    __tablename__ = 'otp'

    code = Column(String(6))
    email = Column(String(320), nullable=True)
    used_at = Column(DateTime)
    expires_at = Column(DateTime)
