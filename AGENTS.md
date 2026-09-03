# WebMCP Civic Project Instructions

## Mission

Ship a polished, working WebMCP challenge entry before 3 September 2026 at
21:00 BST. The product is a fictional UK-style urgent home-repair grant service
that becomes easier to use when a person and their chosen agent collaborate.

This is a hackathon reference implementation, not a real council website,
production grant system, or source of eligibility advice. Alderwick Council,
its policy, applicant data, reference numbers, and submission flow are fictional.

## Start Here

Before material work:

1. Read `PROJECT.md` for the frozen product thesis, judge story, architecture,
   scope, and acceptance criteria.
2. Read `README.md` for the current implementation and commands.
3. Read `docs/qa-submission-plan.md` for release or demo work, and
   `docs/ux-content-spec.md` for presentation or copy work.
4. Inspect `git status --short --branch` before editing. This checkout is shared
   with OpenClaw and may already contain deliberate work.

Do not reconstruct product intent from the UI alone or revive superseded ideas
such as the eight-field guided-toggle prototype or a multi-programme navigator.

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
- Run `pnpm test`, `pnpm lint`, and `pnpm build` before claiming completion.

## Current Phase

- Build backwards from a public narrated demo under three minutes.
- Make no new feature unless it materially improves a specific judge-facing shot
  or fixes a release blocker.
- The release candidate is currently on `experiment/taste-skill`; its
  presentation implementation began at `a0380fb`. `main` remains at the
  verified pre-TasteSkill comparison commit `2626222`.
- Do not merge branches, publish a repository, deploy, upload video, edit Devpost,
  or submit anything without David's explicit approval.
- The public project name is still undecided.

## Collaboration

The MacBook Air Codex app and OpenClaw operate on this same MBP-hosted checkout.
Do not edit the same files concurrently. For a quick tweak, work sequentially,
keep the diff scoped, and commit it. For parallel work, use separate branches or
Git worktrees and integrate deliberately. Never discard or overwrite an existing
dirty diff you did not create.

When handing work back, state files changed, commands/tests run, assumptions,
uncertainties, and any missing items.

## Definition of Done

- A judge can open the live URL and immediately understand the service.
- WebMCP tools are discoverable in supported ChatGPT/Chrome environments.
- A blank 24-question, five-section standard application works without setup or
  credentials, and the assisted pathway is visibly different.
- Agent actions visibly update the same application state the human sees.
- One schema drives the standard UI, conditional pathway, deterministic checks,
  and WebMCP schemas.
- Proposals remain unstored until visible human confirmation.
- The user sees a complete review and must personally press Submit.
- The public repo builds from documented instructions and includes a licence.
