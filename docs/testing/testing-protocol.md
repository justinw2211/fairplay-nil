# Testing Protocol

## Overview

Unit/integration tests default. Playwright reference only.

## Testing Strategy

### Unit/Integration Tests (Jest + RTL)
- Fast feedback, comprehensive coverage
- Components, hooks, utilities, API calls
- Run on every commit, CI/CD
- Command: `npm test`

### Playwright E2E Flows
- Manual verification of critical user journeys
- Four specific flows on Chrome against production
- On-demand only
- Command: See `frontend/tests/PLAYWRIGHT_REFERENCE_GUIDE.md`

## Test Types

### Unit Tests
```bash
npm test
npm test -- StatusBadge.test.jsx
npm test -- --coverage
```

Test: Component rendering, hook logic, utilities, form validation.

### Integration Tests
```bash
npm test -- DealWizardStepWrapper.integration.test.jsx
npm test -- useDealWizardRecovery.test.jsx
```

Test: Context providers, API calls, form submission, navigation.

### Reference E2E Flows
```bash
cd frontend
npx playwright test tests/active-tests/simple-deal-logging-flow.spec.js --project=chromium --headed
```

Flows:
- `simple-deal-logging-flow.spec.js` - Basic deal creation
- `clearinghouse-deal-flow.spec.js` - Clearinghouse workflow
- `simple-deal-navigation-screenshots.spec.js` - Navigation verification
- `valuation-deal-flow.spec.js` - Valuation workflow

## Testing Guidelines

### When to Write Tests
- Always: New components, hooks, utilities
- Always: Business logic and data transformations
- Always: Form validation and error handling
- Always: API integration patterns
- Never: Third-party library functionality
- Never: Simple prop passing without logic

### Test Quality Standards
- Descriptive names: `should display error message when validation fails`
- Isolated tests: Each test independent
- Realistic data: Use test utilities for consistent data
- Error scenarios: Test both success and failure paths

### Mocking Strategy
- API calls: Use `mockApi` from `frontend/src/__mocks__/api.js`
- Context providers: Use mock contexts from test utilities
- External services: Mock Sentry, analytics, etc.
- Time-dependent code: Mock dates and timers

## Test Utilities

### Rendering Components
```javascript
// Simple UI components
import { renderWithChakra } from '../utils/test-utils';

// Components needing providers
import { renderWithProviders } from '../utils/test-utils';

// Navigation components
import { renderWithChakraAndRouter } from '../utils/test-utils';
```

### Mock Data
```javascript
import { testData, createTestProps } from '../utils/test-utils';

// Use consistent test data
const props = createTestProps();
const deal = testData.deal;
```

## CI/CD Integration

### GitHub Actions
- Unit tests: Run on every push and PR
- Linting: ESLint validation before tests
- Build test: Verify production build works
- No Playwright: Reference flows are manual only

### Pre-deployment Checklist
1. All unit tests pass (`npm test`)
2. No linting errors (`npm run lint`)
3. Build succeeds (`npm run build`)
4. Manual verification (if needed)

## Troubleshooting

### Common Issues
- "Cannot find module": Check import paths and file extensions
- "Hook called conditionally": Ensure hooks are at top level
- "Mock not working": Verify mock is imported before component
- "Test data pollution": Use `createMockData()` for fresh data

### Debug Commands
```bash
npm test -- --verbose StatusBadge.test.jsx
npm test -- --watch
npm test -- --verbose --no-coverage
```

## Reference Documentation

- Quick Reference: `frontend/tests/README.md`
- Playwright Commands: `frontend/tests/PLAYWRIGHT_REFERENCE_GUIDE.md`
- Test Utilities: `frontend/src/utils/test-utils.js`
- Mock API: `frontend/src/__mocks__/api.js`

## Philosophy

Fast feedback over comprehensive coverage. Unit and integration tests provide the best balance of speed, reliability, and maintainability. Playwright flows serve as manual verification tools for critical user journeys when needed.
