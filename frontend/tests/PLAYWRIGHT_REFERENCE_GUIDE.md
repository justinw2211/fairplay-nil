# Playwright Reference Guide (Chrome • Production)

This guide documents how to run four specific Playwright flows against the production app. These are reference runners — not our default tests.

## Scope
- Browser: Chrome only
- Target: `https://fairplay-nil.vercel.app`
- Auth: Uses in-test login when needed (`test1@test.edu` / `testuser`)

## Prerequisites
```bash
cd frontend
npm install
npx playwright install chromium
```

Note: Our Playwright config may start a local dev server — that’s fine. These tests still navigate to production URLs explicitly.

## Run Individual Flows (Chrome on Production)

### 1) Simple Deal Logging (end‑to‑end)
```bash
npx playwright test tests/active-tests/simple-deal-logging-flow.spec.js --project=chromium --headed
```

### 2) NIL Go Clearinghouse Check (end‑to‑end)
```bash
npx playwright test tests/active-tests/clearinghouse-deal-flow.spec.js --project=chromium --headed
```

### 3) Simple Deal Navigation — Screenshots per step
```bash
npx playwright test tests/active-tests/simple-deal-navigation-screenshots.spec.js --project=chromium --headed
```

### 4) Deal Valuation Analysis (end‑to‑end)
```bash
npx playwright test tests/active-tests/valuation-deal-flow.spec.js --project=chromium --headed
```

## Tips
- If elements time out, re‑run with `--debug` to step through
- Artifacts (screenshots/videos) are saved in `frontend/test-results/` and `frontend/playwright-report/`

## When to use these
- Manual verification of critical flows
- Visual documentation (screenshot runner)
- On‑demand debugging in production context

Default testing should use faster, unit/integration approaches; keep this file as a quick reference for the four flows above.


