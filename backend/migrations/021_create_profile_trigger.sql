-- Migration 021: Create profile trigger on auth.users table
-- Created: 2025-07-30
-- Description: Create the trigger on auth.users table to handle new user profile creation

BEGIN;

-- Create the function if it doesn't exist
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  sports_array text[];
BEGIN
  -- Handle sports array - it's already an array in metadata, not a comma-separated string
  IF new.raw_user_meta_data->'sports' IS NOT NULL AND jsonb_array_length(new.raw_user_meta_data->'sports') > 0 THEN
    -- Convert JSON array to text array
    SELECT array_agg(value::text) INTO sports_array
    FROM jsonb_array_elements_text(new.raw_user_meta_data->'sports');
  ELSE
    sports_array := NULL;
  END IF;

  INSERT INTO public.profiles (
    id, 
    full_name, 
    role,
    phone,
    division,
    university,
    gender,
    sports,
    expected_graduation_year
  )
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    COALESCE(new.raw_user_meta_data->>'role', 'athlete'),
    COALESCE(new.raw_user_meta_data->>'phone', ''),
    COALESCE(new.raw_user_meta_data->>'division', ''),
    COALESCE(new.raw_user_meta_data->>'university', ''),
    COALESCE(new.raw_user_meta_data->>'gender', ''),
    sports_array,
    CASE 
      WHEN new.raw_user_meta_data->>'expected_graduation_year' IS NOT NULL 
      AND new.raw_user_meta_data->>'expected_graduation_year' != ''
      THEN (new.raw_user_meta_data->>'expected_graduation_year')::INTEGER
      ELSE NULL
    END
  );
  RETURN new;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the user creation
    RAISE WARNING 'Error creating profile for user %: %', new.id, SQLERRM;
    -- Insert minimal profile to prevent complete failure
    INSERT INTO public.profiles (id, full_name, role)
    VALUES (new.id, COALESCE(new.raw_user_meta_data->>'full_name', ''), 'athlete');
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger on auth.users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

COMMIT; 