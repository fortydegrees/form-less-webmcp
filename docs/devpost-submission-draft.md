# Devpost submission draft

Status: form inspected read-only on 1 September 2026. Do not paste claims or
URLs until the matching release evidence exists. Final submission remains a
human-authorised action.

## Form map

### Project overview

- Project name: required, 60 characters. Pending David's decision.
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

Project name: `[FINAL NAME]`

Elevator pitch (186/200 characters):

> A public-service form that adapts around each person, letting their agent explain rules, guide one step at a time and check answers—while the website retains authority and final control.

Built with tags:

`WebMCP`, `TypeScript`, `React`, `Vite`, `Vitest`, `HTML`, `CSS`,
`JSON Schema`, `Chrome`, `ChatGPT`

Project links:

- Live app: `[LIVE_URL]`
- Public source: `[REPO_URL]`

Submitter type: `Individual`

Country: `United Kingdom`

Organization: leave blank

App status: `New`

Testing instructions:

> No account or credentials are required. Open the live URL in the latest ChatGPT desktop app using GPT-5.6 Sol or Terra, or in Chrome 149+ with WebMCP testing enabled. The app starts in a deterministic demo state with two issues. Use Reset demo to restore it at any time. The normal human workflow remains available when WebMCP is unsupported.

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

Alderwick Home Support is a fictional urgent-repair grant service for a
low-income homeowner dealing with lost heating or another safety-critical
problem. It gives us a concrete way to test a broader idea: a public-service
website can work with a visitor's chosen agent without handing policy or final
authority to that agent.

Sources:

- https://www.gov.uk/government/publications/digital-inclusion-action-plan-first-steps/digital-inclusion-action-plan-first-steps
- https://www.gov.uk/government/publications/accessibility-monitoring-of-public-sector-websites-and-mobile-apps-from-2022-to-2024/accessibility-monitoring-of-public-sector-websites-and-mobile-apps-from-2022-to-2024

### Why WebMCP is the right fit

Ordinary browser automation makes an agent guess at labels, page structure and
side effects. An embedded chatbot would force every service to provide and pay
for its own model. WebMCP lets the open page publish a small contract to the
visitor's existing agent instead.

Here, the service defines the official questions, accepted answer shapes,
fictional eligibility rules and validation logic. The agent can change how the
same application is presented, request the next official step, explain a named
requirement, help prepare an answer and run checks. It cannot change policy,
invent evidence or submit the application.

### How it improves the experience

The demo starts as a complete but dense application overview with two seeded
problems: an ambiguous repair description and missing evidence. The visitor can
ask their agent for keyboard-friendly, one-question-at-a-time help. The visible
page switches to guided mode without losing answers or changing any rule.

The agent can explain why evidence is needed in the site's own words and run
the same deterministic checks as the human interface. Each agent action appears
in a shared activity history. The final review shows every answer and change.
Submission remains a human action.

The site still works as an ordinary responsive, keyboard-operable form when
WebMCP is unavailable. Agent support is an enhancement, not a new access
requirement.

### What people and agents can now do together

The visitor contributes intent, corrections, consent and the final decision.
Their agent contributes navigation, explanation, continuity and structured
checks. The service remains the authority on questions, rules and validation.

That separation is the useful part. A person no longer has to translate a long
official process into instructions their agent might misunderstand, and the
agent does not need brittle DOM automation or a private integration. They share
one live, inspectable state on the open web.

### How WebMCP was implemented

The top-level page imperatively registers six tools through
`document.modelContext.registerTool`:

- `configure_interaction`
- `get_application_step`
- `record_confirmed_answer` `[UPDATE NAME/BEHAVIOUR AFTER HUMAN-CONFIRMATION CHANGE]`
- `explain_requirement`
- `validate_application`
- `get_application_review`

Each tool has a narrow JSON Schema, an explicit description, annotations,
runtime validation and a concise structured result. Registration is
feature-detected and cleaned up with an `AbortController` when the React root
unmounts.

The human interface and WebMCP handlers use the same TypeScript domain model and
external store. There is no shadow agent state, backend, model API, account or
network dependency. Vitest covers the six-tool contract, deterministic rules,
invalid inputs, visible changes and the missing submission capability.

### What we learned

The hard part wasn't registering tools. It was deciding where authority should
stay. Presentation can adapt freely. Official rules cannot. Agent suggestions
must remain visible and reversible. Consequential submission belongs to the
person.

That pattern should transfer beyond grants to benefits, permits, healthcare
administration and other rule-heavy services: let a person's chosen agent help,
but let the site define the safe contract.

## Release-dependent fields

Do not finalise these until evidence exists:

- final project name and thumbnail
- live URL and deployment ID
- public repository URL and visible licence detection
- exact ChatGPT app/client/model/version used for WebMCP QA
- public YouTube URL, duration and audio check
- image gallery selection and captions
- final tool name after the visible human-confirmation change
