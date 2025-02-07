import logging

from pydantic import TypeAdapter
from pydantic.v1 import UUID4
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from tunsberg.responses import (
    response_bad_request,
    response_conflict,
    response_created,
    response_no_content,
    response_not_found,
    response_success,
)

from app.models.article import Article
from app.models.event import Event
from app.models.user import User
from app.v3.articles.schemas import ArticleCreate, ArticleResponse, ArticleUpdate


def create_article(db: Session, event_id: UUID4, current_user: User, article_data: ArticleCreate):
    """Create a new article"""
    # Check if event exists
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        return response_bad_request(message='Event not found')

    try:
        article = Article(**article_data.model_dump(), created_by_id=current_user.id, event_id=event_id)
        db.add(article)
        db.commit()
        db.refresh(article)

        adapter = TypeAdapter(ArticleResponse)
        return response_created(message='Article created', data=adapter.dump_json(article))
    except IntegrityError as e:
        db.rollback()
        logging.error(f'Error creating article: {e}')
        return response_conflict(message='Error creating article')


def get_articles(db: Session, event_id: UUID4, skip: int = 0, limit: int = 100):
    """Get published articles for an event"""
    # Check if event exists
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        return response_bad_request(message='Event not found')

    articles = (
        db.query(Article)
        .filter(Article.event_id == event_id, Article.deleted_at.is_(None), Article.published_at.isnot(None))
        .order_by(Article.published_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

    adapter = TypeAdapter(list[ArticleResponse])
    data = adapter.dump_json(articles)
    return response_success(message='Articles retrieved', data=data)


def get_article(db: Session, event_id: UUID4, article_id: UUID4):
    """Get article by ID"""
    # Check if event exists
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        return response_bad_request(message='Event not found')

    article = db.query(Article).filter(Article.id == article_id, Article.event_id == event_id, Article.deleted_at.is_(None)).first()
    if not article:
        return response_not_found(message='Article not found')

    adapter = TypeAdapter(ArticleResponse)
    return response_success(message='Article retrieved', data=adapter.dump_json(article))


def update_article(db: Session, event_id: UUID4, article_id: UUID4, current_user: User, article_data: ArticleUpdate):
    """Update article"""
    # Check if event exists
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        return response_bad_request(message='Event not found')

    article = db.query(Article).filter(Article.id == article_id, Article.deleted_at.is_(None)).first()
    if not article:
        return response_not_found(message='Article not found')

    try:
        for field, value in article_data.model_dump(exclude_unset=True).items():
            setattr(article, field, value)

        db.commit()
        db.refresh(article)

        adapter = TypeAdapter(ArticleResponse)
        return response_success(message='Article updated', data=adapter.dump_json(article))
    except IntegrityError as e:
        db.rollback()
        logging.error(f'Error updating article: {e}')
        return response_conflict(message='Error updating article')


def delete_article(db: Session, event_id: UUID4, article_id: UUID4, current_user: User):
    """Delete article"""
    article = db.query(Article).filter(Article.id == article_id, Article.event_id == event_id, Article.deleted_at.is_(None)).first()
    if not article:
        return response_not_found(message='Article not found')

    try:
        db.delete(article)
        db.commit()
        return response_no_content()
    except Exception as e:
        db.rollback()
        logging.error(f'Error deleting article: {e}')
        return response_bad_request(message='Could not delete article')


def get_all_articles(db: Session, event_id: UUID4):
    """Get all articles for an event"""
    articles = db.query(Article).filter(Article.event_id == event_id, Article.deleted_at.is_(None)).all()
    adapter = TypeAdapter(list[ArticleResponse])
    data = adapter.dump_json(articles)
    return response_success(message='Articles retrieved', data=data)
