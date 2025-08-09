# backend/app/api/deals.py
from fastapi import APIRouter, Depends, HTTPException, Body, Query
from app.dependencies import get_user_id
from app.database import db
from app.schemas import DealUpdate, DealResponse, DealCreateResponse, DealTypeEnum
from app.middleware.validation import validate_request_data, ValidationError, SecurityError
from typing import List, Optional, Dict, Any
import logging
from fastapi.responses import JSONResponse

logger = logging.getLogger(__name__)
router = APIRouter()

# Updated DEAL_SELECT_FIELDS to include new columns and analytics fields
DEAL_SELECT_FIELDS = "id,user_id,status,created_at,deal_nickname,deal_terms_url,deal_terms_file_name,deal_terms_file_type,deal_terms_file_size,payor_name,payor_type,contact_name,contact_email,contact_phone,activities,obligations,grant_exclusivity,uses_school_ip,licenses_nil,compensation_cash,compensation_cash_schedule,compensation_goods,compensation_other,is_group_deal,is_paid_to_llc,athlete_social_media,social_media_confirmed,social_media_confirmed_at,deal_type,clearinghouse_prediction,valuation_prediction,brand_partner,clearinghouse_result,actual_compensation,valuation_range,submission_type"

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
async def create_draft_deal(
    deal_data: Optional[Dict[str, Any]] = Body(default={}),
    user_id: str = Depends(get_user_id)
):
    """Create a new draft deal with optimized field selection and deal type support."""
    try:
        # Extract deal_type from request data, default to 'simple'
        deal_type = deal_data.get('deal_type', 'simple') if deal_data else 'simple'
        
        # Validate deal_type
        if deal_type not in [e.value for e in DealTypeEnum]:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid deal type. Must be one of: {', '.join([e.value for e in DealTypeEnum])}"
            )
        
        with db.transaction():
            insert_data = {
                "user_id": user_id, 
                "status": "draft",
                "deal_type": deal_type
            }
            
            data = db.client.from_("deals").insert(insert_data).execute()
            
            if not data.data:
                raise HTTPException(status_code=500, detail="Failed to create draft deal.")
            
            new_deal = data.data[0]
            return DealCreateResponse(
                id=new_deal['id'],
                user_id=new_deal['user_id'],
                status=new_deal['status'],
                deal_type=new_deal.get('deal_type', 'simple')
            )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating draft deal: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.put("/deals/{deal_id}", response_model=DealResponse, summary="Update a deal draft")
async def update_deal(
    deal_id: int,
    deal_data: DealUpdate,
    user_id: str = Depends(get_user_id)
):
    """Update a deal with comprehensive validation and cache invalidation."""
    try:
        update_data = deal_data.dict(exclude_unset=True)
        # Instrumentation: log incoming keys
        try:
            incoming_keys = list(update_data.keys())
            logger.info(f"[update_deal] deal_id={deal_id} user_id={user_id} incoming_keys={incoming_keys}")
        except Exception:
            pass
        if not update_data:
            raise HTTPException(status_code=400, detail="No update data provided.")

        # Convert enum to string if present
        if 'deal_type' in update_data and hasattr(update_data['deal_type'], 'value'):
            update_data['deal_type'] = update_data['deal_type'].value

        # Comprehensive input validation and sanitization
        try:
            update_data = validate_request_data(update_data, 'deal')
        except (ValidationError, SecurityError) as e:
            logger.warning(f"Validation failed for deal {deal_id}: {e.detail}")
            raise e

        # Auto-set social_media_confirmed_at when social_media_confirmed is True
        if update_data.get('social_media_confirmed') is True:
            update_data['social_media_confirmed_at'] = 'now()'

        # Instrumentation: log sanitized keys
        try:
            sanitized_keys = list(update_data.keys())
            logger.info(f"[update_deal] deal_id={deal_id} sanitized_keys={sanitized_keys}")
        except Exception:
            pass

        # Use optimized update with cache invalidation
        updated_deal = await db.update_deal_with_cache_invalidation(deal_id, user_id, update_data)
        try:
            logger.info(f"[update_deal] deal_id={deal_id} updated_fields={list(updated_deal.keys())}")
        except Exception:
            pass
        return DealResponse(**updated_deal)
        
    except (ValidationError, SecurityError):
        raise  # Re-raise validation errors as-is
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating deal {deal_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

# New endpoints for prediction storage
@router.put("/deals/{deal_id}/clearinghouse-prediction", summary="Store clearinghouse prediction")
async def store_clearinghouse_prediction(
    deal_id: int,
    prediction_data: Dict[str, Any] = Body(...),
    user_id: str = Depends(get_user_id)
):
    """Store clearinghouse prediction results for a deal."""
    try:
        update_data = {"clearinghouse_prediction": prediction_data}
        updated_deal = await db.update_deal_with_cache_invalidation(deal_id, user_id, update_data)
        return {"message": "Clearinghouse prediction stored successfully", "deal_id": deal_id}
    except Exception as e:
        logger.error(f"Error storing clearinghouse prediction for deal {deal_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.put("/deals/{deal_id}/valuation-prediction", summary="Store valuation prediction")
async def store_valuation_prediction(
    deal_id: int,
    prediction_data: Dict[str, Any] = Body(...),
    user_id: str = Depends(get_user_id)
):
    """Store valuation prediction results for a deal."""
    try:
        update_data = {"valuation_prediction": prediction_data}
        updated_deal = await db.update_deal_with_cache_invalidation(deal_id, user_id, update_data)
        return {"message": "Valuation prediction stored successfully", "deal_id": deal_id}
    except Exception as e:
        logger.error(f"Error storing valuation prediction for deal {deal_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

# Force redeployment - GET endpoint for individual deals
@router.get("/deals/{deal_id}", response_model=DealResponse, summary="Get a specific deal")
async def get_deal(deal_id: int, user_id: str = Depends(get_user_id)):
    """Get a specific deal by ID with user authorization."""
    try:
        data = db.client.from_("deals").select(DEAL_SELECT_FIELDS).eq("id", deal_id).eq("user_id", user_id).execute()
        
        if not data.data:
            raise HTTPException(status_code=404, detail="Deal not found")
        
        deal = data.data[0]
        return DealResponse(**deal)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching deal {deal_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/deals/{deal_id}/prediction/{prediction_type}", summary="Get prediction data")
async def get_prediction(
    deal_id: int,
    prediction_type: str,
    user_id: str = Depends(get_user_id)
):
    """Get prediction data for a specific deal."""
    try:
        if prediction_type not in ['clearinghouse', 'valuation']:
            raise HTTPException(status_code=400, detail="Invalid prediction type")
        
        # Get the deal with prediction data
        response = db.client.from_("deals").select(f"id,{prediction_type}_prediction").eq("id", deal_id).eq("user_id", user_id).execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="Deal not found")
        
        deal = response.data[0]
        prediction_field = f"{prediction_type}_prediction"
        
        return {
            "deal_id": deal_id,
            "prediction_type": prediction_type,
            "prediction_data": deal.get(prediction_field)
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching prediction for deal {deal_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/deals", summary="Get all of a user's deals with optimized pagination")
async def get_deals(
    user_id: str = Depends(get_user_id),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    status: Optional[str] = Query(None),
    deal_type: Optional[str] = Query(None),
    sort_by: str = Query("created_at", pattern="^(created_at|fmv|compensation_cash)$"),
    sort_order: str = Query("desc", pattern="^(asc|desc)$")
) -> Dict[str, Any]:
    """Get deals with optimized pagination, filtering, and caching."""
    try:
        # Use optimized paginated query with caching and profile joining
        result = await db.get_deals_paginated_with_profile(
            user_id=user_id,
            page=page,
            limit=limit,
            status=status,
            deal_type=deal_type,
            sort_by=sort_by,
            sort_order=sort_order
        )
        
        return result
    except Exception as e:
        logger.error(f"Error fetching deals: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.delete("/deals/{deal_id}", summary="Delete a deal")
async def delete_deal(deal_id: int, user_id: str = Depends(get_user_id)):
    """Delete a deal if it belongs to the user."""
    try:
        with db.transaction():
            # First verify the deal belongs to the user
            data = db.client.from_("deals").select("id").eq("id", deal_id).eq("user_id", user_id).execute()

            if not data.data:
                raise HTTPException(
                    status_code=404,
                    detail="Deal not found or user does not have access."
                )

            # Delete the deal
            data = db.client.from_("deals").delete().eq("id", deal_id).eq("user_id", user_id).execute()

            return {"message": "Deal deleted successfully"}
    except Exception as e:
        logger.error(f"Error deleting deal {deal_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")