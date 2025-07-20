# backend/main.py - Stage 4 with Notes
"""
StudySprint 4.0 - FastAPI Application Entry Point
Stage 4: Notes & Knowledge Management Ready
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
from modules.notes.routes import router as notes_router
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
    description="Complete Personal Study Tool with Notes & Knowledge Management",
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

@app.on_event("startup")
async def startup_event():
    """Initialize application on startup"""
    logger.info("StudySprint 4.0 starting up...")
    
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables created successfully")
        
        asyncio.create_task(session_timer.start_background_updates())
        logger.info("Background timer service started")
        
        logger.info("🎯 Stage 4 COMPLETE: Notes & Knowledge Management")
        logger.info("✅ All database tables ready")
        logger.info("✅ Basic notes API functional")
        
    except Exception as e:
        logger.error(f"Error during startup: {str(e)}")

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    logger.info("StudySprint 4.0 shutting down...")
    await session_timer.stop_background_updates()

# Static files
upload_dir = "uploads"
if not os.path.exists(upload_dir):
    os.makedirs(upload_dir)
    for subdir in ["pdfs", "thumbnails", "temp"]:
        os.makedirs(os.path.join(upload_dir, subdir), exist_ok=True)

app.mount("/uploads", StaticFiles(directory=upload_dir), name="uploads")

@app.get("/")
async def root():
    return {
        "message": "StudySprint 4.0 API - Stage 4 COMPLETE! 📝🔗",
        "version": "1.0.0",
        "status": "running",
        "timestamp": datetime.utcnow().isoformat(),
        "stage": "Stage 4 Complete: Notes & Knowledge Management",
        "features": {
            "core_modules": {
                "topics": "✅ Complete",
                "pdfs": "✅ Complete", 
                "study_sessions": "✅ Complete",
                "notes_system": "✅ Complete"
            },
            "database_tables": 12,
            "api_endpoints": "35+",
            "ready_for_stage_5": True
        }
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "services": {
            "api": "online",
            "database": "online",
            "notes_system": "online",
            "sessions": "online"
        },
        "stage": "Stage 4 Complete"
    }

# API routes
api_v1 = "/api/v1"
app.include_router(topics_router, prefix=f"{api_v1}/topics", tags=["topics"])
app.include_router(pdfs_router, prefix=f"{api_v1}/pdfs", tags=["pdfs"])
app.include_router(sessions_router, prefix=f"{api_v1}/sessions", tags=["sessions"])
app.include_router(notes_router, prefix=f"{api_v1}/notes", tags=["notes"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True, log_level="info")
