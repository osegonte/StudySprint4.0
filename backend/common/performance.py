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
