"""Add article

Revision ID: 3c54be1b70e2
Revises: 9ef2bf852502
Create Date: 2024-12-29 16:58:40.321861

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '3c54be1b70e2'
down_revision: Union[str, None] = '9ef2bf852502'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('articles',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('slug', sa.String(length=255), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('event_id', sa.UUID(), nullable=False),
        sa.Column('created_by_id', sa.UUID(), nullable=False),
        sa.Column('published_at', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.Column('deleted_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['created_by_id'], ['users.id'], ),
        sa.ForeignKeyConstraint(['event_id'], ['events.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('id')
    )
    op.create_index(op.f('ix_articles_slug'), 'articles', ['slug'], unique=False)
    op.create_index(op.f('ix_articles_title'), 'articles', ['title'], unique=False)
    op.create_unique_constraint(None, 'event_interests', ['id'])
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_constraint(None, 'event_interests', type_='unique')
    op.drop_index(op.f('ix_articles_title'), table_name='articles')
    op.drop_index(op.f('ix_articles_slug'), table_name='articles')
    op.drop_table('articles')
    # ### end Alembic commands ###
