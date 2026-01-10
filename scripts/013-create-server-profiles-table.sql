-- Create server_profiles table for server management
-- This table is referenced in 015-participant-certificate-sharing.sql but was missing

CREATE TABLE IF NOT EXISTS server_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  server_name TEXT NOT NULL,
  server_type TEXT NOT NULL CHECK (server_type IN ('environmental', 'waste_management', 'forest_conservation', 'water_management', 'general')),
  organization TEXT,
  contact_email TEXT,
  license_number TEXT,
  certification_level TEXT DEFAULT 'bronze' CHECK (certification_level IN ('bronze', 'silver', 'gold', 'platinum', 'diamond')),
  service_area TEXT,
  max_capacity INTEGER DEFAULT 100,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE server_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for server_profiles
CREATE POLICY "Public can view active server profiles"
  ON server_profiles FOR SELECT
  USING (is_active = true);

CREATE POLICY "Servers can view own profile"
  ON server_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own server profile"
  ON server_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Servers can update own profile"
  ON server_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_server_profiles_user_id ON server_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_server_profiles_active ON server_profiles(is_active);
CREATE INDEX IF NOT EXISTS idx_server_profiles_type ON server_profiles(server_type);
CREATE INDEX IF NOT EXISTS idx_server_profiles_contact_email ON server_profiles(contact_email);

-- Add trigger for updated_at
CREATE TRIGGER handle_server_profiles_updated_at
  BEFORE UPDATE ON server_profiles
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
