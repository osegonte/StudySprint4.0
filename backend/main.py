# StudySprint 4.0 - Enhanced Main with Performance Optimizations
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware

# Performance imports
try:
    from common.performance import performance_middleware, get_performance_monitor
    PERFORMANCE_AVAILABLE = True
    print("✅ Performance monitoring enabled")
except ImportError:
    PERFORMANCE_AVAILABLE = False
    print("⚠️  Performance monitoring not available")

# Create FastAPI app
app = FastAPI(
    title="StudySprint 4.0 API",
    description="Advanced Study Management System - Performance Optimized",
    version="4.0.0"
)

# Add performance middleware
if PERFORMANCE_AVAILABLE:
    app.add_middleware(GZipMiddleware, minimum_size=1000)
    
    @app.middleware("http")
    async def add_performance_monitoring(request: Request, call_next):
        return await performance_middleware(request, call_next)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure properly for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import existing routers
routers_loaded = []

try:
    from modules.topics.routes import router as topics_router
    app.include_router(topics_router, prefix="/topics", tags=["topics"])
    routers_loaded.append("topics")
    print("✅ Topics routes loaded")
except ImportError as e:
    print(f"⚠️  Topics routes not available: {e}")

try:
    from modules.pdfs.routes import router as pdfs_router
    app.include_router(pdfs_router, prefix="/pdfs", tags=["pdfs"])
    routers_loaded.append("pdfs")
    print("✅ PDFs routes loaded")
except ImportError as e:
    print(f"⚠️  PDFs routes not available: {e}")

try:
    from modules.sessions.routes import router as sessions_router
    app.include_router(sessions_router, prefix="/study-sessions", tags=["sessions"])
    routers_loaded.append("sessions")
    print("✅ Sessions routes loaded")
except ImportError as e:
    print(f"⚠️  Sessions routes not available: {e}")

try:
    from modules.notes.routes import router as notes_router
    app.include_router(notes_router, prefix="/notes", tags=["notes"])
    routers_loaded.append("notes")
    print("✅ Notes routes loaded")
except ImportError as e:
    print(f"⚠️  Notes routes not available: {e}")

try:
    from modules.exercises.routes import router as exercises_router
    app.include_router(exercises_router, prefix="/exercises", tags=["exercises"])
    routers_loaded.append("exercises")
    print("✅ Exercise routes loaded")
except ImportError as e:
    print(f"⚠️  Exercise routes not available: {e}")

try:
    from modules.goals.routes import router as goals_router
    app.include_router(goals_router, prefix="/goals", tags=["goals"])
    routers_loaded.append("goals")
    print("✅ Goals routes loaded")
except ImportError as e:
    print(f"⚠️  Goals routes not available: {e}")

try:
    from modules.analytics.routes import router as analytics_router
    app.include_router(analytics_router, prefix="/analytics", tags=["analytics"])
    routers_loaded.append("analytics")
    print("✅ Analytics routes loaded")
except ImportError as e:
    print(f"⚠️  Analytics routes not available: {e}")

# Performance monitoring routes
if PERFORMANCE_AVAILABLE:
    try:
        from modules.monitoring.routes import router as monitoring_router
        app.include_router(monitoring_router, prefix="/monitoring", tags=["monitoring"])
        routers_loaded.append("monitoring")
        print("✅ Performance monitoring routes loaded")
    except ImportError as e:
        print(f"⚠️  Monitoring routes not available: {e}")

# Enhanced health check endpoint
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "version": "4.0.0",
        "performance_optimized": PERFORMANCE_AVAILABLE,
        "modules_loaded": routers_loaded,
        "features": {
            "redis_caching": PERFORMANCE_AVAILABLE,
            "performance_monitoring": PERFORMANCE_AVAILABLE,
            "gzip_compression": True
        }
    }

# Root endpoint
@app.get("/")
async def root():
    return {
        "message": "StudySprint 4.0 API - Performance Optimized",
        "version": "4.0.0",
        "docs": "/docs",
        "performance_enabled": PERFORMANCE_AVAILABLE,
        "monitoring": "/monitoring/health" if PERFORMANCE_AVAILABLE else None,
        "features": [
            "Real-time performance monitoring",
            "Redis caching",
            "Database optimization",
            "Request timing analytics"
        ] if PERFORMANCE_AVAILABLE else ["Basic functionality"]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
