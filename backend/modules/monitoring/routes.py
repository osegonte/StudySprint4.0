# backend/modules/monitoring/routes.py
"""
StudySprint 4.0 - Performance Monitoring Routes
Stage 8: Real-time monitoring and health check endpoints
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime
import time

from common.database import get_db
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
