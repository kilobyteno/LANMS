from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from app.dependencies import get_db
from app.models.user import User
from app.v3.articles.schemas import ArticleCreate, ArticleResponse, ArticleUpdate
from app.v3.articles.service import (
    create_article,
    delete_article,
    get_article,
    get_articles,
    update_article,
)
from app.v3.auth.utils import get_current_user

router = APIRouter()


@router.post(
    '/events/{event_id}/articles',
    name='EA-1',
    response_model=ArticleResponse,
)
async def post_create_article(
    event_id: UUID, article_data: ArticleCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
) -> JSONResponse:
    """Create a new article"""
    return create_article(db=db, event_id=event_id, current_user=current_user, article_data=article_data)


@router.get(
    '/events/{event_id}/articles',
    name='EA-2',
    response_model=List[ArticleResponse],
)
async def get_articles_list(event_id: UUID, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)) -> JSONResponse:
    """Get published articles for an event"""
    return get_articles(db=db, event_id=event_id, skip=skip, limit=limit)


@router.get(
    '/events/{event_id}/articles/{article_id}',
    name='EA-3',
    response_model=ArticleResponse,
)
async def get_article_by_id(event_id: UUID, article_id: UUID, db: Session = Depends(get_db)) -> JSONResponse:
    """Get article by ID"""
    return get_article(db=db, event_id=event_id, article_id=article_id)


@router.put(
    '/events/{event_id}/articles/{article_id}',
    name='EA-4',
    response_model=ArticleResponse,
)
async def put_update_article(
    event_id: UUID, article_id: UUID, article_data: ArticleUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
) -> JSONResponse:
    """Update article"""
    return update_article(db=db, event_id=event_id, article_id=article_id, current_user=current_user, article_data=article_data)


@router.delete(
    '/events/{event_id}/articles/{article_id}',
    name='EA-5',
)
async def delete_article_by_id(event_id: UUID, article_id: UUID, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> JSONResponse:
    """Delete article"""
    return delete_article(db=db, event_id=event_id, article_id=article_id, current_user=current_user)


@router.get(
    '/events/{event_id}/articles/all',
    name='EA-6',
    response_model=List[ArticleResponse],
)
async def get_all_articles(event_id: UUID, db: Session = Depends(get_db)) -> JSONResponse:
    """Get all articles for an event"""
    return get_all_articles(db=db, event_id=event_id)
