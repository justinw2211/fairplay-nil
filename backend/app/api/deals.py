# backend/app/api/deals.py
from fastapi import APIRouter, Depends, HTTPException
from typing import List, Dict
from .. import schemas
from ..db import get_supabase_client
from ..utils import get_current_user

router = APIRouter()

def calculate_compliance_score(deal: schemas.DealCreate) -> Dict:
    """
    Calculates the compliance score based on a set of extensible rules.
    
    Returns:
        A dictionary containing the 'score' (Green, Yellow, Red) and 'flags' (a list of reasons).
    """
    flags = []
    score = "Green" # Start with a positive assumption

    # Rule: No written contract is a deal-breaker (Red Flag)
    if not deal.has_written_contract:
        flags.append("No Written Contract: Lacks legal protection and clarity.")
        return {"score": "Red", "flags": flags}

    # Rule: Using school IP requires caution (Yellow Flag)
    if deal.uses_school_ip:
        flags.append("Use of School IP: Requires explicit permission from the university's compliance office.")

    # Rule: Relationship with payor needs scrutiny (Yellow Flag)
    if deal.payor_relationship_details and len(deal.payor_relationship_details) > 3: # Check if user provided details
        flags.append("Pre-existing Relationship: Deals with boosters or insiders are scrutinized for Fair Market Value.")

    # Determine final score based on flags
    if flags:
        score = "Yellow"
        
    return {"score": score, "flags": flags}


@router.post("/api/deals", response_model=schemas.Deal, status_code=201)
def create_deal(deal: schemas.DealCreate, current_user: dict = Depends(get_current_user)):
    supabase = get_supabase_client()
    user_id = current_user['id']
    
    # --- Scoring Engine ---
    compliance_result = calculate_compliance_score(deal)
    compliance_score = compliance_result["score"]
    compliance_flags = compliance_result["flags"]
    
    # Deny deals that get a "Red" score, as per instructions
    if compliance_score == "Red":
        raise HTTPException(
            status_code=400, 
            detail=f"Deal Denied: {compliance_flags[0]}"
        )

    # Convert Pydantic model to a dictionary
    deal_dict = deal.dict(exclude_unset=True) # exclude_unset is important for optional fields
    
    # --- Add user_id and compliance results to the dictionary ---
    deal_dict['user_id'] = user_id
    deal_dict['compliance_score'] = compliance_score
    deal_dict['compliance_flags'] = compliance_flags

    # --- Data transformation ---
    # This is a good place for any final data cleanup if needed
    # For example, ensuring empty strings are stored as null, etc.
    if 'division' in deal_dict and isinstance(deal_dict.get('division'), str):
        roman_to_int = {'I': 1, 'II': 2, 'III': 3}
        deal_dict['division'] = roman_to_int.get(deal_dict['division'].upper())


    # Insert the data into the 'deals' table
    try:
        data, count = supabase.table('deals').insert(deal_dict).execute()
    except Exception as e:
        print(e) # For debugging on Render
        raise HTTPException(status_code=500, detail="Error creating deal in database.")

    if not data[1]:
        raise HTTPException(status_code=500, detail="Failed to create deal.")
        
    created_deal = data[1][0]
    return created_deal


@router.get("/api/deals", response_model=List[schemas.Deal])
def get_deals(current_user: dict = Depends(get_current_user)):
    supabase = get_supabase_client()
    user_id = current_user['id']
    
    try:
        response = supabase.table('deals').select("*").eq('user_id', user_id).order('id', desc=True).execute()
    except Exception as e:
        raise HTTPException(status_code=500, detail="Error fetching deals from database.")
    
    return response.data


@router.put("/api/deals/{deal_id}", response_model=schemas.Deal)
def update_deal_status(deal_id: int, deal_update: schemas.DealUpdate, current_user: dict = Depends(get_current_user)):
    supabase = get_supabase_client()
    user_id = current_user['id']

    # First, verify the deal exists and belongs to the user
    existing_deal_res = supabase.table('deals').select("id").eq('id', deal_id).eq('user_id', user_id).execute()
    if not existing_deal_res.data:
        raise HTTPException(status_code=404, detail="Deal not found or you do not have permission to edit it.")

    update_data = deal_update.dict(exclude_unset=True)
    
    try:
        updated_data, count = supabase.table('deals').update(update_data).eq('id', deal_id).execute()
    except Exception as e:
        raise HTTPException(status_code=500, detail="Error updating deal in database.")

    if not updated_data[1]:
        raise HTTPException(status_code=404, detail="Deal not found.")

    return updated_data[1][0]


@router.delete("/api/deals/{deal_id}", status_code=204)
def delete_deal(deal_id: int, current_user: dict = Depends(get_current_user)):
    supabase = get_supabase_client()
    user_id = current_user['id']

    # Verify ownership before deleting
    existing_deal_res = supabase.table('deals').select("id").eq('id', deal_id).eq('user_id', user_id).execute()
    if not existing_deal_res.data:
        raise HTTPException(status_code=404, detail="Deal not found or you do not have permission to delete it.")

    try:
        data, count = supabase.table('deals').delete().eq('id', deal_id).execute()
    except Exception as e:
        raise HTTPException(status_code=500, detail="Error deleting deal from database.")

    if count[1] == 0:
        raise HTTPException(status_code=404, detail="Deal not found.")

    return None