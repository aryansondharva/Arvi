-- Complete Server Management System Tables
-- This creates all the server-specific tables referenced in the dashboard

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

-- Enable Row Level Security for all server tables
ALTER TABLE server_certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE server_impact_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE server_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE server_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE server_compliance_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE server_equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE server_training_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE server_financial_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE server_performance_metrics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for server tables
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

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_server_certifications_server_id ON server_certifications(server_id);
CREATE INDEX IF NOT EXISTS idx_server_impact_tracking_server_id ON server_impact_tracking(server_id);
CREATE INDEX IF NOT EXISTS idx_server_tasks_server_id ON server_tasks(server_id);
CREATE INDEX IF NOT EXISTS idx_server_reviews_server_id ON server_reviews(server_id);
CREATE INDEX IF NOT EXISTS idx_server_compliance_checks_server_id ON server_compliance_checks(server_id);
CREATE INDEX IF NOT EXISTS idx_server_equipment_server_id ON server_equipment(server_id);
CREATE INDEX IF NOT EXISTS idx_server_training_records_server_id ON server_training_records(server_id);
CREATE INDEX IF NOT EXISTS idx_server_financial_tracking_server_id ON server_financial_tracking(server_id);
CREATE INDEX IF NOT EXISTS idx_server_performance_metrics_server_id ON server_performance_metrics(server_id);

-- Add triggers for updated_at
CREATE TRIGGER handle_server_certifications_updated_at BEFORE UPDATE ON server_certifications FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER handle_server_impact_tracking_updated_at BEFORE UPDATE ON server_impact_tracking FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER handle_server_tasks_updated_at BEFORE UPDATE ON server_tasks FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER handle_server_training_records_updated_at BEFORE UPDATE ON server_training_records FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
