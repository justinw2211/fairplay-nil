# backend/app/dependencies.py
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer
from app.database import supabase
import uuid
import logging
import jwt
from datetime import datetime
import os
from typing import Optional

# Setup basic logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# This scheme expects the token to be sent in the Authorization header.
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Redis configuration
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")

async def get_user_id(request: Request, token: str = Depends(oauth2_scheme)) -> str:
    """
    Dependency to get the current user's UUID from a Supabase session token.
    Handles token refresh when needed.
    """
    try:
        # Decode the JWT token to get the user ID and expiration
        decoded = jwt.decode(token, options={"verify_signature": False})
        user_id = decoded.get('sub')
        exp = decoded.get('exp')
        
        # Check if token is expired or about to expire (within 5 minutes)
        now = datetime.utcnow().timestamp()
        if exp and (exp - now < 300):  # 300 seconds = 5 minutes
            logger.info("Token is expired or about to expire, returning 401 to trigger refresh")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token expired",
                headers={
                    "WWW-Authenticate": "Bearer",
                    "X-Token-Expired": "true"
                },
            )
        
        if not user_id:
            logger.error("Authentication failed: No user ID in token")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        return user_id
    except jwt.ExpiredSignatureError:
        logger.warning("Token has expired")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={
                "WWW-Authenticate": "Bearer",
                "X-Token-Expired": "true"
            },
        )
    except jwt.InvalidTokenError as e:
        logger.error(f"Invalid token: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token format",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except Exception as e:
        logger.error(f"An exception occurred during token validation: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid authentication credentials: {e}",
            headers={"WWW-Authenticate": "Bearer"},
        )

async def get_user_role(request: Request, token: str = Depends(oauth2_scheme)) -> str:
    """
    Dependency to get the current user's role from a Supabase session token.
    """
    try:
        decoded = jwt.decode(token, options={"verify_signature": False})
        user_metadata = decoded.get('user_metadata', {})
        user_role = user_metadata.get('role', 'athlete')
        return user_role
    except Exception as e:
        logger.warning(f"Failed to get user role: {e}")
        return "athlete"  # Default role