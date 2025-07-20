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
        # Test database connection with proper SQLAlchemy syntax
        from common.database import SessionLocal
        from sqlalchemy import text
        db = SessionLocal()
        db.execute(text("SELECT 1"))  # Fix: Wrap in text()
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
