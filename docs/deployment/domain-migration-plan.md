# Domain Migration Plan: www.fairplaynil.com

## Overview

This document outlines the complete migration plan to add support for the new production domain `www.fairplaynil.com` while maintaining the existing development system and current `fairplay-nil.vercel.app` deployment.

## Current System Analysis

### Vercel Configuration Status ✅
- **Production Environment**: `www.fairplaynil.com` (+4 domains) - **ALREADY CONFIGURED**
- **Environment Variables**: All required variables set across all environments
- **Branch Tracking**: Production tracks `main` branch
- **Preview Environment**: All unassigned git branches
- **Development Environment**: CLI accessible

### Frontend Configuration
- **Current Production Domain**: `fairplay-nil.vercel.app`
- **New Production Domain**: `www.fairplaynil.com` ✅ **CONFIGURED IN VERCEL**
- **Development**: `localhost:3000`
- **Backend API**: `fairplay-nil-backend.onrender.com`

### Key Components Requiring Updates

1. **Backend CORS Configuration** (`backend/app/main.py`) - **PRIORITY 1**
2. **Supabase Authentication Settings** - **PRIORITY 2**
3. **Testing Configuration** (Playwright tests) - **OPTIONAL**
4. **Documentation Updates** - **OPTIONAL**

### ✅ No Changes Required
- **Frontend Environment Configuration** - Environment variables already set
- **Authentication Redirect URLs** - Already domain-agnostic
- **Vercel Configuration** - Already complete

## Simplified Migration Strategy

**Status**: Vercel configuration already complete ✅ - Migration significantly simplified

### Phase 1: Backend CORS Configuration Update (REQUIRED)

**File**: `backend/app/main.py`

**Current CORS Regex** (Line 63):
```python
ORIGIN_REGEX = r"https://fairplay-[^.]*\.vercel\.app|https://fairplay-nil-git-[^.]*-justin-wachtels-projects\.vercel\.app|https://fairplay-[^.]*-justin-wachtels-projects\.vercel\.app|http://localhost(:\d+)?"
```

**Updated CORS Regex**:
```python
ORIGIN_REGEX = r"https://www\.fairplaynil\.com|https://fairplay-[^.]*\.vercel\.app|https://fairplay-nil-git-[^.]*-justin-wachtels-projects\.vercel\.app|https://fairplay-[^.]*-justin-wachtels-projects\.vercel\.app|http://localhost(:\d+)?"
```

**Changes**:
- Add `https://www\.fairplaynil\.com` to allow the new production domain
- Maintain all existing patterns for development and preview deployments
- Keep localhost support for local development

### Phase 2: Supabase Authentication Settings (REQUIRED)

**Required Manual Configuration in Supabase Dashboard**:

1. **Site URL**: Add `https://www.fairplaynil.com`
2. **Redirect URLs**: Add the following:
   - `https://www.fairplaynil.com/auth/callback`
   - `https://www.fairplaynil.com/dashboard` (post-login redirect)
   - `https://www.fairplaynil.com/login` (post-logout redirect)

**Existing URLs to Maintain**:
- `https://fairplay-nil.vercel.app/auth/callback`
- `https://fairplay-nil.vercel.app/dashboard`
- `https://fairplay-nil.vercel.app/login`
- `http://localhost:3000/auth/callback` (development)

### Phase 3: Testing Configuration Updates (OPTIONAL)

**File**: `frontend/tests/active-tests/*.spec.js`

**Current Test URLs**:
```javascript
await page.goto('https://fairplay-nil.vercel.app/dashboard');
```

**Updated Test Configuration**:
Create environment-specific test configuration:

```javascript
// In each test file, replace hardcoded URL with:
const TEST_BASE_URL = process.env.TEST_BASE_URL || 'https://www.fairplaynil.com';
await page.goto(`${TEST_BASE_URL}/dashboard`);
```

**Playwright Configuration Update** (`frontend/playwright.config.js`):
```javascript
// Add environment variable support
const BASE_URL = process.env.TEST_BASE_URL || 'https://www.fairplaynil.com';

export default defineConfig({
  // ... existing config
  use: {
    baseURL: BASE_URL,
    // ... rest of config
  }
});
```

### Phase 4: Documentation Updates (OPTIONAL)

**Files Requiring Updates**:

1. **README.md** (Line 168):
   ```markdown
   - **Production**: [FairPlay NIL Platform](https://www.fairplaynil.com)
   ```

2. **frontend/tests/PLAYWRIGHT_REFERENCE_GUIDE.md** (Line 7):
   ```markdown
   - Target: `https://www.fairplaynil.com`
   ```

3. **frontend/tests/README.md** (Line 19):
   ```markdown
   - Runs navigate to `https://www.fairplaynil.com` and handle login inline.
   ```

4. **docs/getting-started/local-development.md** (Line 229):
   Update production URL in environment table

## Simplified Implementation Timeline

### ✅ Already Complete
1. **Vercel Domain Configuration** - `www.fairplaynil.com` configured
2. **Environment Variables** - All variables set in Vercel
3. **Frontend Configuration** - Uses environment variables, no code changes needed

### Immediate (Required)
1. 🔧 **Backend CORS Update** - Add new domain to regex (5 minutes)
2. 🔧 **Supabase Auth URLs** - Add new domain redirects (5 minutes)

### Optional (Future)
1. 🔄 **Testing Configuration** - Environment-aware test URLs
2. 🔄 **Documentation Updates** - Update all references

## Updated Risk Assessment

### Minimal Risk ✅ (Significantly Reduced)
- **CORS Configuration**: Additive change, maintains all existing domains
- **Supabase Authentication**: Manual configuration, but straightforward
- **Vercel Configuration**: ✅ **ALREADY COMPLETE**

### Zero Risk 🟢
- **Environment Configuration**: ✅ **ALREADY COMPLETE** - Uses environment variables
- **Authentication**: Already domain-agnostic using `window.location.origin`
- **Development Environment**: No changes to local development
- **Existing Production**: `fairplay-nil.vercel.app` continues to work
- **Preview Deployments**: All preview URLs continue to work

## Rollback Strategy

If issues arise:

1. **Backend**: Revert CORS regex to original version
2. **Frontend**: Environment variables control behavior, no code rollback needed
3. **Supabase**: Remove new redirect URLs from dashboard
4. **Vercel**: Domain can be removed from project settings

## Testing Plan

### Pre-Deployment Testing
1. ✅ **Local Development**: Verify no impact on `localhost:3000`
2. ✅ **Preview Deployment**: Test on Vercel preview URL
3. ✅ **Environment Variables**: Validate configuration loading

### Post-Deployment Testing
1. 🧪 **New Domain**: Test full authentication flow on `www.fairplaynil.com`
2. 🧪 **Old Domain**: Verify `fairplay-nil.vercel.app` still works
3. 🧪 **API Connectivity**: Confirm backend communication
4. 🧪 **Authentication**: Test login/logout/signup flows
5. 🧪 **Deal Wizard**: Test core business functionality

### Monitoring
1. 📊 **Sentry**: Monitor error rates after deployment
2. 📊 **Backend Logs**: Check for CORS errors
3. 📊 **Supabase**: Monitor authentication success rates

## Simplified Implementation Checklist

### Required Changes (10 minutes total)

#### Backend Changes
- [ ] Update CORS regex in `backend/app/main.py` (2 minutes)
- [ ] Deploy backend changes to Render (3 minutes)
- [ ] Verify CORS headers in browser dev tools (2 minutes)

#### Supabase Configuration
- [ ] Add `https://www.fairplaynil.com` to Site URL (1 minute)
- [ ] Add redirect URLs for new domain (1 minute)
- [ ] Test authentication flow (1 minute)

### ✅ No Changes Required
- **Frontend Configuration** - Environment variables already set
- **Vercel Configuration** - Domain and variables already configured
- **Authentication Code** - Already domain-agnostic

### Optional Updates (Future)
- [ ] Update Playwright test URLs
- [ ] Update documentation references
- [ ] Run comprehensive test suite

## Success Criteria

✅ **Development Environment**: No impact on local development workflow  
✅ **Existing Production**: `fairplay-nil.vercel.app` continues to function  
✅ **New Production**: `www.fairplaynil.com` fully functional  
✅ **Authentication**: Login/logout/signup work on both domains  
✅ **API Communication**: Backend communication works from both domains  
✅ **Deal Wizard**: Core business functionality works on both domains  
✅ **Error Monitoring**: No increase in error rates post-deployment

## Post-Migration Considerations

### Domain Transition Strategy
1. **Phase 1**: Both domains active (current plan)
2. **Phase 2**: Redirect traffic from old to new domain (future)
3. **Phase 3**: Deprecate old domain (future)

### SEO Considerations
- Consider implementing 301 redirects from old to new domain
- Update any external links or bookmarks
- Monitor search engine indexing

### SSL/Security
- Verify SSL certificate is properly configured for new domain
- Test HTTPS enforcement
- Validate security headers

## Conclusion

This **significantly simplified migration** provides a zero-downtime approach to enabling `www.fairplaynil.com`. With Vercel configuration already complete, only minimal backend changes are required.

### Key Advantages:
- ✅ **Vercel setup complete** - Domain and environment variables configured
- ✅ **10-minute implementation** - Only CORS and Supabase updates needed
- ✅ **Zero breaking changes** to development workflow
- ✅ **Immediate functionality** - App will work on new domain after CORS update
- ✅ **Easy rollback** - Single line change to revert

### Implementation Summary:
1. **Backend CORS**: Add one domain to existing regex (2 minutes)
2. **Supabase Auth**: Add redirect URLs (2 minutes)
3. **Deploy & Test**: Verify functionality (6 minutes)

**Status**: Ready for immediate implementation - significantly lower complexity than originally assessed.

**Next Step**: Update backend CORS configuration and deploy.
