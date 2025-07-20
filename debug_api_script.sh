#!/bin/bash
# Debug StudySprint 4.0 API Issues

echo "🔍 StudySprint 4.0 - API Debug"
echo "=============================="
echo ""

# Check if backend is running
echo "1. 🔌 Checking if backend is running..."
if curl -s --connect-timeout 5 http://localhost:8000 > /dev/null; then
    echo "✅ Backend is responding"
else
    echo "❌ Backend is NOT responding"
    echo "   Make sure backend is running: uvicorn main:app --reload"
    exit 1
fi

echo ""
echo "2. 🏠 Testing root endpoint..."
echo "Raw response:"
curl -s http://localhost:8000 || echo "Failed to connect"

echo ""
echo ""
echo "3. 💓 Testing health endpoint..."
echo "Raw response:"
curl -s http://localhost:8000/health || echo "Failed to connect"

echo ""
echo ""
echo "4. 📊 Testing status endpoint..."
echo "Raw response:"
curl -s http://localhost:8000/api/v1/status || echo "Failed to connect"

echo ""
echo ""
echo "5. 🔍 Checking what's listening on port 8000..."
echo "Port check:"
lsof -i :8000 || echo "Nothing listening on port 8000"

echo ""
echo "6. 🌐 Testing with different URLs..."
echo "Testing 127.0.0.1:8000..."
curl -s http://127.0.0.1:8000 || echo "Failed"

echo ""
echo "Testing 0.0.0.0:8000..."
curl -s http://0.0.0.0:8000 || echo "Failed"

echo ""
echo ""
echo "7. 📝 Backend process check..."
ps aux | grep uvicorn | grep -v grep || echo "No uvicorn process found"

echo ""
echo "🔧 Troubleshooting Tips:"
echo "========================"
echo ""
echo "If backend is not responding:"
echo "1. Check if uvicorn is running in backend terminal"
echo "2. Look for any error messages in backend logs"
echo "3. Try restarting: Ctrl+C then uvicorn main:app --reload"
echo "4. Check if port 8000 is blocked by firewall"
echo ""
echo "If you see errors in backend terminal:"
echo "1. Check for import errors"
echo "2. Verify database connection"
echo "3. Check for syntax errors in main.py"