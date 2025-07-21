# Save this as: backend/alembic/versions/004_stage6_goals_analytics.py
"""Stage 6: Add goals and analytics system

Revision ID: 004  
Revises: c0171b17a5ec
Create Date: 2025-07-21 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers
revision = '004'
down_revision = 'c0171b17a5ec'
branch_labels = None
depends_on = None

def upgrade() -> None:
    # Create goals table
    op.create_table('goals',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('goal_type', sa.String(length=20), nullable=False),
        sa.Column('status', sa.String(length=20), nullable=True, default='active'),
        sa.Column('priority', sa.String(length=20), nullable=True, default='medium'),
        sa.Column('specific_description', sa.Text(), nullable=True),
        sa.Column('measurable_criteria', sa.JSON(), nullable=True),
        sa.Column('achievable_plan', sa.Text(), nullable=True),
        sa.Column('relevant_reason', sa.Text(), nullable=True),
        sa.Column('time_bound_deadline', sa.DateTime(), nullable=True),
        sa.Column('topic_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('pdf_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('parent_goal_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('target_value', sa.Float(), nullable=True),
        sa.Column('current_value', sa.Float(), nullable=True, default=0.0),
        sa.Column('target_unit', sa.String(length=50), nullable=True),
        sa.Column('progress_percentage', sa.DECIMAL(precision=5, scale=2), nullable=True, default=0.0),
        sa.Column('start_date', sa.DateTime(), nullable=True, default=sa.func.now()),
        sa.Column('target_date', sa.DateTime(), nullable=True),
        sa.Column('completed_date', sa.DateTime(), nullable=True),
        sa.Column('estimated_hours', sa.Integer(), nullable=True),
        sa.Column('actual_hours', sa.Integer(), nullable=True, default=0),
        sa.Column('streak_count', sa.Integer(), nullable=True, default=0),
        sa.Column('best_streak', sa.Integer(), nullable=True, default=0),
        sa.Column('consistency_score', sa.DECIMAL(precision=3, scale=2), nullable=True, default=0.0),
        sa.Column('last_activity_date', sa.DateTime(), nullable=True),
        sa.Column('motivation_notes', sa.Text(), nullable=True),
        sa.Column('reward_description', sa.Text(), nullable=True),
        sa.Column('difficulty_rating', sa.Integer(), nullable=True, default=3),
        sa.Column('importance_rating', sa.Integer(), nullable=True, default=3),
        sa.Column('xp_reward', sa.Integer(), nullable=True, default=0),
        sa.Column('badges_earned', postgresql.ARRAY(sa.String()), nullable=True),
        sa.Column('milestones_count', sa.Integer(), nullable=True, default=0),
        sa.Column('sub_goals_count', sa.Integer(), nullable=True, default=0),
        sa.Column('tags', postgresql.ARRAY(sa.String()), nullable=True),
        sa.Column('goal_metadata', sa.JSON(), nullable=True, default='{}'),
        sa.Column('reminder_frequency', sa.String(length=20), nullable=True, default='weekly'),
        sa.Column('created_at', sa.DateTime(), nullable=True, default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), nullable=True, default=sa.func.now()),
        sa.ForeignKeyConstraint(['parent_goal_id'], ['goals.id'], ),
        sa.ForeignKeyConstraint(['pdf_id'], ['pdfs.id'], ),
        sa.ForeignKeyConstraint(['topic_id'], ['topics.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create milestones table
    op.create_table('milestones',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('goal_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('target_value', sa.Float(), nullable=True),
        sa.Column('target_percentage', sa.DECIMAL(precision=5, scale=2), nullable=True),
        sa.Column('order_sequence', sa.Integer(), nullable=True),
        sa.Column('is_completed', sa.Boolean(), nullable=True, default=False),
        sa.Column('completed_date', sa.DateTime(), nullable=True),
        sa.Column('xp_reward', sa.Integer(), nullable=True, default=25),
        sa.Column('badge_name', sa.String(length=100), nullable=True),
        sa.Column('celebration_message', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True, default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), nullable=True, default=sa.func.now()),
        sa.ForeignKeyConstraint(['goal_id'], ['goals.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create goal_progress table
    op.create_table('goal_progress',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('goal_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('session_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('previous_value', sa.Float(), nullable=True),
        sa.Column('new_value', sa.Float(), nullable=True),
        sa.Column('change_amount', sa.Float(), nullable=True),
        sa.Column('progress_percentage', sa.DECIMAL(precision=5, scale=2), nullable=True),
        sa.Column('activity_type', sa.String(length=50), nullable=True, default='manual'),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('automatic_update', sa.Boolean(), nullable=True, default=True),
        sa.Column('recorded_at', sa.DateTime(), nullable=True, default=sa.func.now()),
        sa.ForeignKeyConstraint(['goal_id'], ['goals.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['session_id'], ['study_sessions.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create achievements table
    op.create_table('achievements',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('category', sa.String(length=50), nullable=True, default='study'),
        sa.Column('badge_icon', sa.String(length=100), nullable=True),
        sa.Column('badge_color', sa.String(length=7), nullable=True, default='#FFD700'),
        sa.Column('criteria_type', sa.String(length=50), nullable=True),
        sa.Column('criteria_value', sa.Float(), nullable=True),
        sa.Column('criteria_description', sa.Text(), nullable=True),
        sa.Column('xp_reward', sa.Integer(), nullable=True, default=50),
        sa.Column('rarity', sa.String(length=20), nullable=True, default='common'),
        sa.Column('is_active', sa.Boolean(), nullable=True, default=True),
        sa.Column('unlock_level', sa.Integer(), nullable=True, default=1),
        sa.Column('created_at', sa.DateTime(), nullable=True, default=sa.func.now()),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create user_achievements table
    op.create_table('user_achievements',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('achievement_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('user_id', sa.String(length=100), nullable=True, default='default_user'),
        sa.Column('earned_at', sa.DateTime(), nullable=True, default=sa.func.now()),
        sa.Column('progress_value', sa.Float(), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('triggered_by_goal', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('triggered_by_session', postgresql.UUID(as_uuid=True), nullable=True),
        sa.ForeignKeyConstraint(['achievement_id'], ['achievements.id'], ),
        sa.ForeignKeyConstraint(['triggered_by_goal'], ['goals.id'], ),
        sa.ForeignKeyConstraint(['triggered_by_session'], ['study_sessions.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create daily_stats table
    op.create_table('daily_stats',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('stat_date', sa.Date(), nullable=False),
        sa.Column('user_id', sa.String(length=100), nullable=True, default='default_user'),
        sa.Column('total_study_minutes', sa.Integer(), nullable=True, default=0),
        sa.Column('active_study_minutes', sa.Integer(), nullable=True, default=0),
        sa.Column('break_minutes', sa.Integer(), nullable=True, default=0),
        sa.Column('idle_minutes', sa.Integer(), nullable=True, default=0),
        sa.Column('total_sessions', sa.Integer(), nullable=True, default=0),
        sa.Column('completed_sessions', sa.Integer(), nullable=True, default=0),
        sa.Column('average_session_duration', sa.Float(), nullable=True, default=0.0),
        sa.Column('average_focus_score', sa.DECIMAL(precision=5, scale=2), nullable=True, default=0.0),
        sa.Column('pages_read', sa.Integer(), nullable=True, default=0),
        sa.Column('pdfs_completed', sa.Integer(), nullable=True, default=0),
        sa.Column('exercises_completed', sa.Integer(), nullable=True, default=0),
        sa.Column('notes_created', sa.Integer(), nullable=True, default=0),
        sa.Column('highlights_made', sa.Integer(), nullable=True, default=0),
        sa.Column('goals_worked_on', sa.Integer(), nullable=True, default=0),
        sa.Column('goals_completed', sa.Integer(), nullable=True, default=0),
        sa.Column('milestones_achieved', sa.Integer(), nullable=True, default=0),
        sa.Column('pomodoro_cycles', sa.Integer(), nullable=True, default=0),
        sa.Column('pomodoro_effectiveness', sa.DECIMAL(precision=3, scale=2), nullable=True, default=0.0),
        sa.Column('reading_speed_wpm', sa.DECIMAL(precision=5, scale=2), nullable=True, default=0.0),
        sa.Column('comprehension_score', sa.DECIMAL(precision=3, scale=2), nullable=True, default=0.0),
        sa.Column('productivity_score', sa.DECIMAL(precision=5, scale=2), nullable=True, default=0.0),
        sa.Column('xp_earned', sa.Integer(), nullable=True, default=0),
        sa.Column('achievements_unlocked', sa.Integer(), nullable=True, default=0),
        sa.Column('streak_days', sa.Integer(), nullable=True, default=0),
        sa.Column('study_environments', postgresql.ARRAY(sa.String()), nullable=True),
        sa.Column('peak_performance_hour', sa.Integer(), nullable=True),
        sa.Column('topic_breakdown', sa.JSON(), nullable=True, default='{}'),
        sa.Column('session_breakdown', sa.JSON(), nullable=True, default='{}'),
        sa.Column('goal_breakdown', sa.JSON(), nullable=True, default='{}'),
        sa.Column('created_at', sa.DateTime(), nullable=True, default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), nullable=True, default=sa.func.now()),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create performance_insights table
    op.create_table('performance_insights',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('insight_type', sa.String(length=50), nullable=False),
        sa.Column('category', sa.String(length=50), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('user_id', sa.String(length=100), nullable=True, default='default_user'),
        sa.Column('topic_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('goal_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('data_points', sa.JSON(), nullable=True, default='{}'),
        sa.Column('confidence_score', sa.DECIMAL(precision=3, scale=2), nullable=True, default=0.0),
        sa.Column('impact_score', sa.DECIMAL(precision=3, scale=2), nullable=True, default=0.0),
        sa.Column('is_actionable', sa.Boolean(), nullable=True, default=False),
        sa.Column('action_items', postgresql.ARRAY(sa.String()), nullable=True),
        sa.Column('estimated_improvement', sa.String(length=100), nullable=True),
        sa.Column('time_period_start', sa.Date(), nullable=True),
        sa.Column('time_period_end', sa.Date(), nullable=True),
        sa.Column('valid_until', sa.Date(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=True, default=True),
        sa.Column('user_dismissed', sa.Boolean(), nullable=True, default=False),
        sa.Column('user_acted_on', sa.Boolean(), nullable=True, default=False),
        sa.Column('generated_at', sa.DateTime(), nullable=True, default=sa.func.now()),
        sa.Column('last_shown', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['goal_id'], ['goals.id'], ),
        sa.ForeignKeyConstraint(['topic_id'], ['topics.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create study_efficiency_metrics table
    op.create_table('study_efficiency_metrics',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('measurement_date', sa.Date(), nullable=False),
        sa.Column('user_id', sa.String(length=100), nullable=True, default='default_user'),
        sa.Column('topic_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('pages_per_hour', sa.DECIMAL(precision=5, scale=2), nullable=True, default=0.0),
        sa.Column('concepts_mastered_per_hour', sa.DECIMAL(precision=5, scale=2), nullable=True, default=0.0),
        sa.Column('retention_rate', sa.DECIMAL(precision=5, scale=2), nullable=True, default=0.0),
        sa.Column('application_success_rate', sa.DECIMAL(precision=5, scale=2), nullable=True, default=0.0),
        sa.Column('attention_span_minutes', sa.DECIMAL(precision=5, scale=2), nullable=True, default=0.0),
        sa.Column('distraction_frequency', sa.DECIMAL(precision=5, scale=2), nullable=True, default=0.0),
        sa.Column('deep_work_percentage', sa.DECIMAL(precision=5, scale=2), nullable=True, default=0.0),
        sa.Column('cognitive_load_score', sa.DECIMAL(precision=3, scale=2), nullable=True, default=0.0),
        sa.Column('optimal_difficulty_level', sa.DECIMAL(precision=3, scale=2), nullable=True, default=0.0),
        sa.Column('challenge_comfort_ratio', sa.DECIMAL(precision=3, scale=2), nullable=True, default=0.0),
        sa.Column('flow_state_frequency', sa.DECIMAL(precision=3, scale=2), nullable=True, default=0.0),
        sa.Column('energy_efficiency', sa.DECIMAL(precision=3, scale=2), nullable=True, default=0.0),
        sa.Column('environment_effectiveness', sa.JSON(), nullable=True, default='{}'),
        sa.Column('time_of_day_performance', sa.JSON(), nullable=True, default='{}'),
        sa.Column('session_length_optimization', sa.JSON(), nullable=True, default='{}'),
        sa.Column('personal_benchmark_ratio', sa.DECIMAL(precision=3, scale=2), nullable=True, default=1.0),
        sa.Column('peer_benchmark_ratio', sa.DECIMAL(precision=3, scale=2), nullable=True, default=1.0),
        sa.Column('improvement_rate', sa.DECIMAL(precision=5, scale=2), nullable=True, default=0.0),
        sa.Column('calculated_at', sa.DateTime(), nullable=True, default=sa.func.now()),
        sa.ForeignKeyConstraint(['topic_id'], ['topics.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create indexes for performance
    op.create_index('idx_goals_status', 'goals', ['status'], unique=False)
    op.create_index('idx_goals_type', 'goals', ['goal_type'], unique=False)
    op.create_index('idx_goals_target_date', 'goals', ['target_date'], unique=False)
    op.create_index('idx_goals_topic_id', 'goals', ['topic_id'], unique=False)
    
    op.create_index('idx_milestones_goal_id', 'milestones', ['goal_id'], unique=False)
    op.create_index('idx_milestones_completed', 'milestones', ['is_completed'], unique=False)
    
    op.create_index('idx_goal_progress_goal_id', 'goal_progress', ['goal_id'], unique=False)
    op.create_index('idx_goal_progress_date', 'goal_progress', ['recorded_at'], unique=False)
    
    op.create_index('idx_daily_stats_date_user', 'daily_stats', ['stat_date', 'user_id'], unique=True)
    op.create_index('idx_daily_stats_date', 'daily_stats', ['stat_date'], unique=False)
    
    op.create_index('idx_performance_insights_active', 'performance_insights', ['is_active'], unique=False)
    op.create_index('idx_performance_insights_type', 'performance_insights', ['insight_type'], unique=False)
    op.create_index('idx_performance_insights_user', 'performance_insights', ['user_id'], unique=False)
    
    op.create_index('idx_efficiency_date_user', 'study_efficiency_metrics', ['measurement_date', 'user_id'], unique=False)
    op.create_index('idx_efficiency_topic', 'study_efficiency_metrics', ['topic_id'], unique=False)

def downgrade() -> None:
    # Drop indexes first
    op.drop_index('idx_efficiency_topic', table_name='study_efficiency_metrics')
    op.drop_index('idx_efficiency_date_user', table_name='study_efficiency_metrics')
    op.drop_index('idx_performance_insights_user', table_name='performance_insights')
    op.drop_index('idx_performance_insights_type', table_name='performance_insights')
    op.drop_index('idx_performance_insights_active', table_name='performance_insights')
    op.drop_index('idx_daily_stats_date', table_name='daily_stats')
    op.drop_index('idx_daily_stats_date_user', table_name='daily_stats')
    op.drop_index('idx_goal_progress_date', table_name='goal_progress')
    op.drop_index('idx_goal_progress_goal_id', table_name='goal_progress')
    op.drop_index('idx_milestones_completed', table_name='milestones')
    op.drop_index('idx_milestones_goal_id', table_name='milestones')
    op.drop_index('idx_goals_topic_id', table_name='goals')
    op.drop_index('idx_goals_target_date', table_name='goals')
    op.drop_index('idx_goals_type', table_name='goals')
    op.drop_index('idx_goals_status', table_name='goals')
    
    # Drop tables in reverse order
    op.drop_table('study_efficiency_metrics')
    op.drop_table('performance_insights')
    op.drop_table('daily_stats')
    op.drop_table('user_achievements')
    op.drop_table('achievements')
    op.drop_table('goal_progress')
    op.drop_table('milestones')
    op.drop_table('goals')