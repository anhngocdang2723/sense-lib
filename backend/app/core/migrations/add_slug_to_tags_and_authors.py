"""add slug to tags and authors

Revision ID: add_slug_to_tags_and_authors
Revises: 
Create Date: 2024-03-19

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'add_slug_to_tags_and_authors'
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    # Add slug column to tags table
    op.add_column('tags', sa.Column('slug', sa.String(), nullable=True))
    op.create_index(op.f('ix_tags_slug'), 'tags', ['slug'], unique=True)
    
    # Add slug column to authors table
    op.add_column('authors', sa.Column('slug', sa.String(), nullable=True))
    op.create_index(op.f('ix_authors_slug'), 'authors', ['slug'], unique=True)
    
    # Generate slugs from existing names
    connection = op.get_bind()
    
    # Update tags
    tags = connection.execute('SELECT id, name FROM tags').fetchall()
    for tag in tags:
        # Convert name to slug (lowercase, replace spaces with hyphens, remove special chars)
        slug = tag[1].lower().replace(' ', '-')
        connection.execute(
            'UPDATE tags SET slug = %s WHERE id = %s',
            (slug, tag[0])
        )
    
    # Update authors
    authors = connection.execute('SELECT id, name FROM authors').fetchall()
    for author in authors:
        # Convert name to slug
        slug = author[1].lower().replace(' ', '-')
        connection.execute(
            'UPDATE authors SET slug = %s WHERE id = %s',
            (slug, author[0])
        )
    
    # Make slug columns non-nullable after populating data
    op.alter_column('tags', 'slug',
               existing_type=sa.String(),
               nullable=False)
    op.alter_column('authors', 'slug',
               existing_type=sa.String(),
               nullable=False)

def downgrade():
    # Drop slug columns
    op.drop_index(op.f('ix_tags_slug'), table_name='tags')
    op.drop_column('tags', 'slug')
    
    op.drop_index(op.f('ix_authors_slug'), table_name='authors')
    op.drop_column('authors', 'slug') 