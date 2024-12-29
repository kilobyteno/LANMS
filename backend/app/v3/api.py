from fastapi import APIRouter
from fastapi_pagination import add_pagination

from app.v3.auth import endpoints as auth_endpoints
from app.v3.event_interests import endpoints as event_interests_endpoints
from app.v3.events import endpoints as events_endpoints
from app.v3.organisations import endpoints as organisations_endpoints
from app.v3.system import endpoints as system_endpoints
from app.v3.user import endpoints as user_endpoints

router = APIRouter(prefix='/v3')

add_pagination(router)


router.include_router(auth_endpoints.router, tags=['auth'], prefix='/auth')
router.include_router(user_endpoints.router, tags=['user'], prefix='/user')
router.include_router(organisations_endpoints.router, tags=['organisations'], prefix='/organisations')
router.include_router(events_endpoints.router, tags=['events'], prefix='/events')
router.include_router(event_interests_endpoints.router, tags=['event interests'])
router.include_router(system_endpoints.router, tags=['system'], prefix='/system')  # Should be last
