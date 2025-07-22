# scripts/performance_testing.py
"""
StudySprint 4.0 - Performance Testing and Benchmarking Suite
Stage 8: Comprehensive performance validation and load testing
"""

import asyncio
import aiohttp
import time
import statistics
import json
import psutil
import matplotlib.pyplot as plt
import pandas as pd
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from dataclasses import dataclass
from concurrent.futures import ThreadPoolExecutor
import requests
import random
import string


@dataclass
class TestResult:
    """Test result data structure"""
    endpoint: str
    method: str
    status_code: int
    response_time: float
    timestamp: datetime
    payload_size: int = 0
    error: Optional[str] = None


class PerformanceTester:
    """Comprehensive performance testing suite"""
    
    def __init__(self, base_url: str = "http://localhost:8000"):
        self.base_url = base_url
        self.results: List[TestResult] = []
        self.test_data = {}
        
    async def run_comprehensive_tests(self) -> Dict[str, Any]:
        """Run all performance tests"""
        print("🚀 Starting StudySprint 4.0 Performance Testing Suite")
        print("=" * 60)
        
        # Prepare test data
        await self._prepare_test_data()
        
        # Run individual test suites
        results = {}
        
        print("\n📊 Running API Response Time Tests...")
        results['response_time'] = await self._test_api_response_times()
        
        print("\n🔄 Running Concurrent User Tests...")
        results['concurrent_users'] = await self._test_concurrent_users()
        
        print("\n💾 Running Database Performance Tests...")
        results['database'] = await self._test_database_performance()
        
        print("\n🗄️ Running Cache Performance Tests...")
        results['cache'] = await self._test_cache_performance()
        
        print("\n📈 Running Load Tests...")
        results['load_test'] = await self._test_load_performance()
        
        print("\n🎯 Running Stress Tests...")
        results['stress_test'] = await self._test_stress_performance()
        
        # Generate comprehensive report
        report = self._generate_performance_report(results)
        
        print("\n✅ Performance Testing Complete!")
        print(f"📋 Report saved to: performance_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json")
        
        return report
    
    async def _prepare_test_data(self):
        """Prepare test data for performance tests"""
        print("📋 Preparing test data...")
        
        # Create test topics
        for i in range(5):
            topic_data = {
                "name": f"Performance Test Topic {i+1}",
                "description": f"Test topic for performance testing {i+1}",
                "difficulty_level": random.randint(1, 5),
                "priority_level": random.randint(1, 5)
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.post(f"{self.base_url}/topics/", json=topic_data) as response:
                    if response.status == 201:
                        topic = await response.json()
                        self.test_data[f'topic_{i+1}'] = topic['id']
        
        print(f"✅ Created {len(self.test_data)} test topics")
    
    async def _test_api_response_times(self) -> Dict[str, Any]:
        """Test API response times for all endpoints"""
        endpoints = [
            ("GET", "/health"),
            ("GET", "/topics/"),
            ("GET", "/pdfs/"),
            ("GET", "/study-sessions/"),
            ("GET", "/notes/"),
            ("GET", "/exercises/"),
            ("GET", "/goals/"),
            ("GET", "/analytics/overview")
        ]
        
        results = {}
        
        for method, endpoint in endpoints:
            print(f"  Testing {method} {endpoint}")
            times = []
            
            # Test each endpoint 20 times
            for _ in range(20):
                start_time = time.time()
                
                try:
                    async with aiohttp.ClientSession() as session:
                        async with session.request(method, f"{self.base_url}{endpoint}") as response:
                            await response.read()  # Ensure full response is received
                            response_time = time.time() - start_time
                            times.append(response_time * 1000)  # Convert to milliseconds
                            
                            self.results.append(TestResult(
                                endpoint=endpoint,
                                method=method,
                                status_code=response.status,
                                response_time=response_time,
                                timestamp=datetime.now()
                            ))
                except Exception as e:
                    times.append(5000)  # 5 second timeout as error
                    self.results.append(TestResult(
                        endpoint=endpoint,
                        method=method,
                        status_code=500,
                        response_time=5.0,
                        timestamp=datetime.now(),
                        error=str(e)
                    ))
            
            results[f"{method} {endpoint}"] = {
                'min_ms': min(times),
                'max_ms': max(times),
                'avg_ms': statistics.mean(times),
                'median_ms': statistics.median(times),
                'p95_ms': self._percentile(times, 95),
                'p99_ms': self._percentile(times, 99),
                'std_dev': statistics.stdev(times) if len(times) > 1 else 0
            }
        
        return results
    
    async def _test_concurrent_users(self) -> Dict[str, Any]:
        """Test performance with concurrent users"""
        user_counts = [1, 5, 10, 25, 50, 100]
        results = {}
        
        for user_count in user_counts:
            print(f"  Testing with {user_count} concurrent users...")
            
            # Create tasks for concurrent requests
            tasks = []
            for _ in range(user_count):
                task = self._simulate_user_session()
                tasks.append(task)
            
            start_time = time.time()
            completed_tasks = await asyncio.gather(*tasks, return_exceptions=True)
            total_time = time.time() - start_time
            
            # Analyze results
            successful_tasks = [t for t in completed_tasks if not isinstance(t, Exception)]
            error_count = len(completed_tasks) - len(successful_tasks)
            
            if successful_tasks:
                response_times = [t['avg_response_time'] for t in successful_tasks]
                results[f"{user_count}_users"] = {
                    'total_time_seconds': total_time,
                    'successful_sessions': len(successful_tasks),
                    'failed_sessions': error_count,
                    'success_rate_percent': len(successful_tasks) / user_count * 100,
                    'avg_response_time_ms': statistics.mean(response_times) * 1000,
                    'requests_per_second': user_count * 5 / total_time,  # Assuming 5 requests per session
                    'throughput_score': len(successful_tasks) / total_time
                }
            else:
                results[f"{user_count}_users"] = {
                    'total_time_seconds': total_time,
                    'successful_sessions': 0,
                    'failed_sessions': error_count,
                    'success_rate_percent': 0,
                    'error': 'All sessions failed'
                }
        
        return results
    
    async def _simulate_user_session(self) -> Dict[str, Any]:
        """Simulate a realistic user session"""
        session_requests = [
            ("GET", "/topics/"),
            ("GET", "/pdfs/"),
            ("GET", "/study-sessions/current"),
            ("GET", "/analytics/daily"),
            ("GET", "/health")
        ]
        
        response_times = []
        
        try:
            async with aiohttp.ClientSession() as session:
                for method, endpoint in session_requests:
                    start_time = time.time()
                    async with session.request(method, f"{self.base_url}{endpoint}") as response:
                        await response.read()
                        response_time = time.time() - start_time
                        response_times.append(response_time)
                    
                    # Small delay between requests to simulate user behavior
                    await asyncio.sleep(0.1)
            
            return {
                'success': True,
                'total_requests': len(session_requests),
                'avg_response_time': statistics.mean(response_times),
                'max_response_time': max(response_times)
            }
        
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'total_requests': 0,
                'avg_response_time': 0
            }
    
    async def _test_database_performance(self) -> Dict[str, Any]:
        """Test database-intensive operations"""
        print("  Testing database query performance...")
        
        database_tests = [
            ("GET", "/analytics/overview"),
            ("GET", "/topics/?include_archived=true"),
            ("GET", "/study-sessions/?page_size=100"),
            ("GET", "/pdfs/?page_size=100"),
            ("GET", "/goals/analytics/overview")
        ]
        
        results = {}
        
        for method, endpoint in database_tests:
            times = []
            
            # Test each database-heavy endpoint 10 times
            for _ in range(10):
                start_time = time.time()
                
                try:
                    async with aiohttp.ClientSession() as session:
                        async with session.request(method, f"{self.base_url}{endpoint}") as response:
                            await response.read()
                            response_time = time.time() - start_time
                            times.append(response_time * 1000)
                except Exception as e:
                    times.append(5000)
            
            results[endpoint] = {
                'avg_ms': statistics.mean(times),
                'min_ms': min(times),
                'max_ms': max(times),
                'p95_ms': self._percentile(times, 95)
            }
        
        return results
    
    async def _test_cache_performance(self) -> Dict[str, Any]:
        """Test caching system performance"""
        print("  Testing cache performance...")
        
        # Test cache hit/miss scenarios
        cache_test_endpoint = "/topics/"
        
        # First request (cache miss)
        start_time = time.time()
        async with aiohttp.ClientSession() as session:
            async with session.get(f"{self.base_url}{cache_test_endpoint}") as response:
                await response.read()
                first_request_time = time.time() - start_time
        
        # Immediate second request (should be cache hit)
        start_time = time.time()
        async with aiohttp.ClientSession() as session:
            async with session.get(f"{self.base_url}{cache_test_endpoint}") as response:
                await response.read()
                second_request_time = time.time() - start_time
        
        # Multiple rapid requests
        rapid_times = []
        for _ in range(10):
            start_time = time.time()
            async with aiohttp.ClientSession() as session:
                async with session.get(f"{self.base_url}{cache_test_endpoint}") as response:
                    await response.read()
                    rapid_times.append(time.time() - start_time)
        
        cache_efficiency = (first_request_time - statistics.mean(rapid_times)) / first_request_time * 100
        
        return {
            'first_request_ms': first_request_time * 1000,
            'second_request_ms': second_request_time * 1000,
            'avg_cached_request_ms': statistics.mean(rapid_times) * 1000,
            'cache_efficiency_percent': max(0, cache_efficiency),
            'speed_improvement_factor': first_request_time / statistics.mean(rapid_times) if rapid_times else 1
        }
    
    async def _test_load_performance(self) -> Dict[str, Any]:
        """Test sustained load performance"""
        print("  Running sustained load test...")
        
        duration_seconds = 60  # 1 minute load test
        target_rps = 10  # Requests per second
        
        start_time = time.time()
        end_time = start_time + duration_seconds
        
        response_times = []
        error_count = 0
        success_count = 0
        
        while time.time() < end_time:
            batch_start = time.time()
            
            # Send batch of requests
            tasks = []
            for _ in range(target_rps):
                task = self._make_test_request("GET", "/health")
                tasks.append(task)
            
            batch_results = await asyncio.gather(*tasks, return_exceptions=True)
            
            for result in batch_results:
                if isinstance(result, Exception):
                    error_count += 1
                else:
                    success_count += 1
                    response_times.append(result)
            
            # Wait for remainder of second
            elapsed = time.time() - batch_start
            if elapsed < 1.0:
                await asyncio.sleep(1.0 - elapsed)
        
        total_requests = success_count + error_count
        actual_duration = time.time() - start_time
        
        return {
            'duration_seconds': actual_duration,
            'total_requests': total_requests,
            'successful_requests': success_count,
            'failed_requests': error_count,
            'success_rate_percent': success_count / total_requests * 100 if total_requests > 0 else 0,
            'actual_rps': total_requests / actual_duration,
            'avg_response_time_ms': statistics.mean(response_times) * 1000 if response_times else 0,
            'p95_response_time_ms': self._percentile(response_times, 95) * 1000 if response_times else 0,
            'p99_response_time_ms': self._percentile(response_times, 99) * 1000 if response_times else 0,
            'error_rate_percent': error_count / total_requests * 100 if total_requests > 0 else 0
        }
    
    async def _test_stress_performance(self) -> Dict[str, Any]:
        """Test system under stress conditions"""
        print("  Running stress test...")
        
        # Gradually increase load
        stress_levels = [5, 10, 25, 50, 100, 200]
        results = {}
        
        for stress_level in stress_levels:
            print(f"    Testing stress level: {stress_level} concurrent requests")
            
            # Create high concurrent load
            tasks = []
            for _ in range(stress_level):
                task = self._make_test_request("GET", "/topics/")
                tasks.append(task)
            
            start_time = time.time()
            completed_tasks = await asyncio.gather(*tasks, return_exceptions=True)
            total_time = time.time() - start_time
            
            # Analyze stress test results
            successful_requests = [t for t in completed_tasks if not isinstance(t, Exception) and t is not None]
            failed_requests = len(completed_tasks) - len(successful_requests)
            
            # System resource usage during test
            cpu_percent = psutil.cpu_percent()
            memory_percent = psutil.virtual_memory().percent
            
            results[f"stress_level_{stress_level}"] = {
                'concurrent_requests': stress_level,
                'total_time_seconds': total_time,
                'successful_requests': len(successful_requests),
                'failed_requests': failed_requests,
                'success_rate_percent': len(successful_requests) / stress_level * 100,
                'avg_response_time_ms': statistics.mean(successful_requests) * 1000 if successful_requests else 0,
                'requests_per_second': stress_level / total_time,
                'cpu_usage_percent': cpu_percent,
                'memory_usage_percent': memory_percent,
                'system_stable': cpu_percent < 90 and memory_percent < 85
            }
            
            # Break if system becomes unstable
            if cpu_percent > 95 or memory_percent > 90:
                results[f"stress_level_{stress_level}"]['system_limit_reached'] = True
                break
            
            # Cool-down period between stress levels
            await asyncio.sleep(2)
        
        return results
    
    async def _make_test_request(self, method: str, endpoint: str) -> Optional[float]:
        """Make a single test request and return response time"""
        try:
            start_time = time.time()
            async with aiohttp.ClientSession() as session:
                async with session.request(method, f"{self.base_url}{endpoint}") as response:
                    await response.read()
                    return time.time() - start_time
        except Exception:
            return None
    
    def _percentile(self, data: List[float], percentile: int) -> float:
        """Calculate percentile of data"""
        if not data:
            return 0.0
        sorted_data = sorted(data)
        index = int(len(sorted_data) * percentile / 100)
        return sorted_data[min(index, len(sorted_data) - 1)]
    
    def _generate_performance_report(self, results: Dict[str, Any]) -> Dict[str, Any]:
        """Generate comprehensive performance report"""
        report = {
            'test_summary': {
                'timestamp': datetime.now().isoformat(),
                'base_url': self.base_url,
                'total_tests_run': len(self.results),
                'test_duration_minutes': 5,  # Approximate
                'system_info': {
                    'cpu_count': psutil.cpu_count(),
                    'memory_total_gb': round(psutil.virtual_memory().total / (1024**3), 2),
                    'disk_total_gb': round(psutil.disk_usage('/').total / (1024**3), 2)
                }
            },
            'performance_targets': {
                'api_response_target_ms': 100,
                'database_query_target_ms': 50,
                'concurrent_users_target': 100,
                'cache_hit_rate_target_percent': 80,
                'error_rate_threshold_percent': 1
            },
            'test_results': results,
            'performance_analysis': self._analyze_performance_results(results),
            'recommendations': self._generate_recommendations(results)
        }
        
        # Save report to file
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"performance_report_{timestamp}.json"
        
        with open(filename, 'w') as f:
            json.dump(report, f, indent=2, default=str)
        
        return report
    
    def _analyze_performance_results(self, results: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze performance results against targets"""
        analysis = {
            'api_performance': 'unknown',
            'database_performance': 'unknown',
            'concurrency_performance': 'unknown',
            'cache_performance': 'unknown',
            'load_performance': 'unknown',
            'stress_performance': 'unknown',
            'overall_grade': 'unknown',
            'critical_issues': [],
            'warnings': [],
            'strengths': []
        }
        
        # Analyze API response times
        if 'response_time' in results:
            api_times = [r['avg_ms'] for r in results['response_time'].values()]
            avg_api_time = statistics.mean(api_times)
            
            if avg_api_time < 100:
                analysis['api_performance'] = 'excellent'
                analysis['strengths'].append('API response times under 100ms')
            elif avg_api_time < 200:
                analysis['api_performance'] = 'good'
            elif avg_api_time < 500:
                analysis['api_performance'] = 'acceptable'
                analysis['warnings'].append('API response times above 200ms')
            else:
                analysis['api_performance'] = 'poor'
                analysis['critical_issues'].append('API response times above 500ms')
        
        # Analyze database performance
        if 'database' in results:
            db_times = [r['avg_ms'] for r in results['database'].values()]
            avg_db_time = statistics.mean(db_times)
            
            if avg_db_time < 50:
                analysis['database_performance'] = 'excellent'
                analysis['strengths'].append('Database queries under 50ms')
            elif avg_db_time < 100:
                analysis['database_performance'] = 'good'
            elif avg_db_time < 250:
                analysis['database_performance'] = 'acceptable'
                analysis['warnings'].append('Database queries above 100ms')
            else:
                analysis['database_performance'] = 'poor'
                analysis['critical_issues'].append('Database queries above 250ms')
        
        # Analyze concurrent user performance
        if 'concurrent_users' in results:
            user_100_result = results['concurrent_users'].get('100_users')
            if user_100_result:
                if user_100_result['success_rate_percent'] > 95:
                    analysis['concurrency_performance'] = 'excellent'
                    analysis['strengths'].append('Handles 100+ concurrent users')
                elif user_100_result['success_rate_percent'] > 90:
                    analysis['concurrency_performance'] = 'good'
                elif user_100_result['success_rate_percent'] > 80:
                    analysis['concurrency_performance'] = 'acceptable'
                    analysis['warnings'].append('Some failures under high concurrency')
                else:
                    analysis['concurrency_performance'] = 'poor'
                    analysis['critical_issues'].append('High failure rate under concurrency')
        
        # Analyze cache performance
        if 'cache' in results:
            cache_efficiency = results['cache'].get('cache_efficiency_percent', 0)
            if cache_efficiency > 80:
                analysis['cache_performance'] = 'excellent'
                analysis['strengths'].append('Cache efficiency above 80%')
            elif cache_efficiency > 60:
                analysis['cache_performance'] = 'good'
            elif cache_efficiency > 40:
                analysis['cache_performance'] = 'acceptable'
                analysis['warnings'].append('Cache efficiency below 60%')
            else:
                analysis['cache_performance'] = 'poor'
                analysis['critical_issues'].append('Cache efficiency below 40%')
        
        # Analyze load test performance
        if 'load_test' in results:
            load_success_rate = results['load_test'].get('success_rate_percent', 0)
            if load_success_rate > 99:
                analysis['load_performance'] = 'excellent'
                analysis['strengths'].append('Sustained load performance excellent')
            elif load_success_rate > 95:
                analysis['load_performance'] = 'good'
            elif load_success_rate > 90:
                analysis['load_performance'] = 'acceptable'
                analysis['warnings'].append('Some errors under sustained load')
            else:
                analysis['load_performance'] = 'poor'
                analysis['critical_issues'].append('High error rate under load')
        
        # Calculate overall grade
        performance_scores = []
        for perf_key in ['api_performance', 'database_performance', 'concurrency_performance', 
                        'cache_performance', 'load_performance']:
            if analysis[perf_key] == 'excellent':
                performance_scores.append(4)
            elif analysis[perf_key] == 'good':
                performance_scores.append(3)
            elif analysis[perf_key] == 'acceptable':
                performance_scores.append(2)
            elif analysis[perf_key] == 'poor':
                performance_scores.append(1)
        
        if performance_scores:
            avg_score = statistics.mean(performance_scores)
            if avg_score >= 3.5:
                analysis['overall_grade'] = 'A'
            elif avg_score >= 3.0:
                analysis['overall_grade'] = 'B'
            elif avg_score >= 2.5:
                analysis['overall_grade'] = 'C'
            elif avg_score >= 2.0:
                analysis['overall_grade'] = 'D'
            else:
                analysis['overall_grade'] = 'F'
        
        return analysis
    
    def _generate_recommendations(self, results: Dict[str, Any]) -> List[str]:
        """Generate performance improvement recommendations"""
        recommendations = []
        
        # API performance recommendations
        if 'response_time' in results:
            slow_endpoints = []
            for endpoint, metrics in results['response_time'].items():
                if metrics['avg_ms'] > 200:
                    slow_endpoints.append(endpoint)
            
            if slow_endpoints:
                recommendations.append(f"Optimize slow endpoints: {', '.join(slow_endpoints[:3])}")
        
        # Database recommendations
        if 'database' in results:
            slow_db_queries = []
            for endpoint, metrics in results['database'].items():
                if metrics['avg_ms'] > 100:
                    slow_db_queries.append(endpoint)
            
            if slow_db_queries:
                recommendations.append("Review database indexes and query optimization for analytics endpoints")
        
        # Concurrency recommendations
        if 'concurrent_users' in results:
            if any(r.get('success_rate_percent', 0) < 90 for r in results['concurrent_users'].values()):
                recommendations.append("Implement connection pooling and async processing for better concurrency")
        
        # Cache recommendations
        if 'cache' in results:
            if results['cache'].get('cache_efficiency_percent', 0) < 60:
                recommendations.append("Improve caching strategy and increase cache TTL for frequently accessed data")
        
        # Load test recommendations
        if 'load_test' in results:
            if results['load_test'].get('error_rate_percent', 0) > 5:
                recommendations.append("Implement rate limiting and circuit breakers for stability under load")
        
        # Stress test recommendations
        if 'stress_test' in results:
            stress_results = list(results['stress_test'].values())
            if any(not r.get('system_stable', True) for r in stress_results):
                recommendations.append("Consider horizontal scaling for handling peak traffic loads")
        
        # General recommendations
        recommendations.extend([
            "Enable gzip compression for API responses",
            "Implement CDN for static assets",
            "Set up application performance monitoring (APM)",
            "Configure proper logging and alerting for production",
            "Regular database maintenance and VACUUM operations"
        ])
        
        return recommendations[:10]  # Return top 10 recommendations
    
    def generate_performance_charts(self, results: Dict[str, Any]) -> None:
        """Generate performance visualization charts"""
        try:
            import matplotlib.pyplot as plt
            import seaborn as sns
            
            # Set style
            plt.style.use('seaborn-v0_8')
            fig, axes = plt.subplots(2, 2, figsize=(16, 12))
            fig.suptitle('StudySprint 4.0 Performance Test Results', fontsize=16)
            
            # Chart 1: API Response Times
            if 'response_time' in results:
                endpoints = list(results['response_time'].keys())
                avg_times = [results['response_time'][ep]['avg_ms'] for ep in endpoints]
                
                axes[0, 0].barh(range(len(endpoints)), avg_times)
                axes[0, 0].set_yticks(range(len(endpoints)))
                axes[0, 0].set_yticklabels([ep.split()[-1] for ep in endpoints])
                axes[0, 0].set_xlabel('Response Time (ms)')
                axes[0, 0].set_title('API Endpoint Response Times')
                axes[0, 0].axvline(x=100, color='red', linestyle='--', label='Target: 100ms')
                axes[0, 0].legend()
            
            # Chart 2: Concurrent Users Performance
            if 'concurrent_users' in results:
                user_counts = []
                success_rates = []
                response_times = []
                
                for key, data in results['concurrent_users'].items():
                    if 'users' in key:
                        user_count = int(key.split('_')[0])
                        user_counts.append(user_count)
                        success_rates.append(data.get('success_rate_percent', 0))
                        response_times.append(data.get('avg_response_time_ms', 0))
                
                ax2 = axes[0, 1]
                ax2_twin = ax2.twinx()
                
                line1 = ax2.plot(user_counts, success_rates, 'b-o', label='Success Rate %')
                line2 = ax2_twin.plot(user_counts, response_times, 'r-s', label='Response Time (ms)')
                
                ax2.set_xlabel('Concurrent Users')
                ax2.set_ylabel('Success Rate (%)', color='b')
                ax2_twin.set_ylabel('Response Time (ms)', color='r')
                ax2.set_title('Concurrent User Performance')
                ax2.grid(True)
                
                # Combine legends
                lines = line1 + line2
                labels = [l.get_label() for l in lines]
                ax2.legend(lines, labels, loc='center right')
            
            # Chart 3: Database Performance
            if 'database' in results:
                db_endpoints = list(results['database'].keys())
                db_times = [results['database'][ep]['avg_ms'] for ep in db_endpoints]
                
                axes[1, 0].bar(range(len(db_endpoints)), db_times)
                axes[1, 0].set_xticks(range(len(db_endpoints)))
                axes[1, 0].set_xticklabels([ep.split('/')[-1] for ep in db_endpoints], rotation=45)
                axes[1, 0].set_ylabel('Response Time (ms)')
                axes[1, 0].set_title('Database Query Performance')
                axes[1, 0].axhline(y=50, color='red', linestyle='--', label='Target: 50ms')
                axes[1, 0].legend()
            
            # Chart 4: Load Test Timeline
            if 'load_test' in results:
                # Simulate load test timeline
                times = list(range(0, 60, 5))  # 60 seconds, 5-second intervals
                rps_values = [results['load_test'].get('actual_rps', 10)] * len(times)
                
                axes[1, 1].plot(times, rps_values, 'g-', linewidth=2, label='Actual RPS')
                axes[1, 1].axhline(y=10, color='blue', linestyle='--', label='Target: 10 RPS')
                axes[1, 1].set_xlabel('Time (seconds)')
                axes[1, 1].set_ylabel('Requests per Second')
                axes[1, 1].set_title('Load Test Performance')
                axes[1, 1].grid(True)
                axes[1, 1].legend()
            
            plt.tight_layout()
            
            # Save chart
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            chart_filename = f"performance_charts_{timestamp}.png"
            plt.savefig(chart_filename, dpi=300, bbox_inches='tight')
            plt.close()
            
            print(f"📊 Performance charts saved to: {chart_filename}")
            
        except ImportError:
            print("⚠️  Matplotlib not available. Install with: pip install matplotlib seaborn")
        except Exception as e:
            print(f"⚠️  Error generating charts: {str(e)}")


async def main():
    """Main performance testing function"""
    tester = PerformanceTester()
    
    try:
        results = await tester.run_comprehensive_tests()
        
        # Print summary
        print("\n" + "="*60)
        print("📊 PERFORMANCE TEST SUMMARY")
        print("="*60)
        
        analysis = results['performance_analysis']
        print(f"Overall Grade: {analysis['overall_grade']}")
        print(f"API Performance: {analysis['api_performance']}")
        print(f"Database Performance: {analysis['database_performance']}")
        print(f"Concurrency Performance: {analysis['concurrency_performance']}")
        print(f"Cache Performance: {analysis['cache_performance']}")
        
        if analysis['critical_issues']:
            print(f"\n🚨 Critical Issues:")
            for issue in analysis['critical_issues']:
                print(f"  - {issue}")
        
        if analysis['warnings']:
            print(f"\n⚠️  Warnings:")
            for warning in analysis['warnings']:
                print(f"  - {warning}")
        
        if analysis['strengths']:
            print(f"\n✅ Strengths:")
            for strength in analysis['strengths']:
                print(f"  - {strength}")
        
        print(f"\n💡 Top Recommendations:")
        for i, rec in enumerate(results['recommendations'][:5], 1):
            print(f"  {i}. {rec}")
        
        # Generate charts
        tester.generate_performance_charts(results)
        
        print("\n🎯 Performance testing completed successfully!")
        
    except Exception as e:
        print(f"❌ Performance testing failed: {str(e)}")
        raise


if __name__ == "__main__":
    asyncio.run(main())