-- ENABLE AUTO-CONFIRMATION FOR DEVELOPMENT
-- This allows users to login immediately after signup without clicking email confirmation links

-- Step 1: Confirm all existing unconfirmed users
UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE email_confirmed_at IS NULL;

-- Step 2: Enable the auto-confirm trigger for new signups
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created 
  BEFORE INSERT ON auth.users 
  FOR EACH ROW 
  EXECUTE FUNCTION auto_confirm_user();

-- Note: In production, you should disable this trigger and use proper email confirmation
-- To disable: DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
