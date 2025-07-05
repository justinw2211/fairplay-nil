"""
Health Check System for FairPlay NIL
Monitors all critical services and dependencies for production readiness
"""

import asyncio
import time
import psutil
import os
import logging
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
from enum import Enum
from dataclasses import dataclass
from app.cache import get_cache_manager
from app.database import db

logger = logging.getLogger(__name__)

class HealthStatus(Enum):
    """Health check status levels"""
    HEALTHY = "healthy"
    DEGRADED = "degraded"
    UNHEALTHY = "unhealthy"
    CRITICAL = "critical"

@dataclass
class HealthResult:
    """Health check result data structure"""
    service: str
    status: HealthStatus
    response_time_ms: float
    message: str
    details: Optional[Dict[str, Any]] = None
    timestamp: str = None
    
    def __post_init__(self):
        if self.timestamp is None:
            self.timestamp = datetime.utcnow().isoformat()

class HealthChecker:
    """Individual health check implementations"""
    
    def __init__(self):
        self.timeout = 5.0  # 5 second timeout for health checks
        
    async def check_database_connection(self) -> HealthResult:
        """Check database connectivity and performance"""
        start_time = time.time()
        
        try:
            # Test basic connectivity
            health_result = await db.health_check()
            duration = time.time() - start_time
            
            if health_result["status"] == "healthy":
                # Additional checks for database health
                response_time = health_result["response_time_ms"]
                
                if response_time > 1000:  # >1 second is concerning
                    status = HealthStatus.DEGRADED
                    message = f"Database responding slowly: {response_time:.2f}ms"
                elif response_time > 500:  # >500ms is warning
                    status = HealthStatus.DEGRADED
                    message = f"Database response time elevated: {response_time:.2f}ms"
                else:
                    status = HealthStatus.HEALTHY
                    message = "Database connection healthy"
                
                return HealthResult(
                    service="database",
                    status=status,
                    response_time_ms=response_time,
                    message=message,
                    details={
                        "connection_pool_status": "active",
                        "query_response_time": response_time
                    }
                )
            else:
                return HealthResult(
                    service="database",
                    status=HealthStatus.UNHEALTHY,
                    response_time_ms=duration * 1000,
                    message=f"Database connection failed: {health_result.get('error', 'Unknown error')}",
                    details=health_result
                )
                
        except Exception as e:
            duration = time.time() - start_time
            return HealthResult(
                service="database",
                status=HealthStatus.CRITICAL,
                response_time_ms=duration * 1000,
                message=f"Database health check failed: {str(e)}"
            )
    
    async def check_redis_connection(self) -> HealthResult:
        """Check Redis cache connectivity and performance"""
        start_time = time.time()
        
        try:
            cache_manager = await get_cache_manager()
            
            if cache_manager.fallback_mode:
                duration = time.time() - start_time
                return HealthResult(
                    service="redis",
                    status=HealthStatus.DEGRADED,
                    response_time_ms=duration * 1000,
                    message="Redis unavailable - using fallback mode",
                    details={"fallback_mode": True}
                )
            
            # Test Redis connectivity with a simple operation
            test_key = "health_check"
            test_value = {"timestamp": datetime.utcnow().isoformat()}
            
            # Test write operation
            await cache_manager.set("health", test_value, test_key, ttl=60)
            
            # Test read operation  
            cached_value = await cache_manager.get("health", test_key)
            
            duration = time.time() - start_time
            response_time = duration * 1000
            
            if cached_value and response_time < 100:  # <100ms is good
                status = HealthStatus.HEALTHY
                message = "Redis connection healthy"
            elif cached_value and response_time < 500:  # <500ms is acceptable
                status = HealthStatus.DEGRADED
                message = f"Redis responding slowly: {response_time:.2f}ms"
            else:
                status = HealthStatus.UNHEALTHY
                message = "Redis read/write operations failed"
            
            # Get cache statistics
            cache_stats = await cache_manager.get_cache_stats()
            
            return HealthResult(
                service="redis",
                status=status,
                response_time_ms=response_time,
                message=message,
                details={
                    "cache_stats": cache_stats,
                    "operations_tested": ["set", "get"]
                }
            )
            
        except Exception as e:
            duration = time.time() - start_time
            return HealthResult(
                service="redis",
                status=HealthStatus.CRITICAL,
                response_time_ms=duration * 1000,
                message=f"Redis health check failed: {str(e)}"
            )
    
    async def check_system_resources(self) -> HealthResult:
        """Check system resource utilization"""
        start_time = time.time()
        
        try:
            # Get system metrics
            cpu_percent = psutil.cpu_percent(interval=0.1)
            memory = psutil.virtual_memory()
            disk = psutil.disk_usage('/')
            
            # Check network connections
            connections = len(psutil.net_connections())
            
            # Determine health status based on resource usage
            warnings = []
            
            if cpu_percent > 85:
                warnings.append(f"High CPU usage: {cpu_percent:.1f}%")
            if memory.percent > 85:
                warnings.append(f"High memory usage: {memory.percent:.1f}%")
            if disk.percent > 85:
                warnings.append(f"High disk usage: {disk.percent:.1f}%")
            if connections > 1000:
                warnings.append(f"High connection count: {connections}")
            
            if warnings:
                if cpu_percent > 95 or memory.percent > 95:
                    status = HealthStatus.CRITICAL
                    message = f"Critical resource usage: {'; '.join(warnings)}"
                else:
                    status = HealthStatus.DEGRADED
                    message = f"Resource usage elevated: {'; '.join(warnings)}"
            else:
                status = HealthStatus.HEALTHY
                message = "System resources healthy"
            
            duration = time.time() - start_time
            
            return HealthResult(
                service="system",
                status=status,
                response_time_ms=duration * 1000,
                message=message,
                details={
                    "cpu_percent": cpu_percent,
                    "memory_percent": memory.percent,
                    "memory_available_mb": memory.available // 1024 // 1024,
                    "disk_percent": disk.percent,
                    "disk_free_gb": disk.free // 1024 // 1024 // 1024,
                    "network_connections": connections,
                    "load_average": os.getloadavg() if hasattr(os, 'getloadavg') else None
                }
            )
            
        except Exception as e:
            duration = time.time() - start_time
            return HealthResult(
                service="system",
                status=HealthStatus.CRITICAL,
                response_time_ms=duration * 1000,
                message=f"System resource check failed: {str(e)}"
            )
    
    async def check_application_health(self) -> HealthResult:
        """Check application-specific health metrics"""
        start_time = time.time()
        
        try:
            # Get application performance stats
            perf_stats = await db.get_performance_stats()
            
            warnings = []
            critical_issues = []
            
            # Check query performance
            query_stats = perf_stats.get("query_performance", {})
            for query_type, stats in query_stats.items():
                if stats.get("errors", 0) > 0:
                    if stats["errors"] > 10:  # More than 10 errors is critical
                        critical_issues.append(f"High error rate in {query_type}: {stats['errors']} errors")
                    else:
                        warnings.append(f"Errors detected in {query_type}: {stats['errors']} errors")
                
                avg_duration = stats.get("avg_duration", 0)
                if avg_duration > 2.0:  # >2 seconds average is concerning
                    warnings.append(f"Slow queries in {query_type}: {avg_duration:.2f}s average")
            
            # Check cache performance
            cache_stats = perf_stats.get("cache_performance", {})
            hit_rate = cache_stats.get("hit_rate", 0)
            if hit_rate < 50:  # <50% hit rate is suboptimal
                warnings.append(f"Low cache hit rate: {hit_rate:.1f}%")
            
            # Determine overall status
            if critical_issues:
                status = HealthStatus.CRITICAL
                message = f"Critical application issues: {'; '.join(critical_issues)}"
            elif warnings:
                status = HealthStatus.DEGRADED
                message = f"Application performance issues: {'; '.join(warnings)}"
            else:
                status = HealthStatus.HEALTHY
                message = "Application health optimal"
            
            duration = time.time() - start_time
            
            return HealthResult(
                service="application",
                status=status,
                response_time_ms=duration * 1000,
                message=message,
                details=perf_stats
            )
            
        except Exception as e:
            duration = time.time() - start_time
            return HealthResult(
                service="application",
                status=HealthStatus.CRITICAL,
                response_time_ms=duration * 1000,
                message=f"Application health check failed: {str(e)}"
            )

class SystemHealthMonitor:
    """Aggregate health monitoring system"""
    
    def __init__(self):
        self.health_checker = HealthChecker()
        self.health_history = []
        self.max_history_size = 100
        
    async def get_comprehensive_health(self) -> Dict[str, Any]:
        """Get comprehensive health status for all services"""
        start_time = time.time()
        
        # Run all health checks in parallel
        health_tasks = [
            self.health_checker.check_database_connection(),
            self.health_checker.check_redis_connection(),
            self.health_checker.check_system_resources(),
            self.health_checker.check_application_health()
        ]
        
        try:
            health_results = await asyncio.gather(*health_tasks, return_exceptions=True)
            
            # Process results
            services = {}
            overall_status = HealthStatus.HEALTHY
            
            for result in health_results:
                if isinstance(result, Exception):
                    # Handle exceptions from health checks
                    services["unknown"] = {
                        "status": HealthStatus.CRITICAL.value,
                        "message": f"Health check failed: {str(result)}",
                        "response_time_ms": 0
                    }
                    overall_status = HealthStatus.CRITICAL
                else:
                    services[result.service] = {
                        "status": result.status.value,
                        "message": result.message,
                        "response_time_ms": result.response_time_ms,
                        "details": result.details,
                        "timestamp": result.timestamp
                    }
                    
                    # Update overall status (worst case wins)
                    if result.status == HealthStatus.CRITICAL:
                        overall_status = HealthStatus.CRITICAL
                    elif result.status == HealthStatus.UNHEALTHY and overall_status != HealthStatus.CRITICAL:
                        overall_status = HealthStatus.UNHEALTHY
                    elif result.status == HealthStatus.DEGRADED and overall_status == HealthStatus.HEALTHY:
                        overall_status = HealthStatus.DEGRADED
            
            total_duration = time.time() - start_time
            
            health_summary = {
                "overall_status": overall_status.value,
                "services": services,
                "total_checks": len(health_tasks),
                "health_check_duration_ms": round(total_duration * 1000, 2),
                "timestamp": datetime.utcnow().isoformat(),
                "version": "1.0.0"
            }
            
            # Store in history
            self.health_history.append(health_summary)
            if len(self.health_history) > self.max_history_size:
                self.health_history.pop(0)
            
            return health_summary
            
        except Exception as e:
            logger.error(f"Comprehensive health check failed: {str(e)}")
            return {
                "overall_status": HealthStatus.CRITICAL.value,
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat(),
                "services": {}
            }
    
    def get_health_history(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Get recent health check history"""
        return self.health_history[-limit:] if self.health_history else []
    
    def get_health_trends(self) -> Dict[str, Any]:
        """Analyze health trends over time"""
        if not self.health_history:
            return {"message": "No health history available"}
        
        # Analyze trends from recent history
        recent_checks = self.health_history[-20:]  # Last 20 checks
        
        service_trends = {}
        for check in recent_checks:
            for service_name, service_data in check.get("services", {}).items():
                if service_name not in service_trends:
                    service_trends[service_name] = {
                        "healthy_count": 0,
                        "degraded_count": 0,
                        "unhealthy_count": 0,
                        "critical_count": 0,
                        "avg_response_time": 0,
                        "response_times": []
                    }
                
                status = service_data.get("status", "unknown")
                if status == "healthy":
                    service_trends[service_name]["healthy_count"] += 1
                elif status == "degraded":
                    service_trends[service_name]["degraded_count"] += 1
                elif status == "unhealthy":
                    service_trends[service_name]["unhealthy_count"] += 1
                elif status == "critical":
                    service_trends[service_name]["critical_count"] += 1
                
                response_time = service_data.get("response_time_ms", 0)
                service_trends[service_name]["response_times"].append(response_time)
        
        # Calculate averages
        for service_name, trends in service_trends.items():
            if trends["response_times"]:
                trends["avg_response_time"] = sum(trends["response_times"]) / len(trends["response_times"])
            del trends["response_times"]  # Remove raw data
        
        return {
            "analysis_period": f"Last {len(recent_checks)} checks",
            "service_trends": service_trends,
            "overall_reliability": {
                "total_checks": len(recent_checks),
                "healthy_checks": sum(1 for check in recent_checks if check.get("overall_status") == "healthy"),
                "degraded_checks": sum(1 for check in recent_checks if check.get("overall_status") == "degraded"),
                "unhealthy_checks": sum(1 for check in recent_checks if check.get("overall_status") == "unhealthy"),
                "critical_checks": sum(1 for check in recent_checks if check.get("overall_status") == "critical")
            }
        }

# Global health monitor instance
health_monitor = SystemHealthMonitor() 