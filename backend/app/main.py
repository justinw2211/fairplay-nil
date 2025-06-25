# backend/app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import profile, deals 
from app.database import supabase
import os

app = FastAPI(title="FairPlay NIL API")

# --- DEFINITIVE CORS FIX v6 (Final Regex) ---
# This regular expression is simpler and more robust. It is designed to securely match:
#
# 1. http://localhost (with any port for local development)
# 2. Your production URL: https://fairplay-nil.vercel.app
# 3. ANY preview URL that starts with 'https://fairplay-' and ends with '.vercel.app'
#
# This pattern is now flexible enough to handle all of Vercel's generated URLs for your project.
ORIGIN_REGEX = r"https://fairplay-.*\.vercel\.app|http://localhost(:\d+)?"

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=ORIGIN_REGEX,
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"], 
)

# This routing setup is correct and follows FastAPI best practices.
app.include_router(profile.router, prefix="/api")
app.include_router(deals.router, prefix="/api")

@app.get("/")
def read_root():
    return {"message": "Welcome to the Fair Play NIL API"}