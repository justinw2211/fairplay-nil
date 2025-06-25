# backend/app/api/deals.py
from fastapi import APIRouter, Depends, HTTPException, Body
from ..dependencies import get_user_id
from ..database import supabase
from ..schemas import DealUpdate, DealResponse, DealCreateResponse
from typing import List, Dict, Any

router = APIRouter()

# Endpoint 1: Create a New Draft Deal
# This is the very first call made when the user starts the new DealWizard.
@router.post("/api/deals", response_model=DealCreateResponse, summary="Create a new draft deal")
async def create_draft_deal(user_id: str = Depends(get_user_id)):
    """
    Creates a new, empty deal entry in the database with a 'draft' status.
    This secures a unique ID that the frontend can use for all subsequent auto-saves.
    """
    try:
        # Insert a new row with only the user_id, letting the DB set defaults
        data, count = await supabase.from_("deals").insert({"user_id": user_id}).execute()
        
        if not data[1]:
            raise HTTPException(status_code=500, detail="Failed to create draft deal.")

        new_deal = data[1][0]
        return DealCreateResponse(id=new_deal['id'], user_id=new_deal['user_id'], status=new_deal['status'])

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Endpoint 2: Update (Auto-Save) a Draft Deal
# This endpoint will be called every time the user clicks "Continue" in the wizard.
@router.put("/api/deals/{deal_id}", response_model=DealResponse, summary="Update a deal draft")
async def update_deal(deal_id: int, deal_data: DealUpdate, user_id: str = Depends(get_user_id)):
    """
    Updates a deal with the provided data. This is the core 'auto-save' function.
    It accepts a partial DealUpdate schema and only updates the fields provided.
    The final submission is also a call to this endpoint, where the status is changed to 'submitted'.
    """
    try:
        # Convert Pydantic model to a dictionary, excluding unset fields
        update_data = deal_data.dict(exclude_unset=True)

        if not update_data:
            raise HTTPException(status_code=400, detail="No update data provided.")

        # Update the deal in the database where the ID and user_id match.
        # This ensures a user can only update their own deals (double protection with RLS).
        data, count = await supabase.from_("deals").update(update_data).match({"id": deal_id, "user_id": user_id}).execute()

        if not data[1]:
            raise HTTPException(status_code=404, detail="Deal not found or user does not have access.")

        return DealResponse(**data[1][0])

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Endpoint 3: Get all deals for the logged-in user
# This is needed for the dashboard to display both submitted and draft deals.
@router.get("/api/deals", response_model=List[DealResponse], summary="Get all of a user's deals")
async def get_deals(user_id: str = Depends(get_user_id)):
    """
    Fetches all deals (including drafts) associated with the authenticated user.
    The frontend will use this to populate the dashboard tables.
    """
    try:
        data, count = await supabase.from_("deals").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
        return data[1]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))