# Login Troubleshooting Guide

## Common Login Issues

### "Invalid login credentials" Error

This error message from Supabase can mean several things:

#### 1. Wrong Password (Most Common)
- **Solution**: Try resetting your password or carefully re-enter it
- **Tip**: Passwords are case-sensitive and must match exactly

#### 2. Email Address Typo
Common mistakes:
- `@gmai.com` instead of `@gmail.com` (missing 'l')
- Extra spaces: ` user@example.com` or `user@example.com `
- Wrong capitalization (emails are case-insensitive but watch for typos)

**Solution**: 
- The login page automatically converts emails to lowercase and trims spaces
- Double-check your email spelling character by character

#### 3. Account Doesn't Exist
- **Solution**: Click "Sign up" instead and create a new account

#### 4. Email Not Confirmed (Rare - Auto-confirmation is enabled)
- **Solution**: Check your email for a confirmation link

---

## Quick Test

Want to test if login is working? Create a test account:

### Step 1: Sign Up
1. Go to `/auth/signup`
2. Use email: `test@example.com`
3. Use password: `test123456` (minimum 6 characters)
4. Click "Sign Up"

### Step 2: Login
1. Go to `/auth/login`
2. Enter EXACT same credentials:
   - Email: `test@example.com`
   - Password: `test123456`
3. Click "Sign In"

**You should be redirected to the dashboard immediately!**

---

## Database Status

All users in the database are auto-confirmed. Recent successful logins:
- `novagyan10@gmail.com` - Logged in successfully
- `aryansondharva25@gmail.com` - Logged in successfully
- `aryansondharva402@gmail.com` - Logged in successfully

The login system IS WORKING. If you're having issues, it's most likely:
1. Wrong password (try a password reset)
2. Email typo (check spelling carefully)

---

## Still Having Issues?

### Option 1: Use Magic Link (No Password Required)
1. Go to login page
2. Click "Magic Link" tab
3. Enter your email
4. Click the link sent to your email

### Option 2: Use Google Sign In
1. Go to login page
2. Click "Sign in with Google"
3. Choose your Google account

Both methods bypass password issues completely!
