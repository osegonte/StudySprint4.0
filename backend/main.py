# backend/main.py - Week 1 Simplified Version
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="StudySprint 4.0 API",
    description="Advanced Study Management System - Week 1 Foundation",
    version="4.0.0-week1"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Health check endpoint
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "version": "4.0.0-week1",
        "stage": "Week 1 - Foundation Optimization Complete",
        "modules_active": ["topics", "pdfs"],
        "modules_planned": ["sessions", "notes", "goals", "analytics"]
    }

# Load only Stage 1 modules for Week 1
try:
    from modules.topics.routes import router as topics_router
    app.include_router(topics_router, prefix="/topics", tags=["topics"])
    logger.info("✅ Topics module loaded")
except ImportError as e:
    logger.error(f"❌ Failed to load topics: {e}")

try:
    from modules.pdfs.routes import router as pdfs_router
    app.include_router(pdfs_router, prefix="/pdfs", tags=["pdfs"])
    logger.info("✅ PDFs module loaded")
except ImportError as e:
    logger.error(f"❌ Failed to load pdfs: {e}")

# Placeholder routes for future modules
@app.get("/sessions/health")
async def sessions_placeholder():
    return {"status": "planned", "stage": "Stage 2", "week": "Week 2"}

@app.get("/notes/health") 
async def notes_placeholder():
    return {"status": "planned", "stage": "Stage 4", "week": "Week 4"}

@app.get("/goals/health")
async def goals_placeholder():
    return {"status": "planned", "stage": "Stage 4", "week": "Week 4"}

@app.get("/analytics/health")
async def analytics_placeholder():
    return {"status": "planned", "stage": "Stage 6", "week": "Week 6"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)