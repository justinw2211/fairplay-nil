name: "Social Media Collection & Profile Completion PRP"
description: |
  Add comprehensive social media collection functionality to enhance NIL deal matching and profile completeness for student-athletes.

## Purpose
Implement social media handle and follower count collection to improve NIL deal targeting, compliance tracking, and profile completeness for student-athletes on the FairPlay NIL platform.

## Core Principles
1. **Context is King**: Leverage existing profile management and deal creation flows
2. **Validation Loops**: Ensure data integrity and user experience consistency
3. **Information Dense**: Integrate seamlessly with current authentication and deal flows
4. **Progressive Success**: Start with basic collection, then enhance with validation
5. **Global rules**: Follow all rules in CLAUDE.md and maintain existing user experience patterns

---

## Goal
Create a seamless social media collection system that:
- Prompts new student-athletes to complete their social media profiles after signup
- Confirms and updates social media information at the start of each NIL deal creation
- Stores social media data for deal matching and compliance purposes
- Maintains data integrity and user experience consistency

## Why
- **Business value**: Enhanced deal matching capabilities for brands seeking specific social media reach
- **User impact**: Streamlined profile completion and deal creation process for student-athletes
- **Integration**: Seamless integration with existing profile management and deal creation flows
- **Compliance**: Better tracking of social media obligations and deliverables in NIL deals

## What
### User-visible behavior:
1. **Post-Signup Flow**: New student-athletes see a modal popup to complete social media profile
2. **Deal Creation Flow**: Social media confirmation step before deal terms (new Step 1)
3. **Profile Management**: Edit social media information in profile settings
4. **Dashboard Integration**: Social media stats visible in athlete profile cards

### Technical requirements:
- Database schema updates to store social media data
- Backend API endpoints for social media CRUD operations
- Frontend form components for social media collection
- Validation for social media handles and follower counts
- Integration with existing deal creation wizard

### Success Criteria
- [ ] 90% of new student-athletes complete social media profile within 24 hours of signup
- [ ] Social media confirmation step reduces deal creation abandonment
- [ ] Social media data is available for deal matching and compliance
- [ ] No degradation in existing user experience flows

## All Needed Context

### Documentation & References
```yaml
# MUST READ - Include these in your context window (per cursor rules)
- file: PLANNING.md
  why: Project architecture, goals, style, and constraints (cursor rule requirement)
  
- file: TASK.md
  why: Check existing tasks before starting, add new task with date (cursor rule requirement)
  
- file: supabase-info.md
  why: Complete database schema, relationships, and query patterns (cursor rule requirement)
  
- file: .cursor/rules/cursor-rules.mdc
  why: Project-specific patterns, NIL compliance requirements, and coding standards
  
- file: frontend/src/pages/SignUp.jsx
  why: Understand current signup flow for student-athletes to add social media popup
  
- file: frontend/src/pages/EditProfile.jsx
  why: Pattern for profile form fields and validation to mirror for social media
  
- file: frontend/src/pages/DealWizard/Step1_DealTerms.jsx
  why: Current first step of deal creation - need to add social media confirmation before this
  
- file: frontend/src/validation/schemas.js
  why: Existing validation patterns to follow for social media validation
  
- file: frontend/src/context/AuthContext.jsx
  why: Context patterns for state management (cursor rule requirement)
  
- file: frontend/src/context/DealContext.jsx
  why: Deal-specific context patterns to follow (cursor rule requirement)
  
- file: backend/app/schemas.py
  why: Current profile schema structure to extend with social media fields
  
- file: backend/app/api/profile.py
  why: Existing profile API endpoints to extend with social media functionality
  
- file: backend/migrations/004_add_profile_fields.sql
  why: Pattern for adding new fields to profiles table
```

### Current Codebase tree
```bash
frontend/
├── src/
│   ├── pages/
│   │   ├── SignUp.jsx              # 2-step signup for student-athletes
│   │   ├── EditProfile.jsx         # Profile editing with form validation
│   │   └── DealWizard/
│   │       ├── Step1_DealTerms.jsx # Current first step of deal creation
│   │       └── Step2_PayorInfo.jsx # Second step
│   ├── validation/schemas.js       # Yup validation schemas
│   └── context/AuthContext.jsx     # Authentication context
backend/
├── app/
│   ├── api/profile.py             # Profile API endpoints
│   ├── schemas.py                 # Pydantic schemas
│   └── database.py                # Supabase client
└── migrations/                    # Database migration files
```

### Desired Codebase tree with files to be added
```bash
frontend/
├── src/
│   ├── components/
│   │   ├── social-media-modal.jsx         # NEW: Post-signup social media collection modal (kebab-case)
│   │   └── forms/
│   │       └── social-media-form.jsx      # NEW: Reusable social media form component (kebab-case)
│   ├── pages/
│   │   ├── SignUp.jsx                     # MODIFY: Add social media modal trigger
│   │   ├── EditProfile.jsx                # MODIFY: Add social media fields
│   │   └── DealWizard/
│   │       ├── Step0_SocialMedia.jsx      # NEW: Social media confirmation step
│   │       └── Step1_DealTerms.jsx        # MODIFY: Update step numbering
│   ├── context/
│   │   ├── AuthContext.jsx                # MODIFY: Add social media completion tracking
│   │   └── DealContext.jsx                # MODIFY: Add social media data to deal context
│   ├── hooks/
│   │   └── use-social-media.js            # NEW: Custom hook for social media operations
│   └── validation/schemas.js              # MODIFY: Add social media validation
backend/
├── app/
│   ├── api/
│   │   └── profile.py                     # MODIFY: Add social media endpoints
│   └── schemas.py                         # MODIFY: Add social media schemas
├── migrations/
│   └── 013_add_social_media_fields.sql    # NEW: Add social media table/fields
└── tests/
    └── test_social_media.py               # NEW: Pytest tests for social media functionality
```

### Known Gotchas of our codebase & Library Quirks
```python
# CRITICAL: NIL Compliance Requirements (per cursor rules)
# Example: All social media activities must consider NCAA and state regulations
# Example: Social media follower counts affect deal valuation and compliance

# CRITICAL: Supabase requires proper foreign key relationships
# Example: All profile-related tables must reference profiles(id)
# Example: Use migration files in backend/migrations/ for all schema changes

# CRITICAL: React Hook Form with Yup validation pattern used throughout
# Example: Must use yupResolver and follow existing validation patterns
# Example: Use established form patterns from frontend/src/components/forms/

# CRITICAL: Deal wizard uses step-by-step navigation with dealId in URL
# Example: /add/deal/step/{dealId} - need to insert new step and update routing
# Example: Must update all step numbering and progress percentages

# CRITICAL: All profile updates must maintain auth.users and profiles sync
# Example: Email updates go to auth.users, profile data to profiles table
# Example: Social media data should be stored in separate table with foreign key

# CRITICAL: Existing deal creation uses useDeal context
# Example: Must use updateDeal() function to maintain state consistency
# Example: Social media data should be attached to deal record for compliance

# CRITICAL: Chakra UI components consistently (per cursor rules)
# Example: Use existing UI patterns, maintain responsive design
# Example: Follow established component naming: kebab-case files, PascalCase components

# CRITICAL: Context API patterns established (per cursor rules)
# Example: AuthContext for authentication state, DealContext for deal state
# Example: Don't create new context patterns - extend existing ones

# CRITICAL: FastAPI + Pydantic validation patterns (per cursor rules)
# Example: Use dependency injection, async/await for database operations
# Example: Standard HTTP status codes and error message format

# CRITICAL: Never log sensitive data (per cursor rules)
# Example: No personal info, financial data, or auth tokens in logs
# Example: Validate user permissions before accessing deal/profile data
```

## Implementation Blueprint

### Data models and structure

```python
# Backend Schema Updates
class SocialMediaPlatform(BaseModel):
    platform: str  # "instagram", "twitter", "tiktok", "youtube", "facebook"
    handle: str    # @username format
    followers: int # follower/subscriber count
    verified: bool = False  # verification status
    
class ProfileSocialMedia(BaseModel):
    user_id: UUID
    platforms: List[SocialMediaPlatform]
    last_updated: datetime
    
# Frontend Validation Schema
const socialMediaSchema = yup.object().shape({
  platforms: yup.array().of(
    yup.object().shape({
      platform: yup.string().required(),
      handle: yup.string().matches(/^@[a-zA-Z0-9_]+$/, 'Handle must start with @'),
      followers: yup.number().positive().integer().required(),
    })
  ).min(1, 'At least one social media platform required'),
});
```

### List of tasks to be completed

```yaml
Task 1: Database Schema Updates (per cursor rules)
MODIFY backend/migrations/:
  - CREATE 013_add_social_media_fields.sql
  - ADD social_media_platforms table with foreign key to profiles(id)
  - ADD indices for efficient querying (athlete_id, platform)
  - NEVER delete existing migration files (cursor rule)
  - MIGRATE existing data if needed

Task 2: Backend API Extensions (FastAPI + Pydantic patterns)
MODIFY backend/app/schemas.py:
  - ADD SocialMediaPlatform model with type hints
  - ADD SocialMediaUpdate model with validation
  - EXTEND ProfileResponse to include social media
  - USE Pydantic validation for all fields

MODIFY backend/app/api/profile.py:
  - ADD GET /profile/social-media endpoint (RESTful pattern)
  - ADD PUT /profile/social-media endpoint (RESTful pattern)
  - ADD validation for social media handles
  - USE async/await for database operations
  - IMPLEMENT proper error handling with HTTP status codes
  - VALIDATE user permissions before accessing profile data

CREATE backend/tests/test_social_media.py:
  - ADD Pytest tests for API endpoints
  - TEST validation logic thoroughly
  - TEST error handling scenarios
  - FOLLOW existing test patterns

Task 3: Frontend Form Components (Chakra UI + React Hook Form)
CREATE frontend/src/components/forms/social-media-form.jsx:
  - MIRROR pattern from PhoneField.jsx and SchoolField.jsx
  - USE kebab-case filename (cursor rule)
  - ADD platform selection dropdown (Chakra UI Select)
  - ADD handle input with @ prefix validation
  - ADD follower count input with number validation
  - IMPLEMENT loading and error states
  - USE React Hook Form with yupResolver

CREATE frontend/src/components/social-media-modal.jsx:
  - USE existing modal patterns from codebase
  - INTEGRATE SocialMediaForm component
  - ADD skip/complete later functionality
  - MAINTAIN responsive design principles
  - IMPLEMENT error boundaries

Task 4: Custom Hook for Social Media Operations
CREATE frontend/src/hooks/use-social-media.js:
  - FOLLOW existing hook patterns
  - IMPLEMENT CRUD operations for social media
  - ADD loading and error states
  - HANDLE API failures gracefully with retry options

Task 5: Context Updates (per cursor rules)
MODIFY frontend/src/context/AuthContext.jsx:
  - ADD social media completion tracking
  - MAINTAIN existing authentication patterns
  - DON'T create new context patterns

MODIFY frontend/src/context/DealContext.jsx:
  - ADD social media data to deal context
  - MAINTAIN existing deal state patterns
  - USE updateDeal() function for consistency

Task 6: Profile Management Integration
MODIFY frontend/src/pages/EditProfile.jsx:
  - ADD social media section after existing fields
  - USE existing form validation patterns
  - MAINTAIN existing save/update flow
  - IMPLEMENT real-time validation feedback
  - KEEP component under 300 lines (cursor rule)

Task 7: Post-Signup Modal Integration
MODIFY frontend/src/pages/SignUp.jsx:
  - ADD social media modal trigger after successful signup
  - STORE modal completion state
  - MAINTAIN existing navigation flow
  - CONSIDER NIL compliance requirements

Task 8: Deal Creation Flow Update
CREATE frontend/src/pages/DealWizard/Step0_SocialMedia.jsx:
  - FOLLOW existing step patterns from Step1_DealTerms.jsx
  - LOAD existing social media data
  - ALLOW updates before proceeding
  - UPDATE deal record with current social media data
  - IMPLEMENT NIL compliance validation
  - MAINTAIN consistent UI patterns

MODIFY frontend/src/pages/DealWizard/Step1_DealTerms.jsx:
  - UPDATE step numbering (1 of 8 -> 2 of 9)
  - UPDATE progress percentage (12.5% -> 22.2%)
  - UPDATE navigation URLs
  - MAINTAIN existing functionality

Task 9: Validation & Schema Updates
MODIFY frontend/src/validation/schemas.js:
  - ADD socialMediaSchema with comprehensive validation
  - EXTEND editProfileSchema to include social media
  - FOLLOW existing validation patterns
  - ADD NIL compliance validation rules

Task 10: Dashboard Integration
MODIFY frontend/src/pages/Dashboard.jsx:
  - ADD social media stats to athlete profile card
  - DISPLAY follower counts and platforms
  - MAINTAIN existing card layout
  - CONSIDER performance optimization for large datasets

Task 11: Testing Implementation (per cursor rules)
CREATE frontend/src/components/forms/social-media-form.test.jsx:
  - USE Jest + React Testing Library
  - TEST form validation
  - TEST user interactions
  - TEST error scenarios

CREATE frontend/src/components/social-media-modal.test.jsx:
  - TEST modal behavior
  - TEST completion tracking
  - TEST skip functionality
```

### Per task pseudocode

```python
# Task 1: Database Schema (per cursor rules)
# Add social media storage with proper relationships and indices
CREATE TABLE social_media_platforms (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    platform TEXT NOT NULL CHECK (platform IN ('instagram', 'twitter', 'tiktok', 'youtube', 'facebook')),
    handle TEXT NOT NULL CHECK (handle ~ '^@[a-zA-Z0-9_]+$'),
    followers INTEGER DEFAULT 0 CHECK (followers >= 0),
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', NOW())
);

# Add indices for efficient querying (cursor rule: performance basics)
CREATE INDEX idx_social_media_user_id ON social_media_platforms(user_id);
CREATE INDEX idx_social_media_platform ON social_media_platforms(platform);
CREATE UNIQUE INDEX idx_social_media_user_platform ON social_media_platforms(user_id, platform);

# Task 2: Backend API with FastAPI + Pydantic patterns
class SocialMediaPlatform(BaseModel):
    platform: str = Field(..., regex=r'^(instagram|twitter|tiktok|youtube|facebook)$')
    handle: str = Field(..., regex=r'^@[a-zA-Z0-9_]+$')
    followers: int = Field(..., ge=0)
    verified: bool = False

@router.get("/profile/social-media", response_model=List[SocialMediaPlatform])
async def get_social_media(user_id: str = Depends(get_user_id)):
    # CRITICAL: Validate user permissions (cursor rule)
    # CRITICAL: Use async/await for database operations (cursor rule)
    try:
        data = await supabase.from_("social_media_platforms").select("*").eq("user_id", user_id).execute()
        return data.data or []
    except Exception as e:
        # CRITICAL: Never log sensitive data (cursor rule)
        logger.error(f"Error fetching social media for user: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

# Task 3: Frontend Form Component (Chakra UI + React Hook Form)
const SocialMediaForm = ({ onSubmit, initialData }) => {
    // PATTERN: Follow existing form patterns from PhoneField.jsx
    const [platforms, setPlatforms] = useState(initialData || []);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    // CRITICAL: Use react-hook-form with yup validation (cursor rule)
    const { control, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(socialMediaSchema),
        defaultValues: { platforms: initialData || [] }
    });
    
    // PATTERN: Dynamic field addition like existing forms
    const addPlatform = () => {
        setPlatforms([...platforms, { platform: '', handle: '', followers: 0 }]);
    };
    
    // CRITICAL: Implement loading and error states (cursor rule)
    const submitForm = async (data) => {
        setLoading(true);
        setError(null);
        try {
            await onSubmit(data);
        } catch (err) {
            setError('Failed to save social media information. Please try again.');
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <VStack spacing={4}>
            {error && (
                <Alert status="error">
                    <AlertIcon />
                    {error}
                </Alert>
            )}
            {platforms.map((platform, index) => (
                <PlatformInput 
                    key={index} 
                    {...platform} 
                    onRemove={() => removePlatform(index)}
                />
            ))}
            <Button 
                onClick={addPlatform}
                variant="outline"
                leftIcon={<AddIcon />}
                isDisabled={loading}
            >
                Add Platform
            </Button>
        </VStack>
    );
};

# Task 4: Custom Hook for Social Media Operations
const useSocialMedia = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { user } = useAuth();
    
    const fetchSocialMedia = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/profile/social-media', {
                headers: { 'Authorization': `Bearer ${user.token}` }
            });
            if (!response.ok) throw new Error('Failed to fetch');
            return await response.json();
        } catch (err) {
            setError('Failed to load social media data');
            throw err;
        } finally {
            setLoading(false);
        }
    };
    
    return { fetchSocialMedia, loading, error };
};

# Task 8: Deal Creation Social Media Step (following Step1_DealTerms.jsx)
const Step0_SocialMedia = () => {
    // PATTERN: Follow Step1_DealTerms.jsx structure exactly (cursor rule)
    const { dealId } = useParams();
    const { deal, updateDeal } = useDeal();
    const { user } = useAuth();
    const navigate = useNavigate();
    const toast = useToast();
    
    const [socialMediaData, setSocialMediaData] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // CRITICAL: Load existing social media data on mount
    useEffect(() => {
        const loadSocialMedia = async () => {
            try {
                const data = await fetchSocialMedia();
                setSocialMediaData(data);
            } catch (error) {
                toast({
                    title: 'Error loading social media',
                    description: error.message,
                    status: 'error',
                    duration: 5000,
                    isClosable: true,
                });
            }
        };
        loadSocialMedia();
    }, []);
    
    const handleNext = async () => {
        setLoading(true);
        try {
            // CRITICAL: Update deal with current social media data (cursor rule)
            await updateDeal(dealId, { 
                athlete_social_media: socialMediaData,
                social_media_confirmed: true
            });
            
            // PATTERN: Navigate to next step (maintain existing URLs)
            navigate(`/add/deal/terms/${dealId}`);
        } catch (error) {
            toast({
                title: 'Error updating deal',
                description: error.message,
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setLoading(false);
        }
    };
    
    // CRITICAL: Maintain existing UI patterns (cursor rule)
    return (
        <Container maxW="2xl" py={6}>
            <Card borderColor="brand.accentSecondary" shadow="lg" bg="white">
                <CardHeader pb={6}>
                    {/* Progress Indicator - Updated for new step */}
                    <VStack spacing={3} mb={6}>
                        <Flex justify="space-between" w="full" fontSize="sm">
                            <Text color="brand.textSecondary" fontWeight="medium">Step 1 of 9</Text>
                            <Text color="brand.textSecondary">11.1% Complete</Text>
                        </Flex>
                        <Box w="full" bg="brand.accentSecondary" h="2" rounded="full">
                            <Box
                                bg="brand.accentPrimary"
                                h="2"
                                w="11.1%"
                                rounded="full"
                                transition="width 0.5s ease-out"
                            />
                        </Box>
                    </VStack>
                </CardHeader>
                
                <CardBody>
                    <SocialMediaForm 
                        initialData={socialMediaData}
                        onSubmit={handleNext}
                    />
                </CardBody>
            </Card>
        </Container>
    );
};
```

### Integration Points
```yaml
DATABASE:
  - migration: "013_add_social_media_fields.sql"
  - table: "social_media_platforms with foreign key to profiles(id)"
  - indices: "CREATE INDEX idx_social_media_user ON social_media_platforms(user_id)"
  
ROUTES:
  - add to: frontend/src/App.jsx
  - pattern: "Route path='/add/deal/social-media/:dealId' element={<Step0_SocialMedia />}"
  
API:
  - add to: backend/app/api/profile.py  
  - endpoints: "GET/PUT /profile/social-media"
  
CONTEXT:
  - modify: frontend/src/context/AuthContext.jsx
  - add: social media completion tracking
```

## Validation Loop

### Level 1: Syntax & Style
```bash
# Run these FIRST - fix any errors before proceeding
cd frontend && npm run lint          # Frontend linting
cd backend && ruff check app/ --fix  # Backend linting
cd backend && mypy app/              # Type checking

# Expected: No errors. If errors, READ the error and fix.
```

### Level 2: Unit Tests (per cursor rules)
```python
# Backend Tests: CREATE backend/tests/test_social_media.py (Pytest)
import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.database import supabase

client = TestClient(app)

def test_social_media_validation():
    """Social media handles validate correctly"""
    valid_handle = "@testuser123"
    invalid_handle = "testuser"  # missing @
    
    assert validate_social_handle(valid_handle) == True
    assert validate_social_handle(invalid_handle) == False

def test_follower_count_validation():
    """Follower counts must be positive integers"""
    assert validate_followers(1000) == True
    assert validate_followers(-1) == False
    assert validate_followers(0) == False

def test_get_social_media_endpoint():
    """Test GET /profile/social-media endpoint"""
    # Test authentication required
    response = client.get("/profile/social-media")
    assert response.status_code == 401
    
    # Test authorized access
    response = client.get("/profile/social-media", headers={"Authorization": "Bearer valid_token"})
    assert response.status_code == 200

def test_update_social_media_endpoint():
    """Test PUT /profile/social-media endpoint"""
    social_data = {
        "platforms": [
            {"platform": "instagram", "handle": "@testuser", "followers": 1000}
        ]
    }
    response = client.put("/profile/social-media", json=social_data, headers={"Authorization": "Bearer valid_token"})
    assert response.status_code == 200

def test_social_media_crud():
    """Test complete CRUD operations"""
    # Test create, read, update, delete operations
    pass
```

```javascript
// Frontend Tests: CREATE frontend/src/components/forms/social-media-form.test.jsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChakraProvider } from '@chakra-ui/react';
import SocialMediaForm from './social-media-form';

const renderWithChakra = (component) => {
  return render(<ChakraProvider>{component}</ChakraProvider>);
};

describe('SocialMediaForm', () => {
  test('renders form with initial data', () => {
    const initialData = [
      { platform: 'instagram', handle: '@testuser', followers: 1000 }
    ];
    renderWithChakra(<SocialMediaForm initialData={initialData} onSubmit={jest.fn()} />);
    
    expect(screen.getByDisplayValue('@testuser')).toBeInTheDocument();
    expect(screen.getByDisplayValue('1000')).toBeInTheDocument();
  });

  test('validates social media handle format', async () => {
    renderWithChakra(<SocialMediaForm onSubmit={jest.fn()} />);
    
    const user = userEvent.setup();
    const handleInput = screen.getByLabelText(/handle/i);
    
    await user.type(handleInput, 'invalid_handle');
    await user.tab();
    
    await waitFor(() => {
      expect(screen.getByText(/handle must start with @/i)).toBeInTheDocument();
    });
  });

  test('validates follower count', async () => {
    renderWithChakra(<SocialMediaForm onSubmit={jest.fn()} />);
    
    const user = userEvent.setup();
    const followersInput = screen.getByLabelText(/followers/i);
    
    await user.type(followersInput, '-1');
    await user.tab();
    
    await waitFor(() => {
      expect(screen.getByText(/followers must be positive/i)).toBeInTheDocument();
    });
  });

  test('adds new platform', async () => {
    renderWithChakra(<SocialMediaForm onSubmit={jest.fn()} />);
    
    const user = userEvent.setup();
    const addButton = screen.getByText(/add platform/i);
    
    await user.click(addButton);
    
    expect(screen.getAllByLabelText(/platform/i)).toHaveLength(2);
  });

  test('handles form submission', async () => {
    const mockOnSubmit = jest.fn();
    renderWithChakra(<SocialMediaForm onSubmit={mockOnSubmit} />);
    
    const user = userEvent.setup();
    
    // Fill form
    await user.selectOptions(screen.getByLabelText(/platform/i), 'instagram');
    await user.type(screen.getByLabelText(/handle/i), '@testuser');
    await user.type(screen.getByLabelText(/followers/i), '1000');
    
    // Submit form
    await user.click(screen.getByRole('button', { name: /save/i }));
    
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        platforms: [
          { platform: 'instagram', handle: '@testuser', followers: 1000 }
        ]
      });
    });
  });
});
```

```javascript
// CREATE frontend/src/components/social-media-modal.test.jsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChakraProvider } from '@chakra-ui/react';
import SocialMediaModal from './social-media-modal';

describe('SocialMediaModal', () => {
  test('renders modal when open', () => {
    renderWithChakra(<SocialMediaModal isOpen={true} onClose={jest.fn()} />);
    
    expect(screen.getByText(/complete your social media profile/i)).toBeInTheDocument();
  });

  test('handles skip functionality', async () => {
    const mockOnSkip = jest.fn();
    renderWithChakra(<SocialMediaModal isOpen={true} onClose={jest.fn()} onSkip={mockOnSkip} />);
    
    const user = userEvent.setup();
    const skipButton = screen.getByText(/skip for now/i);
    
    await user.click(skipButton);
    
    expect(mockOnSkip).toHaveBeenCalled();
  });

  test('handles completion tracking', async () => {
    const mockOnComplete = jest.fn();
    renderWithChakra(<SocialMediaModal isOpen={true} onClose={jest.fn()} onComplete={mockOnComplete} />);
    
    const user = userEvent.setup();
    
    // Fill form and submit
    await user.selectOptions(screen.getByLabelText(/platform/i), 'instagram');
    await user.type(screen.getByLabelText(/handle/i), '@testuser');
    await user.type(screen.getByLabelText(/followers/i), '1000');
    await user.click(screen.getByRole('button', { name: /complete/i }));
    
    await waitFor(() => {
      expect(mockOnComplete).toHaveBeenCalled();
    });
  });
});
```

```bash
# Run and iterate until passing (per cursor rules):
cd frontend && npm test -- --testNamePattern="social"
cd backend && pytest tests/test_social_media.py -v

# Test coverage requirements:
cd frontend && npm test -- --coverage --testNamePattern="social"
cd backend && pytest tests/test_social_media.py --cov=app.api.profile --cov-report=html
```

### Level 3: Integration Test
```bash
# Test the complete user flow:
# 1. New student-athlete signup
# 2. Social media modal appears
# 3. Complete social media profile
# 4. Start new deal creation
# 5. Social media confirmation step
# 6. Update social media data
# 7. Complete deal creation

# Manual test commands:
curl -X GET http://localhost:8000/profile/social-media \
  -H "Authorization: Bearer {token}"

curl -X PUT http://localhost:8000/profile/social-media \
  -H "Content-Type: application/json" \
  -d '{"platforms": [{"platform": "instagram", "handle": "@testuser", "followers": 1000}]}'
```

## Final validation Checklist (per cursor rules)
- [ ] **Project Documentation**: Read PLANNING.md, TASK.md, and supabase-info.md
- [ ] **Database**: Migration files created, never deleted existing ones
- [ ] **Testing**: All tests pass: `npm test && pytest tests/`
- [ ] **Code Quality**: No linting errors: `npm run lint && ruff check`
- [ ] **Type Safety**: No type errors: `mypy app/`
- [ ] **Security**: No sensitive data logged, user permissions validated
- [ ] **NIL Compliance**: Social media data properly tracked for compliance
- [ ] **Component Size**: No React components over 300 lines
- [ ] **Context Patterns**: Extended existing AuthContext/DealContext appropriately
- [ ] **API Standards**: RESTful endpoints with proper HTTP status codes
- [ ] **UI Consistency**: Chakra UI components used consistently
- [ ] **Error Handling**: Graceful degradation and user-friendly error messages
- [ ] **Performance**: Loading states for operations >500ms
- [ ] **File Naming**: kebab-case for files, PascalCase for components
- [ ] **Social Media Features**:
  - [ ] Social media modal appears after signup
  - [ ] Deal creation includes social media confirmation
  - [ ] Profile editing includes social media fields
  - [ ] Database migrations apply cleanly
  - [ ] API endpoints respond correctly
  - [ ] Frontend validation works properly

---

## Anti-Patterns to Avoid (per cursor rules)
- ❌ **Don't create separate database for social media** - extend existing profile system
- ❌ **Don't skip validation because "social media is optional"** - enforce data quality
- ❌ **Don't ignore existing form patterns** - follow component composition from `frontend/src/components/forms/`
- ❌ **Don't hardcode social media platforms** - make them configurable
- ❌ **Don't break existing deal creation flow** - insert seamlessly
- ❌ **Don't forget to update step numbering throughout deal wizard** - maintain consistency
- ❌ **Don't cache social media data** - always fetch fresh for deal creation
- ❌ **Don't create new Context patterns** - extend existing AuthContext/DealContext
- ❌ **Don't log sensitive data** - no personal info, financial data, or auth tokens
- ❌ **Don't create components over 300 lines** - refactor at that point
- ❌ **Don't ignore NIL compliance requirements** - consider NCAA and state regulations
- ❌ **Don't use non-standard HTTP status codes** - follow RESTful patterns
- ❌ **Don't forget loading and error states** - implement for all data fetching
- ❌ **Don't use inconsistent naming** - kebab-case files, PascalCase components
- ❌ **Don't skip proper error handling** - graceful degradation required
- ❌ **Don't delete existing migration files** - only add new ones
- ❌ **Don't mock data for dev/prod** - only for tests 