# backend/main.py - Corrected version for your existing structure

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="StudySprint 4.0 API",
    description="Advanced Study Management System",
    version="4.0.0"
)

# CORS Configuration - This must be FIRST
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",  # Vite default port
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Add trusted host middleware
app.add_middleware(
    TrustedHostMiddleware, 
    allowed_hosts=["localhost", "127.0.0.1", "0.0.0.0", "*"]
)

@app.middleware("http")
async def cors_handler(request: Request, call_next):
    """Enhanced CORS handler"""
    origin = request.headers.get("origin")
    
    if origin:
        logger.info(f"Request from origin: {origin}")
    
    response = await call_next(request)
    
    # Add extra CORS headers for problematic requests
    if origin in ["http://localhost:3000", "http://127.0.0.1:3000"]:
        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Access-Control-Allow-Credentials"] = "true"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "*"
    
    return response

# Global OPTIONS handler
@app.options("/{path:path}")
async def options_handler(path: str):
    """Handle all OPTIONS requests"""
    return JSONResponse(
        content={"message": "OK"},
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "*",
        }
    )

# Health check endpoint
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "version": "4.0.0",
        "modules_loaded": [
            "topics", "pdfs", "sessions", "notes", 
            "exercises", "goals", "analytics"
        ]
    }

# Import routers with your actual names - adjust these based on your files
try:
    from modules.topics.routes import router as topics_router
    app.include_router(topics_router, prefix="/topics", tags=["topics"])
    print("✅ Topics routes loaded")
except ImportError as e:
    print(f"❌ Failed to load topics routes: {e}")
    # Try alternative import names
    try:
        from modules.topics.routes import topics_router
        app.include_router(topics_router, prefix="/topics", tags=["topics"])
        print("✅ Topics routes loaded (alternative import)")
    except ImportError:
        print("❌ Could not import topics router with any method")

try:
    from modules.pdfs.routes import router as pdfs_router
    app.include_router(pdfs_router, prefix="/pdfs", tags=["pdfs"])
    print("✅ PDFs routes loaded")
except ImportError as e:
    print(f"❌ Failed to load pdfs routes: {e}")
    # Try alternative import names
    try:
        from modules.pdfs.routes import pdfs_router
        app.include_router(pdfs_router, prefix="/pdfs", tags=["pdfs"])
        print("✅ PDFs routes loaded (alternative import)")
    except ImportError:
        print("❌ Could not import pdfs router with any method")

try:
    from modules.sessions.routes import router as sessions_router
    app.include_router(sessions_router, prefix="/study-sessions", tags=["sessions"])
    print("✅ Sessions routes loaded")
except ImportError as e:
    print(f"❌ Failed to load sessions routes: {e}")
    # Try alternative import names
    try:
        from modules.sessions.routes import sessions_router
        app.include_router(sessions_router, prefix="/study-sessions", tags=["sessions"])
        print("✅ Sessions routes loaded (alternative import)")
    except ImportError:
        print("❌ Could not import sessions router with any method")

try:
    from modules.notes.routes import router as notes_router
    app.include_router(notes_router, prefix="/notes", tags=["notes"])
    print("✅ Notes routes loaded")
except ImportError as e:
    print(f"❌ Failed to load notes routes: {e}")
    # Try alternative import names
    try:
        from modules.notes.routes import notes_router
        app.include_router(notes_router, prefix="/notes", tags=["notes"])
        print("✅ Notes routes loaded (alternative import)")
    except ImportError:
        print("❌ Could not import notes router with any method")

try:
    from modules.exercises.routes import router as exercises_router
    app.include_router(exercises_router, prefix="/exercises", tags=["exercises"])
    print("✅ Exercises routes loaded")
except ImportError as e:
    print(f"❌ Failed to load exercises routes: {e}")
    # Try alternative import names
    try:
        from modules.exercises.routes import exercises_router
        app.include_router(exercises_router, prefix="/exercises", tags=["exercises"])
        print("✅ Exercises routes loaded (alternative import)")
    except ImportError:
        print("❌ Could not import exercises router with any method")

try:
    from modules.goals.routes import router as goals_router
    app.include_router(goals_router, prefix="/goals", tags=["goals"])
    print("✅ Goals routes loaded")
except ImportError as e:
    print(f"❌ Failed to load goals routes: {e}")
    # Try alternative import names
    try:
        from modules.goals.routes import goals_router
        app.include_router(goals_router, prefix="/goals", tags=["goals"])
        print("✅ Goals routes loaded (alternative import)")
    except ImportError:
        print("❌ Could not import goals router with any method")

try:
    from modules.analytics.routes import router as analytics_router
    app.include_router(analytics_router, prefix="/analytics", tags=["analytics"])
    print("✅ Analytics routes loaded")
except ImportError as e:
    print(f"❌ Failed to load analytics routes: {e}")
    # Try alternative import names
    try:
        from modules.analytics.routes import analytics_router
        app.include_router(analytics_router, prefix="/analytics", tags=["analytics"])
        print("✅ Analytics routes loaded (alternative import)")
    except ImportError:
        print("❌ Could not import analytics router with any method")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )