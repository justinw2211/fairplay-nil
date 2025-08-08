# Environment Setup Guide

## Overview

FairPlay NIL uses a **centralized environment configuration** system to prevent confusion and ensure consistency across all environments.

## Environment Variables

### Frontend Variables (Vercel)

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `VITE_API_URL` | ✅ | Backend API URL | `https://fairplay-nil-backend.onrender.com` |
| `VITE_SUPABASE_URL` | ✅ | Supabase project URL | `https://izitucbtlygkzncwmsjl.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | ✅ | Supabase anonymous key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `VITE_SENTRY_DSN` | ❌ | Error tracking (optional) | `https://...@o4509759316426752.ingest.us.sentry.io/...` |
| `VITE_APP_VERSION` | ❌ | App version (auto-generated) | `1.0.0` |
| `VITE_BUILD_TIME` | ❌ | Build timestamp (auto-generated) | `2024-01-01T00:00:00.000Z` |

### Backend Variables (Render)

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `SUPABASE_URL` | ✅ | Supabase project URL | `https://izitucbtlygkzncwmsjl.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Supabase service role key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `PORT` | ❌ | Server port (default: 8000) | `8000` |

## Setup Instructions

### 1. Local Development

**Frontend (`.env.local`):**
```bash
# Required
VITE_API_URL=http://localhost:8000
VITE_SUPABASE_URL=https://izitucbtlygkzncwmsjl.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional
VITE_SENTRY_DSN=
VITE_APP_VERSION=1.0.0-dev
VITE_BUILD_TIME=
```

**Backend (`.env`):**
```bash
# Required
SUPABASE_URL=https://izitucbtlygkzncwmsjl.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
PORT=8000
```

**Template:** Copy `frontend/.env.example` to `frontend/.env.local` and update values.

### 2. Production (Vercel)

**Frontend Environment Variables:**
- `VITE_API_URL`: `https://fairplay-nil-backend.onrender.com`
- `VITE_SUPABASE_URL`: `https://izitucbtlygkzncwmsjl.supabase.co`
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `VITE_SENTRY_DSN`: Your Sentry DSN (optional)
- `VITE_APP_VERSION`: Auto-generated
- `VITE_BUILD_TIME`: Auto-generated

### 3. Production (Render)

**Backend Environment Variables:**
- `SUPABASE_URL`: `https://izitucbtlygkzncwmsjl.supabase.co`
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key
- `PORT`: `8000` (or let Render auto-assign)

## Environment Configuration

### ✅ Use Centralized Config

**Correct:**
```javascript
import { getConfig } from './src/config/environment';

const apiUrl = getConfig().apiUrl;
const isDebug = getConfig().debug;
```

**Wrong:**
```javascript
// Don't use direct import.meta.env access
const apiUrl = import.meta.env.VITE_API_URL;
```

**Migration:** See [Environment Migration Guide](environment-migration.md) for step-by-step instructions.

### Environment Detection

The system automatically detects your environment:

- **Development**: `MODE === 'development'`
- **Production**: `MODE === 'production'`
- **Preview**: `VITE_VERCEL_ENV === 'preview'`

## Common Issues

### 1. "Cannot read property of undefined"

**Cause:** Environment variable not set
**Solution:** Check that all required variables are configured

### 2. API calls failing

**Cause:** Wrong API URL
**Solution:** Verify `VITE_API_URL` points to correct backend

### 3. Supabase connection errors

**Cause:** Missing or wrong Supabase credentials
**Solution:** Check `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

### 4. Environment not detected correctly

**Cause:** Using wrong environment variable names
**Solution:** Use centralized config instead of direct access

## Validation

Run environment validation:

```bash
# Check environment configuration
npm run validate:env
```

This will verify:
- All required variables are set
- API URLs are valid
- Supabase connection works
- Environment detection is correct

## Best Practices

1. **Always use centralized config** - Never access `import.meta.env` directly
2. **Set all required variables** - Missing variables cause runtime errors
3. **Use environment-specific values** - Different URLs for dev/staging/prod
4. **Validate before deployment** - Run validation checks
5. **Keep secrets secure** - Never commit `.env` files to git
6. **Use minimal .env files** - Only `.env.local` for local development

## Troubleshooting

### Local Development Issues

```bash
# Check if backend is running
curl http://localhost:8000/

# Check environment variables
cat frontend/.env.local

# Restart development server
npm run dev
```

### Production Issues

1. **Check Vercel environment variables** - Verify all required variables are set
2. **Check Render environment variables** - Verify backend variables are configured
3. **Check Supabase credentials** - Ensure keys are correct and have proper permissions
4. **Check API connectivity** - Verify frontend can reach backend

### Environment Variable Debugging

```javascript
// Add to your component for debugging
import { getConfig, validateEnvironmentConfig } from './src/config/environment';

console.log('Current config:', getConfig());
console.log('Environment validation:', validateEnvironmentConfig());
```
