"""Study Sessions and Timing System

Revision ID: 002
Revises: 001
Create Date: 2024-01-15 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers
revision = '002'
down_revision = '001'
branch_labels = None
depends_on = None

def upgrade() -> None:
    # Create study_sessions table
    op.create_table('study_sessions',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('pdf_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('topic_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('exercise_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('session_type', sa.String(length=20), nullable=True),
        sa.Column('session_name', sa.String(length=255), nullable=True),
        sa.Column('start_time', sa.DateTime(), nullable=True),
        sa.Column('end_time', sa.DateTime(), nullable=True),
        sa.Column('planned_duration_minutes', sa.Integer(), nullable=True),
        sa.Column('total_minutes', sa.Integer(), nullable=True),
        sa.Column('active_minutes', sa.Integer(), nullable=True),
        sa.Column('idle_minutes', sa.Integer(), nullable=True),
        sa.Column('break_minutes', sa.Integer(), nullable=True),
        sa.Column('pages_visited', sa.Integer(), nullable=True),
        sa.Column('pages_completed', sa.Integer(), nullable=True),
        sa.Column('starting_page', sa.Integer(), nullable=True),
        sa.Column('ending_page', sa.Integer(), nullable=True),
        sa.Column('pomodoro_cycles', sa.Integer(), nullable=True),
        sa.Column('interruptions', sa.Integer(), nullable=True),
        sa.Column('focus_score', sa.DECIMAL(precision=3, scale=2), nullable=True),
        sa.Column('productivity_score', sa.DECIMAL(precision=3, scale=2), nullable=True),
        sa.Column('difficulty_rating', sa.Integer(), nullable=True),
        sa.Column('energy_level', sa.Integer(), nullable=True),
        sa.Column('mood_rating', sa.Integer(), nullable=True),
        sa.Column('environment_type', sa.String(length=50), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('goals_set', postgresql.ARRAY(sa.String()), nullable=True),
        sa.Column('goals_achieved', postgresql.ARRAY(sa.String()), nullable=True),
        sa.Column('xp_earned', sa.Integer(), nullable=True),
        sa.Column('session_data', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['pdf_id'], ['pdfs.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['topic_id'], ['topics.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Other session tables...
    op.create_table('page_times',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('session_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('pdf_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('page_number', sa.Integer(), nullable=False),
        sa.Column('start_time', sa.DateTime(), nullable=False),
        sa.Column('end_time', sa.DateTime(), nullable=True),
        sa.Column('duration_seconds', sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(['pdf_id'], ['pdfs.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['session_id'], ['study_sessions.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )

def downgrade() -> None:
    op.drop_table('page_times')
    op.drop_table('study_sessions')
