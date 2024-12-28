import logging
from datetime import datetime, timedelta, timezone

import jwt
import pyotp
from pydantic import TypeAdapter
from sqlalchemy import or_
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from tunsberg.responses import (
    response_bad_request,
    response_conflict,
    response_created,
    response_internal_server_error,
    response_not_found,
    response_success,
    response_unauthorized,
)

from app.models.user import Otp, User
from app.v3.auth.schemas import (
    A1Input,
    A2Input,
    A3Input,
    A4Input,
    A4Output,
    A6Input,
    A6Output,
    A7Input,
    A9Input,
    A10Input,
    UserResponse,
)
from app.v3.auth.utils import (
    authenticate_user,
    create_access_token,
    create_reset_token,
    create_user_tokens,
    format_email_from_input,
    get_hashed_password,
    get_user_by_email,
    get_user_id_from_token,
    validate_token,
    verify_password,
    verify_reset_token,
)
from app.v3.utils import get_avatar_url, get_portal_url, send_email
from config import Config


def signup_generate_otp(request_data: A1Input, db: Session):
    """Start signup by generating an OTP"""
    # Check if the user already exists
    user = db.query(User).filter(User.email == request_data.email, User.email_verified_at.is_(None)).first()
    if user:
        return response_conflict(message='User with the email already exists')

    # Check if the user already has an OTP that has not been used and has not expired
    otp = (
        db.query(Otp)
        .filter(Otp.email == request_data.email, Otp.used_at.is_(None), Otp.expires_at > datetime.now(tz=timezone.utc), Otp.deleted_at.is_(None))
        .first()
    )
    if otp:
        return response_conflict(message='User with the email already has an OTP that has not been used and has not expired')

    # Generate OTP
    generated_otp = pyotp.TOTP(s=Config.OTP_SECRET_KEY, digits=Config.OTP_DIGITS, issuer=Config.MICRO_SERVICE_NAME, name=request_data.email)

    # Save the OTP
    otp = Otp(
        email=request_data.email,
        code=generated_otp.now(),
        expires_at=datetime.now(tz=timezone.utc) + timedelta(seconds=Config.OTP_VALIDITY_SECS),
    )
    try:
        db.add(otp)
        db.commit()
    except IntegrityError as e:
        db.rollback()
        logging.error(f'Error creating OTP: {e}')
        return response_internal_server_error(message='Could not generate OTP. Please contact support!')

    # Send the OTP via email
    email_sent = send_email(
        to=request_data.email,
        subject='OTP for account verification',
        html_content=f'Your OTP is: {otp.code}',
    )
    if not email_sent:
        return response_internal_server_error(message='Could not send OTP. Please contact support!')

    return response_success(message='An OTP has been sent to your email')


def signup_verify_otp(request_data: A2Input, db: Session):
    """Verify an OTP"""
    # Check if the user already exists
    user = db.query(User).filter(User.email == request_data.email, User.email_verified_at.is_(None)).first()
    if user:
        return response_conflict(message='User with the email already exists')

    logging.debug(f'Verifying OTP for email: {request_data.email}')
    logging.debug(f'Code: {request_data.code}')

    # Get the OTP
    otp = (
        db.query(Otp)
        .filter(
            Otp.email == request_data.email,
            Otp.code == request_data.code,
            Otp.used_at.is_(None),
            Otp.expires_at > datetime.now(tz=timezone.utc),
            Otp.deleted_at.is_(None),
        )
        .first()
    )
    if not otp:
        return response_bad_request(message='Invalid code or it has expired, please request a new OTP')

    # Mark the OTP as used
    try:
        otp.used_at = datetime.now(tz=timezone.utc)
        db.commit()
    except IntegrityError as e:
        db.rollback()
        logging.error(f'Error updating OTP: {e}')
        return response_internal_server_error(message='Could not verify OTP. Please contact support!')

    return response_success(message='OTP verified')


def signup_details(request_data: A3Input, db: Session):
    """Signup details for a user"""
    # Build filter conditions based on the request data
    filter_conditions = [User.email == request_data.email]
    if request_data.phone_number:
        filter_conditions.append(User.phone_number == request_data.phone_number)

    # Query for user
    # This query checks if a user exists with either the given email or phone number if provided
    user = db.query(User).filter(or_(*filter_conditions), User.deleted_at.is_(None)).first()
    if user:
        return response_conflict(message='User with the email or phone number already exists')

    # Verify that the user has validated an OTP for the email
    otp = db.query(Otp).filter(Otp.email == request_data.email, Otp.used_at.isnot(None), Otp.deleted_at.is_(None)).first()
    if not otp:
        return response_bad_request(message='Please verify your email with the OTP sent to your email')

    # Create the user
    user = User(
        name=request_data.name,
        phone_code=request_data.phone_code,
        phone_number=request_data.phone_number,
        email=request_data.email,
        password=get_hashed_password(request_data.password),
        photo_url=get_avatar_url(request_data.name),
        referrer=request_data.referrer,
        terms_of_service_accepted_at=datetime.now(tz=timezone.utc),
        privacy_policy_accepted_at=datetime.now(tz=timezone.utc),
    )
    try:
        db.add(user)
        db.commit()
    except IntegrityError as e:
        db.rollback()
        logging.error(f'Error creating user profile: {e}')
        return response_internal_server_error(message='Could not create user using these details. Please contact support!')

    # Return the user
    adapter = TypeAdapter(UserResponse)
    returned_user = adapter.dump_json(user)
    return response_created(message='User registration successful', data=returned_user)


def login(request_data: A4Input, db: Session):
    """User login"""
    user = authenticate_user(email=request_data.email, password=request_data.password, db=db)
    if not user:
        return response_bad_request(message='Invalid credentials')
    try:
        tokens = create_user_tokens(user=user)
        access_token = tokens.get('access_token')
        refresh_token = tokens.get('refresh_token')
        user.refresh_token = refresh_token
        db.commit()
    except Exception as e:
        logging.error(f'Error creating tokens: {e}')
        return response_internal_server_error(message='Could not create tokens. Please contact support!')
    token = A4Output(access_token=access_token, refresh_token=refresh_token, token_type='bearer').model_dump()
    return response_success(message='Login successful', data=token)


def post_refresh_token(request_data: A6Input, db: Session):
    """Get refresh token"""
    payload = validate_token(request_data.refresh_token)
    if not payload:
        return response_unauthorized(message='Invalid token')
    user_id: int = payload.get('sub')
    user = db.query(User).filter_by(id=user_id).one_or_none()
    if user and user.refresh_token != request_data.refresh_token:
        return response_unauthorized(message='Please log in again!')

    access_token_expires = timedelta(minutes=Config.ACCESS_TOKEN_EXPIRE_MINUTES)
    user_data = payload.get('data')
    access_token = create_access_token(data={'sub': payload.get('sub'), 'data': user_data}, expires_delta=access_token_expires)
    data = {'access_token': access_token, 'token_type': 'bearer'}
    return response_success(message='Token refreshed', data=data)


def logout(current_user, token, db: Session):
    """Logout"""
    current_user.refresh_token = None

    payload = jwt.decode(token, Config.JWT_PUBLIC_KEY, algorithms=[Config.JWT_ALGORITHM])
    payload['exp'] = datetime.now(tz=timezone.utc) - timedelta(seconds=60)
    encoded_jwt = jwt.encode(payload, Config.JWT_PRIVATE_KEY, algorithm=Config.JWT_ALGORITHM)

    db.add(current_user)
    db.commit()
    expired_token = A6Output(access_token=encoded_jwt, token_type='bearer').model_dump()

    return response_success(message='Logout successful', data=expired_token)


def password_change(request_data: A7Input, current_user, db: Session):
    """Change Password"""
    if not verify_password(plain_password=request_data.old_password, hashed_password=current_user.password):
        return response_bad_request(message='The password does not match with the current password')

    if request_data.password != request_data.password_confirmation:
        return response_bad_request(message='The new password fields do not match')

    if verify_password(plain_password=request_data.password, hashed_password=current_user.password):
        return response_bad_request(message='The new password cannot be the same as the current password')

    if len(request_data.password) < Config.PASSWORD_MIN_LENGTH:
        return response_bad_request(message=f'Password must be at least {Config.PASSWORD_MIN_LENGTH} characters long')

    current_user.password = get_hashed_password(request_data.password)
    db.commit()
    return response_success(message='Password successfully changed')


def password_forgot(request_data, db):
    """Forgot password"""
    email = format_email_from_input(request_data.email)
    user = get_user_by_email(email=email, db=db)
    if not user:
        return response_not_found(message='User not found')

    # Send email
    reset_token = create_reset_token(user=user)
    email_sent = send_email(
        to=email,
        subject='Password reset link',
        html_content=f'Your password reset link is: {get_portal_url(path=f"/auth/reset-password?reset_token={reset_token}")}',
    )
    if not email_sent:
        return response_internal_server_error(message='Could not send email. Please contact support!')

    return response_success(message='Password reset link sent to your email')


def password_reset(request_data: A9Input, db: Session):
    """Reset Password"""
    reset_token_verified = verify_reset_token(request_data.reset_token)
    if not reset_token_verified:
        return response_bad_request(message='Invalid or expired token, please request a new one')

    user_id = get_user_id_from_token(request_data.reset_token)
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return response_not_found(message='User not found')

    if request_data.password != request_data.password_confirmation:
        return response_bad_request(message='The new password fields do not match')

    if len(request_data.password) < Config.PASSWORD_MIN_LENGTH:
        return response_bad_request(message=f'Password must be at least {Config.PASSWORD_MIN_LENGTH} characters long')

    user.password = get_hashed_password(request_data.password)
    db.commit()
    return response_success(message='Password successfully reset')


def resend_otp(request_data: A10Input, db: Session):
    """Resend OTP to user's email"""
    # Check if there's an existing unused and unexpired OTP
    otp = (
        db.query(Otp)
        .filter(Otp.email == request_data.email, Otp.used_at.is_(None), Otp.expires_at > datetime.now(tz=timezone.utc), Otp.deleted_at.is_(None))
        .first()
    )

    if otp:
        # Invalidate the existing OTP
        otp.soft_delete()
        db.commit()

    # Generate new OTP
    generated_otp = pyotp.TOTP(s=Config.OTP_SECRET_KEY, digits=Config.OTP_DIGITS, issuer=Config.MICRO_SERVICE_NAME, name=request_data.email)

    # Save the new OTP
    new_otp = Otp(
        email=request_data.email,
        code=generated_otp.now(),
        expires_at=datetime.now(tz=timezone.utc) + timedelta(seconds=Config.OTP_VALIDITY_SECS),
    )
    try:
        db.add(new_otp)
        db.commit()
    except IntegrityError as e:
        db.rollback()
        logging.error(f'Error creating OTP: {e}')
        return response_internal_server_error(message='Could not generate OTP. Please contact support!')

    # Send the OTP via email
    email_sent = send_email(
        to=request_data.email,
        subject='OTP for account verification',
        html_content=f'Your OTP is: {new_otp.code}',
    )
    if not email_sent:
        return response_internal_server_error(message='Could not send OTP. Please contact support!')

    return response_success(message='A new OTP has been sent to your email')
