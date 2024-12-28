from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, EmailStr, SecretStr, constr, field_validator
from starlette import status

from app.v3.utils import CustomExceptionError
from config import Config


class A1Input(BaseModel):
    """Input model for generating OTP"""

    email: EmailStr


class A2Input(BaseModel):
    """Input model for verifying OTP"""

    email: EmailStr
    code: str = 'ABC123'


class A4Output(BaseModel):
    """Token model"""

    access_token: str
    refresh_token: str
    token_type: str


class A6Output(BaseModel):
    """Token model"""

    access_token: str
    token_type: str


class A3Input(BaseModel):
    """Input model user sign up"""

    name: str
    phone_code: constr(pattern=r'^\+\d{1,3}$')  # e.g., +44, +1, +91, +505
    phone_number: str
    email: EmailStr
    password: SecretStr
    referrer: Optional[str] = None

    @field_validator('phone_code')
    @classmethod
    def validate_phone_code(cls, value):
        """Validate phone code"""
        if not value.startswith('+'):
            raise CustomExceptionError(status_code=status.HTTP_400_BAD_REQUEST, message='Phone code must start with a "+" symbol.')
        return value

    @field_validator('phone_number')
    @classmethod
    def validate_phone_number(cls, value):
        """Validate phone number"""
        if not value.isdigit():
            raise CustomExceptionError(status_code=status.HTTP_400_BAD_REQUEST, message='Phone number must contain only digits.')
        return value

    @field_validator('password')
    @classmethod
    def validate_password(cls, value):
        """Validate password"""
        if len(value) < Config.PASSWORD_MIN_LENGTH:
            raise CustomExceptionError(
                status_code=status.HTTP_400_BAD_REQUEST,
                message=f'Password is too short. Must be of minimum length of {Config.PASSWORD_MIN_LENGTH}.',
            )
        return value


class A4Input(BaseModel):
    """Input model user login"""

    email: EmailStr
    password: SecretStr


class A7Input(BaseModel):
    """Input model user login"""

    old_password: SecretStr
    password: SecretStr
    password_confirmation: SecretStr


class A8Input(BaseModel):
    """Input for forgot password"""

    email: EmailStr


class A9Input(BaseModel):
    """Input for reset password"""

    reset_token: str
    password: SecretStr
    password_confirmation: SecretStr


class A6Input(BaseModel):
    """Input for refresh token"""

    refresh_token: str


class UserBase(BaseModel):
    """Base user model"""

    name: constr(max_length=256)
    email: Optional[EmailStr] = None
    phone_code: Optional[constr(max_length=12)] = None
    phone_number: Optional[constr(max_length=32)] = None
    referrer: Optional[str] = None
    photo_url: Optional[str] = None

    @property
    def phone(self) -> Optional[str]:
        """Return phone number with country code"""
        if self.phone_code and self.phone_number:
            return f'{self.phone_code}{self.phone_number}'
        return None


class UserResponse(UserBase):
    """User response model"""

    id: UUID
    email_verified_at: Optional[datetime] = None
    privacy_policy_accepted_at: Optional[datetime] = None
    terms_of_service_accepted_at: Optional[datetime] = None
    refresh_token: Optional[str] = None

    class Config:
        """Pydantic config"""

        orm_mode = True  # Enables compatibility with SQLAlchemy models


class A10Input(BaseModel):
    """Input model for resending OTP"""

    email: EmailStr
