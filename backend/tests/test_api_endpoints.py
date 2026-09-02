"""HTTP integration tests for v3 API routes (TestClient + isolated SQLite per test)."""

from __future__ import annotations

import json
from datetime import UTC, datetime, timedelta

import pytest
from pydantic import SecretStr
from sqlalchemy import create_engine
from sqlalchemy.orm import scoped_session, sessionmaker
from sqlalchemy.pool import StaticPool
from starlette.testclient import TestClient
from uuid6 import uuid7

import main as main_module
from app.models.base import Base
from app.models.user import User
from app.v3.auth.utils import get_hashed_password


@pytest.fixture
def api_client(monkeypatch):
    """App middleware session backed by a fresh in-memory SQLite DB per test."""
    engine = create_engine(
        'sqlite://',
        connect_args={'check_same_thread': False},
        poolclass=StaticPool,
    )
    Base.metadata.drop_all(engine)
    Base.metadata.create_all(engine)
    session_factory = scoped_session(sessionmaker(bind=engine, autoflush=False, autocommit=False))

    def fake_get_local_session(url=None):
        return session_factory

    monkeypatch.setattr(main_module, 'get_local_session', fake_get_local_session)
    with TestClient(main_module.app) as client:
        yield client, session_factory
    session_factory.remove()
    engine.dispose()


def _seed_user(session_factory, *, email: str = 'api-user@example.com', password: str = 'password12345') -> User:
    db = session_factory()
    try:
        user = User(
            name='API Test User',
            email=email,
            password=get_hashed_password(SecretStr(password)),
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return user
    finally:
        db.close()


def _parse_response_data(body: dict):
    raw = body.get('data')
    if raw is None:
        return None
    if isinstance(raw, str):
        return json.loads(raw)
    return raw


def test_system_up(api_client):
    client, _ = api_client
    r = client.get('/v3/system/up')
    assert r.status_code == 200
    body = r.json()
    assert body['status_code'] == 200
    assert 'service' in body['message'].lower() or 'up' in body['message'].lower()


def test_organisation_get_rejects_uuidv4_path(api_client):
    client, _ = api_client
    v4 = '123e4567-e89b-12d3-a456-426614174000'
    r = client.get(f'/v3/organisations/{v4}')
    assert r.status_code == 400
    assert 'Validation Error' in r.json()['message'] or 'version 7' in r.json()['message'].lower()


def test_organisation_get_rejects_malformed_uuid_path(api_client):
    client, _ = api_client
    r = client.get('/v3/organisations/not-a-uuid')
    assert r.status_code == 400


def test_event_get_unknown_uuid7_returns_404(api_client):
    client, _ = api_client
    r = client.get(f'/v3/events/{uuid7()}')
    assert r.status_code == 404
    assert 'not found' in r.json()['message'].lower()


def test_get_events_list_returns_200(api_client):
    client, _ = api_client
    r = client.get('/v3/events')
    assert r.status_code == 200
    data = _parse_response_data(r.json())
    assert data is not None


def test_get_event_articles_all_returns_200(api_client):
    client, _ = api_client
    r = client.get(f'/v3/events/{uuid7()}/articles/all')
    assert r.status_code == 200


def test_login_rejects_invalid_credentials(api_client):
    client, _ = api_client
    r = client.post(
        '/v3/auth/login',
        json={'email': 'missing@example.com', 'password': 'wrongpassword1'},
    )
    assert r.status_code == 400
    assert 'credential' in r.json()['message'].lower()


def test_user_me_requires_authentication(api_client):
    client, _ = api_client
    r = client.get('/v3/user/me')
    assert r.status_code == 401


def test_login_and_user_me(api_client):
    client, session_factory = api_client
    email = 'me@example.com'
    password = 'password12345'
    _seed_user(session_factory, email=email, password=password)

    r = client.post('/v3/auth/login', json={'email': email, 'password': password})
    assert r.status_code == 200
    token = r.json()['data']['access_token']

    r2 = client.get('/v3/user/me', headers={'Authorization': f'Bearer {token}'})
    assert r2.status_code == 200
    assert r2.json()['data']['email'] == email


def test_create_organisation_and_event_roundtrip(api_client):
    client, session_factory = api_client
    email = 'builder@example.com'
    password = 'password12345'
    _seed_user(session_factory, email=email, password=password)

    r = client.post('/v3/auth/login', json={'email': email, 'password': password})
    token = r.json()['data']['access_token']
    headers = {'Authorization': f'Bearer {token}'}

    r_org = client.post('/v3/organisations', headers=headers, json={'name': 'Test Org'})
    assert r_org.status_code == 201
    org_id = _parse_response_data(r_org.json())['id']

    start = datetime.now(tz=UTC)
    end = start + timedelta(hours=2)
    r_ev = client.post(
        '/v3/events',
        headers=headers,
        json={
            'title': 'Conference',
            'description': None,
            'max_participants': None,
            'website': None,
            'contact_email': None,
            'contact_phone_code': None,
            'contact_phone_number': None,
            'maps_url': None,
            'address_street': None,
            'address_city': None,
            'address_postal_code': None,
            'address_country': None,
            'start_at': start.isoformat(),
            'end_at': end.isoformat(),
            'organisation_id': org_id,
        },
    )
    assert r_ev.status_code == 201
    event_id = _parse_response_data(r_ev.json())['id']

    r_get = client.get(f'/v3/events/{event_id}')
    assert r_get.status_code == 200
    assert _parse_response_data(r_get.json())['title'] == 'Conference'


def test_event_interest_count_requires_uuid7(api_client):
    client, _ = api_client
    v4 = '123e4567-e89b-12d3-a456-426614174000'
    r = client.get(f'/v3/events/{v4}/interests/count')
    assert r.status_code == 400
