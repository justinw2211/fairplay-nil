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

# Updated DEAL_SELECT_FIELDS to include new columns, analytics fields, duration and company type fields
DEAL_SELECT_FIELDS = (
    "id,user_id,status,status_labels,created_at,deal_nickname,deal_terms_url,deal_terms_file_name,"
    "deal_terms_file_type,deal_terms_file_size,deal_duration_years,deal_duration_months,"
    "deal_duration_total_months,payor_name,payor_type,contact_name,contact_email,contact_phone,"
    "payor_company_size,payor_industries,activities,obligations,grant_exclusivity,uses_school_ip,"
    "licenses_nil,compensation_cash,compensation_cash_schedule,compensation_goods,compensation_other,"
    "is_group_deal,is_paid_to_llc,athlete_social_media,social_media_confirmed,social_media_confirmed_at,"
    "deal_type,clearinghouse_prediction,valuation_prediction,brand_partner,clearinghouse_result,"
    "actual_compensation,valuation_range,fmv,submission_type,deal_duration_years,deal_duration_months,deal_duration_total_months,"
    "payor_company_size,payor_industries"
)


def _safe_number(value) -> float:
    try:
        if value is None:
            return 0.0
        return float(value)
    except (TypeError, ValueError):
        return 0.0


def compute_fmv_value(deal_like: dict) -> float:
    """Compute FMV based on deal type.

    - valuation: use valuation_prediction.estimated_fmv when available
    - simple/clearinghouse/other: sum of compensation_cash + goods + other estimated values
    """
    if not isinstance(deal_like, dict):
        return 0.0

    deal_type = (deal_like.get("deal_type") or "").strip().lower() or "simple"

    # If valuation prediction exists and deal type is valuation, prefer that
    if deal_type == "valuation":
        prediction = deal_like.get("valuation_prediction") or {}
        if isinstance(prediction, dict):
            est = prediction.get("estimated_fmv")
            val = _safe_number(est)
            if val > 0:
                return round(val, 2)

    # Otherwise compute from compensation fields
    total = 0.0

    # Cash
    total += _safe_number(deal_like.get("compensation_cash"))

    # Goods (array of objects, value may be in 'value' or 'estimated_value')
    goods = deal_like.get("compensation_goods") or []
    if isinstance(goods, list):
        for item in goods:
            if not isinstance(item, dict):
                continue
            total += _safe_number(item.get("value", item.get("estimated_value")))

    # Other (array of objects, use 'estimated_value' or fallback to 'value')
    other = deal_like.get("compensation_other") or []
    if isinstance(other, list):
        for item in other:
            if not isinstance(item, dict):
                continue
            total += _safe_number(item.get("estimated_value", item.get("value")))

    return round(total, 2)

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
        
        # Auto-calculate total_months when duration fields are provided
        years = update_data.get('deal_duration_years')
        months = update_data.get('deal_duration_months')
        if years is not None and months is not None:
            total_months = years * 12 + months
            if total_months == 0:
                raise HTTPException(status_code=400, detail="Duration must be at least 1 month")
            if total_months > 120:
                raise HTTPException(status_code=400, detail="Total duration cannot exceed 10 years")
            update_data['deal_duration_total_months'] = total_months

        # Instrumentation: log sanitized keys
        try:
            sanitized_keys = list(update_data.keys())
            logger.info(f"[update_deal] deal_id={deal_id} sanitized_keys={sanitized_keys}")
        except Exception:
            pass

        # If compensation or deal_type fields are being updated, compute FMV server-side
        fmv_related_keys = {
            'compensation_cash', 'compensation_goods', 'compensation_other',
            'valuation_prediction', 'deal_type'
        }
        if any(key in update_data for key in fmv_related_keys):
            try:
                # Fetch current values to merge and compute accurately
                existing_resp = db.client.from_("deals").select(
                    "deal_type,compensation_cash,compensation_goods,compensation_other,valuation_prediction"
                ).eq("id", deal_id).eq("user_id", user_id).execute()
                existing = existing_resp.data[0] if existing_resp.data else {}
                merged = {**existing, **update_data}
                update_data['fmv'] = compute_fmv_value(merged)
            except Exception as e:
                logger.warning(f"[update_deal] FMV compute failed for deal {deal_id}: {e}")

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
        # Persist valuation prediction and set FMV from estimated value when available
        estimated = 0.0
        try:
            if isinstance(prediction_data, dict):
                estimated = float(prediction_data.get('estimated_fmv') or 0)
        except Exception:
            estimated = 0.0
        update_data = {"valuation_prediction": prediction_data, "fmv": round(estimated, 2)}
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
        # Compute FMV dynamically for response
        try:
            computed_fmv = compute_fmv_value(deal)
            deal['fmv'] = computed_fmv
        except Exception:
            pass
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

        # Compute FMV for each deal in the response to ensure correctness
        try:
            deals = result.get('deals', []) or []
            for deal in deals:
                try:
                    deal['fmv'] = compute_fmv_value(deal)
                except Exception:
                    # Keep existing fmv if computation fails
                    pass
        except Exception as e:
            logger.warning(f"[get_deals] Failed to compute FMV for response list: {e}")

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