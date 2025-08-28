# Domain Migration Update: fairplaynil.com

## Overview
Update FairPlay NIL platform to be fully functional on the new `https://www.fairplaynil.com` domain.

## Current Status
- ✅ Domain acquired and connected in Vercel
- ✅ Basic deployment working
- ⚠️ Environment configuration needs updates
- ⚠️ API endpoints need domain-specific configuration
- ⚠️ CORS settings need updates
- ⚠️ SEO and meta tags need domain updates

## Required Updates

### 1. Environment Configuration Updates

#### Frontend Environment Variables (Vercel Dashboard)
Update these environment variables in your Vercel project settings:

```bash
# Production API URL
VITE_API_URL=https://fairplay-nil-backend.onrender.com

# Supabase Configuration (keep existing)
VITE_SUPABASE_URL=https://izitucbtlygkzncwmsjl.supabase.co
VITE_SUPABASE_ANON_KEY=your-existing-anon-key

# Sentry Configuration (keep existing)
VITE_SENTRY_DSN=https://8a759dc24e0d183c942867eb9d1eadc6@o4509759316426752.ingest.us.sentry.io/4509759319572480

# App Configuration
VITE_APP_VERSION=1.0.0
VITE_BUILD_TIME=auto-generated
```

#### Backend Environment Variables (Render Dashboard)
Update backend environment variables in Render:

```bash
# CORS Origins - Add new domain
CORS_ORIGINS=https://www.fairplaynil.com,https://fairplaynil.com,http://localhost:3000

# Site URL for email templates
SITE_URL=https://www.fairplaynil.com
```

### 2. Frontend Configuration Updates

#### Update Environment Configuration
```javascript
// frontend/src/config/environment.js
// Update production API URL fallback
production: {
  apiUrl: getEnvVar('VITE_API_URL') || 'https://fairplay-nil-backend.onrender.com',
  // ... rest of config
}
```

#### Update Meta Tags and SEO
```javascript
// frontend/index.html
// Update canonical URL and meta tags
<meta property="og:url" content="https://www.fairplaynil.com" />
<link rel="canonical" href="https://www.fairplaynil.com" />
```

### 3. Backend Configuration Updates

#### CORS Configuration
```python
# backend/app/main.py
# Update CORS origins to include new domain
origins = [
    "https://www.fairplaynil.com",
    "https://fairplaynil.com", 
    "http://localhost:3000",
    "http://localhost:5173"
]
```

#### Email Template Updates
```python
# backend/app/api/profile.py
# Update any hardcoded URLs in email templates
SITE_URL = os.getenv("SITE_URL", "https://www.fairplaynil.com")
```

### 4. Vercel Configuration Updates

#### Update vercel.json (if needed)
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/assets/(.*)",
      "dest": "/assets/$1",
      "headers": {
        "Content-Type": "application/javascript"
      }
    },
    {
      "src": "/(.*\\.js)",
      "dest": "/$1",
      "headers": {
        "Content-Type": "application/javascript"
      }
    },
    {
      "src": "/(.*\\.css)",
      "dest": "/$1",
      "headers": {
        "Content-Type": "text/css"
      }
    },
    {
      "src": "/(.*\\.(png|jpg|jpeg|gif|svg|ico))",
      "dest": "/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        }
      ]
    }
  ]
}
```

### 5. SSL and Security Configuration

#### Vercel SSL Settings
- ✅ Automatic SSL certificate (handled by Vercel)
- ✅ HTTPS redirect (automatic)
- ✅ Security headers (add to vercel.json above)

#### Domain Verification
- ✅ Verify domain ownership in Vercel
- ✅ Set up DNS records if needed
- ✅ Configure custom domain in Vercel project settings

### 6. Testing Checklist

#### Pre-Deployment Testing
```bash
# 1. Test environment configuration
npm run validate:env

# 2. Test build process
npm run build

# 3. Test locally with production build
npm run preview

# 4. Run unit tests
npm test

# 5. Test API connectivity
# Verify backend is accessible from new domain
```

#### Post-Deployment Testing
```bash
# 1. Test domain accessibility
curl -I https://www.fairplaynil.com

# 2. Test SSL certificate
openssl s_client -connect www.fairplaynil.com:443 -servername www.fairplaynil.com

# 3. Test API connectivity from new domain
# Check browser console for CORS errors

# 4. Test authentication flow
# Verify Supabase auth works on new domain

# 5. Test deal wizard functionality
# Complete end-to-end deal creation flow
```

### 7. Monitoring and Analytics

#### Sentry Configuration
- ✅ Error tracking already configured
- ✅ Performance monitoring enabled
- ✅ Environment-specific sampling rates

#### Google Analytics (if applicable)
- Update tracking code for new domain
- Configure cross-domain tracking if needed

### 8. SEO and Performance

#### Performance Optimization
```bash
# 1. Test Core Web Vitals
# Use Google PageSpeed Insights on new domain

# 2. Verify image optimization
# Check that images are properly optimized

# 3. Test mobile responsiveness
# Verify app works on mobile devices
```

#### SEO Updates
- Update sitemap.xml (if applicable)
- Update robots.txt (if applicable)
- Verify meta tags are correct
- Test social media sharing

### 9. Rollback Plan

#### Emergency Rollback Steps
```bash
# 1. Revert environment variables in Vercel
# 2. Revert CORS settings in backend
# 3. Deploy previous working version
# 4. Test functionality on old domain
```

## Implementation Steps

### Phase 1: Environment Configuration
1. Update Vercel environment variables
2. Update Render environment variables
3. Test configuration validation

### Phase 2: Backend Updates
1. Update CORS configuration
2. Update email templates
3. Deploy backend changes
4. Test API connectivity

### Phase 3: Frontend Updates
1. Update environment configuration
2. Update meta tags
3. Deploy frontend changes
4. Test full functionality

### Phase 4: Verification
1. Run comprehensive testing
2. Verify all features work
3. Check performance metrics
4. Monitor error tracking

## Success Criteria

- ✅ Domain accessible at https://www.fairplaynil.com
- ✅ SSL certificate working
- ✅ All features functional
- ✅ API connectivity working
- ✅ Authentication working
- ✅ Deal wizard working
- ✅ Error tracking working
- ✅ Performance acceptable
- ✅ Mobile responsive

## Notes

- Keep existing Supabase configuration unchanged
- Maintain existing Sentry configuration
- Preserve all existing functionality
- Test thoroughly before and after deployment
- Monitor error tracking for issues
- Document any domain-specific issues found

## Timeline

- **Environment Updates**: 30 minutes
- **Backend Updates**: 15 minutes  
- **Frontend Updates**: 15 minutes
- **Testing**: 30 minutes
- **Total**: ~1.5 hours

## Risk Mitigation

- Test on staging environment first
- Have rollback plan ready
- Monitor error tracking closely
- Test critical user flows
- Verify API connectivity
