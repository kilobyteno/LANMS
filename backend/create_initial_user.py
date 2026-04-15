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

from pydantic import SecretStr
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, sessionmaker

from app.dependencies import get_db_engine
from app.models.user import User
from app.v3.auth.utils import format_email_from_input, get_hashed_password
from app.v3.utils import get_avatar_url
from config import Config

log = logging.getLogger(__name__)


def main() -> int:
    """Create initial user when env vars are set; no-op or error otherwise."""
    logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')

    email_raw = Config.INITIAL_USER_EMAIL
    password_raw = Config.INITIAL_USER_PASSWORD

    if not email_raw or not password_raw:
        log.error('Set INITIAL_USER_EMAIL and INITIAL_USER_PASSWORD in the environment before running this command.')
        return 1

    email = format_email_from_input(email_raw)
    if len(password_raw) < Config.PASSWORD_MIN_LENGTH:
        log.error('INITIAL_USER_PASSWORD must be at least %s characters (PASSWORD_MIN_LENGTH).', Config.PASSWORD_MIN_LENGTH)
        return 1

    engine = get_db_engine()
    session_factory = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db: Session = session_factory()

    try:
        existing = db.query(User).filter(User.email == email).one_or_none()
        if existing is not None:
            if existing.deleted_at is None:
                log.info('User with email %s already exists; nothing to do.', email)
                return 0
            log.error('Email %s is tied to a soft-deleted user; resolve in the database before creating a new user.', email)
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


if __name__ == '__main__':
    sys.exit(main())
