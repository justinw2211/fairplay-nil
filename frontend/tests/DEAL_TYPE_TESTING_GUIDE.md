# Deal Type Testing Guide

## Overview
This guide provides comprehensive information for testing the three deal types in the FairPlay NIL platform using Playwright.

## Authentication Requirements

### Test Account
- **Email**: `test1@test.edu`
- **Password**: `testuser`
- **Authentication State**: Saved in `playwright/.auth/user.json`

### Authentication Setup
```bash
# Run authentication setup
npm run test:e2e:setup-auth

# Use authenticated tests
npm run test:e2e:auth
```

## Correct Routing Flow for Student-Athlete Users

### 1. Initial Access
- **Start Point**: `/dashboard` (NOT `/deal-type-selection`)
- **Authentication**: Must be logged in
- **Location**: Deal type selection is on the Dashboard page

### 2. Deal Type Selection on Dashboard
The Dashboard contains a "Create New Deal" section with three cards:

| Deal Type | Card Title | Description | Button |
|-----------|------------|-------------|---------|
| Simple | "Simple Deal Logging" | Basic deal tracking without predictive analysis | "Get Started" |
| Clearinghouse | "NIL Go Clearinghouse Check" | Get prediction on deal approval/denial | "Get Started" |
| Valuation | "Deal Valuation Analysis" | Receive fair market value compensation ranges | "Get Started" |

### 3. Navigation After Deal Type Selection
All deal types follow this pattern:
```
Dashboard → Deal Type Selection → /add/deal/social-media/{dealId}?type={dealType}
```

### 4. Common Wizard Steps (All Deal Types)
1. **Step 0**: Social Media (`/add/deal/social-media/{dealId}`)
2. **Step 1**: Deal Terms (`/add/deal/terms/{dealId}`)
3. **Step 2**: Payor Info (`/add/deal/payor/{dealId}`)
4. **Step 3**: Activities (`/add/deal/activities/select/{dealId}`)
5. **Step 5**: Compliance (`/add/deal/compliance/{dealId}`)
6. **Step 6**: Compensation (`/add/deal/compensation/{dealId}`)
7. **Step 8**: Review (`/add/deal/review/{dealId}`)

### 5. Deal Type-Specific Endings

#### Simple Deal
- **End Point**: `/add/deal/submission-success/{dealId}`
- **Flow**: Standard wizard → Success page

#### Clearinghouse Deal
- **Special Step**: `/clearinghouse-wizard/{dealId}`
- **End Point**: `/clearinghouse-result/{dealId}`
- **Flow**: Standard wizard → Clearinghouse analysis → Results

#### Valuation Deal
- **Special Step**: `/valuation-wizard/{dealId}`
- **End Point**: `/valuation-result/{dealId}`
- **Flow**: Standard wizard → Valuation analysis → Results

## Playwright Test Implementation

### Key Selectors
```javascript
// Dashboard navigation
await page.goto('/dashboard');

// Deal type cards
const getStartedButtons = page.locator('button:has-text("Get Started")');

// Deal type titles
const simpleCard = page.locator('text="Simple Deal Logging"');
const clearinghouseCard = page.locator('text="NIL Go Clearinghouse Check"');
const valuationCard = page.locator('text="Deal Valuation Analysis"');
```

### Test Structure
```javascript
test('should complete simple deal workflow', async ({ page }) => {
  // 1. Navigate to dashboard
  await page.goto('/dashboard');
  
  // 2. Click "Get Started" for Simple Deal
  const getStartedButton = page.locator('button:has-text("Get Started")').first();
  await getStartedButton.click();
  
  // 3. Complete wizard steps
  await fillSocialMediaStep(page, 'simple');
  await fillDealTermsStep(page, 'simple');
  // ... continue through all steps
  
  // 4. Verify completion
  expect(page.url()).toMatch(/submission-success/);
});
```

## Common Issues and Solutions

### Issue: "Get Started" buttons not found
**Solution**: Ensure you're on the dashboard (`/dashboard`) and wait for page load:
```javascript
await page.goto('/dashboard');
await page.waitForLoadState('networkidle');
await page.waitForTimeout(2000); // Wait for any loading states
```

### Issue: Authentication fails
**Solution**: Check test account credentials and run auth setup:
```bash
npm run test:e2e:setup-auth
```

### Issue: Backend not available
**Solution**: Start the backend server before running tests:
```bash
# In backend directory
python -m uvicorn app.main:app --reload
```

### Issue: Deal creation fails
**Solution**: Check backend API status and database connectivity.

## Test Data Requirements

### Simple Deal Test Data
```javascript
{
  dealNickname: 'Test Simple Deal',
  payorType: 'business',
  payorName: 'Test Company Inc.',
  payorEmail: 'test@company.com',
  payorPhone: '(555) 123-4567',
  compensationCash: '1000',
  activities: ['social_media_post']
}
```

### Clearinghouse Deal Test Data
```javascript
{
  dealNickname: 'Test Clearinghouse Deal',
  payorType: 'business',
  payorName: 'Nike Inc.',
  payorEmail: 'contact@nike.com',
  payorPhone: '(555) 123-4567',
  compensationCash: '2500', // Over $600 threshold
  activities: ['product_endorsement', 'social_media_post'],
  usesSchoolIp: false,
  grantExclusivity: 'no'
}
```

### Valuation Deal Test Data
```javascript
{
  dealNickname: 'Test Valuation Deal',
  payorType: 'business',
  payorName: 'Adidas Corp.',
  payorEmail: 'partnerships@adidas.com',
  payorPhone: '(555) 123-4567',
  compensationCash: '5000',
  activities: ['brand_ambassadorship', 'social_media_campaign'],
  socialMedia: {
    instagram: '25000',
    tiktok: '15000',
    twitter: '5000'
  }
}
```

## Running Tests

### Individual Deal Type Tests
```bash
# Test simple deal workflow
npm run test:e2e:auth -- --grep "Simple Deal Type Workflow"

# Test clearinghouse deal workflow
npm run test:e2e:auth -- --grep "Clearinghouse Deal Type Workflow"

# Test valuation deal workflow
npm run test:e2e:auth -- --grep "Valuation Deal Type Workflow"
```

### All Deal Type Comparison Tests
```bash
# Run all deal type comparison tests
npm run test:e2e:auth -- --grep "Deal Type Comparison Tests"
```

### Debug Mode
```bash
# Run tests in debug mode
npm run test:e2e:auth:debug -- --grep "should access deal type selection page"
```

## Screenshots and Debugging

### Screenshot Locations
- Test results: `test-results/deal-type-comparison/`
- Screenshots: `test-results/deal-type-comparison/{dealType}-{stepName}.png`

### Viewing Test Reports
```bash
# Open HTML report
npm run test:e2e:report
```

## Important Notes

1. **Always start from `/dashboard`** - Deal type selection is not a separate route
2. **Click "Get Started" buttons** - Don't click the cards directly
3. **Use authenticated tests** - Use `chromium-auth` project for protected routes
4. **Check backend availability** - Ensure backend API is running
5. **Handle loading states** - Add appropriate waits for dynamic content
6. **Verify completion** - Check final URLs match expected patterns

## Troubleshooting

### Common Error Messages
- **"Backend Not Available"**: Start backend server
- **"Authentication failed"**: Run auth setup or check credentials
- **"Get Started buttons not found"**: Ensure on dashboard and wait for load
- **"Deal creation failed"**: Check backend API and database

### Debug Steps
1. Check if frontend is running (`http://localhost:3000`)
2. Check if backend is running (`http://localhost:8000`)
3. Verify test account exists in database
4. Run authentication setup
5. Check test screenshots for visual debugging 