# backend/app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
# *** BUG FIX: Changed import from relative (.api) to absolute (app.api) ***
from app.api import profile, deals 
from app.database import supabase
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

# Include the routers using the imported modules
app.include_router(profile.router)
app.include_router(deals.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to the Fair Play NIL API"}