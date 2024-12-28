import logging

from pydantic import TypeAdapter
from pydantic.v1 import UUID4
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from tunsberg.responses import (
    response_bad_request,
    response_conflict,
    response_created,
    response_forbidden,
    response_not_found,
    response_success,
)

from app.models.event import Event
from app.models.user import User
from app.v3.events.schemas import EventCreate, EventResponse, EventUpdate


def create_event(db: Session, current_user: User, event_data: EventCreate):
    """Create a new event"""
    try:
        event = Event(**event_data.model_dump(), created_by_id=current_user.id)
        db.add(event)
        db.commit()
        db.refresh(event)

        adapter = TypeAdapter(EventResponse)
        return response_created(message='Event created', data=adapter.dump_json(event))
    except IntegrityError as e:
        db.rollback()
        logging.error(f'Error creating event: {e}')
        return response_conflict(message='Error creating event')


def get_events(db: Session, skip: int = 0, limit: int = 100):
    """Get all events"""
    events = db.query(Event).filter(Event.deleted_at.is_(None)).offset(skip).limit(limit).all()

    adapter = TypeAdapter(list[EventResponse])
    data = adapter.dump_json(events)
    return response_success(message='Events retrieved', data=data)


def get_event(db: Session, event_id: UUID4):
    """Get event by ID"""
    event = db.query(Event).filter(Event.id == event_id, Event.deleted_at.is_(None)).first()
    if not event:
        return response_not_found(message='Event not found')

    adapter = TypeAdapter(EventResponse)
    return response_success(message='Event retrieved', data=adapter.dump_json(event))


def update_event(db: Session, event_id: UUID4, current_user_id: int, event_data: EventUpdate):
    """Update event"""
    event = db.query(Event).filter(Event.id == event_id, Event.deleted_at.is_(None)).first()
    if not event:
        return response_not_found(message='Event not found')

    if event.created_by_id != current_user_id:
        return response_forbidden(message="You don't have permission to update this event")

    try:
        for field, value in event_data.model_dump(exclude_unset=True).items():
            setattr(event, field, value)

        db.commit()
        db.refresh(event)

        adapter = TypeAdapter(EventResponse)
        return response_success(message='Event updated', data=adapter.dump_json(event))
    except IntegrityError as e:
        db.rollback()
        logging.error(f'Error updating event: {e}')
        return response_conflict(message='Error updating event')


def delete_event(db: Session, event_id: UUID4, current_user_id: int):
    """Delete event"""
    event = db.query(Event).filter(Event.id == event_id, Event.deleted_at.is_(None)).first()
    if not event:
        return response_not_found(message='Event not found')

    if event.created_by_id != current_user_id:
        return response_forbidden(message="You don't have permission to delete this event")

    try:
        db.delete(event)
        db.commit()
        return response_success(message='Event deleted')
    except Exception as e:
        db.rollback()
        logging.error(f'Error deleting event: {e}')
        return response_bad_request(message='Could not delete event')
