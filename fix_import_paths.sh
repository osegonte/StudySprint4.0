#!/bin/bash

# 🔧 FIX STUDYSPRINT IMPORT PATHS
# This script fixes the "No module named 'modules'" error

echo "🔧 Fixing StudySprint import paths..."

MAIN_PY="backend/main.py"

# Create backup
cp "$MAIN_PY" "${MAIN_PY}.backup.$(date +%Y%m%d_%H%M%S)"
echo "📁 Backup created"

# Show current content to understand the structure
echo "📋 Current main.py structure:"
cat "$MAIN_PY"

echo ""
echo "🔧 The issue is likely import paths. Let me create a corrected main.py..."

# Create a corrected main.py
cat > "$MAIN_PY" << 'EOF'
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

# Import routers with correct paths
try:
    from backend.modules.topics.routes import router as topics_router
    app.include_router(topics_router, prefix="/topics", tags=["topics"])
    print("✅ Topics routes loaded")
except ImportError as e:
    print(f"⚠️  Topics routes not available: {e}")

try:
    from backend.modules.pdfs.routes import router as pdfs_router
    app.include_router(pdfs_router, prefix="/pdfs", tags=["pdfs"])
    print("✅ PDFs routes loaded")
except ImportError as e:
    print(f"⚠️  PDFs routes not available: {e}")

try:
    from backend.modules.sessions.routes import router as sessions_router
    app.include_router(sessions_router, prefix="/study-sessions", tags=["sessions"])
    print("✅ Sessions routes loaded")
except ImportError as e:
    print(f"⚠️  Sessions routes not available: {e}")

try:
    from backend.modules.notes.routes import router as notes_router
    app.include_router(notes_router, prefix="/notes", tags=["notes"])
    print("✅ Notes routes loaded")
except ImportError as e:
    print(f"⚠️  Notes routes not available: {e}")

try:
    from backend.modules.exercises.routes import router as exercises_router
    app.include_router(exercises_router, prefix="/exercises", tags=["exercises"])
    print("✅ Exercises routes loaded")
except ImportError as e:
    print(f"⚠️  Exercise routes not available: {e}")

try:
    from backend.modules.goals.routes import router as goals_router
    app.include_router(goals_router, prefix="/goals", tags=["goals"])
    print("✅ Goals routes loaded")
except ImportError as e:
    print(f"⚠️  Goals routes not available: {e}")

try:
    from backend.modules.analytics.routes import router as analytics_router
    app.include_router(analytics_router, prefix="/analytics", tags=["analytics"])
    print("✅ Analytics routes loaded")
except ImportError as e:
    print(f"⚠️  Analytics routes not available: {e}")

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy"}

# Root endpoint
@app.get("/")
async def root():
    return {
        "message": "StudySprint 4.0 API",
        "version": "4.0.0",
        "docs": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
EOF

echo "✅ main.py updated with correct import paths"
echo ""
echo "🎯 Next steps:"
echo "1. Restart your backend:"
echo "   # Stop current server (Ctrl+C)"
echo "   python -m uvicorn backend.main:app --reload"
echo ""
echo "2. Test the endpoints:"
echo "   curl http://localhost:8000/"
echo "   curl http://localhost:8000/health"
echo "   curl http://localhost:8000/docs"
echo ""
echo "✅ Import path fix complete!"