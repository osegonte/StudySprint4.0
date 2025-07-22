-- StudySprint 4.0 - Comprehensive Database Performance Optimization
-- Stage 8: Production-Grade Indexes for All 25 Tables
-- Run this script to create performance indexes for optimal query performance

-- ============================================================================
-- CORE DATA TABLES INDEXES
-- ============================================================================

-- Topics Table - Core organizational entity
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_topics_name_search ON topics USING gin(to_tsvector('english', name || ' ' || COALESCE(description, '')));
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_topics_priority_level ON topics (priority_level DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_topics_difficulty_level ON topics (difficulty_level);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_topics_study_progress ON topics (study_progress DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_topics_archived_created ON topics (is_archived, created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_topics_updated_at ON topics (updated_at DESC);

-- PDFs Table - Heavy read/write operations
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_pdfs_topic_id ON pdfs (topic_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_pdfs_title_search ON pdfs USING gin(to_tsvector('english', title || ' ' || COALESCE(description, '')));
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_pdfs_completion_status ON pdfs (is_completed, topic_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_pdfs_reading_progress ON pdfs (reading_progress DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_pdfs_file_hash ON pdfs (content_hash);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_pdfs_upload_status ON pdfs (upload_status, processing_status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_pdfs_created_at ON pdfs (created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_pdfs_updated_at ON pdfs (updated_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_pdfs_compound_search ON pdfs (topic_id, is_completed, created_at DESC);

-- ============================================================================
-- SESSION AND TIME TRACKING INDEXES
-- ============================================================================

-- Study Sessions - High frequency queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_study_sessions_pdf_id ON study_sessions (pdf_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_study_sessions_topic_id ON study_sessions (topic_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_study_sessions_active ON study_sessions (start_time DESC) WHERE end_time IS NULL;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_study_sessions_completed ON study_sessions (end_time DESC) WHERE end_time IS NOT NULL;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_study_sessions_date_range ON study_sessions (start_time, end_time);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_study_sessions_focus_score ON study_sessions (focus_score DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_study_sessions_duration ON study_sessions (total_minutes DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_study_sessions_type ON study_sessions (session_type, start_time DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_study_sessions_analytics ON study_sessions (topic_id, end_time DESC) WHERE end_time IS NOT NULL;

-- Page Times - Detailed tracking queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_page_times_session_id ON page_times (session_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_page_times_pdf_page ON page_times (pdf_id, page_number);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_page_times_duration ON page_times (duration_seconds DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_page_times_reading_speed ON page_times (reading_speed_wpm DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_page_times_created_at ON page_times (created_at DESC);

-- Pomodoro Sessions - Timer queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_pomodoro_sessions_study_session ON pomodoro_sessions (study_session_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_pomodoro_sessions_cycle_type ON pomodoro_sessions (cycle_type, started_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_pomodoro_sessions_completed ON pomodoro_sessions (completed, completed_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_pomodoro_sessions_effectiveness ON pomodoro_sessions (effectiveness_rating DESC);

-- Reading Speeds - Analytics queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reading_speeds_pdf_id ON reading_speeds (pdf_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reading_speeds_topic_id ON reading_speeds (topic_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reading_speeds_session_id ON reading_speeds (session_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reading_speeds_wpm ON reading_speeds (words_per_minute DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reading_speeds_time_analysis ON reading_speeds (time_of_day, day_of_week);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reading_speeds_calculated_at ON reading_speeds (calculated_at DESC);

-- Time Estimates - Prediction queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_time_estimates_pdf_id ON time_estimates (pdf_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_time_estimates_topic_id ON time_estimates (topic_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_time_estimates_type ON time_estimates (estimate_type, confidence_level);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_time_estimates_accuracy ON time_estimates (accuracy_score DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_time_estimates_valid ON time_estimates (valid_until) WHERE valid_until > NOW();

-- ============================================================================
-- CONTENT AND KNOWLEDGE MANAGEMENT INDEXES
-- ============================================================================

-- Notes - Search and linking queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notes_title_content_search ON notes USING gin(to_tsvector('english', title || ' ' || COALESCE(content, '')));
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notes_pdf_id ON notes (pdf_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notes_topic_id ON notes (topic_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notes_session_id ON notes (session_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notes_type_page ON notes (note_type, page_number);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notes_archived ON notes (is_archived, created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notes_importance ON notes (importance_score DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notes_updated_at ON notes (updated_at DESC);

-- Note Links - Relationship queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_note_links_source ON note_links (source_note_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_note_links_target ON note_links (target_note_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_note_links_bidirectional ON note_links (source_note_id, target_note_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_note_links_strength ON note_links (strength_score DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_note_links_type ON note_links (link_type, created_at DESC);

-- Note Versions - History tracking
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_note_versions_note_id ON note_versions (note_id, version_number DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_note_versions_created_at ON note_versions (created_at DESC);

-- Highlights - PDF annotation queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_highlights_pdf_page ON highlights (pdf_id, page_number);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_highlights_session_id ON highlights (session_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_highlights_note_id ON highlights (note_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_highlights_type_color ON highlights (highlight_type, color);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_highlights_importance ON highlights (importance_level DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_highlights_created_at ON highlights (created_at DESC);

-- Bookmarks - Navigation queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bookmarks_pdf_page ON bookmarks (pdf_id, page_number);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bookmarks_session_id ON bookmarks (session_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bookmarks_note_id ON bookmarks (note_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bookmarks_type ON bookmarks (bookmark_type, created_at DESC);

-- Knowledge Graph - Complex relationship queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_knowledge_nodes_type_entity ON knowledge_nodes (node_type, entity_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_knowledge_nodes_centrality ON knowledge_nodes (centrality_score DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_knowledge_nodes_importance ON knowledge_nodes (importance_rank);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_knowledge_nodes_community ON knowledge_nodes (community_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_knowledge_edges_source ON knowledge_edges (source_node_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_knowledge_edges_target ON knowledge_edges (target_node_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_knowledge_edges_type_weight ON knowledge_edges (edge_type, weight DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_knowledge_edges_bidirectional ON knowledge_edges (source_node_id, target_node_id);

-- ============================================================================
-- EXERCISE AND ASSESSMENT INDEXES
-- ============================================================================

-- Exercises - Practice material queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_exercises_topic_id ON exercises (topic_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_exercises_difficulty ON exercises (difficulty DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_exercises_type ON exercises (exercise_type, created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_exercises_active ON exercises (is_active, created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_exercises_search ON exercises USING gin(to_tsvector('english', title || ' ' || COALESCE(description, '')));

-- Exercise Attempts - Performance tracking
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_exercise_attempts_exercise_id ON exercise_attempts (exercise_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_exercise_attempts_correct ON exercise_attempts (is_correct, attempted_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_exercise_attempts_score ON exercise_attempts (score DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_exercise_attempts_time ON exercise_attempts (time_taken);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_exercise_attempts_attempted_at ON exercise_attempts (attempted_at DESC);

-- ============================================================================
-- GOALS AND ACHIEVEMENT SYSTEM INDEXES
-- ============================================================================

-- Goals - Goal tracking queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_goals_status ON goals (status, target_date);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_goals_type_priority ON goals (goal_type, priority);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_goals_topic_id ON goals (topic_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_goals_pdf_id ON goals (pdf_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_goals_parent_goal ON goals (parent_goal_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_goals_progress ON goals (progress_percentage DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_goals_target_date ON goals (target_date) WHERE target_date IS NOT NULL;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_goals_overdue ON goals (target_date, status) WHERE target_date < NOW() AND status != 'completed';
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_goals_active ON goals (status, created_at DESC) WHERE status = 'active';
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_goals_streak ON goals (streak_count DESC);

-- Milestones - Goal progress tracking
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_milestones_goal_id ON milestones (goal_id, order_sequence);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_milestones_completed ON milestones (is_completed, completed_date DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_milestones_target_percentage ON milestones (target_percentage);

-- Goal Progress - Progress logging
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_goal_progress_goal_id ON goal_progress (goal_id, recorded_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_goal_progress_session_id ON goal_progress (session_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_goal_progress_date ON goal_progress (recorded_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_goal_progress_activity_type ON goal_progress (activity_type, recorded_at DESC);

-- Achievements - Gamification queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_achievements_category ON achievements (category, rarity);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_achievements_criteria ON achievements (criteria_type, criteria_value);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_achievements_active ON achievements (is_active, unlock_level);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_achievements_rarity ON achievements (rarity, xp_reward DESC);

-- User Achievements - User progress tracking
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_achievements_user_id ON user_achievements (user_id, earned_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_achievements_achievement_id ON user_achievements (achievement_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_achievements_triggered_goal ON user_achievements (triggered_by_goal);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_achievements_triggered_session ON user_achievements (triggered_by_session);

-- ============================================================================
-- ANALYTICS AND INSIGHTS INDEXES
-- ============================================================================

-- Daily Stats - Analytics dashboard queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_daily_stats_date_user ON daily_stats (stat_date DESC, user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_daily_stats_user_date_range ON daily_stats (user_id, stat_date DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_daily_stats_study_time ON daily_stats (total_study_minutes DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_daily_stats_focus_score ON daily_stats (average_focus_score DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_daily_stats_productivity ON daily_stats (productivity_score DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_daily_stats_streak ON daily_stats (streak_days DESC);

-- Performance Insights - Recommendation engine
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_performance_insights_active ON performance_insights (is_active, impact_score DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_performance_insights_user ON performance_insights (user_id, generated_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_performance_insights_type_category ON performance_insights (insight_type, category);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_performance_insights_confidence ON performance_insights (confidence_score DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_performance_insights_topic_id ON performance_insights (topic_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_performance_insights_goal_id ON performance_insights (goal_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_performance_insights_valid ON performance_insights (valid_until) WHERE valid_until > NOW();

-- Study Efficiency Metrics - Performance analysis
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_efficiency_metrics_date_user ON study_efficiency_metrics (measurement_date DESC, user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_efficiency_metrics_topic_id ON study_efficiency_metrics (topic_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_efficiency_metrics_pages_per_hour ON study_efficiency_metrics (pages_per_hour DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_efficiency_metrics_retention ON study_efficiency_metrics (retention_rate DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_efficiency_metrics_flow_state ON study_efficiency_metrics (flow_state_frequency DESC);

-- ============================================================================
-- MAINTENANCE AND OPTIMIZATION VIEWS
-- ============================================================================

-- Create materialized view for expensive analytics queries
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_topic_analytics AS
SELECT 
    t.id as topic_id,
    t.name as topic_name,
    COUNT(p.id) as total_pdfs,
    COUNT(CASE WHEN p.is_completed THEN 1 END) as completed_pdfs,
    COALESCE(SUM(p.total_pages), 0) as total_pages,
    COALESCE(SUM(p.current_page), 0) as pages_read,
    COALESCE(AVG(ss.focus_score), 0) as avg_focus_score,
    COALESCE(SUM(ss.total_minutes), 0) as total_study_minutes,
    COUNT(DISTINCT ss.id) as total_sessions,
    MAX(ss.end_time) as last_studied,
    t.study_progress,
    t.priority_level,
    t.difficulty_level,
    t.created_at,
    t.updated_at
FROM topics t
LEFT JOIN pdfs p ON t.id = p.topic_id
LEFT JOIN study_sessions ss ON t.id = ss.topic_id AND ss.end_time IS NOT NULL
WHERE t.is_archived = false
GROUP BY t.id, t.name, t.study_progress, t.priority_level, t.difficulty_level, t.created_at, t.updated_at;

-- Index the materialized view
CREATE UNIQUE INDEX idx_mv_topic_analytics_topic_id ON mv_topic_analytics (topic_id);
CREATE INDEX idx_mv_topic_analytics_progress ON mv_topic_analytics (study_progress DESC);
CREATE INDEX idx_mv_topic_analytics_focus ON mv_topic_analytics (avg_focus_score DESC);
CREATE INDEX idx_mv_topic_analytics_study_time ON mv_topic_analytics (total_study_minutes DESC);

-- Create function to refresh materialized views
CREATE OR REPLACE FUNCTION refresh_analytics_views()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_topic_analytics;
    -- Add other materialized views here as needed
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- PERFORMANCE MONITORING FUNCTIONS
-- ============================================================================

-- Function to analyze query performance
CREATE OR REPLACE FUNCTION analyze_query_performance()
RETURNS TABLE(
    query text,
    calls bigint,
    total_time double precision,
    mean_time double precision,
    stddev_time double precision,
    min_time double precision,
    max_time double precision
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pg_stat_statements.query,
        pg_stat_statements.calls,
        pg_stat_statements.total_exec_time,
        pg_stat_statements.mean_exec_time,
        pg_stat_statements.stddev_exec_time,
        pg_stat_statements.min_exec_time,
        pg_stat_statements.max_exec_time
    FROM pg_stat_statements
    WHERE pg_stat_statements.query LIKE '%studysprint%'
       OR pg_stat_statements.query LIKE '%topics%'
       OR pg_stat_statements.query LIKE '%pdfs%'
       OR pg_stat_statements.query LIKE '%study_sessions%'
    ORDER BY pg_stat_statements.mean_exec_time DESC
    LIMIT 20;
END;
$$ LANGUAGE plpgsql;

-- Function to get table statistics
CREATE OR REPLACE FUNCTION get_table_stats()
RETURNS TABLE(
    table_name text,
    row_count bigint,
    table_size text,
    index_size text,
    total_size text
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        schemaname||'.'||tablename as table_name,
        n_tup_ins + n_tup_upd + n_tup_del as row_count,
        pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as table_size,
        pg_size_pretty(pg_indexes_size(schemaname||'.'||tablename)) as index_size,
        pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) + pg_indexes_size(schemaname||'.'||tablename)) as total_size
    FROM pg_stat_user_tables
    WHERE schemaname = 'public'
    ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- MAINTENANCE SCHEDULE
-- ============================================================================

-- Daily maintenance (run via cron or application scheduler)
CREATE OR REPLACE FUNCTION daily_maintenance()
RETURNS void AS $$
BEGIN
    -- Update table statistics
    ANALYZE;
    
    -- Refresh materialized views
    PERFORM refresh_analytics_views();
    
    -- Log maintenance completion
    INSERT INTO daily_stats (stat_date, user_id) 
    VALUES (CURRENT_DATE, 'system_maintenance')
    ON CONFLICT (stat_date, user_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '====================================================';
    RAISE NOTICE 'StudySprint 4.0 Database Performance Optimization Complete!';
    RAISE NOTICE '====================================================';
    RAISE NOTICE 'Created indexes for all 25 tables';
    RAISE NOTICE 'Added materialized views for analytics';
    RAISE NOTICE 'Installed performance monitoring functions';
    RAISE NOTICE '====================================================';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Run: SELECT get_table_stats();';
    RAISE NOTICE '2. Test query performance with your application';
    RAISE NOTICE '3. Schedule daily_maintenance() function';
    RAISE NOTICE '====================================================';
END $$;