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

## 🧪 Testing Locally

### 1. Manual Testing
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

### 2. Automated Testing with Playwright
```bash
# Test local development environment
cd frontend
npx playwright test local-dev-test.spec.js --headed

# Test all scenarios
npx playwright test --headed

# Interactive debugging
npm run debug:playwright
```

### 3. API Testing
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
```

### Backend Debugging
```bash
# Check backend logs
tail -f backend/logs/app.log

# Test API endpoints
curl -X GET http://localhost:8000/api/health
```

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

## 🎯 Key Benefits of Local Development

1. **Faster Development**: No deployment delays
2. **Better Debugging**: Full access to logs and errors
3. **Offline Development**: Work without internet
4. **Cost Effective**: No cloud resource usage
5. **Better Testing**: Full control over test environment

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

This setup allows you to develop locally with full control while maintaining the ability to test against production APIs when needed. 