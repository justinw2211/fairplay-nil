# backend/app/schemas.py
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

# --- Unified Deal Schemas ---
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
    
    payor_name: Optional[str] = None
    payor_industry: Optional[str] = None
    payor_relationship_details: Optional[str] = None
    deal_description: Optional[str] = None
    compensation_type: Optional[str] = None
    compensation_amount: Optional[float] = None
    compensation_in_kind_description: Optional[str] = None
    uses_school_ip: Optional[bool] = None
    has_written_contract: Optional[bool] = None
    agent_name: Optional[str] = None
    agent_agency: Optional[str] = None
    contract_url: Optional[str] = None
    fmv: Optional[float] = None
    has_conflicts: Optional[str] = None # Added this field

class DealUpdate(BaseModel):
    status: str

class DealResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True, extra='ignore')
    id: int
    created_at: Optional[datetime] = None
    user_id: Optional[UUID] = None
    status: Optional[str] = None
    payor_name: Optional[str] = None
    payor_industry: Optional[str] = None
    compliance_score: Optional[str] = None
    compliance_flags: Optional[List[str]] = None
    brand_partner: Optional[str] = None
    fmv: Optional[float] = None
    has_conflicts: Optional[str] = None # Added this field