# backend/app/dependencies.py
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
# *** BUG FIX: Corrected import path from 'app.db' to 'app.database' ***
from app.database import supabase 
import uuid

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
        
        # If no valid user is returned, the token is invalid.
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        # *** BUG FIX: Return only the user's ID as a UUID object. ***
        return user.id
    except Exception as e:
        # Catch any other exception during token validation.
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid authentication credentials: {e}",
            headers={"WWW-Authenticate": "Bearer"},
        )