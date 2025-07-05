# backend/app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import profile, deals, errors 
from app.database import supabase
from app.middleware.rate_limiting import RateLimitMiddleware
from contextlib import asynccontextmanager
import os
import logging

# Setup basic logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Global rate limiter instance
rate_limiter = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Handle application lifespan with rate limiter setup"""
    global rate_limiter
    logger.info("--- Application Starting Up ---")
    
    # Initialize rate limiter
    rate_limiter = RateLimitMiddleware()
    await rate_limiter.init_redis()
    
    logger.info(f"CORS allow_origin_regex configured: {ORIGIN_REGEX}")
    logger.info("--- Application Startup Complete ---")
    
    yield
    
    # Cleanup
    if rate_limiter:
        await rate_limiter.close_redis()
    logger.info("--- Application Shutdown Complete ---")

app = FastAPI(title="FairPlay NIL API", lifespan=lifespan)

# --- DEFINITIVE CORS FIX v8 ---
# This regular expression matches:
#
# 1. http://localhost (with any port for local development)
# 2. Your production URL (e.g., https://fairplay-nil.vercel.app)
# 3. ANY preview URL patterns:
#    - https://fairplay-*-justin-wachtels-projects.vercel.app
#    - https://fairplay-nil-git-*-justin-wachtels-projects.vercel.app
#    - https://fairplay-nil.vercel.app
#
ORIGIN_REGEX = r"https://fairplay-[^.]*\.vercel\.app|https://fairplay-nil-git-[^.]*-justin-wachtels-projects\.vercel\.app|https://fairplay-[^.]*-justin-wachtels-projects\.vercel\.app|http://localhost(:\d+)?"

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=ORIGIN_REGEX,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Token-Expired", "WWW-Authenticate", "X-RateLimit-Limit", "X-RateLimit-Remaining", "X-RateLimit-Reset", "X-RateLimit-Window"]
)

# Add rate limiting middleware
@app.middleware("http")
async def rate_limit_middleware(request, call_next):
    """Rate limiting middleware wrapper"""
    global rate_limiter
    if rate_limiter:
        return await rate_limiter(request, call_next)
    else:
        return await call_next(request)

# This routing setup is correct and follows FastAPI best practices.
app.include_router(profile.router, prefix="/api")
app.include_router(deals.router, prefix="/api")
app.include_router(errors.router, prefix="/api")

@app.get("/")
def read_root():
    return {"message": "Welcome to the Fair Play NIL API"}

@app.get("/health")
def health_check():
    """Health check endpoint for monitoring"""
    return {"status": "healthy", "service": "fairplay-nil-api"}