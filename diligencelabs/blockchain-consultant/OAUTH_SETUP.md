# 🔐 OAuth Setup Guide for Social Login

## Current Status
✅ **Google OAuth**: Configured and working  
❌ **Twitter OAuth**: Needs real credentials  
❌ **GitHub OAuth**: Not configured yet  

## Quick Setup Instructions

### 1. Google OAuth (✅ Already Working)
Your Google OAuth is already configured with these credentials:
- Client ID: `719840241507-cqojfqes9qtkjs2egl841sbjomvm5pg9.apps.googleusercontent.com`
- Status: ✅ **ACTIVE**

### 2. Twitter/X OAuth Setup

#### Step 1: Get Twitter Developer Account
1. Go to https://developer.twitter.com/
2. Apply for a developer account (if you don't have one)
3. Create a new app or use an existing one

#### Step 2: Configure OAuth 2.0 Settings
1. In your Twitter app dashboard, go to "Settings" → "OAuth 2.0"
2. Set **Callback URL**: `http://localhost:3000/api/auth/callback/twitter`
3. For production: `https://yourdomain.com/api/auth/callback/twitter`

#### Step 3: Get Your Credentials
1. Go to "Keys and tokens" tab
2. Copy your **Client ID** and **Client Secret**
3. Add to your `.env.local`:

```bash
TWITTER_CLIENT_ID="your_actual_twitter_client_id"
TWITTER_CLIENT_SECRET="your_actual_twitter_client_secret"
```

### 3. GitHub OAuth Setup (Optional)

#### Step 1: GitHub OAuth App
1. Go to GitHub → Settings → Developer settings → OAuth Apps
2. Click "New OAuth App"
3. Fill in:
   - **Application name**: "Blockchain Consultant Platform"
   - **Homepage URL**: `http://localhost:3000` (or your domain)
   - **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`

#### Step 2: Add GitHub Provider
1. Get your Client ID and Client Secret from GitHub
2. Add to `.env.local`:
```bash
GITHUB_CLIENT_ID="your_github_client_id"
GITHUB_CLIENT_SECRET="your_github_client_secret"
```

3. Add GitHub provider to `src/lib/auth.ts` after the Twitter provider:
```typescript
// Add GitHub provider
if (process.env.GITHUB_CLIENT_ID && 
    process.env.GITHUB_CLIENT_ID !== "your-github-client-id" &&
    process.env.GITHUB_CLIENT_SECRET && 
    process.env.GITHUB_CLIENT_SECRET !== "your-github-client-secret" &&
    !process.env.GITHUB_CLIENT_ID.includes("your-") &&
    process.env.GITHUB_CLIENT_ID.length > 10) {
  
  const GitHubProvider = require('next-auth/providers/github').default
  providers.push(GitHubProvider({
    clientId: process.env.GITHUB_CLIENT_ID!,
    clientSecret: process.env.GITHUB_CLIENT_SECRET!,
  }))
  console.log('✅ GitHub OAuth provider configured')
} else {
  console.log('⚠️ GitHub OAuth provider skipped - invalid credentials')
}
```

## Testing Your Setup

### 1. Check Available Providers
```bash
curl http://localhost:3000/api/auth/providers
```

### 2. Test Social Login
1. Go to `http://localhost:3000/auth/unified-signin`
2. You should see Google as an available option
3. Click "Continue with Google" to test

### 3. Debug Authentication Issues
Check the dev server logs for:
- ✅ "Google OAuth provider configured" 
- ✅ "Twitter OAuth provider configured"
- ❌ Any "provider skipped" messages

## Production Deployment

### Environment Variables for Production
```bash
# Production URLs
NEXTAUTH_URL="https://yourdomain.com"

# Google OAuth (same credentials work for prod if you add the production callback URL)
GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"

# Twitter OAuth (add production callback URL in Twitter developer console)
TWITTER_CLIENT_ID="your_twitter_client_id"
TWITTER_CLIENT_SECRET="your_twitter_client_secret"
```

### Callback URLs for Production
Make sure to add these to your OAuth app settings:
- **Google**: `https://yourdomain.com/api/auth/callback/google`
- **Twitter**: `https://yourdomain.com/api/auth/callback/twitter`
- **GitHub**: `https://yourdomain.com/api/auth/callback/github`

## Troubleshooting

### Common Issues
1. **"Social Login Temporarily Unavailable"** 
   - Check that OAuth credentials are real (not placeholder values)
   - Verify callback URLs match exactly

2. **OAuth Error During Login**
   - Check that the app is approved for public use
   - Verify redirect URIs are configured correctly

3. **Provider Not Showing Up**
   - Check server logs for configuration messages
   - Ensure environment variables are loaded correctly

### Get Help
- Check dev server logs for detailed error messages
- Test with `curl http://localhost:3000/api/auth/providers`
- Verify credentials in your OAuth provider's dashboard

## Security Notes
- Never commit real OAuth credentials to version control
- Use different credentials for development vs production
- Regularly rotate your OAuth secrets
- Monitor your OAuth app usage in provider dashboards