# backend/common/database.py
"""
StudySprint 4.0 - Database Configuration
Fixed for Stage 3 with correct imports
"""

from sqlalchemy import create_engine, Column, String, Integer, Float, Boolean, DateTime, Text, JSON, ForeignKey, DECIMAL
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from sqlalchemy.sql import func
import uuid
from datetime import datetime
import os

# Database URL from environment
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://osegonte@localhost:5432/studysprint4_local")

# SQLAlchemy setup
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Dependency for FastAPI
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
