# Playwright Debugging Setup for FairPlay NIL

## 🚀 Quick Start

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
```

### 3. Debug with Playwright
```bash
# Start interactive debugging session
npm run debug:playwright
```

## 🔧 Enhanced Workflow

### Before Deployment (Recommended)
```bash
# 1. Run tests locally
npm run test:e2e

# 2. If tests pass, build and deploy
npm run build
git add . && git commit -m "feat: add new feature" && git push
```

### Automated CI/CD Pipeline
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

## 🔄 Integration with Current Workflow

### Current: Manual Testing
```bash
git push → Vercel auto-deploy → Manual testing → Fix issues
```

### Enhanced: Automated Testing
```bash
git push → GitHub Actions → Playwright tests → Auto-deploy if tests pass
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

### Environment-Specific Testing
```bash
# Test against staging
BASE_URL=https://staging.fairplay-nil.com npm run test:e2e

# Test against production
BASE_URL=https://fairplay-nil.vercel.app npm run test:e2e
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

## 🔧 Troubleshooting

### Common Issues
1. **Tests failing locally**: Check if dev server is running
2. **Browser issues**: Run `npx playwright install`
3. **Network timeouts**: Increase timeout in playwright.config.js
4. **Flaky tests**: Add retries and better selectors

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

## 📚 Next Steps

1. **Run initial tests**: `npm run test:e2e`
2. **Set up GitHub Actions**: Already configured
3. **Add more test scenarios**: Based on your specific needs
4. **Monitor and improve**: Regular test maintenance

This setup provides a robust debugging and testing foundation that integrates seamlessly with your existing Vercel deployment workflow. 