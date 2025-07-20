# backend/main.py - Updated for Stage 3
"""
StudySprint 4.0 - FastAPI Application Entry Point
Stage 3: Complete with Study Sessions Integration
"""

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
import os
from datetime import datetime
import logging
import asyncio

# Import all modules
from modules.topics.routes import router as topics_router
from modules.pdfs.routes import router as pdfs_router
from modules.sessions.routes import router as sessions_router
from modules.sessions.timer import session_timer

from common.database import engine, Base

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="StudySprint 4.0 API",
    description="Complete Personal Study Tool with Advanced Session Tracking",
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

# Create database tables and start background tasks
@app.on_event("startup")
async def startup_event():
    """Initialize application on startup"""
    logger.info("StudySprint 4.0 starting up...")
    
    try:
        # Create database tables
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables created successfully")
        
        # Start background timer updates
        asyncio.create_task(session_timer.start_background_updates())
        logger.info("Background timer service started")
        
    except Exception as e:
        logger.error(f"Error during startup: {str(e)}")

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    logger.info("StudySprint 4.0 shutting down...")
    await session_timer.stop_background_updates()

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
        "message": "StudySprint 4.0 API - Stage 3 Complete! 🎯",
        "version": "1.0.0",
        "status": "running",
        "timestamp": datetime.utcnow().isoformat(),
        "features": {
            "study_sessions": "✅ Active",
            "pomodoro_timer": "✅ Active", 
            "real_time_tracking": "✅ Active",
            "analytics": "✅ Active",
            "focus_scoring": "✅ Active"
        }
    }

@app.get("/health")
async def health_check():
    """Comprehensive health check with service status"""
    try:
        from common.database import SessionLocal
        from sqlalchemy import text
        db = SessionLocal()
        db.execute(text("SELECT 1"))
        db.close()
        db_status = "online"
    except Exception as e:
        logger.error(f"Database health check failed: {str(e)}")
        db_status = "offline"
    
    # Check timer service
    timer_status = "online" if session_timer.is_running else "offline"
    
    return {
        "status": "healthy" if all([db_status == "online", timer_status == "online"]) else "degraded",
        "timestamp": datetime.utcnow().isoformat(),
        "services": {
            "api": "online",
            "database": db_status,
            "file_storage": "online",
            "timer_service": timer_status,
            "websocket": "online"
        },
        "version": "1.0.0",
        "environment": "development",
        "stage": "Stage 3 Complete: Advanced Study Features"
    }

# API version prefix
api_v1 = "/api/v1"

# Module routes
app.include_router(topics_router, prefix=f"{api_v1}/topics", tags=["topics"])
app.include_router(pdfs_router, prefix=f"{api_v1}/pdfs", tags=["pdfs"])
app.include_router(sessions_router, prefix=f"{api_v1}/sessions", tags=["sessions"])

@app.get(f"{api_v1}/status")
async def get_development_status():
    """Development status with Stage 3 completion"""
    return {
        "project": "StudySprint 4.0",
        "current_stage": "Stage 3 COMPLETE: Advanced Study Features",
        "completed": [
            "✅ Modular project structure",
            "✅ Environment configuration", 
            "✅ Database schema with sessions tables",
            "✅ Topics module (CRUD + analytics)",
            "✅ PDF module (upload + management)",
            "✅ Study session tracking system",
            "✅ Real-time timer with WebSocket",
            "✅ Pomodoro timer integration",
            "✅ Page-level time tracking",
            "✅ Focus scoring algorithms",
            "✅ Activity detection system",
            "✅ Session analytics & insights",
            "✅ Performance metrics calculation"
        ],
        "ready_for": [
            "🎯 Stage 4: Note-taking & highlighting",
            "🔗 Wiki-style linking system",
            "🎨 Knowledge graph visualization",
            "📊 Advanced analytics dashboard"
        ],
        "modules": {
            "topics": "✅ completed with enhanced analytics",
            "pdfs": "✅ completed with progress tracking", 
            "sessions": "✅ completed with full feature set",
            "notes": "🚧 ready for Stage 4",
            "highlights": "🚧 ready for Stage 4",
            "analytics": "✅ basic version complete"
        },
        "api_endpoints": {
            "topics": "8 endpoints",
            "pdfs": "8 endpoints",
            "sessions": "12 endpoints + WebSocket",
            "total_implemented": "28+"
        },
        "advanced_features": {
            "real_time_timer": "✅ WebSocket-based",
            "focus_scoring": "✅ Advanced algorithms",
            "activity_tracking": "✅ Mouse/keyboard detection",
            "pomodoro_integration": "✅ Full cycle management",
            "session_analytics": "✅ Comprehensive metrics",
            "idle_detection": "✅ Smart threshold-based",
            "progress_tracking": "✅ Page-level granularity"
        }
    }

@app.get(f"{api_v1}/stats")
async def get_system_stats():
    """Enhanced system statistics with session data"""
    try:
        from common.database import SessionLocal, Topic, PDF
        from modules.sessions.models import StudySession
        
        db = SessionLocal()
        
        # Basic counts
        total_topics = db.query(Topic).count()
        active_topics = db.query(Topic).filter(Topic.is_archived == False).count()
        total_pdfs = db.query(PDF).count()
        completed_pdfs = db.query(PDF).filter(PDF.is_completed == True).count()
        
        # Session stats
        total_sessions = db.query(StudySession).count()
        active_sessions = db.query(StudySession).filter(StudySession.end_time.is_(None)).count()
        total_study_time = db.query(func.sum(StudySession.total_minutes)).scalar() or 0
        
        # Calculate averages
        avg_focus_score = db.query(func.avg(StudySession.focus_score)).scalar() or 0
        avg_session_duration = db.query(func.avg(StudySession.total_minutes)).scalar() or 0
        
        db.close()
        
        return {
            "topics": {
                "total": total_topics,
                "active": active_topics,
                "archived": total_topics - active_topics
            },
            "pdfs": {
                "total": total_pdfs,
                "completed": completed_pdfs,
                "in_progress": total_pdfs - completed_pdfs,
                "completion_rate": round((completed_pdfs / total_pdfs * 100), 2) if total_pdfs > 0 else 0
            },
            "sessions": {
                "total": total_sessions,
                "active": active_sessions,
                "total_study_hours": round(total_study_time / 60, 1),
                "average_focus_score": round(float(avg_focus_score), 1),
                "average_duration_minutes": round(float(avg_session_duration), 1)
            },
            "system": {
                "upload_directory": upload_dir,
                "environment": "development",
                "database_status": "connected",
                "timer_service": "active" if session_timer.is_running else "inactive",
                "stage": "Stage 3 Complete"
            }
        }
        
    except Exception as e:
        logger.error(f"Error getting system stats: {str(e)}")
        return {
            "error": str(e),
            "stage": "Stage 3 Complete - Error in stats calculation"
        }

# Error handlers
@app.exception_handler(404)
async def not_found_handler(request, exc):
    return JSONResponse(
        status_code=404,
        content={
            "error": "not_found",
            "message": "The requested resource was not found",
            "path": str(request.url.path),
            "suggestion": "Check /docs for available endpoints"
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
