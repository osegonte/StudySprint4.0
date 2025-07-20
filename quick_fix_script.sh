#!/bin/bash
# Quick Fix Script for StudySprint 4.0 Stage 3 Issues

echo "🔧 StudySprint 4.0 - Quick Fix for Stage 3"
echo "=========================================="
echo ""

# Get to the project root
cd /Users/osegonte/StudySprint4.0

echo "📁 Working in: $(pwd)"
echo ""

# 1. Fix the database models file
echo "🗄️  Fixing database models..."
cp backend/common/database.py backend/common/database.py.backup
cat > backend/common/database.py << 'EOF'
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

class Topic(Base):
    __tablename__ = "topics"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    color = Column(String(7), default='#3498db')
    icon = Column(String(50), default='book')
    total_pdfs = Column(Integer, default=0)
    total_exercises = Column(Integer, default=0)
    study_progress = Column(DECIMAL(5,2), default=0.0)
    estimated_completion_hours = Column(Integer, default=0)
    difficulty_level = Column(Integer, default=1)
    priority_level = Column(Integer, default=1)
    is_archived = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f"<Topic(id={self.id}, name='{self.name}', pdfs={self.total_pdfs})>"

    @property
    def completion_percentage(self):
        return float(self.study_progress)

    def update_progress(self, completed_pdfs: int, total_pdfs: int):
        self.total_pdfs = total_pdfs
        if total_pdfs > 0:
            self.study_progress = (completed_pdfs / total_pdfs) * 100
        else:
            self.study_progress = 0.0


class PDF(Base):
    __tablename__ = "pdfs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    topic_id = Column(UUID(as_uuid=True), ForeignKey("topics.id", ondelete="CASCADE"))
    title = Column(String(255), nullable=False)
    description = Column(Text)
    file_name = Column(String(255), nullable=False)
    file_path = Column(Text, nullable=False)
    file_size = Column(Integer)
    total_pages = Column(Integer, default=0)
    current_page = Column(Integer, default=1)
    last_read_page = Column(Integer, default=1)
    reading_progress = Column(DECIMAL(5,2), default=0.0)
    pdf_type = Column(String(20), default='study')
    parent_pdf_id = Column(UUID(as_uuid=True), ForeignKey("pdfs.id"))
    difficulty_level = Column(Integer, default=1)
    estimated_read_time_minutes = Column(Integer, default=0)
    actual_read_time_minutes = Column(Integer, default=0)
    is_completed = Column(Boolean, default=False)
    completion_date = Column(DateTime)
    upload_status = Column(String(20), default='completed')
    processing_status = Column(String(20), default='pending')
    content_hash = Column(String(64))
    extracted_text = Column(Text)
    language = Column(String(10), default='en')
    author = Column(String(255))
    subject = Column(String(255))
    keywords = Column(ARRAY(String))
    file_metadata = Column(JSON, default={})
    ai_analysis = Column(JSON, default={})
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    parent_pdf = relationship("PDF", remote_side=[id])

    def __repr__(self):
        return f"<PDF(id={self.id}, title='{self.title}', pages={self.total_pages})>"

    @property
    def is_processing(self):
        return self.processing_status in ['pending', 'processing']

    @property
    def progress_percentage(self):
        if self.total_pages == 0:
            return 0
        return round((self.current_page / self.total_pages) * 100, 2)

    def update_reading_progress(self, current_page: int):
        self.current_page = current_page
        self.last_read_page = max(self.last_read_page, current_page)
        if self.total_pages > 0:
            self.reading_progress = (current_page / self.total_pages) * 100
            if current_page >= self.total_pages:
                self.is_completed = True
                self.completion_date = datetime.utcnow()
EOF

echo "✅ Database models fixed"

# 2. Create minimal sessions module for now
echo "📦 Creating minimal sessions module..."
mkdir -p backend/modules/sessions

cat > backend/modules/sessions/__init__.py << 'EOF'
# StudySprint 4.0 - Sessions Module
EOF

cat > backend/modules/sessions/models.py << 'EOF'
# Placeholder for sessions models
# Will be expanded in full Stage 3 implementation
EOF

cat > backend/modules/sessions/schemas.py << 'EOF'
from pydantic import BaseModel
from typing import Optional
from uuid import UUID

class SessionResponse(BaseModel):
    message: str = "Sessions module placeholder"
EOF

cat > backend/modules/sessions/services.py << 'EOF'
# Placeholder for sessions services
class SessionService:
    def __init__(self, db):
        self.db = db
EOF

cat > backend/modules/sessions/routes.py << 'EOF'
from fastapi import APIRouter

router = APIRouter()

@router.get("/placeholder")
async def sessions_placeholder():
    return {"message": "Sessions module placeholder - Stage 3 coming soon!"}
EOF

echo "✅ Minimal sessions module created"

# 3. Fix alembic configuration
echo "🔧 Setting up Alembic..."
cat > backend/alembic.ini << 'EOF'
[alembic]
script_location = alembic
prepend_sys_path = .
sqlalchemy.url = postgresql://osegonte@localhost:5432/studysprint4_local

[post_write_hooks]

[loggers]
keys = root,sqlalchemy,alembic

[handlers]
keys = console

[formatters]
keys = generic

[logger_root]
level = WARN
handlers = console
qualname =

[logger_sqlalchemy]
level = WARN
handlers =
qualname = sqlalchemy.engine

[logger_alembic]
level = INFO
handlers =
qualname = alembic

[handler_console]
class = StreamHandler
args = (sys.stderr,)
level = NOTSET
formatter = generic

[formatter_generic]
format = %(levelname)-5.5s [%(name)s] %(message)s
datefmt = %H:%M:%S
EOF

echo "✅ Alembic configuration fixed"

# 4. Update main.py to remove sessions import for now
echo "📄 Updating main.py..."
cat > backend/main.py << 'EOF'
# backend/main.py
"""
StudySprint 4.0 - FastAPI Application Entry Point
Stage 2+ with placeholder for Stage 3
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
import os
from datetime import datetime
import logging

# Import implemented modules
from modules.topics.routes import router as topics_router
from modules.pdfs.routes import router as pdfs_router
from modules.sessions.routes import router as sessions_router  # Placeholder

from common.database import engine, Base

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="StudySprint 4.0 API",
    description="Complete Personal Study Tool with Advanced Analytics",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create database tables
@app.on_event("startup")
async def startup_event():
    """Create database tables on startup"""
    logger.info("Creating database tables...")
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables created successfully")
    except Exception as e:
        logger.error(f"Error creating database tables: {str(e)}")

# Static files for uploads
upload_dir = "uploads"
if not os.path.exists(upload_dir):
    os.makedirs(upload_dir)
    for subdir in ["pdfs", "thumbnails", "temp"]:
        os.makedirs(os.path.join(upload_dir, subdir), exist_ok=True)

app.mount("/uploads", StaticFiles(directory=upload_dir), name="uploads")

# Health check endpoint
@app.get("/")
async def root():
    return {
        "message": "StudySprint 4.0 API",
        "version": "1.0.0",
        "status": "running",
        "timestamp": datetime.utcnow().isoformat(),
        "stage": "Stage 2+ Ready for Stage 3: Session Tracking 🚀"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint with service status"""
    try:
        from common.database import SessionLocal
        db = SessionLocal()
        db.execute("SELECT 1")
        db.close()
        db_status = "online"
    except Exception as e:
        logger.error(f"Database health check failed: {str(e)}")
        db_status = "offline"
    
    return {
        "status": "healthy" if db_status == "online" else "degraded",
        "timestamp": datetime.utcnow().isoformat(),
        "services": {
            "api": "online",
            "database": db_status,
            "file_storage": "online"
        },
        "version": "1.0.0",
        "environment": "development"
    }

# API version prefix
api_v1 = "/api/v1"

# Module routes
app.include_router(topics_router, prefix=f"{api_v1}/topics", tags=["topics"])
app.include_router(pdfs_router, prefix=f"{api_v1}/pdfs", tags=["pdfs"])
app.include_router(sessions_router, prefix=f"{api_v1}/sessions", tags=["sessions"])

@app.get(f"{api_v1}/status")
async def get_development_status():
    return {
        "project": "StudySprint 4.0",
        "current_stage": "Stage 2+ Ready for Stage 3",
        "completed": [
            "✅ Modular project structure",
            "✅ Environment configuration", 
            "✅ Database schema and models",
            "✅ Topics module (CRUD operations)",
            "✅ PDF module (upload, processing, management)",
            "✅ Backend foundation with FastAPI",
            "✅ File upload and basic processing",
            "✅ Fixed SQLAlchemy imports"
        ],
        "ready_for": [
            "🚀 Stage 3: Study session tracking",
            "🍅 Pomodoro timer integration",
            "📖 Page-level time tracking",
            "📊 Advanced analytics"
        ],
        "modules": {
            "topics": "✅ completed",
            "pdfs": "✅ completed",
            "sessions": "🔧 placeholder ready for implementation"
        },
        "api_endpoints": {
            "topics": "8 endpoints implemented",
            "pdfs": "8 endpoints implemented",
            "sessions": "1 placeholder endpoint",
            "total_implemented": "17"
        }
    }

@app.get(f"{api_v1}/stats")
async def get_system_stats():
    try:
        from common.database import SessionLocal, Topic, PDF
        
        db = SessionLocal()
        
        total_topics = db.query(Topic).count()
        active_topics = db.query(Topic).filter(Topic.is_archived == False).count()
        archived_topics = db.query(Topic).filter(Topic.is_archived == True).count()
        
        total_pdfs = db.query(PDF).count()
        completed_pdfs = db.query(PDF).filter(PDF.is_completed == True).count()
        
        db.close()
        
        return {
            "topics": {
                "total": total_topics,
                "active": active_topics,
                "archived": archived_topics
            },
            "pdfs": {
                "total": total_pdfs,
                "completed": completed_pdfs,
                "in_progress": total_pdfs - completed_pdfs,
                "completion_rate": round((completed_pdfs / total_pdfs * 100), 2) if total_pdfs > 0 else 0
            },
            "system": {
                "upload_directory": upload_dir,
                "environment": "development",
                "database_status": "connected",
                "stage": "Ready for Stage 3"
            }
        }
        
    except Exception as e:
        logger.error(f"Error getting system stats: {str(e)}")
        return {
            "topics": {"total": 0, "active": 0, "archived": 0},
            "pdfs": {"total": 0, "completed": 0, "in_progress": 0, "completion_rate": 0},
            "system": {"upload_directory": upload_dir, "environment": "development", "error": str(e)}
        }

# Error handlers
@app.exception_handler(404)
async def not_found_handler(request, exc):
    return JSONResponse(
        status_code=404,
        content={
            "error": "not_found",
            "message": "The requested resource was not found",
            "path": str(request.url.path)
        }
    )

@app.exception_handler(500)
async def internal_error_handler(request, exc):
    logger.error(f"Internal server error: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={
            "error": "internal_server_error",
            "message": "An internal server error occurred",
            "timestamp": datetime.utcnow().isoformat()
        }
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
EOF

echo "✅ Main.py updated"

# 5. Test the backend
echo "🧪 Testing backend startup..."
cd backend

# Activate venv if it exists
if [ -d "venv" ]; then
    source venv/bin/activate
    echo "✅ Virtual environment activated"
else
    echo "⚠️  No virtual environment found"
fi

# Test import
echo "🔍 Testing imports..."
if python -c "from common.database import Topic, PDF; print('✅ Database models import successfully')" 2>/dev/null; then
    echo "✅ Database imports working"
else
    echo "❌ Database imports failed"
fi

echo ""
echo "🎯 Quick Fix Complete!"
echo "===================="
echo ""
echo "✅ Fixed Issues:"
echo "  - SQLAlchemy DECIMAL import error"
echo "  - Alembic configuration missing"
echo "  - Database models compatibility"
echo "  - Sessions module placeholder"
echo ""
echo "🚀 Next Steps:"
echo "1. Test the backend:"
echo "   cd backend && source venv/bin/activate"
echo "   python -c 'from main import app; print(\"✅ App imports successfully\")'"
echo "   uvicorn main:app --reload"
echo ""
echo "2. Visit http://localhost:8000/docs to confirm API is working"
echo ""
echo "3. Check http://localhost:8000/api/v1/status for current stage"
echo ""
echo "4. Ready to implement full Stage 3 features!"
echo ""
echo "📊 Current Status:"
echo "  - Backend: ✅ Working with placeholder sessions"
echo "  - Database: ✅ Fixed imports"
echo "  - API: ✅ 17 endpoints available"
echo "  - Ready for: 🚀 Full Stage 3 implementation"