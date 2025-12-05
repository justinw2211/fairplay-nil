# Backend Architecture & Frontend Integration

## Overview

FairPlay NIL uses a **FastAPI backend** (Python) deployed on **Render** that connects to a **Supabase PostgreSQL database**. The **React frontend** (Vite) deployed on **Vercel** communicates with the backend via REST API calls using Supabase JWT tokens for authentication.

---

## Backend Structure

### Core Application (`backend/app/main.py`)

**FastAPI Application Setup:**
- **Lifespan Management**: Initializes rate limiter (Redis) and cache system on startup
- **CORS Configuration**: Regex-based origin matching for Vercel preview deployments
- **Middleware Stack** (in order):
  1. **Error Handling Middleware** - Catches all unhandled exceptions
  2. **Rate Limiting Middleware** - Redis-based rate limiting
  3. **Metrics Middleware** - Performance tracking and error rate monitoring
  4. **CORS Middleware** - Handles cross-origin requests

**API Routers:**
- `/api/profile` - Profile management endpoints
- `/api/deals` - Deal management endpoints  
- `/api/errors` - Client-side error reporting

**Monitoring Endpoints:**
- `/health` - Basic health check
- `/health/comprehensive` - Full service health check
- `/metrics` - Database performance metrics
- `/metrics/performance` - Request performance metrics
- `/metrics/prometheus` - Prometheus-format metrics
- `/monitoring/dashboard` - Monitoring dashboard data
- `/cache/stats` - Cache performance statistics

---

## API Endpoints

### Profile API (`backend/app/api/profile.py`)

**GET `/api/profile`**
- Returns user profile with division enum mapping (I → "Division I")
- Uses cached profile data for performance
- Requires authentication via `get_user_id` dependency

**PUT `/api/profile`**
- Updates user profile
- Validates and sanitizes input via `validate_request_data`
- Converts frontend division format ("Division I") to database enum ("I")
- Invalidates cache after update

**GET `/api/schools`**
- Returns all schools, optionally filtered by division
- Uses cached school data
- No authentication required

**GET `/api/social-media`**
- Returns all social media platforms for authenticated user
- Requires authentication

**PUT `/api/social-media`**
- Updates social media platforms (replaces all existing)
- Validates platform data (handle format, followers, etc.)
- Sets `social_media_completed` flag on profile
- Requires authentication

**DELETE `/api/social-media/{platform}`**
- Deletes specific social media platform
- Validates platform name
- Requires authentication

---

### Deals API (`backend/app/api/deals.py`)

**POST `/api/deals`**
- Creates new draft deal
- Accepts optional `deal_type` in request body (defaults to 'simple')
- Validates deal type against `DealTypeEnum`
- Returns `DealCreateResponse` with deal ID and status
- Requires authentication

**PUT `/api/deals/{deal_id}`**
- Updates deal with comprehensive validation
- **Key Features:**
  - Auto-calculates `deal_duration_total_months` from years + months
  - Auto-sets `social_media_confirmed_at` when `social_media_confirmed` is True
  - Computes `fmv` (Fair Market Value) server-side when compensation fields change
  - Validates file metadata (type, size)
  - Sanitizes all input data
- Invalidates deal cache after update
- Requires authentication + ownership verification

**GET `/api/deals/{deal_id}`**
- Returns specific deal with all fields
- Computes FMV dynamically for response
- Requires authentication + ownership verification

**GET `/api/deals`**
- Paginated deal listing with filtering and sorting
- **Query Parameters:**
  - `page` (default: 1)
  - `limit` (default: 20, max: 100)
  - `status` (optional filter)
  - `deal_type` (optional filter)
  - `sort_by` (created_at, fmv, compensation_cash)
  - `sort_order` (asc, desc)
- Returns deals with joined profile data for analytics
- Computes FMV for each deal in response
- Uses caching for performance
- Requires authentication

**DELETE `/api/deals/{deal_id}`**
- Deletes deal (with ownership verification)
- Requires authentication + ownership verification

**PUT `/api/deals/{deal_id}/clearinghouse-prediction`**
- Stores clearinghouse prediction results
- Updates `clearinghouse_prediction` JSONB field
- Requires authentication + ownership verification

**PUT `/api/deals/{deal_id}/valuation-prediction`**
- Stores valuation prediction results
- Updates `valuation_prediction` JSONB field
- Auto-sets `fmv` from `estimated_fmv` in prediction
- Requires authentication + ownership verification

**GET `/api/deals/{deal_id}/prediction/{prediction_type}`**
- Retrieves prediction data (clearinghouse or valuation)
- Requires authentication + ownership verification

---

### Errors API (`backend/app/api/errors.py`)

**POST `/api/errors`**
- Receives client-side error reports
- Logs errors securely (sanitizes sensitive data)
- Returns error ID for tracking
- No authentication required (public endpoint)

---

## Authentication Flow

### Frontend → Backend

1. **User Authentication**: Frontend uses Supabase Auth (`AuthContext`)
2. **Token Retrieval**: Frontend gets session token via `supabase.auth.getSession()`
3. **API Calls**: Frontend includes token in `Authorization: Bearer {token}` header
4. **Backend Validation**: `get_user_id` dependency in `dependencies.py`:
   - Decodes JWT token (without signature verification - Supabase handles that)
   - Extracts `user_id` from `sub` claim
   - Checks token expiration (returns 401 if expiring within 5 minutes)
   - Returns user ID for use in endpoints

### Token Expiration Handling

- Backend checks if token expires within 5 minutes
- Returns `401 Unauthorized` with `X-Token-Expired: true` header
- Frontend should refresh token and retry request

---

## Database Layer (`backend/app/database.py`)

### DatabaseClient Class

**Singleton Pattern**: Single instance shared across application

**Key Methods:**

- `get_profile_cached(user_id)` - Get profile with caching
- `get_schools_cached(division)` - Get schools with caching
- `get_deals_paginated_with_profile(...)` - Paginated deals with profile join
- `update_profile_with_cache_invalidation(...)` - Update profile + invalidate cache
- `update_deal_with_cache_invalidation(...)` - Update deal + invalidate cache
- `execute_with_monitoring(...)` - Query execution with performance tracking

**Performance Monitoring:**
- Tracks query duration, slow queries, error rates
- Logs queries taking >1 second
- Provides performance statistics via `/metrics` endpoint

**Caching Strategy:**
- Profile data: Cached per user
- Schools data: Cached by division
- Deals data: Cached with pagination/filter parameters
- Cache invalidation on updates

---

## Data Validation & Sanitization

### Validation Middleware (`backend/app/middleware/validation.py`)

**InputValidator Class:**
- **Security Checks**: Detects XSS, SQL injection, command injection attempts
- **Data Sanitization**: HTML escapes strings, normalizes whitespace
- **Field Validation**: Email, phone, numeric ranges, file uploads
- **Type-Specific Validation**:
  - `validate_deal_data()` - Deal-specific rules
  - `validate_profile_data()` - Profile-specific rules
  - `validate_social_media_data()` - Social media rules

**Validation Flow:**
1. Request data received
2. `validate_request_data(data, data_type)` called
3. Type-specific validator runs
4. Security checks performed
5. Data sanitized
6. Validated data returned (or ValidationError/SecurityError raised)

---

## Error Handling

### Error Handling Middleware (`backend/app/middleware/error_handling.py`)

**Features:**
- Catches all unhandled exceptions
- Sanitizes error messages (removes sensitive data)
- Generates unique error IDs for tracking
- Returns standardized error responses
- Logs errors securely (no sensitive data in logs)

**Error Response Format:**
```json
{
  "error": "Internal server error",
  "detail": "An unexpected error occurred...",
  "timestamp": "2025-01-XX...",
  "error_id": "error_20250101_123456_12345"
}
```

---

## Frontend Integration

### API Call Pattern

**Standard Pattern:**
```javascript
// 1. Get session token
const sessionRes = await supabase.auth.getSession();
const token = sessionRes.data.session?.access_token;

// 2. Make API call with token
const response = await fetch(`${import.meta.env.VITE_API_URL}/api/endpoint`, {
  method: 'GET|POST|PUT|DELETE',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify(data) // for POST/PUT
});

// 3. Handle response
if (!response.ok) {
  const errorData = await response.json();
  throw new Error(errorData.detail || `HTTP ${response.status}`);
}

const data = await response.json();
```

### Frontend Hooks

**useProfile** (`frontend/src/hooks/useProfile.js`):
- Fetches profile directly from Supabase (not via backend API)
- Uses localStorage caching (5-minute TTL)
- Handles division enum mapping
- Formats profile data for display

**useSocialMedia** (`frontend/src/hooks/use-social-media.js`):
- Uses backend API (`/api/social-media`)
- Handles CRUD operations
- Validates data before submission
- Formats follower counts for display

**DealContext** (`frontend/src/context/DealContext.jsx`):
- Uses backend API (`/api/deals`)
- Handles deal creation, updates, fetching
- Manages deal state
- Includes Sentry error tracking

### Environment Configuration

**Frontend** (`frontend/src/config/environment.js`):
- Centralized environment config
- API URL: `VITE_API_URL` (from Vercel environment variables)
- Supabase: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- Sentry: `VITE_SENTRY_DSN`

**Backend**:
- Supabase: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
- Redis: `REDIS_URL` (for rate limiting)
- Environment: `ENVIRONMENT` (development/production)

---

## Data Flow Examples

### Profile Update Flow

1. **Frontend**: User updates profile in form
2. **Frontend**: `useProfile` hook calls Supabase directly (not backend API)
3. **Supabase**: Updates `profiles` table
4. **Frontend**: Cache invalidated, profile refetched

### Deal Creation Flow

1. **Frontend**: User clicks "Create Deal"
2. **Frontend**: `DealContext.createDraftDeal()` called
3. **Frontend**: POST to `/api/deals` with `deal_type` in body
4. **Backend**: Validates deal type, creates draft deal in database
5. **Backend**: Returns `DealCreateResponse` with deal ID
6. **Frontend**: Adds deal to state, navigates to deal wizard

### Deal Update Flow

1. **Frontend**: User updates deal in wizard
2. **Frontend**: `DealContext.updateDeal(dealId, updates)` called
3. **Frontend**: PUT to `/api/deals/{dealId}` with update data
4. **Backend**: 
   - Validates and sanitizes input
   - Auto-calculates derived fields (duration, FMV)
   - Updates database
   - Invalidates cache
5. **Backend**: Returns updated deal
6. **Frontend**: Updates deal in state

### Social Media Update Flow

1. **Frontend**: User updates social media platforms
2. **Frontend**: `useSocialMedia.updateSocialMedia()` called
3. **Frontend**: PUT to `/api/social-media` with platforms array
4. **Backend**:
   - Validates platform data
   - Deletes existing platforms for user
   - Inserts new platforms
   - Sets `social_media_completed` flag on profile
5. **Backend**: Returns updated platforms
6. **Frontend**: Updates UI

---

## Key Design Patterns

### 1. Division Enum Mapping

**Database**: Stores enum values (`'I'`, `'II'`, `'III'`, `'NAIA'`, `'JUCO'`)
**Frontend**: Displays formatted values (`'Division I'`, `'Division II'`, etc.)

**Mapping Locations:**
- Backend: `profile.py` (GET/PUT endpoints)
- Frontend: `useProfile.js`, form components

### 2. FMV Calculation

**Server-Side Computation**: FMV calculated on backend when:
- Compensation fields updated
- Deal type changed
- Valuation prediction stored

**Calculation Logic** (`deals.py`):
- **Valuation deals**: Uses `valuation_prediction.estimated_fmv`
- **Other deals**: Sums `compensation_cash + compensation_goods + compensation_other`

### 3. Cache Invalidation

**Strategy**: Invalidate related cache on updates
- Profile update → invalidate user profile cache
- Deal update → invalidate user's deal list cache
- Social media update → invalidate profile cache

### 4. Transaction Safety

**Database Transactions**: Used for:
- Deal creation (ensures atomicity)
- Deal deletion (verifies ownership before delete)

---

## Security Features

1. **Input Sanitization**: All user input sanitized (XSS prevention)
2. **SQL Injection Prevention**: Parameterized queries via Supabase
3. **Authentication**: JWT token validation on all protected endpoints
4. **Authorization**: User ownership verification for deal operations
5. **Sensitive Data Filtering**: Error logs sanitized (no passwords, tokens, etc.)
6. **Rate Limiting**: Redis-based rate limiting middleware
7. **CORS**: Regex-based origin validation

---

## Performance Optimizations

1. **Caching**: Redis cache for profiles, schools, deals
2. **Query Optimization**: Selective field queries (not `SELECT *`)
3. **Pagination**: Efficient pagination with count queries
4. **Connection Pooling**: Supabase client handles connection pooling
5. **Performance Monitoring**: Tracks slow queries (>1 second)

---

## Monitoring & Observability

1. **Health Checks**: `/health`, `/health/comprehensive`
2. **Metrics**: `/metrics`, `/metrics/performance`, `/metrics/prometheus`
3. **Error Tracking**: Sentry integration (frontend), error logging (backend)
4. **Performance Stats**: Query performance tracking
5. **Cache Stats**: Cache hit/miss rates

---

## Deployment

**Backend**: Render (FastAPI)
**Frontend**: Vercel (React + Vite)
**Database**: Supabase (PostgreSQL)
**Cache**: Redis (via Render)
**Error Tracking**: Sentry

**Environment Variables**:
- Backend: Set in Render dashboard
- Frontend: Set in Vercel dashboard

---

## Key Files Reference

**Backend:**
- `backend/app/main.py` - FastAPI app setup
- `backend/app/api/profile.py` - Profile endpoints
- `backend/app/api/deals.py` - Deal endpoints
- `backend/app/database.py` - Database client
- `backend/app/dependencies.py` - Authentication
- `backend/app/schemas.py` - Pydantic models
- `backend/app/middleware/validation.py` - Input validation
- `backend/app/middleware/error_handling.py` - Error handling

**Frontend:**
- `frontend/src/context/DealContext.jsx` - Deal state management
- `frontend/src/hooks/useProfile.js` - Profile hook
- `frontend/src/hooks/use-social-media.js` - Social media hook
- `frontend/src/config/environment.js` - Environment config
- `frontend/src/context/AuthContext.jsx` - Authentication



