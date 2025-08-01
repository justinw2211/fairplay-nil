# Three Deal Form Functionalities PRP

> **⚠️ OUTDATED PRP**  
> This PRP reflects an early design that was later simplified. The current implementation uses Dashboard-based deal type selection rather than a separate DealTypeSelection page. See `docs/features/deal-wizard/three-deal-form-routing.md` for current architecture.

## Goal
Transform the current single "Add New Deal" functionality on student-athlete dashboards into three distinct deal workflows:
1. **Simple Deal Logging** - Basic tracking without predictive analysis, just status management
2. **NIL Go Clearinghouse Prediction** - Determines if a deal will be approved/denied/flagged by the NIL Go Clearinghouse
3. **Deal Valuation Analysis** - Provides fair market value compensation ranges based on deal parameters and athlete profile

## Why
- **User Experience**: Athletes need different levels of deal analysis based on their needs
- **Compliance Value**: Clearinghouse prediction helps athletes understand approval likelihood before submission
- **Negotiation Power**: Valuation analysis provides data-driven compensation insights
- **Market Differentiation**: Predictive features set FairPlay apart from basic deal tracking platforms

## What
### User-Visible Behavior
- Dashboard shows three distinct "Deal Type" cards instead of single "Add New Deal" button
- Each workflow leads to a customized wizard experience
- Results are displayed in dedicated result pages with clear actionable insights
- Dashboard shows result indicators for clearinghouse and valuation deals

### Technical Requirements
- Maintain existing 9-step wizard architecture
- Add deal type selection and routing logic
- Create simplified logging workflow (bypass complex steps)
- Build prediction result pages with mock algorithms
- Update dashboard to display results and navigation links

## All Needed Context

### Documentation & References
```yaml
- file: frontend/src/pages/Dashboard.jsx
  why: Current "Add New Deal" button location and deals table structure
  
- file: frontend/src/pages/DealWizard/Step1_DealTerms.jsx
  why: Existing wizard step patterns and navigation flow
  
- file: frontend/src/context/DealContext.jsx
  why: Deal state management and API integration patterns
  
- file: backend/app/api/deals.py
  why: Deal creation and update API endpoints
  
- file: backend/app/schemas.py
  why: Deal data structure and validation patterns
  
- url: https://www.nilrevolution.com/2025/05/nil-go-deloitte-establishes-basic-framework-to-review-third-party-nil-deals/
  why: Real NIL Go clearinghouse process - 3-step validation: Payor Association, Business Purpose, Fair Market Value
  critical: $600 threshold, 12-point FMV analysis, deals marked as "cleared/in review/information needed"
  
- file: frontend/src/theme.js
  why: Brand colors and styling consistency requirements
  critical: Must use brand.accentPrimary instead of hardcoded colors
```

### Current Codebase Tree
```bash
frontend/src/
├── pages/
│   ├── Dashboard.jsx                    # Current single "Add New Deal" button
│   └── DealWizard/
│       ├── Step0_SocialMedia.jsx       # Step 1 of wizard
│       ├── Step1_DealTerms.jsx         # Step 2 of wizard  
│       ├── Step2_PayorInfo.jsx         # Step 3 of wizard
│       ├── Step3_SelectActivities.jsx  # Step 4 of wizard
│       ├── ActivityRouter.jsx          # Activity form routing
│       ├── Step5_Compliance.jsx        # Step 6 of wizard
│       ├── Step6_Compensation.jsx      # Step 7 of wizard
│       ├── Step8_Review.jsx            # Step 8 of wizard
│       └── SubmissionSuccess.jsx       # Step 9 of wizard
├── context/
│   └── DealContext.jsx                 # Deal state management
└── components/
    └── forms/                          # Existing form patterns

backend/app/
├── api/
│   └── deals.py                        # Deal CRUD operations
├── schemas.py                          # Deal data validation
└── database.py                         # Database operations
```

### Desired Codebase Tree with New Files
```bash
frontend/src/
├── pages/
│   ├── Dashboard.jsx                    # MODIFY: Replace button with three cards
│   ├── DealTypeSelection.jsx           # CREATE: Deal type selection page
│   ├── ClearinghouseResult.jsx         # CREATE: Clearinghouse prediction result
│   ├── ValuationResult.jsx             # CREATE: Valuation analysis result
│   └── DealWizard/
│       ├── SimpleDealWizard.jsx        # CREATE: Simplified logging workflow
│       ├── ClearinghouseWizard.jsx     # CREATE: Clearinghouse prediction workflow
│       └── ValuationWizard.jsx         # CREATE: Valuation analysis workflow
├── components/
│   ├── DealTypeCard.jsx                # CREATE: Deal type selection card
│   ├── ResultBadge.jsx                 # CREATE: Result indicator for dashboard
│   └── PredictionEngines/              # CREATE: Mock prediction logic
│       ├── ClearinghousePredictor.js   # CREATE: Mock clearinghouse logic
│       └── ValuationPredictor.js       # CREATE: Mock valuation logic
└── hooks/
    └── useDealPredictions.js           # CREATE: Prediction data hook

backend/app/
├── schemas.py                          # MODIFY: Add deal_type, prediction fields
└── database.py                         # MODIFY: Add prediction storage
```

### Known Gotchas of Our Codebase & Library Quirks
```javascript
// CRITICAL: Always use theme colors, never hardcoded hex values
// BAD: bg="#3182CE" 
// GOOD: bg="brand.accentPrimary"

// CRITICAL: Deal wizard uses 9-step flow with specific routing patterns
// Navigate pattern: navigate(`/add/deal/terms/${dealId}`)
// Each step updates deal via updateDeal(dealId, updateData)

// CRITICAL: Dashboard expects deals with specific status values
// Valid statuses: 'draft', 'submitted', 'approved', 'rejected'

// CRITICAL: Deal context expects specific field names
// Use: compensation_cash, compensation_goods, compensation_other
// Not: compensation, payment, etc.

// CRITICAL: Supabase JSONB fields must be properly formatted
// Use: { key: value } objects, not stringified JSON
```

## Implementation Blueprint

### Data Models and Structure
```javascript
// Add to backend/app/schemas.py
class DealUpdate(BaseModel):
    deal_type: Optional[str] = None  # 'simple', 'clearinghouse', 'valuation'
    clearinghouse_prediction: Optional[Dict[str, Any]] = None
    valuation_prediction: Optional[Dict[str, Any]] = None

// Frontend prediction data structures
const clearinghousePrediction = {
  status: 'cleared' | 'in_review' | 'information_needed',
  confidence: number, // 0-100
  factors: {
    payorAssociation: boolean,
    businessPurpose: boolean,
    fairMarketValue: boolean
  },
  issues: string[],
  recommendations: string[]
}

const valuationPrediction = {
  lowRange: number,
  highRange: number,
  confidence: number,
  factors: {
    socialMediaScore: number,
    athleticPerformance: number,
    schoolTier: number,
    marketSize: number
  },
  rationale: string
}
```

### List of Tasks to be Completed

```yaml
Task 1: Create Deal Type Selection UI
MODIFY src/pages/Dashboard.jsx:
  - FIND pattern: "Add New Deal" button
  - REPLACE with three DealTypeCard components
  - ADD routing to /deal-type-selection

CREATE src/pages/DealTypeSelection.jsx:
  - MIRROR pattern from: existing wizard layouts
  - ADD three card options with descriptions
  - IMPLEMENT routing to appropriate wizard

CREATE src/components/DealTypeCard.jsx:
  - USE Chakra UI Card, Button, Icon components
  - FOLLOW existing brand color patterns
  - ADD hover states and click handlers

Task 2: Implement Deal Type Routing
MODIFY src/pages/DealWizard/Step0_SocialMedia.jsx:
  - ADD deal_type parameter to URL routing
  - PASS deal_type to createDraftDeal call
  - MODIFY navigation to include deal type context

CREATE src/hooks/useDealPredictions.js:
  - MIRROR pattern from: existing API hooks
  - ADD functions for prediction storage/retrieval
  - IMPLEMENT error handling patterns

Task 3: Create Simplified Deal Logging Workflow
CREATE src/pages/DealWizard/SimpleDealWizard.jsx:
  - MIRROR pattern from: existing wizard steps
  - INCLUDE only: Deal Terms, Payor Info, Basic Compensation
  - SKIP: Activities, Compliance, Complex Compensation
  - ADD direct submission flow

MODIFY src/context/DealContext.jsx:
  - ADD deal type handling in createDraftDeal
  - IMPLEMENT simplified update flow
  - MAINTAIN existing error handling

Task 4: Add Deal Type to Backend Schema
MODIFY backend/app/schemas.py:
  - ADD deal_type field to DealUpdate model
  - ADD clearinghouse_prediction JSONB field
  - ADD valuation_prediction JSONB field
  - VALIDATE deal_type enum values

MODIFY backend/app/database.py:
  - ADD deal_type column to deals table
  - UPDATE deal creation to include type
  - ADD prediction storage methods

Task 5: Create Mock Clearinghouse Prediction Engine
CREATE src/components/PredictionEngines/ClearinghousePredictor.js:
  - IMPLEMENT 3-step validation logic based on NIL Go research
  - CHECK $600 threshold, school IP usage, exclusivity terms
  - RETURN prediction object with confidence scores
  - ADD realistic issues and recommendations

Task 6: Build Clearinghouse Prediction Workflow
CREATE src/pages/DealWizard/ClearinghouseWizard.jsx:
  - MIRROR full wizard flow from existing steps
  - ADD prediction calculation after review step
  - NAVIGATE to clearinghouse result page
  - STORE prediction in deal record

CREATE src/pages/ClearinghouseResult.jsx:
  - DISPLAY prediction status with color coding
  - SHOW confidence score and factors
  - LIST issues and recommendations
  - ADD action buttons: renegotiate, proceed, cancel

Task 7: Create Mock Valuation Prediction Engine
CREATE src/components/PredictionEngines/ValuationPredictor.js:
  - IMPLEMENT FMV calculation based on research
  - USE social media followers, school tier, sport type
  - CALCULATE low/high compensation range
  - ADD market size and performance factors

Task 8: Build Valuation Analysis Workflow
CREATE src/pages/DealWizard/ValuationWizard.jsx:
  - MIRROR full wizard flow from existing steps
  - ADD valuation calculation after review step
  - NAVIGATE to valuation result page
  - STORE valuation in deal record

CREATE src/pages/ValuationResult.jsx:
  - DISPLAY compensation range with confidence
  - SHOW factor breakdown and rationale
  - ADD comparison to market averages
  - PROVIDE negotiation guidance

Task 9: Update Dashboard with Result Indicators
MODIFY src/pages/Dashboard.jsx:
  - ADD ResultBadge component to deals table
  - DISPLAY clearinghouse status indicators
  - SHOW valuation range summaries
  - ADD navigation to full result pages

CREATE src/components/ResultBadge.jsx:
  - DISPLAY prediction status with appropriate colors
  - SHOW summary information on hover
  - ADD click handler for navigation
  - FOLLOW existing theme patterns

Task 10: Add Backend Prediction Storage
MODIFY backend/app/api/deals.py:
  - ADD prediction data to deal updates
  - VALIDATE prediction data structure
  - IMPLEMENT prediction retrieval endpoints
  - ADD error handling for prediction failures

MODIFY backend/app/database.py:
  - ADD prediction JSONB fields to schema
  - IMPLEMENT prediction storage methods
  - ADD indexes for prediction queries
  - ENSURE proper data validation
```

### Per Task Pseudocode

```javascript
// Task 1: Deal Type Selection UI
function DealTypeSelection() {
  const dealTypes = [
    {
      id: 'simple',
      title: 'Simple Deal Logging',
      description: 'Track your deal status without analysis',
      icon: FileText,
      color: 'brand.accentSecondary'
    },
    {
      id: 'clearinghouse', 
      title: 'NIL Go Clearinghouse Check',
      description: 'Predict approval likelihood',
      icon: Shield,
      color: 'brand.accentPrimary'
    },
    {
      id: 'valuation',
      title: 'Deal Valuation Analysis', 
      description: 'Get fair market value range',
      icon: TrendingUp,
      color: 'brand.accentPrimary'
    }
  ];

  const handleTypeSelection = (type) => {
    navigate(`/add/deal/social-media/new?type=${type}`);
  };

  return (
    <Grid templateColumns="repeat(auto-fit, minmax(300px, 1fr))">
      {dealTypes.map(type => (
        <DealTypeCard key={type.id} {...type} onSelect={handleTypeSelection} />
      ))}
    </Grid>
  );
}

// Task 5: Clearinghouse Prediction Logic
function predictClearinghouse(dealData) {
  const factors = {
    payorAssociation: checkPayorAssociation(dealData.payor_name),
    businessPurpose: checkBusinessPurpose(dealData.activities),
    fairMarketValue: checkFairMarketValue(dealData.compensation_cash, dealData.athlete_profile)
  };

  const issues = [];
  if (dealData.compensation_cash < 600) {
    return { status: 'cleared', confidence: 95, factors, issues: [] };
  }

  if (dealData.uses_school_ip) {
    issues.push('School IP usage requires additional review');
  }

  if (dealData.grant_exclusivity === 'yes') {
    issues.push('Exclusivity terms may require documentation');
  }

  const confidence = calculateConfidence(factors);
  const status = confidence > 80 ? 'cleared' : 
                 confidence > 60 ? 'in_review' : 'information_needed';

  return { status, confidence, factors, issues };
}

// Task 7: Valuation Prediction Logic
function predictValuation(dealData, athleteProfile) {
  const baseValue = calculateBaseValue(athleteProfile.social_media_followers);
  const schoolMultiplier = getSchoolTierMultiplier(athleteProfile.university);
  const sportMultiplier = getSportPopularityMultiplier(athleteProfile.sport);
  const activityMultiplier = getActivityTypeMultiplier(dealData.activities);

  const estimatedValue = baseValue * schoolMultiplier * sportMultiplier * activityMultiplier;
  
  return {
    lowRange: Math.round(estimatedValue * 0.8),
    highRange: Math.round(estimatedValue * 1.2),
    confidence: 85,
    factors: {
      socialMediaScore: baseValue,
      schoolTier: schoolMultiplier,
      sportPopularity: sportMultiplier,
      activityType: activityMultiplier
    },
    rationale: generateRationale(dealData, athleteProfile)
  };
}
```

### Integration Points
```yaml
ROUTING:
  - add to: frontend/src/App.jsx
  - pattern: "<Route path='/deal-type-selection' element={<DealTypeSelection />} />"
  - pattern: "<Route path='/add/deal/clearinghouse-result/:dealId' element={<ClearinghouseResult />} />"

DATABASE:
  - migration: "ADD COLUMN deal_type VARCHAR(20) DEFAULT 'simple'"
  - migration: "ADD COLUMN clearinghouse_prediction JSONB"
  - migration: "ADD COLUMN valuation_prediction JSONB"

API ENDPOINTS:
  - add to: backend/app/api/deals.py
  - pattern: "POST /api/deals/{deal_id}/predict-clearinghouse"
  - pattern: "POST /api/deals/{deal_id}/predict-valuation"
```

## Validation Loop

### Level 1: Syntax & Style
```bash
# Frontend validation
npm run lint
npm run type-check

# Backend validation  
ruff check backend/app --fix
mypy backend/app

# Expected: No errors. If errors, fix before proceeding.
```

### Level 2: Unit Tests
```javascript
// CREATE tests/components/DealTypeCard.test.jsx
describe('DealTypeCard', () => {
  test('renders deal type information correctly', () => {
    const mockType = {
      id: 'simple',
      title: 'Simple Deal Logging',
      description: 'Track your deal status'
    };
    render(<DealTypeCard {...mockType} onSelect={jest.fn()} />);
    expect(screen.getByText('Simple Deal Logging')).toBeInTheDocument();
  });

  test('calls onSelect with correct type when clicked', () => {
    const mockOnSelect = jest.fn();
    render(<DealTypeCard id="simple" onSelect={mockOnSelect} />);
    fireEvent.click(screen.getByRole('button'));
    expect(mockOnSelect).toHaveBeenCalledWith('simple');
  });
});

// CREATE tests/utils/predictions.test.js
describe('Clearinghouse Predictor', () => {
  test('predicts cleared status for low-value deals', () => {
    const dealData = { compensation_cash: 500 };
    const result = predictClearinghouse(dealData);
    expect(result.status).toBe('cleared');
    expect(result.confidence).toBeGreaterThan(90);
  });

  test('flags high-value deals with school IP', () => {
    const dealData = { 
      compensation_cash: 5000, 
      uses_school_ip: true 
    };
    const result = predictClearinghouse(dealData);
    expect(result.issues).toContain('School IP usage requires additional review');
  });
});
```

```bash
# Run tests and iterate until passing
npm test -- --coverage
pytest backend/tests/ -v
```

### Level 3: Integration Test
```bash
# Start development server
npm run dev

# Test deal type selection flow
curl -X POST http://localhost:3000/api/deals \
  -H "Content-Type: application/json" \
  -d '{"deal_type": "clearinghouse"}'

# Test prediction endpoints
curl -X POST http://localhost:3000/api/deals/1/predict-clearinghouse \
  -H "Content-Type: application/json" \
  -d '{"compensation_cash": 1000, "uses_school_ip": true}'

# Expected: Deal creation with type, prediction calculation, result display
```

## Final Validation Checklist
- [ ] All tests pass: `npm test && pytest backend/tests/`
- [ ] No linting errors: `npm run lint && ruff check backend/app`
- [ ] No type errors: `npm run type-check && mypy backend/app`
- [ ] Deal type selection works: Navigate to dashboard, see three cards
- [ ] Clearinghouse prediction works: Complete workflow, see prediction result
- [ ] Valuation analysis works: Complete workflow, see FMV range
- [ ] Dashboard shows results: See prediction indicators and navigation
- [ ] All workflows maintain existing functionality: Simple logging preserves deal creation
- [ ] Mock predictions return realistic data: Based on real NIL Go research
- [ ] Theme colors used consistently: No hardcoded hex values
- [ ] Error handling works: Invalid inputs show appropriate messages

## Success Confidence Assessment
**Score: 9/10** - High confidence for one-pass implementation success

**Strengths:**
- Comprehensive codebase analysis identifies all integration points
- Real NIL Go research provides authentic prediction logic
- Existing wizard patterns can be reused with minimal modifications
- Clear task breakdown with specific file modifications
- Mock predictions allow immediate functional value

**Risk Mitigation:**
- All new components follow established patterns
- Database changes are additive (no breaking changes)
- Existing deal creation flow preserved in simple logging
- Comprehensive testing strategy covers all workflows

**One-Pass Success Factors:**
- Detailed pseudocode for complex prediction logic
- Specific file paths and modification points
- Real-world research integrated into implementation
- Clear validation gates with executable commands
- Preservation of all existing functionality
``` 