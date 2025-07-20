
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
    
    # Create page_times table
    op.create_table('page_times',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('session_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('pdf_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('page_number', sa.Integer(), nullable=False),
        sa.Column('visit_sequence', sa.Integer(), nullable=True),
        sa.Column('start_time', sa.DateTime(), nullable=False),
        sa.Column('end_time', sa.DateTime(), nullable=True),
        sa.Column('duration_seconds', sa.Integer(), nullable=True),
        sa.Column('idle_time_seconds', sa.Integer(), nullable=True),
        sa.Column('active_time_seconds', sa.Integer(), nullable=True),
        sa.Column('activity_count', sa.Integer(), nullable=True),
        sa.Column('scroll_events', sa.Integer(), nullable=True),
        sa.Column('zoom_events', sa.Integer(), nullable=True),
        sa.Column('reading_speed_wpm', sa.DECIMAL(precision=5, scale=2), nullable=True),
        sa.Column('words_on_page', sa.Integer(), nullable=True),
        sa.Column('difficulty_rating', sa.Integer(), nullable=True),
        sa.Column('comprehension_estimate', sa.DECIMAL(precision=3, scale=2), nullable=True),
        sa.Column('attention_score', sa.DECIMAL(precision=3, scale=2), nullable=True),
        sa.Column('notes_created', sa.Integer(), nullable=True),
        sa.Column('highlights_made', sa.Integer(), nullable=True),
        sa.Column('bookmarks_added', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['pdf_id'], ['pdfs.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['session_id'], ['study_sessions.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create pomodoro_sessions table
    op.create_table('pomodoro_sessions',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('study_session_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('cycle_number', sa.Integer(), nullable=True),
        sa.Column('cycle_type', sa.String(length=20), nullable=True),
        sa.Column('planned_duration_minutes', sa.Integer(), nullable=True),
        sa.Column('actual_duration_minutes', sa.Integer(), nullable=True),
        sa.Column('completed', sa.Boolean(), nullable=True),
        sa.Column('interruptions', sa.Integer(), nullable=True),
        sa.Column('interruption_types', postgresql.ARRAY(sa.String()), nullable=True),
        sa.Column('effectiveness_rating', sa.Integer(), nullable=True),
        sa.Column('focus_rating', sa.Integer(), nullable=True),
        sa.Column('task_completed', sa.Boolean(), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('xp_earned', sa.Integer(), nullable=True),
        sa.Column('started_at', sa.DateTime(), nullable=True),
        sa.Column('completed_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['study_session_id'], ['study_sessions.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create reading_speeds table
    op.create_table('reading_speeds',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('pdf_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('topic_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('session_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('pages_per_minute', sa.DECIMAL(precision=5, scale=2), nullable=True),
        sa.Column('words_per_minute', sa.DECIMAL(precision=5, scale=2), nullable=True),
        sa.Column('content_type', sa.String(length=50), nullable=True),
        sa.Column('difficulty_level', sa.Integer(), nullable=True),
        sa.Column('time_of_day', sa.Integer(), nullable=True),
        sa.Column('day_of_week', sa.Integer(), nullable=True),
        sa.Column('week_of_year', sa.Integer(), nullable=True),
        sa.Column('month', sa.Integer(), nullable=True),
        sa.Column('season', sa.String(length=10), nullable=True),
        sa.Column('environmental_factors', sa.JSON(), nullable=True),
        sa.Column('cognitive_load', sa.Integer(), nullable=True),
        sa.Column('calculated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['pdf_id'], ['pdfs.id'], ),
        sa.ForeignKeyConstraint(['session_id'], ['study_sessions.id'], ),
        sa.ForeignKeyConstraint(['topic_id'], ['topics.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create time_estimates table
    op.create_table('time_estimates',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('pdf_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('topic_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('estimate_type', sa.String(length=20), nullable=True),
        sa.Column('estimated_minutes', sa.Integer(), nullable=True),
        sa.Column('estimated_sessions', sa.Integer(), nullable=True),
        sa.Column('estimated_pages_per_session', sa.Integer(), nullable=True),
        sa.Column('confidence_level', sa.String(length=20), nullable=True),
        sa.Column('based_on_sessions', sa.Integer(), nullable=True),
        sa.Column('accuracy_score', sa.DECIMAL(precision=3, scale=2), nullable=True),
        sa.Column('factors_used', sa.JSON(), nullable=True),
        sa.Column('algorithm_version', sa.String(length=10), nullable=True),
        sa.Column('calculated_at', sa.DateTime(), nullable=True),
        sa.Column('valid_until', sa.DateTime(), nullable=True),
        sa.Column('actual_minutes', sa.Integer(), nullable=True),
        sa.Column('accuracy_percentage', sa.DECIMAL(precision=5, scale=2), nullable=True),
        sa.ForeignKeyConstraint(['pdf_id'], ['pdfs.id'], ),
        sa.ForeignKeyConstraint(['topic_id'], ['topics.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create performance indexes for study sessions
    op.create_index('idx_study_sessions_pdf_id', 'study_sessions', ['pdf_id'], unique=False)
    op.create_index('idx_study_sessions_topic_id', 'study_sessions', ['topic_id'], unique=False)
    op.create_index('idx_study_sessions_date', 'study_sessions', ['start_time'], unique=False)
    op.create_index('idx_study_sessions_active', 'study_sessions', ['end_time'], unique=False)
    op.create_index('idx_study_sessions_type', 'study_sessions', ['session_type'], unique=False)
    
    # Create indexes for page times
    op.create_index('idx_page_times_session_pdf', 'page_times', ['session_id', 'pdf_id'], unique=False)
    op.create_index('idx_page_times_page_number', 'page_times', ['pdf_id', 'page_number'], unique=False)
    op.create_index('idx_page_times_duration', 'page_times', ['duration_seconds'], unique=False)
    
    # Create indexes for pomodoro sessions
    op.create_index('idx_pomodoro_study_session', 'pomodoro_sessions', ['study_session_id'], unique=False)
    op.create_index('idx_pomodoro_completed', 'pomodoro_sessions', ['completed'], unique=False)
    
    # Create indexes for reading speeds
    op.create_index('idx_reading_speeds_pdf', 'reading_speeds', ['pdf_id'], unique=False)
    op.create_index('idx_reading_speeds_session', 'reading_speeds', ['session_id'], unique=False)
    op.create_index('idx_reading_speeds_time', 'reading_speeds', ['time_of_day', 'day_of_week'], unique=False)
    
    # Create indexes for time estimates
    op.create_index('idx_time_estimates_pdf', 'time_estimates', ['pdf_id'], unique=False)
    op.create_index('idx_time_estimates_topic', 'time_estimates', ['topic_id'], unique=False)
    op.create_index('idx_time_estimates_type', 'time_estimates', ['estimate_type'], unique=False)


def downgrade() -> None:
    # Drop indexes first
    op.drop_index('idx_time_estimates_type', table_name='time_estimates')
    op.drop_index('idx_time_estimates_topic', table_name='time_estimates')
    op.drop_index('idx_time_estimates_pdf', table_name='time_estimates')
    op.drop_index('idx_reading_speeds_time', table_name='reading_speeds')
    op.drop_index('idx_reading_speeds_session', table_name='reading_speeds')
    op.drop_index('idx_reading_speeds_pdf', table_name='reading_speeds')
    op.drop_index('idx_pomodoro_completed', table_name='pomodoro_sessions')
    op.drop_index('idx_pomodoro_study_session', table_name='pomodoro_sessions')
    op.drop_index('idx_page_times_duration', table_name='page_times')
    op.drop_index('idx_page_times_page_number', table_name='page_times')
    op.drop_index('idx_page_times_session_pdf', table_name='page_times')
    op.drop_index('idx_study_sessions_type', table_name='study_sessions')
    op.drop_index('idx_study_sessions_active', table_name='study_sessions')
    op.drop_index('idx_study_sessions_date', table_name='study_sessions')
    op.drop_index('idx_study_sessions_topic_id', table_name='study_sessions')
    op.drop_index('idx_study_sessions_pdf_id', table_name='study_sessions')
    
    # Drop tables in reverse order of creation
    op.drop_table('time_estimates')
    op.drop_table('reading_speeds')
    op.drop_table('pomodoro_sessions')
    op.drop_table('page_times')
    op.drop_table('study_sessions')