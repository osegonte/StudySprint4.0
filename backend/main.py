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
    app.include_router(topics_router)
    print("✅ Topics routes loaded")
except ImportError as e:
    print(f"⚠️  Topics routes not available: {e}")

try:
    from modules.pdfs import router as pdfs_router
    app.include_router(pdfs_router)
    print("✅ PDFs routes loaded")
except ImportError as e:
    print(f"⚠️  PDFs routes not available: {e}")

try:
    from modules.sessions import router as sessions_router
    app.include_router(sessions_router)
    print("✅ Sessions routes loaded")
except ImportError as e:
    print(f"⚠️  Sessions routes not available: {e}")

try:
    from modules.notes import router as notes_router
    app.include_router(notes_router)
    print("✅ Notes routes loaded")
except ImportError as e:
    print(f"⚠️  Notes routes not available: {e}")

try:
    from modules.exercises import router as exercise_router
    app.include_router(exercise_router)
    print("✅ Exercise routes loaded")
except ImportError as e:
    print(f"⚠️  Exercise routes not available: {e}")

@app.get("/")
def read_root():
    return {
        "message": "StudySprint 4.0 API",
        "version": "4.0.0",
        "status": "running",
        "modules": ["topics", "pdfs", "sessions", "notes", "exercises"]
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
