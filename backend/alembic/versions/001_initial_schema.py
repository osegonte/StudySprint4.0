"""Initial schema with topics and pdfs

Revision ID: 001
Revises: 
Create Date: 2024-01-01 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers
revision = '001'
down_revision = None
branch_labels = None
depends_on = None

def upgrade() -> None:
    # Create topics table
    op.create_table('topics',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('color', sa.String(length=7), nullable=True),
        sa.Column('icon', sa.String(length=50), nullable=True),
        sa.Column('total_pdfs', sa.Integer(), nullable=True),
        sa.Column('total_exercises', sa.Integer(), nullable=True),
        sa.Column('study_progress', sa.DECIMAL(precision=5, scale=2), nullable=True),
        sa.Column('estimated_completion_hours', sa.Integer(), nullable=True),
        sa.Column('difficulty_level', sa.Integer(), nullable=True),
        sa.Column('priority_level', sa.Integer(), nullable=True),
        sa.Column('is_archived', sa.Boolean(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create pdfs table
    op.create_table('pdfs',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('topic_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('file_name', sa.String(length=255), nullable=False),
        sa.Column('file_path', sa.Text(), nullable=False),
        sa.Column('file_size', sa.Integer(), nullable=True),
        sa.Column('total_pages', sa.Integer(), nullable=True),
        sa.Column('current_page', sa.Integer(), nullable=True),
        sa.Column('last_read_page', sa.Integer(), nullable=True),
        sa.Column('reading_progress', sa.DECIMAL(precision=5, scale=2), nullable=True),
        sa.Column('pdf_type', sa.String(length=20), nullable=True),
        sa.Column('parent_pdf_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('difficulty_level', sa.Integer(), nullable=True),
        sa.Column('estimated_read_time_minutes', sa.Integer(), nullable=True),
        sa.Column('actual_read_time_minutes', sa.Integer(), nullable=True),
        sa.Column('is_completed', sa.Boolean(), nullable=True),
        sa.Column('completion_date', sa.DateTime(), nullable=True),
        sa.Column('upload_status', sa.String(length=20), nullable=True),
        sa.Column('processing_status', sa.String(length=20), nullable=True),
        sa.Column('content_hash', sa.String(length=64), nullable=True),
        sa.Column('extracted_text', sa.Text(), nullable=True),
        sa.Column('language', sa.String(length=10), nullable=True),
        sa.Column('author', sa.String(length=255), nullable=True),
        sa.Column('subject', sa.String(length=255), nullable=True),
        sa.Column('keywords', postgresql.ARRAY(sa.String()), nullable=True),
        sa.Column('file_metadata', sa.JSON(), nullable=True),
        sa.Column('ai_analysis', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['parent_pdf_id'], ['pdfs.id'], ),
        sa.ForeignKeyConstraint(['topic_id'], ['topics.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )

def downgrade() -> None:
    op.drop_table('pdfs')
    op.drop_table('topics')
