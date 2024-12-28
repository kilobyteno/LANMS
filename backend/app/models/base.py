import uuid
from datetime import datetime, timezone

from sqlalchemy import UUID, Column, DateTime, func
from sqlalchemy.orm import declarative_base

Base = declarative_base()


class BaseModel(Base):
    """Unified base class that includes common timestamp fields."""

    __abstract__ = True  # Ensures that this class is not mapped to a table.

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, unique=True, nullable=False)

    created_at = Column(DateTime, server_default=func.now(), nullable=True)
    updated_at = Column(DateTime, onupdate=func.now(), nullable=True)
    deleted_at = Column(DateTime, nullable=True)

    def soft_delete(self):
        """
        Mark the record as deleted by setting deleted_at to the current timestamp.

        Usage:
        user = db.query(User).filter(User.id == user_id).first()
        if user:
            user.soft_delete()
            db.commit()
        """
        self.deleted_at = datetime.now(timezone.utc)

    @classmethod
    def query_active(cls, session):
        """
        Return records where deleted_at is NULL (not soft-deleted).

        Usage:
        users = User.query_active(db)
        """
        return session.query(cls).filter(cls.deleted_at.is_(None))
