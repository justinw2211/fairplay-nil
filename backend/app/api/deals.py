# backend/app/api/deals.py
from fastapi import APIRouter, Depends, HTTPException
from typing import List, Dict
from .. import schemas
from ..db import supabase
from ..utils import get_current_user

router = APIRouter()

def calculate_compliance_score(deal: schemas.DealCreate) -> Dict:
    flags = []
    score = "Green"

    if not deal.has_written_contract:
        flags.append("No Written Contract: Lacks legal protection and clarity.")
        return {"score": "Red", "flags": flags}

    if deal.uses_school_ip:
        flags.append("Use of School IP: Requires explicit permission from the university's compliance office.")

    if deal.payor_relationship_details and len(deal.payor_relationship_details) > 3:
        flags.append("Pre-existing Relationship: Deals with boosters or insiders are scrutinized for Fair Market Value.")

    # Added rule for conflicts
    if deal.has_conflicts and deal.has_conflicts in ['yes', 'unsure']:
        flags.append("Potential Conflict: This deal may conflict with existing university or team sponsorships.")

    if flags:
        score = "Yellow"
        
    return {"score": score, "flags": flags}


@router.post("/api/deals", response_model=schemas.DealResponse, status_code=201)
def create_deal(deal: schemas.DealCreate, current_user: dict = Depends(get_current_user)):
    user_id = current_user['id']
    
    compliance_result = calculate_compliance_score(deal)
    compliance_score = compliance_result["score"]
    compliance_flags = compliance_result["flags"]
    
    if compliance_score == "Red":
        raise HTTPException(
            status_code=400, 
            detail=f"Deal Denied: {compliance_flags[0]}"
        )

    deal_dict = deal.model_dump(exclude_unset=True)
    
    deal_dict['user_id'] = user_id
    deal_dict['compliance_score'] = compliance_score
    deal_dict['compliance_flags'] = compliance_flags

    if 'division' in deal_dict and isinstance(deal_dict.get('division'), str):
        roman_to_int = {'I': 1, 'II': 2, 'III': 3}
        deal_dict['division'] = roman_to_int.get(deal_dict['division'].upper())

    try:
        data, count = supabase.table('deals').insert(deal_dict).execute()
        if not data[1]:
             raise HTTPException(status_code=500, detail="Failed to create deal, no data returned.")
        created_deal = data[1][0]
        return created_deal
    except Exception as e:
        print(f"Error creating deal: {e}")
        raise HTTPException(status_code=500, detail=f"Error creating deal in database: {e}")


@router.get("/api/deals", response_model=List[schemas.DealResponse])
def get_deals(current_user: dict = Depends(get_current_user)):
    user_id = current_user['id']
    
    try:
        response = supabase.table('deals').select("*").eq('user_id', user_id).order('id', desc=True).execute()
    except Exception as e:
        raise HTTPException(status_code=500, detail="Error fetching deals from database.")
    
    return response.data


@router.put("/api/deals/{deal_id}", response_model=schemas.DealResponse)
def update_deal_status(deal_id: int, deal_update: schemas.DealUpdate, current_user: dict = Depends(get_current_user)):
    user_id = current_user['id']
    
    update_data = {"status": deal_update.status}
    
    try:
        updated_data, count = supabase.table('deals').update(update_data).eq('id', deal_id).eq('user_id', user_id).execute()
        if not updated_data[1]:
            raise HTTPException(status_code=404, detail="Deal not found or you do not have permission to edit it.")
        return updated_data[1][0]
    except Exception as e:
        raise HTTPException(status_code=500, detail="Error updating deal in database.")


@router.delete("/api/deals/{deal_id}", status_code=204)
def delete_deal(deal_id: int, current_user: dict = Depends(get_current_user)):
    user_id = current_user['id']

    try:
        data, count = supabase.table('deals').delete().eq('id', deal_id).eq('user_id', user_id).execute()
        if count[1] == 0:
            raise HTTPException(status_code=404, detail="Deal not found or you do not have permission to delete it.")
    except Exception as e:
        raise HTTPException(status_code=500, detail="Error deleting deal from database.")
    
    return None