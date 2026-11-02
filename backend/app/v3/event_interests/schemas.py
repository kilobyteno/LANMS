from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.v3.uuid_types import UUID7


class EventInterestBase(BaseModel):
    """Base event interest model"""

    status: int = Field(ge=0, le=2, description='0=not interested, 1=interested, 2=maybe')


class EventInterestCreate(EventInterestBase):
    """Create event interest input model"""

    pass


class EventInterestUpdate(EventInterestBase):
    """Update event interest input model"""

    pass


class EventInterestResponse(EventInterestBase):
    """Event interest response model"""

    model_config = ConfigDict(from_attributes=True)

    id: UUID7
    event_id: UUID7
    user_id: UUID7
    created_at: datetime
    updated_at: datetime
    deleted_at: datetime | None


class EventInterestCount(BaseModel):
    """Event interest count model"""

    not_interested: int
    interested: int
    maybe: int


class EventInterestCountResponse(BaseModel):
    """List of event interests response model"""

    message: str
    data: list[EventInterestCount]
