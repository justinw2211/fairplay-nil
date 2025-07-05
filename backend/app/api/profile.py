# backend/app/api/profile.py
from fastapi import APIRouter, Depends, HTTPException
from app.dependencies import get_user_id
from app.database import supabase
from app.schemas import ProfileUpdate, ProfileResponse, SocialMediaUpdate, SocialMediaResponse
from app.middleware.validation import validate_request_data, ValidationError, SecurityError
from typing import List, Optional
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/schools")
async def get_schools(division: Optional[str] = None):
    """Get all schools, optionally filtered by division."""
    try:
        query = supabase.from_("schools").select("id,name,division")
        if division:
            query = query.eq("division", division)
        query = query.order("name")
        data = query.execute()
        
        if not data.data:
            return []
        return data.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/profile", response_model=ProfileResponse)
async def get_profile(user_id: str = Depends(get_user_id)):
    data = supabase.from_("profiles").select("*").eq("id", user_id).single().execute()
    if not data.data:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    profile_data = data.data
    
    # Convert division format from database to frontend format
    if profile_data.get('division'):
        division_map = {
            'I': 'Division I',
            'II': 'Division II',
            'III': 'Division III',
            'NAIA': 'NAIA',
            'JUCO': 'JUCO'
        }
        profile_data['division'] = division_map.get(profile_data['division'], profile_data['division'])
    
    return profile_data

@router.put("/profile", response_model=ProfileResponse)
async def update_profile(profile_data: ProfileUpdate, user_id: str = Depends(get_user_id)):
    try:
        update_data = profile_data.dict(exclude_unset=True)
        
        # Comprehensive input validation and sanitization
        try:
            update_data = validate_request_data(update_data, 'profile')
        except (ValidationError, SecurityError) as e:
            logger.warning(f"Validation failed for profile update: {e.detail}")
            raise e
        
        # Convert division format from frontend to database format
        if 'division' in update_data and update_data['division']:
            division_map = {
                'Division I': 'I',
                'Division II': 'II', 
                'Division III': 'III',
                'NAIA': 'NAIA',
                'JUCO': 'JUCO'
            }
            update_data['division'] = division_map.get(update_data['division'], update_data['division'])
        
        data = supabase.from_("profiles").update(update_data).eq("id", user_id).execute()
        if not data.data:
            raise HTTPException(status_code=404, detail="Profile not found or update failed")
        
        updated_profile = supabase.from_("profiles").select("*").eq("id", user_id).single().execute()
        profile_data = updated_profile.data
        
        # Convert division format from database to frontend format
        if profile_data.get('division'):
            division_map = {
                'I': 'Division I',
                'II': 'Division II',
                'III': 'Division III',
                'NAIA': 'NAIA',
                'JUCO': 'JUCO'
            }
            profile_data['division'] = division_map.get(profile_data['division'], profile_data['division'])
        
        return profile_data
    except (ValidationError, SecurityError):
        raise  # Re-raise validation errors as-is
    except Exception as e:
        logger.error(f"Error updating profile: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

# --- Social Media Endpoints ---

@router.get("/social-media", response_model=List[SocialMediaResponse])
async def get_social_media(user_id: str = Depends(get_user_id)):
    """Get all social media platforms for the authenticated user."""
    try:
        # CRITICAL: Validate user permissions (cursor rule)
        data = supabase.from_("social_media_platforms").select("*").eq("user_id", user_id).execute()
        
        if not data.data:
            return []
            
        return data.data
    except Exception as e:
        # CRITICAL: Never log sensitive data (cursor rule)
        logger.error(f"Error fetching social media for user: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.put("/social-media", response_model=List[SocialMediaResponse])
async def update_social_media(
    social_media_data: SocialMediaUpdate, 
    user_id: str = Depends(get_user_id)
):
    """Update social media platforms for the authenticated user."""
    try:
        # Convert to dict for validation
        social_media_dict = social_media_data.dict()
        
        # Comprehensive input validation and sanitization
        try:
            social_media_dict = validate_request_data(social_media_dict, 'social_media')
        except (ValidationError, SecurityError) as e:
            logger.warning(f"Validation failed for social media update: {e.detail}")
            raise e
        
        # Delete existing social media platforms for this user
        supabase.from_("social_media_platforms").delete().eq("user_id", user_id).execute()
        
        # Insert new social media platforms
        new_platforms = []
        for platform_data in social_media_dict['platforms']:
            platform_dict = {
                "user_id": user_id,
                "platform": platform_data['platform'],
                "handle": platform_data['handle'],
                "followers": platform_data['followers'],
                "verified": platform_data.get('verified', False)
            }
            new_platforms.append(platform_dict)
        
        # Insert all platforms at once
        if new_platforms:
            insert_result = supabase.from_("social_media_platforms").insert(new_platforms).execute()
            
            if not insert_result.data:
                raise HTTPException(status_code=500, detail="Failed to save social media data")
        
        # Update profile completion status
        supabase.from_("profiles").update({
            "social_media_completed": True,
            "social_media_completed_at": "now()"
        }).eq("id", user_id).execute()
        
        # Return updated social media data
        updated_data = supabase.from_("social_media_platforms").select("*").eq("user_id", user_id).execute()
        return updated_data.data or []
        
    except (ValidationError, SecurityError):
        raise  # Re-raise validation errors as-is
    except HTTPException:
        raise
    except Exception as e:
        # CRITICAL: Never log sensitive data (cursor rule)
        logger.error(f"Error updating social media for user: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.delete("/social-media/{platform}")
async def delete_social_media_platform(
    platform: str,
    user_id: str = Depends(get_user_id)
):
    """Delete a specific social media platform for the authenticated user."""
    try:
        # Validate platform
        allowed_platforms = ['instagram', 'twitter', 'tiktok', 'youtube', 'facebook']
        if platform not in allowed_platforms:
            raise HTTPException(
                status_code=400, 
                detail=f"Invalid platform. Must be one of: {', '.join(allowed_platforms)}"
            )
        
        # Delete the platform
        result = supabase.from_("social_media_platforms").delete().eq("user_id", user_id).eq("platform", platform).execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="Social media platform not found")
        
        return {"message": f"Successfully deleted {platform} platform"}
        
    except HTTPException:
        raise
    except Exception as e:
        # CRITICAL: Never log sensitive data (cursor rule)
        logger.error(f"Error deleting social media platform for user: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")