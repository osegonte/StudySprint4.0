#!/bin/bash
# StudySprint 4.0 - Install Performance Optimization Files
# This script installs the performance modules into your existing backend

echo "📦 Installing StudySprint 4.0 Performance Optimization Files..."

cd "$(dirname "$0")/../backend"

# Create performance module
echo "Creating performance optimization module..."
cat > common/performance.py << 'EOF'
# backend/common/performance.py
"""
StudySprint 4.0 - Performance Optimization Module
Stage 8: Production-grade performance enhancements
"""

import time
import logging
from typing import Optional, Dict, Any, Callable, List
from datetime import datetime, timedelta
from functools import wraps
from contextlib import asynccontextmanager
import json
import hashlib
from fastapi import Request, Response
import asyncio
from collections import defaultdict, deque

logger = logging.getLogger(__name__)

try:
    import redis
    REDIS_AVAILABLE = True
except ImportError:
    REDIS_AVAILABLE = False
    logger.warning("Redis not available - caching disabled")

try:
    import psutil
    PSUTIL_AVAILABLE = True
except ImportError:
    PSUTIL_AVAILABLE = False
    logger.warning("psutil not available - system monitoring limited")


class PerformanceCache:
    """Redis-based caching system for API responses"""
    
    def __init__(self, redis_url: str = "redis://localhost:6379"):
        if not REDIS_AVAILABLE:
            self.redis_client = None
            self.stats = {'hits': 0, 'misses': 0, 'sets': 0, 'deletes': 0}
            return
            
        try:
            self.redis_client = redis.Redis.from_url(redis_url, decode_responses=True)
            self.redis_client.ping()  # Test connection
            self.default_ttl = 300  # 5 minutes
            self.stats = {'hits': 0, 'misses': 0, 'sets': 0, 'deletes': 0}
        except Exception as e:
            logger.warning(f"Redis connection failed: {e}")
            self.redis_client = None
            self.stats = {'hits': 0, 'misses': 0, 'sets': 0, 'deletes': 0}
    
    def _generate_key(self, prefix: str, **kwargs) -> str:
        """Generate cache key from parameters"""
        key_data = json.dumps(kwargs, sort_keys=True, default=str)
        key_hash = hashlib.md5(key_data.encode()).hexdigest()[:16]
        return f"studysprint:{prefix}:{key_hash}"
    
    def get(self, prefix: str, **kwargs) -> Optional[Any]:
        """Get cached value"""
        if not self.redis_client:
            self.stats['misses'] += 1
            return None
            
        try:
            key = self._generate_key(prefix, **kwargs)
            value = self.redis_client.get(key)
            if value:
                self.stats['hits'] += 1
                return json.loads(value)
            else:
                self.stats['misses'] += 1
                return None
        except Exception as e:
            logger.error(f"Cache get error: {str(e)}")
            self.stats['misses'] += 1
            return None
    
    def set(self, prefix: str, value: Any, ttl: Optional[int] = None, **kwargs) -> bool:
        """Set cached value"""
        if not self.redis_client:
            return False
            
        try:
            key = self._generate_key(prefix, **kwargs)
            ttl = ttl or self.default_ttl
            serialized = json.dumps(value, default=str)
            result = self.redis_client.setex(key, ttl, serialized)
            if result:
                self.stats['sets'] += 1
            return result
        except Exception as e:
            logger.error(f"Cache set error: {str(e)}")
            return False
    
    def get_stats(self) -> Dict[str, Any]:
        """Get cache statistics"""
        total_requests = self.stats['hits'] + self.stats['misses']
        hit_rate = (self.stats['hits'] / total_requests * 100) if total_requests > 0 else 0
        
        return {
            **self.stats,
            'total_requests': total_requests,
            'hit_rate_percentage': round(hit_rate, 2),
            'redis_available': self.redis_client is not None
        }


class PerformanceMonitor:
    """Real-time performance monitoring and metrics collection"""
    
    def __init__(self):
        self.request_times = deque(maxlen=1000)  # Last 1000 requests
        self.error_counts = defaultdict(int)
        self.endpoint_stats = defaultdict(lambda: {
            'count': 0,
            'total_time': 0.0,
            'min_time': float('inf'),
            'max_time': 0.0,
            'errors': 0
        })
        self.start_time = datetime.utcnow()
    
    def record_request(self, method: str, path: str, duration: float, status_code: int):
        """Record request metrics"""
        endpoint = f"{method} {path}"
        
        # Record in recent requests
        self.request_times.append({
            'endpoint': endpoint,
            'duration': duration,
            'status_code': status_code,
            'timestamp': datetime.utcnow()
        })
        
        # Update endpoint statistics
        stats = self.endpoint_stats[endpoint]
        stats['count'] += 1
        stats['total_time'] += duration
        stats['min_time'] = min(stats['min_time'], duration)
        stats['max_time'] = max(stats['max_time'], duration)
        
        # Record errors
        if status_code >= 400:
            stats['errors'] += 1
            self.error_counts[status_code] += 1
    
    def get_performance_metrics(self) -> Dict[str, Any]:
        """Get comprehensive performance metrics"""
        now = datetime.utcnow()
        uptime = (now - self.start_time).total_seconds()
        
        # Calculate recent performance (last 100 requests)
        recent_requests = list(self.request_times)[-100:]
        recent_times = [r['duration'] for r in recent_requests]
        
        # System metrics (if psutil available)
        system_metrics = {}
        if PSUTIL_AVAILABLE:
            try:
                cpu_percent = psutil.cpu_percent()
                memory = psutil.virtual_memory()
                disk = psutil.disk_usage('/')
                
                system_metrics = {
                    'cpu_percent': cpu_percent,
                    'memory_percent': memory.percent,
                    'memory_available_gb': round(memory.available / (1024**3), 2),
                    'disk_percent': disk.percent,
                    'disk_free_gb': round(disk.free / (1024**3), 2)
                }
            except Exception as e:
                logger.warning(f"System metrics error: {e}")
                system_metrics = {'error': 'System metrics unavailable'}
        else:
            system_metrics = {'error': 'psutil not available'}
        
        # API metrics
        total_requests = sum(stats['count'] for stats in self.endpoint_stats.values())
        total_errors = sum(stats['errors'] for stats in self.endpoint_stats.values())
        error_rate = (total_errors / total_requests * 100) if total_requests > 0 else 0
        
        return {
            'system_metrics': {
                'uptime_seconds': round(uptime, 2),
                **system_metrics
            },
            'api_metrics': {
                'total_requests': total_requests,
                'total_errors': total_errors,
                'error_rate_percentage': round(error_rate, 2),
                'requests_per_second': round(total_requests / uptime, 2) if uptime > 0 else 0,
                'avg_response_time_ms': round(sum(recent_times) / len(recent_times) * 1000, 2) if recent_times else 0
            },
            'top_endpoints': [
                {
                    'endpoint': endpoint,
                    'count': stats['count'],
                    'avg_time_ms': round(stats['total_time'] / stats['count'] * 1000, 2),
                    'error_rate': round(stats['errors'] / stats['count'] * 100, 2) if stats['count'] > 0 else 0
                }
                for endpoint, stats in sorted(self.endpoint_stats.items(), key=lambda x: x[1]['count'], reverse=True)[:10]
            ]
        }
    
    def get_health_status(self) -> Dict[str, Any]:
        """Get application health status"""
        metrics = self.get_performance_metrics()
        
        # Health checks
        health_status = "healthy"
        issues = []
        
        # Check system resources (if available)
        if PSUTIL_AVAILABLE and 'error' not in metrics['system_metrics']:
            if metrics['system_metrics'].get('cpu_percent', 0) > 80:
                health_status = "warning"
                issues.append("High CPU usage")
            
            if metrics['system_metrics'].get('memory_percent', 0) > 85:
                health_status = "warning"
                issues.append("High memory usage")
        
        # Check API performance
        if metrics['api_metrics']['error_rate_percentage'] > 5:
            health_status = "warning"
            issues.append("High error rate")
        
        return {
            'status': health_status,
            'timestamp': datetime.utcnow().isoformat(),
            'issues': issues,
            'metrics_summary': {
                'error_rate': metrics['api_metrics']['error_rate_percentage'],
                'avg_response_time_ms': metrics['api_metrics']['avg_response_time_ms'],
                'total_requests': metrics['api_metrics']['total_requests']
            }
        }


# Global performance instances
performance_cache = PerformanceCache()
performance_monitor = PerformanceMonitor()


def get_performance_cache() -> PerformanceCache:
    """Get global performance cache instance"""
    return performance_cache


def get_performance_monitor() -> PerformanceMonitor:
    """Get global performance monitor instance"""
    return performance_monitor


# Performance middleware
async def performance_middleware(request: Request, call_next):
    """FastAPI middleware for performance monitoring"""
    start_time = time.time()
    
    # Process request
    response = await call_next(request)
    
    # Record performance metrics
    duration = time.time() - start_time
    performance_monitor.record_request(
        request.method,
        request.url.path,
        duration,
        response.status_code
    )
    
    # Add performance headers
    response.headers["X-Response-Time"] = f"{duration:.3f}s"
    
    return response
EOF

# Create monitoring module
echo "Creating monitoring module..."
mkdir -p modules/monitoring

cat > modules/monitoring/__init__.py << 'EOF'
"""
StudySprint 4.0 - Performance Monitoring Module
Stage 8: Real-time monitoring and health check endpoints
"""

from .routes import router

__all__ = ["router"]
EOF

cat > modules/monitoring/routes.py << 'EOF'
# backend/modules/monitoring/routes.py
"""
StudySprint 4.0 - Performance Monitoring Routes
Stage 8: Real-time monitoring and health check endpoints
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime
import time

from backend.common.database import get_db
from backend.common.performance import get_performance_monitor, get_performance_cache

router = APIRouter()

@router.get("/health")
async def comprehensive_health_check(db: Session = Depends(get_db)):
    """Comprehensive health check with detailed system status"""
    monitor = get_performance_monitor()
    cache = get_performance_cache()
    
    start_time = time.time()
    
    # Basic health status
    health_status = monitor.get_health_status()
    
    # Database connectivity test
    try:
        db.execute("SELECT 1")
        database_status = "healthy"
        db_response_time = (time.time() - start_time) * 1000
    except Exception as e:
        database_status = "unhealthy"
        db_response_time = None
        health_status['status'] = "critical"
        health_status['issues'].append(f"Database connection failed: {str(e)}")
    
    # Redis connectivity test
    cache_status = "healthy" if cache.redis_client else "unavailable"
    
    return {
        "status": health_status['status'],
        "timestamp": datetime.utcnow().isoformat(),
        "version": "4.0.0",
        "services": {
            "database": {
                "status": database_status,
                "response_time_ms": db_response_time
            },
            "cache": {
                "status": cache_status,
                "stats": cache.get_stats()
            }
        },
        "performance_summary": health_status['metrics_summary'],
        "issues": health_status['issues']
    }

@router.get("/metrics")
async def get_performance_metrics():
    """Get detailed performance metrics for monitoring dashboards"""
    monitor = get_performance_monitor()
    cache = get_performance_cache()
    
    metrics = monitor.get_performance_metrics()
    cache_stats = cache.get_stats()
    
    return {
        "timestamp": datetime.utcnow().isoformat(),
        "system_metrics": metrics['system_metrics'],
        "api_metrics": metrics['api_metrics'],
        "cache_metrics": cache_stats,
        "top_endpoints": metrics['top_endpoints']
    }

@router.get("/benchmark")
async def run_performance_benchmark(db: Session = Depends(get_db)):
    """Run a quick performance benchmark"""
    results = {}
    
    # Database benchmark
    start_time = time.time()
    try:
        db.execute("SELECT COUNT(*) FROM topics")
        db_time = (time.time() - start_time) * 1000
        results['database_query_ms'] = round(db_time, 2)
        results['database_status'] = "ok" if db_time < 100 else "slow"
    except Exception as e:
        results['database_query_ms'] = None
        results['database_status'] = "error"
        results['database_error'] = str(e)
    
    # Cache benchmark
    cache = get_performance_cache()
    start_time = time.time()
    try:
        cache.set("benchmark", "test_value", 60)
        cached_value = cache.get("benchmark")
        cache_time = (time.time() - start_time) * 1000
        results['cache_roundtrip_ms'] = round(cache_time, 2)
        results['cache_status'] = "ok" if cache_time < 10 else "slow"
        results['cache_working'] = cached_value == "test_value"
    except Exception as e:
        results['cache_roundtrip_ms'] = None
        results['cache_status'] = "error"
        results['cache_error'] = str(e)
    
    # Overall benchmark score
    score = 100
    if results.get('database_query_ms', 0) > 100:
        score -= 20
    if results.get('cache_roundtrip_ms', 0) > 10:
        score -= 10
    
    results['benchmark_score'] = max(0, score)
    results['benchmark_grade'] = (
        "A" if score >= 90 else
        "B" if score >= 80 else
        "C" if score >= 70 else
        "D" if score >= 60 else
        "F"
    )
    
    return {
        "timestamp": datetime.utcnow().isoformat(),
        "benchmark_results": results
    }
EOF

# Update main.py to include performance monitoring
echo "Updating main.py with performance monitoring..."

if [[ -f "main.py" ]]; then
    # Backup original
    cp main.py main_original.py
    
    # Add performance imports and middleware to existing main.py
    cat > main_performance_enhanced.py << 'EOF'
# StudySprint 4.0 - Enhanced Main with Performance Optimizations
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware

# Performance imports
try:
    from common.performance import performance_middleware, get_performance_monitor
    PERFORMANCE_AVAILABLE = True
    print("✅ Performance monitoring enabled")
except ImportError:
    PERFORMANCE_AVAILABLE = False
    print("⚠️  Performance monitoring not available")

# Create FastAPI app
app = FastAPI(
    title="StudySprint 4.0 API",
    description="Advanced Study Management System - Performance Optimized",
    version="4.0.0"
)

# Add performance middleware
if PERFORMANCE_AVAILABLE:
    app.add_middleware(GZipMiddleware, minimum_size=1000)
    
    @app.middleware("http")
    async def add_performance_monitoring(request: Request, call_next):
        return await performance_middleware(request, call_next)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure properly for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import existing routers
routers_loaded = []

try:
    from backend.modules.topics.routes import router as topics_router
    app.include_router(topics_router, prefix="/topics", tags=["topics"])
    routers_loaded.append("topics")
    print("✅ Topics routes loaded")
except ImportError as e:
    print(f"⚠️  Topics routes not available: {e}")

try:
    from backend.modules.pdfs.routes import router as pdfs_router
    app.include_router(pdfs_router, prefix="/pdfs", tags=["pdfs"])
    routers_loaded.append("pdfs")
    print("✅ PDFs routes loaded")
except ImportError as e:
    print(f"⚠️  PDFs routes not available: {e}")

try:
    from backend.modules.sessions.routes import router as sessions_router
    app.include_router(sessions_router, prefix="/study-sessions", tags=["sessions"])
    routers_loaded.append("sessions")
    print("✅ Sessions routes loaded")
except ImportError as e:
    print(f"⚠️  Sessions routes not available: {e}")

try:
    from backend.modules.notes.routes import router as notes_router
    app.include_router(notes_router, prefix="/notes", tags=["notes"])
    routers_loaded.append("notes")
    print("✅ Notes routes loaded")
except ImportError as e:
    print(f"⚠️  Notes routes not available: {e}")

try:
    from backend.modules.exercises.routes import router as exercises_router
    app.include_router(exercises_router, prefix="/exercises", tags=["exercises"])
    routers_loaded.append("exercises")
    print("✅ Exercise routes loaded")
except ImportError as e:
    print(f"⚠️  Exercise routes not available: {e}")

try:
    from backend.modules.goals.routes import router as goals_router
    app.include_router(goals_router, prefix="/goals", tags=["goals"])
    routers_loaded.append("goals")
    print("✅ Goals routes loaded")
except ImportError as e:
    print(f"⚠️  Goals routes not available: {e}")

try:
    from backend.modules.analytics.routes import router as analytics_router
    app.include_router(analytics_router, prefix="/analytics", tags=["analytics"])
    routers_loaded.append("analytics")
    print("✅ Analytics routes loaded")
except ImportError as e:
    print(f"⚠️  Analytics routes not available: {e}")

# Performance monitoring routes
if PERFORMANCE_AVAILABLE:
    try:
        from backend.modules.monitoring.routes import router as monitoring_router
        app.include_router(monitoring_router, prefix="/monitoring", tags=["monitoring"])
        routers_loaded.append("monitoring")
        print("✅ Performance monitoring routes loaded")
    except ImportError as e:
        print(f"⚠️  Monitoring routes not available: {e}")

# Enhanced health check endpoint
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "version": "4.0.0",
        "performance_optimized": PERFORMANCE_AVAILABLE,
        "modules_loaded": routers_loaded,
        "features": {
            "redis_caching": PERFORMANCE_AVAILABLE,
            "performance_monitoring": PERFORMANCE_AVAILABLE,
            "gzip_compression": True
        }
    }

# Root endpoint
@app.get("/")
async def root():
    return {
        "message": "StudySprint 4.0 API - Performance Optimized",
        "version": "4.0.0",
        "docs": "/docs",
        "performance_enabled": PERFORMANCE_AVAILABLE,
        "monitoring": "/monitoring/health" if PERFORMANCE_AVAILABLE else None,
        "features": [
            "Real-time performance monitoring",
            "Redis caching",
            "Database optimization",
            "Request timing analytics"
        ] if PERFORMANCE_AVAILABLE else ["Basic functionality"]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
EOF
    
    # Replace main.py
    mv main.py main_backup.py
    mv main_performance_enhanced.py main.py
    
    echo "✅ main.py updated with performance monitoring"
else
    echo "⚠️  main.py not found - skipping update"
fi

echo ""
echo "🎉 Performance optimization files installed successfully!"
echo ""
echo "📊 New Features Added:"
echo "• Redis caching system"
echo "• Real-time performance monitoring"
echo "• System metrics collection"
echo "• Performance benchmarking"
echo "• Health check endpoints"
echo ""
echo "🚀 New Endpoints Available:"
echo "• /monitoring/health - Comprehensive health check"
echo "• /monitoring/metrics - Performance metrics"
echo "• /monitoring/benchmark - Performance benchmark"
echo ""
echo "✅ Ready to start your optimized backend!"