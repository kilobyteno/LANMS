from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel

from app.v3.auth.schemas import UserResponse
from app.v3.organisations.schemas import OrganisationResponse


class EventBase(BaseModel):
    """Base event model"""

    title: str
    description: Optional[str] = None

    max_participants: Optional[int] = None
    website: Optional[str] = None

    contact_email: Optional[str] = None
    contact_phone_code: Optional[str] = None
    contact_phone_number: Optional[str] = None

    maps_url: Optional[str] = None
    address_street: Optional[str] = None
    address_city: Optional[str] = None
    address_postal_code: Optional[str] = None
    address_country: Optional[str] = None

    start_at: datetime
    end_at: datetime

    organisation_id: UUID


class EventCreate(EventBase):
    """Create event input model"""

    pass


class EventUpdate(EventBase):
    """Update event input model"""

    pass


class EventResponse(EventBase):
    """Event response model"""

    id: UUID

    title: str
    description: Optional[str]

    max_participants: Optional[int]
    website: Optional[str]

    contact_email: Optional[str]
    contact_phone_code: Optional[str]
    contact_phone_number: Optional[str]

    maps_url: Optional[str]
    address_street: Optional[str]
    address_city: Optional[str]
    address_postal_code: Optional[str]
    address_country: Optional[str]

    start_at: datetime
    end_at: datetime

    organisation: OrganisationResponse

    created_by: UserResponse

    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime]

    class Config:
        """Pydantic config"""

        orm_mode = True


class EventListResponse(BaseModel):
    """Event list response model"""

    events: list[EventResponse]
    total: int
    skip: int
    limit: int
