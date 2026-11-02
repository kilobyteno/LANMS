"""UUID version 7 validation for API identifiers."""

from __future__ import annotations

from typing import Annotated
from uuid import UUID

from pydantic import AfterValidator

RFC9562_UUID_VERSION_7 = 7


def require_uuid7(value: UUID) -> UUID:
    """Reject UUIDs whose version field is not 7 (RFC 9562)."""
    if value.version != RFC9562_UUID_VERSION_7:
        raise ValueError('UUID must be version 7')
    return value


UUID7 = Annotated[UUID, AfterValidator(require_uuid7)]


def parse_uuid7(value: str) -> UUID:
    """Parse a string as a UUID and require version 7."""
    try:
        u = UUID(value)
    except (ValueError, TypeError) as e:
        raise ValueError('Invalid UUID') from e
    require_uuid7(u)
    return u
