# backend/app/dependencies.py
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from app.database import supabase 
import uuid
import logging

# Setup basic logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# This scheme expects the token to be sent in the Authorization header.
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

async def get_user_id(token: str = Depends(oauth2_scheme)) -> uuid.UUID:
    """
    Dependency to get the current user's UUID from a Supabase session token.
    """
    try:
        # *** BUG FIX: Removed 'await' from the get_user call ***
        # The supabase-py library's get_user method is now synchronous
        # in this version and returns an awaitable object directly.
        user_response = supabase.auth.get_user(token)
        user = user_response.user
        
        if not user:
            logger.error("Authentication failed: Supabase returned no user for the provided token.")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        return user.id
    except Exception as e:
        logger.error(f"An exception occurred during token validation: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid authentication credentials: {e}",
            headers={"WWW-Authenticate": "Bearer"},
        )