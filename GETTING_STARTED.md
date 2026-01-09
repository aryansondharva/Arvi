# 🌍 EcoVolunteer PRO - Getting Started Guide

## ✅ Supabase Status: CONNECTED & WORKING

Your Supabase integration is properly configured with:
- ✅ All 8 database tables created (profiles, events, event_participants, impact_logs, achievements, user_achievements, leaderboard, notifications)
- ✅ Row Level Security (RLS) enabled on all tables
- ✅ Environment variables configured
- ✅ Authentication system ready

## 🚀 How to Get Started

### Step 1: Create Your Account

**There are no default test credentials.** You need to create your own account:

1. Navigate to `/auth/signup` in your browser
2. Enter your email address (use a real email if email confirmation is enabled)
3. Create a strong password (minimum 6 characters)
4. Click "Sign Up"

**What happens automatically:**
- ✅ Your account is created in Supabase Auth
- ✅ A profile record is created in the `profiles` table
- ✅ A leaderboard entry is created for you
- ✅ You're ready to use all features!

### Step 2: Sign In

1. Go to `/auth/login`
2. Enter your email and password
3. Click "Sign In"
4. You'll be redirected to `/dashboard`

### Step 3: Explore Features

Once logged in, you can:

#### 📅 **Dashboard** (`/dashboard`)
- View your personal statistics
- See upcoming events you've registered for
- Check recent impact contributions
- View your achievements

#### 🗺️ **Interactive Map** (`/dashboard/map`)
- Discover cleanup events near you
- Click markers to see event details
- Filter by category and difficulty

#### 📊 **Analytics** (`/dashboard/analytics`)
- View AI-powered insights
- See impact charts (waste collected, trees planted, etc.)
- Get personalized recommendations

#### 🏆 **Leaderboard** (`/dashboard/leaderboard`)
- See global rankings
- Compare your impact with other volunteers
- Track your rank progress

#### 📋 **Events** (`/dashboard/events`)
- Browse all available events
- Register for events
- See event details and participants

#### ➕ **Create Event** (`/dashboard/events/create`)
- Organize your own cleanup event
- Set location, date, and details
- Manage registrations

#### 👤 **Profile** (`/dashboard/profile`)
- Update your personal information
- Change your avatar and bio
- View your contribution history

## 🔐 Authentication Flow

### Sign Up Process
```
User enters email/password → Supabase Auth creates account → 
Automatic profile creation → Leaderboard entry created → 
Redirect to dashboard
```

### Sign In Process
```
User enters credentials → Supabase verifies → 
Session established → Protected routes accessible
```

### Protected Routes
All `/dashboard/*` routes require authentication. If not logged in, you'll be redirected to `/auth/login`.

## 📝 Creating Your First Event

1. Go to `/dashboard/events/create`
2. Fill in event details:
   - **Title**: e.g., "Beach Cleanup at Santa Monica"
   - **Description**: What volunteers can expect
   - **Location**: Full address
   - **Coordinates**: Latitude and longitude for map display
   - **Dates**: Start and end times
   - **Max Participants**: Optional capacity limit
   - **Category**: beach-cleanup, forest-restoration, river-cleanup, etc.
   - **Difficulty**: beginner, intermediate, or advanced

3. Click "Create Event"
4. Your event appears on the map and events list!

## 🎯 Earning Achievements

Achievements are automatically unlocked based on your activity:

**Achievement Types:**
- **Events Attended**: Bronze (5), Silver (10), Gold (25), Platinum (50)
- **Waste Collected**: Bronze (50kg), Silver (100kg), Gold (500kg), Platinum (1000kg)
- **Trees Planted**: Bronze (10), Silver (50), Gold (100), Platinum (500)
- **Streak Days**: Bronze (7), Silver (30), Gold (90), Platinum (365)

View seeded achievements at `/dashboard/leaderboard` under the Achievements tab.

## 🧪 Testing the Platform

### Quick Test Flow:
1. **Sign up** with your email
2. **Create a test event** at your location
3. **Register** for your own event
4. **Log impact** after "completing" the event
5. **Check leaderboard** to see your ranking
6. **View analytics** to see your impact visualized

### Sample Data
The platform includes:
- ✅ Pre-seeded achievements (16 different badges)
- ⚠️ No sample events (create your own!)
- ⚠️ No sample users (sign up to begin!)

## 🔧 Database Schema Overview

### Core Tables:
- **profiles**: User information (linked to auth.users)
- **events**: All cleanup events
- **event_participants**: Who's registered for what
- **impact_logs**: Track waste collected, trees planted, etc.
- **achievements**: Achievement definitions
- **user_achievements**: Unlocked achievements per user
- **leaderboard**: Rankings and stats
- **notifications**: User notifications

### Security:
All tables have Row Level Security enabled. Users can only:
- View public data (events, profiles, leaderboard)
- Modify their own data (profile, registrations, impact logs)
- Create content they own (events, impact logs)

## 🐛 Troubleshooting

### "Profile not found" error
**Solution**: The dashboard automatically creates profiles now. If you still see this, try logging out and back in.

### "Cannot register for event" error
**Solution**: Make sure you're logged in and the event hasn't reached max capacity.

### Events not showing on map
**Solution**: Events need valid latitude/longitude coordinates. Double-check the coordinates when creating events.

### Email confirmation required
**Solution**: Check your email for the confirmation link from Supabase. If email is not configured, check with your admin.

## 🌟 Platform Features at a Glance

| Feature | Status | Location |
|---------|--------|----------|
| Authentication | ✅ Working | `/auth/login`, `/auth/signup` |
| Dashboard | ✅ Working | `/dashboard` |
| Event Management | ✅ Working | `/dashboard/events` |
| Interactive Map | ✅ Working | `/dashboard/map` |
| AI Analytics | ✅ Working | `/dashboard/analytics` |
| Leaderboard | ✅ Working | `/dashboard/leaderboard` |
| Profile Management | ✅ Working | `/dashboard/profile` |
| Impact Tracking | ✅ Working | Built into events |
| Achievements | ✅ Working | Auto-unlock system |

## 📧 Need Help?

- Check the browser console for detailed error messages
- Verify you're logged in for protected routes
- Ensure JavaScript is enabled
- Try clearing browser cache/cookies

---

**Ready to make an impact?** Head to `/auth/signup` and create your account! 🌱
