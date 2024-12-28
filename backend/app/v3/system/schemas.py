from pydantic import BaseModel


class S0Output(BaseModel):
    """Response model for the system endpoints"""

    message: str
