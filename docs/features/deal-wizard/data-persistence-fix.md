# Deal Wizard Data Persistence Fix

## Issue Identified
When users navigate backward and forward through the deal wizard forms, previously entered data is not consistently restored across all steps.

## Current State Analysis

### Data Persistence Implementation
- **Centralized State**: All forms use `DealContext` with `currentDeal` state
- **Backend Persistence**: Data saved via `updateDeal()` on each step completion
- **Automatic Loading**: Most steps have `useEffect` hooks to load existing data

### Working Steps (Data Restored)
- ✅ Step0_SocialMedia — loads from `currentDeal`
- ✅ Step2_PayorInfo — loads from `currentDeal`
- ✅ Step5_Compliance — loads from top-level fields and `obligations` details
- ✅ Step6_Compensation — loads from normalized fields
- ✅ Activity forms — load from `currentDeal.obligations[*]`

### Broken Steps (Data Not Restored)
- ❌ Step1_DealTerms - missing `useEffect` to load `dealNickname` from `currentDeal`
- ❌ Other steps - need verification

## Root Cause
Step1_DealTerms component lacks the `useEffect` hook that other steps use to restore form data from `currentDeal` when the component mounts.

## Updated Analysis (User Testing)
After user testing, it was discovered that most form steps actually have proper data persistence implemented:

**Working Steps (Verified):**
- ✅ Step5_Compliance — persists Q1–Q6. Fields:
  - Top-level: `licenses_nil`, `uses_school_ip`, `grant_exclusivity`
  - Obligations: `licensingInfo`, `schoolBrandInfo`, `conflictingSponsorships`, `conflictingInfo`, `professionalRep`, `restrictedCategories`
- ✅ Step6_Compensation — normalized fields:
  - `compensation_cash`, `compensation_cash_schedule`, `compensation_goods[]`, `compensation_other[]`
- ✅ ActivityForm_Content — `obligations['content-for-brand']`
- ✅ ActivityForm_Autographs — `obligations['autographs']`

**Still Broken:**
- ❌ Step1_DealTerms - missing `useEffect` to load `dealNickname`

## Required Fix

### 1. Add Data Loading to Step1_DealTerms
```javascript
// Add to Step1_DealTerms.jsx
useEffect(() => {
  if (currentDeal) {
    setDealNickname(currentDeal.deal_nickname || '');
    // Also restore uploaded file if it exists
    if (currentDeal.contract_file) {
      setUploadedFile(currentDeal.contract_file);
    }
  }
}, [currentDeal]);
```

**Note**: Include error handling for cases where `currentDeal` is null or data structure is unexpected.

### 2. Verify All Steps Have Data Loading
Check each step component to ensure they have proper `useEffect` hooks:
- Step0_SocialMedia
- Step3_SelectActivities  
- Step4_ActivityForms
- Step5_Compliance
- Step7_DealType
- Step8_Review

Note: Step3 preserves non-activity `obligations` keys when saving selection, preventing compliance fields from being dropped.

### 3. Standardize Variable Names
Some components use `currentDeal` while others use `deal`. Standardize on `currentDeal` for consistency.

**Note**: `deal` and `currentDeal` are aliases for the same data in DealContext (`deal: currentDeal`). The inconsistency is cosmetic and can be addressed separately.

## Implementation Details

### Files to Modify
- `frontend/src/pages/DealWizard/Step1_DealTerms.jsx`
- Verify other step files for missing data loading

### Testing Requirements
1. **Forward Navigation**: Fill form data, navigate forward, then back
2. **Data Restoration**: Verify previously entered data is restored
3. **Cross-Deal-Type**: Test with Standard, Simple, and Clearinghouse deals equally
4. **Page Refresh**: Ensure data persists after browser refresh
5. **File Upload Persistence**: Verify uploaded files are restored when navigating back

### Expected Behavior
- User fills deal nickname on Step 1
- Navigates to Step 2 and fills payor info
- Navigates back to Step 1
- **Expected**: Deal nickname field should be pre-filled
- **Current**: Deal nickname field is empty

## Priority
High - affects user experience and form navigation consistency

## Impact
- Improves user experience by maintaining form state
- Reduces data re-entry when navigating backward
- Ensures consistent behavior across all form steps
- Maintains professional form wizard UX standards 