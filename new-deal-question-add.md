# Deal Type Classification Feature

## What
Add required deal type question between compensation and review steps.

## Why  
Filter ML training data. Distinguish test/demo from real deals.

## Goal
Train models on confirmed deals only, not test data.

## Implementation

### Database
- Add `submission_type` field to deals table
- Supports: test_demo, prospective, finalized
- Validate only these three values

### Frontend
- **Step**: 7 (between compensation and review)
- **URL**: `/add/deal/deal-type/{id}`
- **Question**: "What best describes this deal?"
- **Options**: Radio buttons
  1. Test/demo response (fictional data)
  2. Prospective deal (in negotiation)  
  3. Confirmed deal
- **Required**: Yes, no default
- **Error**: "Please select a deal type to continue."
- **Flow**: Step 6 → Step 7 → Step 8 (Review)
- **Progress**: 10 total steps (was 9)
- **Save**: Immediately on selection
- **State**: Show previous choice, update on change
- **Mobile**: Modern, professional, aesthetic
- **Query Parameter**: Preserve `?type=simple|clearinghouse|valuation` through step

### Backend
- Store in `submission_type` field
- Update deal endpoint to handle new field
- Validate only three options: test_demo, prospective, finalized
- No migration needed for existing deals

## Files
- `Step7_DealType.jsx` (new)
- `ActivityRouter.jsx` (update)
- Playwright tests (update)
- Deal endpoint (update)

## Routing Context
- **Current Flow**: Step 6 (Compensation) → Step 8 (Review)
- **New Flow**: Step 6 (Compensation) → Step 7 (Deal Type) → Step 8 (Review)
- **URL Pattern**: `/add/deal/deal-type/{dealId}?type={dealType}`
- **Step Numbers**: Update to 10 total steps (was 9)
- **Progress**: Compensation (7/10), Deal Type (8/10), Review (9/10)
- **All Deal Types**: Simple, Clearinghouse, Valuation use same flow
- **Query Parameter**: `?type=simple|clearinghouse|valuation` passed through
- **Route Protection**: Uses DealWizardRoute wrapper like other steps
- **Navigation**: Insert between compensation and review in App.jsx routing

## Testing
- Update three Playwright tests
- Simple: "Test/demo response"
- Clearinghouse: "Prospective deal"  
- Valuation: "Confirmed deal"
- Verify selection works (no specific test data needed)
- Manual validation testing (no additional scenarios)

## Migration
1. Database: Add submission_type field
2. Frontend: Deploy Step 7
3. Navigation: Update numbering to 10 total steps
4. Tests: Update and run

## Success
- [ ] Step 7 appears between compensation and review
- [ ] Three options selectable
- [ ] Validation works
- [ ] Data saved correctly
- [ ] Tests pass
- [ ] Manual testing complete
