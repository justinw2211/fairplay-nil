-- Add email and phone columns to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT;

-- Update email column with current auth.users email
UPDATE profiles
SET email = (
  SELECT email
  FROM auth.users
  WHERE auth.users.id = profiles.id
);

-- Add comment for documentation
COMMENT ON COLUMN profiles.email IS 'User''s email address';
COMMENT ON COLUMN profiles.phone IS 'User''s phone number in raw digits (no formatting)'; 