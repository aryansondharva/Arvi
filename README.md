# EcoVolunteer PRO

A comprehensive platform connecting environmental volunteers with cleanup events, featuring AI-powered analytics, interactive maps, and gamified achievements.

## Features

### Core Features
- **User Authentication**: Secure sign-up and login with Supabase Auth + Google OAuth
- **Event Management**: Create, browse, and register for environmental cleanup events
- **Interactive Map**: Visualize events on an interactive map with real-time location data
- **Impact Tracking**: Log environmental contributions (waste collected, trees planted, area cleaned)
- **AI-Powered Analytics**: Personalized insights and recommendations using AI
- **Global Leaderboard**: Compete with volunteers worldwide
- **Achievement System**: Unlock badges and achievements as you contribute
- **User Profiles**: Customize your profile and track your journey

### Event Categories
- Beach Cleanup
- Forest Restoration
- River Cleanup
- Park Maintenance
- Wildlife Conservation
- Custom Events

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS v4, shadcn/ui components
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth with Google OAuth
- **AI**: Vercel AI SDK with OpenAI
- **Charts**: Recharts
- **Icons**: Lucide React

## Getting Started

### Prerequisites
- Node.js 18+ installed
- Supabase account (already configured)
- Google Cloud Console account (optional, for OAuth)

### 🔐 First Time Setup - Creating Your Account

**IMPORTANT: There are no default test credentials.** You must create your own account to use the platform.

#### Authentication Methods

The platform supports three authentication methods:

1. **Email/Password Authentication** (Quick Start - No Setup Required)
2. **Magic Link (OTP)** (Passwordless - No Setup Required)
3. **Google OAuth** (Requires Configuration)

#### Option 1: Email/Password Sign Up (Traditional Method)

**Step 1: Sign Up**
1. Navigate to `/auth/signup` in your browser
2. Enter your full name
3. Enter your email address
4. Create a password (minimum 6 characters)
5. Click "Create Account"

**What happens automatically:**
- Your account is created in Supabase Auth
- A profile record is automatically created in the `profiles` table
- A leaderboard entry is automatically initialized for you
- You're redirected to the dashboard

**Step 2: Sign In** (for subsequent visits)
1. Go to `/auth/login`
2. Enter the email and password you created
3. Click "Sign In"
4. Access your dashboard at `/dashboard`

#### Option 2: Magic Link / OTP (Passwordless - Recommended)

**No password needed!** Simply enter your email and we'll send you a secure link.

**Step 1: Request Magic Link**
1. Go to `/auth/login`
2. Click the "Magic Link" tab
3. Enter your email address
4. Click "Send Magic Link"
5. Check your email inbox

**Step 2: Click the Link**
1. Open the email from EcoVolunteer
2. Click the secure magic link
3. You'll be automatically signed in!
4. Your profile is created automatically if it's your first time

**Benefits:**
- No password to remember
- More secure (no password to steal)
- Faster sign-in process
- Works on any device

**Note:** Magic links expire after 1 hour and are single-use only.

For detailed OTP authentication information, see: **[OTP_AUTHENTICATION.md](./OTP_AUTHENTICATION.md)**

#### Option 3: Google OAuth (Requires Setup)

To enable "Sign in with Google" functionality:

1. Follow the comprehensive setup guide in `GOOGLE_OAUTH_SETUP.md`
2. Configure Google Cloud Console with OAuth credentials
3. Enable Google provider in Supabase
4. Click "Sign in with Google" on login or signup pages

**Benefits of Google OAuth:**
- One-click authentication
- No need to remember passwords
- Automatic profile creation with Google account info
- Faster signup process

For detailed Google OAuth setup instructions, see: **[GOOGLE_OAUTH_SETUP.md](./GOOGLE_OAUTH_SETUP.md)**

### Installation

1. The project dependencies are automatically managed in v0

2. **Database Setup** (✅ Already Complete):
   - ✅ Schema created (`scripts/001-create-schema.sql`)
   - ✅ Achievements seeded (`scripts/002-seed-achievements.sql`)
   - ✅ All 8 tables are live with Row Level Security enabled
   - ✅ Supabase integration is connected and working

3. Start using the platform:
   - Create your account at `/auth/signup`
   - Create your first event
   - Register for events
   - Track your impact!

### ✅ Supabase Status

Your Supabase integration is **fully configured and working**:
- ✅ All environment variables set
- ✅ Database schema deployed
- ✅ Row Level Security enabled
- ✅ Authentication system ready
- ✅ 8 tables created: profiles, events, event_participants, impact_logs, achievements, user_achievements, leaderboard, notifications

## Database Schema

The platform uses the following main tables:
- **profiles**: Extended user information
- **events**: Cleanup event details
- **event_participants**: Event registration tracking
- **impact_logs**: Environmental contribution records
- **achievements**: Available badges and milestones
- **user_achievements**: User-earned achievements
- **leaderboard**: Ranking and statistics
- **notifications**: User notification system

All tables are protected with Row Level Security (RLS) policies.

## Application Structure

```
app/
├── page.tsx                      # Landing page
├── auth/
│   ├── login/page.tsx           # Login page
│   ├── signup/page.tsx          # Sign-up page
│   ├── logout/route.ts          # Logout endpoint
│   └── callback/page.tsx        # OAuth callback handler
├── dashboard/
│   ├── page.tsx                 # User dashboard
│   ├── events/
│   │   ├── page.tsx            # Event listing
│   │   ├── create/page.tsx     # Create event
│   │   └── [id]/page.tsx       # Event details
│   ├── map/page.tsx            # Interactive map
│   ├── analytics/page.tsx      # Impact analytics
│   ├── leaderboard/page.tsx    # Global rankings
│   └── profile/page.tsx        # User profile
└── api/
    └── ai/
        └── recommendations/     # AI recommendation endpoint
            route.ts

components/
├── dashboard-nav.tsx           # Main navigation
├── dashboard-stats.tsx         # Statistics cards
├── upcoming-events.tsx         # Event preview
├── recent-impact.tsx          # Impact history
├── achievement-showcase.tsx   # Achievement display
├── event-list.tsx            # Event grid
├── event-details.tsx         # Event detail view
├── create-event-form.tsx     # Event creation
├── interactive-map.tsx       # Map component
├── impact-charts.tsx         # Analytics charts
├── ai-insights.tsx           # AI recommendations
└── profile-settings.tsx      # Profile editor

lib/
└── supabase/
    ├── client.ts              # Browser client
    ├── server.ts              # Server client
    └── proxy.ts               # Middleware
```

## Key Routes

### Public Routes
- `/` - Landing page
- `/auth/login` - Sign in (Email/Password, Magic Link, or Google)
- `/auth/signup` - Create account (Email/Password or Google)
- `/auth/callback` - OAuth callback handler

### Protected Routes (require authentication)
- `/dashboard` - User dashboard with stats and overview
- `/dashboard/events` - Browse all events
- `/dashboard/events/create` - Create new event
- `/dashboard/events/[id]` - Event details and registration
- `/dashboard/map` - Interactive event map
- `/dashboard/analytics` - Personal impact analytics with AI insights
- `/dashboard/leaderboard` - Global volunteer rankings
- `/dashboard/profile` - Profile settings

## Features in Detail

### Authentication Flow
- Email/password authentication via Supabase
- **OTP/Magic Link passwordless authentication** (recommended)
- Google OAuth integration for one-click sign-in
- **Automatic profile creation on signup** - no manual setup needed
- Protected routes with middleware
- Session management with cookies
- No email confirmation required in development mode

### Event Management
- Create events with detailed information
- Category-based organization
- Difficulty levels (Beginner, Intermediate, Advanced)
- Participant limits and tracking
- Real-time registration status

### Impact Tracking
- Log waste collected (kg)
- Track area cleaned (square meters)
- Count trees planted
- Upload photos and notes
- Verification system

### AI Features
- Personalized event recommendations
- Impact trend analysis
- Achievement progress tracking
- Performance insights
- Monthly goal suggestions

### Leaderboard System
- Points-based ranking
- Multiple metrics (events, waste, trees)
- User rank display
- Top performers showcase
- Percentage-based badges

### Achievement System
- 15+ predefined achievements
- Multiple tiers (Bronze, Silver, Gold, Platinum)
- Criteria types: events attended, waste collected, trees planted, streak days
- Automatic unlocking based on progress

## Customization

### Adding New Event Categories
Update the category enum in `scripts/001-create-schema.sql` and add corresponding colors in event components.

### Modifying Achievements
Edit `scripts/002-seed-achievements.sql` to add or modify achievement criteria and tiers.

### Styling
The app uses a custom eco-themed color palette defined in `app/globals.css`:
- Primary: Fresh green for environmental actions
- Secondary: Ocean blue for water-related activities
- Accent: Earthy amber for highlights

## Security

- Row Level Security (RLS) enabled on all tables
- User-specific data access policies
- Secure session management
- SQL injection prevention with parameterized queries
- XSS protection with React

## Performance Optimizations

- Server-side rendering for initial page loads
- Optimistic UI updates
- Efficient database queries with indexes
- Image optimization with Next.js
- Code splitting and lazy loading

## Future Enhancements

Potential features for future development:
- Real map integration (Leaflet/Google Maps)
- Photo upload for impact logs
- Social features (follow users, comments)
- Event check-in with QR codes
- Email notifications
- Mobile app
- Organization accounts
- Event templates
- Calendar integration
- Weather integration

## Quick Start Guide

1. **Create Account**: 
   - **Option A**: Go to `/auth/signup` and create email/password credentials
   - **Option B**: Click "Sign in with Google" (requires OAuth setup)
   - **Option C**: Click "Magic Link" and enter your email (no setup required)
2. **Explore Dashboard**: View your stats at `/dashboard`
3. **Create Event**: Add your first cleanup event at `/dashboard/events/create`
4. **Register**: Sign up for events you want to join
5. **Track Impact**: Log your environmental contributions
6. **Climb Leaderboard**: Compete with other volunteers
7. **Earn Achievements**: Unlock badges as you progress

## Documentation

- **[GETTING_STARTED.md](./GETTING_STARTED.md)** - Detailed platform usage guide
- **[OTP_AUTHENTICATION.md](./OTP_AUTHENTICATION.md)** - Magic Link / OTP authentication guide
- **[GOOGLE_OAUTH_SETUP.md](./GOOGLE_OAUTH_SETUP.md)** - Google OAuth configuration guide
- **[.env.example](./.env.example)** - Environment variables reference
- **[.env.local.example](./.env.local.example)** - Quick start environment template

## Troubleshooting

### Authentication Issues

#### Magic Link not received
- Check your spam/junk folder
- Verify email address is correct
- Wait 1 minute before requesting another link (rate limiting)
- Ensure Supabase email service is configured
- Magic links expire after 1 hour

#### Google OAuth not working
- Verify Google OAuth is configured in Supabase Dashboard
- Check that redirect URI matches in Google Cloud Console
- Ensure callback route exists at `/auth/callback`
- See `GOOGLE_OAUTH_SETUP.md` for detailed troubleshooting

### "Profile not found" error
**Fixed!** The dashboard now automatically creates missing profiles. If you still encounter this, try logging out and back in.

### "Cannot register for event"
Make sure you're logged in and the event hasn't reached maximum capacity.

### Events not showing on map
Events need valid latitude/longitude coordinates. Verify coordinates when creating events.

## Support

For issues or questions:
1. Check `GETTING_STARTED.md` for detailed setup instructions
2. Check `GOOGLE_OAUTH_SETUP.md` for OAuth configuration help
3. Verify Supabase connection in the Connect section of the sidebar
4. Check environment variables in the Vars section
5. Review the browser console for client-side errors
6. Ensure you've created an account at `/auth/signup`

## License

Built with v0 by Vercel
#   A r v i 
 
 
