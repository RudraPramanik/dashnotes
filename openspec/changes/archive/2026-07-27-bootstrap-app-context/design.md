## Context

DashNotes is a multi-tenant notes product. This repository is the **Next.js 16 App Router frontend** that talks to a sibling FastAPI backend (DashNoteSystem). Product/API UX contracts for the client live primarily in `docs/backendGuide.md`; stack and locked frontend decisions live in `docs/frontend-stack.md` and `AGENTS.md`.

OpenSpec was initialized empty (`openspec/config.yaml` comments only; no `openspec/specs/*`). Build progress is mid Phase 1 (API client done; stream guard next). Agents need a durable context layer so `/opsx:propose` / `/opsx:apply` stay aligned with backend contracts and existing guardrails without inventing routes or skipping step files.

## Goals / Non-Goals

**Goals:**

- Encode project identity, stack, and frontend laws in `openspec/config.yaml` `context` + `rules`.
- Land baseline capability specs (ADDED) that describe intended frontend-facing behavior derived from the backend guide.
- Keep specs normative for UX/integration laws; point field-level schemas to OpenAPI.

**Non-Goals:**

- Implementing unfinished UI phases (notes editor, chat UI, agent UI, etc.).
- Changing `AGENTS.md` / step files / runtime app code as part of this change.
- Duplicating full OpenAPI schemas into OpenSpec.
- Defining backend internals (workers, Qdrant, LangGraph graph structure).

## Decisions

1. **Context lives in `openspec/config.yaml`, laws also become specs**  
   - Rationale: `context` steers all artifacts; capability specs become archiveable source of truth for requirements.  
   - Alternative: config-only → weaker validation and no archive trail for product laws.

2. **Five capabilities matching the backend guide’s product map**  
   - `project-context`, `auth-tenancy`, `workspace-content`, `ai-modes`, `client-ops`.  
   - Alternative: one giant `dashnotes` spec → harder deltas for later UI work.

3. **Token storage follows this repo’s hard rules, not the guide’s demo options**  
   - Access token → `sessionStorage` key `dashnotes_at`; refresh → Zustand memory only. Never `localStorage` for tokens.  
   - Rationale: `AGENTS.md` / contract override the guide’s “demo may use localStorage” note.

4. **OpenAPI remains normative for JSON fields**  
   - Specs state UX contracts (SSE shapes, tenancy, errors). Agents MUST verify field lists against `{API_BASE}/docs`.

5. **Apply = docs-only edits**  
   - Write `config.yaml` and archive specs into `openspec/specs/`. No package installs, no app file churn.

## Risks / Trade-offs

- **[Risk] Specs drift from live OpenAPI** → Mitigation: each domain spec states “OpenAPI wins for fields”; regenerate types via `openapi-typescript` when backend changes.
- **[Risk] Overlap with `AGENTS.md`** → Mitigation: OpenSpec mirrors laws; do not weaken AGENTS hard rules; prefer AGENTS on conflict for coding sessions.
- **[Risk] Specs mistaken for “build everything now”** → Mitigation: tasks are limited to writing OpenSpec files; `PROGRESS.md` remains the implementation schedule.
- **[Trade-off] Specs describe target product UX while code is still P1** → Acceptable for brownfield OpenSpec bootstrap; later changes delta specs as features ship.

## Migration Plan

1. Fill `openspec/config.yaml` context/rules.
2. After `/opsx:archive`, baseline specs land under `openspec/specs/<capability>/spec.md`.
3. Rollback: delete or revert the OpenSpec files; no runtime migration.

## Open Questions

- None blocking — workspace switching remains deferred per frontend-stack; do not invent multi-workspace UX in these specs beyond JWT `wid`.
