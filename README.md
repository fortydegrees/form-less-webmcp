# Civic Adaptive WebMCP

> Competition-build codename; final public name pending.

A fictional urgent home-repair grant service showing how a visitor and their
chosen agent can work through a difficult public process together. The service
publishes six narrow WebMCP tools while retaining deterministic rules, one
visible shared state, and a deliberately human-only final submission.

The seeded demo starts with a vague repair description and missing evidence.
An agent can switch the same application into one-question guided mode, explain
site-authored requirements, propose answers for the applicant to confirm visibly,
and run validation. A proposal never changes the application by itself, and
every decision appears in the activity history. The applicant reviews the result
and presses Submit themselves.

The Alderwick service and all its rules are fictional. It is a technology demo,
not a real application or source of eligibility advice.

## WebMCP tools

- `configure_interaction` changes presentation preferences, never policy or answers.
- `get_application_step` returns the next incomplete or invalid official question.
- `propose_answer` stages one schema-valid answer for visible human confirmation.
- `explain_requirement` returns the site-authored rule and accepted evidence.
- `validate_application` runs the service's deterministic checks.
- `get_application_review` returns answers, issues, and visible agent changes.

There is no submission tool. Unsupported browsers retain the full human workflow.

## Local development

```bash
pnpm install
pnpm dev
```

Production verification:

```bash
pnpm build
pnpm preview
```

Automated verification:

```bash
pnpm test
pnpm lint
pnpm build
```

To inspect live tools, use Chrome 149 or later with WebMCP testing enabled, then
open DevTools → Application → WebMCP. The app feature-detects
`document.modelContext`, registers tools with abort signals, and cleans them up
when the React root unmounts.

## Architecture

- React, TypeScript, and Vite; static deployment with no backend or API keys.
- `src/domain.ts` owns the canonical questions, fictional rules, and validation.
- `src/applicationStore.ts` is the single shared state for UI and tool calls.
- `src/webmcp.ts` contains schemas, annotations, handlers, and registration.
- Domain and WebMCP contracts are covered by Vitest.

See [`PROJECT.md`](PROJECT.md) for scope and acceptance criteria,
[`docs/ux-content-spec.md`](docs/ux-content-spec.md) for the canonical journey,
and [`docs/qa-submission-plan.md`](docs/qa-submission-plan.md) for browser,
evaluation, and submission evidence.

## Licence

MIT — see [`LICENSE`](LICENSE).
