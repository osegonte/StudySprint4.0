"""
StudySprint 4.0 - Alembic Environment Configuration
Week 1 - Simplified imports for Stage 1 modules only
"""

from logging.config import fileConfig
from sqlalchemy import engine_from_config
from sqlalchemy import pool
from alembic import context
import os
import sys

# Add the backend directory to the path (we're running from backend/)
sys.path.append(os.path.dirname(__file__))
sys.path.append('.')

from common.database import Base

# Import only Stage 1 models (Week 1)
from modules.topics.models import Topic
from modules.pdfs.models import PDF

# Import session models for Stage 2 (ready for Week 2)
try:
    from modules.sessions.models import StudySession, PageTime, PomodoroSession, ReadingSpeed, TimeEstimate
except ImportError:
    pass

# Import notes models for Stage 4 (ready for Week 4)
try:
    from modules.notes.models import Note, NoteLink, Highlight, Bookmark, NoteVersion, KnowledgeNode, KnowledgeEdge
except ImportError:
    pass

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
