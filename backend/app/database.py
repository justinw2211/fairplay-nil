# backend/app/database.py
import os
import time
from typing import Optional, Dict, Any, List, Tuple
from supabase import create_client, Client
import logging
from contextlib import contextmanager
from datetime import datetime
import asyncio

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class QueryPerformanceMonitor:
    """Monitor and log query performance"""
    
    def __init__(self):
        self._query_stats = {}
        self._slow_query_threshold = 1.0  # 1 second
    
    def record_query(self, query_type: str, duration: float, success: bool = True):
        """Record query performance metrics"""
        if query_type not in self._query_stats:
            self._query_stats[query_type] = {
                "total_count": 0,
                "total_duration": 0.0,
                "avg_duration": 0.0,
                "slow_queries": 0,
                "errors": 0
            }
        
        stats = self._query_stats[query_type]
        stats["total_count"] += 1
        
        if success:
            stats["total_duration"] += duration
            stats["avg_duration"] = stats["total_duration"] / stats["total_count"]
            
            if duration > self._slow_query_threshold:
                stats["slow_queries"] += 1
                logger.warning(f"Slow query detected: {query_type} took {duration:.2f}s")
        else:
            stats["errors"] += 1
    
    def get_stats(self) -> Dict[str, Any]:
        """Get query performance statistics"""
        return self._query_stats
    
    def reset_stats(self):
        """Reset query statistics"""
        self._query_stats = {}

class PaginationHelper:
    """Helper class for pagination operations"""
    
    @staticmethod
    def calculate_pagination(page: int, limit: int, total_count: int) -> Dict[str, Any]:
        """Calculate pagination metadata"""
        offset = (page - 1) * limit
        total_pages = (total_count + limit - 1) // limit  # Ceiling division
        has_next = page < total_pages
        has_prev = page > 1
        
        return {
            "current_page": page,
            "total_pages": total_pages,
            "page_size": limit,
            "total_count": total_count,
            "has_next": has_next,
            "has_prev": has_prev,
            "offset": offset
        }
    
    @staticmethod
    def apply_pagination(query, page: int, limit: int):
        """Apply pagination to a Supabase query"""
        offset = (page - 1) * limit
        return query.range(offset, offset + limit - 1)

class DatabaseClient:
    _instance: Optional['DatabaseClient'] = None
    _client: Optional[Client] = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(DatabaseClient, cls).__new__(cls)
        return cls._instance

    def __init__(self):
        if self._client is None:
            self._initialize_client()
        self.performance_monitor = QueryPerformanceMonitor()
        self.cache_manager = None  # Will be initialized later
        
    def _initialize_client(self):
        """Initialize the Supabase client with proper error handling and connection pooling."""
        url = os.environ.get("SUPABASE_URL")
        key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

        if not url:
            raise ValueError("FATAL: SUPABASE_URL environment variable is not set.")
        if not key:
            raise ValueError("FATAL: SUPABASE_SERVICE_ROLE_KEY environment variable is not set.")

        try:
            # Initialize Supabase client with basic configuration
            self._client = create_client(url, key)
            logger.info("Successfully initialized Supabase client")
        except Exception as e:
            logger.error(f"Failed to initialize Supabase client: {str(e)}")
            raise

    def set_cache_manager(self, cache_manager):
        """Set the cache manager for the database client"""
        self.cache_manager = cache_manager

    @property
    def client(self) -> Client:
        """Get the Supabase client instance."""
        if self._client is None:
            self._initialize_client()
        return self._client

    async def execute_with_monitoring(self, query_type: str, query_func, use_cache: bool = False, cache_key: str = None, cache_ttl: int = None):
        """Execute a query with performance monitoring and optional caching"""
        start_time = time.time()
        
        # Try cache first if enabled
        if use_cache and self.cache_manager and cache_key:
            cached_result = await self.cache_manager.get("query", cache_key)
            if cached_result is not None:
                duration = time.time() - start_time
                self.performance_monitor.record_query(f"{query_type}_cached", duration)
                return cached_result
        
        try:
            result = query_func()
            duration = time.time() - start_time
            self.performance_monitor.record_query(query_type, duration, success=True)
            
            # Cache the result if caching is enabled
            if use_cache and self.cache_manager and cache_key and result:
                await self.cache_manager.set("query", result, cache_key, cache_ttl)
            
            return result
            
        except Exception as e:
            duration = time.time() - start_time
            self.performance_monitor.record_query(query_type, duration, success=False)
            logger.error(f"Query failed ({query_type}): {str(e)}")
            raise

    async def get_profile_cached(self, user_id: str) -> Dict[str, Any]:
        """Get a user profile with caching"""
        if self.cache_manager:
            cached_profile = await self.cache_manager.get_profile(user_id)
            if cached_profile:
                return cached_profile
        
        def query_func():
            response = self.client.table('profiles').select("*").eq('id', user_id).execute()
            return response.data[0] if response.data else {}
        
        result = await self.execute_with_monitoring("get_profile", query_func)
        
        # Cache the result
        if result and self.cache_manager:
            await self.cache_manager.set_profile(result, user_id)
        
        return result

    async def get_schools_cached(self, division: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get schools with caching"""
        if self.cache_manager:
            cached_schools = await self.cache_manager.get_schools(division)
            if cached_schools:
                return cached_schools
        
        def query_func():
            query = self.client.table('schools').select("id,name,division").order("name")
            if division:
                query = query.eq("division", division)
            response = query.execute()
            return response.data or []
        
        result = await self.execute_with_monitoring("get_schools", query_func)
        
        # Cache the result
        if result and self.cache_manager:
            await self.cache_manager.set_schools(result, division)
        
        return result

    async def get_deals_paginated(self, user_id: str, page: int = 1, limit: int = 20, 
                                status: Optional[str] = None, sort_by: str = "created_at", 
                                sort_order: str = "desc") -> Dict[str, Any]:
        """Get paginated deals with optimized queries"""
        
        # Build cache key
        cache_key = f"user_{user_id}_page_{page}_limit_{limit}_status_{status or 'all'}_sort_{sort_by}_{sort_order}"
        
        def query_func():
            # First get total count for pagination
            count_query = self.client.table('deals').select("id", count="exact").eq("user_id", user_id)
            if status:
                count_query = count_query.eq("status", status)
            
            count_response = count_query.execute()
            total_count = count_response.count or 0
            
            # Then get paginated data
            select_fields = """id,user_id,status,created_at,deal_nickname,deal_terms_url,
                             deal_terms_file_name,payor_name,contact_name,contact_email,
                             activities,compensation_cash,compensation_goods,is_group_deal"""
            
            data_query = self.client.table('deals').select(select_fields).eq("user_id", user_id)
            
            if status:
                data_query = data_query.eq("status", status)
            
            # Apply sorting
            data_query = data_query.order(sort_by, desc=(sort_order == "desc"))
            
            # Apply pagination
            data_query = PaginationHelper.apply_pagination(data_query, page, limit)
            
            data_response = data_query.execute()
            
            # Calculate pagination metadata
            pagination = PaginationHelper.calculate_pagination(page, limit, total_count)
            
            return {
                "deals": data_response.data or [],
                "pagination": pagination
            }
        
        return await self.execute_with_monitoring(
            "get_deals_paginated", 
            query_func, 
            use_cache=True, 
            cache_key=cache_key, 
            cache_ttl=3600  # 1 hour cache
        )

    async def get_deals_paginated_with_profile(self, user_id: str, page: int = 1, limit: int = 20, 
                                             status: Optional[str] = None, deal_type: Optional[str] = None,
                                             sort_by: str = "created_at", sort_order: str = "desc") -> Dict[str, Any]:
        """Get paginated deals with profile information joined for analytics"""
        
        # Build cache key
        cache_key = f"deals_with_profile:{user_id}:{page}:{limit}:{status}:{deal_type}:{sort_by}:{sort_order}"
        cache_ttl = 60  # 1 minute for deals with profile data
        
        def query_func():
            # First get total count for pagination
            count_query = self.client.table('deals').select("*", count="exact").eq('user_id', user_id)
            if status:
                count_query = count_query.eq('status', status)
            if deal_type:
                count_query = count_query.eq('deal_type', deal_type)
            
            count_response = count_query.execute()
            total_count = count_response.count or 0
            
            # Calculate pagination
            pagination_meta = PaginationHelper.calculate_pagination(page, limit, total_count)
            
            # Get deals with profile data joined - fixed to use 'sports' (plural) and include more profile fields
            deals_query = self.client.table('deals').select(f"""
                id,user_id,status,created_at,deal_nickname,deal_terms_url,deal_terms_file_name,
                deal_terms_file_type,deal_terms_file_size,payor_name,payor_type,contact_name,
                contact_email,contact_phone,activities,obligations,grant_exclusivity,
                uses_school_ip,licenses_nil,compensation_cash,compensation_goods,
                compensation_other,is_group_deal,is_paid_to_llc,athlete_social_media,
                social_media_confirmed,social_media_confirmed_at,deal_type,clearinghouse_prediction,
                valuation_prediction,brand_partner,clearinghouse_result,actual_compensation,
                valuation_range,fmv,
                profiles!deals_user_id_fkey(full_name,university,sports,division,gender,email,phone,role,avatar_url)
            """).eq('user_id', user_id)
            
            # Apply filters
            if status:
                deals_query = deals_query.eq('status', status)
            if deal_type:
                deals_query = deals_query.eq('deal_type', deal_type)
            
            # Apply sorting
            if sort_order == "desc":
                deals_query = deals_query.order(sort_by, desc=True)
            else:
                deals_query = deals_query.order(sort_by)
            
            # Apply pagination
            deals_query = PaginationHelper.apply_pagination(deals_query, page, limit)
            
            deals_response = deals_query.execute()
            deals = deals_response.data or []
            
            # Flatten the profile data into the deal objects and add field mappings for frontend compatibility
            for deal in deals:
                if deal.get('profiles'):
                    profile = deal['profiles']
                    # Map profile data to deal fields
                    deal['university'] = profile.get('university')
                    deal['full_name'] = profile.get('full_name')
                    deal['division'] = profile.get('division')
                    deal['gender'] = profile.get('gender')
                    deal['email'] = profile.get('email')
                    deal['phone'] = profile.get('phone')
                    deal['role'] = profile.get('role')
                    deal['avatar_url'] = profile.get('avatar_url')
                    
                    # Handle sports array (convert to string for frontend compatibility)
                    sports_data = profile.get('sports')
                    if sports_data:
                        if isinstance(sports_data, list):
                            deal['sport'] = ', '.join(sports_data) if sports_data else ''
                            deal['sports'] = sports_data
                        else:
                            # If it's already a string, use it
                            deal['sport'] = sports_data
                            deal['sports'] = [sports_data] if sports_data else []
                    else:
                        deal['sport'] = ''
                        deal['sports'] = []
                    
                    # Add frontend-expected field mappings
                    deal['athlete_name'] = profile.get('full_name', '')
                    deal['school'] = profile.get('university', '')
                    deal['description'] = deal.get('deal_nickname', '')
                    
                    # Remove the nested profiles object to keep the response clean
                    del deal['profiles']
                else:
                    # Provide defaults if no profile data
                    deal['university'] = ''
                    deal['sport'] = ''
                    deal['sports'] = []
                    deal['athlete_name'] = ''
                    deal['school'] = ''
                    deal['description'] = deal.get('deal_nickname', '')
                    deal['full_name'] = ''
                    deal['division'] = ''
                    deal['gender'] = ''
                    deal['email'] = ''
                    deal['phone'] = ''
                    deal['role'] = ''
                    deal['avatar_url'] = ''
            
            return {
                "deals": deals,
                "pagination": pagination_meta
            }
        
        return await self.execute_with_monitoring(
            "get_deals_paginated_with_profile", 
            query_func, 
            use_cache=True, 
            cache_key=cache_key, 
            cache_ttl=cache_ttl
        )

    async def update_profile_with_cache_invalidation(self, user_id: str, update_data: Dict[str, Any]) -> Dict[str, Any]:
        """Update profile and invalidate related cache"""
        def query_func():
            response = self.client.table('profiles').update(update_data).eq("id", user_id).execute()
            if not response.data:
                raise Exception("Profile update failed")
            return response.data[0]
        
        result = await self.execute_with_monitoring("update_profile", query_func)
        
        # Invalidate cache
        if self.cache_manager:
            await self.cache_manager.invalidate_user_cache(user_id)
        
        return result

    async def update_deal_with_cache_invalidation(self, deal_id: int, user_id: str, update_data: Dict[str, Any]) -> Dict[str, Any]:
        """Update deal and invalidate related cache"""
        def query_func():
            response = self.client.table('deals').update(update_data).eq("id", deal_id).eq("user_id", user_id).execute()
            if not response.data:
                raise Exception("Deal update failed")
            return response.data[0]
        
        result = await self.execute_with_monitoring("update_deal", query_func)
        
        # Invalidate user's deal cache
        if self.cache_manager:
            await self.cache_manager.invalidate_pattern(f"fairplay_cache:query:user_{user_id}_*")
        
        return result

    def get_profile(self, user_id: str) -> Dict[str, Any]:
        """Get a user profile (synchronous version for backwards compatibility)."""
        try:
            response = self.client.table('profiles').select("*").eq('id', user_id).execute()
            return response.data[0] if response.data else {}
        except Exception as e:
            logger.error(f"Error fetching profile for user {user_id}: {str(e)}")
            raise

    def from_(self, table: str):
        """Helper method to access tables."""
        return self.client.table(table)

    @contextmanager
    def transaction(self):
        """Context manager for database transactions."""
        try:
            yield self
        except Exception as e:
            logger.error(f"Transaction error: {str(e)}")
            raise

    async def get_performance_stats(self) -> Dict[str, Any]:
        """Get database performance statistics"""
        query_stats = self.performance_monitor.get_stats()
        
        # Add cache stats if available
        cache_stats = {}
        if self.cache_manager:
            cache_stats = await self.cache_manager.get_cache_stats()
        
        return {
            "query_performance": query_stats,
            "cache_performance": cache_stats,
            "timestamp": datetime.utcnow().isoformat()
        }

    async def health_check(self) -> Dict[str, Any]:
        """Perform database health check"""
        start_time = time.time()
        
        try:
            # Test basic connectivity
            response = self.client.table('profiles').select("id").limit(1).execute()
            duration = time.time() - start_time
            
            return {
                "status": "healthy",
                "response_time_ms": round(duration * 1000, 2),
                "timestamp": datetime.utcnow().isoformat()
            }
        except Exception as e:
            duration = time.time() - start_time
            return {
                "status": "unhealthy",
                "error": str(e),
                "response_time_ms": round(duration * 1000, 2),
                "timestamp": datetime.utcnow().isoformat()
            }

# Create a singleton instance
db = DatabaseClient()
# Export the client for backward compatibility
supabase: Client = db.client