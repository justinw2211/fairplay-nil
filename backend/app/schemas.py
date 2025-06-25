# backend/app/schemas.py
from pydantic import BaseModel, Field
from typing import Optional, List
from uuid import UUID

class DealBase(BaseModel):
    # --- Existing Fields ---
    brand_name: Optional[str] = None
    industry: Optional[str] = None
    compensation_amount: Optional[float] = None
    deliverables: Optional[list[str]] = None
    deal_status: Optional[str] = 'Pending'
    fmv: Optional[float] = None
    
    # --- New Refactored Fields from Wizard ---
    payor_name: Optional[str] = None
    payor_industry: Optional[str] = None
    payor_relationship_details: Optional[str] = None
    deal_description: Optional[str] = None
    
    compensation_type: Optional[str] = None # 'Cash', 'In-Kind', 'Mixed'
    compensation_in_kind_description: Optional[str] = None
    
    uses_school_ip: Optional[bool] = None
    has_written_contract: Optional[bool] = None
    
    agent_name: Optional[str] = None
    agent_agency: Optional[str] = None
    
    contract_url: Optional[str] = None

class DealCreate(DealBase):
    # All fields from DealBase are used for creation.
    # No extra fields needed here for now.
    pass

class DealUpdate(BaseModel):
    deal_status: Optional[str] = None
    # Add other fields that can be updated post-creation if needed

class Deal(DealBase):
    id: int
    user_id: UUID
    compliance_score: Optional[str] = None
    compliance_flags: Optional[List[str]] = None

    class Config:
        orm_mode = True
        
class UserBase(BaseModel):
    email: str

class UserCreate(UserBase):
    password: str
    full_name: Optional[str] = None
    # Add other profile fields if they are part of sign-up
    gender: Optional[str] = None
    sport: Optional[str] = None
    university: Optional[str] = None
    division: Optional[str] = None


class User(UserBase):
    id: UUID
    full_name: Optional[str]
    gender: Optional[str] = None
    sport: Optional[str] = None
    university: Optional[str] = None
    division: Optional[str] = None

    class Config:
        orm_mode = True

class ProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    gender: Optional[str] = None
    sport: Optional[str] = None
    university: Optional[str] = None
    division: Optional[str] = None