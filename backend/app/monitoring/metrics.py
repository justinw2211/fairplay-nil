"""
Metrics Collection System for FairPlay NIL
Provides comprehensive application metrics in Prometheus format
"""

import time
import threading
from collections import defaultdict, Counter
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
import json
import logging
from dataclasses import dataclass, field
from enum import Enum

logger = logging.getLogger(__name__)

class MetricType(Enum):
    """Types of metrics we can collect"""
    COUNTER = "counter"
    GAUGE = "gauge"
    HISTOGRAM = "histogram"
    SUMMARY = "summary"

@dataclass
class MetricPoint:
    """Individual metric data point"""
    name: str
    value: float
    labels: Dict[str, str] = field(default_factory=dict)
    timestamp: float = field(default_factory=time.time)
    metric_type: MetricType = MetricType.GAUGE

class MetricsCollector:
    """Core metrics collection system"""
    
    def __init__(self):
        self._metrics = defaultdict(list)
        self._counters = defaultdict(float)
        self._gauges = defaultdict(float)
        self._histograms = defaultdict(list)
        self._summaries = defaultdict(list)
        self._lock = threading.Lock()
        
        # Request tracking
        self._request_durations = defaultdict(list)
        self._request_counts = defaultdict(int)
        self._error_counts = defaultdict(int)
        
        # User activity tracking
        self._user_activities = defaultdict(int)
        self._active_users = set()
        
        # System metrics tracking
        self._last_system_check = 0
        self._system_metrics = {}
        
    def record_request_duration(self, endpoint: str, method: str, status_code: int, duration: float, user_role: str = "unknown"):
        """Record HTTP request duration and metadata"""
        with self._lock:
            labels = {
                "endpoint": endpoint,
                "method": method,
                "status_code": str(status_code),
                "user_role": user_role
            }
            
            # Record duration histogram
            metric_name = "http_request_duration_seconds"
            self._histograms[metric_name].append(MetricPoint(
                name=metric_name,
                value=duration,
                labels=labels,
                metric_type=MetricType.HISTOGRAM
            ))
            
            # Track request counts
            request_key = f"{method}_{endpoint}_{status_code}_{user_role}"
            self._request_counts[request_key] += 1
            
            # Track for rate calculations
            self._request_durations[endpoint].append({
                "duration": duration,
                "timestamp": time.time(),
                "status_code": status_code,
                "user_role": user_role
            })
            
            # Keep only last 1000 requests per endpoint
            if len(self._request_durations[endpoint]) > 1000:
                self._request_durations[endpoint] = self._request_durations[endpoint][-1000:]
    
    def record_error_rate(self, endpoint: str, error_type: str, user_role: str = "unknown"):
        """Record error occurrences"""
        with self._lock:
            labels = {
                "endpoint": endpoint,
                "error_type": error_type,
                "user_role": user_role
            }
            
            # Record error counter
            metric_name = "http_errors_total"
            error_key = f"{endpoint}_{error_type}_{user_role}"
            self._error_counts[error_key] += 1
            
            # Store as counter metric
            self._counters[f"{metric_name}_{error_key}"] += 1
    
    def record_user_activity(self, user_id: str, user_role: str, action: str):
        """Record user activity metrics"""
        with self._lock:
            # Track active users
            self._active_users.add(user_id)
            
            # Track activity by type and role
            activity_key = f"{user_role}_{action}"
            self._user_activities[activity_key] += 1
            
            labels = {
                "user_role": user_role,
                "action": action
            }
            
            # Record activity counter
            metric_name = "user_activities_total"
            self._counters[f"{metric_name}_{activity_key}"] += 1
    
    def record_database_query(self, query_type: str, duration: float, success: bool):
        """Record database query performance"""
        with self._lock:
            labels = {
                "query_type": query_type,
                "status": "success" if success else "error"
            }
            
            # Record query duration
            metric_name = "database_query_duration_seconds"
            self._histograms[metric_name].append(MetricPoint(
                name=metric_name,
                value=duration,
                labels=labels,
                metric_type=MetricType.HISTOGRAM
            ))
            
            # Record query counter
            counter_name = "database_queries_total"
            counter_key = f"{query_type}_{labels['status']}"
            self._counters[f"{counter_name}_{counter_key}"] += 1
    
    def record_cache_operation(self, operation: str, hit: bool, duration: float):
        """Record cache operation metrics"""
        with self._lock:
            labels = {
                "operation": operation,
                "result": "hit" if hit else "miss"
            }
            
            # Record cache operation duration
            metric_name = "cache_operation_duration_seconds"
            self._histograms[metric_name].append(MetricPoint(
                name=metric_name,
                value=duration,
                labels=labels,
                metric_type=MetricType.HISTOGRAM
            ))
            
            # Record cache hit/miss counters
            counter_name = "cache_operations_total"
            counter_key = f"{operation}_{labels['result']}"
            self._counters[f"{counter_name}_{counter_key}"] += 1
    
    def set_gauge(self, name: str, value: float, labels: Optional[Dict[str, str]] = None):
        """Set a gauge metric value"""
        with self._lock:
            labels = labels or {}
            gauge_key = f"{name}_{'_'.join([f'{k}_{v}' for k, v in labels.items()])}"
            self._gauges[gauge_key] = value
    
    def increment_counter(self, name: str, value: float = 1.0, labels: Optional[Dict[str, str]] = None):
        """Increment a counter metric"""
        with self._lock:
            labels = labels or {}
            counter_key = f"{name}_{'_'.join([f'{k}_{v}' for k, v in labels.items()])}"
            self._counters[counter_key] += value
    
    def get_request_metrics(self) -> Dict[str, Any]:
        """Get aggregated request metrics"""
        with self._lock:
            now = time.time()
            last_hour = now - 3600  # Last hour
            last_minute = now - 60   # Last minute
            
            metrics = {
                "requests_per_minute": {},
                "requests_per_hour": {},
                "average_response_time": {},
                "error_rates": {},
                "status_code_distribution": defaultdict(int)
            }
            
            for endpoint, requests in self._request_durations.items():
                # Filter requests by time window
                recent_requests = [r for r in requests if r["timestamp"] > last_hour]
                minute_requests = [r for r in requests if r["timestamp"] > last_minute]
                
                if recent_requests:
                    # Requests per hour/minute
                    metrics["requests_per_hour"][endpoint] = len(recent_requests)
                    metrics["requests_per_minute"][endpoint] = len(minute_requests)
                    
                    # Average response time
                    avg_duration = sum(r["duration"] for r in recent_requests) / len(recent_requests)
                    metrics["average_response_time"][endpoint] = round(avg_duration * 1000, 2)  # Convert to ms
                    
                    # Status code distribution
                    for req in recent_requests:
                        metrics["status_code_distribution"][req["status_code"]] += 1
                    
                    # Error rate calculation
                    error_requests = [r for r in recent_requests if r["status_code"] >= 400]
                    error_rate = (len(error_requests) / len(recent_requests)) * 100
                    metrics["error_rates"][endpoint] = round(error_rate, 2)
            
            return metrics
    
    def get_user_metrics(self) -> Dict[str, Any]:
        """Get user activity metrics"""
        with self._lock:
            return {
                "active_users_count": len(self._active_users),
                "user_activities": dict(self._user_activities),
                "activity_distribution": self._calculate_activity_distribution()
            }
    
    def _calculate_activity_distribution(self) -> Dict[str, int]:
        """Calculate activity distribution by role"""
        distribution = defaultdict(int)
        for activity_key, count in self._user_activities.items():
            if "_" in activity_key:
                role = activity_key.split("_")[0]
                distribution[role] += count
        return dict(distribution)
    
    def get_performance_metrics(self) -> Dict[str, Any]:
        """Get system performance metrics"""
        request_metrics = self.get_request_metrics()
        user_metrics = self.get_user_metrics()
        
        with self._lock:
            # Calculate percentiles for response times
            all_durations = []
            for requests in self._request_durations.values():
                all_durations.extend([r["duration"] for r in requests])
            
            percentiles = {}
            if all_durations:
                all_durations.sort()
                percentiles = {
                    "p50": self._calculate_percentile(all_durations, 50),
                    "p95": self._calculate_percentile(all_durations, 95),
                    "p99": self._calculate_percentile(all_durations, 99)
                }
            
            return {
                "request_metrics": request_metrics,
                "user_metrics": user_metrics,
                "response_time_percentiles": percentiles,
                "total_errors": sum(self._error_counts.values()),
                "total_requests": sum(self._request_counts.values()),
                "cache_metrics": self._get_cache_metrics()
            }
    
    def _calculate_percentile(self, sorted_values: List[float], percentile: int) -> float:
        """Calculate percentile value"""
        if not sorted_values:
            return 0.0
        
        index = int((percentile / 100.0) * (len(sorted_values) - 1))
        return round(sorted_values[index] * 1000, 2)  # Convert to ms
    
    def _get_cache_metrics(self) -> Dict[str, Any]:
        """Get cache-related metrics"""
        cache_hits = sum(1 for key in self._counters.keys() if "cache_operations_total" in key and "hit" in key)
        cache_misses = sum(1 for key in self._counters.keys() if "cache_operations_total" in key and "miss" in key)
        
        total_operations = cache_hits + cache_misses
        hit_rate = (cache_hits / total_operations * 100) if total_operations > 0 else 0
        
        return {
            "hit_rate": round(hit_rate, 2),
            "total_hits": cache_hits,
            "total_misses": cache_misses,
            "total_operations": total_operations
        }
    
    def reset_metrics(self, older_than_hours: int = 24):
        """Reset metrics older than specified hours"""
        with self._lock:
            cutoff_time = time.time() - (older_than_hours * 3600)
            
            # Clean old request data
            for endpoint in list(self._request_durations.keys()):
                self._request_durations[endpoint] = [
                    r for r in self._request_durations[endpoint]
                    if r["timestamp"] > cutoff_time
                ]
                if not self._request_durations[endpoint]:
                    del self._request_durations[endpoint]
            
            # Reset user activities (keep current session)
            self._active_users.clear()

class PrometheusExporter:
    """Export metrics in Prometheus format"""
    
    def __init__(self, metrics_collector: MetricsCollector):
        self.metrics_collector = metrics_collector
    
    def generate_prometheus_metrics(self) -> str:
        """Generate metrics in Prometheus exposition format"""
        lines = []
        
        # Add metadata
        lines.append("# HELP fairplay_nil_info FairPlay NIL application info")
        lines.append("# TYPE fairplay_nil_info gauge")
        lines.append(f'fairplay_nil_info{{version="1.0.0",service="fairplay-nil-api"}} 1')
        lines.append("")
        
        # Add request metrics
        request_metrics = self.metrics_collector.get_request_metrics()
        
        # Requests per minute
        lines.append("# HELP http_requests_per_minute Number of HTTP requests per minute")
        lines.append("# TYPE http_requests_per_minute gauge")
        for endpoint, count in request_metrics.get("requests_per_minute", {}).items():
            lines.append(f'http_requests_per_minute{{endpoint="{endpoint}"}} {count}')
        lines.append("")
        
        # Average response time
        lines.append("# HELP http_request_duration_ms Average HTTP request duration in milliseconds")
        lines.append("# TYPE http_request_duration_ms gauge")
        for endpoint, duration in request_metrics.get("average_response_time", {}).items():
            lines.append(f'http_request_duration_ms{{endpoint="{endpoint}"}} {duration}')
        lines.append("")
        
        # Error rates
        lines.append("# HELP http_error_rate HTTP error rate percentage")
        lines.append("# TYPE http_error_rate gauge")
        for endpoint, rate in request_metrics.get("error_rates", {}).items():
            lines.append(f'http_error_rate{{endpoint="{endpoint}"}} {rate}')
        lines.append("")
        
        # User metrics
        user_metrics = self.metrics_collector.get_user_metrics()
        
        lines.append("# HELP active_users_count Number of active users")
        lines.append("# TYPE active_users_count gauge")
        lines.append(f'active_users_count {user_metrics.get("active_users_count", 0)}')
        lines.append("")
        
        # Cache metrics
        cache_metrics = self.metrics_collector._get_cache_metrics()
        
        lines.append("# HELP cache_hit_rate Cache hit rate percentage")
        lines.append("# TYPE cache_hit_rate gauge")
        lines.append(f'cache_hit_rate {cache_metrics.get("hit_rate", 0)}')
        lines.append("")
        
        lines.append("# HELP cache_operations_total Total cache operations")
        lines.append("# TYPE cache_operations_total counter")
        lines.append(f'cache_operations_total{{result="hit"}} {cache_metrics.get("total_hits", 0)}')
        lines.append(f'cache_operations_total{{result="miss"}} {cache_metrics.get("total_misses", 0)}')
        lines.append("")
        
        return "\n".join(lines)
    
    def generate_json_metrics(self) -> Dict[str, Any]:
        """Generate metrics in JSON format"""
        performance_metrics = self.metrics_collector.get_performance_metrics()
        
        return {
            "timestamp": datetime.utcnow().isoformat(),
            "service": "fairplay-nil-api",
            "version": "1.0.0",
            "metrics": performance_metrics
        }

# Global metrics collector instance
metrics_collector = MetricsCollector()
prometheus_exporter = PrometheusExporter(metrics_collector) 