# backend/app/schemas.py
from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional, List, Dict, Any, Union
from datetime import datetime
import uuid
import re

# --- Schemas for Profile Functionality ---
class ProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    division: Optional[str] = None
    university: Optional[str] = None
    gender: Optional[str] = None
    sports: Optional[List[str]] = None

# --- Schemas for Social Media Functionality ---
class SocialMediaPlatform(BaseModel):
    platform: str = Field(..., regex=r'^(instagram|twitter|tiktok|youtube|facebook)$')
    handle: str = Field(..., regex=r'^@[a-zA-Z0-9_]+$')
    followers: int = Field(..., ge=0)
    verified: bool = False
    
    @validator('handle')
    def validate_handle_format(cls, v):
        if not v.startswith('@'):
            raise ValueError('Handle must start with @')
        if not re.match(r'^@[a-zA-Z0-9_]+$', v):
            raise ValueError('Handle contains invalid characters')
        return v
    
    @validator('platform')
    def validate_platform(cls, v):
        allowed_platforms = ['instagram', 'twitter', 'tiktok', 'youtube', 'facebook']
        if v not in allowed_platforms:
            raise ValueError(f'Platform must be one of: {", ".join(allowed_platforms)}')
        return v

class SocialMediaUpdate(BaseModel):
    platforms: List[SocialMediaPlatform] = Field(..., min_items=1)
    
    @validator('platforms')
    def validate_unique_platforms(cls, v):
        platforms = [p.platform for p in v]
        if len(platforms) != len(set(platforms)):
            raise ValueError('Duplicate platforms are not allowed')
        return v

class SocialMediaResponse(BaseModel):
    id: int
    platform: str
    handle: str
    followers: int
    verified: bool
    created_at: datetime
    updated_at: datetime

class ProfileResponse(ProfileUpdate):
    id: uuid.UUID
    
    class Config:
        from_attributes = True

# --- Schemas for the new Deal Wizard ---

class OtherCompensationItem(BaseModel):
    payment_type: str
    description: str
    estimated_value: float

class ActivityDetails(BaseModel):
    activity_type: str
    details: Dict[str, Any]
    requirements: Optional[Dict[str, Any]] = None
    deadlines: Optional[Dict[str, Any]] = None

class DealUpdate(BaseModel):
    # Step 0: Social Media (NEW)
    athlete_social_media: Optional[List[Dict[str, Any]]] = None
    social_media_confirmed: Optional[bool] = None
    social_media_confirmed_at: Optional[datetime] = None
    
    # Step 1: Deal Terms
    deal_nickname: Optional[str] = None
    deal_terms_url: Optional[str] = None
    deal_terms_file_name: Optional[str] = None
    deal_terms_file_type: Optional[str] = None
    deal_terms_file_size: Optional[int] = None
    
    # Step 2: Payor Info
    payor_name: Optional[str] = None
    contact_name: Optional[str] = None
    contact_email: Optional[EmailStr] = None
    contact_phone: Optional[str] = None
    
    # Step 3-4: Activities
    activities: Optional[List[ActivityDetails]] = None
    
    # Step 5: Compliance
    obligations: Optional[Dict[str, Any]] = None
    grant_exclusivity: Optional[str] = None
    uses_school_ip: Optional[bool] = None
    licenses_nil: Optional[str] = None
    
    # Step 6: Compensation
    compensation_cash: Optional[float] = None
    compensation_goods: Optional[List[Dict[str, Any]]] = None
    compensation_other: Optional[List[OtherCompensationItem]] = None
    
    # Additional Fields
    is_group_deal: Optional[bool] = None
    is_paid_to_llc: Optional[bool] = None
    status: Optional[str] = None

class DealResponse(DealUpdate):
    id: int
    user_id: uuid.UUID
    created_at: datetime
    status: str

    class Config:
        from_attributes = True

class DealCreateResponse(BaseModel):
    id: int
    user_id: uuid.UUID
    status: str