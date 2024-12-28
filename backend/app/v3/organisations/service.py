import logging
from datetime import datetime

from pydantic import UUID4, TypeAdapter
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
from app.models.organisation import Organisation
from app.models.user import User
from app.v3.events.schemas import EventResponse
from app.v3.organisations.schemas import OrganisationCreate, OrganisationResponse, OrganisationUpdate


def create_organisation(db: Session, current_user: User, organisation_data: OrganisationCreate):
    """Create a new organisation"""
    try:
        organisation = Organisation(**organisation_data.model_dump(), created_by_id=current_user.id)
        db.add(organisation)
        db.commit()
        db.refresh(organisation)

        adapter = TypeAdapter(OrganisationResponse)
        return response_created(message='Organisation created', data=adapter.dump_json(organisation))
    except IntegrityError as e:
        db.rollback()
        logging.error(f'Error creating organisation: {e}')
        return response_conflict(message='Organisation with this name already exists')


def get_organisations(db: Session, skip: int = 0, limit: int = 100):
    """Get all organisations"""
    organisations = db.query(Organisation).offset(skip).limit(limit).all()

    adapter = TypeAdapter(OrganisationResponse)
    data = adapter.dump_python(organisations, mode='json')
    return response_success(message='Organisations retrieved', data=data)


def get_organisation(db: Session, organisation_id: int):
    """Get organisation by ID"""
    organisation = db.query(Organisation).filter(Organisation.id == organisation_id).first()
    if not organisation:
        return response_not_found(message='Organisation not found')

    adapter = TypeAdapter(OrganisationResponse)
    return response_success(message='Organisation retrieved', data=adapter.dump_json(organisation))


def update_organisation(db: Session, organisation_id: UUID4, current_user: User, organisation_data: OrganisationUpdate):
    """Update organisation"""
    organisation = db.query(Organisation).filter(Organisation.id == organisation_id).first()
    if not organisation:
        return response_not_found(message='Organisation not found')

    # TODO @dsbilling: Add better permission check in the future
    if organisation.created_by_id != current_user.id:
        return response_forbidden(message="You don't have permission to update this organisation")

    try:
        for field, value in organisation_data.model_dump(exclude_unset=True).items():
            setattr(organisation, field, value)

        organisation.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(organisation)

        adapter = TypeAdapter(OrganisationResponse)
        return response_success(message='Organisation updated', data=adapter.dump_json(organisation))
    except IntegrityError as e:
        db.rollback()
        logging.error(f'Error updating organisation: {e}')
        return response_conflict(message='Organisation with this name already exists')


def delete_organisation(db: Session, organisation_id: UUID4, current_user: User):
    """Delete organisation"""
    organisation = db.query(Organisation).filter(Organisation.id == organisation_id).first()
    if not organisation:
        return response_not_found(message='Organisation not found')

    if organisation.created_by_id != current_user.id:
        return response_forbidden(message="You don't have permission to delete this organisation")

    try:
        db.delete(organisation)
        db.commit()
        return response_success(message='Organisation deleted')
    except Exception as e:
        db.rollback()
        logging.error(f'Error deleting organisation: {e}')
        return response_bad_request(message='Could not delete organisation')


def fetch_organisation_events(organisation_id: UUID4, db: Session):
    """Get events associated with the organisation"""
    events = db.query(Event).filter(Event.organisation_id == organisation_id, Event.deleted_at.is_(None)).all()

    adapter = TypeAdapter(list[EventResponse])
    events = adapter.dump_json(events)

    return response_success(message='Events successfully fetched', data=events)


def fetch_organisation_events_all(organisation_id: UUID4, current_user: User, db: Session):
    """Get events associated with the organisation"""
    events = db.query(Event).filter(Event.organisation_id == organisation_id).all()

    adapter = TypeAdapter(list[EventResponse])
    events = adapter.dump_json(events)

    return response_success(message='Events successfully fetched', data=events)
