# backend/app/schemas.py
from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional, List, Dict, Any, Union
from datetime import datetime
import uuid
import re
from enum import Enum

# Deal Type Enumeration
class DealTypeEnum(str, Enum):
    simple = "simple"
    clearinghouse = "clearinghouse" 
    valuation = "valuation"
    standard = "standard"  # For backwards compatibility

# --- Schemas for Profile Functionality ---
class ProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    division: Optional[str] = None
    university: Optional[str] = None
    gender: Optional[str] = None
    sports: Optional[List[str]] = None
    expected_graduation_year: Optional[int] = Field(None, ge=2025, le=2035, description="Expected graduation year for student-athletes")

# --- Schemas for Social Media Functionality ---
class SocialMediaPlatform(BaseModel):
    platform: str = Field(..., pattern=r'^(instagram|twitter|tiktok|youtube|facebook)$')
    handle: str = Field(..., pattern=r'^@[a-zA-Z0-9_]+$')
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

# --- Schemas for Prediction Results ---
class ClearinghousePrediction(BaseModel):
    prediction: str = Field(pattern=r'^(approved|denied|flagged)$')
    confidence: float = Field(ge=0.0, le=1.0)
    reasons: List[str] = Field(default_factory=list)
    payor_verification: Optional[Dict[str, Any]] = None
    business_purpose_verification: Optional[Dict[str, Any]] = None
    fmv_analysis: Optional[Dict[str, Any]] = None
    predicted_at: datetime = Field(default_factory=datetime.utcnow)

class ValuationPrediction(BaseModel):
    estimated_fmv: float = Field(ge=0.0)
    fmv_range: Dict[str, float] = Field(description="Fair market value range with min and max values")
    factors: Dict[str, Any] = Field(default_factory=dict)
    social_media_score: Optional[float] = None
    school_tier_multiplier: Optional[float] = None
    sport_multiplier: Optional[float] = None
    activity_multiplier: Optional[float] = None
    predicted_at: datetime = Field(default_factory=datetime.utcnow)

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
    # Deal Type and Prediction Fields
    deal_type: Optional[DealTypeEnum] = Field(default=DealTypeEnum.simple, description="Type of deal workflow")
    clearinghouse_prediction: Optional[Dict[str, Any]] = Field(None, description="NIL Go clearinghouse prediction results")
    valuation_prediction: Optional[Dict[str, Any]] = Field(None, description="Fair market value prediction results")
    
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
    payor_type: Optional[str] = Field(None, pattern=r'^(business|individual)$')
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
    
    # Analytics Fields (NEW - for dashboard support)
    brand_partner: Optional[str] = Field(None, description="Brand partner name for analytics")
    clearinghouse_result: Optional[str] = Field(None, pattern=r'^(approved|denied|flagged|pending)$', description="Actual clearinghouse result")
    actual_compensation: Optional[float] = Field(None, ge=0.0, description="Actual compensation received")
    valuation_range: Optional[str] = Field(None, description="Valuation range for analytics (e.g., '1000-5000')")
    fmv: Optional[float] = Field(None, ge=0.0, description="Fair market value")

    @validator('deal_type')
    def validate_deal_type(cls, v):
        if v and v not in [e.value for e in DealTypeEnum]:
            raise ValueError(f'Deal type must be one of: {", ".join([e.value for e in DealTypeEnum])}')
        return v

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
    deal_type: Optional[str] = None