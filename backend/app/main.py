# app/main.py
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from app.api import auth, profile, deals

app = FastAPI(title="FairPlay NIL API")

# --- THIS IS THE DEFINITIVE FIX for CORS ---

# This regular expression pattern will match all of your required frontend origins.
# It allows:
#   1. http://localhost or https://localhost (with any port number)
#   2. Your Vercel deployments (both preview and production)
#      e.g., https://fairplay-fhlf8vkmv-justin-wachtels-projects.vercel.app
#      e.g., https://fairplay-justin-wachtels-projects.vercel.app (if that's your production name)
#
# Note: The `(-[a-z0-9]+)?` part cleverly matches the optional preview hash from Vercel.
ORIGIN_REGEX = r"https?://localhost(:\d+)?|https://fairplay(-[a-z0-9]+)?-justin-wachtels-projects\.vercel\.app"


# Add the CORS middleware to your application using the regex pattern
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=ORIGIN_REGEX,  # Use the regex for dynamic origin matching
    allow_credentials=True,           # Essential for sending auth tokens
    allow_methods=["*"],              # Allow all HTTP methods
    allow_headers=["*"],              # Allow all headers
)
# --- END OF FIX ---


# --- API Routers ---
app.include_router(auth.router, prefix="/api")
app.include_router(profile.router, prefix="/api")
app.include_router(deals.router, prefix="/api")

# --- Legacy FMV Calculator Endpoint ---
@app.post("/api/fmv/calculate", tags=["Legacy Calculator"])
async def calculate_fmv(request: Request):
    body = await request.json()
    base_rate = 100
    
    social_score = (
        (body.get("followers_instagram") or 0) +
        (body.get("followers_tiktok") or 0) +
        (body.get("followers_twitter") or 0) +
        (body.get("followers_youtube") or 0)
    ) * 0.1
    
    deliverable_count = len(body.get("deliverables", []))
    deliverable_score = deliverable_count * 50
    
    fmv = base_rate + social_score + deliverable_score
    return {"fmv": round(fmv, 2)}

@app.get("/", tags=["Root"])
async def root():
    return {"message": "Welcome to the FairPlay NIL API"}