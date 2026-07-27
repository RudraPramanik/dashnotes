## Context

DashNotes is mid–Phase 1 (`PROGRESS.md`: 1.6 done, next 1.7). `docs/final-blueprint.md` / v2 step prompts still describe patterns that violate the architecture principles in `docs/frontend-stack.md` and AGENTS.md. `docs/update_blueprint.md` (v3) patches those steps without changing backend contracts from `docs/backendGuide.md`.

Current `lib/api/client.ts` already centralizes 401 handling in `fetchWithAuth` (JSON + stream). The v3 1.6 patch still matters as a **named** shared helper (`executeWithAuthRetry`) so future edits cannot re-split JSON vs stream retry paths.

Stakeholders: Cursor agents following step files; human reviewers enforcing SRP / RSC / prop contracts.

## Goals / Non-Goals

**Goals:**

- Make v3 architecture the source of truth for planning and OpenSpec requirements.
- Keep Server Components default: `(app)/layout` is structure + composition; interactivity in named client leaves.
- Keep shell Zustand chrome-only; feature data flows via props/children (unidirectional).
- Gate Phase 3+ on real OpenAPI types (`lib/api/types.ts`).
- Deduplicate auth-retry and indexing-poll; compose NoteEditor from strict-prop leaves.

**Non-Goals:**

- Rewriting finished 0.x–1.5 modules.
- Changing auth storage, AI SSE event contracts, or inventing API fields.
- Implementing all of Phases 2–6 in this change’s apply pass — apply folds docs/specs/guardrails and the immediate 1.6 patch; later steps follow `PROGRESS.md`.

## Decisions

### D1 — Adopt update_blueprint as normative for listed steps

**Choice:** Treat `docs/update_blueprint.md` as superseding the matching sections of `final-blueprint.md` / v2 prompts. Unlisted steps stay v2.

**Why:** Changelog is explicit; avoids rewriting the entire 2.6k-line blueprint.

**Alternative:** Merge v3 into `final-blueprint.md` now. Deferred — large doc churn; patch file is enough for agents if step files point at it.

### D2 — ContextPanel is a slot, not a router

**Choice:** `ContextPanel` accepts `children`; features render `<ContextPanel><FeaturePanel … /></ContextPanel>` and toggle `contextPanelOpen` only.

**Why:** Composition over inheritance/hub; removes dependency magnet and shell-store feature fields (`citationData`, `toolTrace`, `contextPanelContent`).

**Alternative:** Keep enum + switch in shell. Rejected — violates SRP and state colocation.

### D3 — Layout stays Server Component; `AppShellEffects` hosts hooks

**Choice:** No `"use client"` on `app/(app)/layout.tsx`. Invisible client leaf calls `useAutomationNotifications` + `useAiHealth`.

**Why:** Isolate interactivity; prevents forcing the whole shell tree client-side.

**Alternative:** Client layout (v2). Rejected — cascading client boundary.

### D4 — Shared `executeWithAuthRetry` over duplicated breakers

**Choice:** One internal helper; `request` / `stream` supply `attempt` + `onResponse`. Public signatures unchanged. Still import `handleUnauthorized` from `token-refresh.ts` only.

**Why:** Single Responsibility for the 401 state machine; matches AGENTS circuit-breaker rule.

**Alternative:** Keep only `fetchWithAuth` as today. Acceptable behaviorally; still refactor to the named helper so validation and future agents share one pattern.

### D5 — OpenAPI type gate (Step 2.11) before Phase 3

**Choice:** `pnpm api:types` → `schema.d.ts`; ergonomic re-exports in `lib/api/types.ts`; API modules stop returning `Promise<unknown>`.

**Why:** Strict prop/contracts and no `as` cast culture. Aligns with backendGuide “OpenAPI wins.”

**Alternative:** Hand-written DTOs. Rejected — drifts from FastAPI.

### D6 — NoteEditor composition + shared indexing poll

**Choice:** Four leaves (title, body, privacy, actions) + thin `NoteEditor` owning mutations/save indicator; `useIndexingPoll` owns 180s timeout for notes and files.

**Why:** SRP, strict props (leaves never import mutations), state colocation (debounce with the value owner).

### D7 — Principle mapping (how we enforce)

| Principle | Enforcement |
|-----------|-------------|
| Single Responsibility | One retry helper; one poll hook; leaf components one job |
| Composition Over Inheritance | Slot panel; NoteEditor composes leaves; no hub switch |
| Strict Prop Contracts | Leaves: primitives + callbacks only |
| Server Components by Default | `(app)/layout` RSC |
| Isolate Interactivity | `AppShellEffects`, banners, toggles as client leaves |
| State Colocation | Debounce in field/body; citations in stream hook |
| Minimal Unidirectional Flow | Feature → props → panel; shell store = open/close only |

## Risks / Trade-offs

- [Risk] Slot panel needs each page to open/close + pass children → Mitigation: step prompts + ContextPanel validation script; Step 9.6 audit checks.
- [Risk] 2.11 blocked if OpenAPI unreachable → Mitigation: gate is its own session; Phase 3 must not start until PASS; flag backend contract gaps instead of casting.
- [Risk] Portal/slot placement ambiguity (layout renders empty `<ContextPanel />` vs page children) → Mitigation: prefer page-level composition wrapping content into the slot pattern described in update_blueprint; if React tree placement needs a React portal later, keep the same prop contract (children + chrome flags only).
- [Risk] Agents still follow v2 text in `final-blueprint.md` → Mitigation: update `docs/steps/*` / AGENTS pointers and OpenSpec specs in this change.

## Migration Plan

1. Apply docs/spec/guardrail updates + optional immediate 1.6 `executeWithAuthRetry` refactor (same behavior).
2. Continue Phase 1 (1.7+) unchanged except where AGENTS already references shared retry.
3. Phase 2 sessions use revised 2.2 / 2.6 / 2.9 + new 2.11 before any Phase 3 component work.
4. Rollback: revert change artifacts and client patch; v2 prompts remain in `final-blueprint.md` as historical.

## Open Questions

- Exact React placement for panel children vs layout-level empty `<ContextPanel />` (portal vs nested layout slots) — resolve at Step 2.9 implement time without weakening the “no feature imports in ContextPanel” rule.
- Whether to eventually fold `update_blueprint.md` into `final-blueprint.md` — out of scope for apply; track as docs hygiene later.
