# Quick Sentry Webhook Setup Guide

## 📍 Step 1: Get Your Vercel Deployment URL

Your webhook URL will be:
```
https://YOUR-VERCEL-URL.vercel.app/api/sentry-webhook
```

Find your Vercel URL from your Vercel dashboard or deployment.

## 📍 Step 2: Configure Sentry Internal Integration

### Option A: Internal Integration (Recommended)

1. **Go to Sentry Organization Settings**
   - You're already here based on your screenshot!

2. **Navigate to Developer Settings**
   - Click **Developer Settings** in the left sidebar
   - Click **Internal Integrations**
   - Click **Create New Integration**

3. **Configure the Integration**
   ```
   Name: FairPlay PR Comment Bot
   Webhook URL: https://YOUR-VERCEL-URL.vercel.app/api/sentry-webhook
   
   Permissions:
   - Issue & Event: Read
   - Organization: Read
   
   Webhooks:
   ☑ issue
   ☑ error
   ☑ event.alert (if available)
   ```

4. **Save and Copy the Token**
   - After creating, you'll get a token
   - Save this for future use (optional for now)

### Option B: Alert Rules with Webhooks

If Internal Integrations don't work, use Alert Rules:

1. **Go to Your Sentry Project**
   - Navigate to your FairPlay NIL project (not organization)

2. **Create Alert Rule**
   - Click **Alerts** in the left sidebar
   - Click **Create Alert**
   - Choose "Issues" as the alert type

3. **Configure When to Send**
   ```
   When: A new issue is created
   If: All events
   Then: Send a notification via webhook
   Webhook URL: https://YOUR-VERCEL-URL.vercel.app/api/sentry-webhook
   ```

4. **Add Another Rule for Regressions**
   - Repeat above but choose "An issue changes state from resolved to unresolved"

## 📍 Step 3: Test the Webhook

### Option 1: Use Sentry's Test Feature

After creating the webhook/integration:
1. Click **Test** or **Send Test Payload**
2. Check your Vercel function logs to see if it received the webhook

### Option 2: Trigger a Real Error

1. **Deploy your app to Vercel**
2. **Create a test PR**
3. **Trigger an error in your app**:
   ```javascript
   // Add this temporarily to test
   throw new Error('Test Sentry webhook integration');
   ```
4. **Check the PR for a comment**

## 🔍 Can't Find Webhooks?

If you still can't find webhook settings in Sentry:

### Modern Sentry (Post-2023)

Sentry moved webhooks to **Integrations**:

1. **Settings** → **Integrations** → **Internal Integrations**
2. Create a new internal integration as described above

### Alternative: Use Sentry's Slack/Discord Integration Template

1. Go to **Settings** → **Integrations**
2. Look for **Webhooks** or **Custom** integrations
3. Some plans require upgrading to access webhooks

## 📊 Webhook Payload Structure

Your webhook will receive this format:

```json
{
  "action": "created",
  "data": {
    "issue": {
      "id": "123456",
      "title": "TypeError: Cannot read property",
      "metadata": {
        "value": "Error message"
      }
    }
  },
  "actor": {
    "type": "user",
    "id": "user-id",
    "name": "username"
  }
}
```

## ✅ Verification Checklist

- [ ] GITHUB_TOKEN added to Vercel environment variables
- [ ] Sentry webhook configured with correct URL
- [ ] Webhook events include "issue" events
- [ ] Test webhook sent successfully
- [ ] Vercel function logs show webhook received
- [ ] Test PR comment created

## 🆘 Still Can't Find It?

If you're having trouble finding the webhook settings:

1. **Check your Sentry plan**: Some features require paid plans
2. **Try the Sentry API**: We can set up webhooks via API instead
3. **Use Alert Rules**: Alternative approach that works on all plans

Let me know which option you see in your Sentry dashboard and I'll help you configure it!
