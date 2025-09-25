# Google OAuth Configuration Fix

## Problem
Getting "Error 400: redirect_uri_mismatch" when trying to sign in with Google.

## Root Cause
The Google Cloud Console OAuth application is not configured with the correct redirect URI for the local development environment.

## Solution

### Step 1: Access Google Cloud Console
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (or create one if needed)
3. Navigate to "APIs & Services" → "Credentials"

### Step 2: Configure OAuth Client
1. Find your OAuth 2.0 Client ID (the one matching `719840241507-cqojfqes9qtkjs2egl841sbjomvm5pg9.apps.googleusercontent.com`)
2. Click on it to edit
3. In the "Authorized redirect URIs" section, add:

```
http://localhost:3000/api/auth/callback/google
```

### Step 3: Alternative Redirect URIs (if needed)
If you plan to test on different ports or domains, also add:
```
http://localhost:3001/api/auth/callback/google
http://127.0.0.1:3000/api/auth/callback/google
```

### Step 4: Save Changes
1. Click "Save" in the Google Console
2. Wait a few minutes for changes to propagate

### Step 5: Test the Fix
1. Go to http://localhost:3000/auth/signin
2. Click "Continue with Google"
3. Should now redirect properly without the 400 error

## Current Configuration ✅
- ✅ NEXTAUTH_URL: "http://localhost:3000" 
- ✅ NEXTAUTH_SECRET: Added to .env.local
- ✅ GOOGLE_CLIENT_ID: Configured
- ✅ GOOGLE_CLIENT_SECRET: Configured
- ✅ Development server: Running on port 3000

## Expected Redirect URI Format
NextAuth.js automatically creates the callback URL in this format:
```
{NEXTAUTH_URL}/api/auth/callback/{provider}
```

For Google OAuth with localhost:3000:
```
http://localhost:3000/api/auth/callback/google
```

## Verification
After making the Google Console changes, you should be able to:
1. Click "Continue with Google" on the signin page
2. Complete Google authentication 
3. Be redirected back to the dashboard

## Troubleshooting
If still getting errors:
1. Check that the Client ID in .env.local matches the one in Google Console
2. Verify the redirect URI is exactly: `http://localhost:3000/api/auth/callback/google`
3. Clear browser cache and cookies
4. Try in incognito/private mode

## Production Setup
For production deployment, you'll need to add:
```
https://your-domain.com/api/auth/callback/google
```

---
**Note**: This is a configuration issue in Google Cloud Console, not in the application code. The application is correctly configured.