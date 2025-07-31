# Three Deal Form Routing Architecture

## Overview

The FairPlay NIL platform supports three distinct deal types, each providing different user experiences and analysis capabilities for student-athletes. This document explains how the routing architecture works to support these three workflows.

## Deal Types

### 1. Simple Deal Logging (`type=simple`)
- **Purpose**: Basic deal tracking without predictive analysis
- **User Experience**: Standard wizard flow with basic form completion
- **End Result**: Deal submission success page
- **Use Case**: Straightforward deals where you just need status management

### 2. NIL Go Clearinghouse Check (`type=clearinghouse`)
- **Purpose**: Predicts whether deals will be approved/denied/flagged by NIL Go Clearinghouse
- **User Experience**: Standard wizard flow + clearinghouse prediction analysis
- **End Result**: Clearinghouse prediction result page with actionable insights
- **Use Case**: Deals requiring clearinghouse approval understanding

### 3. Deal Valuation Analysis (`type=valuation`)
- **Purpose**: Provides fair market value compensation ranges
- **User Experience**: Standard wizard flow + valuation analysis
- **End Result**: Valuation result page with compensation insights
- **Use Case**: Deals requiring market value understanding

## Routing Architecture

### Deal Type Selection
- **Location**: Dashboard page (`/dashboard`)
- **Component**: `Dashboard.jsx` handles deal type selection
- **NOT**: A separate `/deal-type-selection` route (this exists but is unused)

### Entry Point
All three deal types start with the same route pattern:
```
/add/deal/social-media/{dealId}?type={dealType}
```

### Query Parameter Pattern
The deal type is passed via query parameter:
- Simple: `?type=simple`
- Clearinghouse: `?type=clearinghouse`
- Valuation: `?type=valuation`

## Route Definitions

### Standard Wizard Routes (Used by all three deal types)
```javascript
// All deal types use these common wizard steps
<Route path="/add/deal/social-media/:dealId" element={<DealWizardRoute><Step0_SocialMedia /></DealWizardRoute>} />
<Route path="/add/deal/terms/:dealId" element={<DealWizardRoute><Step1_DealTerms /></DealWizardRoute>} />
<Route path="/add/deal/payor/:dealId" element={<DealWizardRoute><Step2_PayorInfo /></DealWizardRoute>} />
<Route path="/add/deal/activities/select/:dealId" element={<DealWizardRoute><Step3_SelectActivities /></DealWizardRoute>} />
<Route path="/add/deal/activity/:activityType/:dealId" element={<DealWizardRoute><ActivityRouter /></DealWizardRoute>} />
<Route path="/add/deal/compliance/:dealId" element={<DealWizardRoute><Step5_Compliance /></DealWizardRoute>} />
<Route path="/add/deal/compensation/:dealId" element={<DealWizardRoute><Step6_Compensation /></DealWizardRoute>} />
<Route path="/add/deal/review/:dealId" element={<DealWizardRoute><Step8_Review /></DealWizardRoute>} />
<Route path="/add/deal/submission-success/:dealId" element={<DealWizardRoute><SubmissionSuccess /></DealWizardRoute>} />
```

### Deal Type-Specific End Routes
```javascript
// Clearinghouse workflow (type=clearinghouse only)
<Route path="/clearinghouse-wizard/:dealId" element={<DealWizardRoute><ClearinghouseWizard /></DealWizardRoute>} />
<Route path="/clearinghouse-result/:dealId" element={<DealWizardRoute><ClearinghouseResult /></DealWizardRoute>} />

// Valuation workflow (type=valuation only)
<Route path="/valuation-wizard/:dealId" element={<DealWizardRoute><ValuationWizard /></DealWizardRoute>} />
<Route path="/valuation-result/:dealId" element={<DealWizardRoute><ValuationResult /></DealWizardRoute>} />
```

## User Flow

### 1. Deal Type Selection (Dashboard)
```javascript
// Dashboard.jsx - handleDealTypeSelect function
const handleDealTypeSelect = async (dealType) => {
  const newDeal = await createDraftDeal(dealType);
  
  switch (dealType) {
    case 'simple':
      navigate(`/add/deal/social-media/${newDeal.id}?type=simple`);
      break;
    case 'clearinghouse':
      navigate(`/add/deal/social-media/${newDeal.id}?type=clearinghouse`);
      break;
    case 'valuation':
      navigate(`/add/deal/social-media/${newDeal.id}?type=valuation`);
      break;
  }
};
```

### 2. Common Wizard Flow
All deal types follow the same wizard steps:
1. **Step 0**: Social Media (`/add/deal/social-media/:dealId`)
2. **Step 1**: Deal Terms (`/add/deal/terms/:dealId`)
3. **Step 2**: Payor Info (`/add/deal/payor/:dealId`)
4. **Step 3**: Activities (`/add/deal/activities/select/:dealId`)
5. **Step 5**: Compliance (`/add/deal/compliance/:dealId`)
6. **Step 6**: Compensation (`/add/deal/compensation/:dealId`)
7. **Step 8**: Review (`/add/deal/review/:dealId`)

### 3. Deal Type-Specific Endings
- **Simple**: Ends at `/add/deal/submission-success/:dealId`
- **Clearinghouse**: Goes to `/clearinghouse-wizard/:dealId` → `/clearinghouse-result/:dealId`
- **Valuation**: Goes to `/valuation-wizard/:dealId` → `/valuation-result/:dealId`

## Wizard Step Customization

Each wizard step can check the deal type via query parameter to customize behavior:

```javascript
// Example: Step0_SocialMedia.jsx
const [searchParams] = useSearchParams();
const dealType = searchParams.get('type');

// Customize behavior based on deal type
if (dealType === 'valuation') {
  // Social media data is critical for valuation
  // Show enhanced validation
} else if (dealType === 'clearinghouse') {
  // Social media data helps with clearinghouse prediction
  // Show clearinghouse-specific guidance
} else {
  // Simple deal - basic validation
}
```

## Key Files

### Routing Configuration
- `frontend/src/App.jsx` - Main route definitions
- `frontend/src/pages/Dashboard.jsx` - Deal type selection handler

### Wizard Steps
- `frontend/src/pages/DealWizard/Step0_SocialMedia.jsx`
- `frontend/src/pages/DealWizard/Step1_DealTerms.jsx`
- `frontend/src/pages/DealWizard/Step2_PayorInfo.jsx`
- `frontend/src/pages/DealWizard/Step3_SelectActivities.jsx`
- `frontend/src/pages/DealWizard/Step5_Compliance.jsx`
- `frontend/src/pages/DealWizard/Step6_Compensation.jsx`
- `frontend/src/pages/DealWizard/Step8_Review.jsx`

### Deal Type-Specific Components
- `frontend/src/pages/DealWizard/ClearinghouseWizard.jsx`
- `frontend/src/pages/ClearinghouseResult.jsx`
- `frontend/src/pages/DealWizard/ValuationWizard.jsx`
- `frontend/src/pages/ValuationResult.jsx`

### Route Protection
- `frontend/src/components/DealWizardRoute.jsx` - Protects all wizard routes

## Testing Considerations

### Test Account
- Email: `test1@test.edu`
- Password: `testuser`
- Authentication state saved in `frontend/playwright/.auth/user.json`

### Test Flow
1. Start from `/dashboard` for deal type selection
2. Deal type cards may have loading states
3. Backend API must be running for deal creation
4. Use `chromium-auth` project for authenticated tests
5. Check for error states and backend availability

## Common Issues

### Missing Routes
If you see "missing route handlers" errors, check:
1. All routes are defined in `App.jsx`
2. Deal type selection happens on Dashboard, not separate route
3. Query parameters are used, not different route paths

### Navigation Issues
If navigation fails:
1. Check that `createDraftDeal` function is available
2. Verify backend API is running
3. Ensure deal type is passed as query parameter
4. Check that all wizard steps handle the deal type parameter

## Future Development

When adding new features to the three deal forms:
1. Check the deal type via query parameter in wizard steps
2. Customize behavior based on deal type requirements
3. Ensure new features work across all three deal types
4. Update this documentation for any routing changes 