# app/api/auth.py
from fastapi import APIRouter, HTTPException
from gotrue.errors import AuthApiError
from app.db import supabase
from app.schemas import UserCreate, UserLogin # <- The import path is now absolute

router = APIRouter()

@router.post("/signup", tags=["Authentication"])
async def signup(user_data: UserCreate):
    try:
        auth_response = supabase.auth.sign_up({
            "email": user_data.email,
            "password": user_data.password,
        })

        if auth_response.user is None:
            raise HTTPException(status_code=400, detail="Could not create user.")

        user_id = auth_response.user.id

        profile_data = user_data.profile.dict()
        profile_data['id'] = user_id
        
        profile_insert_response = supabase.table('profiles').insert(profile_data).execute()

        if len(profile_insert_response.data) == 0:
            raise HTTPException(status_code=500, detail="Could not create user profile.")

        return {"user_id": user_id, "email": auth_response.user.email}

    except AuthApiError as e:
        raise HTTPException(status_code=400, detail=e.message)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/login", tags=["Authentication"])
async def login(credentials: UserLogin):
    try:
        session = supabase.auth.sign_in_with_password({
            "email": credentials.email,
            "password": credentials.password,
        })
        return session
    except AuthApiError as e:
        raise HTTPException(status_code=401, detail=e.message or "Invalid login credentials.")