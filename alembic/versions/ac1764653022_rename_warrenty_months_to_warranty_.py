"""rename warrenty_months to warranty_months

Revision ID: ac1764653022
Revises: e7ffb8bc523e
Create Date: 2026-11-19 19:10:18.021816
"""

from typing import Sequence, Union

from alembic import op


revision: str = "ac1764653022"
down_revision: Union[str, Sequence[str], None] = "e7ffb8bc523e"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.alter_column("products", "warrenty_months", new_column_name="warranty_months")


def downgrade() -> None:
    op.alter_column("products", "warranty_months", new_column_name="warrenty_months")