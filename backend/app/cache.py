"""
Caching system for FairPlay NIL backend
Provides Redis-based caching for static data and query optimization
"""

import json
import pickle
import hashlib
from typing import Any, Dict, List, Optional, Union, Callable
from datetime import datetime, timedelta
import redis.asyncio as redis
import asyncio
import logging
from functools import wraps
import os

logger = logging.getLogger(__name__)

class CacheConfig:
    """Cache configuration and TTL settings"""
    
    # Cache TTL settings (in seconds)
    TTL_SCHOOLS = 3600 * 24 * 7  # 1 week (schools rarely change)
    TTL_SPORTS = 3600 * 24 * 7   # 1 week (sports list is static)
    TTL_PROFILES = 3600 * 6      # 6 hours (profiles change moderately)
    TTL_DEALS = 3600 * 2         # 2 hours (deals change frequently)
    TTL_SOCIAL_MEDIA = 3600 * 4  # 4 hours (social media changes moderately)
    TTL_QUERY_CACHE = 3600       # 1 hour (query results)
    
    # Cache key prefixes
    SCHOOLS_KEY = "fairplay_cache:schools"
    SPORTS_KEY = "fairplay_cache:sports"
    PROFILE_KEY = "fairplay_cache:profile"
    DEALS_KEY = "fairplay_cache:deals"
    SOCIAL_MEDIA_KEY = "fairplay_cache:social_media"
    QUERY_KEY = "fairplay_cache:query"
    
    # Cache sizes
    MAX_CACHE_SIZE = 1000  # Maximum items per cache type

class CacheManager:
    """Redis-based cache manager with automatic invalidation and performance monitoring"""
    
    def __init__(self, redis_url: Optional[str] = None):
        self.redis_url = redis_url or os.getenv("REDIS_URL", "redis://localhost:6379")
        self.redis_client: Optional[redis.Redis] = None
        self.config = CacheConfig()
        self.fallback_mode = False
        self._stats = {
            "hits": 0,
            "misses": 0,
            "errors": 0,
            "cache_operations": 0
        }
        
    async def init_redis(self):
        """Initialize Redis connection for caching"""
        try:
            self.redis_client = redis.from_url(
                self.redis_url,
                encoding="utf-8",
                decode_responses=False,  # We'll handle encoding ourselves
                socket_connect_timeout=5,
                socket_timeout=5,
                retry_on_timeout=True,
                max_connections=20  # Connection pooling
            )
            # Test the connection
            await self.redis_client.ping()
            logger.info("Cache system initialized with Redis")
            self.fallback_mode = False
        except Exception as e:
            logger.warning(f"Redis cache unavailable, using fallback mode: {e}")
            self.fallback_mode = True
            self.redis_client = None
    
    async def close_redis(self):
        """Close Redis connection"""
        if self.redis_client:
            await self.redis_client.close()
    
    def _serialize_data(self, data: Any) -> bytes:
        """Serialize data for Redis storage"""
        try:
            # Try JSON first for simple data types
            if isinstance(data, (dict, list, str, int, float, bool)) or data is None:
                return json.dumps(data, default=str).encode('utf-8')
            else:
                # Fall back to pickle for complex objects
                return pickle.dumps(data)
        except Exception as e:
            logger.warning(f"Serialization failed: {e}")
            return pickle.dumps(data)
    
    def _deserialize_data(self, data: bytes) -> Any:
        """Deserialize data from Redis storage"""
        try:
            # Try JSON first
            return json.loads(data.decode('utf-8'))
        except (json.JSONDecodeError, UnicodeDecodeError):
            try:
                # Fall back to pickle
                return pickle.loads(data)
            except Exception as e:
                logger.error(f"Deserialization failed: {e}")
                return None
    
    def _generate_cache_key(self, key_type: str, identifier: str) -> str:
        """Generate a consistent cache key"""
        base_key = getattr(self.config, f"{key_type.upper()}_KEY", f"fairplay_cache:{key_type}")
        if identifier:
            # Hash long identifiers to prevent key length issues
            if len(identifier) > 100:
                identifier = hashlib.md5(identifier.encode()).hexdigest()
            return f"{base_key}:{identifier}"
        return base_key
    
    async def get(self, key_type: str, identifier: str = "") -> Optional[Any]:
        """Get data from cache"""
        if self.fallback_mode or not self.redis_client:
            self._stats["misses"] += 1
            return None
        
        try:
            cache_key = self._generate_cache_key(key_type, identifier)
            cached_data = await self.redis_client.get(cache_key)
            
            if cached_data:
                self._stats["hits"] += 1
                return self._deserialize_data(cached_data)
            else:
                self._stats["misses"] += 1
                return None
                
        except Exception as e:
            logger.error(f"Cache get error: {e}")
            self._stats["errors"] += 1
            return None
    
    async def set(self, key_type: str, data: Any, identifier: str = "", ttl: Optional[int] = None) -> bool:
        """Set data in cache with TTL"""
        if self.fallback_mode or not self.redis_client:
            return False
        
        try:
            cache_key = self._generate_cache_key(key_type, identifier)
            serialized_data = self._serialize_data(data)
            
            # Get TTL from config if not provided
            if ttl is None:
                ttl = getattr(self.config, f"TTL_{key_type.upper()}", 3600)
            
            await self.redis_client.setex(cache_key, ttl, serialized_data)
            self._stats["cache_operations"] += 1
            return True
            
        except Exception as e:
            logger.error(f"Cache set error: {e}")
            self._stats["errors"] += 1
            return False
    
    async def delete(self, key_type: str, identifier: str = "") -> bool:
        """Delete data from cache"""
        if self.fallback_mode or not self.redis_client:
            return False
        
        try:
            cache_key = self._generate_cache_key(key_type, identifier)
            result = await self.redis_client.delete(cache_key)
            self._stats["cache_operations"] += 1
            return result > 0
            
        except Exception as e:
            logger.error(f"Cache delete error: {e}")
            self._stats["errors"] += 1
            return False
    
    async def invalidate_pattern(self, pattern: str) -> int:
        """Invalidate all keys matching a pattern"""
        if self.fallback_mode or not self.redis_client:
            return 0
        
        try:
            # Find keys matching pattern
            keys = []
            async for key in self.redis_client.scan_iter(match=pattern):
                keys.append(key)
            
            if keys:
                deleted = await self.redis_client.delete(*keys)
                self._stats["cache_operations"] += 1
                logger.info(f"Invalidated {deleted} cache entries matching pattern: {pattern}")
                return deleted
            return 0
            
        except Exception as e:
            logger.error(f"Cache pattern invalidation error: {e}")
            self._stats["errors"] += 1
            return 0
    
    async def get_cache_stats(self) -> Dict[str, Any]:
        """Get cache performance statistics"""
        total_requests = self._stats["hits"] + self._stats["misses"]
        hit_rate = (self._stats["hits"] / total_requests * 100) if total_requests > 0 else 0
        
        redis_info = {}
        if not self.fallback_mode and self.redis_client:
            try:
                redis_info = await self.redis_client.info()
            except Exception as e:
                logger.warning(f"Failed to get Redis info: {e}")
        
        return {
            "hit_rate": round(hit_rate, 2),
            "total_hits": self._stats["hits"],
            "total_misses": self._stats["misses"],
            "total_errors": self._stats["errors"],
            "cache_operations": self._stats["cache_operations"],
            "fallback_mode": self.fallback_mode,
            "redis_connected": not self.fallback_mode,
            "redis_info": {
                "used_memory_human": redis_info.get("used_memory_human", "N/A"),
                "connected_clients": redis_info.get("connected_clients", "N/A"),
                "keyspace_hits": redis_info.get("keyspace_hits", "N/A"),
                "keyspace_misses": redis_info.get("keyspace_misses", "N/A")
            }
        }
    
    # Convenience methods for specific data types
    async def get_schools(self, division: Optional[str] = None) -> Optional[List[Dict]]:
        """Get cached schools data"""
        cache_key = f"all" if not division else f"division_{division}"
        return await self.get("schools", cache_key)
    
    async def set_schools(self, schools: List[Dict], division: Optional[str] = None) -> bool:
        """Cache schools data"""
        cache_key = f"all" if not division else f"division_{division}"
        return await self.set("schools", schools, cache_key)
    
    async def get_profile(self, user_id: str) -> Optional[Dict]:
        """Get cached profile data"""
        return await self.get("profile", user_id)
    
    async def set_profile(self, profile: Dict, user_id: str) -> bool:
        """Cache profile data"""
        return await self.set("profile", profile, user_id)
    
    async def invalidate_user_cache(self, user_id: str):
        """Invalidate all cache entries for a specific user"""
        patterns = [
            f"fairplay_cache:profile:{user_id}",
            f"fairplay_cache:deals:{user_id}*",
            f"fairplay_cache:social_media:{user_id}*"
        ]
        
        total_invalidated = 0
        for pattern in patterns:
            total_invalidated += await self.invalidate_pattern(pattern)
        
        logger.info(f"Invalidated {total_invalidated} cache entries for user {user_id}")
        return total_invalidated

# Cache decorator for functions
def cached(key_type: str, ttl: Optional[int] = None, key_generator: Optional[Callable] = None):
    """Decorator to cache function results"""
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Generate cache key
            if key_generator:
                cache_key = key_generator(*args, **kwargs)
            else:
                # Default key generation based on function name and args
                func_name = func.__name__
                args_str = "_".join(str(arg) for arg in args)
                kwargs_str = "_".join(f"{k}_{v}" for k, v in sorted(kwargs.items()))
                cache_key = f"{func_name}_{args_str}_{kwargs_str}"
            
            # Try to get from cache
            cached_result = await cache_manager.get(key_type, cache_key)
            if cached_result is not None:
                return cached_result
            
            # Execute function and cache result
            result = await func(*args, **kwargs)
            if result is not None:
                await cache_manager.set(key_type, result, cache_key, ttl)
            
            return result
        return wrapper
    return decorator

# Global cache manager instance
cache_manager: Optional[CacheManager] = None

async def get_cache_manager() -> CacheManager:
    """Get the global cache manager instance"""
    global cache_manager
    if cache_manager is None:
        cache_manager = CacheManager()
        await cache_manager.init_redis()
    return cache_manager

async def init_cache_system():
    """Initialize the cache system"""
    global cache_manager
    cache_manager = CacheManager()
    await cache_manager.init_redis()
    return cache_manager

async def cleanup_cache_system():
    """Cleanup the cache system"""
    global cache_manager
    if cache_manager:
        await cache_manager.close_redis()
        cache_manager = None 