# Right Questions

**The website knows the rules. Your agent knows you. Together they produce the
right interface.**

This fictional urgent home-repair grant demonstrates a reusable pattern for
personally adaptive web interfaces. The standard experience is a conventional
34-question council application with five sections, nested conditional branches,
evidence requirements, and cross-field rules. A visitor can ask their external
agent to inspect the service's structured contract and activate a focused
pathway containing only the questions relevant to their confirmed answers.

The agent can map information the visitor already supplied into visible answer
proposals, retrieve site-authored rules, and run deterministic checks. Every
proposal requires human confirmation. The applicant declaration and final
submission are never available as tools.

Alderwick and all policy in this repository are fictional. This is a technology
demo, not a real application or source of eligibility advice.

## One contract, four consumers

- [`src/form.schema.json`](src/form.schema.json) defines 34 fields, types,
  allowed values, constraints, conditional applicability, and agent-write
  boundaries using JSON Schema 2020-12 plus namespaced presentation metadata.
- [`src/form.ui.json`](src/form.ui.json) groups the fields into five ordinary
  service sections and declares the approved focused-pathway layout.
- [`src/form.rules.json`](src/form.rules.json) holds seven fictional official
  requirements and the small set of cross-field policy checks JSON Schema alone
  should not pretend to explain.
- [`src/formDefinition.ts`](src/formDefinition.ts) is the typed adapter used by
  the standard UI, adaptive UI, deterministic domain engine, and WebMCP tools.

The service is not a universal agent-controlled reskinning engine. The website
explicitly defines which compositions are safe; the visitor's agent chooses
among those capabilities using context the website does not already have.

## WebMCP tools

- `inspect_application` returns the form structure, live values, branches,
  allowed values, and current pathway—without DOM scraping.
- `configure_assistance` activates the site-approved focused layout and
  interaction preferences without changing answers or policy.
- `propose_answers` stages up to ten schema-valid answers for visible human
  confirmation; it cannot propose the applicant declaration.
- `explain_requirement` returns a named site-authored rule and evidence guidance.
- `validate_application` runs deterministic schema and service-rule checks.
- `get_application_review` returns relevant answers, issues, pathway, and the
  explicit human-only submission boundary.

There is no submission tool. Unsupported browsers retain the complete standard
human workflow.

The default page presents as the council service, not as an architecture demo.
A compact `WebMCP · 6 tools` button opens an optional judge panel with connection
status, tool roles, the canonical prompt, and the human/agent authority boundary.

## Local development

```bash
pnpm install
pnpm dev
```

Verification:

```bash
pnpm test
pnpm lint
pnpm build
```

To inspect live tools, use Chrome 146 or later with **WebMCP for testing**
enabled and Chrome fully relaunched. For an agent-driven demo, open the page in
ChatGPT's built-in browser and ask the model to use the site's tools rather than
browser clicks.

## Architecture

- React, TypeScript, Vite, static deployment; no backend, accounts, API keys,
  model calls, uploads, or external data.
- `src/domain.ts` interprets the contract and owns canonical application state,
  applicability, validation, consent, review, and submission boundaries.
- `src/applicationStore.ts` exposes one shared state to both UI and WebMCP.
- `src/webmcp.ts` derives question and requirement enums from the contract and
  registers six generic tools with abort-signal cleanup.
- Vitest covers schema integrity, branching, policy rules, multi-answer consent,
  generated tool schemas, and the absent submission capability.

See [`PROJECT.md`](PROJECT.md) for the product source of truth and
[`docs/qa-submission-plan.md`](docs/qa-submission-plan.md) for the release gates.

## Licence

MIT — see [`LICENSE`](LICENSE).
