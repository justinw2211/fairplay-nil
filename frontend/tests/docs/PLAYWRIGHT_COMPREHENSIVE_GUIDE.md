# Playwright Guide

## Key Principles

**Use working code as foundation - copy proven patterns, make minimal changes.**

**Don't over-engineer - simple solutions work best.**

**Understand the actual UI structure before writing  tests**

**See the error → Fix it automatically → Continue testing**

## Status: 2 Complete, 1 In Progress

### Working Tests

#### Simple Deal Logging ✅ Complete (9 steps)
- File: `active-tests/simple-deal-logging-flow.spec.js`
- Steps: 0-8 (Social Media → Deal Terms → Payor Info → Activities → Activity Form → Compliance → Compensation → Review → Dashboard)
- Command: `npx playwright test active-tests/simple-deal-logging-flow.spec.js --project=chromium-auth`
- Performance: ~29s
- Success: 100%

#### Clearinghouse Deal Flow ✅ Complete (10 steps)
- File: `active-tests/clearinghouse-deal-flow.spec.js`
- Steps: 0-9 (Social Media → Deal Terms → Payor Info → Activities → Activity Form → Compliance → Compensation → Review → Prediction → Dashboard)
- Command: `npx playwright test active-tests/clearinghouse-deal-flow.spec.js --project=chromium-auth`
- Performance: ~32s
- Success: 100%

#### Valuation Deal Flow 🔄 In Progress (6/10 steps)
- File: `active-tests/valuation-deal-flow.spec.js`
- Steps: 0-5 working, 6-9 pending
- Command: `npx playwright test active-tests/valuation-deal-flow.spec.js --project=chromium-auth`
- Issue: Compliance step finds 0 radio elements

## Architecture

### Frontend Structure
```
frontend/
├── src/                           # React app
├── tests/                         # Playwright tests
│   ├── active-tests/              # Main deal flows
│   ├── basic-tests/               # Utility tests
│   └── docs/                      # Documentation
├── playwright.config.js            # Config
├── global-setup.js                # Auth setup
├── package.json                   # Dependencies
└── playwright/.auth/              # Auth state
```

### Backend Integration
- Production: `https://fairplay-nil.vercel.app`
- Local: `http://localhost:3000`
- Auth: Supabase with `test1@test.edu`
- Database: PostgreSQL via Supabase

## Infrastructure

### Authentication
- Production: `https://fairplay-nil.vercel.app`
- Credentials: `test1@test.edu` / `testuser`
- Auth State: `frontend/playwright/.auth/user.json`
- Project: Use `chromium-auth` for protected routes

### Test Framework
- End-to-End Flows: Dashboard to dashboard
- Logging: Emoji indicators
- Screenshots: On failures
- Error Handling: Fallback mechanisms
- Backend Startup: Proper wait times

## Commands

### Run Tests
```bash
# All active deal flows
npx playwright test active-tests/ --project=chromium-auth

# Specific flows
npx playwright test active-tests/simple-deal-logging-flow.spec.js --project=chromium-auth
npx playwright test active-tests/clearinghouse-deal-flow.spec.js --project=chromium-auth
npx playwright test active-tests/valuation-deal-flow.spec.js --project=chromium-auth

# Basic tests
npx playwright test basic-tests/ --project=chromium-auth

# All tests
npx playwright test --project=chromium-auth

# With browser visible
npx playwright test --project=chromium-auth --headed

# Debug mode
npx playwright test --project=chromium-auth --debug
```

### View Results
```bash
# HTML report
npx playwright show-report

# Install browsers
npx playwright install

# Force reinstall
npx playwright install --force
```

## Patterns

### Authentication
```javascript
// Navigate to dashboard
await page.goto('https://fairplay-nil.vercel.app/dashboard');

// Check if login needed
const loginForm = page.locator('input[type="email"]');
if (await loginForm.count() > 0) {
  await loginForm.fill('test1@test.edu');
  await page.locator('input[type="password"]').fill('testuser');
  await page.locator('button[type="submit"]').click();
}
```

### Element Selection
```javascript
// Chakra UI Components
page.locator('text="Business"').first()           // Radio buttons
page.locator('input[placeholder*="Nike"], input[placeholder*="John"]')  // Dynamic placeholders
page.locator('button:has-text("Next")').last()   // Button selection
page.locator('text="No"')                        // Multiple options

// Icon-based selection
page.locator('button').filter({ has: page.locator('svg[data-lucide="plus"]') })

// Form validation
const isEnabled = await button.isEnabled();
if (isEnabled) await button.click();
```

### Wait Patterns
```javascript
// Backend startup
await page.waitForLoadState('networkidle');
await page.waitForTimeout(3000);

// Element waiting
await page.waitForSelector('text="Element"', { timeout: 15000 });
await element.waitFor({ state: 'visible', timeout: 5000 });
```

### Form Validation
```javascript
// Check button state
const isEnabled = await button.isEnabled();
if (isEnabled) await button.click();

// Fill additional fields
const inputs = page.locator('input');
for (let i = 0; i < await inputs.count(); i++) {
  const input = inputs.nth(i);
  const value = await input.inputValue();
  if (!value && await input.isVisible()) {
    await input.fill('100');
  }
}
```

### Error Handling
```javascript
// Logging
console.log('🎯 STEP X: Testing...');
console.log('✅ Successfully completed...');
console.log('❌ Error occurred...');

// Screenshot capture
await page.screenshot({ path: 'test-results/step-x-failure.png' });

// Fallback mechanisms
try {
  await element.click();
} catch (error) {
  console.log(`⚠️ Failed: ${error.message}`);
  // Alternative approach
}
```

## Test Patterns

### Deal Flow Structure
All deal flows follow this pattern:
1. Step 0: Deal card selection + Social media
2. Step 1: Deal terms
3. Step 2: Payor info
4. Step 3: Activities selection
5. Step 4: Activity form (platform-specific)
6. Step 5: Compliance questions
7. Step 6: Compensation
8. Step 7: Review and submit
9. Step 8+: Deal-specific completion (prediction/valuation)

### Working Step-by-Step Patterns

#### Step 0: Deal Card Selection & Social Media
```javascript
// Working implementation:
await page.waitForLoadState('networkidle');
await page.waitForTimeout(3000);
await page.waitForSelector('text="Deal Type Name"', { timeout: 15000 });
const dealCard = page.locator('text="Deal Type Name"');
await dealCard.click();

// Fill social media form
const socialMediaInputs = page.locator('input');
if (await socialMediaInputs.count() > 0) {
  await socialMediaInputs.first().fill('@testuser');
}
if (await socialMediaInputs.count() > 1) {
  await socialMediaInputs.nth(1).fill('1000');
}
await page.locator('button:has-text("Continue")').click();
```

#### Step 1: Deal Terms
```javascript
// Working implementation:
await page.locator('input[placeholder*="Nike"], input[placeholder*="John"]').fill('Test Deal');
const greenPopup = page.locator('text="Social media confirmed"');
if (await greenPopup.count() > 0) {
  await page.locator('button[aria-label="Close"]').click();
}
await page.locator('button:has-text("Next")').click();
```

#### Step 2: Payor Info
```javascript
// Working implementation:
await page.locator('text="Business"').first().click();
await page.locator('input[placeholder*="Nike"], input[placeholder*="John"]').fill('Test Company Inc.');
await page.locator('button:has-text("Next")').click();
```

#### Step 3: Activities
```javascript
// Working implementation:
await page.locator('text="Social Media"').first().click();
await page.locator('button:has-text("Next")').click();
```

#### Step 4: Social Media Activity Form
```javascript
// Working implementation:
await page.locator('text="Instagram"').first().click();
const activityButtons = page.locator('button');
if (await activityButtons.count() >= 3) {
  await activityButtons.nth(2).click();
}
await page.locator('button:has-text("Continue")').click();
```

#### Step 5: Compliance (Simple & Clearinghouse)
```javascript
// Working implementation for Simple & Clearinghouse flows:
const noOptions = page.locator('text="No"');
const noOptionsCount = await noOptions.count();
console.log(`🔢 "No" options found: ${noOptionsCount}`);

for (let i = 0; i < noOptionsCount; i++) {
  try {
    const option = noOptions.nth(i);
    await option.waitFor({ state: 'visible', timeout: 5000 });
    await option.click({ timeout: 5000 });
    console.log(`✅ Clicked "No" option ${i + 1}`);
    await page.waitForTimeout(200);
  } catch (error) {
    console.log(`⚠️ Failed to click "No" option ${i + 1}: ${error.message}`);
  }
}
await page.locator('button:has-text("Continue")').click();
```

#### Step 5: Compliance (Valuation) - Needs Debugging
```javascript
// Current issue: Valuation flow finds 0 radio elements
// Different UI structure from other flows
// Need to investigate why radio buttons aren't detected
```

#### Step 6: Compensation
```javascript
// Working implementation:
await page.locator('input[type="number"]').first().fill('1000');
await page.locator('select').first().selectOption({ index: 1 });

// Fill additional fields
const additionalInputs = page.locator('input');
for (let i = 0; i < await additionalInputs.count(); i++) {
  const input = additionalInputs.nth(i);
  const value = await input.inputValue();
  if (!value && await input.isVisible()) {
    await input.fill('100');
  }
}
await page.locator('button:has-text("Next")').click();
```

#### Step 7: Review & Submit
```javascript
// Working implementation:
const submitButton = page.locator('button:has-text("Submit Deal"), button:has-text("Submit")');
await submitButton.waitFor({ state: 'visible', timeout: 10000 });
await submitButton.click();
expect(page.url()).toMatch(/\/add\/deal\/submission-success\/\d+/);
```

#### Step 8: Return to Dashboard
```javascript
// Working implementation:
const dashboardButton = page.locator('button:has-text("Go to Dashboard"), button:has-text("Return to Dashboard")');
await dashboardButton.waitFor({ state: 'visible', timeout: 10000 });
await dashboardButton.click();
expect(page.url()).toMatch(/\/dashboard/);
```

## 🚨 **KNOWN ISSUES & SOLUTIONS**

### **Issue 1: Valuation Flow Compliance**
- **Problem**: Valuation flow finds 0 radio elements in compliance step
- **Cause**: Different UI structure from Simple/Clearinghouse flows
- **Status**: Needs investigation and debugging
- **Solution**: Apply working patterns from other flows once UI structure is understood

### **Issue 2: Backend Startup Timing**
- **Problem**: Tests fail because backend needs time to spin up
- **Solution**: Added proper wait times and selectors
- **Pattern**: `await page.waitForTimeout(3000)` after `waitForLoadState('networkidle')`

### **Issue 3: Dynamic Placeholders**
- **Problem**: Form placeholders change dynamically
- **Solution**: Use flexible selectors: `input[placeholder*="Nike"], input[placeholder*="John"]`

### **Issue 4: Green Popup Notifications**
- **Problem**: Social media confirmation popup blocks form interaction
- **Solution**: Check for and dismiss popup before proceeding
- **Pattern**: `page.locator('text="Social media confirmed"')` + close button

## 📊 **PERFORMANCE METRICS**

### **Current Test Performance**
- **Simple Deal Logging**: ~29 seconds
- **Clearinghouse Deal Flow**: ~32 seconds
- **Valuation Deal Flow**: ~30 seconds (when working)
- **Authentication Setup**: ~5 seconds

### **Success Rates**
- **Simple Deal Logging**: 100% (9/9 steps)
- **Clearinghouse Deal Flow**: 100% (10/10 steps)
- **Valuation Deal Flow**: 60% (6/10 steps)

## 🔄 **DEVELOPMENT WORKFLOW**

### **Adding New Tests**
1. **Create test file** in appropriate directory (`active-tests/` or `basic-tests/`)
2. **Use existing patterns** from working tests
3. **Add comprehensive logging** with emoji indicators
4. **Include error handling** and screenshot capture
5. **Update documentation** in this guide

### **Debugging Tests**
1. **Run with `--headed`** to see browser: `npx playwright test --headed`
2. **Use debug mode**: `npx playwright test --debug`
3. **Check screenshots** in `test-results/` directory
4. **Review HTML reports**: `npx playwright show-report`

### **Troubleshooting Common Issues**
```bash
# Authentication issues
rm -rf playwright/.auth/user.json
npx playwright test --project=chromium-auth --grep "auth"

# Browser issues
npx playwright install

# Network timeouts
# Increase timeout in playwright.config.js

# Element not found
# Check if UI has changed, update selectors
```

## 🚨 **TROUBLESHOOTING**

### **Authentication Issues**
```bash
# Clear auth state
rm -rf playwright/.auth/user.json

# Re-run auth test
npx playwright test basic-tests/auth-test.spec.js --project=chromium-auth
```

### **Element Not Found**
```javascript
// Check if element exists
const elementCount = await page.locator('selector').count();
console.log(`Found ${elementCount} elements`);

// Try alternative selectors
page.locator('text="Label"').first()
page.locator('button:has-text("Text")')
page.locator('input[placeholder*="text"]')
```

### **Test Timing Out**
```javascript
// Increase timeout
await page.waitForSelector('selector', { timeout: 30000 });

// Add more wait time
await page.waitForTimeout(5000);
```

### **Form Not Submitting**
```javascript
// Check button state
const isEnabled = await submitButton.isEnabled();
console.log(`Submit button enabled: ${isEnabled}`);

// Fill missing fields
const requiredFields = page.locator('input[required]');
for (let i = 0; i < await requiredFields.count(); i++) {
  const field = requiredFields.nth(i);
  const value = await field.inputValue();
  if (!value) {
    await field.fill('test value');
  }
}
```

## 📋 **TEST DATA REQUIREMENTS**

### **Authentication**
- **Email**: `test1@test.edu`
- **Password**: `testuser`
- **Account**: Must exist in production database

### **Form Data**
- **Social Media**: `@testuser` / `1000` followers
- **Deal Nickname**: `Test Deal` / `Test Clearinghouse Deal` / `Test Valuation Deal`
- **Payor Info**: `Test Company Inc.` (Business)
- **Activities**: Social Media selected
- **Compensation**: $1000 (amount + schedule + description)

## 🎯 **BEST PRACTICES**

### **Test Design**
- **Use descriptive test names** that explain the flow
- **Include comprehensive logging** for debugging
- **Handle edge cases** and error scenarios
- **Take screenshots** on failures for visual debugging
- **Use consistent patterns** across all tests

### **Element Selection**
- **Prefer text-based selectors** for Chakra UI components
- **Use flexible placeholders** for dynamic content
- **Include fallback mechanisms** for unreliable elements
- **Wait for elements** before interacting

### **Performance**
- **Minimize wait times** while ensuring reliability
- **Use efficient selectors** that don't require complex queries
- **Batch operations** where possible
- **Clean up resources** after tests

## 🚀 **NEXT DEVELOPMENT PRIORITIES**

1. **Complete Valuation Flow**: Debug compliance step and finish remaining steps
2. **Add Error Scenarios**: Test edge cases and error conditions
3. **Performance Optimization**: Reduce test execution time
4. **Visual Regression**: Add visual comparison tests
5. **Mobile Testing**: Expand to mobile device testing

## 📁 **FILE STRUCTURE**

```
frontend/tests/
├── README.md                           # Directory overview
├── active-tests/                       # Main deal flow tests
│   ├── simple-deal-logging-flow.spec.js      # ✅ Complete
│   ├── clearinghouse-deal-flow.spec.js       # ✅ Complete
│   └── valuation-deal-flow.spec.js           # 🔄 In Progress
├── basic-tests/                        # Utility tests
│   ├── auth-test.spec.js              # Authentication
│   ├── smoke.spec.js                  # Smoke tests
│   └── ...                            # Other utility tests
└── docs/                              # Documentation
    ├── PLAYWRIGHT_COMPREHENSIVE_GUIDE.md    # This consolidated guide
    └── outdated/                      # Archived docs
```

## 📚 **RESOURCES**

### **Key Files**
- `frontend/tests/docs/PLAYWRIGHT_COMPREHENSIVE_GUIDE.md` - This consolidated guide
- `frontend/PLAYWRIGHT_AUTH_SETUP.md` - Authentication setup
- `frontend/playwright.config.js` - Configuration
- `frontend/global-setup.js` - Authentication setup

### **External Resources**
- [Playwright Documentation](https://playwright.dev/)
- [Chakra UI Testing](https://chakra-ui.com/)
- [Supabase Authentication](https://supabase.com/docs/guides/auth)

**Last Updated**: August 2024  
**Status**: 2 complete flows, 1 in progress  
**Next Focus**: Complete Valuation Deal Analysis flow 