-- Migration 017: Add deal duration and company type fields to deals table
-- Created: 2025-01-23
-- Description: Add support for deal duration tracking and payor company classification

BEGIN;

-- Add deal duration columns
ALTER TABLE public.deals 
ADD COLUMN deal_duration_years integer DEFAULT NULL;

ALTER TABLE public.deals 
ADD COLUMN deal_duration_months integer DEFAULT NULL;

ALTER TABLE public.deals 
ADD COLUMN deal_duration_total_months integer DEFAULT NULL;

-- Add payor company type columns
ALTER TABLE public.deals 
ADD COLUMN payor_company_size text DEFAULT NULL;

ALTER TABLE public.deals 
ADD COLUMN payor_industries text[] DEFAULT NULL;

-- Add constraints for deal duration validation
ALTER TABLE public.deals 
ADD CONSTRAINT valid_deal_duration_years CHECK (
  deal_duration_years IS NULL OR (deal_duration_years >= 0 AND deal_duration_years <= 10)
);

ALTER TABLE public.deals 
ADD CONSTRAINT valid_deal_duration_months CHECK (
  deal_duration_months IS NULL OR (deal_duration_months >= 0 AND deal_duration_months <= 11)
);

ALTER TABLE public.deals 
ADD CONSTRAINT valid_deal_duration_total_months CHECK (
  deal_duration_total_months IS NULL OR (deal_duration_total_months > 0 AND deal_duration_total_months <= 120)
);

-- Add constraint for payor company size validation
ALTER TABLE public.deals 
ADD CONSTRAINT valid_payor_company_size CHECK (
  payor_company_size IS NULL OR payor_company_size IN (
    'individual', 'small_business', 'medium_business', 'large_corporation', 
    'startup', 'nonprofit', 'government', 'other'
  )
);

-- Add indexes for performance on new fields
CREATE INDEX idx_deals_duration_years ON public.deals(deal_duration_years) 
WHERE deal_duration_years IS NOT NULL;

CREATE INDEX idx_deals_duration_total_months ON public.deals(deal_duration_total_months) 
WHERE deal_duration_total_months IS NOT NULL;

CREATE INDEX idx_deals_company_size ON public.deals(payor_company_size) 
WHERE payor_company_size IS NOT NULL;

CREATE INDEX idx_deals_industries ON public.deals USING GIN (payor_industries) 
WHERE payor_industries IS NOT NULL;

-- Add comments to track the migration
COMMENT ON COLUMN public.deals.deal_duration_years IS 'Contract duration in years (0-10)';
COMMENT ON COLUMN public.deals.deal_duration_months IS 'Contract duration in months (0-11)';
COMMENT ON COLUMN public.deals.deal_duration_total_months IS 'Total contract duration in months for calculations (1-120)';
COMMENT ON COLUMN public.deals.payor_company_size IS 'Revenue-based company size classification';
COMMENT ON COLUMN public.deals.payor_industries IS 'Array of industries the payor company operates in';

COMMIT;
