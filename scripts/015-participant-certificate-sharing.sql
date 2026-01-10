-- Participant Certificate Sharing System
-- Uses existing tables from 01-11 and 014, no new tables created

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

-- Add index for sharing performance
CREATE INDEX IF NOT EXISTS idx_participant_certifications_shared_server ON participant_certifications(shared_with_server);
CREATE INDEX IF NOT EXISTS idx_participant_certifications_sharing_status ON participant_certifications(sharing_status);
CREATE INDEX IF NOT EXISTS idx_participant_certifications_sharing_date ON participant_certifications(sharing_request_date);

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
  END as status_priority
FROM participant_certifications pc
JOIN profiles p ON pc.participant_id = p.id
LEFT JOIN server_profiles sp ON pc.shared_with_server = sp.id
WHERE pc.sharing_status != 'not_shared' OR pc.shared_with_server IS NOT NULL
ORDER BY status_priority, pc.sharing_request_date DESC;

-- Create server review dashboard view using existing tables
CREATE OR REPLACE VIEW server_review_dashboard AS
SELECT 
  pc.id as sharing_request_id,
  pc.shared_with_server as server_id,
  pc.participant_id,
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
    WHEN pc.sharing_status = 'pending' THEN 'Pending Review'
    WHEN pc.sharing_status = 'under_review' THEN 'Under Review'
    WHEN pc.sharing_status = 'approved' THEN 'Approved'
    WHEN pc.sharing_status = 'rejected' THEN 'Rejected'
    WHEN pc.sharing_status = 'needs_revision' THEN 'Needs Revision'
    ELSE 'Unknown'
  END as display_status
FROM participant_certifications pc
JOIN profiles p ON pc.participant_id = p.id
JOIN server_profiles sp ON pc.shared_with_server = sp.id
WHERE pc.sharing_status != 'not_shared'
ORDER BY pc.sharing_request_date DESC;

-- Create sharing analytics using existing tables
CREATE OR REPLACE VIEW certificate_sharing_analytics AS
SELECT 
  sp.id as server_id,
  sp.server_name,
  sp.server_type,
  DATE(pc.sharing_request_date) as tracking_date,
  COUNT(*) as total_requests_received,
  COUNT(CASE WHEN pc.sharing_status = 'approved' THEN 1 END) as total_requests_approved,
  COUNT(CASE WHEN pc.sharing_status = 'rejected' THEN 1 END) as total_requests_rejected,
  COUNT(CASE WHEN pc.sharing_status = 'needs_revision' THEN 1 END) as total_requests_revision,
  COUNT(CASE WHEN pc.is_publicly_shared = TRUE THEN 1 END) as certificates_shared_publicly,
  COUNT(CASE WHEN pc.shared_with_community = TRUE THEN 1 END) as certificates_shared_community,
  COUNT(DISTINCT pc.participant_id) as unique_participants_shared,
  COALESCE(AVG(
    CASE 
      WHEN pc.sharing_review_date IS NOT NULL AND pc.sharing_request_date IS NOT NULL 
      THEN EXTRACT(EPOCH FROM (pc.sharing_review_date - pc.sharing_request_date))/3600 
      ELSE NULL 
    END
  ), 0) as average_review_time_hours
FROM server_profiles sp
LEFT JOIN participant_certifications pc ON sp.id = pc.shared_with_server
WHERE pc.sharing_status != 'not_shared' OR pc.shared_with_server IS NOT NULL
GROUP BY sp.id, sp.server_name, sp.server_type, DATE(pc.sharing_request_date)
ORDER BY tracking_date DESC;

-- Create function to share certificate for review using existing tables
CREATE OR REPLACE FUNCTION share_certificate_for_review(
  participant_uuid UUID,
  server_uuid UUID,
  certification_uuid UUID,
  is_public_param BOOLEAN DEFAULT FALSE,
  share_with_community_param BOOLEAN DEFAULT FALSE
) RETURNS BOOLEAN AS $$
DECLARE
  is_valid_certification BOOLEAN;
  is_valid_server BOOLEAN;
BEGIN
  -- Check if certification belongs to participant and is active
  SELECT COUNT(*) > 0 INTO is_valid_certification
  FROM participant_certifications
  WHERE id = certification_uuid 
    AND participant_id = participant_uuid 
    AND is_active = TRUE;
  
  IF NOT is_valid_certification THEN
    RAISE EXCEPTION 'Invalid certification or participant not authorized';
  END IF;
  
  -- Check if server is valid and active
  SELECT COUNT(*) > 0 INTO is_valid_server
  FROM server_profiles
  WHERE id = server_uuid AND is_active = TRUE;
  
  IF NOT is_valid_server THEN
    RAISE EXCEPTION 'Invalid server or server not active';
  END IF;
  
  -- Update existing certification with sharing details
  UPDATE participant_certifications
  SET 
    shared_with_server = server_uuid,
    sharing_status = 'pending',
    sharing_request_date = NOW(),
    is_publicly_shared = is_public_param,
    shared_with_community = share_with_community_param
  WHERE id = certification_uuid;
  
  -- Log to server tasks (existing table)
  INSERT INTO server_tasks (
    server_id, 
    task_name, 
    task_description, 
    task_type, 
    priority, 
    due_date, 
    status
  ) VALUES (
    server_uuid,
    'Review Certificate: ' || (SELECT certification_name FROM participant_certifications WHERE id = certification_uuid),
    'Certificate shared for review by participant',
    'certification',
    'medium',
    NOW() + INTERVAL '7 days',
    'pending'
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Create function to review shared certificate using existing tables
CREATE OR REPLACE FUNCTION review_shared_certificate(
  certification_uuid UUID,
  reviewer_uuid UUID,
  review_status TEXT,
  review_notes_param TEXT DEFAULT NULL,
  rejection_reason_param TEXT DEFAULT NULL,
  revision_requested_param TEXT DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
  is_authorized BOOLEAN;
  server_id UUID;
BEGIN
  -- Get server_id from certification
  SELECT shared_with_server INTO server_id
  FROM participant_certifications
  WHERE id = certification_uuid;
  
  -- Check if reviewer is authorized (server staff)
  SELECT COUNT(*) > 0 INTO is_authorized
  FROM server_profiles sp
  WHERE sp.id = server_id AND sp.user_id = reviewer_uuid;
  
  IF NOT is_authorized THEN
    RAISE EXCEPTION 'Reviewer not authorized';
  END IF;
  
  -- Update certification with review results
  UPDATE participant_certifications
  SET 
    sharing_status = review_status,
    sharing_review_date = NOW(),
    sharing_reviewed_by = reviewer_uuid,
    sharing_review_notes = review_notes_param,
    sharing_rejection_reason = rejection_reason_param,
    sharing_revision_requested = revision_requested_param
  WHERE id = certification_uuid;
  
  -- Update corresponding server task
  UPDATE server_tasks
  SET 
    status = CASE 
      WHEN review_status = 'approved' THEN 'completed'
      WHEN review_status = 'rejected' THEN 'completed'
      WHEN review_status = 'needs_revision' THEN 'pending'
      ELSE 'in_progress'
    END,
    completion_notes = review_notes_param,
    updated_at = NOW()
  WHERE server_id = server_id 
    AND task_name LIKE 'Review Certificate: %'
    AND status != 'completed'
    AND id = (
      SELECT id FROM server_tasks 
      WHERE server_id = server_id 
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
    server_id,
    CURRENT_DATE,
    CASE WHEN review_status = 'approved' THEN 1 ELSE 0 END,
    CASE 
      WHEN review_status = 'approved' THEN 100
      WHEN review_status = 'rejected' THEN 50
      WHEN review_status = 'needs_revision' THEN 75
      ELSE 50
    END
  )
  ON CONFLICT (server_id, metric_date) 
  DO UPDATE SET
    total_certifications_issued = server_performance_metrics.total_certifications_issued + 
      CASE WHEN review_status = 'approved' THEN 1 ELSE 0 END,
    overall_performance_score = server_performance_metrics.overall_performance_score + 
      CASE 
        WHEN review_status = 'approved' THEN 100
        WHEN review_status = 'rejected' THEN 50
        WHEN review_status = 'needs_revision' THEN 75
        ELSE 50
      END;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Update RLS policies for participant_certifications to include sharing
DROP POLICY IF EXISTS "Participants can view their own certifications" ON participant_certifications;
DROP POLICY IF EXISTS "Servers can issue certifications to participants" ON participant_certifications;

CREATE POLICY "Participants can view their own certifications"
  ON participant_certifications FOR SELECT
  USING (auth.uid() = participant_id);

CREATE POLICY "Servers can view certifications shared with them"
  ON participant_certifications FOR SELECT
  USING (auth.uid() IN (SELECT user_id FROM server_profiles WHERE id = shared_with_server));

CREATE POLICY "Participants can update their own certifications"
  ON participant_certifications FOR UPDATE
  USING (auth.uid() = participant_id);

CREATE POLICY "Servers can update shared certifications"
  ON participant_certifications FOR UPDATE
  USING (auth.uid() IN (SELECT user_id FROM server_profiles WHERE id = shared_with_server));

CREATE POLICY "Servers can issue certifications to participants"
  ON participant_certifications FOR INSERT
  WITH CHECK (auth.uid() IN (SELECT user_id FROM server_profiles WHERE id = issued_by));

-- Grant permissions for views
GRANT SELECT ON participant_certificate_sharing TO authenticated;
GRANT SELECT ON server_review_dashboard TO authenticated;
GRANT SELECT ON certificate_sharing_analytics TO authenticated;

-- Add comments for documentation
COMMENT ON COLUMN participant_certifications.shared_with_server IS 'Server ID that this certificate is shared with for review';
COMMENT ON COLUMN participant_certifications.sharing_status IS 'Current status of sharing review process';
COMMENT ON COLUMN participant_certifications.sharing_request_date IS 'Date when certificate was shared for review';
COMMENT ON COLUMN participant_certifications.sharing_review_date IS 'Date when certificate was reviewed';
COMMENT ON COLUMN participant_certifications.sharing_reviewed_by IS 'User ID of reviewer';
COMMENT ON COLUMN participant_certifications.sharing_review_notes IS 'Notes from review process';
COMMENT ON COLUMN participant_certifications.is_publicly_shared IS 'Whether certificate is publicly visible';
COMMENT ON COLUMN participant_certifications.shared_with_community IS 'Whether certificate is shared with community';
