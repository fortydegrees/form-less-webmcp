# Form Less — contributor guidance

## Product contract

Form Less is a fictional public-service application demonstrating a
schema-driven WebMCP interface. Read `README.md` and `docs/architecture.md`
before material changes.

The product has two non-negotiable authority boundaries:

- the website owns policy, validation, available layouts and canonical state;
- the applicant owns answer confirmation, the declaration and submission.

No agent tool may confirm a proposed answer, make the declaration or submit the
application.

## Engineering rules

- Use pnpm only.
- Keep `form.schema.json`, `form.ui.json` and `form.rules.json` as the source of
  truth. The standard UI, focused UI, domain engine and WebMCP tools must not
  drift into separate copies of the rules.
- Keep policy, applicability and validation deterministic. No model or external
  API runs inside the product.
- Keep WebMCP handlers thin and route changes through the shared application
  store.
- Preserve the complete human workflow when WebMCP is unavailable.
- Preserve semantic controls, keyboard focus, error associations, reduced
  motion and narrow-screen reflow.
- Alderwick Council, its policies, applicant data and submission flow must
  remain clearly fictional.
- Avoid unrelated refactors and dependencies that do not improve the shipped
  demonstration.

## Verification

Before committing a material change, run:

```bash
pnpm test
pnpm lint
pnpm build
```

For WebMCP changes, also verify that the browser registers exactly six tools,
that proposals report zero stored answers before human confirmation, and that
no submission tool exists.
