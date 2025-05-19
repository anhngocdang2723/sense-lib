"""add expires_at to documents

Revision ID: add_expires_at_to_documents
Revises: 
Create Date: 2024-05-18 10:30:00.000000

"""
from alembic import op
import sqlalchemy as sa
from datetime import datetime

# revision identifiers, used by Alembic.
revision = 'add_expires_at_to_documents'
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    # Add expires_at column to documents table
    op.add_column('documents', sa.Column('expires_at', sa.DateTime(), nullable=True))

def downgrade():
    # Remove expires_at column from documents table
    op.drop_column('documents', 'expires_at') 