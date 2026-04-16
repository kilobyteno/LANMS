"""Tests for ``create_initial_user`` bootstrap logic."""

from __future__ import annotations

from datetime import UTC, datetime

from pydantic import SecretStr
from sqlalchemy.orm import Session, sessionmaker

from app.models.user import User
from app.v3.auth.utils import verify_password
from create_initial_user import bootstrap_initial_user


def test_bootstrap_requires_email(sqlite_engine):
    """Exit code 1 when email is missing."""
    assert bootstrap_initial_user('', 'validpassword12', sqlite_engine, password_min_length=12) == 1


def test_bootstrap_requires_password(sqlite_engine):
    """Exit code 1 when password is missing."""
    assert bootstrap_initial_user('a@example.com', '', sqlite_engine, password_min_length=12) == 1


def test_bootstrap_rejects_short_password(sqlite_engine):
    """Exit code 1 when password is shorter than password_min_length."""
    assert bootstrap_initial_user('a@example.com', 'short', sqlite_engine, password_min_length=12) == 1


def test_bootstrap_creates_verified_user(sqlite_engine):
    """User is created with normalized email, verified flags, and working password hash."""
    assert bootstrap_initial_user('Admin@Example.COM', 'validpassword12', sqlite_engine, password_min_length=12) == 0

    db: Session = sessionmaker(bind=sqlite_engine)()
    try:
        user = db.query(User).filter(User.email == 'admin@example.com').one()
        assert user.name == 'admin'
        assert user.email_verified_at is not None
        assert user.terms_of_service_accepted_at is not None
        assert user.privacy_policy_accepted_at is not None
        assert verify_password(SecretStr('validpassword12'), user.password)
    finally:
        db.close()


def test_bootstrap_idempotent(sqlite_engine):
    """Second run with same email succeeds without duplicate user."""
    email = 'twice@example.com'
    assert bootstrap_initial_user(email, 'validpassword12', sqlite_engine, password_min_length=12) == 0
    assert bootstrap_initial_user(email, 'validpassword12', sqlite_engine, password_min_length=12) == 0

    db: Session = sessionmaker(bind=sqlite_engine)()
    try:
        assert db.query(User).filter(User.email == email).count() == 1
    finally:
        db.close()


def test_bootstrap_fails_when_email_only_soft_deleted_user_exists(sqlite_engine):
    """Unique email still occupied by soft-deleted row returns 1."""
    assert bootstrap_initial_user('gone@example.com', 'validpassword12', sqlite_engine, password_min_length=12) == 0

    db: Session = sessionmaker(bind=sqlite_engine)()
    try:
        user = db.query(User).filter(User.email == 'gone@example.com').one()
        user.deleted_at = datetime.now(tz=UTC)
        db.commit()
    finally:
        db.close()

    assert bootstrap_initial_user('gone@example.com', 'validpassword12', sqlite_engine, password_min_length=12) == 1
