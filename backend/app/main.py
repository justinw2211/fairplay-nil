# backend/app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import profile, deals 
from app.database import supabase
import os
import logging

# Setup basic logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="FairPlay NIL API")

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

@app.on_event("startup")
async def startup_event():
    """
    This function runs when the application starts up to log critical config.
    """
    logger.info("--- Application Starting Up ---")
    logger.info(f"CORS allow_origin_regex configured: {ORIGIN_REGEX}")
    logger.info("--- Application Startup Complete ---")

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=ORIGIN_REGEX,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Token-Expired", "WWW-Authenticate"]
)

# This routing setup is correct and follows FastAPI best practices.
app.include_router(profile.router, prefix="/api")
app.include_router(deals.router, prefix="/api")

@app.get("/")
def read_root():
    return {"message": "Welcome to the Fair Play NIL API"}