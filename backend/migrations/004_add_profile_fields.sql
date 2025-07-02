-- Add missing profile fields
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS division text,
  ADD COLUMN IF NOT EXISTS gender text; 