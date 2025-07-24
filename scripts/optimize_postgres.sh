#!/bin/bash
echo "🗄️ Optimizing PostgreSQL for StudySprint 4.0..."

# Apply the cleanup migration
echo "📋 Applying database cleanup migration..."
cd backend
alembic upgrade head

# Optimize PostgreSQL settings for single-user desktop app
echo "⚙️ Optimizing PostgreSQL configuration..."
cat > postgresql_optimization.conf << 'CONF'
# StudySprint 4.0 - Single User Desktop Optimization
shared_buffers = 256MB
effective_cache_size = 1GB
maintenance_work_mem = 64MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1
effective_io_concurrency = 200
work_mem = 4MB
min_wal_size = 1GB
max_wal_size = 4GB
CONF

echo "✅ Database optimization completed!"
echo "💡 Apply postgresql_optimization.conf to your PostgreSQL config"
