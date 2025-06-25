# backend/app/schemas.py
from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime
import uuid

# Represents a single item within the "Other Payments" section
class OtherCompensationItem(BaseModel):
    payment_type: str
    description: str
    estimated_value: float

# The main schema for creating or updating a deal.
# All fields are optional to allow for partial updates (draft saving).
class DealUpdate(BaseModel):
    # Payor Info
    payor_name: Optional[str] = None
    contact_name: Optional[str] = None
    contact_email: Optional[EmailStr] = None
    contact_phone: Optional[str] = None

    # Obligations (from the dynamic activity forms)
    obligations: Optional[Dict[str, Any]] = None

    # Mid-Stage Compliance Questions
    grant_exclusivity: Optional[str] = None
    uses_school_ip: Optional[bool] = None # Mapping 'Is School Branding Visible?' to this existing field
    licenses_NIL: Optional[str] = None

    # Compensation
    compensation_cash: Optional[float] = None
    compensation_goods: Optional[Dict[str, Any]] = None
    compensation_other: Optional[List[OtherCompensationItem]] = None

    # Confirmation Info
    is_group_deal: Optional[bool] = None
    is_paid_to_llc: Optional[bool] = None

    # Deal Terms File
    deal_terms_url: Optional[str] = None

    # The final status when submitting
    status: Optional[str] = None

# The schema for data returned by the API, including database-generated fields.
class DealResponse(DealUpdate):
    id: int
    user_id: uuid.UUID
    created_at: datetime
    status: str

    class Config:
        orm_mode = True

# Schema for creating a new draft deal
class DealCreateResponse(BaseModel):
    id: int
    user_id: uuid.UUID
    status: str