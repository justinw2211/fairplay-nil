# FairPlay NIL Frontend Routes

This document lists all user-facing frontend routes, organized for clarity. Dynamic segments are shown with `:`. Only routes a user could and should experience are included.

---

## Public Routes

- `/` — Home page
- `/login` — Login page
- `/signup` — Sign up page
- `/about` — About Us
- `/security` — Security information
- `/careers` — Careers page
- `/athletes` — Athletes listing/info
- `/universities` — Universities listing/info
- `/collectives` — Collectives listing/info
- `/brands` — Brands listing/info

## Protected Routes (Require Login)

- `/dashboard` — User dashboard
- `/edit-profile` — Edit user profile

## NIL Deal Wizard Routes

- `/add/deal/social-media/:dealId` — Step 0: Social Media
- `/add/deal/terms/:dealId` — Step 1: Deal Terms
- `/add/deal/payor/:dealId` — Step 2: Payor Info
- `/add/deal/activities/select/:dealId` — Step 3: Select Activities
- `/add/deal/activity/:activityType/:dealId` — Activity Form (dynamic by type)
- `/add/deal/compliance/:dealId` — Step 5: Compliance
- `/add/deal/compensation/:dealId` — Step 6: Compensation
- `/add/deal/review/:dealId` — Step 8: Review
- `/add/deal/submission-success/:dealId` — Submission Success

## Clearinghouse & Valuation

- `/clearinghouse-result/:dealId` — Clearinghouse Result
- `/valuation-wizard/:dealId` — Valuation Wizard
- `/valuation-result/:dealId` — Valuation Result

## Error Handling

- `*` — Not Found (404)

---

**Note:**
- All `:dealId` and `:activityType` are dynamic segments replaced at runtime.
- Some routes are wrapped in protection components (e.g., `ProtectedRoute`, `DealWizardRoute`).
- Only routes intended for user navigation are listed here. 