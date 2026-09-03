# Right Questions — demo video script

Target: 2:25–2:40, narrated, 16:9, public URL, no sped-up speech. Trim tool
latency in the edit but keep every request/result transition legible.

## 0:00–0:14 — Hook

**Picture**

Open on the blank standard service at the top. Scroll briskly through the five
sections and recognisable conditional controls. Hard cut to the completed
focused pathway summary: 16 relevant, 18 not needed, 10 answered from supplied
facts, 6 human decisions.

**Narration**

> Right Questions transforms this complete public-service application into a
> personal, verified pathway. Same service. Same rules. Far less work for this
> applicant.

## 0:14–0:31 — Problem and audience

**Picture**

Return to the standard form header. Pause on “Allow 30 to 45 minutes”, the five
sections, and the evidence checklist.

**Narration**

> This is not a deliberately bad form. One ordinary interface has to cover
> every ownership, financial, repair and evidence route. Most people need only
> one narrow path through that legitimate complexity.

## 0:31–0:46 — Prove the WebMCP surface

**Picture**

Open the green `WebMCP · 6 tools` panel. Show the connected state, six named
tools and `0 submission tools`. Briefly show ChatGPT's Available site tools menu
with the same six names.

**Narration**

> The website publishes six typed WebMCP tools. They expose its structure,
> approved layouts and deterministic checks directly—without screen scraping.
> Submission is deliberately not a tool.

## 0:46–1:13 — The transformation

**Picture**

Copy the natural applicant prompt from the panel and send it in the ChatGPT
desktop conversation beside the live page. Show `inspect_application`, then
`configure_assistance`. Keep the visible page change on screen.

**On-screen prompt**

> Use this site's tools—not browser clicks. I use keyboard navigation. I own
> and live at AW2 4LA, receive Universal Credit, and my boiler failed two days
> ago. There is no heating or hot water. I have a £2,450 written estimate but no
> photos.

**Narration**

> The agent already has the applicant's circumstances and interaction
> preference. It inspects the site's authoritative contract, then requests one
> council-approved composition. The website—not the model—decides which
> questions and rules that composition may contain.

## 1:13–1:37 — Personal route and consent

**Picture**

Pause on the focused pathway and its counts. Show the ten-answer proposal queue
and the tool result containing `stored: 0`. Scroll two proposal rationales,
then use the visible `Use all checked answers` button.

**Narration**

> The agent maps only supplied facts into ten suggestions. Crucially, the tool
> reports `stored: zero`. Nothing enters the application until the person sees
> and confirms it. Confirmed answers resolve the route to 16 questions and
> remove 18 alternatives.

## 1:37–2:04 — Rules and remaining decisions

**Picture**

Complete one or two of the six unanswered controls in the focused route. Show
an `explain_requirement` result and the evidence plan. Complete the remaining
demo answers and run `validate_application`; hold on `valid: true`.

**Narration**

> Six real decisions remain because the agent was not given those facts. It can
> retrieve the service's own explanation and run the same deterministic checks
> as the human form, but it cannot invent policy, evidence or consent.

## 2:04–2:24 — Human authority

**Picture**

Tick the declaration in the page. Show `get_application_review` returning
`availableToAgent: false`. Open the final review and hold on the one visible
`Submit fictional application` button. Do not click until the final beat; if
clicked, make the mouse action visibly human.

**Narration**

> The applicant makes the declaration. Review is available to the agent, but
> submission is not. The consequential action stays visibly and technically
> human-only.

## 2:24–2:38 — Close

**Picture**

Cut to a simple four-part source graphic or a tight repository view showing
`form.schema.json`, `form.ui.json`, `form.rules.json`, and `webmcp.ts`, then end
on the focused interface and project name.

**Narration**

> One contract powers the standard interface, personal pathway, validation and
> WebMCP tools. Define the service once; let each visitor's agent negotiate the
> right interface—without surrendering policy authority or human control.

## Recording checklist

- Record the public URL, not localhost.
- Use a fresh reset before every take.
- Keep ChatGPT and the webpage visible together for tool calls.
- Zoom only enough for results such as `stored: 0` and
  `availableToAgent: false` to remain readable at 1080p.
- Do not claim the agent already knew sensitive personal data; say the
  applicant supplied or had shared the circumstances.
- Do not call the standard service confusing or inaccessible. Call it complete,
  broad, or administratively heavy.
- Do not show browser-click automation during the WebMCP journey.
- Preserve the visual human click for proposal confirmation, declaration, and
  optional final fictional submission.
