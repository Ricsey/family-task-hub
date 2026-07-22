"""Add email_notifications_enabled to users

Revision ID: f381f032877d
Revises: 19b255b59aed
Create Date: 2026-07-22 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel


# revision identifiers, used by Alembic.
revision: str = 'f381f032877d'
down_revision: Union[str, Sequence[str], None] = '19b255b59aed'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('user', sa.Column('email_notifications_enabled', sa.Boolean(), nullable=False, server_default=sa.text('true')))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('user', 'email_notifications_enabled')
