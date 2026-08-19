## Why

`docs/final-blueprint.md` is the DashNotes build playbook, but several steps encode a different API than the live FastAPI contract (`frontendguide.md` / OpenAPI). Following those prompts as written (SSE named `event:` lines, invented citation fields, `GET /workspaces`, `GET /ai/test-search`, required `indexing_status`) would produce a client that does not run against the backend. Align the playbook and frontend specs to the backend protocol **now**, before Phase 1.7+ and Phase 3 UI consume the wrong contracts.

## What Changes

- Keep `docs/final-blueprint.md` as the **implementation playbook** (session order, file paths, validation).
- Encode a **protocol precedence**: OpenAPI field lists win; sibling `dashnotesystemv1/docs/documentation/frontendguide.md` (synced into `docs/backendGuide.md`) owns UX/API laws; blueprint prompts must not invent routes or JSON shapes.
- **BREAKING (vs v2 prompt text):** Patch blueprint / `update_blueprint.md` / step files so chat/agent SSE is parsed as `data:` JSON with `type` (`token` | `metadata` | `error` | agent `tool_start` / `tool_end` / `done`), not SSE `event:` names.
- **BREAKING (vs v2 prompt text):** Citation and other API types come from OpenAPI (e.g. `note_id`, `chunk_id`, `title`, `relevance_score`) — not blueprint-invented `source_id` / `excerpt` shapes.
- Correct playbook routes: `GET /workspaces/me`, `POST /ai/test-search` with `{ query_text, limit? }`.
- Treat `indexing_status`, `GET /health/ai`, workspace switch, and automation SSE as **wishlist** until OpenAPI lists them; indexing UX follows lag/polling guidance without requiring a missing field.
- Keep architecture v3 (`update_blueprint.md`): Server Component shell, ContextPanel-as-slot, `executeWithAuthRetry`, OpenAPI type gate 2.11.

### Non-goals

- Do not implement remaining product phases (1.7–9) in this change.
- Do not add backend routes or fields (`indexing_status`, `/health/ai`, switch-workspace).
- Do not move the Next.js app into the API repo or parent git remote.
- Do not replace `final-blueprint.md` with a new playbook from scratch.

## Capabilities

### New Capabilities

- `playbook-protocol`: How DashNotes planning docs relate to the live API — playbook vs contract vs OpenAPI, and the rule that agents MUST patch or skip blueprint text that contradicts the backend.

### Modified Capabilities

- `project-context`: Doc map and always-on laws MUST state protocol precedence and MUST NOT treat unshipped contract fields as current API.
- `ai-modes`: SSE MUST use JSON `type` inside `data:` lines; citations MUST use OpenAPI citation fields; diagnostic search MUST be `POST /ai/test-search`.
- `client-ops`: Indexing UX MUST work without `indexing_status`; optional `/health/ai` remains 404-tolerant; env origin name aligned with backend guide.
- `workspace-content`: Current workspace label/settings MUST use `GET /workspaces/me` (not a list `GET /workspaces`).

## Impact

- Docs: `docs/final-blueprint.md`, `docs/update_blueprint.md`, `docs/backendGuide.md`, `docs/backend-frontend-contract.md`, `docs/frontend-stack.md`, `docs/steps/*`, `AGENTS.md`, `openspec/config.yaml`.
- Specs: deltas under this change; later archive into main specs.
- Code: none required except optional comments on `lib/api/sse-parser.ts` if needed to document default `event: "message"`. Product UI still waits for `/opsx-apply` of later phase work.
- Backend: unchanged. Verify against `{API_BASE}/docs` when applying.
