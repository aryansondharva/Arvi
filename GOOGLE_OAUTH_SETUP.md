# Google OAuth Setup Guide

This guide will help you configure Google OAuth authentication for the EcoVolunteer PRO platform.

## Prerequisites

- A Supabase project (already connected)
- A Google Cloud Console account

## Step 1: Configure Google Cloud Console

### 1.1 Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Name your project (e.g., "EcoVolunteer PRO")
4. Click "Create"

### 1.2 Enable Google+ API

1. In your project, go to "APIs & Services" → "Library"
2. Search for "Google+ API"
3. Click on it and press "Enable"

### 1.3 Configure OAuth Consent Screen

1. Go to "APIs & Services" → "OAuth consent screen"
2. Select "External" and click "Create"
3. Fill in the required fields:
   - **App name**: EcoVolunteer PRO
   - **User support email**: Your email
   - **Developer contact information**: Your email
4. Click "Save and Continue"
5. On the "Scopes" page, click "Save and Continue"
6. On the "Test users" page, you can add test emails or skip
7. Click "Save and Continue"

### 1.4 Create OAuth Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. Select "Web application"
4. Name it "EcoVolunteer PRO Web Client"
5. Add Authorized JavaScript origins:
   - `http://localhost:3000` (for local development)
   - Your production URL (e.g., `https://yourapp.vercel.app`)
6. Add Authorized redirect URIs:
   - `https://<your-supabase-project-ref>.supabase.co/auth/v1/callback`
   - Get this URL from the next step
7. Click "Create"
8. **Save the Client ID and Client Secret** - you'll need these!

## Step 2: Configure Supabase

### 2.1 Get Your Supabase Callback URL

Your callback URL format is:
```
https://<your-project-ref>.supabase.co/auth/v1/callback
```

From your Supabase URL `https://aorfzopuixgpxsxibyjv.supabase.co`, your callback URL is:
```
https://aorfzopuixgpxsxibyjv.supabase.co/auth/v1/callback
```

### 2.2 Enable Google Auth in Supabase

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to "Authentication" → "Providers"
4. Find "Google" in the list
5. Toggle "Enable Sign in with Google"
6. Enter your Google OAuth credentials:
   - **Client ID**: From Google Cloud Console
   - **Client Secret**: From Google Cloud Console
7. Click "Save"

## Step 3: Update Google Cloud Console with Supabase URL

1. Go back to Google Cloud Console
2. Navigate to "APIs & Services" → "Credentials"
3. Click on your OAuth 2.0 Client ID
4. Under "Authorized redirect URIs", add:
   ```
   https://aorfzopuixgpxsxibyjv.supabase.co/auth/v1/callback
   ```
5. Click "Save"

## Step 4: Test the Integration

1. Go to your app's login page: `/auth/login`
2. Click "Sign in with Google"
3. You should be redirected to Google's login page
4. After authentication, you'll be redirected back to your dashboard

## Troubleshooting

### Error: "redirect_uri_mismatch"
- Make sure the redirect URI in Google Cloud Console exactly matches your Supabase callback URL
- Check for trailing slashes or typos

### Error: "Access blocked: This app's request is invalid"
- Ensure you've configured the OAuth consent screen
- Make sure the Google+ API is enabled

### Error: "The OAuth client was not found"
- Verify your Client ID and Client Secret in Supabase settings
- Make sure you're using the correct credentials

### Users can't sign in
- Check that Google provider is enabled in Supabase
- Verify your app's URL is in the Authorized JavaScript origins
- Make sure the callback URL is correct

## Security Best Practices

1. Never commit your Client Secret to version control
2. Use different OAuth clients for development and production
3. Regularly rotate your Client Secret
4. Monitor OAuth usage in Google Cloud Console
5. Keep the OAuth consent screen information up to date

## Additional Resources

- [Supabase Auth with Google](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google Cloud Console](https://console.cloud.google.com/)
