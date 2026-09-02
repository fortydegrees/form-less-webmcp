# Core Engineering Worker Packet

> Historical first-slice packet. Superseded by the schema-driven architecture
> and acceptance criteria in `PROJECT.md`.

Status target: `ready_for_review`

Own the application implementation. Build the first complete vertical slice
from `PROJECT.md`, including deterministic domain state, visible overview and
guided experiences, WebMCP registration, review, human-only submission, reset,
and tests. You may modify implementation/config/test files but should not write
submission copy or invent new product scope.

Acceptance:

- React/TypeScript implementation builds and tests.
- WebMCP handlers share domain functions with the UI.
- Unsupported environments degrade cleanly.
- Seeded demo journey reaches validation, correction, review, and human submit.
- No agent-callable submit path exists.
- Return files changed, commands/tests, assumptions, uncertainties, missing work.
