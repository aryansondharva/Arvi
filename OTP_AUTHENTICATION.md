# OTP Authentication Guide

## What is OTP Authentication?

OTP (One-Time Password) authentication, also known as "Magic Link" authentication, is a passwordless login method where users receive a secure link via email to sign in without needing to remember a password.

## How It Works

1. User enters their email address on the login page
2. Supabase sends a magic link to their email
3. User clicks the link in their email
4. They're automatically signed in and redirected to the dashboard

## Benefits

- **No Password Required**: Users don't need to create or remember passwords
- **More Secure**: No password means no password to steal or guess
- **Better UX**: Simpler, faster authentication flow
- **Automatic Account Creation**: If the email doesn't exist, a new account is created

## Using OTP Authentication

### For Users

1. Go to `/auth/login`
2. Click on the "Magic Link" tab
3. Enter your email address
4. Click "Send Magic Link"
5. Check your email inbox
6. Click the link in the email
7. You'll be automatically signed in!

### Email Configuration

**Important**: For OTP authentication to work in production, you need to configure email settings in Supabase:

1. Go to your Supabase Dashboard
2. Navigate to **Authentication** → **Email Templates**
3. Customize the "Magic Link" template with your branding
4. Configure SMTP settings in **Project Settings** → **Auth** → **SMTP Settings**

### Rate Limiting

Supabase implements rate limiting on OTP requests to prevent abuse:
- Maximum 1 OTP request per minute per email
- Maximum 5 OTP requests per hour per IP address

## Technical Implementation

The OTP authentication uses Supabase's `signInWithOtp` method:

```typescript
await supabase.auth.signInWithOtp({
  email: 'user@example.com',
  options: {
    emailRedirectTo: `${window.location.origin}/auth/callback`,
  },
})
```

## Troubleshooting

### Not Receiving Emails?

1. **Check Spam Folder**: Magic link emails might be filtered as spam
2. **Verify Email Service**: Make sure your Supabase project has email configured
3. **Check Rate Limits**: You might have exceeded the rate limit
4. **Confirm Email Validity**: Ensure the email address is correct

### Link Expired?

Magic links expire after 1 hour by default. Request a new one if yours has expired.

### Still Having Issues?

1. Check the browser console for error messages
2. Verify your Supabase project is active
3. Ensure the `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` environment variables are set correctly

## Security Notes

- Magic links are single-use and expire after 1 hour
- Links can only be used from the same browser that requested them (by default)
- All links are sent over HTTPS
- Email delivery is handled securely by Supabase
