# backend/main.py - Week 2 Enhanced Version with Sessions
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="StudySprint 4.0 API",
    description="Advanced Study Management System - Week 2 with Sessions",
    version="4.0.0-week2"
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
        "version": "4.0.0-week2",
        "stage": "Week 2 - Sessions & Estimation Active",
        "modules_active": ["topics", "pdfs", "sessions"],
        "modules_planned": ["notes", "goals", "analytics"]
    }

# Load Stage 1 modules (Week 1)
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

# Load Stage 2 modules (Week 2)
try:
    from modules.sessions.routes import router as sessions_router
    app.include_router(sessions_router, prefix="/sessions", tags=["sessions"])
    logger.info("✅ Sessions module loaded")
except ImportError as e:
    logger.error(f"❌ Failed to load sessions: {e}")

# Placeholder routes for future modules
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