#!/bin/bash
# Fixed Frontend Start Script

echo "⚛️  Starting StudySprint 4.0 Frontend (Fixed)..."

# Get the correct path
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
FRONTEND_DIR="$PROJECT_ROOT/frontend"

echo "📁 Project root: $PROJECT_ROOT"
echo "📁 Frontend directory: $FRONTEND_DIR"

cd "$FRONTEND_DIR"

if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
else
    echo "✅ Dependencies found"
fi

echo "🌐 Starting development server at http://localhost:3000"
echo "🔗 Backend API: http://localhost:8000"
echo "🛑 Press Ctrl+C to stop"
echo ""

npm run dev
