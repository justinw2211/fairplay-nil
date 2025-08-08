# Variable Naming Standards

## Overview

This document defines the standardized variable naming conventions for the FairPlay NIL platform to ensure consistency and clarity across the codebase.

## Deal Context Variables

### Primary Variable: `currentDeal`

**Use `currentDeal` for:**
- The active deal being worked on in the current context
- Deal data accessed from the `useDeal()` hook
- Deal information displayed in components
- Deal data passed to functions and APIs

**Example:**
```javascript
const { currentDeal, updateDeal } = useDeal();

// ✅ CORRECT: Use currentDeal for active deal
if (currentDeal?.compensation_cash) {
  total += parseFloat(currentDeal.compensation_cash);
}

// ✅ CORRECT: Pass currentDeal to functions
const prediction = predictValuation(currentDeal, athleteData);
```

### Backward Compatibility: `deal`

**Use `deal` only for:**
- Backward compatibility in `DealContext.jsx` where `deal: currentDeal` is provided
- Legacy code that hasn't been updated yet
- Documentation references to the concept of "deal" (not the variable)

**Example:**
```javascript
// In DealContext.jsx - for backward compatibility
const value = {
  currentDeal,
  deal: currentDeal, // Backward compatibility
  // ... other values
};
```

## Component Usage Patterns

### Deal Wizard Components

**Standard Pattern:**
```javascript
const { currentDeal, updateDeal } = useDeal();

useEffect(() => {
  if (currentDeal?.obligations?.['endorsements']) {
    // Load existing data
  }
}, [currentDeal]);

const handleNext = async () => {
  await updateDeal(dealId, {
    obligations: {
      ...currentDeal.obligations,
      // ... new data
    },
  });
};
```

### Result Pages

**Standard Pattern:**
```javascript
const { currentDeal, fetchDealById } = useDeal();

useEffect(() => {
  if (currentDeal?.valuation_prediction) {
    setPrediction(currentDeal.valuation_prediction);
  }
}, [currentDeal]);
```

## Migration Guidelines

### When to Update

1. **New Components**: Always use `currentDeal`
2. **Existing Components**: Update when making other changes
3. **Critical Paths**: Prioritize deal wizard and result pages

### Update Checklist

- [ ] Replace `deal` with `currentDeal` in destructuring
- [ ] Update all `deal?.` references to `currentDeal?.`
- [ ] Update all `deal.` references to `currentDeal.`
- [ ] Update function parameters and calls
- [ ] Update JSX template references
- [ ] Remove unused React imports if present

### Testing

After updating variable names:
1. Test deal creation flow
2. Test deal editing flow
3. Test result page displays
4. Verify no console errors

## File Status

### ✅ Updated (Use `currentDeal`)
- `frontend/src/pages/ValuationResult.jsx`
- `frontend/src/pages/ClearinghouseResult.jsx`
- `frontend/src/pages/DealWizard/ActivityForm_Content.jsx`
- `frontend/src/pages/DealWizard/ActivityForm_Endorsements.jsx`
- `frontend/src/pages/DealWizard/ActivityForm_Other.jsx`
- `frontend/src/pages/DealWizard/ActivityForm_Autographs.jsx`
- `frontend/src/pages/DealWizard/ActivityForm_Merch.jsx`
- `frontend/src/pages/DealWizard/ActivityForm_Appearance.jsx`
- `frontend/src/pages/DealWizard/ValuationWizard.jsx`
- `frontend/src/pages/DealWizard/ClearinghouseWizard.jsx`
- `frontend/src/pages/DealWizard/DealWizardLayout.jsx`
- `frontend/src/pages/DealWizard/SubmissionSuccess.jsx`

### 🔄 Context Provider
- `frontend/src/context/DealContext.jsx` - Provides both `currentDeal` and `deal` for compatibility

## Best Practices

1. **Consistency**: Always use `currentDeal` for the active deal
2. **Clarity**: The name `currentDeal` clearly indicates it's the deal being worked on
3. **Future-proof**: New code should use `currentDeal` exclusively
4. **Documentation**: Update comments and documentation to reference `currentDeal`

## Common Patterns

### Loading States
```javascript
if (!currentDeal) {
  return <LoadingSpinner />;
}
```

### Data Access
```javascript
const dealName = currentDeal?.deal_nickname || 'Untitled Deal';
const compensation = currentDeal?.compensation_cash || 0;
```

### Form Updates
```javascript
await updateDeal(dealId, {
  obligations: {
    ...currentDeal.obligations,
    'endorsements': newData,
  },
});
```

### Prediction Data
```javascript
if (currentDeal?.valuation_prediction) {
  setPrediction(currentDeal.valuation_prediction);
}
```
