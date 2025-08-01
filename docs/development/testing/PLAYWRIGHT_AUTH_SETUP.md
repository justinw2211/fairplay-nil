# Playwright Authentication Setup

## Test User Account

- Email: `test1@test.edu`
- Password: `testuser`

## Commands

### Run All Authenticated Tests
```bash
npx playwright test --project=chromium-auth
```

### Run with Browser Visible
```bash
npx playwright test --project=chromium-auth --headed
```

### Run with Debug Mode
```bash
npx playwright test --project=chromium-auth --debug
```

### Setup Authentication (First Time)
```bash
npx playwright test --project=chromium-auth --grep "auth"
```

## File Structure

```
frontend/
├── global-setup.js                    # Auth setup
├── playwright.config.js               # Config with auth projects
├── playwright/.auth/                  # Auth state
│   └── user.json                     # Saved auth
├── tests/
│   ├── simple-deal-logging-flow.spec.js    # Complete Simple Deal Logging
│   ├── clearinghouse-deal-flow.spec.js     # Complete Clearinghouse Deal
│   ├── valuation-deal-flow.spec.js         # In-progress Valuation Deal
│   └── PLAYWRIGHT_COMPREHENSIVE_GUIDE.md  # Consolidated guide
```

## How It Works

### Global Setup
- `global-setup.js` logs in once using test credentials
- Saves auth state to `playwright/.auth/user.json`
- All authenticated tests use this saved state

### Test Projects
- Unauthenticated: `chromium`, `firefox`, `webkit` (original)
- Authenticated: `chromium-auth`, `firefox-auth` (new)

### Protected Route Access
Authenticated tests can access:
- `/dashboard`
- `/add/deal/social-media/:dealId`
- `/add/deal/terms/:dealId`
- `/clearinghouse-wizard/:dealId`
- `/valuation-wizard/:dealId`

## Test Categories

### Simple Deal Logging Tests (`simple-deal-logging-flow.spec.js`)
- Complete end-to-end Simple Deal Logging flow
- 9 steps from dashboard to dashboard
- Form interactions and validation
- Deal submission and success verification

### Clearinghouse Deal Tests (`clearinghouse-deal-flow.spec.js`)
- Complete end-to-end NIL Go Clearinghouse Check flow
- 10 steps including prediction and return to dashboard
- Clearinghouse prediction functionality
- Results verification

### Valuation Deal Tests (`valuation-deal-flow.spec.js`)
- In-progress Deal Valuation Analysis flow
- Currently stuck on compliance step
- 6/10 steps working
- Needs debugging for compliance UI differences

## Usage Examples

### Test Simple Deal Logging Flow
```javascript
// Complete Simple Deal Logging flow
test('Complete Simple Deal Logging Flow - End-to-End', async ({ page }) => {
  await page.goto('https://fairplay-nil.vercel.app/dashboard');
  // Navigate through all 9 steps from dashboard to dashboard
});
```

### Test Clearinghouse Deal Flow
```javascript
// Complete Clearinghouse Deal flow
test('Complete NIL Go Clearinghouse Check Flow - End-to-End', async ({ page }) => {
  await page.goto('https://fairplay-nil.vercel.app/dashboard');
  // Navigate through all 10 steps including prediction
});
```

## Updating Authentication

If test user credentials change:

1. Update `global-setup.js` with new credentials
2. Delete `playwright/.auth/user.json` (if it exists)
3. Run setup again: `npm run test:e2e:setup-auth`

## Troubleshooting

### Authentication Fails
```bash
# Check if login page is accessible
curl http://localhost:3000/login

# Verify test user exists
# Check Supabase for test1@test.edu account
```

### Tests Still Fail
```bash
# Run with debug to see what's happening
npm run test:e2e:auth:debug

# Check screenshots in test-results/
# Look for auth-test-*.png files
```

### Protected Routes Not Accessible
- Verify the test user has proper permissions
- Check if routes require additional setup
- Ensure authentication state is saved correctly

## Benefits

1. Real User Testing: Tests actual authentication flow
2. Protected Route Access: Can test full wizard functionality
3. Form Interactions: Can fill out forms and test validation
4. Step Navigation: Can test multi-step workflows
5. Data Persistence: Can test data saving between steps

## Ready to Use

Your Playwright setup now supports:
- ✅ Authenticated testing with `chromium-auth` project
- ✅ Protected route access to all deal wizard steps
- ✅ Complete end-to-end deal flow testing
- ✅ Real user experience simulation
- ✅ Comprehensive test coverage with 2 complete flows

**Run `npx playwright test --project=chromium-auth` to start testing with authentication!** 