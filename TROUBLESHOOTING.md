# Troubleshooting Guide

## Login Issues - "Invalid Credentials" Error

If you're getting "invalid credentials" or "wrong password" errors when trying to sign in, here are the most common causes and solutions:

### 1. Account Doesn't Exist Yet

**Problem:** You're trying to log in but haven't created an account first.

**Solution:**
- Go to `/auth/signup` first
- Create a new account with your email and password
- Then try logging in with those same credentials

### 2. Email Confirmation Required

**Problem:** Supabase might require email confirmation before allowing login.

**Solution:**
- Check your email inbox (and spam folder) for a confirmation email
- Click the confirmation link in the email
- Then try logging in again

### 3. Typos in Email or Password

**Problem:** Even a small typo will cause login to fail.

**Solution:**
- Double-check your email address for typos
- Make sure Caps Lock is not on for password
- Try copying and pasting your credentials if you saved them

### 4. Email Confirmation Disabled

**Problem:** Supabase email confirmation might be enabled but emails aren't being sent.

**Solution:**
- Disable email confirmation in Supabase dashboard:
  1. Go to Authentication → Providers → Email
  2. Turn OFF "Confirm email"
  3. Save changes
- Try signing up again

### 5. Using Wrong Supabase Project

**Problem:** Environment variables point to wrong Supabase project.

**Solution:**
- Verify your `.env.local` file has correct values:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- These should match your Supabase project settings

## Step-by-Step: Creating Your First Account

1. **Go to Signup Page**
   - Navigate to `/auth/signup`

2. **Fill Out Form**
   - Full Name: `John Doe`
   - Email: `test@example.com`
   - Password: `password123` (minimum 6 characters)

3. **Click "Create Account"**
   - Wait for success message
   - You'll be redirected to dashboard

4. **Login Next Time**
   - Go to `/auth/login`
   - Use the SAME email and password
   - Click "Sign In"

## Checking Debug Logs

Open your browser console (F12 or right-click → Inspect → Console) to see detailed logs:

- `[v0] Attempting login for email:` - Shows login attempt
- `[v0] Login response:` - Shows Supabase response
- `[v0] Login successful` - Login worked
- `[v0] Login error:` - Shows specific error details

## Still Having Issues?

1. **Clear browser cache and cookies**
2. **Try a different browser**
3. **Use Google Sign-In instead** (if configured)
4. **Use Magic Link** (OTP) authentication instead
5. **Check Supabase dashboard** to see if users are being created

## Verifying Your Setup

Run this checklist:

- [ ] Supabase integration is connected
- [ ] Environment variables are set
- [ ] Database tables are created (check scripts folder)
- [ ] Email confirmation is disabled OR working
- [ ] You've actually created an account before trying to login
- [ ] You're using the correct email/password combination
