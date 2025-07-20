# backend/alembic/env.py
"""
StudySprint 4.0 - Alembic Environment Configuration
Database migration environment setup
"""

from logging.config import fileConfig
from sqlalchemy import engine_from_config
from sqlalchemy import pool
from alembic import context
import os
import sys

# Add the backend directory to the path
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from common.database import Base

# Import all models to ensure they're registered with SQLAlchemy
from modules.topics.models import Topic
from modules.pdfs.models import PDF

# this is the Alembic Config object
config = context.config

# Interpret the config file for Python logging
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Set the SQLAlchemy database URL
database_url = os.getenv("DATABASE_URL", "postgresql://osegonte@localhost:5432/studysprint4_local")
config.set_main_option("sqlalchemy.url", database_url)

# add your model's MetaData object here for 'autogenerate' support
target_metadata = Base.metadata

def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()

def run_migrations_online() -> None:
    """Run migrations in 'online' mode."""
    connectable = engine_from_config(
        config.get_section(config.config_ini_section),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection, target_metadata=target_metadata
        )

        with context.begin_transaction():
            context.run_migrations()

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()


# backend/alembic/versions/001_initial_schema.py
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
        sa.Column('metadata', sa.JSON(), nullable=True),
        sa.Column('ai_analysis', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['parent_pdf_id'], ['pdfs.id'], ),
        sa.ForeignKeyConstraint(['topic_id'], ['topics.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create indexes for performance
    op.create_index('idx_pdfs_topic_id', 'pdfs', ['topic_id'], unique=False)
    op.create_index('idx_pdfs_upload_date', 'pdfs', ['created_at'], unique=False)
    op.create_index('idx_pdfs_content_hash', 'pdfs', ['content_hash'], unique=False)
    
    # Create full-text search indexes
    op.execute("CREATE INDEX idx_pdfs_title_search ON pdfs USING gin(to_tsvector('english', title))")
    op.execute("CREATE INDEX idx_pdfs_content_search ON pdfs USING gin(to_tsvector('english', extracted_text))")


def downgrade() -> None:
    # Drop indexes first
    op.drop_index('idx_pdfs_content_search', table_name='pdfs')
    op.drop_index('idx_pdfs_title_search', table_name='pdfs')
    op.drop_index('idx_pdfs_content_hash', table_name='pdfs')
    op.drop_index('idx_pdfs_upload_date', table_name='pdfs')
    op.drop_index('idx_pdfs_topic_id', table_name='pdfs')
    
    # Drop tables
    op.drop_table('pdfs')
    op.drop_table('topics')


# backend/common/config.py
"""
StudySprint 4.0 - Configuration Management
Application configuration and environment variables
"""

from pydantic import BaseSettings, Field
from typing import List, Optional
import os


class Settings(BaseSettings):
    """Application settings from environment variables"""
    
    # Database Configuration
    database_url: str = Field(
        default="postgresql://osegonte@localhost:5432/studysprint4_local",
        env="DATABASE_URL"
    )
    
    # Redis Configuration
    redis_url: str = Field(
        default="redis://localhost:6379",
        env="REDIS_URL"
    )
    
    # Application Configuration
    environment: str = Field(default="development", env="ENVIRONMENT")
    debug: bool = Field(default=True, env="DEBUG")
    log_level: str = Field(default="INFO", env="LOG_LEVEL")
    secret_key: str = Field(default="dev-secret-key", env="SECRET_KEY")
    
    # File Storage Configuration
    upload_dir: str = Field(default="./uploads", env="UPLOAD_DIR")
    max_file_size_mb: int = Field(default=500, env="MAX_FILE_SIZE_MB")
    backup_dir: str = Field(default="./backups", env="BACKUP_DIR")
    allowed_file_types: List[str] = Field(
        default=["pdf", "doc", "docx", "txt"],
        env="ALLOWED_FILE_TYPES"
    )
    
    # Study Configuration
    default_pomodoro_work_minutes: int = Field(default=25, env="DEFAULT_POMODORO_WORK_MINUTES")
    default_pomodoro_short_break_minutes: int = Field(default=5, env="DEFAULT_POMODORO_SHORT_BREAK_MINUTES")
    default_pomodoro_long_break_minutes: int = Field(default=15, env="DEFAULT_POMODORO_LONG_BREAK_MINUTES")
    reading_speed_wpm_average: int = Field(default=250, env="READING_SPEED_WPM_AVERAGE")
    default_session_goal_minutes: int = Field(default=60, env="DEFAULT_SESSION_GOAL_MINUTES")
    
    # AI Configuration
    openai_api_key: Optional[str] = Field(default=None, env="OPENAI_API_KEY")
    openai_model: str = Field(default="gpt-4", env="OPENAI_MODEL")
    openai_max_tokens: int = Field(default=2000, env="OPENAI_MAX_TOKENS")
    ai_features_enabled: bool = Field(default=False, env="AI_FEATURES_ENABLED")
    
    # Security Configuration
    cors_origins: List[str] = Field(
        default=["http://localhost:3000", "http://localhost:5173"],
        env="CORS_ORIGINS"
    )
    jwt_secret_key: str = Field(default="jwt-secret", env="JWT_SECRET_KEY")
    jwt_algorithm: str = Field(default="HS256", env="JWT_ALGORITHM")
    jwt_access_token_expire_minutes: int = Field(default=30, env="JWT_ACCESS_TOKEN_EXPIRE_MINUTES")
    
    # Performance Configuration
    worker_processes: int = Field(default=1, env="WORKER_PROCESSES")
    max_connections: int = Field(default=1000, env="MAX_CONNECTIONS")
    keep_alive_timeout: int = Field(default=5, env="KEEP_ALIVE_TIMEOUT")
    
    # Analytics Configuration
    analytics_enabled: bool = Field(default=True, env="ANALYTICS_ENABLED")
    metrics_retention_days: int = Field(default=90, env="METRICS_RETENTION_DAYS")
    
    class Config:
        env_file = ".env"
        case_sensitive = False

# Global settings instance
settings = Settings()


# backend/common/errors.py
"""
StudySprint 4.0 - Error Handling
Custom exceptions and error handling utilities
"""

from fastapi import HTTPException, status
from typing import Optional, Dict, Any


class StudySprintException(Exception):
    """Base exception for StudySprint application"""
    
    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
        self.message = message
        self.details = details or {}
        super().__init__(self.message)


class ValidationError(StudySprintException):
    """Validation error exception"""
    pass


class FileProcessingError(StudySprintException):
    """File processing error exception"""
    pass


class DatabaseError(StudySprintException):
    """Database operation error exception"""
    pass


class NotFoundError(StudySprintException):
    """Resource not found error exception"""
    pass


class AuthenticationError(StudySprintException):
    """Authentication error exception"""
    pass


class AuthorizationError(StudySprintException):
    """Authorization error exception"""
    pass


# HTTP Exception factory functions
def http_not_found(message: str = "Resource not found") -> HTTPException:
    """Create a 404 HTTP exception"""
    return HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=message
    )


def http_bad_request(message: str = "Bad request") -> HTTPException:
    """Create a 400 HTTP exception"""
    return HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail=message
    )


def http_internal_error(message: str = "Internal server error") -> HTTPException:
    """Create a 500 HTTP exception"""
    return HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail=message
    )


def http_unprocessable_entity(message: str = "Validation error", errors: Optional[list] = None) -> HTTPException:
    """Create a 422 HTTP exception"""
    detail = {"message": message}
    if errors:
        detail["errors"] = errors
    
    return HTTPException(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        detail=detail
    )


# backend/common/utils.py
"""
StudySprint 4.0 - Utility Functions
Common utility functions and helpers
"""

import hashlib
import os
import uuid
from pathlib import Path
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)


def generate_uuid() -> str:
    """Generate a new UUID string"""
    return str(uuid.uuid4())


def calculate_file_hash(file_path: Path) -> str:
    """Calculate SHA256 hash of a file"""
    hash_sha256 = hashlib.sha256()
    
    with open(file_path, "rb") as f:
        for chunk in iter(lambda: f.read(4096), b""):
            hash_sha256.update(chunk)
    
    return hash_sha256.hexdigest()


def ensure_directory_exists(directory_path: Path) -> bool:
    """Ensure a directory exists, create if it doesn't"""
    try:
        directory_path.mkdir(parents=True, exist_ok=True)
        return True
    except Exception as e:
        logger.error(f"Error creating directory {directory_path}: {str(e)}")
        return False


def safe_filename(filename: str) -> str:
    """Create a safe filename by removing/replacing problematic characters"""
    # Remove or replace problematic characters
    safe_chars = []
    for char in filename:
        if char.isalnum() or char in '-_.':
            safe_chars.append(char)
        elif char in ' ':
            safe_chars.append('_')
    
    return ''.join(safe_chars)


def format_file_size(size_bytes: int) -> str:
    """Format file size in human-readable format"""
    if size_bytes == 0:
        return "0 B"
    
    size_names = ["B", "KB", "MB", "GB", "TB"]
    i = 0
    while size_bytes >= 1024.0 and i < len(size_names) - 1:
        size_bytes /= 1024.0
        i += 1
    
    return f"{size_bytes:.1f} {size_names[i]}"


def calculate_reading_time(word_count: int, wpm: int = 250) -> int:
    """Calculate estimated reading time in minutes"""
    if word_count <= 0:
        return 0
    
    minutes = word_count / wpm
    return max(1, round(minutes))


def extract_keywords_from_text(text: str, max_keywords: int = 10) -> List[str]:
    """Extract keywords from text (simple implementation)"""
    if not text:
        return []
    
    # Simple keyword extraction - remove common words and get most frequent
    common_words = {
        'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
        'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'be',
        'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will',
        'would', 'could', 'should', 'may', 'might', 'must', 'can', 'this',
        'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they'
    }
    
    # Split into words and clean
    words = text.lower().split()
    keywords = []
    
    for word in words:
        # Remove punctuation and filter
        clean_word = ''.join(char for char in word if char.isalnum())
        if (len(clean_word) > 3 and 
            clean_word not in common_words and 
            clean_word not in keywords):
            keywords.append(clean_word)
        
        if len(keywords) >= max_keywords:
            break
    
    return keywords


def format_duration(seconds: int) -> str:
    """Format duration in seconds to human-readable format"""
    if seconds < 60:
        return f"{seconds}s"
    elif seconds < 3600:
        minutes = seconds // 60
        remaining_seconds = seconds % 60
        if remaining_seconds == 0:
            return f"{minutes}m"
        else:
            return f"{minutes}m {remaining_seconds}s"
    else:
        hours = seconds // 3600
        remaining_minutes = (seconds % 3600) // 60
        if remaining_minutes == 0:
            return f"{hours}h"
        else:
            return f"{hours}h {remaining_minutes}m"


def validate_uuid(uuid_string: str) -> bool:
    """Validate if a string is a valid UUID"""
    try:
        uuid.UUID(uuid_string)
        return True
    except ValueError:
        return False


def clean_text_content(text: str) -> str:
    """Clean and normalize text content"""
    if not text:
        return ""
    
    # Remove extra whitespace and normalize line breaks
    lines = []
    for line in text.split('\n'):
        clean_line = ' '.join(line.split())
        if clean_line:
            lines.append(clean_line)
    
    return '\n'.join(lines)


def calculate_progress_percentage(current: int, total: int) -> float:
    """Calculate progress percentage with safety checks"""
    if total <= 0:
        return 0.0
    
    percentage = (current / total) * 100
    return round(min(100.0, max(0.0, percentage)), 2)