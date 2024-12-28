import logging
from uuid import UUID

from pydantic import TypeAdapter
from sqlalchemy import func
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from tunsberg.responses import (
    response_conflict,
    response_created,
    response_not_found,
    response_success,
)

from app.models.event import Event
from app.models.event_interest import EventInterest
from app.models.user import User
from app.v3.event_interests.schemas import EventInterestCreate, EventInterestResponse, EventInterestUpdate


def create_interest(db: Session, event_id: UUID, current_user: User, interest_data: EventInterestCreate):
    """Register user's interest in an event"""
    # Check if event exists
    event = db.query(Event).filter(Event.id == event_id, Event.deleted_at.is_(None)).first()
    if not event:
        return response_not_found(message='Event not found')

    # Check if user already registered interest
    existing_interest = (
        db.query(EventInterest).filter(EventInterest.event_id == event_id, EventInterest.user_id == current_user.id, EventInterest.deleted_at.is_(None)).first()
    )

    if existing_interest:
        return response_conflict(message='User has already registered interest in this event')

    try:
        interest = EventInterest(event_id=event_id, user_id=current_user.id, status=interest_data.status)
        db.add(interest)
        db.commit()
        db.refresh(interest)

        adapter = TypeAdapter(EventInterestResponse)
        return response_created(message='Interest registered', data=adapter.dump_json(interest))
    except IntegrityError as e:
        db.rollback()
        logging.error(f'Error registering interest: {e}')
        return response_conflict(message='Error registering interest')


def get_event_interests(db: Session, event_id: UUID, skip: int = 0, limit: int = 100):
    """Get all interests for an event"""
    interests = db.query(EventInterest).filter(EventInterest.event_id == event_id, EventInterest.deleted_at.is_(None)).offset(skip).limit(limit).all()

    adapter = TypeAdapter(EventInterestResponse)
    data = adapter.dump_python(interests, mode='json')
    return response_success(message='Event interests retrieved', data=data)


def update_interest(db: Session, event_id: UUID, current_user: User, interest_data: EventInterestUpdate):
    """Update interest status"""
    interest = (
        db.query(EventInterest).filter(EventInterest.event_id == event_id, EventInterest.user_id == current_user.id, EventInterest.deleted_at.is_(None)).first()
    )

    if not interest:
        return response_not_found(message='Interest record not found')

    try:
        interest.status = interest_data.status
        db.commit()
        db.refresh(interest)

        adapter = TypeAdapter(EventInterestResponse)
        return response_success(message='Interest updated', data=adapter.dump_json(interest))
    except IntegrityError as e:
        db.rollback()
        logging.error(f'Error updating interest: {e}')
        return response_conflict(message='Error updating interest')


def get_user_interest(db: Session, event_id: UUID, current_user: User):
    """Get user's interest status for an event"""
    interest = (
        db.query(EventInterest).filter(EventInterest.event_id == event_id, EventInterest.user_id == current_user.id, EventInterest.deleted_at.is_(None)).first()
    )

    if not interest:
        return response_not_found(message='No interest record found for this event')

    adapter = TypeAdapter(EventInterestResponse)
    return response_success(message='Interest status retrieved', data=adapter.dump_json(interest))


def get_event_interest_count(db: Session, event_id: UUID):
    """Get count of interests for an event grouped by status"""
    base_query = (
        db.query(EventInterest.status, func.count().label('count'))
        .filter(EventInterest.event_id == event_id, EventInterest.deleted_at.is_(None))
        .group_by(EventInterest.status)
    )

    results = {row.status: row.count for row in base_query.all()}

    counts = {'interested': results.get(1, 0), 'not_interested': results.get(0, 0), 'maybe': results.get(2, 0)}

    return response_success(message='Interest count retrieved', data=counts)
