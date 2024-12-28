import logging
import socket
from os import getenv, makedirs, path
from pathlib import Path
from typing import ClassVar, Optional

import sentry_sdk
from dotenv import load_dotenv
from sentry_sdk.integrations.fastapi import FastApiIntegration
from sentry_sdk.integrations.sqlalchemy import SqlalchemyIntegration
from sentry_sdk.integrations.starlette import StarletteIntegration
from tunsberg.konfig import check_required_env_vars, uvicorn_log_config

PROJECT_DIR: Path = Path(__file__).parent

# Initial Logging Configuration
LOG_FORMAT = '%(asctime)s - %(levelname)s - %(name)s - %(message)s'
_LOG_PATH = './logs/'
LOG_FILE_PATH = f'{_LOG_PATH}app.log'
if not path.exists(_LOG_PATH):
    makedirs(_LOG_PATH)
if not path.exists(LOG_FILE_PATH):
    with open(LOG_FILE_PATH, 'w'):
        pass

# Set up logging with debug level for initial bootstrapping
logging.basicConfig(level=logging.DEBUG, handlers=[logging.StreamHandler()], format=LOG_FORMAT)


class HealthCheckFilter(logging.Filter):
    """Filter to exclude health check logs"""

    def filter(self, record: logging.LogRecord) -> bool:
        """Filter out log messages containing the health check endpoint"""
        return '/v3/system/up' not in record.getMessage()


# Remove health check logs from uvicorn.access logs
logging.getLogger('uvicorn.access').addFilter(HealthCheckFilter())

# Load .env file if it exists
load_dotenv()


class Config:
    """Configuration class for the application"""

    # Build Environment
    CODE_BUILD: bool = bool(getenv('CODE_BUILD', ''))

    # Environment
    LOCAL_DEVELOPMENT_ENVS: ClassVar[str] = ['dev', 'test', 'local']
    STAGING_ENVS: ClassVar[str] = ['staging']
    PROD_ENVS: ClassVar[str] = ['production', 'prod']
    LIVE_ENVS: ClassVar[str] = STAGING_ENVS + PROD_ENVS
    DEBUG: bool = bool(getenv('DEBUG', ''))
    ENV: str = getenv('ENV')

    # Microservice
    MICRO_SERVICE_NAME: str = 'lanms-backend'  # Change this to the name of the microservice
    MICRO_SERVICE_NAME_FOR_HUMANS: str = 'LANMS Backend'  # Change this to the name of the microservice
    IN_LOCAL_DEVELOPMENT_ENV: bool = bool(ENV in LOCAL_DEVELOPMENT_ENVS)
    IN_STAGING_ENV: bool = bool(ENV in STAGING_ENVS)
    IN_PROD_ENV: bool = bool(ENV in PROD_ENVS)
    MICRO_SERVICE_IS_LIVE: bool = bool(ENV in LIVE_ENVS)
    MICRO_SERVICE_IN_PRODUCTION: bool = IN_PROD_ENV
    MICRO_SERVICE_IN_STAGING: bool = IN_STAGING_ENV
    try:
        HOSTNAME: str = socket.gethostname() or 'unknown'
    except socket.gaierror:
        HOSTNAME: str = 'unknown'
    try:
        IPADDRESS: str = socket.gethostbyname(HOSTNAME) or 'unknown'
    except socket.gaierror:
        IPADDRESS: str = 'unknown'

    # Debug
    DEBUG_MODE: bool = bool(IN_LOCAL_DEVELOPMENT_ENV or DEBUG)

    # Logging
    LOG_LEVEL = logging.DEBUG if DEBUG else logging.INFO

    # Debug logging
    logging.debug(f'ENV: {ENV}')
    logging.debug(f'DEBUG: {DEBUG}')
    logging.debug(f'CODE_BUILD: {CODE_BUILD}')
    logging.debug(f'MICRO_SERVICE_NAME: {MICRO_SERVICE_NAME}')
    logging.debug(f'MICRO_SERVICE_IS_LIVE: {MICRO_SERVICE_IS_LIVE}')
    logging.debug(f'MICRO_SERVICE_IN_STAGING: {MICRO_SERVICE_IN_STAGING}')
    logging.debug(f'MICRO_SERVICE_IN_PRODUCTION: {MICRO_SERVICE_IN_PRODUCTION}')
    logging.debug(f'HOSTNAME: {HOSTNAME}')
    logging.debug(f'IPADDRESS: {IPADDRESS}')
    logging.debug(f'IN_LOCAL_DEVELOPMENT_ENV: {IN_LOCAL_DEVELOPMENT_ENV}')
    logging.debug(f'DEBUG_MODE: {DEBUG_MODE}')

    # Database
    DATABASE_DEBUG: bool = bool(getenv('DATABASE_DEBUG', ''))
    logging.debug(f'DATABASE_DEBUG: {DATABASE_DEBUG}')
    DATABASE_INFO: ClassVar[dict] = {
        'hostname': getenv('DB_HOST', 'localhost'),
        'username': getenv('DB_USERNAME', 'postgres'),
        'password': getenv('DB_PASSWORD', 'postgres'),
        'port': getenv('DB_PORT', '5432'),
        'db_dialect': getenv('DB_DIALECT', 'postgresql'),
        'db_name': getenv('DB_NAME', 'blank'),
    }
    SQLALCHEMY_DATABASE_URI: str = (
        f"{DATABASE_INFO['db_dialect']}://{DATABASE_INFO['username']}:{DATABASE_INFO['password']}@{DATABASE_INFO['hostname']}:"
        f"{DATABASE_INFO['port']}/{DATABASE_INFO['db_name']}"
        if ENV != 'test'
        else f'{getenv("SQLALCHEMY_DATABASE_URI")}'
    )

    # API Docs
    API_DOCS_TITLE: str = f'{MICRO_SERVICE_NAME_FOR_HUMANS} API'
    API_DOCS_VERSION: str = '3.0'
    API_DOCS_DESCRIPTION: str = f'Endpoints for the {MICRO_SERVICE_NAME_FOR_HUMANS}'
    API_DOCS_OPENAPI_URL: Optional[str] = None if MICRO_SERVICE_IN_PRODUCTION else '/openapi.json'
    API_DOCS_URL: str = '/docs'

    # Portal
    PORTAL_URL: str = getenv('PORTAL_URL')

    # CORS
    CORS_ALLOW_ORIGIN: str = PORTAL_URL
    if IN_LOCAL_DEVELOPMENT_ENV:
        CORS_ALLOW_ORIGIN = '*'

    # JWT Token
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(getenv('ACCESS_TOKEN_EXPIRE_MINUTES', '60'))  # 1 hour
    REFRESH_TOKEN_EXPIRE_MINUTES: int = int(getenv('REFRESH_TOKEN_EXPIRE_MINUTES', '43200'))  # 30 days

    JWT_ALGORITHM: str = getenv('JWT_ALGORITHM', 'RS256')
    JWT_PUBLIC_KEY: str = getenv('JWT_PUBLIC_KEY', '').replace('\\n', '\n').replace('\\', '')
    JWT_PRIVATE_KEY: str = getenv('JWT_PRIVATE_KEY', '').replace('\\n', '\n').replace('\\', '')

    # OTP Configuration
    OTP_SECRET_KEY: str = getenv('OTP_SECRET_KEY')
    OTP_VALIDITY_SECS: ClassVar[int] = int(getenv('OTP_VALIDITY_SECS', '300'))  # 5 minutes
    OTP_DIGITS: int = 6

    # Sentry
    SENTRY_DSN: Optional[str] = getenv('SENTRY_DSN')
    if SENTRY_DSN and MICRO_SERVICE_IS_LIVE:
        sentry_sdk.init(
            dsn=SENTRY_DSN,
            enable_tracing=False,  # Disable tracing for now
            environment=str(ENV).lower(),
            integrations=[
                FastApiIntegration(transaction_style='url'),
                SqlalchemyIntegration(),
                StarletteIntegration(),
            ],
        )
    elif not SENTRY_DSN and MICRO_SERVICE_IS_LIVE:
        logging.warning('Sentry DSN not set!')

    # Email
    FROM_EMAIL: str = getenv('FROM_EMAIL')

    # Sendgrid Email Config
    SENDGRID_API_KEY: Optional[str] = getenv('SENDGRID_API_KEY')
    if not SENDGRID_API_KEY:
        logging.warning('Sendgrid API Key not set!')

    # Postmark Email Config
    POSTMARK_API_KEY: Optional[str] = getenv('POSTMARK_API_KEY')
    if not POSTMARK_API_KEY:
        logging.warning('Postmark API Key not set!')

    # Portal
    PORTAL_URL: str = getenv('PORTAL_URL')

    # Validation
    PASSWORD_MIN_LENGTH: int = int(getenv('PASSWORD_MIN_LENGTH', '12'))

    # Super Admin
    SUPER_ADMINS: ClassVar[list[str]] = getenv('SUPER_ADMINS', '').split(',')

    # Max file sizes
    MAX_IMAGE_SIZE_KB = int(getenv('MAX_IMAGE_SIZE_KB', '10240'))
    MAX_FILE_SIZE_KB = int(getenv('MAX_FILE_SIZE_KB', '10240'))

    # Third Party Services
    UVICORN_LOG_CONFIG: ClassVar[dict] = uvicorn_log_config(log_level=LOG_LEVEL, log_file_path=LOG_FILE_PATH, log_format=LOG_FORMAT)


# Check all required environment variables are set
_REQUIRED_ENV_VARS = {
    'ENV': {'runtime': True, 'build': True},
    'JWT_PUBLIC_KEY': {'runtime': True, 'build': False},
    'JWT_PRIVATE_KEY': {'runtime': True, 'build': False},
    'PORTAL_URL': {'runtime': True, 'build': False},
    'OTP_SECRET_KEY': {'runtime': True, 'build': False},
}
check_required_env_vars(required_env_vars=_REQUIRED_ENV_VARS, env=Config.ENV, live_envs=Config.LIVE_ENVS, code_build=Config.CODE_BUILD)
