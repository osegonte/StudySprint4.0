#!/bin/bash
echo "📊 StudySprint 4.0 Database Status"
echo "================================="

if pg_isready -h localhost -p 5432 > /dev/null 2>&1; then
    echo "✅ PostgreSQL: Running"
    
    # Check database exists
    if psql -h localhost -p 5432 -U osegonte -d studysprint4_local -c '\q' 2>/dev/null; then
        echo "✅ Database: Connected"
        
        # Show table count
        table_count=$(psql -h localhost -p 5432 -U osegonte -d studysprint4_local -t -c "SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null | xargs)
        echo "📋 Tables: $table_count"
        
        # Show topics and PDFs count
        topics_count=$(psql -h localhost -p 5432 -U osegonte -d studysprint4_local -t -c "SELECT count(*) FROM topics;" 2>/dev/null | xargs)
        pdfs_count=$(psql -h localhost -p 5432 -U osegonte -d studysprint4_local -t -c "SELECT count(*) FROM pdfs;" 2>/dev/null | xargs)
        echo "📚 Topics: $topics_count"
        echo "📄 PDFs: $pdfs_count"
    else
        echo "❌ Database: Cannot connect"
    fi
else
    echo "❌ PostgreSQL: Not running"
fi
