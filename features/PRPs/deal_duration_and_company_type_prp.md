name: "Deal Duration and Payor Company Type Questions PRP"
description: |
  Add two new questions to the deal form: deal duration/contract length and payor company type/industry information to enhance deal analysis and compliance tracking.

## Purpose
Implement deal duration collection and payor company type/industry classification to improve deal analysis, compliance tracking, and provide better insights for NIL deal valuation and clearinghouse predictions.

## Core Principles
1. **Context is King**: Leverage existing deal wizard architecture and form patterns
2. **Validation Loops**: Ensure data integrity and user experience consistency
3. **Information Dense**: Integrate seamlessly with current deal creation flow
4. **Progressive Success**: Start with basic collection, then enhance with validation
5. **Global rules**: Follow all rules in CLAUDE.md and maintain existing user experience patterns

---

## Goal
Add two new questions to the deal wizard that:
- Collect deal duration/contract length (years and months)
- Determine payor company size and industry classification
- Store this data for enhanced deal analysis and compliance tracking
- Maintain seamless integration with existing deal wizard flow

## Why
- **Business value**: Enhanced deal analysis capabilities for better valuation and clearinghouse predictions
- **User impact**: More comprehensive deal information for better insights and compliance
- **Integration**: Seamless integration with existing deal creation wizard
- **Compliance**: Better tracking of deal terms and payor information for regulatory requirements

## What
### User-visible behavior:
1. **Deal Duration Question**: Added to existing Step 1 (Deal Terms) - contract length in years and months
2. **Payor Company Type Question**: Added to existing Step 2 (Payor Info) - company size and industry classification
3. **Wizard Flow**: No new steps - questions integrated into relevant existing steps
4. **Data Storage**: Store duration (years, months, total_months) and company information in deal record (not displayed in dashboard yet)
5. **Validation**: Enforce 10-year maximum total duration and require at least 1 month
6. **Industry Selection**: 20-30 detailed industry options as checkboxes with search filter, unlimited selection and "Other" checkbox
7. **Company Size Classification**: Revenue-based options with clear descriptions and examples for user guidance
8. **Form UX**: Two separate number inputs for duration (default 0,0), integrated fields without new section headers

### Technical requirements:
- Database schema updates to store deal duration (years, months, total_months) and company type data
- Backend API endpoints for new field updates
- Frontend form components for duration (two number inputs, default 0,0) and company type collection
- Validation for duration fields (10-year total cap) and company type selection
- Integration with existing deal creation wizard
- 20-30 detailed industry options as checkboxes with search filter (ordered alphabetically, prioritize NIL-common industries)
- Revenue-based company size classification with user-friendly descriptions
- Required field validation for all deal types with specific error messages (show when proceeding to next step)
- Data preservation when users navigate back (don't clear related fields)
- Field placement: duration after contract upload, company size after payor type but before contact details
- "Other" industry option with text input popup for specification

### Success Criteria
- [ ] Deal duration data is collected and stored for all new deals (required for all deal types)
- [ ] Payor company type and industry data is collected and stored (required for all deal types)
- [ ] New questions integrate seamlessly into existing steps without creating new pages
- [ ] Data is stored but not displayed in dashboard (future update)
- [ ] Duration validation enforces 10-year maximum total duration with clear error messages (shown when proceeding to next step)
- [ ] Industry selection uses 20-30 detailed options as checkboxes with search filter (ordered alphabetically, NIL-common industries prioritized)
- [ ] Company size classification provides clear guidance with revenue-based options and examples
- [ ] User-friendly descriptions help users accurately self-identify their company type
- [ ] Total months calculation is stored for future algorithm integration
- [ ] Existing wizard flow remains unchanged (same number of steps)
- [ ] Form fields are integrated without new section headers
- [ ] Data is preserved when users navigate back through steps
- [ ] Field placement follows specified order (duration after contract upload, company size after payor type)
- [ ] All new fields are required for all deal types (simple, clearinghouse, valuation)
- [ ] "Other" industry option includes text input popup for specification

## All Needed Context

### Documentation & References
```yaml
# MUST READ - Include these in your context window (per cursor rules)
- file: docs/development/database/supabase-guide.md
  why: Complete database schema, relationships, and query patterns (cursor rule requirement)
  
- file: .cursor/rules/cursor-rules.mdc
  why: Project-specific patterns, NIL compliance requirements, and coding standards
  
- file: frontend/src/pages/DealWizard/Step1_DealTerms.jsx
  why: Pattern for deal wizard step implementation and navigation
  
- file: frontend/src/pages/DealWizard/Step2_PayorInfo.jsx
  why: Pattern for payor information collection and validation
  
- file: frontend/src/validation/schemas.js
  why: Existing validation patterns to follow for new form fields
  
- file: frontend/src/context/DealContext.jsx
  why: Deal-specific context patterns to follow (cursor rule requirement)
  
- file: backend/app/schemas.py
  why: Current deal schema structure to extend with new fields
  
- file: backend/app/api/deals.py
  why: Existing deal API endpoints to extend with new functionality
  
- file: backend/migrations/016_add_deal_type_and_predictions.sql
  why: Pattern for adding new fields to deals table
  
- file: features/PRPs/three-deal-form-functionalities.md
  why: Understanding of current deal wizard architecture and step flow
  
- file: docs/features/deal-wizard/three-deal-form-routing.md
  why: Current routing patterns and step numbering for deal wizard
```

### Current Codebase tree
```bash
frontend/
├── src/
│   ├── pages/
│   │   └── DealWizard/
│   │       ├── Step0_SocialMedia.jsx       # Step 0: Social Media
│   │       ├── Step1_DealTerms.jsx         # Step 1: Deal Terms
│   │       ├── Step2_PayorInfo.jsx         # Step 2: Payor Info
│   │       ├── Step3_SelectActivities.jsx  # Step 3: Activities
│   │       ├── Step5_Compliance.jsx        # Step 5: Compliance
│   │       ├── Step6_Compensation.jsx      # Step 6: Compensation
│   │       ├── Step7_DealType.jsx          # Step 7: Deal Type
│   │       └── Step8_Review.jsx            # Step 8: Review
│   ├── validation/schemas.js               # Yup validation schemas
│   └── context/DealContext.jsx             # Deal state management

backend/
├── app/
│   ├── api/deals.py                        # Deal CRUD operations
│   ├── schemas.py                          # Deal data validation
│   └── database.py                         # Database operations
└── migrations/
    └── 016_add_deal_type_and_predictions.sql  # Latest migration pattern
```

### Desired Codebase tree with files to be added and responsibility of file
```bash
frontend/
├── src/
│   ├── pages/
│   │   └── DealWizard/
│   │       ├── Step0_SocialMedia.jsx       # Step 0: Social Media
│   │       ├── Step1_DealTerms.jsx         # MODIFY: Step 1: Deal Terms + Duration
│   │       ├── Step2_PayorInfo.jsx         # MODIFY: Step 2: Payor Info + Company Type
│   │       ├── Step3_SelectActivities.jsx  # Step 3: Activities (unchanged)
│   │       ├── Step5_Compliance.jsx        # Step 5: Compliance (unchanged)
│   │       ├── Step6_Compensation.jsx      # Step 6: Compensation (unchanged)
│   │       ├── Step7_DealType.jsx          # Step 7: Deal Type (unchanged)
│   │       └── Step8_Review.jsx            # MODIFY: Step 8: Review (show new data)
│   ├── validation/schemas.js               # MODIFY: Add new validation schemas
│   └── context/DealContext.jsx             # MODIFY: Add new field handling

backend/
├── app/
│   ├── api/deals.py                        # MODIFY: Add new field handling
│   ├── schemas.py                          # MODIFY: Add new field schemas
│   └── database.py                         # MODIFY: Add new field operations
└── migrations/
    └── 017_add_deal_duration_and_company_type.sql  # CREATE: New migration
```

### Known Gotchas of our codebase & Library Quirks
```python
# CRITICAL: FastAPI requires async functions for endpoints
# CRITICAL: Pydantic v2 validation patterns must be followed
# CRITICAL: Deal wizard steps must maintain query parameter (?type=simple|clearinghouse|valuation)
# CRITICAL: All steps must use DealWizardStepWrapper for consistent UI
# CRITICAL: Navigation must preserve deal type parameter through all steps
# CRITICAL: Form validation must follow existing patterns in validation/schemas.js
# CRITICAL: New fields are required for all deal types (simple, clearinghouse, valuation)
# CRITICAL: Data is collected but not displayed in dashboard (future update)
# CRITICAL: Company size classification uses revenue-based options for future valuation algorithms
# CRITICAL: User-friendly descriptions and examples are essential for accurate self-identification
# CRITICAL: Industry list should be 20-30 detailed options, not flat categories
# CRITICAL: Form fields should be integrated without new section headers
# CRITICAL: Data should be preserved when users navigate back (don't clear related fields)
# CRITICAL: Field placement: duration after contract upload, company size after payor type but before contact details
# CRITICAL: All new fields are required for all deal types (simple, clearinghouse, valuation)
# CRITICAL: Prioritize industries most common in NIL deals
# CRITICAL: Industry list ordered alphabetically in checkbox display
# CRITICAL: Error messages shown when proceeding to next step (not immediately)
# CRITICAL: "Other" industry option requires text input popup for specification
```

## Implementation Blueprint

### Data models and structure

Create the core data models to ensure type safety and consistency.
```python
# Backend schemas.py additions
class DealDuration(BaseModel):
    years: int = Field(ge=0, le=10, description="Contract duration in years")
    months: int = Field(ge=0, le=11, description="Contract duration in months")
    total_months: int = Field(description="Total duration in months for calculations")
    
    @validator('years', 'months')
    def validate_duration(cls, v, field):
        # Ensure total duration doesn't exceed 10 years
        if field.name == 'years':
            total_months = v * 12 + cls.months
            if total_months > 120:  # 10 years * 12 months
                raise ValueError('Total duration cannot exceed 10 years')
        elif field.name == 'months':
            total_months = cls.years * 12 + v
            if total_months > 120:  # 10 years * 12 months
                raise ValueError('Total duration cannot exceed 10 years')
        
        # Ensure at least 1 month duration
        if cls.years == 0 and v == 0:
            raise ValueError('Duration must be at least 1 month')
        return v
    
    @validator('total_months', always=True)
    def calculate_total_months(cls, v, values):
        years = values.get('years', 0)
        months = values.get('months', 0)
        return years * 12 + months

class CompanyType(BaseModel):
    company_size: str = Field(pattern=r'^(individual|small_business|medium_business|large_corporation|startup|nonprofit|government|other)$')
    industries: List[str] = Field(min_items=1, description="Company industries (unlimited)")
    
    @validator('company_size')
    def validate_company_size(cls, v):
        allowed_sizes = ['individual', 'small_business', 'medium_business', 'large_corporation', 'startup', 'nonprofit', 'government', 'other']
        if v not in allowed_sizes:
            raise ValueError(f'Company size must be one of: {", ".join(allowed_sizes)}')
        return v

# Update DealUpdate schema
class DealUpdate(BaseModel):
    # ... existing fields ...
    
    # Step 2: Deal Duration (NEW)
    deal_duration_years: Optional[int] = Field(None, ge=0, le=10)
    deal_duration_months: Optional[int] = Field(None, ge=0, le=11)
    deal_duration_total_months: Optional[int] = Field(None, description="Total duration in months for calculations")
    
    # Step 4: Company Type (NEW)
    payor_company_size: Optional[str] = Field(None, pattern=r'^(individual|small_business|medium_business|large_corporation|startup|nonprofit|government|other)$')
    payor_industries: Optional[List[str]] = Field(None, description="Unlimited industry selection")
```

### list of tasks to be completed to fulfill the PRP in the order they should be completed

```yaml
Task 1: Database Migration
CREATE backend/migrations/017_add_deal_duration_and_company_type.sql:
  - ADD COLUMN deal_duration_years integer DEFAULT NULL
  - ADD COLUMN deal_duration_months integer DEFAULT NULL
  - ADD COLUMN deal_duration_total_months integer DEFAULT NULL
  - ADD COLUMN payor_company_size text DEFAULT NULL
  - ADD COLUMN payor_industries text[] DEFAULT NULL
  - ADD constraints for validation (max 10 years total duration)
  - ADD indexes for performance

Task 2: Backend Schema Updates
MODIFY backend/app/schemas.py:
  - ADD DealDuration model with 10-year total cap validation
  - ADD CompanyType model with unlimited industry selection
  - UPDATE DealUpdate schema with new fields
  - ADD validators for duration and company type

Task 3: Backend API Updates
MODIFY backend/app/api/deals.py:
  - UPDATE deal update endpoint to handle new fields
  - ADD validation for new fields
  - UPDATE deal response to include new fields

Task 4: Frontend Validation Schemas
MODIFY frontend/src/validation/schemas.js:
  - ADD deal duration validation schema (0-10 years, 0-11 months, total cap)
  - ADD company type validation schema (unlimited industries)
  - FOLLOW existing validation patterns

Task 5: Update Step 1 - Deal Terms
MODIFY frontend/src/pages/DealWizard/Step1_DealTerms.jsx:
  - ADD deal duration fields to existing form (no new section header)
  - ADD two separate number inputs for years and months (default 0,0)
  - ADD validation for minimum duration and 10-year total cap
  - ADD error message: "Duration must be between 1 month and 10 years" (show when proceeding to next step)
  - UPDATE form validation to include duration fields (REQUIRED for all deal types)
  - CALCULATE and store total_months for backend
  - PLACE fields AFTER contract upload section

Task 6: Update Step 2 - Payor Info
MODIFY frontend/src/pages/DealWizard/Step2_PayorInfo.jsx:
  - ADD company size fields to existing form (no new section header)
  - ADD company size radio buttons with user-friendly descriptions
  - ADD industry selection: all industries as checkboxes with search filter
  - ADD 20-30 detailed industry options (not flat categories, ordered alphabetically)
  - ADD "Other" as a checkbox option with text input popup for specification
  - ADD validation for required fields (no industry limit, REQUIRED for all deal types)
  - ADD error messages: "Please select a company size" and "Please select at least one industry" (show when proceeding to next step)
  - UPDATE form validation to include company type fields
  - PLACE company size AFTER payor type but BEFORE contact details

Task 7: Update Step 8 - Review
MODIFY frontend/src/pages/DealWizard/Step8_Review.jsx:
  - ADD deal duration display in "1 year, 6 months" format
  - ADD company size and industries display
  - UPDATE review summary to include new information
  - PRESERVE existing review layout (no separate sections needed)
  - PRESERVE all data when users navigate back (don't clear related fields)

Task 8: Update Deal Context
MODIFY frontend/src/context/DealContext.jsx:
  - ADD new fields to deal state
  - UPDATE deal update function to handle new fields
  - MAINTAIN existing error handling patterns

Task 9: Industry List Definition
CREATE frontend/src/data/industries.js:
  - DEFINE 20-30 detailed industry options (not flat categories)
  - INCLUDE specific options like: Software, Hardware, AI/Machine Learning, Cloud Services, Mobile Apps, Sports Equipment, Sports Apparel, Training/Fitness, Sports Media, Sports Betting, Restaurants, Fast Food, CPG, Beverages, Food Delivery, Clothing, Accessories, Cosmetics, Jewelry, Fashion Retail, Car Manufacturers, Auto Parts, Car Dealerships, Auto Services, Electric Vehicles, Medical Devices, Pharmaceuticals, Fitness/Wellness, Mental Health, Telemedicine, Banking, Insurance, Investment, FinTech, Real Estate Finance, Universities, EdTech, Online Learning, Training Programs, Media, Gaming, Events, Streaming, Social Media, Property Development, Property Management, Real Estate Services, etc.
  - PRIORITIZE industries most common in NIL deals
  - ORDER alphabetically in checkbox list
  - INCLUDE "Other" as a checkbox option with text input popup for specification
  - FOLLOW existing data structure patterns

Task 10: Company Size Configuration
CREATE frontend/src/data/companySizes.js:
  - DEFINE revenue-based company size options with descriptions
  - INCLUDE user-friendly labels and examples
  - PROVIDE context for NIL deal valuation impact
```

### Per task pseudocode as needed added to each task
```python
# Task 1: Database Migration
-- Migration pseudocode
ALTER TABLE public.deals 
ADD COLUMN deal_duration_years integer DEFAULT NULL,
ADD COLUMN deal_duration_months integer DEFAULT NULL,
ADD COLUMN payor_company_size text DEFAULT NULL,
ADD COLUMN payor_industries text[] DEFAULT NULL;

-- Add constraints
ALTER TABLE public.deals 
ADD CONSTRAINT valid_deal_duration_years CHECK (deal_duration_years >= 0 AND deal_duration_years <= 10),
ADD CONSTRAINT valid_deal_duration_months CHECK (deal_duration_months >= 0 AND deal_duration_months <= 11),
ADD CONSTRAINT valid_payor_company_size CHECK (
  payor_company_size IS NULL OR payor_company_size IN (
    'small_business', 'medium_business', 'large_corporation', 'startup', 'nonprofit', 'government', 'other'
  )
);

# Task 5: Update Step 1 - Deal Terms
// Frontend pseudocode - ADD to existing Step1_DealTerms.jsx
const Step1_DealTerms = () => {
  // ... existing state ...
  const [durationYears, setDurationYears] = useState(0);
  const [durationMonths, setDurationMonths] = useState(0);
  
  const isFormValid = existingValidation && 
                     (durationYears > 0 || durationMonths > 0) && 
                     (durationYears <= 10) && (durationMonths <= 11) &&
                     ((durationYears * 12 + durationMonths) <= 120); // 10 years max
  
  const handleNext = async () => {
    const totalMonths = durationYears * 12 + durationMonths;
    await updateDeal(dealId, {
      // ... existing fields ...
      deal_duration_years: durationYears,
      deal_duration_months: durationMonths,
      deal_duration_total_months: totalMonths
    });
    navigate(`/add/deal/payor/${dealId}${typeParam}`);
  };
};

# Task 6: Update Step 2 - Payor Info
// Frontend pseudocode - ADD to existing Step2_PayorInfo.jsx
const Step2_PayorInfo = () => {
  // ... existing state ...
  const [companySize, setCompanySize] = useState('');
  const [industries, setIndustries] = useState([]);
  
  const isFormValid = existingValidation && companySize && industries.length > 0;
  
  const handleNext = async () => {
    await updateDeal(dealId, {
      // ... existing fields ...
      payor_company_size: companySize,
      payor_industries: industries
    });
    navigate(`/add/deal/activities/select/${dealId}${typeParam}`);
  };
};

// Company size options with user-friendly descriptions
const COMPANY_SIZE_OPTIONS = [
  {
    value: 'individual',
    label: 'Individual/Sole Proprietor',
    description: 'Personal brand deals, individual sponsorships',
    example: 'Personal trainer, local influencer, individual sponsor'
  },
  {
    value: 'small_business', 
    label: 'Small Business',
    description: 'Local businesses, single-location operations (<$1M revenue)',
    example: 'Local coffee shop, neighborhood restaurant, small retail store'
  },
  {
    value: 'medium_business',
    label: 'Medium Business', 
    description: 'Regional chains, growing companies ($1M-$50M revenue)',
    example: 'Regional coffee chain, local car dealership, growing startup'
  },
  {
    value: 'large_corporation',
    label: 'Large Corporation',
    description: 'National brands, Fortune 500 companies (>$50M revenue)',
    example: 'Nike, Coca-Cola, McDonald\'s, major sports brands'
  },
  {
    value: 'startup',
    label: 'Startup/VC-Backed',
    description: 'High-growth startups with significant funding',
    example: 'Tech startups, venture-backed companies, high-growth businesses'
  },
  {
    value: 'nonprofit',
    label: 'Nonprofit Organization',
    description: 'Charities, foundations, educational institutions',
    example: 'Local charities, university programs, community foundations'
  },
  {
    value: 'government',
    label: 'Government Entity',
    description: 'Municipal, state, or federal government',
    example: 'City tourism boards, state agencies, government programs'
  },
  {
    value: 'other',
    label: 'Other',
    description: 'Other organization types not listed above',
    example: 'Cooperatives, associations, other unique organizations'
  }
];
```

### Integration Points
```yaml
DATABASE:
  - migration: "Add deal duration and company type fields to deals table"
  - index: "CREATE INDEX idx_deals_duration ON deals(deal_duration_years, deal_duration_months)"
  - index: "CREATE INDEX idx_deals_company_size ON deals(payor_company_size)"
  
CONFIG:
  - add to: backend/app/schemas.py
  - pattern: "New Pydantic models for validation"
  
ROUTES:
  - add to: frontend/src/App.jsx
  - pattern: "New routes for Step3 and Step4 with deal type parameters"
```

## Validation Loop

### Level 1: Syntax & Style
```bash
# Run these FIRST - fix any errors before proceeding
ruff check backend/app/ --fix  # Auto-fix what's possible
mypy backend/app/              # Type checking
npm run lint frontend/src/     # Frontend linting

# Expected: No errors. If errors, READ the error and fix.
```

### Level 2: Unit Tests each new feature/file/function use existing test patterns
```python
# CREATE test_deal_duration.py with these test cases:
def test_valid_duration():
    """Valid duration is accepted"""
    duration = DealDuration(years=1, months=6)
    assert duration.years == 1
    assert duration.months == 6

def test_invalid_duration():
    """Invalid duration raises ValidationError"""
    with pytest.raises(ValidationError):
        DealDuration(years=0, months=0)  # Must be at least 1 month

def test_company_type_validation():
    """Valid company type is accepted"""
    company = CompanyType(
        company_size="large_corporation",
        industry=["technology", "sports"]
    )
    assert company.company_size == "large_corporation"
    assert len(company.industry) == 2
```

```bash
# Run and iterate until passing:
uv run pytest tests/ -v
# If failing: Read error, understand root cause, fix code, re-run
```

### Level 3: Integration Test
```bash
# Start the service
uv run python -m backend.app.main --dev

# Test the new endpoints
curl -X PUT http://localhost:8000/deals/1 \
  -H "Content-Type: application/json" \
  -d '{"deal_duration_years": 1, "deal_duration_months": 6, "payor_company_size": "large_corporation", "payor_industries": ["technology"]}'

# Expected: {"status": "success", "data": {...}}
# If error: Check logs for stack trace
```

## Final validation Checklist
- [ ] All tests pass: `uv run pytest tests/ -v`
- [ ] No linting errors: `uv run ruff check backend/`
- [ ] No type errors: `uv run mypy backend/`
- [ ] Frontend linting passes: `npm run lint`
- [ ] Manual test successful: Navigate through new wizard steps
- [ ] Error cases handled gracefully
- [ ] Logs are informative but not verbose
- [ ] Documentation updated if needed
- [ ] Deal type parameters preserved through all steps
- [ ] Progress indicators updated correctly

---

## Anti-Patterns to Avoid
- ❌ Don't create new patterns when existing ones work
- ❌ Don't skip validation because "it should work"  
- ❌ Don't ignore failing tests - fix them
- ❌ Don't use sync functions in async context
- ❌ Don't hardcode values that should be config
- ❌ Don't catch all exceptions - be specific
- ❌ Don't break existing deal wizard navigation patterns
- ❌ Don't forget to preserve deal type query parameters
- ❌ Don't create inconsistent UI patterns with existing steps
- ❌ Don't display new data in dashboard (save for future update)
- ❌ Don't use new data in prediction algorithms yet
- ❌ Don't limit industry selection to 5 choices (allow unlimited)
- ❌ Don't use employee count for company size (use revenue-based classification)
- ❌ Don't make company size descriptions vague (provide clear examples)
- ❌ Don't use flat industry categories (use 20-30 detailed specific options)
- ❌ Don't add new section headers (integrate fields naturally)
- ❌ Don't clear data when users navigate back (preserve all form data)
- ❌ Don't make new fields optional (all fields required for all deal types)
- ❌ Don't include industries not common in NIL deals (prioritize relevant options)
- ❌ Don't show error messages immediately (show when proceeding to next step)
- ❌ Don't allow "Other" industry without specification (require text input popup)
