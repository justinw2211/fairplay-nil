# backend/app/api/deals.py
from fastapi import APIRouter, Depends, HTTPException, Body
from app.dependencies import get_user_id
from app.database import supabase
from app.schemas import DealUpdate, DealResponse, DealCreateResponse
from typing import List

router = APIRouter()

@router.post("/deals", response_model=DealCreateResponse, summary="Create a new draft deal")
async def create_draft_deal(user_id: str = Depends(get_user_id)):
    # *** BUG FIX: Removed 'await' from the .execute() call ***
    data, count = supabase.from_("deals").insert({"user_id": user_id}).execute()
    if not data[1]:
        raise HTTPException(status_code=500, detail="Failed to create draft deal.")
    new_deal = data[1][0]
    return DealCreateResponse(id=new_deal['id'], user_id=new_deal['user_id'], status=new_deal['status'])

@router.put("/deals/{deal_id}", response_model=DealResponse, summary="Update a deal draft")
async def update_deal(deal_id: int, deal_data: DealUpdate, user_id: str = Depends(get_user_id)):
    update_data = deal_data.dict(exclude_unset=True)
    if not update_data:
        raise HTTPException(status_code=400, detail="No update data provided.")
    # *** BUG FIX: Removed 'await' from the .execute() call ***
    data, count = supabase.from_("deals").update(update_data).match({"id": deal_id, "user_id": user_id}).execute()
    if not data[1]:
        raise HTTPException(status_code=404, detail="Deal not found or user does not have access.")
    return DealResponse(**data[1][0])

@router.get("/deals", response_model=List[DealResponse], summary="Get all of a user's deals")
async def get_deals(user_id: str = Depends(get_user_id)):
    # *** BUG FIX: Removed 'await' from the .execute() call ***
    data, count = supabase.from_("deals").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
    return data[1]