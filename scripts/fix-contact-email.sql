-- Fix: Add missing contact_email column to server_profiles table
ALTER TABLE server_profiles 
ADD COLUMN IF NOT EXISTS contact_email TEXT;

-- Create index for contact_email if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_server_profiles_email ON server_profiles(contact_email);

-- Update existing server profile to include contact_email
UPDATE server_profiles 
SET contact_email = 'server@ecovolunteer.com' 
WHERE contact_email IS NULL AND user_id IN (
    SELECT id FROM profiles WHERE email = 'server@ecovolunteer.com'
);

-- Verify the column exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'server_profiles' 
AND column_name = 'contact_email';
