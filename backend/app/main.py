# backend/app/main.py
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import PlainTextResponse
from app.api import profile, deals, errors
from app.database import supabase, db
from app.middleware.rate_limiting import RateLimitMiddleware
from app.middleware.error_handling import ErrorHandlingMiddleware
from app.cache import init_cache_system, cleanup_cache_system, get_cache_manager
from app.monitoring.health import health_monitor
from app.monitoring.metrics import metrics_collector, prometheus_exporter
from app.monitoring.dashboard import monitoring_dashboard
from contextlib import asynccontextmanager
import os
import time
import logging
import signal

# Setup basic logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Global rate limiter instance
rate_limiter = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Handle application lifespan with rate limiter and cache system setup"""
    global rate_limiter
    logger.info("--- Application Starting Up ---")
    
    # Initialize rate limiter
    rate_limiter = RateLimitMiddleware()
    await rate_limiter.init_redis()
    
    # Initialize cache system
    cache_manager = await init_cache_system()
    db.set_cache_manager(cache_manager)
    
    logger.info(f"CORS allow_origin_regex configured: {ORIGIN_REGEX}")
    logger.info("--- Application Startup Complete ---")
    
    yield
    
    # Cleanup
    if rate_limiter:
        await rate_limiter.close_redis()
    await cleanup_cache_system()
    logger.info("--- Application Shutdown Complete ---")

app = FastAPI(title="FairPlay NIL API", lifespan=lifespan)

# --- DEFINITIVE CORS FIX v8 ---
# This regular expression matches:
#
# 1. https://www.fairplaynil.com (new production domain)
# 2. http://localhost (with any port for local development)
# 3. Your existing production URL (e.g., https://fairplay-nil.vercel.app)
# 4. ANY preview URL patterns:
#    - https://fairplay-*-justin-wachtels-projects.vercel.app
#    - https://fairplay-nil-git-*-justin-wachtels-projects.vercel.app
#    - https://fairplay-nil.vercel.app
#
ORIGIN_REGEX = r"https://www\.fairplaynil\.com|https://fairplay-[^.]*\.vercel\.app|https://fairplay-nil-git-[^.]*-justin-wachtels-projects\.vercel\.app|https://fairplay-[^.]*-justin-wachtels-projects\.vercel\.app|http://localhost(:\d+)?"

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=ORIGIN_REGEX,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Token-Expired", "WWW-Authenticate", "X-RateLimit-Limit", "X-RateLimit-Remaining", "X-RateLimit-Reset", "X-RateLimit-Window"]
)

# Add error handling middleware (early in stack to catch all exceptions)
@app.middleware("http")
async def error_handling_middleware(request: Request, call_next):
    """Error handling middleware to catch unhandled exceptions"""
    error_handler = ErrorHandlingMiddleware()
    return await error_handler(request, call_next)

# Add rate limiting middleware
@app.middleware("http")
async def rate_limit_middleware(request, call_next):
    """Rate limiting middleware wrapper"""
    global rate_limiter
    if rate_limiter:
        return await rate_limiter(request, call_next)
    else:
        return await call_next(request)

# Add metrics collection middleware
@app.middleware("http")
async def metrics_middleware(request: Request, call_next):
    """Middleware to collect metrics on all requests"""
    start_time = time.time()
    
    # Extract user role from headers or token if available
    user_role = "unknown"
    if hasattr(request.state, 'user_role'):
        user_role = request.state.user_role
    
    try:
        response = await call_next(request)
        
        # Calculate request duration
        duration = time.time() - start_time
        
        # Record metrics
        metrics_collector.record_request_duration(
            endpoint=request.url.path,
            method=request.method,
            status_code=response.status_code,
            duration=duration,
            user_role=user_role
        )
        
        # Record error if status code indicates an error
        if response.status_code >= 400:
            error_type = "client_error" if response.status_code < 500 else "server_error"
            metrics_collector.record_error_rate(
                endpoint=request.url.path,
                error_type=error_type,
                user_role=user_role
            )
        
        return response
        
    except Exception as e:
        # Record error metrics for exceptions
        duration = time.time() - start_time
        metrics_collector.record_request_duration(
            endpoint=request.url.path,
            method=request.method,
            status_code=500,
            duration=duration,
            user_role=user_role
        )
        
        metrics_collector.record_error_rate(
            endpoint=request.url.path,
            error_type="exception",
            user_role=user_role
        )
        
        raise e

# This routing setup is correct and follows FastAPI best practices.
app.include_router(profile.router, prefix="/api")
app.include_router(deals.router, prefix="/api")
app.include_router(errors.router, prefix="/api")

@app.get("/")
def read_root():
    return {"message": "Welcome to the Fair Play NIL API"}

@app.get("/health")
async def health_check():
    """Basic health check endpoint"""
    db_health = await db.health_check()
    return {
        "status": "healthy" if db_health["status"] == "healthy" else "degraded",
        "service": "fairplay-nil-api",
        "database": db_health,
        "timestamp": db_health["timestamp"]
    }

@app.get("/health/comprehensive")
async def comprehensive_health_check():
    """Comprehensive health check for all services"""
    return await health_monitor.get_comprehensive_health()

@app.get("/health/history")
async def health_history(limit: int = 10):
    """Get health check history"""
    return {"history": health_monitor.get_health_history(limit)}

@app.get("/health/trends")
async def health_trends():
    """Get health trends analysis"""
    return health_monitor.get_health_trends()

@app.get("/metrics")
async def get_basic_metrics():
    """Get basic database performance metrics"""
    return await db.get_performance_stats()

@app.get("/metrics/performance")
async def get_performance_metrics():
    """Get comprehensive performance metrics"""
    return metrics_collector.get_performance_metrics()

@app.get("/metrics/prometheus")
async def get_prometheus_metrics():
    """Get metrics in Prometheus format"""
    prometheus_text = prometheus_exporter.generate_prometheus_metrics()
    return PlainTextResponse(prometheus_text, media_type="text/plain")

@app.get("/metrics/json")
async def get_json_metrics():
    """Get metrics in JSON format"""
    return prometheus_exporter.generate_json_metrics()

@app.get("/monitoring/dashboard")
async def get_monitoring_dashboard(force_refresh: bool = False):
    """Get comprehensive monitoring dashboard data"""
    return await monitoring_dashboard.get_dashboard_data(force_refresh)

@app.get("/monitoring/alerts")
async def get_active_alerts():
    """Get active alerts"""
    return {
        "active_alerts": [
            alert.__dict__ for alert in monitoring_dashboard.alert_manager.get_active_alerts()
        ],
        "summary": monitoring_dashboard.alert_manager.get_alert_summary()
    }

@app.post("/monitoring/alerts/test")
async def test_alert_system():
    """Test alert system (for development/testing)"""
    # This would normally be restricted in production
    health_data = await health_monitor.get_comprehensive_health()
    metrics_data = metrics_collector.get_performance_metrics()
    
    new_alerts = monitoring_dashboard.alert_manager.check_alerts(health_data, metrics_data)
    
    return {
        "test_completed": True,
        "new_alerts": len(new_alerts),
        "alert_details": [alert.__dict__ for alert in new_alerts]
    }

@app.get("/cache/stats")
async def get_cache_stats():
    """Get cache performance statistics"""
    cache_manager = await get_cache_manager()
    return await cache_manager.get_cache_stats()

@app.post("/cache/invalidate/{cache_type}")
async def invalidate_cache(cache_type: str, pattern: str = ""):
    """Invalidate cache entries"""
    cache_manager = await get_cache_manager()
    if pattern:
        invalidated = await cache_manager.invalidate_pattern(f"fairplay_cache:{cache_type}:{pattern}")
    else:
        invalidated = await cache_manager.invalidate_pattern(f"fairplay_cache:{cache_type}:*")
    
    return {"invalidated": invalidated, "cache_type": cache_type, "pattern": pattern}

@app.get("/system/graceful-shutdown")
async def prepare_graceful_shutdown():
    """Prepare system for graceful shutdown"""
    logger.info("Preparing graceful shutdown...")
    
    # Stop accepting new requests (would need load balancer support)
    # Allow existing requests to complete
    # Clear metrics older than 1 hour
    metrics_collector.reset_metrics(older_than_hours=1)
    
    return {
        "message": "System prepared for graceful shutdown",
        "timestamp": time.time()
    }