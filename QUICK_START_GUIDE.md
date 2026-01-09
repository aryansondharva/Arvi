# Quick Start Guide - EcoVolunteer PRO

## Getting Started in 3 Steps

### Step 1: Run the Auto-Confirm Script (Development Only)

To allow immediate login after signup without email confirmation:

1. Run the script: `scripts/007-enable-auto-confirm.sql`
2. This will:
   - Confirm all existing unconfirmed users
   - Enable auto-confirmation for new signups

**Important:** Disable this in production for security!

### Step 2: Create Your Account

Go to `/auth/signup` and create an account:

```
Full Name: Your Name
Email: your.email@example.com
Password: yourpassword123 (min 6 characters)
```

**Common Issue:** Make sure you type your email correctly! 
- ✅ `user@gmail.com`
- ❌ `user@gmai.com` (typo - missing 'l')

The system automatically converts emails to lowercase, so these are the same:
- `User@Gmail.com` = `user@gmail.com` ✅

### Step 3: Login

After signup:
- If auto-confirm is enabled: You can login immediately
- If auto-confirm is disabled: Check your email and click the confirmation link first

Go to `/auth/login` and enter the **exact same email** you used during signup.

---

## Authentication Methods

### 1. Email & Password (Recommended for Development)
- Fastest setup
- No external services needed
- Works offline

### 2. Magic Link (OTP)
- Passwordless authentication
- Requires email service configuration
- More secure, no password to remember

### 3. Google OAuth
- One-click signup/login
- Requires Google Cloud Console setup
- Best for production

---

## Troubleshooting Login Issues

### "Invalid login credentials" Error

This error means one of three things:

1. **Email typo**: You typed your email differently than during signup
   - Solution: Double-check your email spelling
   - Example: `user@gmai.com` ≠ `user@gmail.com`

2. **Account doesn't exist**: You haven't signed up yet
   - Solution: Go to `/auth/signup` first

3. **Email not confirmed**: You haven't clicked the confirmation link
   - Solution: Check your email inbox for the confirmation link
   - Or: Enable auto-confirmation with script 007

### Email Not Confirmed

If you see "Email not confirmed":
1. Check your inbox for a confirmation email from Supabase
2. Click the confirmation link in the email
3. Return to login page and try again
4. Or: Run `scripts/007-enable-auto-confirm.sql` to skip confirmation (dev only)

### Password Too Short

Passwords must be at least 6 characters long.

---

## Testing the Platform

Once logged in, you can:

1. **Dashboard** - View your stats and upcoming events
2. **Events** - Browse and register for cleanup events
3. **Map** - See events on an interactive map
4. **Analytics** - View your impact with AI insights
5. **Leaderboard** - Compete with other volunteers
6. **Profile** - Customize your account

---

## Development Tips

- Use the debug logs in the browser console to troubleshoot issues
- All emails are automatically normalized to lowercase
- The platform creates your profile and leaderboard entry automatically on first login
- All data is stored in Supabase with Row Level Security enabled

---

## Need Help?

Check these files for more information:
- `README.md` - Complete platform documentation
- `TROUBLESHOOTING.md` - Detailed troubleshooting guide
- `EMAIL_CONFIRMATION_SETUP.md` - Email confirmation configuration
- `GOOGLE_OAUTH_SETUP.md` - Google OAuth setup guide
