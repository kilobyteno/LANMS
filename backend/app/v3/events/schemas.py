from datetime import datetime
from uuid import UUID

from pydantic import BaseModel

from app.v3.auth.schemas import UserResponse
from app.v3.organisations.schemas import OrganisationResponse


class EventBase(BaseModel):
    """Base event model"""

    title: str
    description: str | None = None

    max_participants: int | None = None
    website: str | None = None

    contact_email: str | None = None
    contact_phone_code: str | None = None
    contact_phone_number: str | None = None

    maps_url: str | None = None
    address_street: str | None = None
    address_city: str | None = None
    address_postal_code: str | None = None
    address_country: str | None = None

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
    description: str | None

    max_participants: int | None
    website: str | None

    contact_email: str | None
    contact_phone_code: str | None
    contact_phone_number: str | None

    maps_url: str | None
    address_street: str | None
    address_city: str | None
    address_postal_code: str | None
    address_country: str | None

    start_at: datetime
    end_at: datetime

    organisation: OrganisationResponse

    created_by: UserResponse

    created_at: datetime
    updated_at: datetime
    deleted_at: datetime | None

    class Config:
        """Pydantic config"""

        orm_mode = True


class EventListResponse(BaseModel):
    """Event list response model"""

    events: list[EventResponse]
    total: int
    skip: int
    limit: int
