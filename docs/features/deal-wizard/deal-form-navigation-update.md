# Deal Form Navigation Updates

## Bug Found: Missing Back Button on Step 1 (Deal Terms)

### Issue
During Playwright testing of the Simple Deal Logging form, discovered that **Step 1 (Deal Terms)** is missing a "Back" button.

### Current State
- Step 0 (Social Media): Has "Continue" button ✅
- Step 1 (Deal Terms): Has "Finish Later" and "Next" buttons, **NO "Back" button** ❌
- Expected: All steps should have consistent navigation (Back/Next pattern)

### Impact
- Breaks uniform navigation experience
- Users cannot go back from Step 1 to Step 0
- Inconsistent with expected form wizard behavior

### Required Fix
Add a "Back" button to Step 1 (Deal Terms) that:
- Navigates user back to Step 0 (Social Media)
- Maintains form data when navigating back
- Follows the same styling/positioning as other Back buttons

### Location
- File: `frontend/src/pages/DealWizard/Step1_DealTerms.jsx`
- Component: DealWizardLayout or Step1_DealTerms component

### Testing Notes
- Discovered during Playwright navigation testing
- Test: `simple-deal-navigation.spec.js`
- Error: `Timed out 5000ms waiting for expect(locator).toBeVisible()` for Back button
- Page snapshot confirmed no Back button present on Step 1

### Priority
High - affects user experience and form navigation consistency

## Issue Found: Inconsistent Navigation Button Text

### Issue
During Playwright testing, discovered inconsistent button text across form steps:
- Steps 1-3, 6-7: Use "Next" button
- Step 4 (Activity Form): Uses "Continue" button
- Step 5 (Compliance): Uses "Continue" button

### Current State
- Most steps: "Next" button ✅
- Step 4: "Continue" button (inconsistent) ❌
- Step 5: "Continue" button (inconsistent) ❌

### Impact
- Breaks professional UX consistency
- Users expect uniform navigation patterns
- Makes form feel less polished and systematic

### Professional Recommendation
**Standardize on "Next"** across all steps because:
- "Next" is industry standard for multi-step forms
- Used by major platforms (Salesforce, HubSpot, Stripe)
- More directive and clear about progression
- Feels more structured and professional

### Required Fix
Change Step 4 and Step 5 to use "Next" instead of "Continue":
- Step 4 (Activity Form): Change "Continue" → "Next"
- Step 5 (Compliance): Change "Continue" → "Next"
- Maintain same functionality, just update button text

### Location
- Step 4: `frontend/src/pages/DealWizard/ActivityForm_SocialMedia.jsx`
- Step 5: `frontend/src/pages/DealWizard/Step5_Compliance.jsx`

### Testing Notes
- Discovered during Playwright navigation testing
- Test: `simple-deal-navigation.spec.js`
- Error: `Timed out 5000ms waiting for expect(locator).toBeVisible()` for "Next" button on Step 4
- Page snapshot showed "Continue" button instead of "Next"

### Priority
Medium - affects professional appearance and UX consistency