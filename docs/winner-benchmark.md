# OpenAI Hackathon Winner Benchmark

Research date: 1 September 2026

## Closest comparison cohort

The strongest benchmark is OpenAI Build Week 2026. It used nearly the same
four-part rubric as the WebMCP Challenge:

- technological implementation;
- design and user experience;
- potential impact;
- quality and novelty of the idea.

OpenAI selected eight winners from more than 8,000 submissions. The cohort is
more useful than generic hackathon advice because the sponsor, evaluation shape,
submission format, deadline pressure, Codex workflow, and expected product
completeness are unusually close to this challenge.

### Eight official Build Week winners

- **Second Voice** — converts unclear speech into a few candidate sentences;
  the speaker confirms before anything is spoken.
- **AirBridge for Windows** — streams live Windows audio to AirPlay devices and
  uses a local policy layer around optional GPT control.
- **veTriage** — a deterministic veterinary triage workflow built from a real
  clinician's operating knowledge and already piloted in a clinic.
- **Pulse** — listens during cardiac arrest response, but deterministic code
  owns clinical state and ambiguous evidence requires confirmation.
- **Echo Canvas** — a browser workbench where users can alter room geometry and
  immediately hear and inspect the acoustic result.
- **Sentinel** — combines static analysis, constrained GPT review, and sandboxed
  probes to find MCP security failures.
- **Mechanica** — interactive, physics-based 3D reconstructions of ancient
  Chinese machines with evidence attached to every inferred dimension.
- **Dấu** — Vietnamese pronunciation coaching that overlays a learner's pitch
  against validated native references and explains a physical correction.

Four live products were inspected directly: Mechanica, Dấu, Echo Canvas, and
veTriage. They range from cinematic to utilitarian, but each has a deliberate,
specific visual system rather than generic hackathon styling.

## Supporting cohorts

### OpenAI Open Model Hackathon 2025

The six official category winners included a cooking robot, a programmable
scent printer, a Steam Deck 3D-printing workstation, an offline memory companion,
a dental planning model, and an autonomous Dota 2 agent. This cohort is more
hardware-heavy, but it reinforces one pattern: the featured model produces a
concrete physical, sensory, or observable state change.

### OpenAI × GovTechSG 2024

The first-place project used the Realtime API to let older residents file
municipal service cases in any language. The other winners were a speech-driven
Mandarin game and a medication-adherence assistant. This cohort supports the
credibility of public-service and accessibility use cases; civic subject matter
is not inherently too sober to win.

## Recurring winner traits

### 1. One sentence explains the product

The strongest entries have a problem and transformation that are immediately
legible: hear an ancient machine work, see what tone was spoken, make Windows
audio play on a HomePod, or let an older resident report a civic problem in any
language.

### 2. The featured technology is load-bearing

The model or protocol changes the product's capability rather than decorating a
normal app. Winners also constrain the model: deterministic DSP grades Dấu,
deterministic state tracks Pulse, local policy controls AirBridge, and source
validation cages Sentinel.

### 3. There is one unmistakable demo moment

Examples include opening a doorway and hearing sound reroute, speaking a
Vietnamese syllable and seeing its pitch curve, operating an ancient machine,
or watching a robot turn a prompt into physical action. The complete product may
be complex, but the memorable moment is simple.

### 4. Human control is a product feature

Second Voice's confirm-before-speak loop is a first-place example. Pulse asks for
confirmation when evidence is unclear; veTriage retains clinical authority;
AirBridge enforces local policy. Safety boundaries are visible in the experience,
not only described in architecture notes.

### 5. Impact is specific and embodied

Many winners start from the builder's own family, profession, language, clinic,
or recurring technical pain. The audience is narrow enough to picture, and the
workflow is concrete enough to judge.

### 6. Proof replaces adjectives

The best submissions show a live pilot, local no-key evaluation path, measured
accuracy, extensive tests, hardware operation, reproducible fake inputs, or an
observable artifact. They also state limits and abstention paths plainly.

### 7. Visual polish matters, but spectacle is optional

Mechanica and Dấu are visually striking. veTriage is calmer and workflow-led,
yet still looks authored, coherent, and credible. Sophisticated design is not a
mandatory dark cinematic aesthetic; a generic or under-resolved interface is
still a disadvantage under an explicit design criterion.

## Comparison with the current WebMCP prototype

### Strong fit

- Six site-authored WebMCP tools are a substantive featured-technology surface.
- Deterministic policy and validation mirror the strongest winner architecture.
- Human confirmation and human-only submission are meaningful product choices.
- The shared state, visible history, guided mode, and unsupported-browser path
  make this a complete vertical slice rather than a protocol toy.
- The concept has close precedents in winning patterns: Second Voice's explicit
  confirmation, Pulse's human-controlled state, veTriage's rules, and GovTechSG's
  accessible municipal service.

### Current gaps

- The memorable moment is distributed across six tools instead of staged as one
  obvious transformation.
- Without a live external agent, the page initially reads as a conventional
  council form; the WebMCP thesis is not visible quickly enough.
- The visual system is coherent but generic and does not yet express a distinct
  human-agent collaboration idea.
- The scenario is fictional and has no domain-expert story, pilot, or user-test
  evidence, so impact currently relies on secondary statistics.
- Sixteen automated tests and live Chrome tool checks are good baseline proof,
  but the submission still lacks public runtime proof, judge instructions,
  screenshots, and a finished demo video.

## Recommended next moves

1. Keep the concept and engineering; do not replace it with a new idea.
2. Give the product a distinctive civic identity and redesign the interface so
   shared human/agent authority is the visual thesis.
3. Make one canonical demo sequence: the user states interaction needs; the
   agent discovers tools and transforms the form; the agent proposes a correction;
   the human confirms; deterministic checks clear; only the human submits.
4. Turn the activity sidebar into a clearer collaboration rail showing tool,
   authority, proposed change, confirmation, and official result.
5. Add concise on-page proof that the agent can adapt/explain/propose/validate
   but cannot confirm or submit.
6. Run at least one fresh-person usability test and record where the WebMCP
   value becomes clear or remains confusing.
7. Deploy publicly and test the complete sequence in the actual supported agent
   runtime before recording the video.

## Sources

- OpenAI, “Meet the winners of OpenAI Build Week”:
  https://developers.openai.com/blog/build-week-winners
- OpenAI Build Week official overview and winners:
  https://openai.com/build-week/
- OpenAI Build Week Devpost page and judging criteria:
  https://openai.devpost.com/
- OpenAI Open Model Hackathon official winners update:
  https://openai2025.devpost.com/updates/37529-and-the-winners-are
- OpenAI Developer Community, OpenAI × GovTechSG winners:
  https://community.openai.com/t/openai-s-first-hackathon-in-asia-in-conjunction-with-govtechsg/1028468
- Build Week project pages:
  https://devpost.com/software/second-voice-uk1peq
  https://devpost.com/software/airbridge-for-windows
  https://devpost.com/software/veterinary-four-color-triage-app
  https://devpost.com/software/pulse-ewjaf9
  https://devpost.com/software/echo-canvas-ujzksi
  https://devpost.com/software/sentinel-way5bd
  https://devpost.com/software/xiaoqiang
  https://devpost.com/software/d-u-see-your-vietnamese-tones
