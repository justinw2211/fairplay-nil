# app/api/profile.py
from fastapi import APIRouter, Depends, HTTPException
from app.db import supabase
from app.schemas import ProfileBase
from app.utils import get_current_user # We will create this helper next

router = APIRouter()

@router.get("/profile", response_model=ProfileBase, tags=["Profile"])
async def get_user_profile(user: dict = Depends(get_current_user)):
    """Fetches the profile for the currently authenticated user."""
    user_id = user['id']
    res = supabase.table('profiles').select("*").eq('id', user_id).single().execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Profile not found")
    return res.data

@router.put("/profile", response_model=ProfileBase, tags=["Profile"])
async def update_user_profile(profile_update: ProfileBase, user: dict = Depends(get_current_user)):
    """Updates the profile for the currently authenticated user."""
    user_id = user['id']
    res = supabase.table('profiles').update(profile_update.dict(exclude_unset=True)).eq('id', user_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Profile not found or update failed")
    return res.data[0]