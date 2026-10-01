"""Pytest fixtures: environment must be set before imports that load ``config``."""

from __future__ import annotations

import os

# Test env: required-env checks only apply to live environments and CODE_BUILD.
os.environ.setdefault('ENV', 'test')
os.environ.setdefault('SQLALCHEMY_DATABASE_URI', 'sqlite:///:memory:')
# Auth and docs config (used when tests import ``config`` / ``main``).
os.environ.setdefault('JWT_ALGORITHM', 'HS256')
os.environ.setdefault(
    'JWT_PRIVATE_KEY',
    'test-jwt-secret-key-at-least-32-characters-long-for-hs256',
)
os.environ.setdefault('JWT_PUBLIC_KEY', os.environ['JWT_PRIVATE_KEY'])
os.environ.setdefault('OTP_SECRET_KEY', 'test-otp-secret-key-32-characters-minimum')
os.environ.setdefault('PORTAL_URL', 'http://localhost:3000')

import pytest
from sqlalchemy import create_engine
from sqlalchemy.pool import StaticPool

import app.models  # noqa: F401 — register ORM models on ``Base.metadata``
from app.models.base import Base


@pytest.fixture
def sqlite_engine():
    """In-memory SQLite with shared connection pool (all sessions see the same DB)."""
    engine = create_engine(
        'sqlite://',
        connect_args={'check_same_thread': False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(engine)
    yield engine
    Base.metadata.drop_all(engine)
    engine.dispose()
