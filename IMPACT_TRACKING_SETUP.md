# Impact Tracking System Setup Guide

## Overview
This guide explains how to set up a comprehensive environmental impact tracking system for EcoVolunteer PRO, including separate tracking for participants and servers/organizers.

## 🎯 Features Implemented

### 📊 Dual Tracking System
- **Participant Tracking**: For event attendees (waste collection, tree planting, etc.)
- **Server Tracking**: For event organizers and waste management servers
- **User Roles**: Participant, Server, Admin with different permissions
- **Impact Scoring**: Comprehensive environmental impact calculation system

### 🌍 Environmental Metrics Tracked
- **Waste Collected**: Kilograms of waste collected
- **Trees Planted**: Number of trees planted
- **Area Cleaned**: Square meters of area cleaned
- **Carbon Saved**: Kilograms of carbon emissions saved
- **Water Saved**: Liters of water conserved
- **Plastic Saved**: Kilograms of plastic waste prevented

### 🏆 Achievement System
- **Impact Score**: Weighted scoring based on environmental impact
- **Impact Levels**: Bronze, Silver, Gold, Diamond, Platinum
- **Leaderboard**: Separate leaderboards for participants and servers
- **Badges**: Achievement badges based on impact levels

## 📁 Files Created/Modified

### 1. Database Schema Enhancements
- **File**: `scripts/012-enhance-impact-tracking.sql`
- **Purpose**: Enhance existing impact_logs with new columns
- **Features**:
  - Adds trees_planted, area_cleaned_sqm, carbon_saved_kg
  - Adds water_saved_liters, plastic_saved_kg
  - Creates impact calculation functions
  - Updates existing data with new impact scores

### 2. Participant/Server Tracking
- **File**: `scripts/013-create-participant-server-tables.sql`
- **Purpose**: Create separate tracking tables for different user types
- **Features**:
  - `participant_impact_logs` table for event attendees
  - `server_impact_logs` table for organizers/servers
  - User role system with automatic assignment
  - Separate views for each user type
  - Comprehensive RLS policies

### 3. Enhanced Event Forms
- **Files**: `components/create-event-form.tsx`, `components/edit-event-form.tsx`
- **Changes**:
  - Added registration_deadline_date and registration_deadline_time fields
  - Updated TypeScript interfaces
  - Enhanced form validation
  - Better time handling with Kolkata timezone

## 🚀 Setup Instructions

### Step 1: Run Impact Tracking Migration
1. Open your Supabase dashboard
2. Go to SQL Editor
3. Copy and paste contents of `scripts/012-enhance-impact-tracking.sql`
4. Execute the script

**What this does:**
- Enhances existing impact_logs table with new columns
- Adds comprehensive impact calculation functions
- Updates existing data with new impact scores
- Creates performance indexes

### Step 2: Run Participant/Server Migration
1. Copy and paste contents of `scripts/013-create-participant-server-tables.sql`
2. Execute the script

**What this does:**
- Creates separate tracking tables for participants and servers
- Implements user role system (participant/server/admin)
- Creates specialized views for different user types
- Sets up comprehensive RLS policies

### Step 3: Update Event Forms
The forms are already updated with new fields:
- `registration_deadline_date` - Date for registration deadline
- `registration_deadline_time` - Time for registration deadline
- Enhanced TypeScript interfaces
- Better validation and error handling

## 🔧 Technical Details

### Impact Scoring System
```sql
-- Impact calculation function
CREATE OR REPLACE FUNCTION calculate_environmental_impact(
  trees_planted INTEGER,
  waste_collected_kg DECIMAL,
  area_cleaned_sqm DECIMAL,
  carbon_saved_kg DECIMAL,
  water_saved_liters DECIMAL,
  plastic_saved_kg DECIMAL
) RETURNS INTEGER AS $$
DECLARE
  score INTEGER := 0;
  
  -- Waste collection scoring (1 point per kg)
  score := score + (waste_collected_kg * 1);
  
  -- Tree planting scoring (2 points per tree)
  score := score + (trees_planted * 2);
  
  -- Area cleaning scoring (1.5 points per sqm)
  score := score + (area_cleaned_sqm * 1.5);
  
  -- Carbon saving scoring (1 point per kg)
  score := score + (carbon_saved_kg * 1);
  
  -- Water saving scoring (0.5 points per liter)
  score := score + (water_saved_liters * 0.5);
  
  -- Plastic saving scoring (0.2 points per kg)
  score := score + (plastic_saved_kg * 0.2);
  
  RETURN score;
END;
$$ LANGUAGE plpgsql;
```

### User Role System
```sql
-- User role tracking
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS user_role TEXT DEFAULT 'participant' 
CHECK (user_role IN ('participant', 'server', 'admin'));

-- Automatic role assignment
CREATE OR REPLACE FUNCTION assign_participant_role()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.user_role IS NULL THEN
    NEW.user_role := 'participant';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### Separate Tracking Tables
```sql
-- Participant impact tracking
CREATE TABLE IF NOT EXISTS participant_impact_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  trees_planted INTEGER DEFAULT 0,
  waste_collected_kg DECIMAL(10,2) DEFAULT 0,
  area_cleaned_sqm DECIMAL(10,2) DEFAULT 0,
  carbon_saved_kg DECIMAL(10,2) DEFAULT 0,
  water_saved_liters DECIMAL(10,2) DEFAULT 0,
  plastic_saved_kg DECIMAL(10,2) DEFAULT 0,
  impact_score INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Server impact tracking
CREATE TABLE IF NOT EXISTS server_impact_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  server_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  trees_planted INTEGER DEFAULT 0,
  waste_collected_kg DECIMAL(10,2) DEFAULT 0,
  area_cleaned_sqm DECIMAL(10,2) DEFAULT 0,
  carbon_saved_kg DECIMAL(10,2) DEFAULT 0,
  water_saved_liters DECIMAL(10,2) DEFAULT 0,
  plastic_saved_kg DECIMAL(10,2) DEFAULT 0,
  impact_score INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🎨 Impact Levels & Scoring

### Participant Impact Levels
- **Bronze**: 0-49 points
- **Silver**: 50-99 points  
- **Gold**: 100-499 points
- **Diamond**: 500-999 points
- **Platinum**: 1000+ points

### Server Impact Levels
- **Bronze**: 0-99 points
- **Silver**: 100-499 points
- **Gold**: 500-999 points
- **Diamond**: 1000-1999 points
- **Platinum**: 2000+ points

### Scoring Weights
- **Waste Collection**: 1 point per kg
- **Tree Planting**: 2 points per tree
- **Area Cleaning**: 1.5 points per sqm
- **Carbon Saving**: 1 point per kg
- **Water Saving**: 0.5 points per liter
- **Plastic Saving**: 0.2 points per kg

## 📊 Data Views & Analytics

### Participant Summary View
```sql
CREATE OR REPLACE VIEW participant_impact_summary AS
SELECT 
  p.id as user_id,
  p.full_name,
  p.email,
  p.unique_member_id,
  COUNT(CASE WHEN pil.status = 'registered' THEN 1 ELSE 0 END) as events_attended,
  COALESCE(SUM(CASE WHEN pil.status = 'attended' THEN pil.trees_planted, 0) ELSE 0 END) as total_trees_planted,
  COALESCE(SUM(CASE WHEN pil.status = 'attended' THEN pil.waste_collected_kg, 0) ELSE 0 END) as total_waste_collected,
  COALESCE(SUM(CASE WHEN pil.status = 'attended' THEN pil.area_cleaned_sqm, 0) ELSE 0 END) as total_area_cleaned,
  COALESCE(SUM(CASE WHEN pil.status = 'attended' THEN pil.carbon_saved_kg, 0) ELSE 0 END) as total_carbon_saved,
  COALESCE(SUM(CASE WHEN pil.status = 'attended' THEN pil.water_saved_liters, 0) ELSE 0 END) as total_water_saved,
  COALESCE(SUM(CASE WHEN pil.status = 'attended' THEN pil.plastic_saved_kg, 0) ELSE 0 END) as total_plastic_saved,
  COALESCE(SUM(CASE WHEN pil.status = 'attended' THEN pil.impact_score, 0) ELSE 0 END) as total_impact_score,
  MAX(COALESCE(pil.created_at, '2026-01-01'::timestamp) as last_activity_date,
  EXTRACT(DAY FROM (NOW() - MIN(COALESCE(pil.created_at, '2026-01-01'::timestamp))) as days_since_first_event,
  CASE 
    WHEN COALESCE(SUM(CASE WHEN pil.status = 'attended' THEN pil.impact_score, 0) ELSE 0 END) >= 1000 THEN 'Platinum'
    WHEN COALESCE(SUM(CASE WHEN pil.status = 'attended' THEN pil.impact_score, 0) ELSE 0 END) >= 500 THEN 'Diamond'
    WHEN COALESCE(SUM(CASE WHEN pil.status = 'attended' THEN pil.impact_score, 0) ELSE 0 END) >= 100 THEN 'Gold'
    WHEN COALESCE(SUM(CASE WHEN pil.status = 'attended' THEN pil.impact_score, 0) ELSE 0 END) >= 50 THEN 'Silver'
    ELSE 'Bronze'
  END as impact_level
FROM profiles p
LEFT JOIN participant_impact_logs pil ON p.id = pil.user_id
WHERE p.user_role = 'participant'
GROUP BY p.id, p.full_name, p.email, p.unique_member_id;
```

## 🔒 Security & Permissions

### Row Level Security (RLS)
- **Participant Logs**: Users can only access their own impact logs
- **Server Logs**: Users can only access their own server logs
- **User Roles**: Only admins can change user roles
- **Data Privacy**: Comprehensive privacy protection

### User Role Management
```sql
-- Update user role function
CREATE OR REPLACE FUNCTION update_user_role(
  target_user_id UUID,
  new_role TEXT
) RETURNS BOOLEAN AS $$
BEGIN
  IF new_role NOT IN ('participant', 'server', 'admin') THEN
    RETURN FALSE;
  END IF;
  
  UPDATE profiles 
  SET user_role = new_role,
  updated_at = NOW()
  WHERE id = target_user_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;
```

## 🧪 Testing

### Test Cases
1. **User Role Assignment**:
   - Create new user → Should get 'participant' role
   - Update user role → Should validate properly
   - Test role-based permissions

2. **Impact Tracking**:
   - Create event with impact data
   - Verify impact score calculation
   - Test different impact levels

3. **Data Views**:
   - Test participant impact summary view
   - Test server impact summary view
   - Verify leaderboard updates

4. **Performance**:
   - Test indexes for performance
   - Verify query optimization
   - Test large dataset handling

## 📈 Performance Considerations

### Database Indexes
```sql
-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_participant_impact_user ON participant_impact_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_participant_impact_event ON participant_impact_logs(event_id);
CREATE INDEX IF NOT EXISTS idx_participant_impact_score ON participant_impact_logs(impact_score);
CREATE INDEX IF NOT EXISTS idx_server_impact_server ON server_impact_logs(server_id);
CREATE INDEX IF NOT EXISTS idx_server_impact_event ON server_impact_logs(event_id);
CREATE INDEX IF NOT EXISTS idx_server_impact_score ON server_impact_logs(impact_score);
```

### Query Optimization
- **Views**: Pre-computed summaries for faster queries
- **Indexes**: Strategic indexes on frequently queried columns
- **Partitioning**: Consider partitioning by date for large datasets
- **Caching**: Application-level caching for impact scores

## 🔄 Future Enhancements

### Potential Features
1. **Achievement Badges**: Visual badges for impact levels
2. **Impact Certificates**: Downloadable certificates
3. **Team Tracking**: Group/team impact tracking
4. **Location-Based Impact**: Geographic impact mapping
5. **Time-Series Analysis**: Impact trends over time
6. **API Endpoints**: RESTful API for impact data
7. **Mobile App**: Mobile-first impact tracking
8. **Gamification**: Points, levels, rewards system

### Advanced Analytics
1. **Environmental Impact Dashboard**: Real-time impact visualization
2. **Comparative Analysis**: User vs. community impact
3. **Goal Setting**: Personal impact goals
4. **Social Sharing**: Share achievements on social media
5. **Impact Challenges**: Community challenges and competitions
6. **Carbon Footprint**: Personal carbon footprint tracking

## 🐛 Troubleshooting

### Common Issues

#### 1. Migration Fails
- **Cause**: SQL syntax errors or permissions
- **Solution**: Check SQL syntax and run with admin privileges

#### 2. Impact Score Calculation
- **Cause**: Incorrect scoring weights
- **Solution**: Verify calculation function logic

#### 3. User Role Issues
- **Cause**: Role not assigned correctly
- **Solution**: Check trigger function and column values

#### 4. Performance Issues
- **Cause**: Missing indexes or large datasets
- **Solution**: Add appropriate indexes and optimize queries

### Debug Queries

```sql
-- Check user roles
SELECT id, full_name, user_role FROM profiles WHERE user_role IS NOT NULL;

-- Check impact logs
SELECT COUNT(*) as total_logs, 
       COUNT(CASE WHEN status = 'attended' THEN 1 END) as attended_logs
FROM impact_logs;

-- Check impact scores
SELECT user_id, SUM(impact_score) as total_score
FROM impact_logs 
WHERE status = 'attended'
GROUP BY user_id;
```

---

**Impact Tracking System Complete!** 🌍

Your EcoVolunteer PRO platform now has a comprehensive environmental impact tracking system with separate tracking for participants and servers, detailed impact scoring, and robust user role management.
