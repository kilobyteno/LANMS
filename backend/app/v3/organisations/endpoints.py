from typing import List

from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from pydantic import UUID4
from sqlalchemy.orm import Session

from app.dependencies import get_db
from app.models.user import User
from app.v3.auth.utils import get_current_user
from app.v3.events.schemas import EventResponse
from app.v3.organisations.schemas import OrganisationCreate, OrganisationResponse, OrganisationUpdate
from app.v3.organisations.service import (
    create_organisation,
    delete_organisation,
    fetch_organisation_events,
    fetch_organisation_events_all,
    get_organisation,
    get_organisations,
    update_organisation,
)

router = APIRouter()


@router.post(
    '',
    name='O-1',
    response_model=OrganisationResponse,
)
async def post_create_organisation(
    organisation_data: OrganisationCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
) -> JSONResponse:
    """Create a new organisation"""
    return create_organisation(db=db, current_user=current_user, organisation_data=organisation_data)


@router.get(
    '',
    name='O-2',
    response_model=List[OrganisationResponse],
)
async def get_organisations_list(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)) -> JSONResponse:
    """Get all organisations"""
    return get_organisations(db=db, skip=skip, limit=limit)


@router.get(
    '/{organisation_id}',
    name='O-3',
    response_model=OrganisationResponse,
)
async def get_organisation_by_id(organisation_id: UUID4, db: Session = Depends(get_db)) -> JSONResponse:
    """Get organisation by ID"""
    return get_organisation(db=db, organisation_id=organisation_id)


@router.put(
    '/{organisation_id}',
    name='O-4',
    response_model=OrganisationResponse,
)
async def put_update_organisation(
    organisation_id: int, organisation_data: OrganisationUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
) -> JSONResponse:
    """Update organisation"""
    return update_organisation(db=db, organisation_id=organisation_id, current_user=current_user, organisation_data=organisation_data)


@router.delete(
    '/{organisation_id}',
    name='O-5',
)
async def delete_organisation_by_id(organisation_id: UUID4, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> JSONResponse:
    """Delete organisation"""
    return delete_organisation(db=db, organisation_id=organisation_id, current_user=current_user)


@router.get('/{organisation_id}/events', name='O-6', response_model=List[EventResponse])
async def get_organisation_events(organisation_id: UUID4, db: Session = Depends(get_db)) -> JSONResponse:
    """Get non-deleted events associated with the organisation"""
    return fetch_organisation_events(organisation_id=organisation_id, db=db)


@router.get('/{organisation_id}/events/all', name='O-7', response_model=List[EventResponse])
async def get_organisation_events_all(organisation_id: UUID4, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> JSONResponse:
    """Get all events associated with the organisation"""
    return fetch_organisation_events_all(organisation_id=organisation_id, current_user=current_user, db=db)
