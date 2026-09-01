# Civic Adaptive WebMCP — Source of Truth

Status: active competition build  
Internal codename only: David will choose the submission name.  
Deadline: 3 September 2026, 13:00 Pacific / 21:00 BST. Target submission: 19:00 BST.

## Product Thesis

Bring your own agent and interaction preferences. A WebMCP-enabled public
service safely transforms one difficult official process into a personalised,
understandable workflow without replacing its rules, accessible website, or
human approval.

The entry is a fictional UK-style urgent home-repair grant application for a
low-income homeowner dealing with a safety-critical repair. The underlying
service remains a coherent, keyboard-operable form. WebMCP adds structured,
site-authored collaboration: the user's agent can configure the interaction,
ask for the next official step, propose an answer for visible human confirmation,
explain a rule, and run deterministic validation.

## Judge Story

1. Open on a dense but functional application overview and form.
2. The applicant tells their agent: “I use keyboard navigation and need this
   explained one question at a time.”
3. The agent discovers site-authored WebMCP tools and enables guided mode.
4. The visible interface transforms while preserving the same application state.
5. Agent and applicant complete a short seeded journey together.
6. Deterministic validation flags an ambiguous repair description and a missing
   supporting document.
7. The applicant corrects the answer and confirms the document state.
8. The review screen lists answers and agent-made changes.
9. The agent cannot submit. The human presses the final Submit button.

## Audience and Scenario

- Applicant: a low-income homeowner in the fictional borough of Alderwick.
- Need: urgent loss of heating, unsafe electrics, structural damage, or another
  safety-critical home repair.
- Functional preference: keyboard navigation and reduced cognitive load through
  one-question-at-a-time guidance. Do not assign a diagnosis or disability.
- Council: fictional; no real logos, policy claims, or implication of affiliation.

## Product Principles

- Human and agent share one visible, reversible state.
- The site remains the authority on rules and validation.
- The agent only writes answers the user has confirmed.
- Every agent change is visible in an activity history.
- Adaptation changes presentation, not eligibility or policy.
- Submission is deliberately human-only.
- The demo must be understandable without narration, then stronger with it.

## Proposed WebMCP Tools

Names may change after testing, but responsibilities should remain narrow:

1. `configure_interaction` — switch between overview and guided presentation,
   record keyboard/reduced-motion/plain-language preferences, and visibly apply them.
2. `get_application_step` — return the next incomplete official question plus
   allowed answer shape and relevant requirement identifiers.
3. `propose_answer` — stage one schema-valid answer without changing the
   application; the applicant must visibly confirm or reject it in the page.
4. `explain_requirement` — return the official requirement, a plain-language
   explanation, and what evidence is accepted.
5. `validate_application` — run deterministic eligibility/completeness checks
   and return actionable issues.
6. `get_application_review` — return the complete review and explicitly state
   that final submission requires the human UI.

There is no `submit_application` tool.

## Seeded Demo Data

The demo journey should include:

- Alderwick postcode and owner-occupier status.
- A qualifying low-income/benefit condition.
- Heating failure described too vaguely at first (“boiler problem”).
- A safety/urgency follow-up requiring a clearer answer.
- A contractor estimate or photo/document initially missing.
- A successful review after correction.

Keep the complete journey short enough to demonstrate in under two minutes.

## Scope

### Must Ship

- Responsive, polished public-service UI.
- Overview and one-question-at-a-time guided modes.
- Deterministic state, rules, validation, and review.
- WebMCP registration with feature detection and a useful unsupported-browser note.
- Visible agent activity/history and reversible preference change.
- Human-only final submit with a clearly fictional success state.
- Seed/reset control for reliable demos.
- Automated domain tests, production build, and manual WebMCP test instructions.
- Static deployment, public repository, MIT licence, README, screenshots, and
  a narrated YouTube demo under three minutes.

### Explicitly Out of Scope

- Accounts, authentication, database, payments, uploads, email, real submissions.
- Real council integration or real eligibility advice.
- Multiple civic workflows, generic SDK/platform, analytics, internationalisation.
- LLM/API calls inside the product.
- Accessibility/compliance certification claims.

## Acceptance Criteria

- App builds with `pnpm build` and runs with documented commands.
- Tool schemas and descriptions are narrow enough for correct agent selection.
- Unsupported browsers still provide the normal human application.
- State updates made through tools immediately appear in the UI.
- Invalid inputs do not corrupt application state.
- Validation deterministically produces and then clears the seeded issues.
- Keyboard-only completion is possible; focus remains logical after mode changes.
- Dynamic changes have an `aria-live` announcement and motion respects user preference.
- No agent path can trigger final submission.
- Demo reset restores the exact initial state.

## Submission Narrative

The description and video must answer:

- Why this use case is a strong fit for WebMCP.
- How it creates a better user experience.
- What people and agents can do together that was difficult or impossible before.
- How WebMCP was implemented.

Judge criteria are equally weighted: WebMCP leverage, execution, potential
impact, and creativity/ambition. Optimise the product and evidence for all four.

## Judging Position

Stage One should be a clear pass: the product fits the human-agent open-web
theme and its six tools are a substantive WebMCP implementation rather than DOM
automation. The Stage Two thesis is **a site-controlled collaboration protocol
that adapts presentation while preserving policy authority, auditability, and
human consent**—not merely an agent filling in a council form.

Current risk is uneven evidence, not the concept. WebMCP leverage and execution
are strongest; the public demo and submission must make impact and ambition
equally concrete. The highest-value product refinement is to replace the
agent-supplied `confirmed: true` assertion with a visible pending proposal that
the applicant must confirm in the human interface before the answer is stored.

## Impact Evidence

Use these facts narrowly; neither source measures form abandonment or proves
that WebMCP alone solves digital exclusion.

- The UK government's 2025 Digital Inclusion Action Plan reports that around
  23% of the UK population may struggle to interact with online services. The
  government page cites Lloyds data, so it is an official secondary source:
  https://www.gov.uk/government/publications/digital-inclusion-action-plan-first-steps/digital-inclusion-action-plan-first-steps
- GDS's 2022–24 monitoring found accessibility issues on nearly all 1,203
  public-sector websites and 21 apps tested, with recurring barriers including
  keyboard operation, visible focus, reflow, and contrast. This is a monitored
  sample, not a population prevalence estimate:
  https://www.gov.uk/government/publications/accessibility-monitoring-of-public-sector-websites-and-mobile-apps-from-2022-to-2024/accessibility-monitoring-of-public-sector-websites-and-mobile-apps-from-2022-to-2024
