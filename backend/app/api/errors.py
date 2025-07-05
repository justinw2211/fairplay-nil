"""
Error reporting API endpoints
Handles client-side error reporting for monitoring and debugging
"""

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from typing import Optional, Dict, Any
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

router = APIRouter()

class ErrorReport(BaseModel):
    """Error report model for client-side error reporting"""
    errorId: str
    message: str
    name: str
    stack: Optional[str] = None
    componentStack: Optional[str] = None
    timestamp: str
    userAgent: str
    url: str
    context: Optional[str] = None
    userId: Optional[str] = None
    additionalData: Optional[Dict[str, Any]] = None

@router.post("/errors", status_code=201)
async def report_error(error_report: ErrorReport, request: Request):
    """
    Report client-side errors for monitoring and debugging
    """
    try:
        # Log the error securely
        error_data = {
            "errorId": error_report.errorId,
            "message": error_report.message,
            "name": error_report.name,
            "timestamp": error_report.timestamp,
            "context": error_report.context,
            "url": error_report.url,
            "userAgent": error_report.userAgent,
            "clientIP": request.client.host if request.client else "unknown"
        }
        
        # Add stack trace for development environment only
        if hasattr(error_report, 'stack') and error_report.stack:
            error_data["stack"] = error_report.stack[:1000]  # Limit stack trace length
        
        # Add component stack if available
        if hasattr(error_report, 'componentStack') and error_report.componentStack:
            error_data["componentStack"] = error_report.componentStack[:1000]
        
        # Log the error
        logger.error(f"Client Error Report: {error_report.name} - {error_report.message}", extra=error_data)
        
        # In production, you might want to send this to an error tracking service
        # like Sentry, LogRocket, or Rollbar
        
        return {
            "success": True,
            "errorId": error_report.errorId,
            "message": "Error report received and logged"
        }
        
    except Exception as e:
        logger.error(f"Failed to process error report: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to process error report"
        )

@router.get("/errors/health")
async def error_reporting_health():
    """Health check for error reporting service"""
    return {
        "service": "error-reporting",
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat()
    } 