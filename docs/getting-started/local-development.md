# 🏠 Local Development Guide for FairPlay NIL

## 🚀 Quick Start

### Option 1: Use the Automated Script
```bash
# Start both frontend and backend automatically
./start-local-dev.sh
```

### Option 2: Manual Setup

#### 1. Start Backend Server
```bash
cd backend
source venv/bin/activate
export $(cat .env | xargs)
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

#### 2. Start Frontend Server (in new terminal)
```bash
cd frontend
npm run dev
```

## 🔧 Environment Configuration

### Frontend Environment (`.env.local`)
```bash
# Development Environment Configuration
VITE_API_URL=http://localhost:8000
VITE_ENVIRONMENT=development
VITE_DEBUG=true
VITE_SENTRY_DSN=
VITE_APP_VERSION=1.0.0-dev
VITE_BUILD_TIME=
```

### Backend Environment (`.env`)
```bash
SUPABASE_URL=https://izitucbtlygkzncwmsjl.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## 🧪 Testing with Playwright

### 1. Install Playwright
```bash
cd frontend
npm install
npx playwright install
```

### 2. Run Tests Locally
```bash
# Run all tests
npm run test:e2e

# Run with UI (interactive)
npm run test:e2e:ui

# Run in headed mode (see browser)
npm run test:e2e:headed

# Debug mode (step through)
npm run test:e2e:debug

# Test local development environment
npx playwright test local-dev-test.spec.js --headed

# Test specific functionality
npx playwright test --grep "deal wizard"
```

### 3. Manual Testing
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

### 4. API Testing
```bash
# Test backend health
curl http://localhost:8000/

# Test API endpoints
curl http://localhost:8000/docs
```

## 🔍 Debugging

### Frontend Debugging
```bash
# Interactive debugging with Playwright
npm run debug:playwright

# View test reports
npm run test:e2e:report

# Step-through debugging
npm run test:e2e:debug

# Check test artifacts
ls frontend/playwright-report/
ls frontend/test-results/
```

### Backend Debugging
```bash
# Check backend logs
tail -f backend/logs/app.log

# Test API endpoints
curl -X GET http://localhost:8000/api/health
```

### Debug Commands
```bash
# Install browsers
npx playwright install

# Update browsers
npx playwright install --force

# Show test report
npx playwright show-report

# Debug specific test
npx playwright test --debug tests/smoke.spec.js
```

## 📊 Test Coverage

### Smoke Tests (`tests/smoke.spec.js`)
- ✅ Homepage loading
- ✅ Navigation functionality
- ✅ Authentication flow
- ✅ Console error detection

### Deal Wizard Tests (`tests/deal-wizard.spec.js`)
- ✅ Wizard component loading
- ✅ Form interactions
- ✅ Step navigation
- ✅ Error handling

## 🔍 Debugging Features

### Console Error Detection
```javascript
// Automatically captures and reports:
// - JavaScript errors
// - Network failures
// - Console warnings
// - Page errors
```

### Network Monitoring
```javascript
// Records all network activity:
// - Failed requests
// - Slow responses
// - API errors
// - Resource loading issues
```

### Visual Debugging
- Screenshots on test failures
- Video recordings of test sessions
- HAR files for network analysis
- DevTools integration

## 📊 Development Workflow

### 1. **Before Making Changes**
```bash
# Start local environment
./start-local-dev.sh

# Run tests to ensure everything works
cd frontend && npm run test:e2e
```

### 2. **During Development**
```bash
# Make your changes
# Frontend auto-reloads on http://localhost:3000
# Backend auto-reloads on http://localhost:8000

# Test specific functionality
npx playwright test --grep "deal wizard"
```

### 3. **Before Deploying**
```bash
# Run all tests
npm run test:e2e

# Build test
npm run build

# If tests pass, deploy
git add . && git commit -m "feat: your changes" && git push
```

### Enhanced Workflow with CI/CD
```bash
# 1. Run tests locally
npm run test:e2e

# 2. If tests pass, build and deploy
npm run build
git add . && git commit -m "feat: add new feature" && git push
```

**Automated CI/CD Pipeline:**
- GitHub Actions runs Playwright tests on every push
- Only deploys to production if tests pass
- Generates test reports and videos for debugging

## 🎯 Key Benefits

### 1. **Pre-Deployment Testing**
- Catch errors before they reach production
- Test across multiple browsers (Chrome, Firefox, Safari)
- Mobile device testing included

### 2. **Automated Debugging**
- Console error detection
- Network request monitoring
- Visual regression testing
- Performance monitoring

### 3. **Interactive Debugging**
- Real-time error reporting
- Video recording of test sessions
- Network HAR files for analysis
- DevTools integration

### 4. **Local Development Benefits**
- **Faster Development**: No deployment delays
- **Better Debugging**: Full access to logs and errors
- **Offline Development**: Work without internet
- **Cost Effective**: No cloud resource usage
- **Better Testing**: Full control over test environment

## 🚨 Common Issues

### Backend Won't Start
```bash
# Check if virtual environment is activated
source backend/venv/bin/activate

# Check environment variables
cat backend/.env

# Install dependencies
pip install -r backend/requirements.txt
```

### Frontend Can't Connect to Backend
```bash
# Check if backend is running
curl http://localhost:8000/

# Check environment variables
cat frontend/.env.local

# Restart frontend
pkill -f "npm run dev" && npm run dev
```

### Playwright Tests Failing
```bash
# Check if servers are running
curl http://localhost:3000/
curl http://localhost:8000/

# Run tests with debugging
npx playwright test --headed --debug
```

### Common Playwright Issues
1. **Tests failing locally**: Check if dev server is running
2. **Browser issues**: Run `npx playwright install`
3. **Network timeouts**: Increase timeout in playwright.config.js
4. **Flaky tests**: Add retries and better selectors

## 🚨 Error Detection

### Common Issues Detected
1. **JavaScript Errors**: Console errors, uncaught exceptions
2. **Network Issues**: Failed API calls, slow responses
3. **UI Problems**: Missing elements, broken navigation
4. **Performance Issues**: Slow loading, memory leaks
5. **Cross-browser Issues**: Browser-specific problems

### Error Reporting
```bash
# View test reports
npm run test:e2e:report

# Check test artifacts
ls frontend/playwright-report/
ls frontend/test-results/
```

## 📈 Performance Monitoring

### Built-in Metrics
- Page load times
- Network request performance
- Memory usage
- CPU utilization

### Custom Metrics
```javascript
// Add custom performance tracking
await page.evaluate(() => {
  performance.mark('custom-start');
  // Your code here
  performance.mark('custom-end');
  performance.measure('custom', 'custom-start', 'custom-end');
});
```

## 📝 Environment Differences

| Environment | Frontend URL | Backend URL | Database | Purpose |
|-------------|--------------|-------------|----------|---------|
| **Local** | http://localhost:3000 | http://localhost:8000 | Supabase | Development |
| **Staging** | Vercel Preview | Render Staging | Supabase | Testing |
| **Production** | Vercel Production | Render Production | Supabase | Live |

## 🔄 Switching Environments

### To Production Testing
```bash
# Update frontend environment
echo "VITE_API_URL=https://fairplay-nil-backend.onrender.com" > frontend/.env.local
npm run dev
```

### To Local Development
```bash
# Restore local environment
cp frontend/.env.development frontend/.env.local
npm run dev
```

### Environment-Specific Testing
```bash
# Test against staging
BASE_URL=https://staging.fairplay-nil.com npm run test:e2e

# Test against production
BASE_URL=https://fairplay-nil.vercel.app npm run test:e2e
```

## 🛠️ Advanced Usage

### Custom Test Scenarios
```javascript
// Add to tests/custom.spec.js
test('should handle specific user flow', async ({ page }) => {
  await page.goto('/deal-wizard');
  await page.fill('[name="dealType"]', 'endorsement');
  await page.click('[data-testid="next-step"]');
  // Add more specific test logic
});
```

## 🎯 Best Practices

### 1. **Test Before Deploy**
Always run tests before pushing to main branch

### 2. **Monitor Test Results**
Check GitHub Actions for test failures

### 3. **Use Debug Mode**
Use `npm run debug:playwright` for interactive debugging

### 4. **Review Reports**
Regularly check test reports for patterns

### 5. **Update Tests**
Keep tests in sync with new features

## 📚 Next Steps

1. **Run initial tests**: `npm run test:e2e`
2. **Set up GitHub Actions**: Already configured
3. **Add more test scenarios**: Based on your specific needs
4. **Monitor and improve**: Regular test maintenance

This setup allows you to develop locally with full control while maintaining the ability to test against production APIs when needed. The enhanced Playwright integration provides robust debugging and testing capabilities that integrate seamlessly with your existing Vercel deployment workflow. 