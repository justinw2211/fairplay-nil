# backend/app/api/profile.py
from fastapi import APIRouter, Depends, HTTPException
from app.dependencies import get_user_id
from app.database import supabase
from app.schemas import ProfileUpdate, ProfileResponse

router = APIRouter()

@router.get("/profile", response_model=ProfileResponse)
async def get_profile(user_id: str = Depends(get_user_id)):
    data = supabase.from_("profiles").select("*").eq("id", user_id).single().execute()
    if not data.data:
        raise HTTPException(status_code=404, detail="Profile not found")
    return data.data

@router.put("/profile", response_model=ProfileResponse)
async def update_profile(profile_data: ProfileUpdate, user_id: str = Depends(get_user_id)):
    update_data = profile_data.dict(exclude_unset=True)
    data = supabase.from_("profiles").update(update_data).eq("id", user_id).execute()
    if not data.data:
        raise HTTPException(status_code=404, detail="Profile not found or update failed")
    
    updated_profile = supabase.from_("profiles").select("*").eq("id", user_id).single().execute()
    return updated_profile.data