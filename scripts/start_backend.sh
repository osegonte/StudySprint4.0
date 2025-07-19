#!/bin/bash
# Start StudySprint 4.0 Backend (Local Development)

echo "🚀 Starting StudySprint 4.0 Backend..."

cd ../backend

if [ ! -d "venv" ]; then
    echo "❌ Virtual environment not found. Run setup first."
    exit 1
fi

source venv/bin/activate
echo "✅ Virtual environment activated"

echo "🌐 Starting FastAPI server at http://localhost:8000"
echo "📖 API docs available at http://localhost:8000/docs"
echo "🛑 Press Ctrl+C to stop"

uvicorn main:app --reload --host 0.0.0.0 --port 8000
