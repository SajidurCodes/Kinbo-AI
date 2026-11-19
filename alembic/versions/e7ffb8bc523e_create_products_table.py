"""create products table

Revision ID: e7ffb8bc523e
Revises: 6e35ad72840c
Create Date: 2026-11-19 19:03:56.884874

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'e7ffb8bc523e'
down_revision: Union[str, Sequence[str], None] = '6e35ad72840c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.alter_column(
        "products", "warrenty_months", new_column_name="warranty_months"
    )


def downgrade() -> None:
    op.alter_column(
        "products", "warranty_months", new_column_name="warrenty_months"
    )
