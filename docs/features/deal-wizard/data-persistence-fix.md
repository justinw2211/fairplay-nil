# Deal Wizard Data Persistence Fix

## Issue Identified
When users navigate backward and forward through the deal wizard forms, previously entered data is not consistently restored across all steps.

## Current State Analysis

### Data Persistence Implementation
- **Centralized State**: All forms use `DealContext` with `currentDeal` state
- **Backend Persistence**: Data saved via `updateDeal()` on each step completion
- **Automatic Loading**: Most steps have `useEffect` hooks to load existing data

### Working Steps (Data Restored)
- ✅ Step0_SocialMedia - data loading confirmed working
- ✅ Step2_PayorInfo - loads payor information from `currentDeal`
- ✅ Step5_Compliance - loads compliance data from `deal.compliance`
- ✅ Step6_Compensation - loads compensation data from `deal.compensation.items`
- ✅ ActivityForm_SocialMedia - loads social media data from `currentDeal`
- ✅ ActivityForm_Endorsements - loads endorsement data from `deal`
- ✅ ActivityForm_Content - loads content data from `deal.obligations['content-for-brand']`
- ✅ ActivityForm_Autographs - loads autograph data from `deal.obligations['autographs']`
- ✅ Other activity forms - load their respective data

### Broken Steps (Data Not Restored)
- ❌ Step1_DealTerms - missing `useEffect` to load `dealNickname` from `currentDeal`
- ❌ Other steps - need verification

## Root Cause
Step1_DealTerms component lacks the `useEffect` hook that other steps use to restore form data from `currentDeal` when the component mounts.

## Updated Analysis (User Testing)
After user testing, it was discovered that most form steps actually have proper data persistence implemented:

**Working Steps (Verified):**
- ✅ Step5_Compliance - loads compliance data from `deal.compliance`
- ✅ Step6_Compensation - loads compensation data from `deal.compensation.items`
- ✅ ActivityForm_Content - loads content data from `deal.obligations['content-for-brand']`
- ✅ ActivityForm_Autographs - loads autograph data from `deal.obligations['autographs']`

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