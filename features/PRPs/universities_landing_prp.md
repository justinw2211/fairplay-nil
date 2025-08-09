name: "Universities Landing Page (CTA) — PRP v1"
description: |

### Goal
Build a focused landing page at `/universities` with a clear primary CTA for schools to schedule a demo.

### Why
- **Lead generation**: Convert university traffic into demo requests.
- **Clarity**: Dedicated page for university stakeholders.
- **Consistency**: Match brand look-and-feel and existing routing.

### What (Confirmed Scope)
- **Public route**: `/universities` (already wired in `frontend/src/App.jsx`).
- **Page type**: Marketing landing with sections (hero, tools/features, pricing, benefits, final CTA).
- **Primary CTA**: Button labeled "Schedule a Demo". Final destination/link is TBD (not confirmed).
- **Design system**: Use Chakra UI and brand tokens from `frontend/src/theme.js` (no hardcoded colors).
- **Telemetry**: Follow existing logging/error patterns; Sentry enabled in production via existing setup.
- **No backend changes**: Page does not require new API endpoints.

### Success Criteria
- [ ] `/universities` renders without errors; responsive at common breakpoints.
- [ ] Primary CTA "Schedule a Demo" is visually prominent and accessible (ARIA, focus states).
- [ ] No hardcoded color hex values; uses `brand.*` tokens from theme.
- [ ] No new ESLint errors; test/build pass locally.
- [ ] Unit test validates render and CTA presence.

### Documentation & References
```yaml
- file: frontend/src/pages/Universities.jsx
  why: Existing landing layout to refine; contains current CTA labels/sections
- file: frontend/src/App.jsx
  why: Route registration for `/universities`
- file: frontend/src/theme.js
  why: Brand color tokens (`brand.accentPrimary`, `brand.textPrimary`, etc.)
- file: frontend/src/utils/logger.js
  why: Centralized logging; prefer over console.log
- file: frontend/src/config/environment.js
  why: Environment behavior and Sentry toggles
- docfile: .cursor/rules/context.mdc
  why: Codebase standards (theme usage, testing patterns, deployment)
- docfile: .cursor/rules/coding-patterns.mdc
  why: Keep files under ~300 LOC, avoid duplication, follow environments
- docfile: .cursor/rules/coding-preferences.mdc
  why: Testing preferences (Jest + RTL), scope discipline
```

### Current codebase (relevant excerpts)
```bash
frontend/src/pages/Universities.jsx        # Existing landing sections + CTA labels
frontend/src/App.jsx                       # Public route: /universities
frontend/src/theme.js                      # Brand tokens
```

### Desired codebase (minimal change)
```bash
frontend/src/pages/Universities.jsx        # Refined to use theme tokens; CTA wired per TBD link
features/PRPs/universities_landing_prp.md  # This document
```

### Known Gotchas & Quirks
- Use brand tokens from `theme.js`; do not hardcode hex colors.
- Keep component files under ~300 LOC; split sections if necessary.
- Respect environment config (no direct `import.meta.env` access in components).
- Tests should not rely on Playwright; default to Jest + RTL.

### Implementation Blueprint (UI-only)
- Sections remain: hero, tools/features grid, pricing cards, benefits, final CTA.
- Replace inline hex values with `brand.*` tokens (accent/text/background variants).
- Ensure CTA has descriptive label and focus-visible styles.
- Add light telemetry (logger.info on CTA click) without adding new analytics.

### Tasks (ordered)
```yaml
Task 1: Theme compliance
  MODIFY frontend/src/pages/Universities.jsx
  - Replace hardcoded color strings with tokens from theme.js (e.g., brand.accentPrimary, brand.textPrimary)
  - Verify backgrounds, borders, hovers use brand palette

Task 2: Accessibility & semantics
  MODIFY frontend/src/pages/Universities.jsx
  - Ensure buttons have accessible names; confirm heading hierarchy (h1→h2→h3)
  - Add appropriate aria attributes if needed

Task 3: CTA behavior (non-breaking)
  MODIFY frontend/src/pages/Universities.jsx
  - Keep label "Schedule a Demo"
  - Wire onClick to logger.info (context: "Universities", action: "cta_click")
  - CTA destination/link = TBD (do not implement navigation yet)

Task 4: Tests
  CREATE frontend/src/pages/__tests__/Universities.cta.test.jsx
  - Render page, assert CTA is in document with correct label
  - Optional: simulate click and assert no errors (mock logger)

Task 5: Lint/Build
  - Run lint and test/build; fix any issues
```

### Integration Points
```yaml
ROUTING:
  - Already configured in frontend/src/App.jsx → no changes required

TELEMETRY:
  - Use logger from frontend/src/utils/logger.js for CTA click

BACKEND:
  - None required for this scope
```

### Validation Loop
```bash
# Syntax/Style
npm run lint

# Unit tests (Jest + RTL)
npm test

# Build
npm run build
```

### Out of Scope (Future Enhancements)
- University directory (search/filter by division) using `fetchSchools()`.
- Per-school detail pages or dynamic CTAs.
- Analytics events beyond basic logging.
