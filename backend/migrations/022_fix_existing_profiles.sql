-- Migration 022: Fix existing profiles with null values
-- Created: 2025-07-30
-- Description: Update existing profiles with correct data from auth.users metadata

BEGIN;

-- Update profiles for users who have metadata but null profile values
UPDATE profiles 
SET 
  phone = auth_users.phone,
  division = auth_users.division::ncaa_division,
  university = auth_users.university,
  gender = auth_users.gender,
  sports = auth_users.sports_array,
  expected_graduation_year = auth_users.graduation_year
FROM (
  SELECT 
    au.id,
    au.raw_user_meta_data->>'phone' as phone,
    au.raw_user_meta_data->>'division' as division,
    au.raw_user_meta_data->>'university' as university,
    au.raw_user_meta_data->>'gender' as gender,
    CASE 
      WHEN au.raw_user_meta_data->'sports' IS NOT NULL AND jsonb_array_length(au.raw_user_meta_data->'sports') > 0 
      THEN (
        SELECT array_agg(value::text) 
        FROM jsonb_array_elements_text(au.raw_user_meta_data->'sports')
      )
      ELSE NULL
    END as sports_array,
    CASE 
      WHEN au.raw_user_meta_data->>'expected_graduation_year' IS NOT NULL 
      AND au.raw_user_meta_data->>'expected_graduation_year' != ''
      THEN (au.raw_user_meta_data->>'expected_graduation_year')::INTEGER
      ELSE NULL
    END as graduation_year
  FROM auth.users au
  WHERE au.raw_user_meta_data->>'role' = 'student-athlete'
) auth_users
WHERE profiles.id = auth_users.id
  AND (
    profiles.phone IS NULL OR 
    profiles.division IS NULL OR 
    profiles.university IS NULL OR 
    profiles.gender IS NULL OR 
    profiles.sports IS NULL OR 
    profiles.expected_graduation_year IS NULL
  );

COMMIT; 