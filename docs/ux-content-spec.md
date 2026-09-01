# Alderwick urgent home-repair grant: UX and content specification

Status: implementation-ready draft for review  
Scope: fictional prototype only; not legal, policy, benefits, or eligibility advice

## 1. Service promise and permanent caveat

Service name: **Alderwick urgent home-repair grant**

Use this permanent banner on every screen, including review and success:

> Fictional prototype
> This is a demonstration service. Alderwick is not a real council and no
> application, document or personal information is sent anywhere.

Start-page summary:

> Use this fictional service to apply for help with a repair that is making
> your home unsafe or leaving it without an essential service. You can complete
> the form yourself or use a compatible agent to work through it with you.

Safety inset, shown before repair questions and repeated when a user selects an
urgent impact:

> If anyone is in immediate danger, leave the property and contact the
> emergency services. This demo cannot arrange emergency help.

The interface must never describe the rules as real Alderwick policy, imply
that funding exists, or promise contact from a council team.

## 2. Tone and content rules

- Calm, direct and specific. Say what the user needs to do next.
- Use “you” and “your home”; use “we” only for a clearly labelled action by the
  fictional service, never to imply a real council team exists.
- Prefer common words: “repair”, “proof”, “check”, “answer”, “send”. Explain
  “owner-occupier” rather than relying on it as a label.
- One instruction per sentence. Put the action before the reason.
- Do not use “invalid”, “failed”, “illegal”, “vulnerable person”, “disabled
  user”, or “the agent decided”. Describe the answer or functional preference.
- Errors must identify the field, explain the problem and say how to fix it.
- Agent actions use “Agent” as the subject. Human actions use “You”. Automated
  results use “Application check”.
- Always write **Submit application** for the human-only final action. Never
  use “complete”, “confirm” or “continue” as a substitute at that point.
- Do not claim accessibility or WCAG compliance. Describe tested behaviours.

## 3. Information architecture

The normal human journey remains complete without WebMCP. Guided mode changes
presentation, not the questions, stored answers, order, rules or submit rights.

1. **Service overview**
   - Prototype banner
   - What the grant covers
   - Who can use the fictional scheme
   - What information is needed
   - “Start or continue application” primary action
   - WebMCP availability note
2. **Application**
   - Overview mode: all eight question sections on one page
   - Guided mode: the same questions, one at a time, in the same order
   - Persistent completion status, preference control and agent activity access
3. **Check results**
   - Error summary followed by field-level issues
   - Separate “Based on the demo rules, you are not eligible” result for hard
     eligibility failures
4. **Review**
   - Answers grouped into Home, Finances, Repair and Evidence
   - Edit links with unique accessible names
   - Agent activity summary
   - Human-only submission notice and button
5. **Success**
   - Fictional confirmation and deterministic demo reference
   - Explicit statement that nothing was sent
   - Reset action

Persistent utility actions:

- **Change how this form is shown**
- **View activity** with a count of recorded activity entries
- **Reset demo**; this opens a confirmation dialog

Unsupported-browser note:

> Agent collaboration is not available in this browser. You can still complete
> every step of the application yourself.

Supported, no-agent-yet note:

> This browser supports agent collaboration. You can ask a compatible agent to
> explain a rule, change the presentation or record an answer you have confirmed.

## 4. Fictional scheme rules

All money thresholds, postcodes, evidence types and decisions below are created
for this prototype. Put them in one shared deterministic domain definition so
the visible UI and WebMCP tools return the same result.

| ID | Fictional rule | Deterministic result |
| --- | --- | --- |
| `REQ-AREA` | The property must have an Alderwick demo postcode in `AW1` to `AW4`. | Normalise spaces and uppercase before matching `^AW[1-4] [0-9][A-Z]{2}$`. Anything else is ineligible. |
| `REQ-HOME` | The applicant must own the property and live there as their main home. | `owner_occupier=yes` is eligible. `no` is ineligible. |
| `REQ-INCOME` | The household must receive Universal Credit, Pension Credit, Income Support, income-based Jobseeker’s Allowance, income-related Employment and Support Allowance or Housing Benefit, or have annual household income below £25,000 before tax. | `qualifying_benefit` or `income_under_25000` is eligible. `neither` is ineligible; `not_sure` blocks review until resolved. |
| `REQ-URGENT` | The repair must currently remove an essential service or create an immediate electrical, structural or water-related safety risk. | Any defined urgent impact except `no_immediate_risk` qualifies. `no_immediate_risk` is ineligible. |
| `REQ-COST` | The expected total repair cost, including tax, must be from £250 to £7,500 inclusive. | A finite whole-pound value in the range qualifies. Outside the range is ineligible. |
| `REQ-EVIDENCE` | The applicant must have a contractor estimate, clear photos of the problem, or both. | `estimate_ready`, `photos_ready` or `both_ready` is complete. `none_ready` is incomplete. No upload occurs in this prototype. |

Completeness rule `COMP-DESCRIPTION`: trim the repair description. It is
incomplete when it is under 30 characters or when its lowercase value exactly
matches one of: `boiler problem`, `heating problem`, `electrical problem`,
`roof problem`, `water problem`. This deliberately catches the seeded vague
answer; it is not a natural-language safety classifier.

Run all applicable checks at once. Do not hide completeness errors because an
eligibility error also exists. Submission is enabled only when every
eligibility and completeness check passes.

## 5. Canonical question set

Question order and IDs are stable across overview mode, guided mode, WebMCP
tools, activity history and review. Required markers must be textual, not only
colour or an asterisk.

### 1. `property_postcode`

- Label: **What is the property postcode?**
- Type: single-line text; autocomplete `postal-code`; maximum 8 visible
  characters after normalisation
- Hint: “For this demo, use an Alderwick postcode from AW1 to AW4.”
- Example: `AW2 4LA`
- Requirement: `REQ-AREA`
- Review label: **Property postcode**

### 2. `owner_occupier`

- Legend: **Do you own the property and live there as your main home?**
- Type: radios, no preselection
- Options: `yes` — **Yes**; `no` — **No**
- Hint: “This is sometimes called being an owner-occupier.”
- Requirement: `REQ-HOME`
- Review label: **Own and live in the property**

### 3. `financial_criterion`

- Legend: **Which financial condition applies to your household?**
- Type: radios, no preselection
- Options:
  - `qualifying_benefit` — **Someone in the household receives an
    income-related benefit**
  - `income_under_25000` — **Annual household income is below £25,000 before tax**
  - `neither` — **Neither of these**
  - `not_sure` — **I’m not sure**
- Hint: “Qualifying benefits for this demo are Universal Credit, Pension Credit,
  Income Support, income-based Jobseeker’s Allowance, income-related Employment
  and Support Allowance and Housing Benefit. Otherwise, use income before tax
  for everyone who normally lives in the home.”
- Requirement: `REQ-INCOME`
- Review label: **Financial condition**

### 4. `repair_type`

- Legend: **What needs repairing?**
- Type: radios, no preselection
- Options: `heating` — **Heating or hot water**; `electrics` — **Electrical
  system**; `structure` — **Walls, roof or structure**; `water_ingress` —
  **Water entering the home**; `other` — **Another urgent repair**
- Hint: “Choose the main problem. You can add detail next.”
- Review label: **Type of repair**

### 5. `repair_description`

- Label: **Describe what has happened**
- Type: textarea; minimum 30 useful characters for validation; maximum 500
  characters; show remaining count only after 400 characters
- Hint: “Say what has stopped working or become unsafe, and when it began. Do
  not include medical details.”
- Requirement: `COMP-DESCRIPTION`
- Review label: **What happened**

### 6. `urgent_impact`

- Legend: **How is the problem affecting the home now?**
- Type: radios, no preselection
- Options:
  - `no_heating_or_hot_water` — **There is no main heating or hot water**
  - `dangerous_electrics` — **There are sparks, burning smells or exposed live parts**
  - `unsafe_structure` — **Part of the home may collapse or cannot be used safely**
  - `active_water_risk` — **Water is entering and may damage electrics or the structure**
  - `other_immediate_risk` — **There is another immediate safety risk**
  - `no_immediate_risk` — **None of these**
- Hint: “Choose the closest answer.”
- Requirement: `REQ-URGENT`
- Review label: **Current impact**

### 7. `estimated_cost`

- Label: **What is the expected repair cost?**
- Type: text input with `inputmode=numeric`; store an integer number of pounds,
  not a formatted string
- Prefix: **£**
- Hint: “Enter a whole amount from £250 to £7,500, including tax. A rough
  amount is enough for this demo.”
- Requirement: `REQ-COST`
- Review label: **Expected cost**; display with thousands separator, for example
  **£3,200**

### 8. `evidence_status`

- Legend: **What supporting evidence do you have?**
- Type: radios, no preselection
- Options: `estimate_ready` — **A contractor estimate**; `photos_ready` —
  **Clear photos of the problem**; `both_ready` — **An estimate and photos**;
  `none_ready` — **Neither is ready**
- Hint: “You will not upload anything in this prototype.”
- Requirement: `REQ-EVIDENCE`
- Review label: **Evidence ready**

## 6. Requirement explanations

`explain_requirement` and the visible “Explain this rule” disclosure use the
same three-part content. Do not generate or paraphrase these at runtime.

| ID | Official demo rule | Plain-language explanation | Evidence this fictional scheme accepts |
| --- | --- | --- | --- |
| `REQ-AREA` | The home must be in an AW1, AW2, AW3 or AW4 postcode. | This demo only covers the fictional borough of Alderwick. | The postcode answer is enough in the prototype. |
| `REQ-HOME` | You must own the property and live there as your main home. | This particular demo grant is for owner-occupiers, not landlords or tenants. | A mortgage statement, title record or similar proof would be accepted in a real version. Nothing is uploaded here. |
| `REQ-INCOME` | Your household must receive one of the benefits listed in the question or have annual income below £25,000 before tax. | You need to meet one of the two financial conditions, not both. | A benefit decision notice or a recent household income summary would be accepted. Nothing is uploaded here. |
| `REQ-URGENT` | The repair must remove an essential service or create an immediate safety risk. | The scheme is for problems that need prompt attention, not routine improvements. | Your impact answer and repair description are used for this demo. |
| `REQ-COST` | The repair must be expected to cost between £250 and £7,500 including tax. | Costs outside this range are not covered by the fictional scheme. | A contractor estimate would show the expected total. |
| `REQ-EVIDENCE` | You must have a contractor estimate, clear photos, or both. | Tell us what you already have. The demo does not upload or inspect files. | One estimate, clear photos, or both. |

## 7. Seeded journey

First page load, “Load demo answers” and “Reset demo” restore the following exact
answer state while leaving the application unsubmitted:

| Question | Initial seeded answer | Corrected answer for successful path |
| --- | --- | --- |
| `property_postcode` | `AW2 4LA` | unchanged |
| `owner_occupier` | `yes` | unchanged |
| `financial_criterion` | `qualifying_benefit` | unchanged |
| `repair_type` | `heating` | unchanged |
| `repair_description` | `boiler problem` | `The boiler stopped working two days ago. There is no heating or hot water.` |
| `urgent_impact` | `no_heating_or_hot_water` | unchanged |
| `estimated_cost` | `3200` | unchanged |
| `evidence_status` | `none_ready` | `estimate_ready` |

Initial presentation preferences:

- `presentation=overview`
- `show_keyboard_hints=false`
- `plain_language_explanations=false`
- `reduce_motion=false`, while still obeying the operating-system reduced-motion
  preference

The judge prompt “I use keyboard navigation and need this explained one
question at a time” should lead the agent to set:

- `presentation=guided`
- `show_keyboard_hints=true`
- `plain_language_explanations=true`

Keyboard operability is unconditional. The keyboard preference only reveals
shortcuts/hints and influences focus guidance; it never turns keyboard support
on or off.

Expected first validation result:

> 2 things need attention before review.

1. `repair_description`: vague description
2. `evidence_status`: no evidence ready

After the two corrections, validation returns zero issues and review becomes
available. The complete seeded demonstration should require no invented names,
email addresses, phone numbers or real personal data.

## 8. Validation and error copy

On “Check application”, move focus to the error-summary heading if there are
issues. Summary links use the same actionable text as field errors and move
focus to the related control. Do not clear valid answers.

Summary heading:

> There is a problem

Summary introduction:

> Fix these answers before you review the application.

| Condition | Field error / summary link text |
| --- | --- |
| Postcode empty | Enter the property postcode. |
| Postcode format does not match the fictional format | Enter an Alderwick demo postcode, for example AW2 4LA. |
| Postcode is well formed but outside AW1–AW4 | Enter a postcode in the fictional Alderwick area, from AW1 to AW4. |
| Ownership unanswered | Select whether you own the property and live there as your main home. |
| Ownership `no` | This fictional grant is only for people who own and live in the property. |
| Financial condition unanswered | Select the financial condition that applies to your household. |
| Financial condition `not_sure` | Find out whether your household receives an income-related benefit or has annual income below £25,000, then select an answer. |
| Financial condition `neither` | This fictional grant is only for households that meet one of the financial conditions. |
| Repair type unanswered | Select the main type of repair. |
| Repair description empty | Describe what has happened. |
| Repair description is under 30 characters or on the generic-answer list | Add more detail: say what has stopped working or become unsafe, and when it began. |
| Repair description exceeds 500 characters | Shorten the description to 500 characters or fewer. |
| Urgent impact unanswered | Select how the problem is affecting the home now. |
| Urgent impact `no_immediate_risk` | This fictional grant only covers loss of an essential service or an immediate safety risk. |
| Expected cost empty | Enter the expected repair cost. |
| Expected cost is not a whole number | Enter the cost in whole pounds, without pence. |
| Expected cost below £250 | Enter a cost of at least £250 for this fictional grant. |
| Expected cost above £7,500 | Enter a cost of no more than £7,500 for this fictional grant. |
| Evidence unanswered | Select what supporting evidence you have. |
| Evidence `none_ready` | You need a contractor estimate or clear photos before review. |

For a hard eligibility failure, retain the answers and show:

> Based on the fictional demo rules, you cannot continue to review yet.
>
> You can change your answers. This result is not real eligibility advice and
> no information has been sent.

Agent-tool validation returns the issue ID, question ID, requirement ID,
severity (`ineligible` or `incomplete`) and the exact user-facing text above.

## 9. Guided-mode interaction copy and behaviour

Guided header:

> One question at a time

Progress text: **Question {current} of 8**. Do not use a progress bar without
the text equivalent.

Primary and secondary actions:

- **Save and continue**
- **Back**
- **Explain this rule** when a requirement applies
- **Review all answers** after question 8
- **Show all questions** to return to overview mode

Keyboard-hint text when enabled:

> Keyboard hint: use Tab to move through controls and Space to choose an option.

Do not add custom arrow-key handling to native radio groups. Browser-native
keyboard behaviour remains authoritative.

Mode-change status:

> Guided mode is on. Showing question {current} of 8: {question label}.

Overview-change status:

> All questions are now shown on one page. Your answers have not changed.

Explanation disclosure headings:

- **The demo rule**
- **What this means**
- **What evidence is accepted**

Agent-recorded answer behaviour:

- Show the saved answer immediately in the ordinary form control and activity
  history.
- Announce: **Agent saved {review label}: {display value}.**
- In guided mode, reveal the next incomplete question. Do not steal focus from
  an existing focused control. If the focused element is removed by the mode
  change, move focus to the new question heading.
- Never use “the agent chose” or infer confirmation. The activity wording states
  that the answer was recorded after user confirmation because the tool contract
  requires that confirmation.
- Invalid or unknown tool input changes no state and returns the matching field
  error. Announce: **The agent could not save that answer. {error text}**

## 10. Agent activity language

Activity heading: **Agent activity**

Empty state:

> No agent changes yet. Changes made by an agent will appear here.

Use a visible ordered list, newest first, with a concise event label and optional
details. “Just now” may be displayed, but it must not be the only event label.

Templates:

- Preference: **Agent changed the form to one question at a time.**
- Preference: **Agent showed keyboard hints.**
- Preference: **Agent turned on plain-language explanations.**
- Preference: **Agent reduced non-essential motion.**
- Preference reversal: **You changed the form back to show all questions.**
- Answer: **Agent recorded “{display value}” for “{question label}” after your confirmation.**
- Answer changed: **Agent changed “{question label}” from “{old display value}” to “{new display value}” after your confirmation.**
- Explanation: **Agent explained “{requirement short label}” using the service’s demo rule.**
- Validation with issues: **Agent checked the application. {count} {thing/things} need attention.**
- Validation clear: **Agent checked the application. No issues were found.**
- Review: **Agent prepared the application review. Only you can submit it.**

Do not log tool discovery, failed calls with raw technical details, hidden
reasoning, browser capabilities or the content of agent prompts. Failed saves
may appear as a non-persistent status message but do not belong in activity.

## 11. Review, submission and success copy

Review heading:

> Check your answers before you submit

Intro:

> Review every answer. You can change anything that is not right. Nothing has
> been sent yet.

Group answers under **Your home**, **Financial condition**, **The repair** and
**Supporting evidence**. Each “Change” link has a unique accessible name such
as **Change property postcode** and returns to the relevant question. Returning
from an edit restores focus to that answer row on review.

Agent summary:

> Your agent recorded {count} {answer/answers} after your confirmation and ran
> the application check. View agent activity.

If no agent changed an answer:

> You completed these answers without agent changes.

Human-only notice immediately before the final button:

> You must submit this yourself
>
> An agent can help check and explain your answers, but it cannot submit this
> application. Select the button below when you are ready.

Final button: **Submit application**

The submit control must not be registered, wrapped or indirectly invokable as
a WebMCP tool. It is enabled only in the visible UI after a passing validation.

Success state:

> Demo application submitted
>
> Your fictional reference is **ALD-DEMO-2047**.
>
> Nothing was sent to a council. No one will contact you. This confirmation is
> only the final screen of the prototype.

Success action: **Reset and run the demo again**

Reset confirmation dialog:

- Heading: **Reset the demo?**
- Body: “This clears every answer, preference and activity entry, then restores
  the original demo state.”
- Destructive action: **Reset demo**
- Secondary action: **Keep current answers**
- Completion announcement: **Demo reset. Original answers and presentation restored.**

## 12. Accessibility implementation checklist

This is a functional QA checklist, not a certification claim.

### Keyboard and focus

- [ ] Every action and answer is operable with keyboard alone in both modes;
  there are no keyboard traps or hover-only controls.
- [ ] A skip link moves focus to the main content.
- [ ] Focus order follows reading order, and focus indicators remain clearly
  visible against every background.
- [ ] Changing presentation preserves the current question and answers. Move
  focus to the current question heading only when the previously focused element
  no longer exists.
- [ ] After failed validation, focus moves to the error-summary heading. Summary
  links move focus to the erroneous field or fieldset.
- [ ] “Change” links from review return to the related question; returning to
  review restores focus to the edited answer.
- [ ] Dialog focus is trapped only while the reset dialog is open, Escape closes
  it, and closing restores focus to the opener.

### Semantics and names

- [ ] Each screen has one descriptive `h1`; headings do not skip levels.
- [ ] Radio groups use `fieldset` and `legend`; text inputs use explicit labels.
- [ ] Required state, hints and errors are associated programmatically with the
  control, with errors announced once rather than duplicated.
- [ ] Buttons perform actions and links navigate. Icon-only controls have an
  accessible name, but prefer visible text for critical actions.
- [ ] Review uses a semantic description list or equivalent; each edit link has
  a unique accessible name.
- [ ] Page/document title identifies the service and current state, for example
  “Check your answers — Alderwick urgent home-repair grant”.

### Dynamic changes and agent actions

- [ ] One persistent polite live region announces mode changes, saved agent
  answers, validation results and reset completion.
- [ ] Urgent failures that block the immediate action may use an assertive alert;
  ordinary progress and activity updates remain polite.
- [ ] Visible activity and live announcements identify whether an answer was
  changed by the user, agent or application check.
- [ ] Live messages do not expose raw IDs, tool payloads or technical errors.
- [ ] New activity does not move focus or auto-open the activity panel.

### Visual presentation, zoom and motion

- [ ] Text and interactive controls target at least 4.5:1 contrast; large text
  and essential graphical boundaries target at least 3:1. Test focus indicators
  separately.
- [ ] Content reflows without loss or two-dimensional page scrolling at 400%
  browser zoom / 320 CSS-pixel width, except any genuinely two-dimensional item.
- [ ] Text spacing can be increased without clipping, overlap or hidden controls.
- [ ] No meaning depends on colour, position, animation or an icon alone.
- [ ] Controls have a practical pointer target and adequate separation on small
  screens.
- [ ] `prefers-reduced-motion: reduce` removes non-essential transitions even if
  the in-product motion preference is off. The in-product preference can reduce
  motion further, never override the operating system.
- [ ] No content flashes, auto-advances, times out or requires a timed response.

### Plain language and cognitive load

- [ ] The prototype caveat is visible and understandable on every state.
- [ ] Guided mode presents one complete question, its hint, errors and actions
  without unrelated form content.
- [ ] Instructions use the exact labels of controls and do not rely on “above”,
  “below”, shape or colour.
- [ ] Explanations preserve the official fictional rule and separately provide
  the plain-language version; adaptation never changes eligibility.
- [ ] Avoid unexplained abbreviations, double negatives and diagnosis-based
  assumptions. Ask only for functional preferences.
- [ ] Error copy is tested with the seeded failures and remains useful when read
  out of visual context from the summary.

## 13. Implementation acceptance hooks

- The UI, WebMCP handlers, validation and review use the eight canonical IDs and
  six requirement IDs above.
- Reset reproduces the seeded answer and preference state byte-for-byte and
  clears submission and activity history.
- The first seeded validation returns exactly two issues: vague description and
  missing evidence. The corrected state returns none.
- Switching modes does not change validation output or stored answers.
- Every successful agent write produces one visible activity entry. Human-only
  submission produces no agent activity entry.
- All WebMCP user-facing text is drawn from this specification or the same
  central content constants as the visible interface.
- Unsupported WebMCP leaves the full human application usable.

## 14. Sources, assumptions and open decisions

Sources used:

- `PROJECT.md` and `docs/worker-packets/ux-content.md` are the product authority.
- GOV.UK Design System patterns informed the question-page, error-message and
  error-summary structure: <https://design-system.service.gov.uk/patterns/question-pages/>,
  <https://design-system.service.gov.uk/components/error-message/>, and
  <https://design-system.service.gov.uk/components/error-summary/>.
- GOV.UK content guidance informed the direct, action-led language:
  <https://www.gov.uk/guidance/content-design/writing-to-gov-uk-standards/writing-guidelines>.

These sources inform interaction and writing patterns only. The Alderwick
scheme, rules, thresholds, postcode area, grant amount and evidence policy are
entirely fictional and have not been checked against any real council scheme.

Assumptions:

- Eight questions remain short enough for the under-two-minute seeded demo when
  an agent records confirmed answers.
- Evidence is a declared readiness state because uploads, document inspection
  and storage are out of scope.
- No contact details are collected because the prototype sends nothing and the
  demo should avoid personal data.
- The deterministic reference `ALD-DEMO-2047` is acceptable for a resettable,
  non-transactional success screen.

Uncertainties / lead decisions:

- Confirm the final public submission name; until then, use the service name in
  this document and keep any project codename out of applicant-facing copy.
- Visual treatment, responsive breakpoints and whether activity is a sidebar,
  drawer or inline section remain design decisions, provided reading and focus
  order meet this specification.

Missing items:

- None blocking implementation. Usability testing with keyboard and a screen
  reader is still required before making any public accessibility claim.
