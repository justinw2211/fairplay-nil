name: "Universities Landing Page (CTA) — PRP v2"
description: |

### Goal
Build a focused landing page at `/universities` with a clear primary CTA for schools to schedule a demo, opening a popup (modal) to collect contact details.

### Why
- **Lead generation**: Convert university traffic into demo requests.
- **Clarity**: Dedicated page and form for university stakeholders.
- **Consistency**: Match brand look-and-feel and existing routing.

### What (Confirmed Scope)
- **Public route**: `/universities` (already wired in `frontend/src/App.jsx`).
- **Page type**: Marketing landing with sections (hero, tools/features, pricing, benefits, final CTA).
- **Primary CTA**: Button labeled "Schedule a Demo" opens a modal.
- **Popup (Modal)**: Collects standard contact info (see below). Submission destination is TBD; UI + validation + telemetry in-scope.
- **Design system**: Use Chakra UI and brand tokens from `frontend/src/theme.js` (no hardcoded colors).
- **Telemetry**: Use `frontend/src/utils/logger.js`; Sentry auto-captures exceptions in production.
- **No backend changes (for now)**: Data submission/storage is out-of-scope until confirmed.

### Success Criteria
- [ ] `/universities` renders without errors; responsive at common breakpoints.
- [ ] CTA "Schedule a Demo" opens a modal with the expected fields.
- [ ] Required fields validated with clear errors; optional phone formatted.
- [ ] No hardcoded color hex values; uses `brand.*` tokens from theme.
- [ ] No new ESLint errors; test/build pass locally.
- [ ] Unit tests validate CTA, modal open/close, validation, and submit handler call.

### Demo Request Popup (Modal)
- **Trigger**: Primary CTA buttons on the page (hero and final CTA) open the same modal.
- **Framework**: Chakra UI `Modal` + `react-hook-form`.
- **Fields** (proposed):
  - `fullName` (required)
  - `email` (required, email format)
  - `phone` (optional, formatted) — reuse `frontend/src/components/forms/PhoneField.jsx`
  - `university` (required) — reuse `frontend/src/components/forms/SchoolField.jsx`
  - `role` (optional) — e.g., "Athletic Director", "Compliance Officer"
  - `message` (required) — free text up to a reasonable length
  - `consent` (optional checkbox) — "I agree to be contacted for a demo"
- **Validation**:
  - Use React Hook Form with schema-free validators + existing validation messages where applicable.
  - Email must be valid format; phone validates/normalizes via `PhoneField`.
  - Required: `fullName`, `email`, `university`, `message`.
- **UX & Accessibility**:
  - Initial focus on `fullName` input; focus trap enabled.
  - Keyboard and screen reader friendly (aria labels, proper semantics).
  - Clear error messages; disable submit while submitting.
- **Telemetry**:
  - Log open: `logger.info('Universities modal open', { context: 'Universities', action: 'modal_open' })`
  - Log submit attempt: `logger.info('Universities modal submit', { fieldsPresent })`
  - Log close/cancel: `logger.info('Universities modal close', { reason })`
- **Submission** (TBD):
  - For now, prevent default network submission; call a local `onSubmit` handler that logs payload and closes modal on success.
  - Actual persistence (email, Supabase, or backend endpoint) to be clarified in a follow-up PRP.

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
- file: frontend/src/components/forms/PhoneField.jsx
  why: Reusable phone input with formatting and validation
- file: frontend/src/components/forms/SchoolField.jsx
  why: Reusable university selector with division mapping and fallback
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
frontend/src/components/forms/PhoneField.jsx
frontend/src/components/forms/SchoolField.jsx
```

### Desired codebase (minimal change)
```bash
frontend/src/pages/Universities.jsx                # Integrate modal trigger and import modal component
frontend/src/components/UniversitiesDemoModal.jsx  # New modal component (UI+validation only)
features/PRPs/universities_landing_prp.md          # This document
```

### Known Gotchas & Quirks
- Use brand tokens from `theme.js`; do not hardcode hex colors.
- Keep component files under ~300 LOC; split sections if necessary.
- Respect environment config (no direct `import.meta.env` access in components).
- Tests should not rely on Playwright; default to Jest + RTL.

### Implementation Blueprint (UI-only)
- Sections remain: hero, tools/features grid, pricing cards, benefits, final CTA.
- Replace inline hardcoded color strings with `brand.*` tokens.
- Add `UniversitiesDemoModal.jsx` with required fields and validation.
- Use `useDisclosure` in `Universities.jsx` to open/close the modal from both CTAs.
- Submit handler: log payload, close modal on success, show error on failure.

### Tasks (ordered)
```yaml
Task 1: Theme compliance
  MODIFY frontend/src/pages/Universities.jsx
  - Replace hardcoded color strings with tokens from theme.js (e.g., brand.accentPrimary, brand.textPrimary)
  - Verify backgrounds, borders, hovers use brand palette

Task 2: Modal component
  CREATE frontend/src/components/UniversitiesDemoModal.jsx
  - Build Chakra UI Modal with react-hook-form
  - Fields: fullName (required), email (required), phone (optional via PhoneField), university (required via SchoolField), role (optional), message (required), consent (optional)
  - Validation + accessible error messages; initial focus on fullName
  - Telemetry logs on open/close/submit

Task 3: Integrate modal triggers
  MODIFY frontend/src/pages/Universities.jsx
  - Import modal and wire to both "Schedule a Demo" CTAs via useDisclosure
  - Log CTA click prior to opening modal

Task 4: Tests
  CREATE frontend/src/components/__tests__/UniversitiesDemoModal.test.jsx
  - Render modal open; assert required fields and validation messages
  - Validate optional phone formatting (mock PhoneField minimal behavior)
  - Simulate submit with valid data; assert submit handler called and modal closes

  CREATE frontend/src/pages/__tests__/Universities.cta.test.jsx
  - Render page; assert CTA visible
  - Click CTA; assert modal opens

Task 5: Lint/Build
  - Run lint and test/build; fix any issues
```

### Integration Points
```yaml
ROUTING:
  - Already configured in frontend/src/App.jsx → no changes required

TELEMETRY:
  - Use logger from frontend/src/utils/logger.js for CTA and modal events

BACKEND:
  - None required for this scope (submission TBD)
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
- Submission persistence (email routing, Supabase table, or backend endpoint) and admin notifications.
- Analytics events beyond basic logging.
