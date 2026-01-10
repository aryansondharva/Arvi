-- Add unique_member_id column to profiles table
-- Format: YYYY0001 (e.g., 20260001, 20260002, etc.)

-- Step 1: Add the column
ALTER TABLE profiles 
ADD COLUMN unique_member_id TEXT UNIQUE;

-- Step 2: Create a sequence for member IDs
CREATE SEQUENCE IF NOT EXISTS member_id_sequence
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

-- Step 3: Create function to generate unique member ID
CREATE OR REPLACE FUNCTION generate_unique_member_id()
RETURNS TEXT AS $$
DECLARE
    year_part TEXT;
    sequence_part TEXT;
    member_id TEXT;
    existing_count INTEGER;
    max_sequence INTEGER;
BEGIN
    -- Get current year
    year_part := EXTRACT(year FROM NOW())::TEXT;
    
    -- Check if we already have members for this year
    SELECT COUNT(*) INTO existing_count 
    FROM profiles 
    WHERE unique_member_id IS NOT NULL 
    AND unique_member_id LIKE year_part || '%';
    
    -- If we have existing members for this year, get the highest sequence number
    IF existing_count > 0 THEN
        -- Get the highest sequence number for this year
        SELECT MAX(CAST(SUBSTRING(unique_member_id, 5) AS INTEGER)) INTO max_sequence
        FROM profiles 
        WHERE unique_member_id IS NOT NULL 
        AND unique_member_id LIKE year_part || '%';
        
        -- Set sequence to next number
        PERFORM setval('member_id_sequence', COALESCE(max_sequence, 0) + 1, true);
    ELSE
        -- Start fresh for new year
        PERFORM setval('member_id_sequence', 1, true);
    END IF;
    
    -- Generate the member ID using the sequence
    sequence_part := nextval('member_id_sequence')::TEXT;
    member_id := year_part || LPAD(sequence_part, 4, '0');
    
    RETURN member_id;
END;
$$ LANGUAGE plpgsql;

-- Step 4: Create trigger to auto-generate member ID on profile creation
CREATE OR REPLACE FUNCTION set_member_id_trigger()
RETURNS TRIGGER AS $$
BEGIN
    -- Only generate member_id if it's not already set
    IF NEW.unique_member_id IS NULL THEN
        NEW.unique_member_id := generate_unique_member_id();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 5: Create the trigger
CREATE TRIGGER set_unique_member_id
    BEFORE INSERT ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION set_member_id_trigger();

-- Step 6: Update existing profiles to have member IDs
UPDATE profiles 
SET unique_member_id = generate_unique_member_id()
WHERE unique_member_id IS NULL;

-- Step 7: Add index for better performance
CREATE INDEX idx_profiles_member_id ON profiles(unique_member_id);

-- Step 8: Add comment for documentation
COMMENT ON COLUMN profiles.unique_member_id IS 'Unique member identifier in format YYYY0001 (e.g., 20260001)';
