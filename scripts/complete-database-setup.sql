-- Complete Database Setup Script
-- This script creates all necessary tables and relationships for EcoVolunteer PRO
-- Run this script in order: 001 -> 011 -> 012 -> 013 -> 014 -> 015

-- ========================================
-- CORE TABLES (from 001-create-schema.sql)
-- ========================================

-- Create users profile table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  location TEXT,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create events table
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organizer_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  max_participants INTEGER,
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
  category TEXT NOT NULL CHECK (category IN ('beach-cleanup', 'forest-restoration', 'river-cleanup', 'park-maintenance', 'wildlife-conservation', 'other')),
  difficulty TEXT DEFAULT 'beginner' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create event participants table
CREATE TABLE IF NOT EXISTS event_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'registered' CHECK (status IN ('registered', 'attended', 'cancelled')),
  registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

-- Create impact logs table
CREATE TABLE IF NOT EXISTS impact_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  waste_collected_kg DECIMAL(10, 2) DEFAULT 0,
  area_cleaned_sqm DECIMAL(10, 2) DEFAULT 0,
  trees_planted INTEGER DEFAULT 0,
  wildlife_protected INTEGER DEFAULT 0,
  photos TEXT[], -- Array of photo URLs
  notes TEXT,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create achievements table
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  criteria_type TEXT NOT NULL CHECK (criteria_type IN ('events_attended', 'waste_collected', 'trees_planted', 'streak_days')),
  criteria_value INTEGER NOT NULL,
  badge_tier TEXT DEFAULT 'bronze' CHECK (badge_tier IN ('bronze', 'silver', 'gold', 'platinum'))
);

-- Create user achievements table
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE NOT NULL,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- Create leaderboard table (materialized view data)
CREATE TABLE IF NOT EXISTS leaderboard (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  total_points INTEGER DEFAULT 0,
  events_attended INTEGER DEFAULT 0,
  waste_collected_kg DECIMAL(10, 2) DEFAULT 0,
  trees_planted INTEGER DEFAULT 0,
  rank INTEGER,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('event_reminder', 'achievement_earned', 'event_update', 'new_follower', 'message')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- CERTIFICATION TABLES (from 012-create-certifications-table.sql)
-- ========================================

-- Create participant_certifications table for certificate management
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

-- ========================================
-- SERVER PROFILES (from 013-create-server-profiles-table.sql)
-- ========================================

-- Create server_profiles table for server management
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

-- ========================================
-- SERVER MANAGEMENT TABLES (from 014-server-management-system-complete.sql)
-- ========================================

-- Server certifications table
CREATE TABLE IF NOT EXISTS server_certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  server_id UUID REFERENCES server_profiles(id) ON DELETE CASCADE NOT NULL,
  certification_name TEXT NOT NULL,
  certification_type TEXT NOT NULL,
  issuing_authority TEXT,
  issue_date TIMESTAMP WITH TIME ZONE,
  expiry_date TIMESTAMP WITH TIME ZONE,
  certificate_number TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Server impact tracking table
CREATE TABLE IF NOT EXISTS server_impact_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  server_id UUID REFERENCES server_profiles(id) ON DELETE CASCADE NOT NULL,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  impact_score INTEGER DEFAULT 0,
  waste_collected_kg DECIMAL(10, 2) DEFAULT 0,
  trees_planted INTEGER DEFAULT 0,
  area_cleaned_sqm DECIMAL(10, 2) DEFAULT 0,
  participants_count INTEGER DEFAULT 0,
  tracking_date DATE DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Server tasks table
CREATE TABLE IF NOT EXISTS server_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  server_id UUID REFERENCES server_profiles(id) ON DELETE CASCADE NOT NULL,
  task_name TEXT NOT NULL,
  task_description TEXT,
  task_type TEXT DEFAULT 'general' CHECK (task_type IN ('general', 'certification', 'compliance', 'maintenance', 'review')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  assigned_to UUID REFERENCES profiles(id),
  due_date TIMESTAMP WITH TIME ZONE,
  completion_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Server reviews table
CREATE TABLE IF NOT EXISTS server_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  server_id UUID REFERENCES server_profiles(id) ON DELETE CASCADE NOT NULL,
  reviewer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  review_type TEXT NOT NULL CHECK (review_type IN ('performance', 'compliance', 'service', 'general')),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  review_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Server compliance checks table
CREATE TABLE IF NOT EXISTS server_compliance_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  server_id UUID REFERENCES server_profiles(id) ON DELETE CASCADE NOT NULL,
  check_type TEXT NOT NULL CHECK (check_type IN ('safety', 'environmental', 'operational', 'certification')),
  check_name TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'passed', 'failed', 'requires_action')),
  check_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  next_check_date TIMESTAMP WITH TIME ZONE,
  findings TEXT,
  corrective_actions TEXT,
  checked_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Server equipment table
CREATE TABLE IF NOT EXISTS server_equipment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  server_id UUID REFERENCES server_profiles(id) ON DELETE CASCADE NOT NULL,
  equipment_name TEXT NOT NULL,
  equipment_type TEXT NOT NULL,
  serial_number TEXT,
  purchase_date TIMESTAMP WITH TIME ZONE,
  last_maintenance_date TIMESTAMP WITH TIME ZONE,
  next_maintenance_date TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'operational' CHECK (status IN ('operational', 'maintenance', 'repair', 'retired')),
  location TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Server training records table
CREATE TABLE IF NOT EXISTS server_training_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  server_id UUID REFERENCES server_profiles(id) ON DELETE CASCADE NOT NULL,
  training_name TEXT NOT NULL,
  training_type TEXT NOT NULL,
  trainer_id UUID REFERENCES profiles(id),
  training_date TIMESTAMP WITH TIME ZONE,
  completion_status TEXT DEFAULT 'pending' CHECK (completion_status IN ('pending', 'in_progress', 'completed', 'failed')),
  certificate_issued BOOLEAN DEFAULT FALSE,
  expiry_date TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Server financial tracking table
CREATE TABLE IF NOT EXISTS server_financial_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  server_id UUID REFERENCES server_profiles(id) ON DELETE CASCADE NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('income', 'expense', 'grant', 'donation')),
  amount DECIMAL(12, 2) NOT NULL,
  description TEXT,
  category TEXT,
  transaction_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reference_number TEXT,
  status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Server performance metrics table
CREATE TABLE IF NOT EXISTS server_performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  server_id UUID REFERENCES server_profiles(id) ON DELETE CASCADE NOT NULL,
  metric_date DATE DEFAULT CURRENT_DATE,
  total_certifications_issued INTEGER DEFAULT 0,
  overall_performance_score DECIMAL(5, 2) DEFAULT 0,
  compliance_score DECIMAL(5, 2) DEFAULT 0,
  efficiency_score DECIMAL(5, 2) DEFAULT 0,
  satisfaction_score DECIMAL(5, 2) DEFAULT 0,
  events_managed INTEGER DEFAULT 0,
  participants_served INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- ENHANCED EVENTS SCHEMA (from 011-enhance-events-schema.sql)
-- ========================================

-- Add enhanced columns to events table
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS registration_deadline TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'Asia/Kolkata',
ADD COLUMN IF NOT EXISTS contact_email TEXT,
ADD COLUMN IF NOT EXISTS contact_phone TEXT,
ADD COLUMN IF NOT EXISTS requirements TEXT[],
ADD COLUMN IF NOT EXISTS what_to_bring TEXT[],
ADD COLUMN IF NOT EXISTS age_restriction TEXT,
ADD COLUMN IF NOT EXISTS is_virtual BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS meeting_point TEXT,
ADD COLUMN IF NOT EXISTS transportation_info TEXT,
ADD COLUMN IF NOT EXISTS waiver_required BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS min_participants INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS tags TEXT[];

-- ========================================
-- CERTIFICATE SHARING SYSTEM (from 015-participant-certificate-sharing.sql)
-- ========================================

-- Add sharing columns to existing participant_certifications table
ALTER TABLE participant_certifications 
ADD COLUMN IF NOT EXISTS shared_with_server UUID REFERENCES server_profiles(id),
ADD COLUMN IF NOT EXISTS sharing_status TEXT DEFAULT 'not_shared' CHECK (sharing_status IN ('not_shared', 'pending', 'under_review', 'approved', 'rejected', 'needs_revision')),
ADD COLUMN IF NOT EXISTS sharing_request_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS sharing_review_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS sharing_reviewed_by UUID REFERENCES profiles(id),
ADD COLUMN IF NOT EXISTS sharing_review_notes TEXT,
ADD COLUMN IF NOT EXISTS sharing_rejection_reason TEXT,
ADD COLUMN IF NOT EXISTS sharing_revision_requested TEXT,
ADD COLUMN IF NOT EXISTS is_publicly_shared BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS shared_with_community BOOLEAN DEFAULT FALSE;

-- ========================================
-- INDEXES FOR PERFORMANCE
-- ========================================

-- Core table indexes
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_events_organizer ON events(organizer_id);
CREATE INDEX IF NOT EXISTS idx_events_start_date ON events(start_date);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_event_participants_event ON event_participants(event_id);
CREATE INDEX IF NOT EXISTS idx_event_participants_user ON event_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_impact_logs_user ON impact_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_impact_logs_event ON impact_logs(event_id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_user ON leaderboard(user_id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_points ON leaderboard(total_points DESC);

-- Certification indexes
CREATE INDEX IF NOT EXISTS idx_participant_certifications_participant_id ON participant_certifications(participant_id);
CREATE INDEX IF NOT EXISTS idx_participant_certifications_issued_by ON participant_certifications(issued_by);
CREATE INDEX IF NOT EXISTS idx_participant_certifications_type ON participant_certifications(certification_type);
CREATE INDEX IF NOT EXISTS idx_participant_certifications_active ON participant_certifications(is_active);
CREATE INDEX IF NOT EXISTS idx_participant_certifications_shared_server ON participant_certifications(shared_with_server);
CREATE INDEX IF NOT EXISTS idx_participant_certifications_sharing_status ON participant_certifications(sharing_status);
CREATE INDEX IF NOT EXISTS idx_participant_certifications_sharing_date ON participant_certifications(sharing_request_date);

-- Server table indexes
CREATE INDEX IF NOT EXISTS idx_server_profiles_user_id ON server_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_server_profiles_active ON server_profiles(is_active);
CREATE INDEX IF NOT EXISTS idx_server_profiles_type ON server_profiles(server_type);
CREATE INDEX IF NOT EXISTS idx_server_profiles_contact_email ON server_profiles(contact_email);

CREATE INDEX IF NOT EXISTS idx_server_certifications_server_id ON server_certifications(server_id);
CREATE INDEX IF NOT EXISTS idx_server_impact_tracking_server_id ON server_impact_tracking(server_id);
CREATE INDEX IF NOT EXISTS idx_server_tasks_server_id ON server_tasks(server_id);
CREATE INDEX IF NOT EXISTS idx_server_reviews_server_id ON server_reviews(server_id);
CREATE INDEX IF NOT EXISTS idx_server_compliance_checks_server_id ON server_compliance_checks(server_id);
CREATE INDEX IF NOT EXISTS idx_server_equipment_server_id ON server_equipment(server_id);
CREATE INDEX IF NOT EXISTS idx_server_training_records_server_id ON server_training_records(server_id);
CREATE INDEX IF NOT EXISTS idx_server_financial_tracking_server_id ON server_financial_tracking(server_id);
CREATE INDEX IF NOT EXISTS idx_server_performance_metrics_server_id ON server_performance_metrics(server_id);

-- ========================================
-- FUNCTIONS AND TRIGGERS
-- ========================================

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER handle_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER handle_events_updated_at BEFORE UPDATE ON events FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER handle_leaderboard_updated_at BEFORE UPDATE ON leaderboard FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER handle_participant_certifications_updated_at BEFORE UPDATE ON participant_certifications FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER handle_server_profiles_updated_at BEFORE UPDATE ON server_profiles FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER handle_server_certifications_updated_at BEFORE UPDATE ON server_certifications FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER handle_server_impact_tracking_updated_at BEFORE UPDATE ON server_impact_tracking FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER handle_server_tasks_updated_at BEFORE UPDATE ON server_tasks FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER handle_server_training_records_updated_at BEFORE UPDATE ON server_training_records FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- ========================================
-- VIEWS FOR CERTIFICATE SHARING
-- ========================================

-- Create view for certificate sharing using existing tables
CREATE OR REPLACE VIEW participant_certificate_sharing AS
SELECT 
  pc.id,
  pc.participant_id,
  pc.shared_with_server as server_id,
  pc.certification_name,
  pc.certification_type,
  pc.issued_date,
  pc.sharing_status,
  pc.sharing_request_date as request_date,
  pc.sharing_review_date as review_date,
  pc.sharing_reviewed_by as reviewed_by,
  pc.sharing_review_notes as review_notes,
  pc.sharing_rejection_reason as rejection_reason,
  pc.sharing_revision_requested as revision_requested,
  pc.is_publicly_shared as is_public,
  pc.shared_with_community as shared_with_community,
  p.full_name as participant_name,
  p.email as participant_email,
  sp.server_name,
  sp.server_type,
  sp.certification_level as server_certification_level,
  CASE 
    WHEN pc.sharing_status = 'pending' THEN 1
    WHEN pc.sharing_status = 'under_review' THEN 2
    WHEN pc.sharing_status = 'approved' THEN 3
    WHEN pc.sharing_status = 'rejected' THEN 4
    WHEN pc.sharing_status = 'needs_revision' THEN 5
    ELSE 0
  END as status_order
FROM participant_certifications pc
LEFT JOIN profiles p ON pc.participant_id = p.id
LEFT JOIN server_profiles sp ON pc.shared_with_server = sp.id
WHERE pc.sharing_status != 'not_shared';

-- Server review dashboard view
CREATE OR REPLACE VIEW server_review_dashboard AS
SELECT 
  pc.id,
  pc.certification_name,
  pc.certification_type,
  pc.issued_date,
  pc.sharing_status,
  pc.sharing_request_date as request_date,
  pc.sharing_review_date as review_date,
  pc.sharing_review_notes as review_notes,
  pc.sharing_rejection_reason as rejection_reason,
  pc.sharing_revision_requested as revision_requested,
  pc.certificate_url,
  p.full_name as participant_name,
  p.email as participant_email,
  sp.server_name,
  sp.server_type,
  CASE 
    WHEN pc.sharing_status = 'pending' THEN 'new'
    WHEN pc.sharing_status = 'under_review' THEN 'in_progress'
    WHEN pc.sharing_status = 'approved' THEN 'completed'
    WHEN pc.sharing_status = 'rejected' THEN 'completed'
    WHEN pc.sharing_status = 'needs_revision' THEN 'pending'
    ELSE 'unknown'
  END as review_status
FROM participant_certifications pc
LEFT JOIN profiles p ON pc.participant_id = p.id
LEFT JOIN server_profiles sp ON pc.shared_with_server = sp.id
WHERE pc.sharing_status != 'not_shared';

-- Certificate sharing analytics view
CREATE OR REPLACE VIEW certificate_sharing_analytics AS
SELECT 
  sp.id as server_id,
  sp.server_name,
  sp.server_type,
  COUNT(pc.id) as total_shared,
  COUNT(CASE WHEN pc.sharing_status = 'pending' THEN 1 END) as pending_reviews,
  COUNT(CASE WHEN pc.sharing_status = 'under_review' THEN 1 END) as under_review,
  COUNT(CASE WHEN pc.sharing_status = 'approved' THEN 1 END) as approved,
  COUNT(CASE WHEN pc.sharing_status = 'rejected' THEN 1 END) as rejected,
  COUNT(CASE WHEN pc.sharing_status = 'needs_revision' THEN 1 END) as needs_revision,
  AVG(CASE WHEN pc.sharing_review_date IS NOT NULL THEN 
    EXTRACT(EPOCH FROM (pc.sharing_review_date - pc.sharing_request_date))/3600 
  END) as avg_review_time_hours
FROM server_profiles sp
LEFT JOIN participant_certifications pc ON sp.id = pc.shared_with_server
WHERE sp.is_active = true
GROUP BY sp.id, sp.server_name, sp.server_type;

-- ========================================
-- RLS POLICIES
-- ========================================

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE impact_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE participant_certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE server_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE server_certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE server_impact_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE server_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE server_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE server_compliance_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE server_equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE server_training_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE server_financial_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE server_performance_metrics ENABLE ROW LEVEL SECURITY;

-- Core RLS Policies
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Events are viewable by everyone" ON events FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create events" ON events FOR INSERT WITH CHECK (auth.uid() = organizer_id);
CREATE POLICY "Organizers can update their own events" ON events FOR UPDATE USING (auth.uid() = organizer_id);
CREATE POLICY "Organizers can delete their own events" ON events FOR DELETE USING (auth.uid() = organizer_id);

CREATE POLICY "Participants are viewable by everyone" ON event_participants FOR SELECT USING (true);
CREATE POLICY "Users can register for events" ON event_participants FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own registration" ON event_participants FOR UPDATE USING (auth.uid() = user_id);

-- Certification RLS Policies
CREATE POLICY "Users can view own certifications" ON participant_certifications FOR SELECT USING (auth.uid() = participant_id);
CREATE POLICY "Users can insert own certifications" ON participant_certifications FOR INSERT WITH CHECK (auth.uid() = participant_id);
CREATE POLICY "Users can update own certifications" ON participant_certifications FOR UPDATE USING (auth.uid() = participant_id);
CREATE POLICY "Servers can view certifications they issued" ON participant_certifications FOR SELECT USING (auth.uid() = issued_by);

-- Server RLS Policies
CREATE POLICY "Public can view active server profiles" ON server_profiles FOR SELECT USING (is_active = true);
CREATE POLICY "Servers can view own profile" ON server_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own server profile" ON server_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Servers can update own profile" ON server_profiles FOR UPDATE USING (auth.uid() = user_id);

-- Server table policies
CREATE POLICY "Servers can view own data" ON server_certifications FOR SELECT USING (auth.uid() IN (SELECT user_id FROM server_profiles WHERE id = server_id));
CREATE POLICY "Servers can manage own data" ON server_certifications FOR ALL USING (auth.uid() IN (SELECT user_id FROM server_profiles WHERE id = server_id));

CREATE POLICY "Servers can view own impact" ON server_impact_tracking FOR SELECT USING (auth.uid() IN (SELECT user_id FROM server_profiles WHERE id = server_id));
CREATE POLICY "Servers can manage own impact" ON server_impact_tracking FOR ALL USING (auth.uid() IN (SELECT user_id FROM server_profiles WHERE id = server_id));

CREATE POLICY "Servers can view own tasks" ON server_tasks FOR SELECT USING (auth.uid() IN (SELECT user_id FROM server_profiles WHERE id = server_id));
CREATE POLICY "Servers can manage own tasks" ON server_tasks FOR ALL USING (auth.uid() IN (SELECT user_id FROM server_profiles WHERE id = server_id));

CREATE POLICY "Servers can view own reviews" ON server_reviews FOR SELECT USING (auth.uid() IN (SELECT user_id FROM server_profiles WHERE id = server_id));
CREATE POLICY "Servers can manage own reviews" ON server_reviews FOR ALL USING (auth.uid() IN (SELECT user_id FROM server_profiles WHERE id = server_id));

CREATE POLICY "Servers can view own compliance" ON server_compliance_checks FOR SELECT USING (auth.uid() IN (SELECT user_id FROM server_profiles WHERE id = server_id));
CREATE POLICY "Servers can manage own compliance" ON server_compliance_checks FOR ALL USING (auth.uid() IN (SELECT user_id FROM server_profiles WHERE id = server_id));

CREATE POLICY "Servers can view own equipment" ON server_equipment FOR SELECT USING (auth.uid() IN (SELECT user_id FROM server_profiles WHERE id = server_id));
CREATE POLICY "Servers can manage own equipment" ON server_equipment FOR ALL USING (auth.uid() IN (SELECT user_id FROM server_profiles WHERE id = server_id));

CREATE POLICY "Servers can view own training" ON server_training_records FOR SELECT USING (auth.uid() IN (SELECT user_id FROM server_profiles WHERE id = server_id));
CREATE POLICY "Servers can manage own training" ON server_training_records FOR ALL USING (auth.uid() IN (SELECT user_id FROM server_profiles WHERE id = server_id));

CREATE POLICY "Servers can view own financial" ON server_financial_tracking FOR SELECT USING (auth.uid() IN (SELECT user_id FROM server_profiles WHERE id = server_id));
CREATE POLICY "Servers can manage own financial" ON server_financial_tracking FOR ALL USING (auth.uid() IN (SELECT user_id FROM server_profiles WHERE id = server_id));

CREATE POLICY "Servers can view own metrics" ON server_performance_metrics FOR SELECT USING (auth.uid() IN (SELECT user_id FROM server_profiles WHERE id = server_id));
CREATE POLICY "Servers can manage own metrics" ON server_performance_metrics FOR ALL USING (auth.uid() IN (SELECT user_id FROM server_profiles WHERE id = server_id));

-- ========================================
-- FUNCTIONS FOR CERTIFICATE SHARING
-- ========================================

-- Function to share certificate for review
CREATE OR REPLACE FUNCTION share_certificate_for_review(
  participant_uuid UUID,
  server_uuid UUID,
  certification_uuid UUID,
  is_public_param BOOLEAN DEFAULT FALSE,
  share_with_community_param BOOLEAN DEFAULT FALSE
)
RETURNS VOID AS $$
BEGIN
  -- Update the participant certification with sharing information
  UPDATE participant_certifications
  SET 
    shared_with_server = server_uuid,
    sharing_status = 'pending',
    sharing_request_date = NOW(),
    is_publicly_shared = is_public_param,
    shared_with_community = share_with_community_param
  WHERE id = certification_uuid AND participant_id = participant_uuid;
  
  -- Create a task for the server to review the certificate
  INSERT INTO server_tasks (server_id, task_name, task_description, task_type, status, priority)
  VALUES (
    server_uuid,
    'Review Certificate: ' || (SELECT certification_name FROM participant_certifications WHERE id = certification_uuid),
    'Review and verify certificate shared by participant',
    'review',
    'pending',
    'medium'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to review shared certificate
CREATE OR REPLACE FUNCTION review_shared_certificate(
  server_uuid UUID,
  certification_uuid UUID,
  review_status_param TEXT,
  review_notes_param TEXT DEFAULT NULL,
  rejection_reason_param TEXT DEFAULT NULL,
  revision_requested_param TEXT DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
  participant_user_id UUID;
BEGIN
  -- Get the participant ID for this certification
  SELECT participant_id INTO participant_user_id
  FROM participant_certifications
  WHERE id = certification_uuid AND shared_with_server = server_uuid;
  
  -- Update the participant certification with review information
  UPDATE participant_certifications
  SET 
    sharing_status = review_status_param,
    sharing_review_date = NOW(),
    sharing_reviewed_by = (SELECT user_id FROM server_profiles WHERE id = server_uuid),
    sharing_review_notes = review_notes_param,
    sharing_rejection_reason = rejection_reason_param,
    sharing_revision_requested = revision_requested_param,
    is_active = CASE WHEN review_status_param = 'approved' THEN TRUE ELSE FALSE END
  WHERE id = certification_uuid AND shared_with_server = server_uuid;
  
  -- Update corresponding server task
  UPDATE server_tasks
  SET 
    status = CASE 
      WHEN review_status_param = 'approved' THEN 'completed'
      WHEN review_status_param = 'rejected' THEN 'completed'
      WHEN review_status_param = 'needs_revision' THEN 'pending'
      ELSE 'in_progress'
    END,
    completion_notes = review_notes_param,
    updated_at = NOW()
  WHERE server_id = server_uuid 
    AND task_name LIKE 'Review Certificate: %'
    AND status != 'completed'
    AND id = (
      SELECT id FROM server_tasks 
      WHERE server_id = server_uuid 
        AND task_name LIKE 'Review Certificate: %' 
        AND status != 'completed'
      ORDER BY created_at DESC 
      LIMIT 1
    );
  
  -- Add to server performance metrics (existing table)
  INSERT INTO server_performance_metrics (
    server_id,
    metric_date,
    total_certifications_issued,
    overall_performance_score
  ) VALUES (
    server_uuid,
    CURRENT_DATE,
    CASE WHEN review_status_param = 'approved' THEN 1 ELSE 0 END,
    CASE 
      WHEN review_status_param = 'approved' THEN 100
      WHEN review_status_param = 'rejected' THEN 50
      ELSE 75
    END
  )
  ON CONFLICT (server_id, metric_date) DO UPDATE SET
    total_certifications_issued = server_performance_metrics.total_certifications_issued + 
      CASE WHEN review_status_param = 'approved' THEN 1 ELSE 0 END,
    overall_performance_score = (
      server_performance_metrics.overall_performance_score + 
      CASE 
        WHEN review_status_param = 'approved' THEN 100
        WHEN review_status_param = 'rejected' THEN 50
        ELSE 75
      END
    ) / 2;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- SAMPLE DATA (Optional)
-- ========================================

-- Insert sample achievements
INSERT INTO achievements (name, description, icon, criteria_type, criteria_value, badge_tier) VALUES
('First Event', 'Attend your first environmental event', '🌱', 'events_attended', 1, 'bronze'),
('Eco Warrior', 'Attend 10 environmental events', '🌍', 'events_attended', 10, 'silver'),
('Planet Protector', 'Attend 50 environmental events', '🌟', 'events_attended', 50, 'gold'),
('Waste Warrior', 'Collect 100kg of waste', '♻️', 'waste_collected', 100, 'bronze'),
('Tree Champion', 'Plant 50 trees', '🌳', 'trees_planted', 50, 'silver')
ON CONFLICT (name) DO NOTHING;

-- Create initial server profile
INSERT INTO server_profiles (id, user_id, server_name, server_type, organization, contact_email, certification_level, service_area, is_active)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  'Demo Server',
  'environmental',
  'EcoVolunteer PRO',
  'server@ecovolunteer.com',
  'platinum',
  'Global',
  true
) ON CONFLICT (id) DO NOTHING;

-- ========================================
-- COMPLETION MESSAGE
-- ========================================

DO $$
BEGIN
  RAISE NOTICE 'EcoVolunteer PRO Database Setup Complete!';
  RAISE NOTICE 'Tables created: %', (
    SELECT COUNT(*) 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name NOT LIKE 'pg_%'
  );
  RAISE NOTICE 'Views created: %', (
    SELECT COUNT(*) 
    FROM information_schema.views 
    WHERE table_schema = 'public'
  );
  RAISE NOTICE 'Functions created: %', (
    SELECT COUNT(*) 
    FROM information_schema.routines 
    WHERE routine_schema = 'public' 
    AND routine_type = 'FUNCTION'
  );
END $$;
