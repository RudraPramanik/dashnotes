## Why

`docs/update_blueprint.md` (v3 patch) fixes architecture violations in `docs/final-blueprint.md` before Phase 2–3 solidify them: a client-forced app layout, a hub-style `ContextPanel`, feature data in the shell store, duplicated auth-retry and indexing-poll logic, a monolithic note editor, and `unknown` API types past the OpenAPI gate. Adopt now — after Step 1.6, before 1.7+ — so step files and code never encode the bad patterns.

**Review verdict:** Approve and adopt. The patch aligns with `docs/backendGuide.md` laws and `docs/frontend-stack.md` principles; it is a docs/architecture correction, not a product-scope change. One caveat: current `lib/api/client.ts` already shares 401 retry via `fetchWithAuth` — the 1.6 patch is a same-behavior rename/extraction to `executeWithAuthRetry`, not a behavioral fix.

## What Changes

- **BREAKING (vs v2 prompts):** Shell store loses `contextPanelContent` / citation / tool-trace fields; `ContextPanel` becomes a `{ children }` slot; feature pages own panel content.
- **BREAKING (vs v2 prompts):** `app/(app)/layout.tsx` MUST remain a Server Component; session hooks move to `AppShellEffects`.
- Fold v3 patches into step docs / AGENTS guardrails: 1.6 `executeWithAuthRetry`, revised 2.2 / 2.6 / 2.9, new gate **2.11** (OpenAPI → `lib/api/types.ts`), shared `useIndexingPoll`, composed `NoteEditor` leaves.
- Encode architecture principles as enforceable requirements (not prompt folklore).

### Non-goals

- No new backend routes or product features.
- Do not re-implement Steps 0.x–1.6 from scratch; do not skip ahead of `PROGRESS.md` into Phase 3 UI except where this change updates planning artifacts.
- Phases 7–9 product scope unchanged (only audit checks added later).

## Capabilities

### New Capabilities

- `shell-composition`: Server-Component app shell, chrome-only shell store, ContextPanel-as-slot, isolated client leaves (`AppShellEffects`, banners, etc.).
- `api-type-gate`: Generated OpenAPI schema + `lib/api/types.ts` aliases; no `Promise<unknown>` / cast-bypass for API shapes from Phase 3 onward.
- `feature-composition`: Shared `useIndexingPoll`; NoteEditor as composition of strict-prop leaf components; feature-owned panel children (citations, tool trace, note outline, file meta).

### Modified Capabilities

- `project-context`: Add architecture principles (SRP, composition, strict props, RSC default, isolate interactivity, state colocation, unidirectional flow) to always-on agent constraints.
- `auth-tenancy`: Require a single shared 401-retry helper used by both JSON and stream paths (no duplicated circuit breakers).
- `client-ops`: Indexing-poll timeout logic MUST live in one shared hook consumed by notes and files hooks.

## Impact

- Planning: `docs/update_blueprint.md` becomes normative for listed steps; `docs/steps/*` / `PROGRESS.md` session order should reflect P2-I = 2.11 before Phase 3.
- Code (when applying steps): `lib/api/client.ts` (1.6 patch), later `lib/stores/shell-store.ts`, `app/(app)/layout.tsx`, `components/shell/*`, `lib/api/types.ts`, `lib/hooks/use-indexing-poll.ts`, `components/notes/Note*.tsx`.
- Specs: new + delta under `openspec/changes/adopt-architecture-v3-patch/specs/`.
- No package installs beyond what step prompts already allow (`openapi-typescript` via existing `pnpm api:types`).
