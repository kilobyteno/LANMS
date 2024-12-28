from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from app.dependencies import get_db
from app.models.user import User
from app.v3.auth.utils import get_current_user
from app.v3.event_interests.schemas import EventInterestCountResponse, EventInterestCreate, EventInterestResponse, EventInterestUpdate
from app.v3.event_interests.service import (
    create_interest,
    get_event_interest_count,
    get_event_interests,
    get_user_interest,
    update_interest,
)

router = APIRouter()


@router.post(
    '/{event_id}',
    name='EI-1',
    response_model=EventInterestResponse,
)
async def post_create_interest(
    event_id: UUID, interest_data: EventInterestCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
) -> JSONResponse:
    """Register interest in an event"""
    return create_interest(db=db, event_id=event_id, current_user=current_user, interest_data=interest_data)


@router.get(
    '/{event_id}',
    name='EI-2',
    response_model=List[EventInterestResponse],
)
async def get_interests_list(event_id: UUID, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)) -> JSONResponse:
    """Get all interests for an event"""
    return get_event_interests(db=db, event_id=event_id, skip=skip, limit=limit)


@router.put(
    '/{event_id}',
    name='EI-3',
    response_model=EventInterestResponse,
)
async def put_update_interest(
    event_id: UUID, interest_data: EventInterestUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
) -> JSONResponse:
    """Update interest status"""
    return update_interest(db=db, event_id=event_id, current_user=current_user, interest_data=interest_data)


@router.get(
    '/{event_id}/me',
    name='EI-4',
    response_model=EventInterestResponse,
)
async def get_my_interest(event_id: UUID, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> JSONResponse:
    """Get current user's interest status for an event"""
    return get_user_interest(db=db, event_id=event_id, current_user=current_user)


@router.get('/{event_id}/count', name='EI-5', response_model=EventInterestCountResponse)
async def get_interest_count(event_id: UUID, db: Session = Depends(get_db)) -> JSONResponse:
    """Get count of interests for an event"""
    return get_event_interest_count(db=db, event_id=event_id)
