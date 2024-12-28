from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from app.dependencies import get_db
from app.models.user import User
from app.v3.auth.utils import get_current_user
from app.v3.events.schemas import EventCreate, EventResponse, EventUpdate
from app.v3.events.service import (
    create_event,
    delete_event,
    get_event,
    get_events,
    update_event,
)

router = APIRouter()


@router.post(
    '',
    name='E-1',
    response_model=EventResponse,
)
async def post_create_event(event_data: EventCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> JSONResponse:
    """Create a new event"""
    return create_event(db=db, current_user=current_user, event_data=event_data)


@router.get(
    '',
    name='E-2',
    response_model=List[EventResponse],
)
async def get_events_list(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)) -> JSONResponse:
    """Get all events"""
    return get_events(db=db, skip=skip, limit=limit)


@router.get(
    '/{event_id}',
    name='E-3',
    response_model=EventResponse,
)
async def get_event_by_id(event_id: UUID, db: Session = Depends(get_db)) -> JSONResponse:
    """Get event by ID"""
    return get_event(db=db, event_id=event_id)


@router.put(
    '/{event_id}',
    name='E-4',
    response_model=EventResponse,
)
async def put_update_event(
    event_id: UUID, event_data: EventUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
) -> JSONResponse:
    """Update event"""
    return update_event(db=db, event_id=event_id, current_user_id=current_user.id, event_data=event_data)


@router.delete(
    '/{event_id}',
    name='E-5',
)
async def delete_event_by_id(event_id: UUID, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> JSONResponse:
    """Delete event"""
    return delete_event(db=db, event_id=event_id, current_user_id=current_user.id)
