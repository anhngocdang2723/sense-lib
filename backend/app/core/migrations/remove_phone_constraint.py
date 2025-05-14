"""remove phone number constraint

Revision ID: remove_phone_constraint
Revises: 
Create Date: 2024-05-13 07:45:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'remove_phone_constraint'
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    # Drop the phone number constraint if it exists
    op.execute('ALTER TABLE users DROP CONSTRAINT IF EXISTS check_phone_number')

def downgrade():
    # No need to recreate the constraint in downgrade since we're moving to schema validation
    pass 