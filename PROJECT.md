# Civic Adaptive WebMCP — Source of Truth

Status: active competition build  
Internal codename only: David will choose the submission name.  
Deadline: 3 September 2026, 21:00 BST. Target submission: 19:00 BST.

## Product thesis

**The website knows the rules. Your agent knows you. Together they produce the
right interface.**

Alderwick Home Support is a fictional UK-style urgent home-repair grant and a
reference implementation of schema-driven adaptive interfaces. The service
defines one machine-readable form contract. That contract generates the normal
human application, conditional pathways, deterministic validation, approved
adaptive layouts, and generic WebMCP tools.

The agent is not a form-filling backdoor or arbitrary UI reskinner. It acts as a
personal interface negotiator: it combines the website's authoritative
structure with circumstances and interaction preferences the visitor has
already shared. The site retains policy authority; the person retains answer
confirmation, declaration, and submission authority.

## Judge story

1. Open a complete, accessible but cognitively heavy council application: 24
   questions, five sections, conditional branches, and evidence rules.
2. The applicant gives their external agent one natural-language description
   of the situation and asks it to use site tools rather than browser clicks.
3. `inspect_application` returns typed questions, branches, constraints,
   current state, and agent-write boundaries without DOM scraping.
4. `configure_assistance` visibly recomposes the page into the site's approved
   personal-pathway layout.
5. The page reports relevant questions, excluded branches, remaining answers,
   and evidence needs. No answer or policy has changed.
6. `propose_answers` maps applicant-provided facts into a visible review queue.
   Stored answers remain unchanged until the applicant confirms them.
7. The agent retrieves official explanations and the service's deterministic
   validation. The pathway updates as confirmed answers reveal new branches.
8. The applicant personally makes the declaration. Review exposes one visible
   Submit button and WebMCP exposes zero submission tools.

## Shared form contract

- `form.schema.json`: JSON Schema 2020-12 data shape, allowed values,
  constraints, conditional applicability metadata, and agent-write boundaries.
- `form.ui.json`: standard sections and the service-approved adaptive layout.
- `form.rules.json`: explainable official requirements and cross-field policy.
- `formDefinition.ts`: a typed adapter shared by renderer, domain, tests, and
  WebMCP registration.

This mirrors how real schema-driven form platforms separate data schema, UI
schema, and business rules. A service may import an existing backend schema;
normalisation is only required where its current policy is trapped in prose,
templates, or scattered application code.

## Product principles

- The ordinary website remains complete, accessible, and agent-optional.
- Adaptation changes presentation and pathway visibility, never policy.
- The UI and agent share one canonical JSON answer object.
- Tool inputs, conditional branches, and validation derive from the same
  machine-readable source as the visible fields.
- Agents may inspect, adapt, explain, propose, validate, and review.
- Agents may not confirm proposals, make the declaration, or submit.
- Every tool call and human decision is visible in the case trail.
- No model or external API runs inside the product.

## WebMCP tools

1. `inspect_application`
2. `configure_assistance`
3. `propose_answers`
4. `explain_requirement`
5. `validate_application`
6. `get_application_review`

There is deliberately no `submit_application` tool.

## Scope

### Must ship

- Responsive standard and adaptive experiences generated from one contract.
- 20+ realistic fields, meaningful conditional branches, and cross-field rules.
- Deterministic state, validation, review, reset, and fictional success screen.
- Visible multi-answer proposals with individual and reviewed-batch human
  confirmation.
- Browser-native WebMCP registration with useful unsupported-browser fallback.
- Keyboard focus choreography, semantic controls, error associations, live
  announcements, reduced-motion support, and 320px+ reflow.
- Public static deployment, repository, MIT licence, README, screenshots, and a
  narrated YouTube demo under three minutes.

### Out of scope

- Accounts, authentication, databases, payments, uploads, email, and real
  council submission.
- Real policy or eligibility advice.
- Arbitrary third-party page rewriting or an embedded chatbot.
- LLM/API calls inside the product.
- Accessibility certification claims.

## Acceptance criteria

- `pnpm test`, `pnpm lint`, and `pnpm build` pass.
- The standard form works without WebMCP.
- Chrome/ChatGPT discovers exactly six tools and no submission tool.
- `inspect_application` exposes all fields and branches from the contract.
- `configure_assistance` causes a visible transformation without changing an
  answer.
- Multi-answer proposals remain unstored until a visible human action.
- Conditional answers recalculate the personal pathway.
- Deterministic validation catches and clears schema and cross-field issues.
- The applicant declaration is absent from the agent-writable tool enum.
- Review reports `availableToAgent: false`; only the human UI can submit.
- True 390px layout has no horizontal overflow.

## Competition position

The primary WebMCP claim is not that an agent can eventually operate a web form;
computer use already approximates that. The claim is that a cooperating site can
make the task dramatically more legible and reliable by exposing authoritative
structure, state, constraints, branches, and approved UI compositions directly.

The counterfactual matters: without WebMCP, an agent must scrape guidance, infer
field relationships, track conditional DOM changes, and guess side effects.
With WebMCP, it composes narrow site-authored capabilities against typed state,
while the person and service retain their proper authority.
