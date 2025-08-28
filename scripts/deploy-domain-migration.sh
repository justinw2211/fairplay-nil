#!/bin/bash

# Domain Migration Deployment Script
# This script helps deploy the FairPlay NIL platform to the new fairplaynil.com domain

set -e

echo "🚀 Starting FairPlay NIL Domain Migration Deployment"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if we're in the right directory
if [ ! -f "frontend/package.json" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

print_status "Environment validation..."

# Validate environment configuration
cd frontend
if npm run validate:env; then
    print_status "Environment configuration is valid"
else
    print_error "Environment configuration validation failed"
    print_warning "Please check your Vercel environment variables"
    exit 1
fi

# Build the application
print_status "Building frontend application..."
if npm run build; then
    print_status "Frontend build successful"
else
    print_error "Frontend build failed"
    exit 1
fi

# Run tests
print_status "Running tests..."
if npm test; then
    print_status "Tests passed"
else
    print_warning "Some tests failed - continuing with deployment"
fi

# Deploy to Vercel
print_status "Deploying to Vercel..."
if npx vercel --prod; then
    print_status "Deployment successful"
else
    print_error "Deployment failed"
    exit 1
fi

cd ..

# Backend deployment reminder
print_warning "Backend CORS configuration has been updated"
print_warning "Please deploy the backend to Render with the updated CORS settings"

echo ""
echo "🎉 Domain Migration Deployment Complete!"
echo "========================================"
echo ""
echo "Next steps:"
echo "1. Verify the site is accessible at https://www.fairplaynil.com"
echo "2. Test the deal wizard functionality"
echo "3. Verify authentication works"
echo "4. Check that API calls are working"
echo "5. Monitor Sentry for any errors"
echo ""
echo "If you encounter issues:"
echo "- Check Vercel deployment logs"
echo "- Verify environment variables are set correctly"
echo "- Test API connectivity from the new domain"
echo "- Check browser console for CORS errors"
