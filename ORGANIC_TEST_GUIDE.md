# Organic End-to-End Webhook Test Guide

## 🎯 Goal
Test the complete automatic Sentry → Webhook → GitHub PR comment flow using a **real error** in a **preview deployment**.

## 📋 Prerequisites
✅ PR #4 is open  
✅ Vercel will deploy this commit automatically  
✅ Sentry integration is configured  
✅ GitHub token is set in Vercel  

## 🧪 Test Steps

### Step 1: Wait for Vercel Deployment
After pushing this commit, Vercel will automatically deploy to the preview URL.

**Wait for deployment to complete** (check PR #4 or Vercel dashboard)

### Step 2: Visit the Test Page
Once deployed, go to:
```
https://fairplay-nil-<preview-id>.vercel.app/webhook-test
```

Or find the preview URL in PR #4's Vercel comment and add `/webhook-test` to the end.

### Step 3: Trigger the Test Error
1. Click the **"Trigger Test Error"** button
2. The page will throw a real JavaScript error
3. The error gets sent to Sentry with the commit SHA

### Step 4: Verify Sentry Received It
Go to your Sentry dashboard:
```
https://sentry.io/organizations/4509759316426752/issues/
```

You should see:
- **New error**: "WEBHOOK TEST: This is a test error to verify Sentry webhook integration"
- **Release tag**: Should show the commit SHA
- **Environment**: Should show "production" or "preview"

### Step 5: Wait for Webhook (10-30 seconds)
The Sentry webhook fires automatically. You'll see:
1. Sentry detects the error
2. Sends webhook to your Vercel endpoint
3. Webhook finds PR #4 by commit SHA
4. Creates/updates the sticky comment

### Step 6: Verify PR Comment
**Refresh PR #4** and look for the sticky comment:

```markdown
## 🚨 Sentry Error Monitor

*Last updated: [timestamp]*

❌ **1 active error(s)** detected:

| Error | Count | Last Seen | Status |
|-------|-------|-----------|--------|
| [WEBHOOK TEST: This is a test error...](sentry-link) | 1 | [date] | 🔴 Active |

📊 View all errors: [Sentry Dashboard](link)

---
*This comment is automatically updated by Sentry webhook.*
```

## ✅ Success Criteria

The test is successful if:
- [x] Error appears in Sentry dashboard
- [x] Error includes commit SHA as release
- [x] PR #4 gets a new/updated sticky comment
- [x] Comment shows the test error details
- [x] Comment includes link to Sentry
- [x] All happened **automatically** without manual intervention

## 🔍 Troubleshooting

### If error doesn't appear in Sentry:
- Check browser console for actual error
- Verify you're on preview deployment (not localhost)
- Check Sentry DSN is configured

### If webhook doesn't fire:
- Check Sentry webhook configuration
- Verify webhook URL is correct
- Check Sentry webhook logs

### If PR comment doesn't appear:
- Verify GITHUB_TOKEN is set in Vercel
- Check Vercel function logs
- Ensure commit SHA matches between Sentry and PR

## 📊 What This Proves

This organic test proves the **complete automatic flow**:

1. ✅ Real errors in preview deployments get sent to Sentry
2. ✅ Sentry includes commit SHA in error data
3. ✅ Sentry webhook fires automatically
4. ✅ Webhook receives and processes Sentry payload
5. ✅ Webhook extracts commit SHA from real Sentry format
6. ✅ Webhook finds the correct PR
7. ✅ Webhook creates/updates GitHub comment
8. ✅ **Everything happens automatically!**

## 🎉 After Success

Once this test succeeds, you can:
- Close/merge PR #4
- Remove the `/webhook-test` route (or keep it for future testing)
- **Know with certainty** that the system works automatically for all future PRs!

---

**Test Date**: October 14, 2025  
**Test PR**: #4  
**Commit**: a63bad5
