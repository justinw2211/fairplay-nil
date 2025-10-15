-- Migration 027: Allow periods in social media handles
-- Update CHECK constraint to allow periods (.) in handles

BEGIN;

-- Drop the existing CHECK constraint on the handle column
ALTER TABLE public.social_media_platforms 
DROP CONSTRAINT IF EXISTS social_media_platforms_handle_check;

-- Add the new CHECK constraint allowing letters, numbers, underscores, and periods
ALTER TABLE public.social_media_platforms 
ADD CONSTRAINT social_media_platforms_handle_check 
CHECK (handle ~ '^@[a-zA-Z0-9_.]+$');

COMMIT;

