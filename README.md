# Right Questions

[![Test, lint, build and deploy](https://github.com/fortydegrees/right-questions-webmcp/actions/workflows/deploy-pages.yml/badge.svg)](https://github.com/fortydegrees/right-questions-webmcp/actions/workflows/deploy-pages.yml)

**The website knows the rules. Your agent knows you. Together they produce the
right interface.**

Right Questions demonstrates a WebMCP pattern for public services. A fictional
council application has 34 possible questions, nested pathways, evidence
requirements and deterministic policy checks. A visitor's agent can inspect
that structure and ask the site to assemble a focused pathway for their
circumstances.

The website still owns the rules and interface. The applicant still owns every
answer, the declaration and submission.

[Try the live application](https://fortydegrees.github.io/right-questions-webmcp/)

![The focused Right Questions pathway showing 34 possible questions reduced to 16, with 18 questions not needed](docs/assets/personal-pathway.jpg)

## What changes

- **34 possible questions → 16 on the canonical route → 18 not needed** once
  the applicant confirms the routing choices.
- **10 answers proposed → 0 stored** until the applicant reviews and accepts
  them.
- **6 WebMCP tools → 0 submission tools.** The agent can inspect, adapt,
  explain, propose, validate and review. It cannot declare or submit.

This is not an AI form filler or an arbitrary page reskin. It is a cooperating
website exposing its own structure, rules and approved layouts to an external
agent.

## Judge walkthrough

Use the ChatGPT desktop built-in browser with Site Tools enabled:

1. Open the [live application](https://fortydegrees.github.io/right-questions-webmcp/).
2. Open **Site tools → Available site tools** and confirm that six tools are
   listed. The green **WebMCP · 6 tools** button on the page describes their
   roles and confirms that no submission tool exists.
3. Send this in the same chat:

   > Use this site's tools, not browser clicks. I use keyboard navigation. I
   > own and live at AW2 4LA, receive Universal Credit, and my boiler failed two
   > days ago. There is no heating or hot water. I have a £2,450 written
   > estimate but no photos.

4. Watch the site switch from the complete application to its approved focused
   layout. Ten suggested answers appear, while every current answer remains
   visibly **Not answered**.
5. Review and accept the suggestions in the webpage. The site recalculates the
   pathway and removes branches that do not apply.
6. Ask the agent to validate and review the application. It can return official
   rules and deterministic issues, but it cannot make the declaration or press
   **Submit application**.

Chrome 146 or later can also expose the tools with **WebMCP for testing**
enabled, but the flag provides the API rather than an agent. If Site Tools are
unavailable, the complete human form remains usable.

## Before and after

The ordinary service is intentionally competent, but it must represent every
ownership, financial, repair and evidence route. Unresolved conditions are
shown as real form work rather than hidden behind a question counter.

![A section of the complete application showing ownership choices and several conditional follow-up groups](docs/assets/standard-application.jpg)

The agent then stages facts the applicant has already supplied. Nothing enters
the application until the person accepts each suggestion.

![Ten suggested answers awaiting human confirmation, with every current answer still shown as not answered](docs/assets/proposals-awaiting-confirmation.png)

## Why WebMCP

Without WebMCP, an agent must repeatedly inspect page content, infer conditional
relationships, track DOM changes and guess which actions have side effects.
Right Questions instead returns typed questions, current values, allowed
answers, conditions, official explanations and explicit authority boundaries.

One contract drives four consumers:

- [`src/form.schema.json`](src/form.schema.json) defines the 34 fields, types,
  allowed values, constraints, conditional applicability and agent-write
  boundaries.
- [`src/form.ui.json`](src/form.ui.json) defines the five standard sections and
  the council-approved focused layout.
- [`src/form.rules.json`](src/form.rules.json) contains fictional official
  requirements and cross-field checks.
- [`src/formDefinition.ts`](src/formDefinition.ts) is the typed adapter shared
  by the standard UI, adaptive UI, domain engine and WebMCP tools.

See [`docs/architecture.md`](docs/architecture.md) for the state and authority
model.

## WebMCP tools

- `inspect_application` returns the full structured contract and current state.
- `configure_assistance` activates approved presentation preferences without
  changing an answer.
- `propose_answers` stages up to ten schema-valid suggestions for human review.
- `explain_requirement` returns a named site-authored rule and evidence advice.
- `validate_application` runs deterministic schema and service-rule checks.
- `get_application_review` returns the live pathway, answers, issues and the
  explicit human-only submission boundary.

There is deliberately no `submit_application` tool. The applicant declaration
is also excluded from every agent-writable schema.

## Run locally

Requirements: a current Node.js installation and pnpm.

```bash
pnpm install
pnpm dev
```

Run the release gates with:

```bash
pnpm test
pnpm lint
pnpm build
```

Pushes to `main` run all three gates before deploying the static build to
GitHub Pages.

## Implementation

- React, TypeScript and Vite.
- Static deployment with no backend, accounts, API keys, uploads or external
  data.
- One canonical application state shared by the visible interface and WebMCP.
- Deterministic applicability, validation, review and submission boundaries in
  [`src/domain.ts`](src/domain.ts).
- Browser-native tool registration in [`src/webmcp.ts`](src/webmcp.ts).
- Vitest coverage for schema integrity, branching, policy rules, proposal
  consent, generated tool schemas and the absent submission capability.

Codex was the implementation partner for the application, tests and QA. Product
scope, the applicant scenario, authority boundaries and release decisions were
human-directed. No model or external API runs inside the shipped product.

Alderwick Council and every policy, applicant detail and reference number in
the demo are fictional. Right Questions is not a real application or source of
eligibility advice.

## Licence

MIT — see [`LICENSE`](LICENSE).
