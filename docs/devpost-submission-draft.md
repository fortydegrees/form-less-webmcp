# Devpost submission draft

Status: form inspected read-only on 1 September 2026. Do not paste claims or
URLs until the matching release evidence exists. Final submission remains a
human-authorised action.

## Form map

### Project overview

- Project name: required, 60 characters. Approved as `Right Questions`.
- Elevator pitch: required, 200 characters.
- Thumbnail: JPEG, PNG, or GIF.

### Project details

- About the project: required Markdown field. No visible character limit.
- Built with: required, up to 25 tags.
- Project links: optional repeatable URLs.
- Image gallery: optional, up to 15 JPEG/PNG/GIF files, 5 MB each; Devpost
  recommends a 3:2 ratio.
- Video demo: required URL; the challenge rules require a public YouTube video
  under three minutes with audio.

### Additional information

- Submitter type: required; Individual / Team of Individuals / Organization.
- Country of residence: required, multi-select.
- Organization name: conditional.
- App status: required; New / Existing.
- Existing-project explanation: conditional.
- Live WebMCP URL: required.
- Testing instructions or credentials: optional and visible only to Devpost and
  judges.
- Public GitHub/GitLab/Bitbucket repository: required, including a detectable
  open-source licence.
- Agents or clients used to test WebMCP: required free text.
- AI tools used during the project: required free text.
- Learning level: required; None / Moderate / Significant.
- Reusable career value from AI: required; Yes / No.

### Finalisation

- One checkbox confirms every entrant has read and agrees to the Official Rules
  and Devpost Terms of Service.
- `Submit project` is the final external action. Do not select either control
  without David's explicit approval after the release-candidate audit.

## Proposed field values

Project name: `Right Questions`

Elevator pitch (165/200 characters):

> Define a service once. WebMCP lets each visitor's agent negotiate a clearer personal interface—while the website keeps policy authority and the person keeps control.

Built with tags:

`WebMCP`, `TypeScript`, `React`, `Vite`, `Vitest`, `HTML`, `CSS`,
`JSON Schema`, `Chrome`, `ChatGPT`

Project links:

- Live app: `https://fortydegrees.github.io/right-questions-webmcp/`
- Public source: `https://github.com/fortydegrees/right-questions-webmcp`

Submitter type: `Individual`

Country: `United Kingdom`

Organization: leave blank

App status: `New`

Testing instructions:

> No account or credentials are required. Open the live URL in the latest ChatGPT desktop app using GPT-5.6 Sol or Terra, or in Chrome 146+ with WebMCP testing enabled. The app starts as a blank standard application with 34 possible questions across five sections. Ask the agent to use the site's tools rather than browser clicks. Use Reset demo to restore it at any time. The normal human workflow remains available when WebMCP is unsupported.

Agents or clients tested:

> `[FINALISE AFTER RELEASE QA: exact ChatGPT desktop app/client, model and version; Chrome version and WebMCP inspection method]`

AI tools used:

> OpenAI Codex with GPT-5.6 Sol handled implementation, review and test work. OpenClaw coordinated bounded Codex engineering, UX and QA sessions on the local development machine. All product decisions, release approval and final submission remained with the human entrant.

Learning level: `Significant`

Reusable career value: `Yes`

## About the project

### Why this matters

Important public services are often hardest to use when someone is already
under pressure. The UK government's 2025 Digital Inclusion Action Plan reports
that around 23% of people in the UK may struggle to interact with online
services. GDS also found accessibility issues on nearly all 1,203 public-sector
websites and 21 apps it monitored from 2022 to 2024, including recurring
keyboard, focus, contrast and reflow problems.

Alderwick Home Support is a fictional urgent-repair grant service and a concrete
test of a broader idea: a website can define one machine-readable form contract
and use it to serve both people and their chosen agents. The standard experience
is a realistic 34-question application with five sections, nested conditional branches,
evidence requirements and cross-field rules.

Sources:

- https://www.gov.uk/government/publications/digital-inclusion-action-plan-first-steps/digital-inclusion-action-plan-first-steps
- https://www.gov.uk/government/publications/accessibility-monitoring-of-public-sector-websites-and-mobile-apps-from-2022-to-2024/accessibility-monitoring-of-public-sector-websites-and-mobile-apps-from-2022-to-2024

### Why WebMCP is the right fit

Ordinary browser automation makes an agent guess at labels, page structure and
side effects. An embedded chatbot would force every service to provide and pay
for its own model. WebMCP lets the open page publish a small contract to the
visitor's existing agent instead.

Here, the service defines the official questions, accepted answer shapes,
conditional branches, fictional eligibility rules, and approved interface
compositions. The agent can inspect that typed contract, request a focused
pathway, map applicant-provided facts into proposals, explain named requirements,
and run checks. It cannot change policy, invent evidence, confirm proposals,
make the applicant declaration, or submit.

### How it improves the experience

The demo starts as a blank, conventional council application. The visitor tells
their external agent about the repair once. The agent reads the structured form
model—not the DOM—and the page visibly becomes a personal pathway showing how
many questions are relevant, which branches do not apply, what remains, and
which evidence is needed.

The agent can stage several structured answers at once, but the page makes the
human review and confirm them before anything is stored. As answers are
confirmed, conditional branches and the evidence plan recalculate. Every site
tool call appears in a visible case trail. The final declaration and submission
remain human actions.

The site still works as an ordinary responsive, keyboard-operable form when
WebMCP is unavailable. Agent support is an enhancement, not a new access
requirement.

### What people and agents can now do together

The visitor contributes circumstances, preferences, corrections, consent and
the final decision. Their agent contributes context, answer mapping, explanation
and structured checks. The service remains the authority on questions, branches,
rules, validation, and safe UI compositions.

That separation is the useful part. A person no longer has to translate a long
official process into instructions their agent might misunderstand, and the
agent does not need brittle DOM automation or a private integration. They share
one live, inspectable state on the open web.

### How WebMCP was implemented

The top-level page imperatively registers six generic tools through
`document.modelContext.registerTool`:

- `inspect_application`
- `configure_assistance`
- `propose_answers`
- `explain_requirement`
- `validate_application`
- `get_application_review`

Each tool has a narrow JSON Schema, an explicit description, annotations,
runtime validation and a concise structured result. Registration is
feature-detected and cleaned up with an `AbortController` when the React root
unmounts.

`propose_answers` cannot write an application answer. It creates up to ten
visible proposals, and the applicant must confirm or reject them in the page.
The proposal schema is generated from fields marked agent-writable; the final
declaration is deliberately excluded. Confirmation validates again at the human
decision boundary, and no confirmation control is exposed through WebMCP.

JSON Schema 2020-12 defines data types and constraints, a UI schema defines the
five ordinary sections and approved adaptive layout, and a small rules document
holds explainable cross-field policy. One typed adapter drives the standard UI,
personal pathway, deterministic domain engine, and generated tool enums. There
is no shadow agent state, backend, model API, account or network dependency.
Vitest covers schema integrity, branching, multi-answer consent, generated tool
schemas, deterministic rules, and the missing submission capability.

### What we learned

The hard part was not registering tools. It was designing one contract expressive
enough for both interfaces, then deciding where authority should stay. Approved
presentation can adapt. Official rules cannot. Agent suggestions remain visible
and reversible. Declaration and consequential submission belong to the person.

That pattern should transfer beyond grants to benefits, permits, healthcare
administration and other rule-heavy services: **define the form once; render it
for people and expose it safely to agents.**

## Release-dependent fields

Do not finalise these until evidence exists:

- thumbnail
- live URL and deployment ID/runtime proof
- public repository URL and visible licence detection
- exact ChatGPT app/client/model/version used for WebMCP QA
- public YouTube URL, duration and audio check
- image gallery selection and captions
