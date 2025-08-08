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

## 🧪 Testing

### Default Testing (Jest + RTL)
```bash
cd frontend
npm test
```

### Reference Playwright Flows
```bash
# See frontend/tests/PLAYWRIGHT_REFERENCE_GUIDE.md for exact commands
cd frontend
npx playwright test tests/active-tests/simple-deal-logging-flow.spec.js --project=chromium --headed
```

### Manual Testing
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

### API Testing
```bash
# Test backend health
curl http://localhost:8000/

# Test API endpoints
curl http://localhost:8000/docs
```

## 🔍 Debugging

### Frontend Debugging
```bash
# Run tests in watch mode
npm test -- --watch

# Debug specific test
npm test -- --verbose StatusBadge.test.jsx
```

### Backend Debugging
```bash
# Check backend logs
tail -f backend/logs/app.log

# Test API endpoints
curl -X GET http://localhost:8000/api/health
```

## 📊 Testing

For comprehensive testing information, see [Testing Protocol](docs/testing/testing-protocol.md).

## 📊 Development Workflow

### 1. **Before Making Changes**
```bash
# Start local environment
./start-local-dev.sh

# Run unit/integration tests
cd frontend && npm test
```

### 2. **During Development**
```bash
# Make your changes
# Frontend auto-reloads on http://localhost:3000
# Backend auto-reloads on http://localhost:8000
```

### 3. **Before Deploying**
```bash
# Run unit/integration tests
npm test

# Build test
npm run build

# If tests pass, deploy
git add . && git commit -m "feat: your changes" && git push
```

### CI/CD Pipeline
```bash
# 1. Run unit/integration tests locally
npm test

# 2. If tests pass, build and deploy
npm run build
git add . && git commit -m "feat: add new feature" && git push
```

**Automated Pipeline:**
- GitHub Actions runs unit/integration tests on every push
- Vercel deploys from GitHub

## 🎯 Key Benefits

### 1. **Fast Development**
- No deployment delays
- Full access to logs and errors
- Offline development capability

### 2. **Better Debugging**
- Real-time error reporting
- Full control over test environment
- Cost effective development

### 3. **Environment Control**
- Test against local, staging, or production APIs
- Full control over environment variables
- Isolated development environment

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

### Unit Tests Failing
```bash
# Check if servers are running
curl http://localhost:3000/
curl http://localhost:8000/

# Run tests with debugging
npm test -- --verbose
```

### Common Test Issues
1. **Tests failing locally**: Check if dev server is running
2. **Mock issues**: Verify mock imports and setup
3. **Import errors**: Check file paths and extensions
4. **Hook errors**: Ensure hooks are at top level

## 🚨 Error Detection

### Common Issues Detected
1. **JavaScript Errors**: Console errors, uncaught exceptions
2. **Network Issues**: Failed API calls, slow responses
3. **UI Problems**: Missing elements, broken navigation
4. **Performance Issues**: Slow loading, memory leaks
5. **Component Issues**: Rendering errors, state problems

### Error Reporting
```bash
# Check console for errors
# Monitor network tab in dev tools
# Review Sentry dashboard (if configured)
```

## 📈 Performance Monitoring

### Built-in Metrics
- Page load times
- Network request performance
- Memory usage
- API call performance

### Custom Metrics
```javascript
// Add custom performance tracking
const startTime = performance.now();
// Your code here
const endTime = performance.now();
console.log(`Execution time: ${endTime - startTime}ms`);
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
VITE_API_URL=https://staging-backend.onrender.com npm test

# Test against production
VITE_API_URL=https://fairplay-nil-backend.onrender.com npm test
```

## 🛠️ Advanced Usage

### Custom Development Scenarios
```javascript
// Add custom debugging
console.log('Debug info:', data);
// Use browser dev tools for inspection
```

## 🎯 Best Practices

### 1. **Test Before Deploy**
Always run tests before pushing to main branch

### 2. **Monitor Development**
Check console for errors during development

### 3. **Use Debug Tools**
Use browser dev tools for inspection

### 4. **Environment Management**
Keep environment variables organized

### 5. **Regular Maintenance**
Update dependencies and configurations

## 📚 Next Steps

1. **Start development**: `./start-local-dev.sh`
2. **Set up environment**: Configure your `.env` files
3. **Add features**: Develop with full local control
4. **Monitor and improve**: Regular development maintenance

This setup allows you to develop locally with full control while maintaining the ability to test against production APIs when needed. 