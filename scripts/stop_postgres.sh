#!/bin/bash
echo "🛑 Stopping PostgreSQL..."

if command -v brew &> /dev/null; then
    brew services stop postgresql
elif command -v systemctl &> /dev/null; then
    sudo systemctl stop postgresql
else
    echo "❌ Please stop PostgreSQL manually"
fi

echo "✅ PostgreSQL stopped"
