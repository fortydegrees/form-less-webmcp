# WebMCP landscape audit

Research date: 3 September 2026  
Primary catalogue: GoogleChromeLabs `AWESOME_WEBMCP.md`

## Question

Does the current Alderwick concept use WebMCP in a way that is distinctive,
load-bearing, and easy to judge—or is it merely browser automation with a nicer
API?

## Catalogue coverage

All 30 demo entries in the catalogue were reviewed from their live page,
repository, implementation README, or source. The listed React Chess live URL
currently returns 404, but its repository now describes a broader Generative
Learning product. The CodeSandbox Animal Viewer stopped at its preview trust
gate; its published behaviour is a single cat/dog display tool. These access
limits do not affect the pattern classification.

### 1. Form, booking, commerce, and workflow actuation

- Le Petit Bistro
- React Flight Search
- CineFlow
- Order Tracking
- L'Atelier Hotel Chain
- WebMCP Sports
- Shoe Store
- Flight Booking
- AirBird booking
- Luxe Leather
- Open for Agents Storefront

These replace brittle DOM interaction with typed search, filter, cart, booking,
and form operations. They are the centre of gravity of the current ecosystem.
They demonstrate valid WebMCP, but most do not create a meaningfully different
human experience. This category makes a plain “agent fills a form” submission
look ordinary.

Open for Agents is the most relevant authority comparison. It separates
read-only discovery from visitor-reviewed cart changes and makes reversal
visible. Our proposal-confirmation and human-only submission boundary is at
least as deliberate, and more consequential to the product thesis.

### 2. Structured query and exploration

- UrbanEstates
- The Morning Ritual
- JSON-stat WebMCP Explorer
- AI Audit
- WebMCP Directory
- Analytics Dashboard (in the Chrome Labs repository)

These expose live data, filters, policies, or analytical state that an agent can
query directly. The agent contributes natural-language intent and synthesis;
the site returns authoritative structured facts and keeps the visible UI in
sync. This is a stronger WebMCP pattern than button replacement.

Our `inspect_application`, `explain_requirement`, and deterministic pathway and
validation results belong in this category. The video must show those structured
returns, not only the visible layout change.

### 3. Domain-native visual manipulation

- WebMCP zaMaker
- WebMCP × Excalidraw × WebAI
- WebMCP Flow
- Generative Learning / React Chess
- WebMCP Smart Home
- Stacktree
- Wordup
- Animal Viewer

These have the clearest demo theatre: the agent produces or changes a visible
artifact. WebMCP Flow draws an architecture; Excalidraw renders a diagram;
Generative Learning composes a lesson inside a purpose-built board; Smart Home
rearranges widgets for an immediate situation.

Smart Home is the closest overlap with our “agent negotiates the interface”
idea. Its single high-level tool selects and reorders a fixed widget catalogue.
Generative Learning is the closest philosophical overlap: the site owns a
persistent subject surface and the external agent personalises what appears
inside it.

Neither inspected example combines interface recomposition with a shared form
schema, conditional official rules, evidence planning, deterministic validation,
and explicit proposal/submission authority. “Agent changes the UI” alone is not
our novelty; that full combination is.

### 4. Stateful worlds and dynamic tool lifecycle

- Mystery Doors
- WebMCP Maze
- Blackjack Agents

These make current application state visible through the tool surface. Maze
tools expose what the player can see and do. Blackjack dynamically replaces the
registered tool set by role and game phase, including asymmetric information.

This is technically ambitious WebMCP leverage. Our equivalent is narrower:
conditional pathways and writable fields are derived from the service contract,
and declaration/submission never appear as agent capabilities. We should explain
that constraint clearly rather than adding lifecycle complexity under deadline.

### 5. Meta-tools and ecosystem infrastructure

- WebMCP explainer
- WebMCP Page Agent
- WebMCP Bridge
- `webmcp.cool`
- Latch
- WebMCP Kit
- webmcpify
- MCP Webcomic Site Server
- Model Context Tool Inspector and type/hook libraries
- WindTunnel

These explain, discover, bridge, generate, verify, or benchmark WebMCP rather
than providing a single end-user workflow.

Latch is important strategically: generic DOM-derived `search_site`,
`submit_form`, `add_to_cart`, and `navigate` tools are becoming commodity
integration. WebMCP Kit and webmcpify likewise automate basic tool planning and
registration. Our entry must therefore demonstrate product thinking beyond
“we exposed the form as tools.”

WindTunnel provides the strongest measured browser-use counterfactual in the
catalogue. Its current canonical run reports that WebMCP and the best DOM+vision
configuration solve nearly the same tasks, but WebMCP uses far less time, cost,
and context. This supports the honest claim: WebMCP is not magic capability;
it is a more explicit, reliable, efficient interface to application logic.

## What the catalogue changes

### It strengthens the core concept

The current product matches the official purpose of WebMCP unusually well:

- human and agent work on the same live page;
- the page exposes typed capabilities rather than requiring DOM inference;
- the site retains its own visual surface and application state;
- structured results let the agent reason with less page scraping;
- sensitive decisions remain visible to the person.

OpenAI's Site Tools guidance specifically uses shared canvases, dashboards,
suggested edits, and reviewable comments as examples. A personal pathway and
reviewable answer queue are a direct extension of that interaction model.

### It narrows the novelty claim

Do not claim:

- the first interface an agent can rearrange;
- a universal UI improver for arbitrary sites;
- that ordinary browser agents cannot complete forms;
- that WebMCP creates capabilities impossible through computer use.

Claim instead:

> One service contract can produce both the ordinary interface and a safe,
> personal pathway negotiated with the visitor's agent.

The distinctive combination is:

1. Standard JSON Schema drives the 24-question service and conditional paths.
2. The agent receives authoritative structure, live state, rules, and approved
   presentation choices without scraping.
3. The site visibly recomposes itself around confirmed circumstances.
4. Agent suggestions are staged, attributable, and reversible.
5. The human alone confirms consequential facts, declares accuracy, and submits.

## Translation and accessibility variants

### Auto-translation is not a good second demo

Browser translation already handles the visible “same page in another language”
story. Adding model-generated translation would also weaken the authority claim:
official policy wording should not silently become an agent paraphrase.

A production service could expose a site-authored locale catalogue through the
same UI schema, and an agent could select the visitor's preferred approved
translation. That is a plausible extension, but it is not distinctive enough to
spend the remaining hackathon time implementing or filming.

### Colour-blind mode is also weak

The standard interface should already avoid relying on colour alone. A special
colour-blind transformation risks presenting accessibility as a cosmetic theme
and creates a problem the baseline product ought not have.

The existing exact interaction preferences are more defensible:

- focused pathway instead of a five-section overview;
- keyboard-specific guidance;
- reduced motion;
- site-authored plain-language explanations.

These are supporting evidence that the pathway can respect the person. They
should not replace the main value: the agent combines those preferences with
the applicant's circumstances and the service's conditional rules.

## Rubric reassessment

### WebMCP leverage

Strong if the film shows the complete tool composition; weak if it shows only a
layout change. The proof sequence must include inspection, approved adaptation,
structured proposals, an official explanation, deterministic validation, and
the absence of a submission capability.

### Execution

The full human fallback, schema-driven renderer, focused experience, consent
handoff, mobile layout, tests, and deterministic success flow are stronger than
most catalogue demos. Public deployment and a clean ChatGPT runtime capture are
still required.

### Potential impact

The audience and stressful workflow are specific and credible, but Alderwick is
fictional. Avoid inflated claims. Use the public-service accessibility evidence,
show the cognitive compression on screen, and state that this is a transferable
reference pattern rather than a deployed council product.

### Creativity and ambition

Smart Home and Generative Learning mean personalised surfaces are not unique.
The schema-driven civic-service contract, policy authority, conditional pathway,
and human decision boundary remain a differentiated combination.

## Video recommendation

Use one complete journey, not translation plus accessibility plus form filling.
The memorable moment is one before/after transformation, but the narration must
immediately reveal the machinery underneath it.

1. Cold open on the conventional 24-question form, then cut to the personal
   pathway: “Same service. Same rules. A different interface for this person.”
2. State the thesis: “The website knows the rules. Your agent knows you.
   Together they produce the right interface.”
3. Show ChatGPT's Available Site Tools: six typed tools, zero submission tools.
4. Send one natural prompt containing circumstances and precise interaction
   preferences, explicitly requesting site tools rather than browser clicks.
5. Show `inspect_application` returning 24 questions, five sections, conditions,
   current state, and write boundaries.
6. Show `configure_assistance` produce the pathway without changing an answer.
7. Pause on relevant, excluded, remaining, and evidence counts.
8. Show `propose_answers` create a visible queue and point out that stored
   answers remain unchanged.
9. Human confirms; the pathway recalculates.
10. Show one site-authored requirement and deterministic validation result.
11. Show final review, `availableToAgent: false`, and zero submission tools.
12. Human presses Submit.
13. Close on the shared contract diagram: one schema powers standard UI,
    personal UI, validation, and WebMCP.

The computer-use comparison should be one sentence, not a second filmed demo:

> A screen-driving agent must repeatedly inspect and interpret the page. Here,
> the service publishes its exact questions, branches, state, and safe actions.

## Decision

Keep the concept. Do not add translation or a colour-blind mode. Do not pivot to
commerce, booking, or generative-canvas spectacle. Make the full six-tool
composition—and especially the shared schema and human authority—impossible to
miss in the video.

## Sources

- <https://github.com/GoogleChromeLabs/webmcp-tools/blob/main/AWESOME_WEBMCP.md>
- <https://learn.chatgpt.com/docs/webmcp>
- <https://developer.chrome.com/docs/ai/webmcp>
- <https://developer.chrome.com/docs/ai/webmcp/compare-mcp>
- <https://webmachinelearning.github.io/webmcp/>
- <https://github.com/nekuda-ai/WindTunnel>
