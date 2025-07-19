#!/bin/bash
# Start StudySprint 4.0 Frontend (Local Development)

echo "⚛️  Starting StudySprint 4.0 Frontend..."

cd ../frontend

if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

echo "🌐 Starting development server at http://localhost:3000"
echo "🛑 Press Ctrl+C to stop"

npm run dev
