-- Fix missing columns in participant_certifications table
-- This script adds any missing columns that should exist

-- Add expiry_date column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'participant_certifications' 
        AND column_name = 'expiry_date'
    ) THEN
        ALTER TABLE participant_certifications 
        ADD COLUMN expiry_date TIMESTAMP WITH TIME ZONE;
        RAISE NOTICE 'Added expiry_date column to participant_certifications';
    END IF;
END $$;

-- Add certificate_url column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'participant_certifications' 
        AND column_name = 'certificate_url'
    ) THEN
        ALTER TABLE participant_certifications 
        ADD COLUMN certificate_url TEXT;
        RAISE NOTICE 'Added certificate_url column to participant_certifications';
    END IF;
END $$;

-- Add achievement_criteria column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'participant_certifications' 
        AND column_name = 'achievement_criteria'
    ) THEN
        ALTER TABLE participant_certifications 
        ADD COLUMN achievement_criteria TEXT;
        RAISE NOTICE 'Added achievement_criteria column to participant_certifications';
    END IF;
END $$;

-- Add is_active column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'participant_certifications' 
        AND column_name = 'is_active'
    ) THEN
        ALTER TABLE participant_certifications 
        ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
        RAISE NOTICE 'Added is_active column to participant_certifications';
    END IF;
END $$;

-- Add updated_at column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'participant_certifications' 
        AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE participant_certifications 
        ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE 'Added updated_at column to participant_certifications';
    END IF;
END $$;

-- Add sharing columns if they don't exist (for certificate review workflow)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'participant_certifications' 
        AND column_name = 'shared_with_server'
    ) THEN
        ALTER TABLE participant_certifications 
        ADD COLUMN shared_with_server UUID REFERENCES server_profiles(id);
        RAISE NOTICE 'Added shared_with_server column to participant_certifications';
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'participant_certifications' 
        AND column_name = 'sharing_status'
    ) THEN
        ALTER TABLE participant_certifications 
        ADD COLUMN sharing_status TEXT DEFAULT 'not_shared' CHECK (sharing_status IN ('not_shared', 'pending', 'under_review', 'approved', 'rejected', 'needs_revision'));
        RAISE NOTICE 'Added sharing_status column to participant_certifications';
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'participant_certifications' 
        AND column_name = 'sharing_request_date'
    ) THEN
        ALTER TABLE participant_certifications 
        ADD COLUMN sharing_request_date TIMESTAMP WITH TIME ZONE;
        RAISE NOTICE 'Added sharing_request_date column to participant_certifications';
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'participant_certifications' 
        AND column_name = 'sharing_review_date'
    ) THEN
        ALTER TABLE participant_certifications 
        ADD COLUMN sharing_review_date TIMESTAMP WITH TIME ZONE;
        RAISE NOTICE 'Added sharing_review_date column to participant_certifications';
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'participant_certifications' 
        AND column_name = 'sharing_reviewed_by'
    ) THEN
        ALTER TABLE participant_certifications 
        ADD COLUMN sharing_reviewed_by UUID REFERENCES profiles(id);
        RAISE NOTICE 'Added sharing_reviewed_by column to participant_certifications';
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'participant_certifications' 
        AND column_name = 'sharing_review_notes'
    ) THEN
        ALTER TABLE participant_certifications 
        ADD COLUMN sharing_review_notes TEXT;
        RAISE NOTICE 'Added sharing_review_notes column to participant_certifications';
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'participant_certifications' 
        AND column_name = 'sharing_rejection_reason'
    ) THEN
        ALTER TABLE participant_certifications 
        ADD COLUMN sharing_rejection_reason TEXT;
        RAISE NOTICE 'Added sharing_rejection_reason column to participant_certifications';
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'participant_certifications' 
        AND column_name = 'sharing_revision_requested'
    ) THEN
        ALTER TABLE participant_certifications 
        ADD COLUMN sharing_revision_requested TEXT;
        RAISE NOTICE 'Added sharing_revision_requested column to participant_certifications';
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'participant_certifications' 
        AND column_name = 'is_publicly_shared'
    ) THEN
        ALTER TABLE participant_certifications 
        ADD COLUMN is_publicly_shared BOOLEAN DEFAULT FALSE;
        RAISE NOTICE 'Added is_publicly_shared column to participant_certifications';
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'participant_certifications' 
        AND column_name = 'shared_with_community'
    ) THEN
        ALTER TABLE participant_certifications 
        ADD COLUMN shared_with_community BOOLEAN DEFAULT FALSE;
        RAISE NOTICE 'Added shared_with_community column to participant_certifications';
    END IF;
END $$;

-- Create or replace trigger for updated_at
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS handle_participant_certifications_updated_at ON participant_certifications;

-- Create trigger
CREATE TRIGGER handle_participant_certifications_updated_at
    BEFORE UPDATE ON participant_certifications
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- Add indexes for sharing performance
CREATE INDEX IF NOT EXISTS idx_participant_certifications_shared_server ON participant_certifications(shared_with_server);
CREATE INDEX IF NOT EXISTS idx_participant_certifications_sharing_status ON participant_certifications(sharing_status);
CREATE INDEX IF NOT EXISTS idx_participant_certifications_sharing_date ON participant_certifications(sharing_request_date);

-- Verify table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'participant_certifications' 
ORDER BY ordinal_position;
