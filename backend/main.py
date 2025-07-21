# backend/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Create FastAPI app
app = FastAPI(
    title="StudySprint 4.0 API",
    description="Advanced Study Management System",
    version="4.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure properly for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import and include routers
try:
    from modules.topics import router as topics_router
    app.include_router(topics_router, prefix="/api/v1/topics", tags=["topics"])
    print("✅ Topics routes loaded")
except ImportError as e:
    print(f"⚠️  Topics routes not available: {e}")

try:
    from modules.pdfs import router as pdfs_router
    app.include_router(pdfs_router, prefix="/api/v1/pdfs", tags=["pdfs"])
    print("✅ PDFs routes loaded")
except ImportError as e:
    print(f"⚠️  PDFs routes not available: {e}")

try:
    from modules.sessions import router as sessions_router
    app.include_router(sessions_router, prefix="/api/v1/sessions", tags=["sessions"])
    print("✅ Sessions routes loaded")
except ImportError as e:
    print(f"⚠️  Sessions routes not available: {e}")

try:
    from modules.notes import router as notes_router
    app.include_router(notes_router, prefix="/api/v1/notes", tags=["notes"])
    print("✅ Notes routes loaded")
except ImportError as e:
    print(f"⚠️  Notes routes not available: {e}")

try:
    from modules.exercises import router as exercise_router
    app.include_router(exercise_router, prefix="/api/v1/exercises", tags=["exercises"])
    print("✅ Exercise routes loaded")
except ImportError as e:
    print(f"⚠️  Exercise routes not available: {e}")

try:
    from modules.goals import router as goals_router
    app.include_router(goals_router, prefix="/api/v1/goals", tags=["goals"])
    print("✅ Goals routes loaded")
except ImportError as e:
    print(f"⚠️  Goals routes not available: {e}")

try:
    from modules.analytics import router as analytics_router
    app.include_router(analytics_router, prefix="/api/v1/analytics", tags=["analytics"])
    print("✅ Analytics routes loaded")
except ImportError as e:
    print(f"⚠️  Analytics routes not available: {e}")

@app.get("/")
def read_root():
    return {
        "message": "StudySprint 4.0 API",
        "version": "4.0.0",
        "status": "running",
        "modules": ["topics", "pdfs", "sessions", "notes", "exercises", "goals", "analytics"]
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.get("/api/v1/status")
def api_status():
    return {
        "api_version": "v1",
        "system": "StudySprint 4.0",
        "stage": "Stage 6 Complete - Goals & Analytics",
        "modules": {
            "topics": "✅ Complete",
            "pdfs": "✅ Complete", 
            "sessions": "✅ Complete",
            "notes": "✅ Complete",
            "exercises": "✅ Complete",
            "goals": "✅ Complete - Stage 6",
            "analytics": "✅ Complete - Stage 6"
        },
        "next_stage": "Stage 7 - AI Integration"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)