-- Migration to clean up schema and remove redundant fields
BEGIN;

-- 1. Handle profiles table cleanup first
ALTER TABLE public.profiles
  -- Remove redundant/unused columns
  DROP COLUMN IF EXISTS division,
  DROP COLUMN IF EXISTS gender,
  DROP COLUMN IF EXISTS graduation_year;

-- Copy school data to university if university is null
UPDATE public.profiles 
SET university = school 
WHERE university IS NULL AND school IS NOT NULL;

-- Remove school column after data migration
ALTER TABLE public.profiles 
DROP COLUMN IF EXISTS school;

-- 2. Clean up deals table
-- First, ensure any important data is preserved in the activities JSONB
UPDATE public.deals 
SET activities = COALESCE(activities, '[]'::jsonb) || jsonb_build_array(
  jsonb_build_object(
    'activity_type', COALESCE(deal_type, 'other'),
    'category', deal_category,
    'brand_partner', brand_partner,
    'details', jsonb_build_object(
      'name', name,
      'email', email,
      'school', school
    )
  )
)
WHERE (deal_type IS NOT NULL OR deal_category IS NOT NULL OR brand_partner IS NOT NULL)
  AND (activities IS NULL OR activities::text = '[]');

-- Now remove redundant columns from deals
ALTER TABLE public.deals
  DROP COLUMN IF EXISTS name,
  DROP COLUMN IF EXISTS email,
  DROP COLUMN IF EXISTS school,
  DROP COLUMN IF EXISTS sport,
  DROP COLUMN IF EXISTS deal_type,
  DROP COLUMN IF EXISTS deal_category,
  DROP COLUMN IF EXISTS brand_partner;

-- 3. Ensure all JSONB columns have proper defaults
ALTER TABLE public.deals
  ALTER COLUMN activities SET DEFAULT '[]'::jsonb,
  ALTER COLUMN obligations SET DEFAULT '{}'::jsonb,
  ALTER COLUMN compensation_goods SET DEFAULT '[]'::jsonb,
  ALTER COLUMN compensation_other SET DEFAULT '[]'::jsonb;

-- Update any null JSONB values to their defaults
UPDATE public.deals
SET 
  activities = COALESCE(activities, '[]'::jsonb),
  obligations = COALESCE(obligations, '{}'::jsonb),
  compensation_goods = COALESCE(compensation_goods, '[]'::jsonb),
  compensation_other = COALESCE(compensation_other, '[]'::jsonb);

-- 4. Add or update constraints
-- First drop existing constraints if they exist
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'valid_status') THEN
    ALTER TABLE public.deals DROP CONSTRAINT valid_status;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'valid_file_type') THEN
    ALTER TABLE public.deals DROP CONSTRAINT valid_file_type;
  END IF;
END $$;

-- Add updated constraints
ALTER TABLE public.deals
  ADD CONSTRAINT valid_status 
    CHECK (status IN ('draft', 'submitted', 'approved', 'rejected')),
  ADD CONSTRAINT valid_file_type 
    CHECK (deal_terms_file_type IS NULL OR 
           deal_terms_file_type IN ('pdf', 'docx', 'png', 'jpg', 'jpeg'));

-- 5. Ensure indexes exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_deals_user_id') THEN
    CREATE INDEX idx_deals_user_id ON public.deals(user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_deals_status') THEN
    CREATE INDEX idx_deals_status ON public.deals(status);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_deals_created_at') THEN
    CREATE INDEX idx_deals_created_at ON public.deals(created_at);
  END IF;
END $$;

-- 6. Verify data integrity
DO $$ 
DECLARE
  invalid_status_count integer;
  invalid_file_type_count integer;
  null_jsonb_count integer;
BEGIN
  -- Check for invalid status values
  SELECT COUNT(*) INTO invalid_status_count 
  FROM public.deals 
  WHERE status NOT IN ('draft', 'submitted', 'approved', 'rejected');
  
  -- Check for invalid file types
  SELECT COUNT(*) INTO invalid_file_type_count 
  FROM public.deals 
  WHERE deal_terms_file_type IS NOT NULL 
    AND deal_terms_file_type NOT IN ('pdf', 'docx', 'png', 'jpg', 'jpeg');
    
  -- Check for null JSONB fields
  SELECT COUNT(*) INTO null_jsonb_count 
  FROM public.deals 
  WHERE activities IS NULL 
     OR obligations IS NULL 
     OR compensation_goods IS NULL 
     OR compensation_other IS NULL;
  
  IF invalid_status_count > 0 THEN
    RAISE EXCEPTION 'Found % deals with invalid status values', invalid_status_count;
  END IF;
  
  IF invalid_file_type_count > 0 THEN
    RAISE EXCEPTION 'Found % deals with invalid file types', invalid_file_type_count;
  END IF;
  
  IF null_jsonb_count > 0 THEN
    RAISE EXCEPTION 'Found % deals with null JSONB fields', null_jsonb_count;
  END IF;
END $$;

COMMIT; 