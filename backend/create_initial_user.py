"""
Create the first application user from INITIAL_USER_EMAIL and INITIAL_USER_PASSWORD.

Run once after database migrations, for example in deployment:

    uv run python create_initial_user.py

Requires the same environment as the API (see .env). Idempotent: if an active user
with that email already exists, exits successfully without changes.
"""

from __future__ import annotations

import logging
import sys
from datetime import UTC, datetime
from typing import TYPE_CHECKING

from pydantic import SecretStr
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, sessionmaker

from app.dependencies import get_db_engine
from app.models.user import User
from app.v3.auth.utils import format_email_from_input, get_hashed_password
from app.v3.utils import get_avatar_url
from config import Config

if TYPE_CHECKING:
    from sqlalchemy.engine import Engine

log = logging.getLogger(__name__)


def bootstrap_initial_user(
    email_raw: str,
    password_raw: str,
    engine: Engine,
    *,
    password_min_length: int,
) -> int:
    """
    Create an initial user if one does not already exist for the email.

    :param email_raw: Email as provided (normalized with format_email_from_input).
    :param password_raw: Plain password (hashed before storage).
    :param engine: SQLAlchemy engine (e.g. production DB or in-memory SQLite in tests).
    :param password_min_length: Minimum password length (typically Config.PASSWORD_MIN_LENGTH).
    :return: 0 on success or idempotent no-op, 1 on validation or database error.
    """
    if not email_raw or not password_raw:
        log.error('Email and password must both be set (e.g. INITIAL_USER_EMAIL and INITIAL_USER_PASSWORD).')
        return 1

    email = format_email_from_input(email_raw)
    if len(password_raw) < password_min_length:
        log.error(
            'INITIAL_USER_PASSWORD must be at least %s characters (PASSWORD_MIN_LENGTH).',
            password_min_length,
        )
        return 1

    session_factory = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db: Session = session_factory()

    try:
        existing = db.query(User).filter(User.email == email).one_or_none()
        if existing is not None:
            if existing.deleted_at is None:
                log.info('User with email %s already exists; nothing to do.', email)
                return 0
            log.error(
                'Email %s is tied to a soft-deleted user; resolve in the database before creating a new user.',
                email,
            )
            return 1

        display_name = email.split('@', maxsplit=1)[0] or 'Admin'
        now = datetime.now(tz=UTC)
        user = User(
            name=display_name[:256],
            email=email,
            password=get_hashed_password(SecretStr(password_raw)),
            photo_url=get_avatar_url(display_name),
            email_verified_at=now,
            terms_of_service_accepted_at=now,
            privacy_policy_accepted_at=now,
        )
        db.add(user)
        db.commit()
        log.info('Created initial user for %s.', email)
        return 0
    except IntegrityError as e:
        db.rollback()
        log.error('Could not create user: %s', e)
        return 1
    finally:
        db.close()


def main() -> int:
    """Create initial user when env vars are set; no-op or error otherwise."""
    logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')
    return bootstrap_initial_user(
        Config.INITIAL_USER_EMAIL,
        Config.INITIAL_USER_PASSWORD,
        get_db_engine(),
        password_min_length=Config.PASSWORD_MIN_LENGTH,
    )


if __name__ == '__main__':
    sys.exit(main())
