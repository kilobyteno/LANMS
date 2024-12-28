import json
import logging
from logging.config import dictConfig
from typing import TYPE_CHECKING

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from sqlalchemy.exc import OperationalError, SQLAlchemyError
from starlette.middleware import Middleware
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.middleware.cors import CORSMiddleware
from tunsberg.responses import response_bad_request, response_custom, response_internal_server_error

from app.dependencies import get_db_engine, get_local_session
from app.models.base import Base
from app.v3.api import router as api_v1_router
from app.v3.utils import CustomExceptionError
from config import Config

if TYPE_CHECKING:
    from requests import Response

# We need both this and the custom cors handler below
middleware = [
    Middleware(
        CORSMiddleware,
        allow_origins=[Config.CORS_ALLOW_ORIGIN],
        allow_credentials=True,
        allow_methods=['*'],
        allow_headers=['*'],
    )
]
app = FastAPI(
    title=Config.API_DOCS_TITLE,
    version=Config.API_DOCS_VERSION,
    description=Config.API_DOCS_DESCRIPTION,
    openapi_url=Config.API_DOCS_OPENAPI_URL,
    docs_url=Config.API_DOCS_URL,
    debug=Config.DEBUG,
    middleware=middleware,
)

app.include_router(api_v1_router)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Middleware to handle pydantic validation error."""
    errors = {}
    messages = []
    for error in exc.errors():
        loc = '.'.join(map(str, error['loc']))  # Convert location to a dot-separated string
        if loc not in errors:
            errors[loc] = []
        error_detail = {'type': error['type'], 'message': error['msg'], 'input': error.get('input', None)}
        errors[loc].append(error_detail)
        messages.append(f"{loc}: {error['msg']}")

    errors_json = json.dumps(errors)  # Ensure the errors dictionary is JSON serializable
    summary_message = '; '.join(messages)  # Create a readable summary message

    return response_bad_request(message=f'Validation Error: {summary_message}', data=errors_json)


class SQLAlchemySessionMiddleware(BaseHTTPMiddleware):
    """Middleware to manage SQLAlchemy database session."""

    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint):
        """
        Middleware to catch exception and manage SQLAlchemy database session.

        This middleware creates a SQLAlchemy database session and attaches it to the request state. The session is
        closed after each request is processed.
        This middleware also catches the exception and outputs the custom exception format.
        """
        try:
            request.state.db = get_local_session(url=Config.SQLALCHEMY_DATABASE_URI)
            response = await call_next(request)
        except OperationalError as e:
            request.state.db.rollback()
            logging.debug(f'OperationalError in SQLAlchemySessionMiddleware: {e}')
            request.state.db = get_local_session(url=Config.SQLALCHEMY_DATABASE_URI)
            response = await call_next(request)
        except SQLAlchemyError as e:
            request.state.db.rollback()
            raise e
        except CustomExceptionError as e:
            message = getattr(e, 'message', 'Internal Server Error')
            status_code = getattr(e, 'status_code', 500)
            return response_custom(status_code=status_code, message=message)
        except Exception as e:
            logging.debug(f'Error in SQLAlchemySessionMiddleware, class name: {e.__class__.__name__}')
            # Handle unknown exceptions
            request.state.db.rollback()
            logging.error(f'Error in SQLAlchemySessionMiddleware: {e}', exc_info=True)
            return response_internal_server_error()
        finally:
            request.state.db.close()
        return response


# Apply the logging configuration to the app
dictConfig(Config.UVICORN_LOG_CONFIG)

# Create all tables stored in this metadata
Base.metadata.create_all(bind=get_db_engine())

# Add the SQLAlchemySessionMiddleware to the app
app.add_middleware(SQLAlchemySessionMiddleware)


# Custom CORS handler, needs to be at the end of the middleware list
@app.middleware('http')
async def cors_handler(request: Request, call_next):
    """Add CORS headers to the response."""
    response: Response = await call_next(request)
    response.headers['Access-Control-Allow-Credentials'] = 'true'
    response.headers['Access-Control-Allow-Origin'] = Config.CORS_ALLOW_ORIGIN
    response.headers['Access-Control-Allow-Methods'] = '*'
    response.headers['Access-Control-Allow-Headers'] = '*'
    return response
