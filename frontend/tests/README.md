# Testing Protocol

- Default: unit/integration tests (Jest/RTL). Fast feedback.
- Playwright: reference only. Chrome. Production URL.

## Reference Playwright Flows
- See `PLAYWRIGHT_REFERENCE_GUIDE.md`
- Flows:
  - `active-tests/simple-deal-logging-flow.spec.js`
  - `active-tests/clearinghouse-deal-flow.spec.js`
  - `active-tests/simple-deal-navigation-screenshots.spec.js`
  - `active-tests/valuation-deal-flow.spec.js`

## Artifacts
- `test-artifacts/` - Screenshots, videos, and reports from Playwright tests

## Notes
- Use Playwright only when explicitly requested.
- Runs navigate to `https://fairplay-nil.vercel.app` and handle login inline.