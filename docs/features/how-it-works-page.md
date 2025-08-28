## How It Works — Feature Update

### Goal
Create a high‑credibility "How it Works" page linked from the Home page button. Explain what the platform does, how our Clearinghouse and FMV predictions work, and why our models and proprietary data give users and investors confidence.

### Route & Navigation
- New route: `/how-it-works`
- Connect existing Home page "How it Works" button to navigate to `/how-it-works`
- Primary CTA on page: "Try the Deal Wizard" → `/deal-wizard`

### Audience
- Prospective users (athletes, brands, collectives, universities)
- Investors and partners

### Page Structure (Content Outline)
1) Hero
   - Headline: "Make NIL decisions with confidence"
   - Subcopy: "Data-driven predictions for Clearinghouse outcomes and fair market value (FMV)."
   - CTA: "Try the Deal Wizard"

2) What the Platform Does
   - Deal Wizard: end-to-end deal intake, compliance checks, and review
   - Clearinghouse Predictor: likelihood of approval with reasons and risk flags
   - FMV Estimator: market-consistent valuation ranges for NIL activities
   - Compliance & Reporting: documentation and audit-ready exports
   - Analytics: portfolio insights, performance trends, and benchmarks

3) How Predictions Work (Plain English)
   - We combine machine learning models with proprietary NIL deal data and public signals.
   - Features include: athlete profile, school/division, sport, social metrics, geography, activity type, deal term structure, historical comparables, and market signals.
   - Outputs: probability of Clearinghouse approval (with risk bands) and FMV ranges (with uncertainty bands and comparables).

4) Clearinghouse Predictions (Technical Summary)
   - Models: ensemble of gradient-boosted decision trees and lightweight transformers for text fields (e.g., deliverables, objectives)
   - Labels: historical approval outcomes and rule-based interpretations aligned with NCAA/state guidance
   - Calibration: probability calibration (Platt/Isotonic) for reliable risk bands
   - Explainability: per‑feature attributions (e.g., SHAP‑style) surfaced as human‑readable reasons
   - Output: Approved/Needs Review/High Risk with rationale, plus confidence score

5) FMV Estimation (Technical Summary)
   - Models: quantile regression + boosted trees for non‑linear effects and heteroskedasticity
   - Comparables: proprietary NIL deal comps blended with public sponsorship signals and social analytics
   - Controls: sport/seasonality, market size, activity mix, content quality, exclusivity, term length, payment schedule
   - Output: FMV range (P25–P75) with point estimate, uncertainty band, and top comparable drivers

6) Data & Model Pipeline
   - Proprietary Data: curated NIL deal terms, outcomes, and negotiated rates collected through platform usage and partner contributions
   - Public Signals: social metrics, team performance, geography, seasonality, macro trends
   - Governance: anonymization, PII minimization, access controls, versioned datasets and models
   - MLOps: offline training, evaluation on holdout sets, drift monitoring, and periodic retraining
   - Backend Inference: FastAPI endpoints execute model inference server-side; results cached with safeguards

7) Accuracy, Reliability, and Safety
   - We prioritize calibrated probabilities, transparent rationale, and conservative ranges for FMV
   - Continuous backtesting against new deals; performance reviewed quarterly
   - Guardrails: compliance rules and manual review prompts when uncertainty is high

8) Privacy & Compliance
   - No sale of personal data; only aggregated insights exposed
   - Access control by role; audit logs maintained
   - Data retention and deletion upon request

9) FAQ (Short)
   - Do you really use ML? Yes—ensemble models trained on proprietary and public data.
   - Are outputs guarantees? No—outputs are calibrated predictions with uncertainty.
   - How often are models updated? Periodically, with drift detection.
   - Can I see why a prediction was made? Yes—human‑readable rationale and key drivers are shown.

### Copy Blocks (Investor‑Ready, concise)
- Confidence: "Calibrated probabilities and defensible FMV ranges—transparent, explainable, and grounded in real deals."
- Data Advantage: "Proprietary NIL contracts and outcome data, enriched with public market signals."
- Technology: "Ensemble ML (GBDT + transformers), quantile ranges, and explainable outputs."
- Compliance: "Workflow‑native checks, documentation, and audit‑ready exports."

### SEO Elements
- Title: How FairPlay NIL Works – Clearinghouse Predictions and FMV Estimates
- Meta description: Data‑driven NIL compliance and valuation powered by machine learning and proprietary deal data.
- H1: How It Works
- H2s: Predictions, FMV, Data & Models, Privacy, FAQ

### Implementation Notes
Frontend
- New page component `frontend/src/pages/HowItWorks.jsx`
- Add route in `frontend/src/App.jsx` (or router file) for `/how-it-works`
- Update Home page button to `navigate('/how-it-works')`
- Track events: `how_it_works_viewed`, `how_it_works_try_wizard_clicked`

Backend
- If not already present, expose read‑only endpoints to fetch model rationale artifacts for display
- Ensure error handling uses centralized middleware (`backend/app/middleware/error_handling.py`)

Analytics
- Fire pageview and CTA click events with anonymized context (role, device)

### Acceptance Criteria
- Navigating from Home button lands on `/how-it-works`
- Page renders hero, platform overview, Clearinghouse and FMV sections, data/model pipeline, privacy, FAQ, and CTA
- Copy includes ML + proprietary data positioning and presents explainability and uncertainty
- Basic SEO tags set; analytics events recorded

### Out‑of‑Scope (for this iteration)
- Full model metrics dashboard
- Live A/B testing of copy

### Risks & Mitigations
- Risk: Over‑promising performance → Mitigation: emphasize calibrated predictions and uncertainty bands
- Risk: Data sensitivity → Mitigation: anonymization, least‑privilege access, audit logs
- Risk: Model drift → Mitigation: monitored drift and periodic retraining

### Rough Component Sketch (optional)
```jsx
// pages/HowItWorks.jsx (outline)
export default function HowItWorks() {
  return (
    <Page>
      <Hero title="Make NIL decisions with confidence" cta="Try the Deal Wizard" />
      <Section title="What the platform does" />
      <Section title="Clearinghouse predictions" />
      <Section title="FMV estimation" />
      <Section title="Data & model pipeline" />
      <Section title="Privacy & compliance" />
      <FAQ />
    </Page>
  );
}
```

### Next Steps
1) Implement page and route; wire Home button
2) Add analytics events
3) Review copy with legal/compliance
4) Publish; monitor engagement and iterate


