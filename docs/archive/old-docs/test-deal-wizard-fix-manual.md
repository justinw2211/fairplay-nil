# Manual Test Guide for Deal Wizard Fix

> **⚠️ OUTDATED DOCUMENTATION**  
> This document is archived and reflects an older implementation. The current deal wizard flow and state management is implemented differently. See `docs/features/deal-wizard/bug-fixes.md` for current implementation details.

## 🧪 Testing the Loading Screen Fix

This guide will help you manually test the fix for the loading screen issue that was occurring after completing the "select activities" page.

## Prerequisites

1. **Backend Server Running**: `uvicorn app.main:app --reload --host 0.0.0.0 --port 8000`
2. **Frontend Server Running**: `npm run dev` (in frontend directory)
3. **Browser Developer Tools**: Open to monitor console logs and network requests

## Test Steps

### 1. Initial Setup
- Open browser to `http://localhost:5173`
- Open Developer Tools (F12)
- Go to Console tab
- Clear console logs

### 2. Login Test
- Login with test credentials
- Verify you reach the dashboard
- Check console for any errors

### 3. Start New Deal
- Click "Start New Deal" or similar button
- Select "Simple" deal type
- Click Continue
- Should navigate to Social Media step

### 4. Complete Social Media Step
- Fill in social media handles
- Click Next
- Should navigate to Terms step
- Check console for any errors

### 5. Complete Terms Step
- Fill in deal title and description
- Click Next
- Should navigate to Payor step
- Check console for any errors

### 6. Complete Payor Step
- Fill in payor information
- Click Next
- Should navigate to Activities step
- Check console for any errors

### 7. **CRITICAL TEST: Activities Step**
- Select 2-3 activities (e.g., Social Media, Appearance)
- **Before clicking Next**: Open Network tab in DevTools
- Click Next
- **Monitor for the following**:

#### ✅ Expected Behavior (Fix Working):
- Brief loading spinner (1-2 seconds max)
- Navigation to first activity form
- Console logs showing:
  ```
  [DealContext] Updating currentDeal: { shouldUpdate: true, ... }
  [ActivityRouter] currentDeal: { obligations: {...} }
  [ActivityRouter] activitySequence: ['social-media', 'appearance']
  ```

#### ❌ Old Behavior (Fix Not Working):
- Loading spinner that never disappears
- Console logs showing:
  ```
  [ActivityRouter] currentDeal: undefined
  [ActivityRouter] activitySequence: []
  [ActivityRouter] Showing loading spinner
  ```

### 8. Activity Form Test
- If you reach the activity form, fill it out
- Click Next
- Should navigate to next activity or compliance step

## Console Monitoring

### Key Logs to Watch For:

#### ✅ Good Logs (Fix Working):
```
[DealContext] API response status: 200
[DealContext] State updated successfully
[ActivityRouter] Component initialized
[ActivityRouter] currentDeal: { id: 123, obligations: {...} }
[ActivityRouter] activitySequence: ['social-media', 'appearance']
```

#### ❌ Bad Logs (Fix Not Working):
```
[ActivityRouter] currentDeal: undefined
[ActivityRouter] activitySequence: []
[ActivityRouter] Showing loading spinner
```

## Network Monitoring

### API Calls to Monitor:
1. `PUT /api/deals/{dealId}` - Should return 200
2. `GET /api/deals/{dealId}` - Should return updated deal with obligations

## Sentry Monitoring

Check Sentry dashboard for:
- ✅ "Activity sequence initialized successfully"
- ✅ "DealContext: State updated successfully"
- ❌ "ActivityRouter: Showing loading spinner" (should be rare)

## Test Multiple Deal Types

Repeat the test with:
- **Simple Deal**: Basic NIL deal
- **Clearinghouse Deal**: NCAA compliance deal
- **Valuation Deal**: Deal with valuation

## Expected Results

### ✅ Success Criteria:
1. No infinite loading screens
2. Smooth navigation from activities to first activity form
3. Console logs show proper state synchronization
4. Sentry logs show successful state updates

### ❌ Failure Indicators:
1. Loading spinner that never disappears
2. Console logs showing `currentDeal: undefined`
3. Network errors or 500 responses
4. Sentry errors related to state synchronization

## Troubleshooting

### If Still Getting Loading Screen:

1. **Check Console Logs**:
   - Look for `[DealContext] Updating currentDeal` logs
   - Verify `shouldUpdate: true` in the logs

2. **Check Network Tab**:
   - Verify `PUT /api/deals/{dealId}` returns 200
   - Check response contains updated obligations

3. **Check Sentry**:
   - Look for "Activity sequence initialized successfully"
   - Check for any error messages

4. **Manual Debug**:
   - Add `console.log('DEBUG:', currentDeal)` in ActivityRouter
   - Check if deal state is being updated properly

## Reporting Results

After testing, report:
- ✅ **PASS**: No loading screen, smooth navigation
- ❌ **FAIL**: Still getting stuck on loading screen
- 📊 **PARTIAL**: Some deal types work, others don't

Include console logs and any error messages in your report. 