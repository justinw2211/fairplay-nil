-- Update sports field to support multiple sports
ALTER TABLE public.profiles 
  ALTER COLUMN sport TYPE text[] USING ARRAY[sport];

ALTER TABLE public.profiles 
  RENAME COLUMN sport TO sports; 