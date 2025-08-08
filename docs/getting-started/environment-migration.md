# Environment Configuration Migration Guide

## Overview

This guide helps you migrate from direct `import.meta.env` access to the centralized environment configuration system.

## Migration Steps

### 1. Import Centralized Config

**Before:**
```javascript
// Direct access (don't use this)
const apiUrl = import.meta.env.VITE_API_URL;
const isDebug = import.meta.env.MODE === 'development';
```

**After:**
```javascript
// Centralized config (use this)
import { getConfig } from './src/config/environment';

const apiUrl = getConfig().apiUrl;
const isDebug = getConfig().debug;
```

### 2. Update API Calls

**Before:**
```javascript
const response = await fetch(`${import.meta.env.VITE_API_URL}/api/deals`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data)
});
```

**After:**
```javascript
import { getConfig } from './src/config/environment';

const response = await fetch(`${getConfig().apiUrl}/api/deals`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data)
});
```

### 3. Update Environment Detection

**Before:**
```javascript
const isDevelopment = import.meta.env.MODE === 'development';
const isProduction = import.meta.env.MODE === 'production';
```

**After:**
```javascript
import { isDevelopment, isProduction } from './src/config/environment';

// Use the imported variables directly
if (isDevelopment) {
  console.log('Development mode');
}
```

### 4. Update Error Tracking

**Before:**
```javascript
const sentryDsn = import.meta.env.VITE_SENTRY_DSN;
const environment = import.meta.env.MODE;
```

**After:**
```javascript
import { errorTrackingConfig } from './src/config/environment';

const sentryDsn = errorTrackingConfig.sentry.dsn;
const environment = errorTrackingConfig.sentry.environment;
```

## Files to Update

### High Priority (Critical)
- `frontend/src/context/DealContext.jsx` - API calls
- `frontend/src/components/DealsTable.jsx` - API calls
- `frontend/src/pages/Dashboard.jsx` - API calls
- `frontend/src/hooks/use-social-media.js` - API calls

### Medium Priority
- `frontend/src/components/ErrorBoundary.jsx` - Error reporting
- `frontend/src/utils/dealWizardErrorReporter.js` - Error reporting
- `frontend/src/utils/logger.js` - Logging

### Low Priority
- `frontend/src/supabaseClient.js` - Supabase config
- `frontend/src/main.jsx` - Sentry config

## Validation

After migration, run validation:

```bash
npm run validate:env
```

This will verify:
- All environment variables are properly configured
- API URLs are valid
- Environment detection works correctly

## Benefits

1. **Consistency** - All code uses the same environment detection
2. **Maintainability** - Environment logic centralized in one place
3. **Reliability** - Proper fallbacks and error handling
4. **Debugging** - Better error messages and validation
5. **Testing** - Easier to mock environment configuration

## Common Issues

### Issue: "getConfig is not a function"

**Solution:** Check import path and ensure file exists
```javascript
// Correct import
import { getConfig } from './src/config/environment';
```

### Issue: Environment not detected correctly

**Solution:** Use the imported environment variables
```javascript
import { isDevelopment, isProduction } from './src/config/environment';
```

### Issue: API calls failing

**Solution:** Verify API URL from centralized config
```javascript
import { getConfig } from './src/config/environment';
console.log('API URL:', getConfig().apiUrl);
```

## Testing

After migration, test:

1. **Local development** - `npm run dev`
2. **Production build** - `npm run build`
3. **Environment validation** - `npm run validate:env`
4. **API connectivity** - Check network requests in dev tools

## Rollback

If issues occur, you can temporarily revert to direct access:

```javascript
// Temporary fallback (not recommended for production)
const apiUrl = getConfig()?.apiUrl || import.meta.env.VITE_API_URL;
```
