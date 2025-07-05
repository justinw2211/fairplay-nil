"""
Rate limiting middleware for FairPlay NIL backend
Provides role-based rate limiting with Redis backend for distributed environments
"""

import json
import time
import logging
from typing import Dict, Optional, Tuple
from fastapi import HTTPException, Request, Response
from fastapi.responses import JSONResponse
import redis.asyncio as redis
import asyncio
from contextlib import asynccontextmanager
import jwt
import os
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

class RateLimitError(HTTPException):
    """Rate limit exceeded error"""
    def __init__(self, detail: str, retry_after: int):
        super().__init__(
            status_code=429,
            detail=detail,
            headers={
                "Retry-After": str(retry_after),
                "X-RateLimit-Exceeded": "true"
            }
        )

class RateLimitConfig:
    """Rate limiting configuration for different user roles"""
    
    # Rate limits per minute for different user roles
    ROLE_LIMITS = {
        "athlete": 100,
        "brand": 200,
        "university": 300,
        "collective": 250,
        "anonymous": 50  # For non-authenticated users
    }
    
    # Burst allowance (allows brief spikes above rate limit)
    BURST_ALLOWANCE = {
        "athlete": 10,
        "brand": 20,
        "university": 30,
        "collective": 25,
        "anonymous": 5
    }
    
    # Window size in seconds
    WINDOW_SIZE = 60
    
    # Redis key prefix
    KEY_PREFIX = "fairplay_rate_limit"

class RateLimitMiddleware:
    """Redis-based rate limiting middleware with role-based limits"""
    
    def __init__(self, redis_url: Optional[str] = None):
        self.redis_url = redis_url or os.getenv("REDIS_URL", "redis://localhost:6379")
        self.redis_client: Optional[redis.Redis] = None
        self.config = RateLimitConfig()
        self.fallback_mode = False
        
    async def init_redis(self):
        """Initialize Redis connection"""
        try:
            self.redis_client = redis.from_url(
                self.redis_url,
                encoding="utf-8",
                decode_responses=True,
                socket_connect_timeout=5,
                socket_timeout=5,
                retry_on_timeout=True
            )
            # Test the connection
            if self.redis_client:
                await self.redis_client.ping()
                logger.info("Redis connection established for rate limiting")
                self.fallback_mode = False
            else:
                raise Exception("Redis client initialization failed")
        except Exception as e:
            logger.warning(f"Redis connection failed, using fallback mode: {e}")
            self.fallback_mode = True
            self.redis_client = None
    
    async def close_redis(self):
        """Close Redis connection"""
        if self.redis_client:
            await self.redis_client.close()
    
    def get_user_role_from_token(self, token: Optional[str]) -> Tuple[Optional[str], str]:
        """Extract user ID and role from JWT token"""
        try:
            if not token:
                return None, "anonymous"
            
            # Remove 'Bearer ' prefix if present
            if token.startswith("Bearer "):
                token = token[7:]
            
            decoded = jwt.decode(token, options={"verify_signature": False})
            user_id = decoded.get('sub')
            
            # Role is stored in user metadata or custom claims
            user_role = decoded.get('user_metadata', {}).get('role', 'athlete')
            
            return user_id, user_role or "anonymous"
        except Exception as e:
            logger.warning(f"Failed to decode token for rate limiting: {e}")
            return None, "anonymous"
    
    async def check_rate_limit(self, user_id: Optional[str], user_role: str, endpoint: str) -> Tuple[bool, Dict[str, int]]:
        """
        Check if request should be rate limited
        Returns (is_allowed, rate_limit_info)
        """
        # Get rate limit for user role
        rate_limit = self.config.ROLE_LIMITS.get(user_role, self.config.ROLE_LIMITS["anonymous"])
        burst_limit = self.config.BURST_ALLOWANCE.get(user_role, self.config.BURST_ALLOWANCE["anonymous"])
        
        # Create unique key for user/endpoint combination
        key_suffix = f"{user_id or 'anonymous'}:{user_role}:{endpoint}"
        rate_key = f"{self.config.KEY_PREFIX}:rate:{key_suffix}"
        burst_key = f"{self.config.KEY_PREFIX}:burst:{key_suffix}"
        
        current_time = int(time.time())
        window_start = current_time - (current_time % self.config.WINDOW_SIZE)
        
        if self.fallback_mode or not self.redis_client:
            # Fallback mode: allow all requests but log warnings
            logger.warning("Rate limiting in fallback mode - allowing all requests")
            return True, {
                "limit": rate_limit,
                "remaining": rate_limit,
                "reset": window_start + self.config.WINDOW_SIZE,
                "retry_after": 0
            }
        
        try:
            # Use Redis pipeline for atomic operations
            async with self.redis_client.pipeline() as pipe:
                # Get current counts
                await pipe.get(rate_key)
                await pipe.get(burst_key)
                results = await pipe.execute()
                
                current_count = int(results[0] or 0)
                burst_count = int(results[1] or 0)
            
            # Check if within rate limit (including burst allowance)
            total_allowed = rate_limit + burst_limit
            
            if current_count >= total_allowed:
                # Rate limit exceeded
                retry_after = window_start + self.config.WINDOW_SIZE - current_time
                return False, {
                    "limit": rate_limit,
                    "remaining": 0,
                    "reset": window_start + self.config.WINDOW_SIZE,
                    "retry_after": retry_after
                }
            
            # Increment counters
            async with self.redis_client.pipeline() as pipe:
                await pipe.incr(rate_key)
                await pipe.expire(rate_key, self.config.WINDOW_SIZE)
                
                # Track burst usage if over normal rate limit
                if current_count >= rate_limit:
                    await pipe.incr(burst_key)
                    await pipe.expire(burst_key, self.config.WINDOW_SIZE)
                
                await pipe.execute()
            
            remaining = max(0, total_allowed - current_count - 1)
            
            return True, {
                "limit": rate_limit,
                "remaining": remaining,
                "reset": window_start + self.config.WINDOW_SIZE,
                "retry_after": 0
            }
            
        except Exception as e:
            logger.error(f"Redis operation failed in rate limiting: {e}")
            # On Redis error, allow request but log warning
            return True, {
                "limit": rate_limit,
                "remaining": rate_limit,
                "reset": window_start + self.config.WINDOW_SIZE,
                "retry_after": 0
            }
    
    async def __call__(self, request: Request, call_next):
        """Middleware function to be used with FastAPI"""
        # Skip rate limiting for health checks and internal endpoints
        if request.url.path in ["/health", "/metrics", "/docs", "/redoc", "/openapi.json"]:
            return await call_next(request)
        
        # Get authorization token
        auth_header = request.headers.get("Authorization")
        user_id, user_role = self.get_user_role_from_token(auth_header)
        
        # Get endpoint path for rate limiting
        endpoint = request.url.path
        
        # Check rate limit
        is_allowed, rate_info = await self.check_rate_limit(user_id, user_role, endpoint)
        
        if not is_allowed:
            logger.warning(f"Rate limit exceeded for user {user_id} ({user_role}) on {endpoint}")
            raise RateLimitError(
                detail=f"Rate limit exceeded. Try again in {rate_info['retry_after']} seconds.",
                retry_after=rate_info["retry_after"]
            )
        
        # Process the request
        response = await call_next(request)
        
        # Add rate limit headers to response
        if isinstance(response, (Response, JSONResponse)):
            response.headers["X-RateLimit-Limit"] = str(rate_info["limit"])
            response.headers["X-RateLimit-Remaining"] = str(rate_info["remaining"])
            response.headers["X-RateLimit-Reset"] = str(rate_info["reset"])
            response.headers["X-RateLimit-Window"] = str(self.config.WINDOW_SIZE)
        
        return response

# Global rate limiter instance
rate_limiter: Optional[RateLimitMiddleware] = None

async def get_rate_limiter() -> RateLimitMiddleware:
    """Dependency to get rate limiter instance"""
    global rate_limiter
    if rate_limiter is None:
        rate_limiter = RateLimitMiddleware()
        await rate_limiter.init_redis()
    return rate_limiter

@asynccontextmanager
async def lifespan_rate_limiter():
    """Context manager for rate limiter lifecycle"""
    global rate_limiter
    rate_limiter = RateLimitMiddleware()
    await rate_limiter.init_redis()
    try:
        yield rate_limiter
    finally:
        if rate_limiter:
            await rate_limiter.close_redis() 