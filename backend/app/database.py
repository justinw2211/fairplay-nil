# backend/app/database.py
import os
from typing import Optional, Dict, Any
from supabase import create_client, Client
from functools import lru_cache
import logging
from contextlib import contextmanager

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

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

    def _initialize_client(self):
        """Initialize the Supabase client with proper error handling."""
        url = os.environ.get("SUPABASE_URL")
        key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

        if not url:
            raise ValueError("FATAL: SUPABASE_URL environment variable is not set.")
        if not key:
            raise ValueError("FATAL: SUPABASE_SERVICE_ROLE_KEY environment variable is not set.")

        try:
            self._client = create_client(url, key)
            logger.info("Successfully initialized Supabase client")
        except Exception as e:
            logger.error(f"Failed to initialize Supabase client: {str(e)}")
            raise

    @property
    def client(self) -> Client:
        """Get the Supabase client instance."""
        if self._client is None:
            self._initialize_client()
        return self._client

    @lru_cache(maxsize=100)
    def get_profile(self, user_id: str) -> Dict[str, Any]:
        """Get a user profile with caching."""
        try:
            response = self.client.table('profiles').select("*").eq('id', user_id).execute()
            data = response.data
            return data[0] if data else {}
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

# Create a singleton instance
db = DatabaseClient()
# Export the client for backward compatibility
supabase: Client = db.client