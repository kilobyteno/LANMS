from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, EmailStr


class OrganisationBase(BaseModel):
    """Base organisation model"""

    name: str
    description: str | None = None
    contact_email: EmailStr | None = None
    contact_phone: str | None = None
    address_street: str | None = None
    address_city: str | None = None
    address_postal_code: str | None = None
    address_country: str | None = None
    website: str | None = None


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
    deleted_at: datetime | None

    class Config:
        """Pydantic config"""

        orm_mode = True


class OrganisationListResponse(BaseModel):
    """Organisation list response model"""

    organisations: list[OrganisationResponse]
    total: int
    skip: int
    limit: int
