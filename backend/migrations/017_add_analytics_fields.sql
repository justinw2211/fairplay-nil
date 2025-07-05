-- Migration 017: Add analytics-required fields to deals table
-- Created: 2025-01-05
-- Description: Add fields needed for comprehensive analytics dashboard

BEGIN;

-- Add brand_partner field (separate from payor_name for analytics)
ALTER TABLE public.deals 
ADD COLUMN brand_partner text DEFAULT NULL;

-- Add clearinghouse_result field for actual outcomes
ALTER TABLE public.deals 
ADD COLUMN clearinghouse_result text DEFAULT NULL;

-- Add actual_compensation field for tracking real compensation
ALTER TABLE public.deals 
ADD COLUMN actual_compensation numeric DEFAULT NULL;

-- Add valuation_range field for easier analytics access
ALTER TABLE public.deals 
ADD COLUMN valuation_range text DEFAULT NULL;

-- Add constraint for clearinghouse_result validation
ALTER TABLE public.deals 
ADD CONSTRAINT valid_clearinghouse_result CHECK (
  clearinghouse_result IS NULL OR 
  clearinghouse_result IN ('approved', 'denied', 'flagged', 'pending')
);

-- Update the status constraint to include analytics-friendly statuses
ALTER TABLE public.deals 
DROP CONSTRAINT IF EXISTS valid_status;

ALTER TABLE public.deals 
ADD CONSTRAINT valid_status CHECK (
  status IN ('draft', 'submitted', 'approved', 'rejected', 'active', 'completed', 'cancelled')
);

-- Create indexes for analytics performance
CREATE INDEX idx_deals_brand_partner ON public.deals(brand_partner) WHERE brand_partner IS NOT NULL;
CREATE INDEX idx_deals_clearinghouse_result ON public.deals(clearinghouse_result) WHERE clearinghouse_result IS NOT NULL;
CREATE INDEX idx_deals_actual_compensation ON public.deals(actual_compensation) WHERE actual_compensation IS NOT NULL;

-- Add comments for documentation
COMMENT ON COLUMN public.deals.brand_partner IS 'Brand partner name for analytics and reporting';
COMMENT ON COLUMN public.deals.clearinghouse_result IS 'Actual clearinghouse result: approved, denied, flagged, pending';
COMMENT ON COLUMN public.deals.actual_compensation IS 'Actual compensation received for valuation accuracy tracking';
COMMENT ON COLUMN public.deals.valuation_range IS 'Valuation range string for analytics (e.g., "1000-5000")';

-- Migrate existing data
-- Copy payor_name to brand_partner for existing records where brand_partner is null
UPDATE public.deals 
SET brand_partner = payor_name 
WHERE brand_partner IS NULL AND payor_name IS NOT NULL;

-- Update existing 'approved' status to 'active' for analytics compatibility
UPDATE public.deals 
SET status = 'active' 
WHERE status = 'approved';

-- Update existing 'rejected' status to 'cancelled' for analytics compatibility
UPDATE public.deals 
SET status = 'cancelled' 
WHERE status = 'rejected';

COMMIT; 