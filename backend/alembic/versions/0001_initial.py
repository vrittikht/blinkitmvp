"""empty message

Revision ID: 0001_initial
Revises:
Create Date: 2026-07-30

Phase 0 placeholder. Prefer create_all via app startup for MVP;
generate real revisions with `alembic revision --autogenerate` when needed.
"""

from alembic import op


revision = "0001_initial"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Tables are created on app startup via SQLAlchemy create_all for MVP.
    pass


def downgrade() -> None:
    pass
