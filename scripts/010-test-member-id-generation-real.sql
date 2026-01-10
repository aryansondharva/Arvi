-- Test script to verify sequential member ID generation
-- This script works with real authentication system

-- Clean up test data (optional - uncomment to reset)
-- DELETE FROM profiles WHERE email LIKE 'test%@example.com';

-- Test 1: Check existing member IDs to see current sequence
SELECT 
  id,
  email,
  full_name,
  unique_member_id,
  joined_at,
  CASE 
    WHEN unique_member_id IS NOT NULL THEN 'Generated'
    ELSE 'Missing'
  END as status
FROM profiles 
WHERE unique_member_id IS NOT NULL 
ORDER BY joined_at DESC
LIMIT 10;

-- Test 2: Verify sequence is working correctly
SELECT 
  'Current Year Members' as info,
  COUNT(*) as count,
  MIN(unique_member_id) as first_id,
  MAX(unique_member_id) as last_id
FROM profiles 
WHERE unique_member_id IS NOT NULL 
AND unique_member_id LIKE EXTRACT(year FROM NOW())::TEXT || '%';

-- Test 3: Check next sequence value
SELECT 
  'Next Sequence Value' as info,
  last_value as current_sequence,
  is_called as has_been_called
FROM member_id_sequence;

-- Test 4: Manual generation test (simulates what trigger does)
SELECT generate_unique_member_id() as next_member_id;

-- Test 5: Check trigger exists and is working
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_timing,
  action_condition
FROM information_schema.triggers 
WHERE trigger_name = 'set_unique_member_id';

-- Test 6: Verify function exists
SELECT 
  routine_name,
  routine_type,
  data_type
FROM information_schema.routines 
WHERE routine_name = 'generate_unique_member_id';

-- Expected Results:
-- 1. Should see existing member IDs in sequential order
-- 2. Current year members should show correct count and range
-- 3. Sequence should show next available number
-- 4. Manual generation should produce next valid ID
-- 5. Trigger and function should exist

-- To test with real users:
-- 1. Create accounts via /auth/signup
-- 2. Check their member IDs in the profiles table
-- 3. Verify sequential ordering by joined_at
