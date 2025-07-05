-- Migration 016: Add deal type and prediction fields to deals table
-- Created: 2025-01-05
-- Description: Add support for different deal workflows and prediction storage

BEGIN;

-- Add deal_type column with enum constraint and default value
ALTER TABLE public.deals 
ADD COLUMN deal_type text DEFAULT 'simple' NOT NULL;

-- Add prediction storage columns using JSONB
ALTER TABLE public.deals 
ADD COLUMN clearinghouse_prediction jsonb DEFAULT NULL;

ALTER TABLE public.deals 
ADD COLUMN valuation_prediction jsonb DEFAULT NULL;

-- Add payor_type column that was missing
ALTER TABLE public.deals 
ADD COLUMN payor_type text DEFAULT NULL;

-- Add constraints for deal_type validation
ALTER TABLE public.deals 
ADD CONSTRAINT valid_deal_type CHECK (
  deal_type IN ('simple', 'clearinghouse', 'valuation', 'standard')
);

-- Add constraint for payor_type validation
ALTER TABLE public.deals 
ADD CONSTRAINT valid_payor_type CHECK (
  payor_type IS NULL OR payor_type IN ('business', 'individual')
);

-- Update the DEAL_SELECT_FIELDS to include new columns (this is a comment for reference)
-- New fields to add to API: deal_type, clearinghouse_prediction, valuation_prediction, payor_type

-- Add indexes for performance on deal_type queries
CREATE INDEX idx_deals_deal_type ON public.deals(deal_type);

-- Add indexes for prediction queries (useful for dashboard filtering)
CREATE INDEX idx_deals_clearinghouse_prediction ON public.deals USING GIN (clearinghouse_prediction) 
WHERE clearinghouse_prediction IS NOT NULL;

CREATE INDEX idx_deals_valuation_prediction ON public.deals USING GIN (valuation_prediction) 
WHERE valuation_prediction IS NOT NULL;

-- Update existing deals to have deal_type = 'simple' (already set by DEFAULT)
-- This ensures backwards compatibility with all existing deals

-- Add a comment to track the migration
COMMENT ON COLUMN public.deals.deal_type IS 'Type of deal workflow: simple, clearinghouse, valuation, or standard';
COMMENT ON COLUMN public.deals.clearinghouse_prediction IS 'NIL Go clearinghouse prediction results as JSON';
COMMENT ON COLUMN public.deals.valuation_prediction IS 'Fair market value prediction results as JSON';
COMMENT ON COLUMN public.deals.payor_type IS 'Type of payor: business or individual';

COMMIT; 