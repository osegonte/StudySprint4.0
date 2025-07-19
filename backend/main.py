"""
StudySprint 4.0 - FastAPI Application Entry Point
Complete Personal Study Tool with Advanced Analytics
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
import os
from datetime import datetime

# Import modules (will be implemented in subsequent stages)
# from modules.topics.routes import router as topics_router
# from modules.pdfs.routes import router as pdfs_router
# from modules.exercises.routes import router as exercises_router
# from modules.sessions.routes import router as sessions_router
# from modules.notes.routes import router as notes_router
# from modules.highlights.routes import router as highlights_router
# from modules.analytics.routes import router as analytics_router
# from modules.goals.routes import router as goals_router
# from modules.achievements.routes import router as achievements_router
# from modules.ai_assistant.routes import router as ai_router

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
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # Frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static files for uploads
if not os.path.exists("uploads"):
    os.makedirs("uploads")
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Health check endpoint
@app.get("/")
async def root():
    return {
        "message": "StudySprint 4.0 API",
        "version": "1.0.0",
        "status": "running",
        "timestamp": datetime.utcnow().isoformat(),
        "stage": "Stage 1: Foundation Complete ✅"
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "services": {
            "api": "online",
            "database": "pending",  # Will be implemented in Stage 1, Day 2
            "redis": "pending",     # Will be implemented in Stage 1, Day 2
            "file_storage": "online"
        }
    }

# API version prefix
api_v1 = "/api/v1"

# Module routes (will be uncommented as modules are implemented)
# app.include_router(topics_router, prefix=f"{api_v1}/topics", tags=["topics"])
# app.include_router(pdfs_router, prefix=f"{api_v1}/pdfs", tags=["pdfs"])
# app.include_router(exercises_router, prefix=f"{api_v1}/exercises", tags=["exercises"])
# app.include_router(sessions_router, prefix=f"{api_v1}/sessions", tags=["sessions"])
# app.include_router(notes_router, prefix=f"{api_v1}/notes", tags=["notes"])
# app.include_router(highlights_router, prefix=f"{api_v1}/highlights", tags=["highlights"])
# app.include_router(analytics_router, prefix=f"{api_v1}/analytics", tags=["analytics"])
# app.include_router(goals_router, prefix=f"{api_v1}/goals", tags=["goals"])
# app.include_router(achievements_router, prefix=f"{api_v1}/achievements", tags=["achievements"])
# app.include_router(ai_router, prefix=f"{api_v1}/ai", tags=["ai"])

# Development endpoints for Stage 1
@app.get(f"{api_v1}/status")
async def get_development_status():
    """Development status endpoint showing implementation progress."""
    return {
        "project": "StudySprint 4.0",
        "current_stage": "Stage 1: Foundation & Complete Database Schema",
        "completed": [
            "✅ Modular project structure",
            "✅ Environment configuration", 
            "✅ Docker setup",
            "✅ Frontend foundation",
            "✅ Backend foundation"
        ],
        "next": [
            "🔄 Database schema implementation (Day 2)",
            "🔄 Environment & Docker setup (Day 3)",
            "📚 Stage 2: PDF Management & Viewer (Week 2)"
        ],
        "modules": {
            "topics": "pending",
            "pdfs": "pending", 
            "exercises": "pending",
            "sessions": "pending",
            "notes": "pending",
            "highlights": "pending",
            "analytics": "pending",
            "goals": "pending",
            "achievements": "pending",
            "ai_assistant": "pending"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
