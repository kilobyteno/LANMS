from fastapi import Request
from sqlalchemy import create_engine
from sqlalchemy.orm import scoped_session, sessionmaker

from config import Config


def get_db(request: Request):
    """
    Return SQLAlchemy database session from the request state.

    This function retrieves the database session from the state of the request object.
    It should be used as a dependency in FastAPI route functions to obtain a database session.
    """
    return request.state.db


def get_db_engine(url: str = Config.SQLALCHEMY_DATABASE_URI, pool_size: int = 10):
    """
    Return SQLAlchemy database engine.

    :param url: SQLAlchemy database URL.
    :param pool_size: Pool size for SQLAlchemy. Default 10.
    :return: SQLAlchemy database engine.
    """
    return create_engine(
        url=url,
        pool_size=pool_size,  # Set pool size to 10 connections
        max_overflow=10,  # Allow 10 connections to overflow
        pool_timeout=10,  # In seconds
        pool_recycle=1800,  # Adjust pool recycle to prevent stale connections
        pool_pre_ping=True,  # Enable pre-ping to avoid using stale connections
        echo=Config.DATABASE_DEBUG,  # Set echo to True to enable logging
    )


def get_local_session(url: str = Config.SQLALCHEMY_DATABASE_URI):
    """
    Return a local session.

    :return: Local session.
    """
    return scoped_session(sessionmaker(autocommit=False, autoflush=False, bind=get_db_engine(url=url)))
