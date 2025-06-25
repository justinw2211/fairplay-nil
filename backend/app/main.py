# backend/app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import profile, deals 
from app.database import supabase
import os

app = FastAPI(title="FairPlay NIL API")

# --- DEFINITIVE CORS FIX v3 ---
# We are now using an explicit list of allowed origins instead of a regex
# to ensure maximum compatibility with the deployment environment.
# This list includes your local development server and your production Vercel URL.
allowed_origins = [
    "http://localhost:5173",
    "https://fairplay-nil.vercel.app",
]

# You can add any other specific Vercel preview URLs here if needed, for example:
# "https://fairplay-nil-justin-wachtels-projects.vercel.app"

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins, # Use the explicit list
    allow_credentials=True,
    allow_methods=["*"], # Allow all methods
    allow_headers=["*"], # Allow all headers
)

# Include the API routers
app.include_router(profile.router)
app.include_router(deals.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to the Fair Play NIL API"}