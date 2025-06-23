# app/api/deals.py
from fastapi import APIRouter, Depends, HTTPException, status
from app.db import supabase
from app.schemas import DealCreate, DealUpdate, DealResponse
from app.utils import get_current_user
from typing import List, Optional

router = APIRouter()

def roman_to_int(s: Optional[str]) -> Optional[int]:
    """Converts Roman numerals I, II, III to integers for the 'smallint' DB column."""
    if s == 'I': return 1
    if s == 'II': return 2
    if s == 'III': return 3
    return None

def resolve_fmv_for_response(deal_record: dict) -> dict:
    """
    Ensures the response 'fmv' field is correctly populated,
    prioritizing the 'fmv' column but falling back to 'fmv_estimate'.
    """
    if deal_record:
        if deal_record.get('fmv') is not None:
            deal_record['fmv'] = float(deal_record['fmv'])
        elif deal_record.get('fmv_estimate') is not None:
            deal_record['fmv'] = float(deal_record['fmv_estimate'])
    return deal_record

@router.post("/deals", response_model=DealResponse, tags=["Deals"])
async def create_deal_for_user(deal_data: DealCreate, user: dict = Depends(get_current_user)):
    """
    Transforms form data to match the database schema and creates a new deal.
    """
    
    deal_to_insert = {
        "user_id": user['id'],
        "name": deal_data.name,
        "email": deal_data.email,
        "school": deal_data.school,
        "gender": deal_data.gender,
        "graduation_year": deal_data.graduation_year,
        "age": deal_data.age,
        "gpa": deal_data.gpa,
        "brand_partner": deal_data.brand_partner,
        "deal_length_months": deal_data.deal_length_months,
        "proposed_dollar_amount": deal_data.proposed_dollar_amount,
        "fmv_estimate": int(deal_data.fmv) if deal_data.fmv is not None else None,
        "fmv": deal_data.fmv,
        "division": roman_to_int(deal_data.division),
        "is_real_submission": True if deal_data.is_real_submission == 'yes' else False,
        "sport": ", ".join(deal_data.sport) if deal_data.sport else None,
        "payment_structure": ", ".join(deal_data.payment_structure) if deal_data.payment_structure else None,
        "deal_type": ", ".join(deal_data.deal_type) if deal_data.deal_type else None,
        "deal_category": ", ".join(deal_data.deal_category) if deal_data.deal_category else None,
        "achievements": deal_data.achievements,
        "deliverables_instagram": deal_data.deliverables_count.get("Instagram Post (static)", 0) + deal_data.deliverables_count.get("Instagram Reel", 0) + deal_data.deliverables_count.get("Instagram Story (1 frame)", 0) + deal_data.deliverables_count.get("Instagram Story (multi-frame)", 0),
        "deliverables_tiktok": deal_data.deliverables_count.get("TikTok Video", 0),
        "deliverables_twitter": deal_data.deliverables_count.get("X (Twitter) Post", 0),
        "deliverables_youtube": deal_data.deliverables_count.get("YouTube Video (dedicated)", 0) + deal_data.deliverables_count.get("YouTube Video (integrated)", 0),
        "deliverable_other": deal_data.deliverable_other,
        "followers_instagram": deal_data.followers_instagram,
        "followers_tiktok": deal_data.followers_tiktok,
        "followers_twitter": deal_data.followers_twitter,
        "followers_youtube": deal_data.followers_youtube,
    }

    try:
        # THE FIX: Corrected Supabase syntax. .select() is not used after .insert().
        res = supabase.table('deals').insert(deal_to_insert).execute()
        
        if not res.data:
            raise HTTPException(status_code=500, detail="Could not create deal in the database.")
        
        return resolve_fmv_for_response(res.data[0])

    except Exception as e:
        print(f"An exception occurred during deal creation: {e}")
        raise HTTPException(status_code=500, detail=f"Database insert error: {str(e)}")


@router.get("/deals", response_model=List[DealResponse], tags=["Deals"])
async def get_user_deals(user: dict = Depends(get_current_user)):
    """Gets all deals for the currently authenticated user."""
    res = supabase.table('deals').select("*").eq('user_id', user['id']).order('created_at', desc=True).execute()
    deals_data = res.data or []
    return [resolve_fmv_for_response(deal) for deal in deals_data]


@router.put("/deals/{deal_id}", response_model=DealResponse, tags=["Deals"])
async def update_deal_status(deal_id: int, status_update: DealUpdate, user: dict = Depends(get_current_user)):
    """Updates the status of a specific deal."""
    
    # THE FIX: Corrected Supabase syntax. .select() is not used after .update().
    res = supabase.table('deals').update(status_update.dict()).eq('id', deal_id).eq('user_id', user['id']).execute()

    if not res.data:
        raise HTTPException(status_code=404, detail="Deal not found or you do not have permission to edit.")
            
    return resolve_fmv_for_response(res.data[0])


@router.delete("/deals/{deal_id}", status_code=status.HTTP_204_NO_CONTENT, tags=["Deals"])
async def delete_deal(deal_id: int, user: dict = Depends(get_current_user)):
    """Deletes a specific deal."""
    res = supabase.table('deals').delete().eq('id', deal_id).eq('user_id', user['id']).execute()
    if res.count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Deal not found or you do not have permission to delete.")
    return
