from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field


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

    id: UUID
    event_id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime]

    class Config:
        """Pydantic config"""

        orm_mode = True


class EventInterestCount(BaseModel):
    """Event interest count model"""

    not_interested: int
    interested: int
    maybe: int


class EventInterestCountResponse(BaseModel):
    """List of event interests response model"""

    message: str
    data: list[EventInterestCount]
