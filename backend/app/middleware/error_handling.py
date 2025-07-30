"""
Error handling middleware for FairPlay NIL backend
Provides centralized error handling to prevent API crashes and improve debugging
"""

import logging
import traceback
import re
from typing import Optional, Dict, Any
from fastapi import HTTPException, Request, Response
from fastapi.responses import JSONResponse
import os
from datetime import datetime

logger = logging.getLogger(__name__)

class ErrorHandlingConfig:
    """Error handling configuration and settings"""
    
    # Sensitive data patterns to filter from error logs
    SENSITIVE_PATTERNS = [
        r'password',
        r'token',
        r'key',
        r'secret',
        r'auth',
        r'session',
        r'bearer',
        r'jwt',
        r'phone',
        r'email',
        r'compensation',
        r'payment',
        r'financial'
    ]
    
    # Maximum stack trace length to log
    MAX_STACK_LENGTH = 1000
    
    # Error response template
    ERROR_RESPONSE_TEMPLATE = {
        "error": "Internal server error",
        "detail": "An unexpected error occurred. Please try again later.",
        "timestamp": None,
        "error_id": None
    }

class ErrorHandlingMiddleware:
    """Centralized error handling middleware for FastAPI"""
    
    def __init__(self):
        self.config = ErrorHandlingConfig()
        
    def sanitize_error_message(self, error_message: str) -> str:
        """Remove sensitive information from error messages"""
        sanitized = error_message
        
        for pattern in self.config.SENSITIVE_PATTERNS:
            sanitized = re.sub(pattern, '[REDACTED]', sanitized, flags=re.IGNORECASE)
        
        return sanitized
    
    def sanitize_stack_trace(self, stack_trace: str) -> str:
        """Remove sensitive information from stack traces"""
        if not stack_trace:
            return ""
        
        # Limit stack trace length
        if len(stack_trace) > self.config.MAX_STACK_LENGTH:
            stack_trace = stack_trace[:self.config.MAX_STACK_LENGTH] + "..."
        
        # Sanitize sensitive data
        sanitized = self.sanitize_error_message(stack_trace)
        
        return sanitized
    
    def create_error_response(self, error: Exception, error_id: str) -> JSONResponse:
        """Create standardized error response"""
        error_response = self.config.ERROR_RESPONSE_TEMPLATE.copy()
        error_response["timestamp"] = datetime.utcnow().isoformat()
        error_response["error_id"] = error_id
        
        # In development, include more details
        if os.getenv("ENVIRONMENT", "production") == "development":
            error_response["detail"] = str(error)
            error_response["type"] = type(error).__name__
        
        return JSONResponse(
            status_code=500,
            content=error_response
        )
    
    def log_error_securely(self, error: Exception, request: Request, error_id: str):
        """Log error securely without exposing sensitive data"""
        try:
            # Extract request information
            request_info = {
                "method": request.method,
                "url": str(request.url),
                "path": request.url.path,
                "client_ip": request.client.host if request.client else "unknown",
                "user_agent": request.headers.get("user-agent", "unknown")
            }
            
            # Sanitize error information
            error_message = self.sanitize_error_message(str(error))
            error_type = type(error).__name__
            stack_trace = self.sanitize_stack_trace("".join(traceback.format_exc()))
            
            # Create error log entry
            error_log = {
                "error_id": error_id,
                "error_type": error_type,
                "error_message": error_message,
                "timestamp": datetime.utcnow().isoformat(),
                "request_info": request_info,
                "stack_trace": stack_trace
            }
            
            # Log the error
            logger.error(
                f"Unhandled exception caught by middleware: {error_type} - {error_message}",
                extra=error_log
            )
            
        except Exception as log_error:
            # Fallback logging if error logging fails
            logger.error(f"Failed to log error securely: {log_error}")
            logger.error(f"Original error: {error}")
    
    async def __call__(self, request: Request, call_next):
        """Middleware function to handle unhandled exceptions"""
        try:
            # Process the request normally
            response = await call_next(request)
            return response
            
        except HTTPException:
            # Re-raise HTTPExceptions as they are intentional
            raise
            
        except Exception as error:
            # Generate unique error ID for tracking
            error_id = f"error_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}_{id(error)}"
            
            # Log the error securely
            self.log_error_securely(error, request, error_id)
            
            # Return standardized error response
            return self.create_error_response(error, error_id)

# Global error handler instance
error_handler: Optional[ErrorHandlingMiddleware] = None

async def get_error_handler() -> ErrorHandlingMiddleware:
    """Dependency to get error handler instance"""
    global error_handler
    if error_handler is None:
        error_handler = ErrorHandlingMiddleware()
    return error_handler 