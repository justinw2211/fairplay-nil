# Sentry Sticky PR Comments Setup

This guide helps you set up automatic PR comments that show Sentry errors for preview deployments.

## 🎯 How It Works

1. **Sentry Configuration**: Your app sends errors with the commit SHA as the `release` parameter
2. **Sentry Webhook**: Sentry sends alerts to your webhook endpoint when new errors occur
3. **GitHub Integration**: The webhook finds the PR for that commit and creates/updates a sticky comment
4. **Real-time Updates**: Each PR gets one comment that's always updated with the latest error status

## 📋 Prerequisites

- ✅ Sentry account with your project configured
- ✅ GitHub repository with PR workflow
- ✅ Vercel deployment with environment variables

## 🔧 Setup Steps

### 1. Environment Variables

Add these to your Vercel project settings:

```bash
# GitHub Integration (for PR comments)
GITHUB_TOKEN=your_github_personal_access_token

# Sentry Configuration (already set)
VITE_SENTRY_DSN=https://8a759dc24e0d183c942867eb9d1eadc6@o4509759316426752.ingest.us.sentry.io/4509759319572480
```

### 2. GitHub Token Setup

1. Go to GitHub Settings → Developer settings → Personal access tokens
2. Create a new token with these scopes:
   - `repo` (full repository access)
   - `read:org` (read organization membership)
3. Copy the token and add it to Vercel as `GITHUB_TOKEN`

### 3. Sentry Webhook Configuration

1. Go to your Sentry project settings
2. Navigate to **Alerts** → **Webhooks**
3. Add a new webhook with:
   - **URL**: `https://your-vercel-app.vercel.app/api/sentry-webhook`
   - **Events**: Select "Issue Created" and "Issue Regression"
   - **Version**: v2

### 4. Deploy the Webhook

The webhook is automatically deployed with your Vercel app. After deployment:

1. Test the webhook endpoint: `https://your-vercel-app.vercel.app/api/sentry-webhook`
2. Check Vercel function logs for any errors

## 🧪 Testing

### Manual Test

1. Create a test error in your app
2. Check if a PR comment is created/updated
3. Verify the comment shows error details

### Webhook Test

```bash
curl -X POST https://your-vercel-app.vercel.app/api/sentry-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "event_type": "issue.created",
    "data": {
      "issue": {
        "id": "test-error-123",
        "title": "Test Error",
        "release": "abc123def456"
      }
    }
  }'
```

## 📊 Comment Format

The sticky comment will look like this:

```markdown
## 🚨 Sentry Error Monitor

*Last updated: 2025-01-14T20:30:00Z*

❌ **2 active error(s)** detected:

| Error | Count | Last Seen | Status |
|-------|-------|-----------|--------|
| [TypeError: Cannot read property](https://sentry.io/...) | 5 | 1/14/2025 | 🔴 Active |
| [Network Error: Failed to fetch](https://sentry.io/...) | 3 | 1/14/2025 | 🔴 Active |

📊 **View all errors:** [Sentry Dashboard](https://sentry.io/...)

---
*This comment is automatically updated by Sentry webhook.*
```

## 🔍 Troubleshooting

### Common Issues

1. **No PR found for commit**
   - Ensure the commit SHA matches between Sentry and GitHub
   - Check if the commit is actually part of a PR

2. **GitHub API errors**
   - Verify `GITHUB_TOKEN` has correct permissions
   - Check if the repository name/owner is correct in the webhook code

3. **Webhook not triggering**
   - Verify Sentry webhook URL is correct
   - Check Vercel function logs for errors
   - Ensure webhook events are configured correctly

### Debug Mode

Add this to your webhook for debugging:

```javascript
console.log('Webhook payload:', JSON.stringify(payload, null, 2));
console.log('Release info:', release);
console.log('Found PR:', pr);
```

## 🚀 Advanced Features

### Custom Error Filtering

Modify the webhook to filter errors by:
- Error severity level
- Specific error types
- User impact metrics

### Enhanced Comment Format

Add more information to comments:
- Error trends over time
- User impact metrics
- Related commits/changes

### Multiple Environments

Support different environments:
- Preview deployments (current)
- Staging deployments
- Production deployments

## 📝 Configuration Updates

### Repository Settings

Update these in `frontend/api/sentry-webhook.js`:

```javascript
const REPO_OWNER = 'your-github-username';  // Update this
const REPO_NAME = 'fairplay-nil';           // Update if different
```

### Sentry Project Settings

Update the Sentry organization ID in the webhook code:

```javascript
// Replace with your actual Sentry organization ID
const SENTRY_ORG_ID = '4509759316426752';
```

## 🔐 Security

- The webhook validates Sentry payloads
- GitHub token is stored securely in Vercel environment variables
- No sensitive data is logged in PR comments
- Webhook only processes relevant Sentry events

## 📈 Monitoring

- Check Vercel function logs for webhook activity
- Monitor Sentry for webhook delivery status
- Set up alerts for webhook failures

---

**Next Steps**: After setup, create a test PR and trigger an error to see the sticky comment in action!
