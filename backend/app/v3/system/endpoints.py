import logging

from fastapi import APIRouter
from tunsberg.responses import response_success

from app.v3.system.schemas import S0Output

router = APIRouter()


@router.get('/up', tags=['system'], name='S-0', response_model=S0Output)
def endpoint_system_up():
    """Endpoint to check if the service is up."""
    logging.debug('Up endpoint called')
    return response_success(message='Service is up')
