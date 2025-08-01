# Navigation Button Update

## Current State Analysis

### Navigation Patterns
- **Custom Navigation**: Steps 0, 1, 2, 3, 4, 5, 6, 7, 8 (ALL steps)
- **SurveyLayout**: Not used (exists but unused)

### Critical Issues Found
1. **Step 1 Missing Back Button** - Users cannot return to Step 0
2. **Inconsistent Button Text** - "Next" vs "Continue" 

## Navigation Flow

```
Step 0 → Step 1 → Step 2 → Step 3 → Step 4 → Step 5 → Step 6 → Step 7 → Step 8
Continue   Next     Next     Next     Continue  Continue  Next     Next     Submit
(no back) (no back) + Back   + Back   + Back    + Back    + Back   + Back   + Back
```

## Target Design Reference

**Navigation Pattern to Match:**
- **Finish Later**: Left side with clock icon
- **Back/Next**: Grouped on right side with gap
- **Button Styling**: Light gray Back, beige/brown Next
- **Icons**: ChevronLeft and ChevronRight

**Button Positioning:**
- **Finish Later**: Far left, separate from navigation group
- **Back/Next**: Grouped on far right with gap between buttons
- **Alignment**: All buttons same height and consistent styling

*Reference: Step 2 (Payor Info) screenshot showing the target navigation layout*

## Focused Solution

**Fix specific issues without full SurveyLayout conversion:**

### 1. Fix Missing Back Button on Step 1
- Add back navigation to Step 0 in Step1_DealTerms.jsx
- Match existing button styling from other steps

### 2. Standardize Button Text
- Change "Continue" to "Next" on Steps 4 and 5
- Keep "Submit" for Step 8

### 3. Ensure Consistent Styling
- Match button layout and colors across all steps
- Use existing custom navigation patterns

## Implementation Details

### Routing Pattern
- **Step 0 → Step 1**: `/add/deal/terms/${dealId}${typeParam}`
- **Step 1 → Step 2**: `/add/deal/payor/${dealId}${typeParam}`
- **Step 2 → Step 1**: `/add/deal/terms/${dealId}${typeParam}` (back navigation)

### Deal Type Parameters
- **Standard**: No type parameter
- **Simple**: `?type=simple`
- **Clearinghouse**: `?type=clearinghouse`
- **Valuation**: `?type=valuation`

### Step 1 Back Button Implementation
- **Navigate to**: `/add/deal/social-media/${dealId}${typeParam}`
- **Include type parameter**: Yes (preserve deal type context)
- **Match styling**: Use same pattern as Step 2 back button

## Remaining Tasks

### 1. Fix Step1_DealTerms.jsx Back Button
- Add back button with navigation to Step 0
- Match styling from Step 2 (Payor Info)
- Test navigation flow

### 2. Standardize Button Text
- Update Step 4 (ActivityForm components): "Continue" → "Next"
- Update Step 5 (Compliance): "Continue" → "Next"
- Verify Step 8 keeps "Submit"

### 3. End-to-End Testing
- Test complete navigation flow
- Verify all back buttons work
- Verify consistent button text
- Test form validation

## Priority
**High** - Missing back button breaks user experience 