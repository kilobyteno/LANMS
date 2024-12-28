from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from starlette.responses import JSONResponse

from app.dependencies import get_db
from app.models.user import User
from app.v3.auth.schemas import UserResponse
from app.v3.auth.utils import JWTBearer, get_current_user
from app.v3.events.schemas import EventListResponse
from app.v3.organisations.schemas import OrganisationListResponse
from app.v3.user.service import fetch_user_account, fetch_user_events, fetch_user_organisations

router = APIRouter()


@router.get('/me', name='U-1', dependencies=[Depends(JWTBearer())], response_model=UserResponse)
async def get_user(current_user: User = Depends(get_current_user)) -> JSONResponse:
    """Get details of the current user"""
    return fetch_user_account(current_user=current_user)


@router.get('/organisations', name='U-2', dependencies=[Depends(JWTBearer())], response_model=OrganisationListResponse)
async def get_user_organisations(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> JSONResponse:
    """Get organisations the current user has created"""
    return fetch_user_organisations(current_user=current_user, db=db)


@router.get('/events', name='U-3', dependencies=[Depends(JWTBearer())], response_model=EventListResponse)
async def get_user_events(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> JSONResponse:
    """Get events the current user has created"""
    return fetch_user_events(current_user=current_user, db=db)
