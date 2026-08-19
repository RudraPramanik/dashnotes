## Why

v1 UX is locked (`lock-v1-ui-contract`) and the FastAPI Docker stack is live (`GET /health` 200, db + redis). Staying in Phase-1-only sessions would delay the B-gate demo. We need one implementation program that ships the whole honest v1 loop — auth through notes, files, RAG chat, and agent — validated with Playwright against that API, with a living `docs/BUILD.md` for what is done vs backlog.

We still start with remaining auth work. E2E cannot skip login/register.

## What Changes

- Treat **`ship-v1-e2e` as the v1 build program**: implement B-gate slices in order (finish P1 → shell → notes/files → chat → agent → members), using `lock-v1-ui-contract` for chrome and `docs/backendGuide.md` / OpenAPI for APIs.
- Add **Playwright** (`@playwright/test` only extra E2E package) against Next.js + `http://127.0.0.1`. Spec covers backend B-gate: register → note → file → chat citations from `metadata` → agent tool events.
- Add **`docs/BUILD.md`**: Implemented / In progress / Backlog. `PROGRESS.md` remains step catchup.
- Tests MUST wait for indexing lag; MUST NOT require `excerpt` or `indexing_status`. AI `503` MUST be visible in the app and MUST NOT fail the whole suite as if CRUD is broken.
- **Allowed installs for this change:** `@playwright/test`; plus packages already named in the playbook prompt for the slice being built (`openapi-typescript` in 1.8, shadcn `form`/`card` in 1.10, Tiptap in Phase 3, `react-dropzone` in Phase 4). No Vercel AI SDK.

### Non-goals

- Do not skip steps 1.7–1.11.
- Do not ship agent marketplace, automation inbox, workspace switcher, Cmd-K as primary Q&A, or TLS production deploy (B7) in this change — those go to BUILD.md backlog.
- Do not mock FastAPI; Docker is the backend.
- Do not merge Chat and Agent.

## Capabilities

### New Capabilities

- `e2e-playwright`: Browser B-gate against live API; lag waits; 429/503 visibility; unique test users.
- `build-log`: `docs/BUILD.md` as the implementation + backlog log for this program.

### Modified Capabilities

- `playbook-protocol`: This change MAY implement multiple phases in `tasks.md` order. UI chrome follows `lock-v1-ui-contract`. Playwright B-gate is the product exit, not “P1 complete.”
- `client-ops`: Indexing-lag waits apply to E2E as well as UI; optional `/health/ai` (listed on this Docker OpenAPI) MUST NOT crash the shell if missing elsewhere.

## Impact

- Docs: `docs/BUILD.md`; overlay pointers in `AGENTS.md` / `PROGRESS.md`; UI docs still from `lock-v1-ui-contract`.
- Code: remaining P1 through v1 surfaces; `e2e/` Playwright; `package.json` script `test:e2e`.
- Backend: unchanged; verify `{API_BASE}/docs` (live paths include `/health/ai`, `/notebooks/` list+create only, no notebook-by-id).
