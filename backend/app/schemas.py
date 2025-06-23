# app/schemas.py
from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import List, Optional
from uuid import UUID
from datetime import datetime

# --- User & Profile Schemas (Unchanged) ---
class ProfileBase(BaseModel):
    full_name: Optional[str] = None
    role: Optional[str] = None
    school: Optional[str] = None
    division: Optional[str] = None
    gender: Optional[str] = None
    graduation_year: Optional[int] = None
    sports: Optional[List[str]] = []

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    profile: ProfileBase

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class ProfileResponse(ProfileBase):
    id: UUID

# --- Deal Schemas (Corrected to Match Database and Functionality) ---

class DealCreate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    school: Optional[str] = None
    division: Optional[str] = None
    gender: Optional[str] = None
    sport: Optional[List[str]] = []
    graduation_year: Optional[int] = None
    age: Optional[int] = None
    gpa: Optional[float] = None
    achievements: Optional[List[str]] = []
    social_platforms: Optional[List[str]] = []
    followers_instagram: Optional[int] = None
    followers_tiktok: Optional[int] = None
    followers_twitter: Optional[int] = None
    followers_youtube: Optional[int] = None
    payment_structure: Optional[List[str]] = []
    payment_structure_other: Optional[str] = None
    deal_length_months: Optional[int] = None
    proposed_dollar_amount: Optional[float] = None
    deal_category: Optional[List[str]] = []
    brand_partner: Optional[str] = None
    deliverables: Optional[List[str]] = []
    deliverables_count: Optional[dict] = {}
    deliverable_other: Optional[str] = None
    deal_type: Optional[List[str]] = []
    is_real_submission: Optional[str] = None
    fmv: Optional[float] = None

# This model is for updating the deal status from the dashboard.
class DealUpdate(BaseModel):
    status: str

class DealResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True, extra='ignore')

    id: int
    created_at: Optional[datetime] = None
    user_id: Optional[UUID] = None
    
    # All columns from your database, including the new 'status' field
    status: Optional[str] = None
    
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    school: Optional[str] = None
    division: Optional[int] = None
    conference: Optional[str] = None
    gender: Optional[str] = None
    sport: Optional[str] = None
    graduation_year: Optional[int] = None
    age: Optional[int] = None
    gpa: Optional[float] = None
    achievements: Optional[List[str]] = []
    athlete_status: Optional[str] = None
    followers_instagram: Optional[int] = None
    followers_tiktok: Optional[int] = None
    followers_twitter: Optional[int] = None
    followers_youtube: Optional[int] = None
    deliverables_instagram: Optional[int] = None
    deliverables_tiktok: Optional[int] = None
    deliverables_twitter: Optional[int] = None
    deliverables_youtube: Optional[int] = None
    deliverable_other: Optional[str] = None
    payment_structure: Optional[str] = None
    deal_length_months: Optional[int] = None
    proposed_dollar_amount: Optional[float] = None
    deal_type: Optional[str] = None
    deal_category: Optional[str] = None
    brand_partner: Optional[str] = None
    geography: Optional[str] = None
    is_real_submission: Optional[bool] = None
    fmv_estimate: Optional[int] = None
    fmv: Optional[float] = None
    compliance_pass: Optional[bool] = None
