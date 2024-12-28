from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from app.dependencies import get_db
from app.models.user import User
from app.v3.auth.schemas import A1Input, A2Input, A3Input, A4Input, A4Output, A6Input, A6Output, A7Input, A8Input, A9Input, A10Input, UserResponse
from app.v3.auth.service import (
    login,
    logout,
    password_change,
    password_forgot,
    password_reset,
    post_refresh_token,
    resend_otp,
    signup_details,
    signup_generate_otp,
    signup_verify_otp,
)
from app.v3.auth.utils import JWTBearer, get_current_user

router = APIRouter()


@router.post('/signup', name='A-1')
async def post_generate_otp(request_data: A1Input, db: Session = Depends(get_db)) -> JSONResponse:
    """Start signup by generating an OTP."""
    return signup_generate_otp(request_data=request_data, db=db)


@router.post('/signup/resend', name='A-10')
async def post_resend_otp(request_data: A10Input, db: Session = Depends(get_db)) -> JSONResponse:
    """Resend OTP for signup verification."""
    return resend_otp(request_data=request_data, db=db)


@router.post('/signup/verify', name='A-2')
async def post_verify_otp(request_data: A2Input, db: Session = Depends(get_db)) -> JSONResponse:
    """Verify an OTP."""
    return signup_verify_otp(request_data=request_data, db=db)


@router.post('/signup/details', name='A-3', response_model=UserResponse)
async def post_signup(request_data: A3Input, db: Session = Depends(get_db)) -> JSONResponse:
    """First step of user signup."""
    return signup_details(request_data=request_data, db=db)


@router.post('/login', name='A-4', response_model=A4Output)
async def post_login(request_data: A4Input, db: Session = Depends(get_db)) -> JSONResponse:
    """Endpoint for user login."""
    return login(request_data=request_data, db=db)


@router.post('/logout', name='A-5', dependencies=[Depends(JWTBearer())])
async def post_logout(current_user: User = Depends(get_current_user), token: str = Depends(JWTBearer()), db: Session = Depends(get_db)) -> JSONResponse:
    """Endpoint for user logout."""
    return logout(current_user=current_user, token=token, db=db)


@router.post('/refresh', name='A-6', response_model=A6Output)
async def post_update_refresh_token(request_data: A6Input, db: Session = Depends(get_db)) -> JSONResponse:
    """Endpoint for getting a new access token."""
    return post_refresh_token(request_data=request_data, db=db)


@router.post('/password/change', name='A-7', dependencies=[Depends(JWTBearer())])
async def post_password_change(request_data: A7Input, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> JSONResponse:
    """Endpoint for changing password"""
    return password_change(request_data=request_data, current_user=current_user, db=db)


@router.post('/password/forgot', name='A-8')
async def post_password_forgot(request_data: A8Input, db: Session = Depends(get_db)) -> JSONResponse:
    """Endpoint for forgot password"""
    return password_forgot(request_data=request_data, db=db)


@router.post('/password/reset', name='A-9')
async def post_password_reset(request_data: A9Input, db: Session = Depends(get_db)) -> JSONResponse:
    """Endpoint for reset password"""
    return password_reset(request_data=request_data, db=db)
