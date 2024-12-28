from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, EmailStr


class OrganisationBase(BaseModel):
    """Base organisation model"""

    name: str
    description: Optional[str] = None
    contact_email: Optional[EmailStr] = None
    contact_phone: Optional[str] = None
    address_street: Optional[str] = None
    address_city: Optional[str] = None
    address_postal_code: Optional[str] = None
    address_country: Optional[str] = None
    website: Optional[str] = None


class OrganisationCreate(OrganisationBase):
    """Create organisation input model"""

    pass


class OrganisationUpdate(OrganisationBase):
    """Update organisation input model"""

    pass


class OrganisationResponse(OrganisationBase):
    """Organisation response model"""

    id: UUID
    created_by_id: UUID
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime]

    class Config:
        """Pydantic config"""

        orm_mode = True


class OrganisationListResponse(BaseModel):
    """Organisation list response model"""

    organisations: list[OrganisationResponse]
    total: int
    skip: int
    limit: int
