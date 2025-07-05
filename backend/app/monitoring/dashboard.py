"""
Monitoring Dashboard for FairPlay NIL
Provides real-time system monitoring and alerting capabilities
"""

import asyncio
import time
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
from dataclasses import dataclass
from enum import Enum
import logging
from app.monitoring.health import health_monitor, HealthStatus
from app.monitoring.metrics import metrics_collector, prometheus_exporter

logger = logging.getLogger(__name__)

class AlertLevel(Enum):
    """Alert severity levels"""
    INFO = "info"
    WARNING = "warning"
    CRITICAL = "critical"
    EMERGENCY = "emergency"

@dataclass
class Alert:
    """Alert data structure"""
    id: str
    level: AlertLevel
    title: str
    description: str
    service: str
    metric_value: Optional[float] = None
    threshold: Optional[float] = None
    timestamp: Optional[str] = None
    resolved: bool = False
    
    def __post_init__(self):
        if self.timestamp is None:
            self.timestamp = datetime.utcnow().isoformat()

class AlertManager:
    """Manages alerts and thresholds"""
    
    def __init__(self):
        self.active_alerts = {}
        self.alert_history = []
        self.thresholds = self._init_default_thresholds()
        self.max_history_size = 1000
    
    def _init_default_thresholds(self) -> Dict[str, Dict[str, float]]:
        """Initialize default alert thresholds"""
        return {
            "response_time": {
                "warning": 1000,    # 1 second
                "critical": 3000    # 3 seconds
            },
            "error_rate": {
                "warning": 5.0,     # 5%
                "critical": 10.0    # 10%
            },
            "cpu_usage": {
                "warning": 80.0,    # 80%
                "critical": 95.0    # 95%
            },
            "memory_usage": {
                "warning": 85.0,    # 85%
                "critical": 95.0    # 95%
            },
            "disk_usage": {
                "warning": 85.0,    # 85%
                "critical": 95.0    # 95%
            },
            "cache_hit_rate": {
                "warning": 70.0,    # Below 70%
                "critical": 50.0    # Below 50%
            },
            "database_response": {
                "warning": 500,     # 500ms
                "critical": 2000    # 2 seconds
            }
        }
    
    def check_alerts(self, health_data: Dict[str, Any], metrics_data: Dict[str, Any]) -> List[Alert]:
        """Check for alert conditions and generate alerts"""
        new_alerts = []
        current_time = time.time()
        
        # Check health-based alerts
        for service_name, service_data in health_data.get("services", {}).items():
            status = service_data.get("status", "unknown")
            response_time = service_data.get("response_time_ms", 0)
            
            # Critical health status alert
            if status == "critical":
                alert_id = f"health_{service_name}_critical"
                if alert_id not in self.active_alerts:
                    alert = Alert(
                        id=alert_id,
                        level=AlertLevel.CRITICAL,
                        title=f"{service_name.title()} Service Critical",
                        description=service_data.get("message", "Service is in critical state"),
                        service=service_name,
                        metric_value=None
                    )
                    self.active_alerts[alert_id] = alert
                    new_alerts.append(alert)
            
            # Response time alerts
            if service_name in ["database", "redis"] and response_time > 0:
                metric_name = f"{service_name}_response"
                thresholds = self.thresholds.get(metric_name, {})
                
                if response_time > thresholds.get("critical", float('inf')):
                    alert_id = f"response_{service_name}_critical"
                    if alert_id not in self.active_alerts:
                        alert = Alert(
                            id=alert_id,
                            level=AlertLevel.CRITICAL,
                            title=f"{service_name.title()} Response Time Critical",
                            description=f"Response time is {response_time:.0f}ms",
                            service=service_name,
                            metric_value=response_time,
                            threshold=thresholds["critical"]
                        )
                        self.active_alerts[alert_id] = alert
                        new_alerts.append(alert)
                
                elif response_time > thresholds.get("warning", float('inf')):
                    alert_id = f"response_{service_name}_warning"
                    if alert_id not in self.active_alerts:
                        alert = Alert(
                            id=alert_id,
                            level=AlertLevel.WARNING,
                            title=f"{service_name.title()} Response Time Elevated",
                            description=f"Response time is {response_time:.0f}ms",
                            service=service_name,
                            metric_value=response_time,
                            threshold=thresholds["warning"]
                        )
                        self.active_alerts[alert_id] = alert
                        new_alerts.append(alert)
        
        # Check system resource alerts
        system_service = health_data.get("services", {}).get("system", {})
        system_details = system_service.get("details", {})
        
        for resource in ["cpu_percent", "memory_percent", "disk_percent"]:
            if resource in system_details:
                value = system_details[resource]
                metric_name = resource.replace("_percent", "_usage")
                thresholds = self.thresholds.get(metric_name, {})
                
                if value > thresholds.get("critical", 100):
                    alert_id = f"system_{resource}_critical"
                    if alert_id not in self.active_alerts:
                        alert = Alert(
                            id=alert_id,
                            level=AlertLevel.CRITICAL,
                            title=f"High {resource.replace('_', ' ').title()}",
                            description=f"{resource.replace('_', ' ').title()} is at {value:.1f}%",
                            service="system",
                            metric_value=value,
                            threshold=thresholds["critical"]
                        )
                        self.active_alerts[alert_id] = alert
                        new_alerts.append(alert)
                
                elif value > thresholds.get("warning", 100):
                    alert_id = f"system_{resource}_warning"
                    if alert_id not in self.active_alerts:
                        alert = Alert(
                            id=alert_id,
                            level=AlertLevel.WARNING,
                            title=f"Elevated {resource.replace('_', ' ').title()}",
                            description=f"{resource.replace('_', ' ').title()} is at {value:.1f}%",
                            service="system",
                            metric_value=value,
                            threshold=thresholds["warning"]
                        )
                        self.active_alerts[alert_id] = alert
                        new_alerts.append(alert)
        
        # Check application metrics alerts
        request_metrics = metrics_data.get("request_metrics", {})
        
        # Error rate alerts
        for endpoint, error_rate in request_metrics.get("error_rates", {}).items():
            thresholds = self.thresholds.get("error_rate", {})
            
            if error_rate > thresholds.get("critical", 100):
                alert_id = f"error_rate_{endpoint}_critical"
                if alert_id not in self.active_alerts:
                    alert = Alert(
                        id=alert_id,
                        level=AlertLevel.CRITICAL,
                        title=f"High Error Rate on {endpoint}",
                        description=f"Error rate is {error_rate:.1f}%",
                        service="application",
                        metric_value=error_rate,
                        threshold=thresholds["critical"]
                    )
                    self.active_alerts[alert_id] = alert
                    new_alerts.append(alert)
            
            elif error_rate > thresholds.get("warning", 100):
                alert_id = f"error_rate_{endpoint}_warning"
                if alert_id not in self.active_alerts:
                    alert = Alert(
                        id=alert_id,
                        level=AlertLevel.WARNING,
                        title=f"Elevated Error Rate on {endpoint}",
                        description=f"Error rate is {error_rate:.1f}%",
                        service="application",
                        metric_value=error_rate,
                        threshold=thresholds["warning"]
                    )
                    self.active_alerts[alert_id] = alert
                    new_alerts.append(alert)
        
        # Cache hit rate alerts
        cache_metrics = metrics_data.get("cache_metrics", {})
        hit_rate = cache_metrics.get("hit_rate", 100)
        
        if hit_rate < self.thresholds["cache_hit_rate"]["critical"]:
            alert_id = "cache_hit_rate_critical"
            if alert_id not in self.active_alerts:
                alert = Alert(
                    id=alert_id,
                    level=AlertLevel.CRITICAL,
                    title="Low Cache Hit Rate",
                    description=f"Cache hit rate is {hit_rate:.1f}%",
                    service="cache",
                    metric_value=hit_rate,
                    threshold=self.thresholds["cache_hit_rate"]["critical"]
                )
                self.active_alerts[alert_id] = alert
                new_alerts.append(alert)
        
        elif hit_rate < self.thresholds["cache_hit_rate"]["warning"]:
            alert_id = "cache_hit_rate_warning"
            if alert_id not in self.active_alerts:
                alert = Alert(
                    id=alert_id,
                    level=AlertLevel.WARNING,
                    title="Cache Hit Rate Below Optimal",
                    description=f"Cache hit rate is {hit_rate:.1f}%",
                    service="cache",
                    metric_value=hit_rate,
                    threshold=self.thresholds["cache_hit_rate"]["warning"]
                )
                self.active_alerts[alert_id] = alert
                new_alerts.append(alert)
        
        # Auto-resolve alerts that are no longer valid
        self._auto_resolve_alerts(health_data, metrics_data)
        
        # Add to history
        for alert in new_alerts:
            self.alert_history.append(alert)
        
        # Limit history size
        if len(self.alert_history) > self.max_history_size:
            self.alert_history = self.alert_history[-self.max_history_size:]
        
        return new_alerts
    
    def _auto_resolve_alerts(self, health_data: Dict[str, Any], metrics_data: Dict[str, Any]):
        """Automatically resolve alerts when conditions are no longer met"""
        to_resolve = []
        
        for alert_id, alert in self.active_alerts.items():
            should_resolve = False
            
            # Check if health-based alerts should be resolved
            if alert_id.startswith("health_"):
                service_name = alert_id.split("_")[1]
                service_data = health_data.get("services", {}).get(service_name, {})
                status = service_data.get("status", "unknown")
                if status != "critical":
                    should_resolve = True
            
            # Check if response time alerts should be resolved
            elif alert_id.startswith("response_"):
                service_name = alert_id.split("_")[1]
                service_data = health_data.get("services", {}).get(service_name, {})
                response_time = service_data.get("response_time_ms", 0)
                
                if "critical" in alert_id and alert.threshold:
                    if response_time <= alert.threshold:
                        should_resolve = True
                elif "warning" in alert_id and alert.threshold:
                    if response_time <= alert.threshold:
                        should_resolve = True
            
            # Check if system resource alerts should be resolved
            elif alert_id.startswith("system_"):
                parts = alert_id.split("_")
                resource = f"{parts[1]}_percent"
                system_details = health_data.get("services", {}).get("system", {}).get("details", {})
                value = system_details.get(resource, 0)
                
                if alert.threshold and value <= alert.threshold:
                    should_resolve = True
            
            # Check if error rate alerts should be resolved
            elif alert_id.startswith("error_rate_"):
                endpoint = "_".join(alert_id.split("_")[2:-1])
                error_rates = metrics_data.get("request_metrics", {}).get("error_rates", {})
                error_rate = error_rates.get(endpoint, 0)
                
                if alert.threshold and error_rate <= alert.threshold:
                    should_resolve = True
            
            # Check if cache hit rate alerts should be resolved
            elif alert_id.startswith("cache_hit_rate_"):
                hit_rate = metrics_data.get("cache_metrics", {}).get("hit_rate", 100)
                if alert.threshold and hit_rate >= alert.threshold:
                    should_resolve = True
            
            if should_resolve:
                to_resolve.append(alert_id)
        
        # Mark alerts as resolved
        for alert_id in to_resolve:
            if alert_id in self.active_alerts:
                self.active_alerts[alert_id].resolved = True
                del self.active_alerts[alert_id]
    
    def get_active_alerts(self) -> List[Alert]:
        """Get all active alerts"""
        return list(self.active_alerts.values())
    
    def get_alert_summary(self) -> Dict[str, Any]:
        """Get alert summary statistics"""
        active_alerts = self.get_active_alerts()
        
        summary = {
            "total_active": len(active_alerts),
            "by_level": {
                "info": 0,
                "warning": 0,
                "critical": 0,
                "emergency": 0
            },
            "by_service": {},
            "recent_alerts": len([a for a in self.alert_history[-20:] if not a.resolved])
        }
        
        for alert in active_alerts:
            summary["by_level"][alert.level.value] += 1
            if alert.service not in summary["by_service"]:
                summary["by_service"][alert.service] = 0
            summary["by_service"][alert.service] += 1
        
        return summary

class MonitoringDashboard:
    """Main monitoring dashboard"""
    
    def __init__(self):
        self.alert_manager = AlertManager()
        self.dashboard_cache = {}
        self.cache_ttl = 30  # 30 second cache
        self.last_update = 0
    
    async def get_dashboard_data(self, force_refresh: bool = False) -> Dict[str, Any]:
        """Get comprehensive dashboard data"""
        current_time = time.time()
        
        # Check cache
        if not force_refresh and (current_time - self.last_update) < self.cache_ttl and self.dashboard_cache:
            return self.dashboard_cache
        
        try:
            # Gather all monitoring data
            health_data = await health_monitor.get_comprehensive_health()
            metrics_data = metrics_collector.get_performance_metrics()
            
            # Check for alerts
            new_alerts = self.alert_manager.check_alerts(health_data, metrics_data)
            active_alerts = self.alert_manager.get_active_alerts()
            alert_summary = self.alert_manager.get_alert_summary()
            
            # Calculate overall system health score
            health_score = self._calculate_health_score(health_data, metrics_data, alert_summary)
            
            # Build dashboard data
            dashboard_data = {
                "timestamp": datetime.utcnow().isoformat(),
                "system_health": {
                    "overall_score": health_score,
                    "status": health_data.get("overall_status", "unknown"),
                    "services": health_data.get("services", {}),
                    "trends": health_monitor.get_health_trends()
                },
                "performance_metrics": metrics_data,
                "alerts": {
                    "active": [self._alert_to_dict(alert) for alert in active_alerts],
                    "new": [self._alert_to_dict(alert) for alert in new_alerts],
                    "summary": alert_summary
                },
                "quick_stats": self._generate_quick_stats(health_data, metrics_data),
                "recommendations": self._generate_recommendations(health_data, metrics_data, active_alerts)
            }
            
            # Update cache
            self.dashboard_cache = dashboard_data
            self.last_update = current_time
            
            return dashboard_data
            
        except Exception as e:
            logger.error(f"Failed to generate dashboard data: {str(e)}")
            return {
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat(),
                "status": "error"
            }
    
    def _calculate_health_score(self, health_data: Dict[str, Any], metrics_data: Dict[str, Any], alert_summary: Dict[str, Any]) -> int:
        """Calculate overall system health score (0-100)"""
        score = 100
        
        # Deduct points for service issues
        services = health_data.get("services", {})
        for service_name, service_data in services.items():
            status = service_data.get("status", "healthy")
            if status == "critical":
                score -= 30
            elif status == "unhealthy":
                score -= 20
            elif status == "degraded":
                score -= 10
        
        # Deduct points for alerts
        critical_alerts = alert_summary.get("by_level", {}).get("critical", 0)
        warning_alerts = alert_summary.get("by_level", {}).get("warning", 0)
        
        score -= (critical_alerts * 15)
        score -= (warning_alerts * 5)
        
        # Deduct points for poor performance metrics
        request_metrics = metrics_data.get("request_metrics", {})
        avg_response_times = request_metrics.get("average_response_time", {})
        error_rates = request_metrics.get("error_rates", {})
        
        # Check response times
        for endpoint, response_time in avg_response_times.items():
            if response_time > 2000:  # >2 seconds
                score -= 10
            elif response_time > 1000:  # >1 second
                score -= 5
        
        # Check error rates
        for endpoint, error_rate in error_rates.items():
            if error_rate > 10:  # >10%
                score -= 10
            elif error_rate > 5:  # >5%
                score -= 5
        
        return max(0, min(100, score))
    
    def _alert_to_dict(self, alert: Alert) -> Dict[str, Any]:
        """Convert alert to dictionary"""
        return {
            "id": alert.id,
            "level": alert.level.value,
            "title": alert.title,
            "description": alert.description,
            "service": alert.service,
            "metric_value": alert.metric_value,
            "threshold": alert.threshold,
            "timestamp": alert.timestamp,
            "resolved": alert.resolved
        }
    
    def _generate_quick_stats(self, health_data: Dict[str, Any], metrics_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate quick overview statistics"""
        services = health_data.get("services", {})
        request_metrics = metrics_data.get("request_metrics", {})
        user_metrics = metrics_data.get("user_metrics", {})
        
        return {
            "services_healthy": sum(1 for s in services.values() if s.get("status") == "healthy"),
            "total_services": len(services),
            "active_users": user_metrics.get("active_users_count", 0),
            "requests_last_minute": sum(request_metrics.get("requests_per_minute", {}).values()),
            "average_response_time": self._calculate_avg_response_time(request_metrics),
            "cache_hit_rate": metrics_data.get("cache_metrics", {}).get("hit_rate", 0),
            "total_errors": metrics_data.get("total_errors", 0)
        }
    
    def _calculate_avg_response_time(self, request_metrics: Dict[str, Any]) -> float:
        """Calculate overall average response time"""
        response_times = request_metrics.get("average_response_time", {})
        if not response_times:
            return 0.0
        return round(sum(response_times.values()) / len(response_times), 2)
    
    def _generate_recommendations(self, health_data: Dict[str, Any], metrics_data: Dict[str, Any], active_alerts: List[Alert]) -> List[str]:
        """Generate system optimization recommendations"""
        recommendations = []
        
        # Check for high error rates
        error_rates = metrics_data.get("request_metrics", {}).get("error_rates", {})
        high_error_endpoints = [ep for ep, rate in error_rates.items() if rate > 5]
        if high_error_endpoints:
            recommendations.append(f"Investigate high error rates on: {', '.join(high_error_endpoints)}")
        
        # Check for slow endpoints
        response_times = metrics_data.get("request_metrics", {}).get("average_response_time", {})
        slow_endpoints = [ep for ep, time in response_times.items() if time > 1000]
        if slow_endpoints:
            recommendations.append(f"Optimize slow endpoints: {', '.join(slow_endpoints)}")
        
        # Check cache performance
        cache_hit_rate = metrics_data.get("cache_metrics", {}).get("hit_rate", 100)
        if cache_hit_rate < 70:
            recommendations.append("Consider improving cache strategy - hit rate below optimal")
        
        # Check system resources
        system_details = health_data.get("services", {}).get("system", {}).get("details", {})
        if system_details.get("memory_percent", 0) > 80:
            recommendations.append("Consider scaling up memory resources")
        if system_details.get("cpu_percent", 0) > 80:
            recommendations.append("Consider scaling up CPU resources")
        
        # Check for critical alerts
        critical_alerts = [a for a in active_alerts if a.level == AlertLevel.CRITICAL]
        if critical_alerts:
            recommendations.append("Address critical alerts immediately")
        
        if not recommendations:
            recommendations.append("System is performing well - no immediate actions needed")
        
        return recommendations

# Global dashboard instance
monitoring_dashboard = MonitoringDashboard() 