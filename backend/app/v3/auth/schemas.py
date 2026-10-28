import re
from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, SecretStr, constr, field_validator, model_validator
from starlette import status

from app.v3.utils import CustomExceptionError
from app.v3.uuid_types import UUID7
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

    name: str | None = None
    phone_code: str | None = None
    phone_number: str | None = None
    email: EmailStr
    password: SecretStr
    referrer: str | None = None

    @field_validator('name')
    @classmethod
    def normalize_name(cls, value: str | None):
        """Strip whitespace; treat blank as absent."""
        if value is None:
            return None
        stripped = value.strip()
        return stripped if stripped else None

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

    @model_validator(mode='after')
    def validate_phone_optional_pair(self):
        """If either phone field is set, both must be set and valid."""
        code = self.phone_code
        num = self.phone_number
        code_set = code is not None and str(code).strip() != ''
        num_set = num is not None and str(num).strip() != ''
        if code_set ^ num_set:
            raise CustomExceptionError(
                status_code=status.HTTP_400_BAD_REQUEST,
                message='Both phone_code and phone_number are required when providing a phone number.',
            )
        if not code_set and not num_set:
            self.phone_code = None
            self.phone_number = None
            return self
        code = str(code).strip()
        num = str(num).strip()
        if not re.match(r'^\+\d{1,3}$', code):
            raise CustomExceptionError(status_code=status.HTTP_400_BAD_REQUEST, message='Phone code must match + followed by 1-3 digits.')
        if not code.startswith('+'):
            raise CustomExceptionError(status_code=status.HTTP_400_BAD_REQUEST, message='Phone code must start with a "+" symbol.')
        if not num.isdigit():
            raise CustomExceptionError(status_code=status.HTTP_400_BAD_REQUEST, message='Phone number must contain only digits.')
        self.phone_code = code
        self.phone_number = num
        return self


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

    name: constr(max_length=256) | None = None
    email: EmailStr | None = None
    phone_code: constr(max_length=12) | None = None
    phone_number: constr(max_length=32) | None = None
    referrer: str | None = None
    photo_url: str | None = None

    @property
    def phone(self) -> str | None:
        """Return phone number with country code"""
        if self.phone_code and self.phone_number:
            return f'{self.phone_code}{self.phone_number}'
        return None


class UserResponse(UserBase):
    """User response model"""

    model_config = ConfigDict(from_attributes=True)

    id: UUID7
    email_verified_at: datetime | None = None
    privacy_policy_accepted_at: datetime | None = None
    terms_of_service_accepted_at: datetime | None = None
    refresh_token: str | None = None


class A10Input(BaseModel):
    """Input model for resending OTP"""

    email: EmailStr
