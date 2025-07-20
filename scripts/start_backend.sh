#!/bin/bash
# Fixed Backend Start Script

echo "🚀 Starting StudySprint 4.0 Backend (Fixed)..."

# Get the correct path
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
BACKEND_DIR="$PROJECT_ROOT/backend"

echo "📁 Project root: $PROJECT_ROOT"
echo "📁 Backend directory: $BACKEND_DIR"

cd "$BACKEND_DIR"

if [ ! -d "venv" ]; then
    echo "❌ Virtual environment not found in $BACKEND_DIR"
    echo "🔧 Creating virtual environment..."
    python3 -m venv venv
    source venv/bin/activate
    echo "📦 Installing requirements..."
    pip install -r requirements.txt
else
    echo "✅ Virtual environment found"
    source venv/bin/activate
fi

echo "✅ Virtual environment activated"
echo "🗄️  Database: studysprint4_local"

echo "🌐 Starting FastAPI server at http://localhost:8000"
echo "📖 API docs available at http://localhost:8000/docs"
echo "🛑 Press Ctrl+C to stop"
echo ""

uvicorn main:app --reload --host 0.0.0.0 --port 8000
