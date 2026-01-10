# 🌍 Arvi

> **Connect. Clean. Conquer.** A comprehensive platform connecting environmental volunteers with cleanup events, featuring AI-powered analytics, interactive maps, and gamified achievements.

---

## ✨ Key Features

### 🚀 Core Functionality
- **🔐 Secure Authentication**: Multi-method login (Email/Password, Magic Link, Google OAuth)
- **📅 Event Management**: Create, browse, and register for environmental cleanup events
- **🗺️ Interactive Maps**: Real-time event visualization with location-based filtering
- **📊 Impact Tracking**: Log and visualize environmental contributions (waste, trees, area)
- **🤖 AI-Powered Analytics**: Personalized insights and smart recommendations
- **🏆 Global Leaderboard**: Compete with volunteers worldwide
- **🎯 Achievement System**: Unlock badges and milestones as you progress
- **👤 User Profiles**: Track your environmental journey and showcase impact

### 🌱 Event Categories
| Category | Description |
|----------|-------------|
| 🏖️ Beach Cleanup | Coastal and marine debris removal |
| 🌲 Forest Restoration | Tree planting and forest conservation |
| 🌊 River Cleanup | Waterway purification and maintenance |
| 🏞️ Park Maintenance | Public space beautification |
| 🦌 Wildlife Conservation | Habitat protection and preservation |
| ⚡ Custom Events | Community-specific environmental initiatives |

---

## 🛠️ Technology Stack

| Component | Technology | Version |
|-----------|------------|---------|
| **Frontend** | Next.js | 16 |
| **UI Library** | React | 19 |
| **Language** | TypeScript | Latest |
| **Styling** | Tailwind CSS | v4 |
| **Components** | shadcn/ui | Latest |
| **Database** | Supabase (PostgreSQL) | Latest |
| **Authentication** | Supabase Auth + Google OAuth | Latest |
| **AI Services** | Vercel AI SDK + OpenAI | Latest |
| **Charts** | Recharts | Latest |
| **Icons** | Lucide React | Latest |

---

## 🚀 Quick Start

### 📋 Prerequisites
- **Node.js** 18+ installed
- **Supabase** account (pre-configured)
- **Google Cloud Console** (optional, for OAuth)

### 🔐 Getting Started - Create Your Account

> **⚠️ Important**: No default test credentials exist. You must create your own account.

#### Authentication Options

| Method | Setup Required | Best For |
|--------|----------------|----------|
| **📧 Email/Password** | ❌ None | Quick start |
| **🔗 Magic Link (OTP)** | ❌ None | Passwordless convenience |
| **🔵 Google OAuth** | ✅ Configuration | One-click access |

---

### 📧 Option 1: Email/Password (Traditional)

**Sign Up:**
1. Navigate to `/auth/signup`
2. Enter your full name and email
3. Create a password (min. 6 characters)
4. Click "Create Account"

**✅ Automatic Setup:**
- Profile creation in `profiles` table
- Leaderboard initialization
- Dashboard redirect

**Sign In:** Visit `/auth/login` with your credentials

---

=======

# 🌍 EcoVolunteer PRO

> **Connect. Clean. Conquer.** A comprehensive platform connecting environmental volunteers with cleanup events, featuring AI-powered analytics, interactive maps, and gamified achievements.

---

## ✨ Key Features

### 🚀 Core Functionality
- **🔐 Secure Authentication**: Multi-method login (Email/Password, Magic Link, Google OAuth)
- **📅 Event Management**: Create, browse, and register for environmental cleanup events
- **🗺️ Interactive Maps**: Real-time event visualization with location-based filtering
- **📊 Impact Tracking**: Log and visualize environmental contributions (waste, trees, area)
- **🤖 AI-Powered Analytics**: Personalized insights and smart recommendations
- **🏆 Global Leaderboard**: Compete with volunteers worldwide
- **🎯 Achievement System**: Unlock badges and milestones as you progress
- **👤 User Profiles**: Track your environmental journey and showcase impact

### 🌱 Event Categories
| Category | Description |
|----------|-------------|
| 🏖️ Beach Cleanup | Coastal and marine debris removal |
| 🌲 Forest Restoration | Tree planting and forest conservation |
| 🌊 River Cleanup | Waterway purification and maintenance |
| 🏞️ Park Maintenance | Public space beautification |
| 🦌 Wildlife Conservation | Habitat protection and preservation |
| ⚡ Custom Events | Community-specific environmental initiatives |

---

## 🛠️ Technology Stack

| Component | Technology | Version |
|-----------|------------|---------|
| **Frontend** | Next.js | 16 |
| **UI Library** | React | 19 |
| **Language** | TypeScript | Latest |
| **Styling** | Tailwind CSS | v4 |
| **Components** | shadcn/ui | Latest |
| **Database** | Supabase (PostgreSQL) | Latest |
| **Authentication** | Supabase Auth + Google OAuth | Latest |
| **AI Services** | Vercel AI SDK + OpenAI | Latest |
| **Charts** | Recharts | Latest |
| **Icons** | Lucide React | Latest |

---

## 🚀 Quick Start

### 📋 Prerequisites
- **Node.js** 18+ installed
- **Supabase** account (pre-configured)
- **Google Cloud Console** (optional, for OAuth)

### 🔐 Getting Started - Create Your Account

> **⚠️ Important**: No default test credentials exist. You must create your own account.

#### Authentication Options

| Method | Setup Required | Best For |
|--------|----------------|----------|
| **📧 Email/Password** | ❌ None | Quick start |
| **🔗 Magic Link (OTP)** | ❌ None | Passwordless convenience |
| **🔵 Google OAuth** | ✅ Configuration | One-click access |

---

### 📧 Option 1: Email/Password (Traditional)

**Sign Up:**
1. Navigate to `/auth/signup`
2. Enter your full name and email
3. Create a password (min. 6 characters)
4. Click "Create Account"

**✅ Automatic Setup:**
- Profile creation in `profiles` table
- Leaderboard initialization
- Dashboard redirect

**Sign In:** Visit `/auth/login` with your credentials

---

>>>>>>> aea4f08036e154434cbcc166806869882768953a
### 🔗 Option 2: Magic Link/OTP (Recommended)

**Passwordless sign-in in 3 steps:**
1. Go to `/auth/login` → "Magic Link" tab
2. Enter your email address
3. Click "Send Magic Link" and check your email
4. Click the secure link to sign in automatically

**🎯 Benefits:**
- No password to remember
- Enhanced security
- Cross-device compatibility
- 1-hour expiration, single-use

📖 **Detailed Guide**: [OTP_AUTHENTICATION.md](./OTP_AUTHENTICATION.md)

---

### 🔵 Option 3: Google OAuth (Advanced)

**Setup Required:**
1. Follow [GOOGLE_OAUTH_SETUP.md](./GOOGLE_OAUTH_SETUP.md)
2. Configure Google Cloud Console
3. Enable Google provider in Supabase
4. Click "Sign in with Google"

**🎯 Benefits:**
- One-click authentication
- Automatic profile creation
- Faster signup process

---

## 🏗️ Installation & Setup

### 1. Dependencies Management
```bash
# Dependencies are automatically managed in v0
npm install  # If needed for local development
```

### 2. Database Status ✅ **COMPLETE**

| Component | Status |
|-----------|--------|
| Schema Creation | ✅ `scripts/001-create-schema.sql` |
| Achievement Seeding | ✅ `scripts/002-seed-achievements.sql` |
| Table Deployment | ✅ 8 tables with RLS |
| Supabase Integration | ✅ Connected and operational |

### 3. Start Using the Platform
1. **Create Account**: `/auth/signup`
2. **Create Event**: `/dashboard/events/create`
3. **Register & Participate**: Join events
4. **Track Impact**: Log contributions
5. **Compete**: Climb the leaderboard

---

## 🗄️ Database Architecture

### Core Tables
| Table | Purpose | Security |
|-------|---------|----------|
| `profiles` | Extended user information | RLS Enabled |
| `events` | Cleanup event details | RLS Enabled |
| `event_participants` | Registration tracking | RLS Enabled |
| `impact_logs` | Contribution records | RLS Enabled |
| `achievements` | Badge definitions | RLS Enabled |
| `user_achievements` | Earned achievements | RLS Enabled |
| `leaderboard` | Rankings & statistics | RLS Enabled |
| `notifications` | User notifications | RLS Enabled |

🔒 **All tables protected with Row Level Security (RLS)**

---

## 📁 Project Structure

```
📦 app/
├── 🏠 page.tsx                    # Landing page
├── 🔐 auth/
│   ├── 📝 login/page.tsx         # Login interface
│   ├── ✍️ signup/page.tsx        # Sign-up interface
│   ├── 🚪 logout/route.ts         # Logout endpoint
│   └── 🔄 callback/page.tsx       # OAuth handler
├── 📊 dashboard/
│   ├── 📈 page.tsx               # Main dashboard
│   ├── 📅 events/
│   │   ├── 📋 page.tsx          # Event listing
│   │   ├── ➕ create/page.tsx    # Event creation
│   │   └── 👁️ [id]/page.tsx     # Event details
│   ├── 🗺️ map/page.tsx          # Interactive map
│   ├── 📊 analytics/page.tsx     # Impact analytics
│   ├── 🏆 leaderboard/page.tsx   # Global rankings
│   └── 👤 profile/page.tsx       # User profile
└── 🔌 api/
    └── 🤖 ai/
        └── 💡 recommendations/   # AI recommendations
            route.ts

🎨 components/
├── 🧭 dashboard-nav.tsx         # Navigation
├── 📊 dashboard-stats.tsx       # Statistics cards
├── 📅 upcoming-events.tsx       # Event preview
├── 🌱 recent-impact.tsx         # Impact history
├── 🏆 achievement-showcase.tsx  # Achievement display
├── 📋 event-list.tsx           # Event grid
├── 👁️ event-details.tsx       # Event details
├── ➕ create-event-form.tsx     # Event creation
├── 🗺️ interactive-map.tsx      # Map component
├── 📈 impact-charts.tsx        # Analytics charts
├── 🤖 ai-insights.tsx          # AI recommendations
└── ⚙️ profile-settings.tsx      # Profile editor

🔧 lib/
└── 🗄️ supabase/
    ├── 🌐 client.ts             # Browser client
    ├── 🖥️ server.ts             # Server client
    └── 🔄 proxy.ts              # Middleware
```

---

## 🛣️ Routing Guide

### 🌐 Public Routes
| Route | Purpose |
|-------|---------|
| `/` | Landing page & overview |
| `/auth/login` | Multi-method authentication |
| `/auth/signup` | Account creation |
| `/auth/callback` | OAuth callback handler |

### 🔒 Protected Routes (Authentication Required)
| Route | Feature |
|-------|---------|
| `/dashboard` | Main dashboard with statistics |
| `/dashboard/events` | Browse all events |
| `/dashboard/events/create` | Create new events |
| `/dashboard/events/[id]` | Event details & registration |
| `/dashboard/map` | Interactive event map |
| `/dashboard/analytics` | Personal impact + AI insights |
| `/dashboard/leaderboard` | Global volunteer rankings |
| `/dashboard/profile` | Profile management |

---

## 🎯 Feature Deep Dive

### 🔐 Authentication System
- **Multi-method support**: Email/Password, Magic Link, Google OAuth
- **Automatic profile creation**: Seamless onboarding
- **Protected routes**: Middleware-based access control
- **Session management**: Secure cookie-based sessions
- **Development mode**: No email confirmation required

### 📅 Event Management
- **Rich event details**: Location, difficulty, capacity, description
- **Category organization**: 6 predefined event types
- **Difficulty levels**: Beginner, Intermediate, Advanced
- **Real-time tracking**: Live registration status
- **Location services**: Coordinate-based mapping

### 📊 Impact Tracking
- **Multiple metrics**: Waste (kg), Area (m²), Trees planted
- **Media support**: Photo uploads and notes
- **Verification system**: Contribution validation
- **Historical data**: Progress tracking over time

### 🤖 AI-Powered Features
- **Smart recommendations**: Personalized event suggestions
- **Trend analysis**: Impact pattern recognition
- **Goal setting**: AI-generated monthly targets
- **Performance insights**: Progress optimization tips

### 🏆 Gamification Elements
- **Points system**: Multi-metric scoring
- **Leaderboard rankings**: Global and local competition
- **Achievement system**: 15+ badges across 4 tiers
- **Progress tracking**: Visual milestone indicators

---

## 🎨 Customization Guide

### Adding Event Categories
```sql
-- Update in scripts/001-create-schema.sql
ALTER TYPE event_category ADD VALUE 'new_category';
```

### Modifying Achievements
```sql
-- Edit in scripts/002-seed-achievements.sql
-- Add new achievements or modify existing criteria
```

### Theme Customization
**Eco-themed palette** in `app/globals.css`:
- **Primary** 🟢: Fresh green (environmental actions)
- **Secondary** 🔵: Ocean blue (water activities)
- **Accent** 🟡: Earthy amber (highlights)

---

## 🔒 Security Features

| Security Measure | Implementation |
|------------------|----------------|
| **Row Level Security** | All database tables |
| **User-specific policies** | Data access control |
| **Secure sessions** | HTTP-only cookies |
| **SQL injection prevention** | Parameterized queries |
| **XSS protection** | React built-in safeguards |
| **OAuth security** | Industry-standard implementation |

---

## ⚡ Performance Optimizations

- **Server-side rendering**: Fast initial page loads
- **Optimistic UI updates**: Instant user feedback
- **Database indexing**: Efficient query performance
- **Image optimization**: Next.js automatic optimization
- **Code splitting**: Reduced bundle sizes
- **Lazy loading**: On-demand component loading

---

## 🚀 Future Roadmap

### 🎯 Upcoming Features
- [ ] **Real map integration** (Leaflet/Google Maps)
- [ ] **Photo upload system** for impact verification
- [ ] **Social features** (follow users, comments)
- [ ] **QR code check-ins** for events
- [ ] **Email notification system**
- [ ] **Mobile application** (React Native)
- [ ] **Organization accounts** for NGOs
- [ ] **Event templates** for quick creation
- [ ] **Calendar integration** (Google/Outlook)
- [ ] **Weather integration** for event planning

---

## 📖 Quick Start Guide

### 1️⃣ **Create Account**
```bash
# Choose your method:
# A) Traditional: /auth/signup
# B) Passwordless: Magic Link at /auth/login  
# C) One-click: Google OAuth (setup required)
```

### 2️⃣ **Explore Dashboard**
Navigate to `/dashboard` to view your statistics and overview

### 3️⃣ **Create Your First Event**
Visit `/dashboard/events/create` to organize a cleanup

### 4️⃣ **Join Events**
Browse and register for events in your area

### 5️⃣ **Track Your Impact**
Log contributions and watch your environmental impact grow

### 6️⃣ **Compete & Achieve**
Climb the leaderboard and unlock achievement badges

---

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| **[GETTING_STARTED.md](./GETTING_STARTED.md)** | Comprehensive platform guide |
| **[OTP_AUTHENTICATION.md](./OTP_AUTHENTICATION.md)** | Magic Link setup & usage |
| **[GOOGLE_OAUTH_SETUP.md](./GOOGLE_OAUTH_SETUP.md)** | Google OAuth configuration |
| **[.env.example](./.env.example)** | Environment variables reference |
| **[.env.local.example](./.env.local.example)** | Quick start template |

---

## 🔧 Troubleshooting

### 🔐 Authentication Issues

#### Magic Link Problems
- **Check spam/junk folders**
- **Verify email address accuracy**
- **Wait 1 minute between requests** (rate limiting)
- **Ensure Supabase email service is configured**
- **Links expire after 1 hour**

#### Google OAuth Issues
- **Verify Supabase OAuth configuration**
- **Check redirect URI in Google Cloud Console**
- **Ensure callback route exists at `/auth/callback`
- **Follow detailed guide in GOOGLE_OAUTH_SETUP.md**

### 🐛 Common Errors

#### "Profile not found"
**✅ Auto-fixed**: Dashboard now creates missing profiles automatically
- **Manual fix**: Log out and log back in

#### "Cannot register for event"
- **Verify you're logged in**
- **Check event capacity limits**
- **Ensure event hasn't ended**

#### "Events not showing on map"
- **Verify latitude/longitude coordinates**
- **Check location services permissions**
- **Ensure valid event location data**

---

## 🆘 Support & Help

### 📋 Self-Service Checklist
1. **Review** [GETTING_STARTED.md](./GETTING_STARTED.md)
2. **Check** [GOOGLE_OAUTH_SETUP.md](./GOOGLE_OAUTH_SETUP.md) for OAuth issues
3. **Verify** Supabase connection in IDE sidebar
4. **Check** environment variables in Vars section
5. **Inspect** browser console for client errors
6. **Confirm** account creation at `/auth/signup`

### 📞 Additional Support
- **Documentation**: Check linked guides above
- **Environment**: Verify all prerequisites are met
- **Browser**: Clear cache and cookies if needed

---

## 📄 License

Built with ❤️ using **v0 by Vercel**

---

<<<<<<< HEAD
> **🌍 Join the movement**: Connect with environmental volunteers worldwide and make a tangible impact on our planet's future.
=======
> **🌍 Join the movement**: Connect with environmental volunteers worldwide and make a tangible impact on our planet's future.
>>>>>>> aea4f08036e154434cbcc166806869882768953a
