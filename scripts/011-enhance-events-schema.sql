-- Enhance events table with additional mandatory fields and features
-- Adds timezone support, registration deadlines, and more event details

-- Step 1: Add new columns to events table
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

-- Step 2: Update constraints for new fields (using ALTER TABLE approach for compatibility)
DO $$
BEGIN
  -- Add check_registration_deadline constraint if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name = 'events' 
    AND constraint_name = 'check_registration_deadline'
  ) THEN
    ALTER TABLE events 
    ADD CONSTRAINT check_registration_deadline 
    CHECK (registration_deadline IS NULL OR registration_deadline <= start_date);
  END IF;

  -- Add check_min_participants constraint if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name = 'events' 
    AND constraint_name = 'check_min_participants'
  ) THEN
    ALTER TABLE events 
    ADD CONSTRAINT check_min_participants 
    CHECK (min_participants >= 1);
  END IF;

  -- Add check_participant_range constraint if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name = 'events' 
    AND constraint_name = 'check_participant_range'
  ) THEN
    ALTER TABLE events 
    ADD CONSTRAINT check_participant_range 
    CHECK (min_participants IS NULL OR max_participants IS NULL OR min_participants <= max_participants);
  END IF;
END $$;

-- Step 3: Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_events_start_date ON events(start_date);
CREATE INDEX IF NOT EXISTS idx_events_registration_deadline ON events(registration_deadline);
CREATE INDEX IF NOT EXISTS idx_events_timezone ON events(timezone);
CREATE INDEX IF NOT EXISTS idx_events_category ON events(category);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_tags ON events USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_events_registration_deadline_date ON events(registration_deadline_date);
CREATE INDEX IF NOT EXISTS idx_events_registration_deadline_time ON events(registration_deadline_time);

-- Step 4: Update existing events with default values
UPDATE events 
SET 
  timezone = 'Asia/Kolkata',
  registration_deadline = start_date - INTERVAL '1 day',
  contact_email = 'organizer@ecovolunteer.com',
  waiver_required = TRUE,
  min_participants = 1
WHERE timezone IS NULL;

-- Step 5: Add comments for documentation
COMMENT ON COLUMN events.registration_deadline IS 'Deadline for event registration (can be null for open registration)';
COMMENT ON COLUMN events.registration_deadline_date IS 'Date for event registration deadline';
COMMENT ON COLUMN events.registration_deadline_time IS 'Time for event registration deadline';
COMMENT ON COLUMN events.timezone IS 'Timezone for event scheduling (default: Asia/Kolkata)';
COMMENT ON COLUMN events.contact_email IS 'Organizer contact email';
COMMENT ON COLUMN events.contact_phone IS 'Organizer contact phone';
COMMENT ON COLUMN events.requirements IS 'List of requirements for participants';
COMMENT ON COLUMN events.what_to_bring IS 'List of items participants should bring';
COMMENT ON COLUMN events.age_restriction IS 'Age restriction for participants (e.g., 18+, 13-17)';
COMMENT ON COLUMN events.is_virtual IS 'Whether event is virtual/online';
COMMENT ON COLUMN events.meeting_point IS 'Specific meeting point for physical events';
COMMENT ON COLUMN events.transportation_info IS 'Transportation information for participants';
COMMENT ON COLUMN events.waiver_required IS 'Whether liability waiver is required';
COMMENT ON COLUMN events.min_participants IS 'Minimum participants required';
COMMENT ON COLUMN events.tags IS 'Tags for event categorization and search';

-- Step 6: Create event updates table for tracking changes
CREATE TABLE IF NOT EXISTS event_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  updater_id UUID REFERENCES profiles(id) ON DELETE SET NULL NOT NULL,
  update_type TEXT NOT NULL CHECK (update_type IN ('details', 'status', 'location', 'time', 'cancellation')),
  old_values JSONB,
  new_values JSONB,
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 7: Add indexes for event updates
CREATE INDEX IF NOT EXISTS idx_event_updates_event ON event_updates(event_id);
CREATE INDEX IF NOT EXISTS idx_event_updates_updater ON event_updates(updater_id);
CREATE INDEX IF NOT EXISTS idx_event_updates_created ON event_updates(created_at);

-- Step 8: Enable RLS for event updates
ALTER TABLE event_updates ENABLE ROW LEVEL SECURITY;

-- Step 9: RLS Policies for event updates
CREATE POLICY "Event updates are viewable by everyone"
  ON event_updates FOR SELECT
  USING (true);

CREATE POLICY "Organizers can create event updates"
  ON event_updates FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM events 
      WHERE events.id = event_id 
      AND events.organizer_id = auth.uid()
    )
  );

CREATE POLICY "Organizers can update their own updates"
  ON event_updates FOR UPDATE
  USING (updater_id = auth.uid());

CREATE POLICY "Organizers can delete their own updates"
  ON event_updates FOR DELETE
  USING (updater_id = auth.uid());

-- Step 10: Create function to handle event status changes
CREATE OR REPLACE FUNCTION update_event_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Update status based on dates
  IF NEW.status != 'cancelled' THEN
    IF NEW.start_date <= NOW() AND NEW.end_date > NOW() THEN
      NEW.status = 'ongoing';
    ELSIF NEW.end_date <= NOW() THEN
      NEW.status = 'completed';
    ELSE
      NEW.status = 'upcoming';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 11: Create trigger for automatic status updates
CREATE TRIGGER update_event_status_trigger
  BEFORE UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION update_event_status();

-- Step 12: Create trigger for status on insert
CREATE TRIGGER set_initial_event_status
  BEFORE INSERT ON events
  FOR EACH ROW
  EXECUTE FUNCTION update_event_status();
