## Context

See `proposal.md`. Sibling change `lock-v1-ui-contract` owns v1 IA and visual language; this change **implements** that contract through B-gate. Live Docker (`http://127.0.0.1/health` 200) is the API. OpenAPI on this host includes `/health/ai` and `/notebooks/` (list/create only — no `{notebook_id}`). Notes/files still lack a guaranteed `indexing_status` field until schemas say so.

Current code: P1 through 1.6 (`apiClient` + `executeWithAuthRetry`). Missing: stream guard, API modules, middleware, login/register, shell, features.

## Goals / Non-Goals

**Goals:**

- One task list from remaining P1 through Playwright B-gate.
- `docs/BUILD.md` as implemented / in progress / backlog.
- Playwright against Docker, not mocks.

**Non-Goals:**

- Replacing `lock-v1-ui-contract` specs.
- Production deploy (B7), Cmd-K-as-Q&A, automation inbox, extra agents.
- New packages beyond `@playwright/test` plus those named in the slice’s existing playbook prompt.

## Decisions

### 1. Whole process, not skip-auth
**Choice:** `tasks.md` spans P1 remainder → P2–P6-equivalent slices → e2e. Auth is slice 2, not skipped.
**Why:** Register/login is B1. Playwright cannot demo RAG without a session.
**Alternative:** Jump to shell now — rejected; middleware and `LoginForm` do not exist.

### 2. Two OpenSpec changes
**Choice:** Keep `lock-v1-ui-contract` (chrome). `ship-v1-e2e` implements + tests.
**Why:** Intent split: contract vs program. Apply UI docs in this change’s first tasks so one apply loop can ship product.

### 3. Playwright as B-gate, not unit-test stand-in
**Choice:** `@playwright/test`, `e2e/b-gate.spec.ts`, `pnpm test:e2e`, `baseURL` app, API via env.
**Why:** User asked for E2E feature validation; backend Python `e2e_agent_test.py` does not cover the Next.js UI.
**Alternative:** Cypress — extra stack, not requested.

### 4. 503 policy
**Choice:** App shows banner; Playwright uses a dedicated assertion or `test.skip` on AI-down so CRUD still counts.
**Why:** Live LLM quota is a known backend failure mode (`docs/backendapi.md`).

### 5. BUILD.md vs PROGRESS.md
**Choice:** BUILD.md = product log + backlog. PROGRESS.md = last playbook step.
**Why:** User asked for implementations and backlogs without deleting agent catchup.

### 6. AGENTS.md during this change
**Choice:** Follow `tasks.md` slice order (multi-phase allowed). Hard rules still apply (no `any`, no `localStorage` tokens, OpenAPI types before Phase 3 UI data, ContextPanel slot, etc.). Packages only if listed in this change or the slice prompt.
**Why:** User explicitly asked for the whole process; the old “one P1 step per chat” rule would block that.

### 7. Notebooks
**Choice:** Filter via `GET /notebooks/` + create; no `GET /notebooks/{id}` client.
**Why:** Live OpenAPI has `/notebooks/` only.

## Risks / Trade-offs

- [Scope is large] → Slice gates; Playwright only after Chat+Agent exist; BUILD.md tracks leftover.
- [Indexing lag flakes] → Bounded wait/retry in spec; do not assert tags as indexed.
- [LLM 503] → Soft-fail AI steps; still require CRUD + error UX.
- [Two changes to apply] → First tasks copy lock-v1 docs so product work is unblocked if UI change is not archived yet.
- [AGENTS.md vs multi-phase] → Document overlay in BUILD.md / AGENTS pointer; do not delete step files.

## Migration Plan

1. Write BUILD.md (In progress: ship-v1-e2e).
2. Apply lock-v1 docs (ui-language + wireframes overlay).
3. Finish P1 against Docker; Playwright smoke: register/login.
4. Shell → notes/files → chat → agent, each updating BUILD.md.
5. Full B-gate spec.
6. Rollback: revert branch; Docker unchanged.

## Open Questions

None blocking. Default API origin `http://127.0.0.1` (Nginx) as already documented.
