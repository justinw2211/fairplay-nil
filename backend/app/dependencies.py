# backend/app/dependencies.py
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from app.database import supabase 
import uuid
import logging
import jwt

# Setup basic logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# This scheme expects the token to be sent in the Authorization header.
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

async def get_user_id(token: str = Depends(oauth2_scheme)) -> str:
    """
    Dependency to get the current user's UUID from a Supabase session token.
    """
    try:
        # Decode the JWT token to get the user ID
        decoded = jwt.decode(token, options={"verify_signature": False})
        user_id = decoded.get('sub')
        
        if not user_id:
            logger.error("Authentication failed: No user ID in token")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        return user_id
    except Exception as e:
        logger.error(f"An exception occurred during token validation: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid authentication credentials: {e}",
            headers={"WWW-Authenticate": "Bearer"},
        )