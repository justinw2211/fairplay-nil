# backend/app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import profile, deals 
from app.database import supabase
import os

app = FastAPI(title="FairPlay NIL API")

# The robust CORS policy remains the same.
ORIGIN_REGEX = r"https://fairplay-nil.*\.vercel\.app|http://localhost(:\d+)?"

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=ORIGIN_REGEX,
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"], 
)

# *** BUG FIX: Re-introduce the '/api' prefix for all included routers. ***
# This makes the routing structure clean and unambiguous.
app.include_router(profile.router, prefix="/api")
app.include_router(deals.router, prefix="/api")

@app.get("/")
def read_root():
    return {"message": "Welcome to the Fair Play NIL API"}