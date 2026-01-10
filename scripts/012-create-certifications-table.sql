-- Create participant_certifications table for certificate management
-- This table is referenced in 015-participant-certificate-sharing.sql but was missing

CREATE TABLE IF NOT EXISTS participant_certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  certification_name TEXT NOT NULL,
  certification_type TEXT NOT NULL,
  issued_by UUID REFERENCES profiles(id), -- Server who issued the certification
  issued_date TIMESTAMP WITH TIME ZONE NOT NULL,
  expiry_date TIMESTAMP WITH TIME ZONE,
  achievement_criteria TEXT,
  certificate_url TEXT, -- URL to certificate file/image
  is_active BOOLEAN DEFAULT TRUE, -- Whether certification is currently valid
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE participant_certifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for participant_certifications
CREATE POLICY "Users can view own certifications"
  ON participant_certifications FOR SELECT
  USING (auth.uid() = participant_id);

CREATE POLICY "Users can insert own certifications"
  ON participant_certifications FOR INSERT
  WITH CHECK (auth.uid() = participant_id);

CREATE POLICY "Users can update own certifications"
  ON participant_certifications FOR UPDATE
  USING (auth.uid() = participant_id);

CREATE POLICY "Servers can view certifications they issued"
  ON participant_certifications FOR SELECT
  USING (auth.uid() = issued_by);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_participant_certifications_participant_id ON participant_certifications(participant_id);
CREATE INDEX IF NOT EXISTS idx_participant_certifications_issued_by ON participant_certifications(issued_by);
CREATE INDEX IF NOT EXISTS idx_participant_certifications_type ON participant_certifications(certification_type);
CREATE INDEX IF NOT EXISTS idx_participant_certifications_active ON participant_certifications(is_active);

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER handle_participant_certifications_updated_at
  BEFORE UPDATE ON participant_certifications
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
