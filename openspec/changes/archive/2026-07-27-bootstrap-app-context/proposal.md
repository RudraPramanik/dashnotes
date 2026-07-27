## Why

OpenSpec was just initialized with an empty `config.yaml` and no capability specs. Agents proposing or applying future changes lack a shared model of DashNotes: this repo is the **Next.js frontend** for the FastAPI backend described in `docs/backendGuide.md`. Without that context encoded in OpenSpec, proposals will drift from frontend laws (JWT tenancy, chat≠agent, citations from metadata only) and from the current build phase (P1 foundation).

## What Changes

- Populate `openspec/config.yaml` with durable project context (stack, architecture laws, doc map, progress posture).
- Add baseline OpenSpec capability specs that capture **frontend-facing product contracts** from `docs/backendGuide.md` and locked decisions in `docs/frontend-stack.md`.
- Add artifact rules so future proposals stay short, respect hard frontend laws, and align with the active step workflow (`PROGRESS.md` / `docs/steps/`).
- No application runtime code changes in this change — documentation and OpenSpec artifacts only.

## Capabilities

### New Capabilities

- `project-context`: OpenSpec project identity — stack, doc sources of truth, phase workflow, and non-negotiable frontend laws agents must follow.
- `auth-tenancy`: Register/login/refresh/logout, Bearer usage, JWT claims (`wid`/`role`), token storage rules, RBAC UI affordances.
- `workspace-content`: Notes, notebooks, and files API map for UI — CRUD, upload, privacy, indexing lag expectations.
- `ai-modes`: Separate RAG chat vs LangGraph agent vs threads; SSE event contracts; citation and tool-timeline UX laws.
- `client-ops`: Operational UX — indexing states, 429/503 handling, CORS/API base, streaming through proxies.

### Modified Capabilities

- (none — `openspec/specs/` is empty)

## Impact

- **Touched:** `openspec/config.yaml`, `openspec/specs/**`, `openspec/changes/bootstrap-app-context/**`
- **Not touched:** Next.js app code, `AGENTS.md` hard rules (remain authoritative; OpenSpec context mirrors them)
- **Dependencies:** Narrative contracts from `docs/backendGuide.md`, `docs/frontend-stack.md`, `docs/backend-frontend-contract.md`; OpenAPI remains normative for field lists
- **Risk:** Low — planning/docs only; future `/opsx:apply` work must not invent backend routes or contradict step files
