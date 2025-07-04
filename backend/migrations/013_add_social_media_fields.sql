-- Add social media platforms table for NIL compliance and deal matching
-- Migration 013: Add social media fields
BEGIN;

-- Create social media platforms table with proper constraints
CREATE TABLE IF NOT EXISTS public.social_media_platforms (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    platform TEXT NOT NULL CHECK (platform IN ('instagram', 'twitter', 'tiktok', 'youtube', 'facebook')),
    handle TEXT NOT NULL CHECK (handle ~ '^@[a-zA-Z0-9_]+$'),
    followers INTEGER DEFAULT 0 CHECK (followers >= 0),
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', NOW()),
    
    -- Ensure unique platform per user
    UNIQUE(user_id, platform)
);

-- Add indices for efficient querying (per cursor rules: performance basics)
CREATE INDEX IF NOT EXISTS idx_social_media_user_id ON public.social_media_platforms(user_id);
CREATE INDEX IF NOT EXISTS idx_social_media_platform ON public.social_media_platforms(platform);
CREATE INDEX IF NOT EXISTS idx_social_media_followers ON public.social_media_platforms(followers);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_social_media_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc', NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER social_media_updated_at_trigger
    BEFORE UPDATE ON public.social_media_platforms
    FOR EACH ROW EXECUTE FUNCTION public.update_social_media_updated_at();

-- Add social media completion tracking to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS social_media_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS social_media_completed_at TIMESTAMP WITH TIME ZONE;

-- Add social media data to deals table for compliance tracking
ALTER TABLE public.deals 
ADD COLUMN IF NOT EXISTS athlete_social_media JSONB,
ADD COLUMN IF NOT EXISTS social_media_confirmed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS social_media_confirmed_at TIMESTAMP WITH TIME ZONE;

-- Add indices for deal social media queries
CREATE INDEX IF NOT EXISTS idx_deals_social_media_confirmed ON public.deals(social_media_confirmed);

COMMIT; 