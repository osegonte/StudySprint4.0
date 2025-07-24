#!/bin/bash
echo "🐘 Starting PostgreSQL for StudySprint 4.0..."

# Check if PostgreSQL is running
if pg_isready -h localhost -p 5432 > /dev/null 2>&1; then
    echo "✅ PostgreSQL is already running"
else
    echo "🚀 Starting PostgreSQL..."
    # Adjust this command based on your system
    if command -v brew &> /dev/null; then
        brew services start postgresql
    elif command -v systemctl &> /dev/null; then
        sudo systemctl start postgresql
    else
        echo "❌ Please start PostgreSQL manually"
        exit 1
    fi
fi

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
until pg_isready -h localhost -p 5432; do
    sleep 1
done

echo "✅ PostgreSQL is ready!"
