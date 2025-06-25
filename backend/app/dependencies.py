# backend/app/dependencies.py
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from app.database import supabase 
import uuid
import logging # Import the logging library

# This scheme expects the token to be sent in the Authorization header.
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

async def get_user_id(token: str = Depends(oauth2_scheme)) -> uuid.UUID:
    """
    Dependency to get the current user's UUID from a Supabase session token.
    This is used to protect all sensitive endpoints.
    """
    try:
        # Verify the token with Supabase.
        user_response = await supabase.auth.get_user(token)
        user = user_response.user
        
        if not user:
            # This case is when the token is validly formed but not recognized by Supabase
            logging.error("Authentication failed: Supabase returned no user for the provided token.")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        return user.id
    except Exception as e:
        # *** ENHANCED LOGGING: This will print the specific error from Supabase to your Render logs. ***
        logging.error(f"An exception occurred during token validation: {e}")
        # This case catches all other errors during the get_user call
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid authentication credentials: {e}",
            headers={"WWW-Authenticate": "Bearer"},
        )