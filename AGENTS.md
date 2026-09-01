# WebMCP Civic Project Instructions

## Mission

Ship a polished, working WebMCP challenge entry before 3 September 2026 at
21:00 BST. The product is a fictional UK-style urgent home-repair grant service
that becomes easier to use when a person and their chosen agent collaborate.

Read `PROJECT.md` before changing implementation. Treat it as the product and
scope source of truth. Read the relevant file in `docs/worker-packets/` when a
task names a worker lane.

## Working Rules

- Use pnpm only.
- Prefer React, TypeScript, and browser-native APIs. Add dependencies only when
  they materially reduce deadline risk.
- Keep policy, eligibility, validation, and workflow state deterministic. Do
  not call a model or external API from the product.
- Keep WebMCP tool handlers thin; shared domain functions must power both the
  visible UI and registered tools.
- Do not expose final submission as an agent tool. Only the visible human UI
  may complete submission.
- Preserve keyboard focus, semantic controls, useful labels, contrast, reduced
  motion, and screen-reader announcements.
- Do not claim WCAG compliance or represent disabled people without evidence.
  Describe functional interaction preferences precisely.
- Never use real council branding, personal data, or third-party trademarks.
- Keep the app deployable as static assets and usable without authentication.
- Run `pnpm build` and relevant tests before returning work.

## Collaboration

The lead owns integration. Workers must stay inside their assigned files and
return one of: `needs_decision`, `ready_for_review`, `blocked`, or `done`.
Include files changed, commands/tests run, assumptions, uncertainties, and any
missing items. Do not rewrite another worker's area without lead approval.

## Definition of Done

- A judge can open the live URL and immediately understand the service.
- WebMCP tools are discoverable in supported ChatGPT/Chrome environments.
- The full seeded demo works without setup or credentials.
- Agent actions visibly update the same application state the human sees.
- Validation catches the seeded ambiguity and missing-document condition.
- The user sees a complete review and must personally press Submit.
- The public repo builds from documented instructions and includes a licence.

