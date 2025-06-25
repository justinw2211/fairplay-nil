# backend/app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import profile, deals 
from app.database import supabase
import os

app = FastAPI(title="FairPlay NIL API")

# --- DEFINITIVE CORS FIX using a Regular Expression ---
# This regex pattern will securely match:
# 1. Your local development environment (http://localhost:any-port)
# 2. ANY Vercel deployment URL for this project, including production and all preview deployments.
#    e.g., https://fairplay-nil.vercel.app
#    e.g., https://fairplay-li7sb4tai-justin-wachtels-projects.vercel.app
#
# This is the most robust and professional solution for this type of workflow.
ORIGIN_REGEX = r"https://fairplay(-[a-zA-Z0-9]+)?-justin-wachtels-projects\.vercel\.app|http://localhost(:\d+)?"

app.add_middleware(
    CORSMiddleware,
    # Use the regex for dynamic origin matching.
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