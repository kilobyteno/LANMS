from pydantic import TypeAdapter
from sqlalchemy.orm import Session
from tunsberg.responses import response_success

from app.models.event import Event
from app.models.organisation import Organisation
from app.models.user import User
from app.v3.auth.schemas import UserResponse
from app.v3.events.schemas import EventResponse
from app.v3.organisations.schemas import OrganisationResponse


def fetch_user_account(current_user: User):
    """Get user account and user profile details for the current user"""
    user_adapter = TypeAdapter(UserResponse)
    data = user_adapter.dump_python(current_user, mode='json')

    return response_success(message='User details successfully fetched', data=data)


def fetch_user_organisations(current_user: User, db: Session):
    """Get organisations associated with the current user"""
    organisations = db.query(Organisation).filter(Organisation.created_by_id == current_user.id, Organisation.deleted_at.is_(None)).all()

    adapter = TypeAdapter(list[OrganisationResponse])
    organisations = adapter.dump_json(organisations)

    return response_success(message='Organisations successfully fetched', data=organisations)


def fetch_user_events(current_user: User, db: Session):
    """Get events associated with the current user"""
    events = db.query(Event).filter(Event.created_by_id == current_user.id, Event.deleted_at.is_(None)).all()

    adapter = TypeAdapter(list[EventResponse])
    events = adapter.dump_json(events)

    return response_success(message='Events successfully fetched', data=events)
