# backend/app/api/deals.py
from fastapi import APIRouter, Depends, HTTPException, Body, Query
from app.dependencies import get_user_id
from app.database import db
from app.schemas import DealUpdate, DealResponse, DealCreateResponse
from typing import List, Optional
import logging
from fastapi.responses import JSONResponse

logger = logging.getLogger(__name__)
router = APIRouter()

DEAL_SELECT_FIELDS = "id,user_id,status,created_at,deal_nickname,deal_terms_url,deal_terms_file_name,deal_terms_file_type,deal_terms_file_size,payor_name,contact_name,contact_email,contact_phone,activities,obligations,grant_exclusivity,uses_school_ip,licenses_NIL,compensation_cash,compensation_goods,compensation_other,is_group_deal,is_paid_to_llc"

def validate_file_metadata(file_type: str, file_size: int) -> bool:
    """Validate file metadata on the backend."""
    valid_types = ['pdf', 'docx', 'png', 'jpg', 'jpeg']
    max_size = 10 * 1024 * 1024  # 10MB
    
    if file_type not in valid_types:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type. Allowed types: {', '.join(valid_types)}"
        )
    
    if file_size > max_size:
        raise HTTPException(
            status_code=400,
            detail="File size must be less than 10MB"
        )
    
    return True

@router.post("/deals", response_model=DealCreateResponse, summary="Create a new draft deal")
async def create_draft_deal(user_id: str = Depends(get_user_id)):
    """Create a new draft deal with optimized field selection."""
    try:
        with db.transaction():
            data, count = db.client.from_("deals").insert(
                {"user_id": user_id}
            ).select(DEAL_SELECT_FIELDS).execute()
            
            if not data[1]:
                raise HTTPException(status_code=500, detail="Failed to create draft deal.")
            
            new_deal = data[1][0]
            return DealCreateResponse(
                id=new_deal['id'],
                user_id=new_deal['user_id'],
                status=new_deal['status']
            )
    except Exception as e:
        logger.error(f"Error creating draft deal: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.put("/deals/{deal_id}", response_model=DealResponse, summary="Update a deal draft")
async def update_deal(
    deal_id: int,
    deal_data: DealUpdate,
    user_id: str = Depends(get_user_id)
):
    """Update a deal with file validation."""
    try:
        update_data = deal_data.dict(exclude_unset=True)
        if not update_data:
            raise HTTPException(status_code=400, detail="No update data provided.")

        # Validate file metadata if present
        if (update_data.get('deal_terms_file_type') or 
            update_data.get('deal_terms_file_size')):
            validate_file_metadata(
                update_data.get('deal_terms_file_type', ''),
                update_data.get('deal_terms_file_size', 0)
            )

        with db.transaction():
            data, count = db.client.from_("deals").update(
                update_data
            ).match(
                {"id": deal_id, "user_id": user_id}
            ).select(DEAL_SELECT_FIELDS).execute()

            if not data[1]:
                raise HTTPException(
                    status_code=404,
                    detail="Deal not found or user does not have access."
                )
            return DealResponse(**data[1][0])
    except Exception as e:
        logger.error(f"Error updating deal {deal_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/deals", response_model=List[DealResponse], summary="Get all of a user's deals")
async def get_deals(
    user_id: str = Depends(get_user_id),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    status: Optional[str] = Query(None),
    sort_by: str = Query("created_at", pattern="^(created_at|fmv|compensation_cash)$"),
    sort_order: str = Query("desc", pattern="^(asc|desc)$")
):
    """Get deals with pagination, filtering, and optimized field selection."""
    try:
        query = db.client.from_("deals").select(
            DEAL_SELECT_FIELDS,
            count="exact"
        ).eq("user_id", user_id)

        if status:
            query = query.eq("status", status)

        # Add sorting
        query = query.order(sort_by, desc=(sort_order == "desc"))

        # Add pagination
        query = query.range(offset, offset + limit - 1)

        data, count = query.execute()
        
        return JSONResponse({
            "deals": data[1],
            "total": count,
            "limit": limit,
            "offset": offset
        })
    except Exception as e:
        logger.error(f"Error fetching deals: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.delete("/deals/{deal_id}", summary="Delete a deal")
async def delete_deal(deal_id: int, user_id: str = Depends(get_user_id)):
    """Delete a deal if it belongs to the user."""
    try:
        with db.transaction():
            # First verify the deal belongs to the user
            data, count = db.client.from_("deals").select("id").match(
                {"id": deal_id, "user_id": user_id}
            ).execute()

            if not data[1]:
                raise HTTPException(
                    status_code=404,
                    detail="Deal not found or user does not have access."
                )

            # Delete the deal
            data, count = db.client.from_("deals").delete().match(
                {"id": deal_id, "user_id": user_id}
            ).execute()

            return {"message": "Deal deleted successfully"}
    except Exception as e:
        logger.error(f"Error deleting deal {deal_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")