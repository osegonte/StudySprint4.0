# StudySprint 4.0 - Fixed Main Application with Proper CORS
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse
import sys
import os

# Add current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Create FastAPI app
app = FastAPI(
    title="StudySprint 4.0 API",
    description="Advanced Study Management System - Ready for Frontend",
    version="4.0.0"
)

# CORS middleware - MUST be first and properly configured
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# GZip middleware
app.add_middleware(GZipMiddleware, minimum_size=1000)

# Track loaded modules
routers_loaded = []

# Import and register routers with error handling
def safe_import_router(module_path, router_name, prefix, tag):
    try:
        module = __import__(module_path, fromlist=[router_name])
        router = getattr(module, router_name)
        app.include_router(router, prefix=prefix, tags=[tag])
        routers_loaded.append(tag)
        print(f"✅ {tag.title()} routes loaded")
        return True
    except Exception as e:
        print(f"⚠️  {tag.title()} routes not available: {e}")
        return False

# Load all routers
safe_import_router("modules.topics.routes", "router", "/topics", "topics")
safe_import_router("modules.pdfs.routes", "router", "/pdfs", "pdfs")
safe_import_router("modules.sessions.routes", "router", "/study-sessions", "sessions")
safe_import_router("modules.notes.routes", "router", "/notes", "notes")
safe_import_router("modules.exercises.routes", "router", "/exercises", "exercises")
safe_import_router("modules.goals.routes", "router", "/goals", "goals")
safe_import_router("modules.analytics.routes", "router", "/analytics", "analytics")

# Health check endpoint
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "version": "4.0.0",
        "modules_loaded": routers_loaded,
        "cors_enabled": True,
        "frontend_ready": True
    }

# Root endpoint
@app.get("/")
async def root():
    return {
        "message": "StudySprint 4.0 API - Ready for Frontend Connection",
        "version": "4.0.0",
        "docs": "/docs",
        "health": "/health",
        "modules": routers_loaded,
        "cors_enabled": True
    }

# Explicit CORS preflight handler for all paths
@app.options("/{path:path}")
async def options_handler(request: Request, path: str):
    return JSONResponse(
        content={},
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
            "Access-Control-Allow-Headers": "*",
            "Access-Control-Max-Age": "86400"
        }
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
