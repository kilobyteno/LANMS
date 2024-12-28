import logging
import secrets
import string
from datetime import datetime, timedelta, timezone
from typing import Dict

import jwt
from fastapi import Depends, Request
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from passlib.context import CryptContext
from pydantic import SecretStr
from sqlalchemy.orm import Session
from starlette import status

from app.dependencies import get_db
from app.models.user import User
from app.v3.utils import CustomExceptionError
from config import Config

pwd_context = CryptContext(schemes=['bcrypt'], deprecated='auto')


def generate_random_password(length: int = Config.PASSWORD_MIN_LENGTH) -> SecretStr:
    """Generate random password"""
    # Define the character sets
    alphabet = string.ascii_letters + string.digits + string.punctuation

    # Generate a secure random password
    return SecretStr(''.join(secrets.choice(alphabet) for _ in range(length)))


def create_user_tokens(user: User) -> Dict[str, str]:
    """
    Create access and refresh tokens for the user.

    :param user: User instance
    :type user: User

    :return: Dictionary containing the access and refresh tokens
    :rtype: Dict[str, str]
    """
    access_token_expires = timedelta(minutes=Config.ACCESS_TOKEN_EXPIRE_MINUTES)
    refresh_token_expires = timedelta(minutes=Config.REFRESH_TOKEN_EXPIRE_MINUTES)
    user_data = {
        'email': user.email,
        'privacy_policy_accepted_at': str(user.privacy_policy_accepted_at) if user.privacy_policy_accepted_at else None,
        'terms_of_service_accepted_at': str(user.terms_of_service_accepted_at) if user.terms_of_service_accepted_at else None,
    }
    access_token = create_access_token(data={'sub': str(user.id), 'data': user_data}, expires_delta=access_token_expires)
    refresh_token = create_refresh_token(data={'sub': str(user.id), 'data': user_data}, expires_delta=refresh_token_expires)
    return {'access_token': access_token, 'refresh_token': refresh_token}


def verify_password(plain_password: SecretStr, hashed_password: str) -> bool:
    """
    Verify plain password with hashed password

    :param plain_password: Plain password
    :type plain_password: str
    :param hashed_password: Hashed password
    :type hashed_password: str
    :return: True if password is verified, False otherwise
    :rtype: bool
    """
    return pwd_context.verify(plain_password.get_secret_value(), hashed_password)


def get_hashed_password(password: SecretStr) -> str:
    """
    Util function for hashing a password

    :param password: Password
    :type password: str
    :return: Hashed password
    :rtype: str
    """
    return pwd_context.hash(password.get_secret_value())


def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    """
    Create access token

    :param data: Data
    :type data: dict
    :param expires_delta: Expires delta
    :type expires_delta: timedelta or None
    :return: Access token
    :rtype: str
    """
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + expires_delta if expires_delta else datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({'exp': expire})
    return jwt.encode(payload=to_encode, key=Config.JWT_PRIVATE_KEY, algorithm=Config.JWT_ALGORITHM)


def create_refresh_token(data: dict, expires_delta: timedelta | None = None) -> str:
    """
    Create refresh token

    :param data: Data
    :type data: dict
    :param expires_delta: Expires delta
    :type expires_delta: timedelta or None
    :return: Refresh token
    :rtype: str
    """
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + expires_delta if expires_delta else datetime.now(timezone.utc) + timedelta(days=1)
    to_encode.update({'exp': expire})
    return jwt.encode(payload=to_encode, key=Config.JWT_PRIVATE_KEY, algorithm=Config.JWT_ALGORITHM)


def get_user_by_email(email: str, db: Session) -> User or None:
    """
    Get user by email

    :param email: Email
    :type email: str
    :param db: Database session
    :type db: Session
    :return: A user object
    :rtype: User or None
    """
    return db.query(User).filter_by(email=email, deleted_at=None).one_or_none()


def authenticate_user(email: str, password: SecretStr, db: Session) -> User or None:
    """
    Authenticate user

    :param email: Email of the user
    :type email: str
    :param password: Password
    :type password: SecretStr
    :param db: Database session
    :type db: Session
    :return: A user object
    :rtype: User or None
    """
    user = get_user_by_email(email, db)
    if user and verify_password(plain_password=password, hashed_password=user.password):
        return user
    return None


def validate_token(token: str) -> dict or None:
    """
    Validate token

    :param token: Token
    :type token: str
    :return: Payload
    :rtype: dict or None
    """
    try:
        payload = jwt.decode(jwt=token, key=Config.JWT_PUBLIC_KEY, algorithms=[Config.JWT_ALGORITHM])
        logging.debug(f'payload: {payload}')
        logging.debug(f'exp: {payload["exp"]}')
        logging.debug(f'now: {datetime.now(timezone.utc).timestamp()}')
        logging.debug(f'expires in seconds: {payload["exp"] - datetime.now(timezone.utc).timestamp()}')
        return payload if payload['exp'] >= datetime.now(timezone.utc).timestamp() else None
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None


def verify_jwt(token: str) -> bool:
    """
    Verify JWT token

    :param token: Token
    :type token: str
    :return: True if token is valid, False otherwise
    :rtype: bool
    """
    is_token_valid: bool = False
    payload = validate_token(token)
    if payload:
        is_token_valid = True
    return is_token_valid


class JWTBearer(HTTPBearer):
    """JWT Bearer Token Authentication"""

    def __init__(self, auto_error: bool = False):  # noqa: D107
        super().__init__(auto_error=auto_error)

    async def __call__(self, request: Request):  # noqa: D102
        credentials: HTTPAuthorizationCredentials = await super().__call__(request)
        if credentials:
            if not credentials.scheme == 'Bearer':
                raise CustomExceptionError(status_code=status.HTTP_401_UNAUTHORIZED, message='Invalid authentication scheme.')
            if not verify_jwt(credentials.credentials):
                raise CustomExceptionError(status_code=status.HTTP_401_UNAUTHORIZED, message='Invalid or expired token.')
            return credentials.credentials

        raise CustomExceptionError(status_code=status.HTTP_401_UNAUTHORIZED, message='Not authenticated.')


async def get_current_user(token: str = Depends(JWTBearer()), db: Session = Depends(get_db)) -> User or None:
    """
    Get current user

    :param token: Token
    :type token: str
    :param db: Database session
    :type db: Session
    :return: A user object
    :rtype: User or None
    """
    try:
        payload = jwt.decode(token, Config.JWT_PUBLIC_KEY, algorithms=[Config.JWT_ALGORITHM])
        user_id: str = payload.get('sub')
        if user_id is None:
            raise CustomExceptionError(status_code=status.HTTP_403_FORBIDDEN, message='Invalid token.')
        user = db.query(User).filter(User.id == user_id).one_or_none()
        if user is None:
            raise CustomExceptionError(status_code=status.HTTP_403_FORBIDDEN, message='User not found.')
        return user
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None


def create_reset_token(user: User) -> str:
    """
    Create reset token for reset password

    :param user: User
    :type user: User
    :return: Reset token
    :rtype: str
    """
    expire = datetime.now(timezone.utc) + timedelta(minutes=Config.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode = {'sub': str(user.id), 'exp': expire, 'type': 'reset'}
    return jwt.encode(to_encode, Config.JWT_PRIVATE_KEY, algorithm=Config.JWT_ALGORITHM)


def verify_reset_token(token: str) -> bool:
    """
    Verify reset token

    :param token: Token
    :type token: str
    :return: True if token is valid, False otherwise
    :rtype: bool
    """
    try:
        payload = jwt.decode(token, Config.JWT_PUBLIC_KEY, algorithms=[Config.JWT_ALGORITHM])
        user_id = payload.get('sub')
        if user_id is None or payload.get('exp') < datetime.now(timezone.utc).timestamp():
            raise CustomExceptionError(status_code=status.HTTP_403_FORBIDDEN, message='Invalid or expired token.')
    except jwt.ExpiredSignatureError:
        return False
    except jwt.InvalidTokenError:
        return False
    return True


def format_email_from_input(email: str) -> str:
    """Format email from input"""
    return email.lower().strip()


def get_user_id_from_token(token: str) -> str:
    """
    Get user ID from token

    :param token: Token
    :type token: str
    :return: User ID
    :rtype: str
    """
    payload = jwt.decode(token, Config.JWT_PUBLIC_KEY, algorithms=[Config.JWT_ALGORITHM])
    return payload.get('sub')
