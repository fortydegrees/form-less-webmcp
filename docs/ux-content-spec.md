# UX and content specification

## Experience thesis

The website knows the rules. The visitor's agent knows their circumstances and
interaction preferences. WebMCP lets them produce the right interface without
transferring policy, consent, or submission authority.

The product demonstrates a universal **pattern** for adaptive interfaces, not an
agent that can arbitrarily redesign any page. Alderwick explicitly publishes
the structure, rules, state, and interface compositions it is willing to support.

## Standard experience

The first view is a credible council application, not a deliberately broken one:

- 34 possible questions across five numbered sections
- nested ownership, benefit/income, repair-specific, and evidence branches
- long-form descriptions, radio groups, select controls, and numeric constraints
- evidence requirements and cross-field checks
- persistent section navigation on wide screens
- full keyboard and small-screen operation
- no prominent Guided or Simplify control

The complete human form remains usable when WebMCP is unavailable. Conditional
questions appear after their controlling answer, as they would in an ordinary
schema-driven form.

## Agent-assisted experience

The agent must call site tools rather than simulate clicks.

1. `inspect_application` retrieves the typed questions, current values,
   constraints, applicability conditions, and agent-write boundaries.
2. `configure_assistance` activates Alderwick's approved focused-pathway layout.
3. The transformation receives focus and reports total, relevant,
   confirmed-not-applicable, remaining, and evidence counts. Undecided
   follow-ups remain visibly separate rather than being called removed.
4. `propose_answers` maps only facts supplied by the visitor into a visible queue.
5. The applicant confirms or rejects proposals individually or confirms the
   reviewed batch. No proposal writes by itself.
6. Confirmed controlling answers recalculate the pathway and reveal applicable
   follow-ups.
7. `explain_requirement` retrieves the official rule in the site's own words.
8. `validate_application` runs schema and cross-field checks.
9. The applicant personally confirms the declaration.
10. `get_application_review` reports `availableToAgent: false`; only the visible
    human Submit button completes the fictional journey.

## Canonical demo request

> Use this site's tools—not browser clicks. I use keyboard navigation. I am the
> sole owner and live at AW2 4LA, with proof of ownership ready. I receive
> Universal Credit, have under £6,000 in savings, and my boiler failed two days
> ago. There is no heating or hot water, but I have temporary electric heaters.
> I have a £2,450 written estimate from Alderwick Heating Services but no photos.

The opening description supports exactly fifteen proposals. The applicant must
review them before anything is stored. The declaration remains unavailable to
the agent and is the only question left for the applicant. After the route is
resolved, 16 of 34 questions apply.

## Visual language

- Service green: official form, rules, deterministic checks
- Agent blue: WebMCP connection, pathway composition, tool activity
- Human amber: proposal decisions, declaration, submission
- Issue red: validation only

The before/after contrast must be legible without narration:

- Before: dense multi-section service application
- After: blue personal-pathway workspace, live branch counts, one relevant
  question, contextual rule, evidence plan, and collaboration trail

## Authority and consent

- The agent can inspect, adapt, explain, propose, validate, and review.
- The agent cannot confirm an answer, make the declaration, or submit.
- The applicant can always reject a proposal or return to the standard form.
- Rules and validation are deterministic and shared with the normal UI.
- Activity language must distinguish tool calls from human decisions.

## Accessibility acceptance

- Skip link is the first keyboard stop.
- Native labels, fieldsets, legends, radios, checkboxes, and buttons are used.
- Errors are linked with `aria-describedby` and `aria-invalid`.
- Transformations and proposal arrival move focus to the new decision context.
- A polite live region announces state changes.
- Progress exposes numeric progressbar values.
- Reduced-motion preference and the OS setting disable smooth transitions.
- Layout reflows at 320px without horizontal overflow.
- Do not claim WCAG certification; report the exact behaviours tested.

## Content boundaries

- Alderwick is visibly fictional.
- Do not ask for real names, email addresses, telephone numbers, or uploads.
- Do not request medical details.
- Emergency copy directs immediate danger away from the prototype.
- Do not imply real eligibility or advice.
