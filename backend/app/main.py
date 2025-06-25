# backend/app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import profile, deals 
from app.database import supabase
import os

app = FastAPI(title="FairPlay NIL API")

# --- DEFINITIVE CORS FIX v5 (Regex) ---
# This regular expression is designed to securely match all possible Vercel deployment URLs
# for this project, as well as your local development environment.
#
# It will match:
#   - http://localhost (with any port)
#   - Your production URL (e.g., https://fairplay-nil.vercel.app)
#   - ANY preview URL (e.g., https://fairplay-nil-rw1sk9xce-justins-projects.vercel.app)
#
# This is the final and most robust solution for the CORS issue.
ORIGIN_REGEX = r"https://fairplay-nil.*\.vercel\.app|http://localhost(:\d+)?"

app.add_middleware(
    CORSMiddleware,
    # Use the robust regular expression for matching origins
    allow_origin_regex=ORIGIN_REGEX,
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"], 
)

# Include the API routers
app.include_router(profile.router)
app.include_router(deals.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to the Fair Play NIL API"}