# backend/app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
# *** The "auth" import is now REMOVED ***
from .api import profile, deals 
from .database import supabase
import os

app = FastAPI()

# Configure CORS
origins = [
    "http://localhost:5173",
    os.environ.get("FRONTEND_URL"), # For production Vercel URL
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin for origin in origins if origin],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include the routers
# *** The "auth.router" is now REMOVED ***
app.include_router(profile.router)
app.include_router(deals.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to the Fair Play NIL API"}