# QA and submission plan

## Release gates

Run from a clean checkout with pnpm:

```bash
pnpm install --frozen-lockfile
pnpm test
pnpm lint
pnpm build
pnpm preview
```

Do not publish or submit unless all gates pass and the release commit matches
the deployed build.

## Contract and domain checks

- [ ] Schema contains 34 unique fields across all five UI sections.
- [ ] Standard UI, adaptive UI, tool enums, and validation read the same contract.
- [ ] Ownership, benefit/income, repair-specific, and evidence branches
      recalculate correctly, including nested and enum-based conditions.
- [ ] Inapplicable and undecided questions remain distinct; only applicable
      questions appear in pathway and review.
- [ ] Schema type/range/pattern/length constraints produce deterministic issues.
- [ ] Cross-field tenure, finances, urgency, and evidence rules produce the
      documented result.
- [ ] Reset restores a blank standard application exactly.

## Consent and authority checks

- [ ] `propose_answers` accepts 1–10 valid agent-writable fields.
- [ ] Proposals do not alter canonical answers.
- [ ] Individual Confirm stores only that proposal.
- [ ] Reject removes the proposal without changing the answer.
- [ ] Confirm all is a visible human action after the full queue is displayed.
- [ ] `declaration_accuracy` is absent from the proposal tool enum.
- [ ] Pending proposals block final review.
- [ ] No tool name or handler contains a submission capability.
- [ ] Review returns `availableToAgent: false`.
- [ ] One visible human Submit button exists only on a passing review.

## WebMCP native proof

Use Chrome 146+ with `chrome://flags/#enable-webmcp-testing` enabled and Chrome
fully relaunched.

- [ ] Header badge opens a keyboard-accessible dialog reporting native status,
      six tools, and zero submission tools.
- [ ] `document.modelContext.getTools()` returns exactly:
  - `inspect_application`
  - `configure_assistance`
  - `propose_answers`
  - `explain_requirement`
  - `validate_application`
  - `get_application_review`
- [ ] `inspect_application` returns 34 questions, five sections, conditions,
      allowed values, live answers, and agent-write flags.
- [ ] `configure_assistance` visibly focuses the personal-pathway heading and
      does not change any answer.
- [ ] `propose_answers` focuses the visible proposal queue and reports `stored: 0`.
- [ ] Confirmed branch answers update relevant/not-applicable counts.
- [ ] `explain_requirement` returns only site-authored rule content.
- [ ] `validate_application` clears for the canonical completed scenario.
- [ ] `get_application_review` withholds submission.
- [ ] Site Tools → Recently used records the calls when filmed in ChatGPT.

## Responsive and accessibility checks

- [ ] 1440px standard form and assisted pathway have intentional hierarchy.
- [ ] True 390px and 320px viewports equal document width with no overflowing
      elements.
- [ ] Skip link is the first keyboard stop.
- [ ] Focus order then reaches brand/reset and actual form controls.
- [ ] Agent activation focuses the pathway heading.
- [ ] New proposals focus the proposal heading.
- [ ] Radio groups and declaration use native semantic controls.
- [ ] Visible errors are associated with their controls.
- [ ] Reduced motion removes smooth scroll and non-essential transitions.
- [ ] No uncaught page exceptions or console errors.

## Canonical filmed journey

1. Show the standard form: 34 possible questions across five sections.
2. Show six available site tools and zero submit tools.
3. Send the canonical request with “use site tools—not browser clicks.”
4. Show `inspect_application` and the blue interface transformation.
5. Pause on total, current-route, not-needed, undecided, and evidence counts.
6. Show ten proposed answers; explain that `stored: 0`.
7. Human confirms the reviewed proposals.
8. Show the 16-question route, its 18 excluded alternatives once resolved, and
   the six decisions the agent did not invent.
9. Retrieve one official rule and complete the remaining answers.
10. Run deterministic validation and open review.
11. Show `availableToAgent: false` and zero submission tools.
12. Human presses the visible Submit button.

Target video length: 2:20–2:45, narrated, public YouTube URL.

## Submission evidence

- Public static URL with the exact release commit
- Public repository with MIT licence and build instructions
- 3:2 hero image from supported WebMCP state
- Standard-form screenshot
- Personal-pathway screenshot
- Proposal-handoff screenshot
- Public narrated video under three minutes
- Devpost description structured around WebMCP leverage, execution, impact, and
  creativity/ambition

## Final authority gate

Repository publication, deployment, video publication, Devpost edits, rules
checkbox, and final Submit remain subject to David's explicit approval.
