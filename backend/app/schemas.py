# backend/app/schemas.py
from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict, Any, Union
from datetime import datetime
import uuid

# --- Schemas for Profile Functionality ---
class ProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    division: Optional[str] = None
    university: Optional[str] = None
    gender: Optional[str] = None
    sport: Optional[str] = None

class ProfileResponse(ProfileUpdate):
    id: uuid.UUID
    
    class Config:
        from_attributes = True

# --- Schemas for the new Deal Wizard ---

class OtherCompensationItem(BaseModel):
    payment_type: str
    description: str
    estimated_value: float

class DealUpdate(BaseModel):
    payor_name: Optional[str] = None
    contact_name: Optional[str] = None
    contact_email: Optional[EmailStr] = None
    contact_phone: Optional[str] = None
    obligations: Optional[Dict[str, Any]] = None
    grant_exclusivity: Optional[str] = None
    uses_school_ip: Optional[bool] = None
    licenses_NIL: Optional[str] = None
    # *** BUG FIX: Corrected typo from Optionalfloat] to Optional[float] ***
    compensation_cash: Optional[float] = None
    compensation_goods: Optional[List[Dict[str, Any]]] = None
    compensation_other: Optional[List[OtherCompensationItem]] = None
    is_group_deal: Optional[bool] = None
    is_paid_to_llc: Optional[bool] = None
    deal_terms_url: Optional[str] = None
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