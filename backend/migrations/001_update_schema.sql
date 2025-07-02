-- First, let's check and update existing status values
-- Update any NULL status values to 'draft'
UPDATE public.deals
SET status = 'draft'
WHERE status IS NULL;

-- Update any status values that don't match our valid options to 'draft'
UPDATE public.deals 
SET status = 'draft' 
WHERE status NOT IN ('draft', 'submitted', 'approved', 'rejected');

-- Now proceed with the schema updates
-- Update deals table schema to match frontend wizard flow
ALTER TABLE public.deals
  -- Remove unused columns
  DROP COLUMN IF EXISTS division,
  DROP COLUMN IF EXISTS conference,
  DROP COLUMN IF EXISTS gender,
  DROP COLUMN IF EXISTS graduation_year,
  DROP COLUMN IF EXISTS age,
  DROP COLUMN IF EXISTS gpa,
  DROP COLUMN IF EXISTS achievements,
  DROP COLUMN IF EXISTS athlete_status,
  DROP COLUMN IF EXISTS followers_instagram,
  DROP COLUMN IF EXISTS followers_tiktok,
  DROP COLUMN IF EXISTS followers_twitter,
  DROP COLUMN IF EXISTS followers_youtube,
  DROP COLUMN IF EXISTS deliverables_instagram,
  DROP COLUMN IF EXISTS deliverables_tiktok,
  DROP COLUMN IF EXISTS deliverables_twitter,
  DROP COLUMN IF EXISTS deliverables_youtube,
  DROP COLUMN IF EXISTS deliverable_other,
  DROP COLUMN IF EXISTS payment_structure,
  DROP COLUMN IF EXISTS deal_length_months,
  DROP COLUMN IF EXISTS geography,
  DROP COLUMN IF EXISTS is_real_submission,
  DROP COLUMN IF EXISTS fmv_estimate,
  DROP COLUMN IF EXISTS compliance_pass,
  DROP COLUMN IF EXISTS timestamp, -- using created_at instead
  DROP COLUMN IF EXISTS payor_industry,
  DROP COLUMN IF EXISTS payor_relationship_details,
  DROP COLUMN IF EXISTS deal_description,
  DROP COLUMN IF EXISTS compensation_type,
  DROP COLUMN IF EXISTS compensation_in_kind_description,
  DROP COLUMN IF EXISTS has_written_contract,
  DROP COLUMN IF EXISTS agent_name,
  DROP COLUMN IF EXISTS agent_agency,
  DROP COLUMN IF EXISTS compliance_score,
  DROP COLUMN IF EXISTS compliance_flags,
  DROP COLUMN IF EXISTS contract_url,
  DROP COLUMN IF EXISTS has_conflicts;

-- Add new columns for deal wizard
ALTER TABLE public.deals
  ADD COLUMN IF NOT EXISTS deal_nickname text,
  ADD COLUMN IF NOT EXISTS deal_terms_url text,
  ADD COLUMN IF NOT EXISTS deal_terms_file_name text,
  ADD COLUMN IF NOT EXISTS deal_terms_file_type text,
  ADD COLUMN IF NOT EXISTS deal_terms_file_size bigint,
  ADD COLUMN IF NOT EXISTS activities jsonb DEFAULT '[]',
  -- Modify existing jsonb columns to ensure they exist with defaults
  ALTER COLUMN obligations TYPE jsonb USING COALESCE(obligations, '{}'),
  ALTER COLUMN compensation_goods TYPE jsonb USING COALESCE(compensation_goods, '[]'),
  ALTER COLUMN compensation_other TYPE jsonb USING COALESCE(compensation_other, '[]');

-- Drop existing status constraint if it exists
ALTER TABLE public.deals DROP CONSTRAINT IF EXISTS valid_status;

-- Add constraints
ALTER TABLE public.deals
  ADD CONSTRAINT valid_status CHECK (status IN ('draft', 'submitted', 'approved', 'rejected')),
  ADD CONSTRAINT valid_file_type CHECK (
    deal_terms_file_type IS NULL OR 
    deal_terms_file_type IN ('pdf', 'docx', 'png', 'jpg', 'jpeg')
  );

-- Update profiles table
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS avatar_url text,
  ADD COLUMN IF NOT EXISTS university text,
  ADD COLUMN IF NOT EXISTS sport text,
  -- Convert sports array to single sport field
  DROP COLUMN IF EXISTS sports;

-- Add indexes for common queries
CREATE INDEX IF NOT EXISTS idx_deals_user_id ON public.deals(user_id);
CREATE INDEX IF NOT EXISTS idx_deals_status ON public.deals(status);
CREATE INDEX IF NOT EXISTS idx_deals_created_at ON public.deals(created_at);

-- Set default values for existing records
UPDATE public.deals
SET 
  activities = '[]'::jsonb,
  obligations = '{}'::jsonb,
  compensation_goods = '[]'::jsonb,
  compensation_other = '[]'::jsonb
WHERE 
  activities IS NULL OR 
  obligations IS NULL OR 
  compensation_goods IS NULL OR 
  compensation_other IS NULL; 