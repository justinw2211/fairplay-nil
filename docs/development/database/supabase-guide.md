# 🗄️ FairPlay NIL - Supabase Database Documentation

**⚠️ IMPORTANT: Only add to this file when information is 100% verified fact**  
**🔍 Check this file to understand the current database structure before making changes**  
**📝 Update this file after all database updates. I will push updates using raw SQL in Supabase**

## 📋 Table of Contents

- [Database Overview](#database-overview)
- [Database Management with MCP Tools](#database-management-with-mcp-tools)
- [Core Tables](#core-tables)
- [Relationships](#relationships)
- [Common Query Patterns](#common-query-patterns)
- [Business Rules & Validation](#business-rules--validation)
- [Performance Considerations](#performance-considerations)
- [Migration History](#migration-history)
- [Authentication Integration](#authentication-integration)
- [API Integration Notes](#api-integration-notes)
- [Data Sensitivity & Security](#data-sensitivity--security)
- [Recent Updates](#recent-updates)
- [MCP Integration](#mcp-integration)

## 🏗️ Database Overview

**Database Type:** PostgreSQL via Supabase  
**Authentication:** Supabase Auth integration  
**Migration System:** Custom migration files in `backend/migrations/`

**⚠️ CRITICAL DEPLOYMENT REQUIREMENT:** 
- **Supabase Python Library:** Must use `supabase>=2.16.0` 
- **Known Issue:** Versions 1.0.3 and earlier have critical initialization bugs causing `AttributeError: 'dict' object has no attribute 'headers'`
- **Dependencies:** When upgrading supabase library, also update httpx, typing-extensions, pydantic, anyio, aioredis (see [cursor-rules.mdc](../../../.cursor/rules/cursor-rules.mdc) for specific versions)

## 🔧 Database Management with MCP Tools

### Using Supabase MCP for Database Checks

Before making any database changes, always check the current state using the Supabase MCP tools:

#### 1. Check Current Table Structure
```bash
# Use the MCP tool to list all tables and their structure
mcp_supabase_list_tables --schemas public
```

#### 2. Check Existing Indexes
```sql
-- Query to check current indexes
SELECT 
    indexname,
    tablename,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public' 
AND indexname LIKE 'idx_%'
ORDER BY indexname;
```

#### 3. Check Applied Migrations
```bash
# Use the MCP tool to list all migrations
mcp_supabase_list_migrations
```

#### 4. Execute Test Queries
```bash
# Use the MCP tool to run test queries
mcp_supabase_execute_sql --query "SELECT COUNT(*) FROM deals WHERE status = 'draft';"
```

### Pre-Update Checklist

Before applying any database changes:

1. **✅ Check current schema** - Use `mcp_supabase_list_tables`
2. **✅ Verify existing indexes** - Query `pg_indexes` table
3. **✅ Test current queries** - Run performance tests
4. **✅ Backup if needed** - For major schema changes
5. **✅ Apply changes** - Execute migration
6. **✅ Verify changes** - Check new indexes/structure
7. **✅ Test performance** - Run before/after comparisons

### Post-Update Verification

After applying database changes:

1. **✅ Verify indexes created** - Check `pg_indexes` table
2. **✅ Test query performance** - Run EXPLAIN ANALYZE
3. **✅ Check application functionality** - Test all features
4. **✅ Monitor for errors** - Watch application logs
5. **✅ Update documentation** - Keep this file current

### Common MCP Commands for Database Management

```bash
# Check table structure
mcp_supabase_list_tables

# Execute SQL queries
mcp_supabase_execute_sql --query "SELECT * FROM deals LIMIT 5;"

# Check for performance issues
mcp_supabase_get_advisors --type performance

# Check for security issues
mcp_supabase_get_advisors --type security

# Get project information
mcp_supabase_get_project_url
mcp_supabase_get_anon_key

# Generate TypeScript types
mcp_supabase_generate_typescript_types
```

### Performance Monitoring

Use these queries to monitor database performance:

```sql
-- Check index usage
SELECT 
    schemaname, 
    tablename, 
    indexname, 
    idx_tup_read, 
    idx_tup_fetch 
FROM pg_stat_user_indexes 
WHERE schemaname = 'public' 
ORDER BY idx_tup_read DESC;

-- Check slow queries
SELECT 
    query, 
    calls, 
    total_time, 
    mean_time 
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;
```

## 📊 Core Tables

### 1. `profiles` Table
**Purpose:** Store user information for all platform users (athletes, brands, collectives, universities)

| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| `id` | UUID | Primary key, linked to Supabase auth.users | NOT NULL, PRIMARY KEY |
| `full_name` | TEXT | User's full name | |
| `role` | TEXT | User type: 'athlete', 'brand', 'collective', 'university' | |
| `avatar_url` | TEXT | Profile picture URL | |
| `university` | TEXT | University name (text field) | |
| `sports` | ARRAY | Array of sports (for athletes) | |
| `division` | TEXT | NCAA division (I, II, III, NAIA, JUCO) | |
| `gender` | TEXT | Athlete gender (affects sport filtering) | |
| `email` | TEXT | User email address | |
| `phone` | TEXT | Formatted phone number | |
| `school_id` | INTEGER | Foreign key to schools table | |
| `social_media_completed` | BOOLEAN | Whether user has completed social media setup | DEFAULT false |
| `social_media_completed_at` | TIMESTAMP WITH TIME ZONE | When social media setup was completed | |

**Relationships:**
- `profiles.id` → `auth.users.id` (Foreign Key)
- `profiles.school_id` → `schools.id` (Foreign Key)
- `profiles.id` ← `social_media_platforms.user_id` (One-to-Many)

### 2. `deals` Table
**Purpose:** Store NIL deal information with single user (athlete) per deal

| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| `id` | BIGINT | Primary key, auto-generated identity | NOT NULL, PRIMARY KEY, GENERATED ALWAYS AS IDENTITY |
| `created_at` | TIMESTAMP WITH TIME ZONE | Deal creation timestamp | DEFAULT timezone('utc', now()) |
| `user_id` | UUID | Foreign key to profiles table (athlete) | References profiles(id) |
| `status` | TEXT | Deal status | DEFAULT 'draft', CHECK: 'draft', 'submitted', 'approved', 'rejected' |
| `deal_nickname` | TEXT | Deal title/name | |
| `compensation_cash` | NUMERIC | Cash compensation amount | |
| `fmv` | NUMERIC | Fair market value | |
| `compensation_goods` | JSONB | Array of goods/products compensation | DEFAULT '[]' |
| `compensation_other` | JSONB | Array of other compensation types | DEFAULT '[]' |
| `payor_name` | TEXT | Name of paying entity | |
| `contact_name` | TEXT | Primary contact name | |
| `contact_email` | TEXT | Primary contact email | |
| `contact_phone` | TEXT | Primary contact phone | |
| `is_group_deal` | BOOLEAN | Whether this is a group deal | DEFAULT false |
| `is_paid_to_llc` | BOOLEAN | Whether payment goes to LLC | DEFAULT false |
| `uses_school_ip` | BOOLEAN | Whether deal uses school intellectual property | |
| `grant_exclusivity` | TEXT | Exclusivity terms | |
| `licenses_nil` | TEXT | NIL licensing details | |
| `obligations` | JSONB | Deal obligations and requirements | DEFAULT '{}' |
| `activities` | JSONB | Array of selected activities | DEFAULT '[]' |
| `deal_terms_url` | TEXT | URL to deal terms document | |
| `deal_terms_file_name` | TEXT | Original filename of uploaded terms | |
| `deal_terms_file_type` | TEXT | File type of uploaded terms | CHECK: 'pdf', 'docx', 'png', 'jpg', 'jpeg' |
| `deal_terms_file_size` | BIGINT | File size in bytes | |
| `athlete_social_media` | JSONB | Snapshot of athlete's social media at deal creation | |
| `social_media_confirmed` | BOOLEAN | Whether athlete confirmed social media for this deal | DEFAULT false |
| `social_media_confirmed_at` | TIMESTAMP WITH TIME ZONE | When social media was confirmed for this deal | |

**Relationships:**
- `deals.user_id` → `profiles.id` (Foreign Key)

### 3. `schools` Table
**Purpose:** Store NCAA and other educational institutions

| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| `id` | INTEGER | Primary key, auto-generated sequence | NOT NULL, PRIMARY KEY |
| `name` | TEXT | School name | NOT NULL |
| `division` | ncaa_division | NCAA division type (custom enum) | NOT NULL, Values: 'I', 'II', 'III', 'NAIA', 'JUCO' |
| `created_at` | TIMESTAMP WITH TIME ZONE | Record creation timestamp | DEFAULT timezone('utc', now()) |
| `updated_at` | TIMESTAMP WITH TIME ZONE | Last update timestamp | DEFAULT timezone('utc', now()) |

**Current School Counts (as of recent update):**
- Division I: 325 schools
- Division II: 127 schools  
- Division III: 86 schools
- NAIA: 71 schools
- JUCO: 101 schools
- **Total: 710 schools**

### 4. `social_media_platforms` Table
**Purpose:** Store athlete social media platform information for NIL compliance and deal valuation

| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| `id` | INTEGER | Primary key, auto-generated sequence | NOT NULL, PRIMARY KEY |
| `user_id` | UUID | Foreign key to profiles table | NOT NULL, References profiles(id) ON DELETE CASCADE |
| `platform` | TEXT | Social media platform type | NOT NULL, CHECK: 'instagram', 'twitter', 'tiktok', 'youtube', 'facebook' |
| `handle` | TEXT | Platform handle/username | NOT NULL, CHECK: matches '^@[a-zA-Z0-9_]+$' |
| `followers` | INTEGER | Current follower/subscriber count | DEFAULT 0, CHECK: followers >= 0 |
| `verified` | BOOLEAN | Whether account is verified on platform | DEFAULT false |
| `created_at` | TIMESTAMP WITH TIME ZONE | Record creation timestamp | DEFAULT timezone('utc', now()) |
| `updated_at` | TIMESTAMP WITH TIME ZONE | Last update timestamp | DEFAULT timezone('utc', now()) |

**Unique Constraints:**
- `(user_id, platform)` - One platform per user

**Relationships:**
- `social_media_platforms.user_id` → `profiles.id` (Foreign Key with CASCADE DELETE)

**Indexes:**
- `idx_social_media_user_id` - Foreign key index for user queries
- `idx_social_media_platform` - Platform type filtering
- `idx_social_media_followers` - Follower count ordering

## ⚠️ CRITICAL: Database-Frontend Mapping Patterns

### NCAA Division Enum Mapping
**Database Storage:** The `ncaa_division` enum stores values as: `'I'`, `'II'`, `'III'`, `'NAIA'`, `'JUCO'`  
**Frontend Display:** The UI shows: `'Division I'`, `'Division II'`, `'Division III'`, `'NAIA'`, `'JUCO'`

**⚠️ CRITICAL REQUIREMENT:** Always implement bidirectional mapping between database enum values and frontend display values:

```javascript
// Convert display to database enum (for form submission)
const mapDisplayToEnum = (displayValue) => {
  const mapping = {
    'Division I': 'I',
    'Division II': 'II', 
    'Division III': 'III',
    'NAIA': 'NAIA',
    'JUCO': 'JUCO'
  };
  return mapping[displayValue] || displayValue;
};

// Convert database enum to display (for loading data)
const mapEnumToDisplay = (enumValue) => {
  const mapping = {
    'I': 'Division I',
    'II': 'Division II',
    'III': 'Division III', 
    'NAIA': 'NAIA',
    'JUCO': 'JUCO'
  };
  return mapping[enumValue] || enumValue;
};
```

**Files requiring division mapping:**
- `frontend/src/pages/EditProfile.jsx`
- `frontend/src/pages/SignUp.jsx`
- Any other forms that handle division selection

**Error Prevention:** Failure to implement this mapping will cause SQL errors like:
`invalid input value for enum ncaa_division: "Division III"`

## 📄 JSONB Field Structures

### `deals.activities` JSONB Structure (Array)
```json
[
  {
    "type": "social_media",
    "platforms": ["instagram", "twitter", "tiktok"],
    "post_count": 5,
    "requirements": "Brand mention in caption"
  },
  {
    "type": "endorsements",
    "details": "product_endorsement",
    "duration": "6 months"
  },
  {
    "type": "appearances",
    "event_count": 2,
    "location": "campus events"
  }
]
```

### `deals.compensation_goods` JSONB Structure (Array)
```json
[
  {
    "item": "Athletic apparel",
    "quantity": 10,
    "estimated_value": 500
  },
  {
    "item": "Equipment",
    "description": "Custom branded gear",
    "estimated_value": 300
  }
]
```

### `deals.compensation_other` JSONB Structure (Array)
```json
[
  {
    "type": "services",
    "description": "Personal training sessions",
    "estimated_value": 1000
  },
  {
    "type": "experiences",
    "description": "VIP event access",
    "estimated_value": 250
  }
]
```

### `deals.obligations` JSONB Structure (Object)
```json
{
  "deliverables": [
    "5 Instagram posts per month",
    "2 campus appearances",
    "Product endorsement video"
  ],
  "timeline": "6 months",
  "compliance_requirements": [
    "University approval required",
    "State disclosure filing"
  ],
  "restrictions": [
    "No competing brand endorsements",
    "No inappropriate content"
  ]
}
```

### `deals.athlete_social_media` JSONB Structure (Array)
```json
[
  {
    "platform": "instagram",
    "handle": "@athlete_username",
    "followers": 15000,
    "verified": false
  },
  {
    "platform": "tiktok", 
    "handle": "@athlete_tiktok",
    "followers": 25000,
    "verified": true
  },
  {
    "platform": "twitter",
    "handle": "@athlete_twitter", 
    "followers": 8500,
    "verified": false
  }
]
```

## 🔗 Relationships

```
auth.users --< profiles --< deals
            |         \
            |          --< social_media_platforms
            v
          schools
```

**Key Relationship Notes:**
- **One-to-many:** Each profile (athlete) can have multiple deals
- **One-to-many:** Each profile can have multiple social media platforms (max 5)
- **Single-sided:** Deals are athlete-centric (no direct brand profile link)
- **School Association:** Profiles linked to schools via integer ID
- **Social Media Cascade:** Deleting a profile removes all associated social media platforms

## 🔍 Common Query Patterns

### 1. Get Athlete Profile with School Info
```sql
SELECT p.*, s.name as school_name, s.division
FROM profiles p
LEFT JOIN schools s ON p.school_id = s.id
WHERE p.id = $1 AND p.role = 'athlete';
```

### 2. Get All Deals for an Athlete
```sql
SELECT d.*, p.full_name as athlete_name
FROM deals d
JOIN profiles p ON d.user_id = p.id
WHERE d.user_id = $1
ORDER BY d.created_at DESC;
```

### 3. Get Deals by Status
```sql
SELECT d.*, p.full_name as athlete_name, p.university
FROM deals d
JOIN profiles p ON d.user_id = p.id
WHERE d.status = $1
ORDER BY d.created_at DESC;
```

### 4. Search Schools by Division
```sql
SELECT * FROM schools 
WHERE division = $1 
  AND name ILIKE '%' || $2 || '%'
ORDER BY name;
```

### 5. Get Deal Financial Summary
```sql
SELECT 
  d.id,
  d.deal_nickname,
  d.compensation_cash,
  d.fmv,
  d.compensation_goods,
  d.compensation_other,
  p.full_name as athlete_name
FROM deals d
JOIN profiles p ON d.user_id = p.id
WHERE d.status = 'approved'
ORDER BY d.compensation_cash DESC NULLS LAST;
```

### 6. Get Athlete with Social Media Platforms
```sql
SELECT 
  p.id,
  p.full_name,
  p.university,
  COALESCE(json_agg(
    json_build_object(
      'platform', smp.platform,
      'handle', smp.handle,
      'followers', smp.followers,
      'verified', smp.verified
    ) ORDER BY smp.followers DESC
  ) FILTER (WHERE smp.id IS NOT NULL), '[]'::json) as social_media_platforms
FROM profiles p
LEFT JOIN social_media_platforms smp ON p.id = smp.user_id
WHERE p.id = $1
GROUP BY p.id, p.full_name, p.university;
```

### 7. Get Top Athletes by Social Media Following
```sql
SELECT 
  p.full_name,
  p.university,
  SUM(smp.followers) as total_followers,
  COUNT(smp.id) as platform_count,
  array_agg(smp.platform ORDER BY smp.followers DESC) as platforms
FROM profiles p
JOIN social_media_platforms smp ON p.id = smp.user_id
WHERE p.role = 'athlete'
GROUP BY p.id, p.full_name, p.university
HAVING COUNT(smp.id) > 0
ORDER BY total_followers DESC
LIMIT 50;
```

### 8. Get Deal with Social Media Snapshot
```sql
SELECT 
  d.id,
  d.deal_nickname,
  d.athlete_social_media,
  d.social_media_confirmed,
  d.social_media_confirmed_at,
  p.full_name as athlete_name
FROM deals d
JOIN profiles p ON d.user_id = p.id
WHERE d.id = $1;
```

## 📋 Business Rules & Validation

### Profile Validation
- **Athletes:** Should have school_id, sports[], division, and gender
- **All Users:** Must have full_name and role
- **Contact Info:** Email and phone for communication

### Deal Validation
- **Status Flow:** draft → submitted → approved/rejected
- **Required Fields:** user_id, deal_nickname, at least one form of compensation
- **File Uploads:** deal_terms files must be approved formats (pdf, docx, png, jpg, jpeg)
- **Compensation:** Must have either cash, goods, or other compensation specified
- **Activities:** Must have at least one activity selected

### Deal Status Meanings
- **draft:** Deal being created/edited by athlete
- **submitted:** Deal submitted for review
- **approved:** Deal approved and active
- **rejected:** Deal rejected and inactive

## ⚡ Performance Considerations

### Indexes
- `profiles.id` - Primary key (UUID)
- `profiles.role` - For user type filtering
- `profiles.school_id` - Foreign key index
- `deals.user_id` - Foreign key index (most important for queries)
- `deals.status` - For status-based filtering
- `deals.created_at` - For chronological ordering
- `schools.name` - For school search
- `schools.division` - For division filtering

### JSONB Optimization
- Use GIN indexes on JSONB fields for complex queries
- Query specific JSONB keys using `->` and `->>`
- Consider extracted computed columns for frequently queried JSONB properties

## 📚 Migration History

| Migration | Description | Key Changes |
|-----------|-------------|-------------|
| 000 | Initial setup | Basic table structure |
| 001 | Schema updates | Added profile fields |
| 002 | Schema cleanup | Removed unused fields |
| 003 | Profile trigger | Auto-update timestamps |
| 004 | Profile fields | Added sports, division, gender |
| 005 | Sports field update | Modified sports array structure |
| 006 | Contact fields | Added phone number support |
| 007 | Schools table | Added NCAA schools support |
| 008-011 | School data | Populated schools in batches |
| 012 | Complete schools | Added NAIA/JUCO + remaining schools |
| 013 | Social media fields | Added social_media_platforms table and deal social media tracking |

## 🔐 Authentication Integration

### Supabase Auth Flow
1. User signs up via Supabase Auth
2. Profile record created with matching UUID
3. Profile.id matches auth.users.id exactly
4. Role-based access control via profiles.role

### RLS (Row Level Security)
- **Profiles:** Users can only read/update their own profile
- **Deals:** Athletes can only access their own deals (deals.user_id = auth.uid())
- **Schools:** Public read access for all users

## 🔌 API Integration Notes

### FastAPI Endpoints
- **Profile Management:** `/api/profile/` routes in `backend/app/api/profile.py`
- **Deal Management:** `/api/deals/` routes in `backend/app/api/deals.py`
- **Social Media Management:** `/api/social-media/` routes in `backend/app/api/profile.py`
  - `GET /api/social-media` - Get user's social media platforms
  - `PUT /api/social-media` - Update user's social media platforms
  - `DELETE /api/social-media/{platform}` - Delete specific platform
- **School Data:** For university suggestions and athlete profiles

### Frontend Integration
- **Supabase Client:** Configured in `frontend/src/supabaseClient.js`
- **Auth Context:** Managed via `frontend/src/context/AuthContext.jsx`
- **Deal Context:** State management via `frontend/src/context/DealContext.jsx`

## 🔒 Data Sensitivity & Security

### Sensitive Data Fields
- **Personal Information:** full_name, email, phone in profiles
- **Financial Data:** compensation_cash, fmv, compensation details in deals
- **Contact Information:** payor contact details in deals
- **File Uploads:** deal_terms documents

### Security Measures
- **Environment Variables:** Database credentials via Supabase environment
- **Input Validation:** Pydantic models for API validation
- **File Upload Security:** Restricted file types and size limits
- **Authentication:** Supabase Auth integration with JWT tokens
- **Data Encryption:** Handled by Supabase PostgreSQL encryption at rest

## 🆕 Recent Updates

### December 2024 - Complete Schools Database Implementation

**Changes Made:**
1. **Extended ncaa_division Enum:**
   - Added 'NAIA' and 'JUCO' values to existing enum ('I', 'II', 'III')
   - Required separate transaction due to PostgreSQL enum constraints

2. **Massive School Data Addition:**
   - **~200+ Division I schools** added to complete NCAA Division I coverage
   - **~127 Division II schools** added for comprehensive D-II coverage
   - **~86 Division III schools** added for major D-III institutions
   - **~71 NAIA schools** added for NAIA coverage
   - **~101 JUCO schools** added for community college coverage

3. **Database Impact:**
   - **Total Schools:** 710 institutions across all divisions
   - **Division I:** 325 schools (near-complete NCAA D-I coverage)
   - **Major Conferences:** All Power 5 and major mid-major conferences included
   - **Geographic Coverage:** Schools from all 50 states and territories

**Business Impact:**
- **University Suggestions:** SignUp and EditProfile now have comprehensive institution coverage
- **Athlete Profiles:** All collegiate levels supported for complete NIL ecosystem
- **Professional Credibility:** Database matches industry standards for collegiate athletics

**Technical Notes:**
- Used `ON CONFLICT (name) DO NOTHING` to prevent duplicate entries
- Enum values committed in separate transaction before school insertions
- No breaking changes to existing application code
- All existing school_id references remain valid

---

**Last Updated:** January 2025  
**Migration Status:** 013_add_social_media_fields.sql (Latest)  
**Schema Version:** Current with all migrations applied including social media functionality  
**Schema Source:** Actual production database export with verified school counts and social media tables

## 🔌 MCP (Model Context Protocol) Integration

### Overview
**Integration Date:** January 2025  
**MCP Server:** Official Supabase MCP Server (`@supabase/mcp-server-supabase@latest`)  
**Configuration:** `~/.cursor/mcp.json` with read-only access to project `izitucbtlygkzncwmsjl`  
**Access Level:** Read-only mode for security (prevents accidental database modifications)

### Available MCP Tools

#### Database Operations
- **`execute_sql`** - Run SQL queries on live database (SELECT operations only)
- **`list_tables`** - Get database table structure and relationships
- **`list_migrations`** - View applied database migrations (currently 13 migrations)
- **`get_advisors`** - Check for security vulnerabilities and performance issues

#### Project Management
- **`get_project_url`** - Retrieve Supabase project API URL
- **`get_anon_key`** - Get anonymous API key for frontend configuration
- **`generate_typescript_types`** - Auto-generate TypeScript types from database schema

#### Development & Debugging
- **`get_logs`** - Debug database and API issues with real-time logs
- **Project scoped access** - Limited to specific project for security

### Current Database Statistics (Live Data)
- **Total Deals:** 69 (all in draft status)
- **Total Schools:** 710 across all NCAA divisions
- **User Profiles:** Active with role-based access control
- **Social Media Platforms:** Integrated with deal creation workflow

### MCP Security Features
- **Read-only mode** - Prevents accidental database modifications
- **Project scoped** - Access limited to specific Supabase project
- **Authentication** - Uses Personal Access Token for secure access
- **Audit trail** - All queries logged for security monitoring

### Common MCP Use Cases
1. **Data Analysis** - Query live data for insights and reporting
2. **Debugging** - Access real-time logs and system status
3. **Schema Validation** - Generate TypeScript types and verify structure
4. **Performance Monitoring** - Check for database performance issues
5. **Development Support** - Real-time data access during development

### MCP Best Practices
- Use for debugging and analysis, not production data modifications
- Query specific data sets rather than entire tables for performance
- Monitor query performance and results
- Use generated TypeScript types to keep frontend in sync with database schema

---

**Integration Status:** ✅ Active and functional  
**Last MCP Test:** January 2025 - Successfully queried deal counts and database structure

---

## 📖 Related Documentation

- [Local Development Guide](../getting-started/local-development.md) - Setup and testing instructions
- [Code Quality Improvements](../code-quality/improvements.md) - Performance and security improvements
- [Deal Wizard Bug Fixes](../../features/deal-wizard/bug-fixes.md) - Recent bug fixes and improvements 