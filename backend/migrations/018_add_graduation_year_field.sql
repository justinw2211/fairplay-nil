-- Migration 018: Add expected_graduation_year field to profiles table
-- Created: 2025-07-30
-- Description: Add graduation year field for student-athletes with validation

BEGIN;

-- Add expected_graduation_year field to profiles table
ALTER TABLE public.profiles 
ADD COLUMN expected_graduation_year INTEGER DEFAULT NULL;

-- Add constraint for graduation year validation (2025-2035 range)
ALTER TABLE public.profiles 
ADD CONSTRAINT valid_graduation_year CHECK (
  expected_graduation_year IS NULL OR 
  (expected_graduation_year >= 2025 AND expected_graduation_year <= 2035)
);

-- Create index for performance on graduation year queries
CREATE INDEX idx_profiles_graduation_year ON public.profiles(expected_graduation_year) WHERE expected_graduation_year IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.expected_graduation_year IS 'Expected graduation year for student-athletes (2025-2035 range)';

COMMIT; 