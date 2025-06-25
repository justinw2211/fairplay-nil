# backend/app/api/profile.py
from fastapi import APIRouter, Depends, HTTPException
# *** BUG FIX: Changed import from relative to absolute ***
from app.dependencies import get_user_id
from app.database import supabase
from app.schemas import ProfileUpdate, ProfileResponse

router = APIRouter()

@router.get("/api/profile", response_model=ProfileResponse)
async def get_profile(user_id: str = Depends(get_user_id)):
    """
    Fetches the profile for the authenticated user.
    """
    try:
        data, count = await supabase.from_("profiles").select("*").eq("id", user_id).single().execute()
        if not data[1]:
            raise HTTPException(status_code=404, detail="Profile not found")
        return data[1]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/api/profile", response_model=ProfileResponse)
async def update_profile(profile_data: ProfileUpdate, user_id: str = Depends(get_user_id)):
    """
    Updates the profile for the authenticated user.
    """
    try:
        update_data = profile_data.dict(exclude_unset=True)
        data, count = await supabase.from_("profiles").update(update_data).eq("id", user_id).execute()
        if not data[1]:
            raise HTTPException(status_code=404, detail="Profile not found or update failed")
        
        # Fetch the updated profile to return it
        updated_profile, count = await supabase.from_("profiles").select("*").eq("id", user_id).single().execute()
        return updated_profile[1]

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))