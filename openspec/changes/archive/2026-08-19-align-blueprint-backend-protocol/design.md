## Context

See `proposal.md` for why. DashNotes is mid-Phase 1 (`PROGRESS.md`: next 1.7). `lib/api/sse-parser.ts` already splits SSE blocks into `{ event, data }` and defaults `event` to `"message"` when the backend omits `event:` lines — which the live chat/agent streams do. `docs/final-blueprint.md` Phase 5–6 prompts switch on `event === 'token'`, which would never match. `docs/backendGuide.md` is a copy of the API frontend guide but still says “this repo is API-only.” `docs/backend-frontend-contract.md` and AGENTS.md treat `indexing_status` as current API; OpenAPI does not list it. Architecture v3 in `docs/update_blueprint.md` stays.

This change is **docs + agent-guardrail alignment** in `dashnotes/` only, so later phase apply does not ship a client that cannot talk to FastAPI.

## Goals / Non-Goals

**Goals:**

- Make protocol precedence executable in playbook text, AGENTS.md, and `openspec/config.yaml`.
- Patch the known wire-format mismatches (SSE `type`, citations, `/workspaces/me`, `POST /ai/test-search`) in blueprint / update_blueprint / step files.
- Label wishlist APIs so Phase 2–4 prompts degrade instead of requiring missing fields.
- Keep v3 architecture patches.

**Non-Goals:**

- Do not implement phases 1.7–9 or redesign UI.
- Do not change FastAPI.
- Do not rewrite `final-blueprint.md` from scratch.
- Do not merge frontend into the API git repo.

## Decisions

### 1. Playbook stays; protocol overlays it

Keep `docs/final-blueprint.md` as the session script. Put a short **Protocol overlay** section at the top (and mirror in `docs/update_blueprint.md`) listing precedence and the mismatch table. Patch the offending step bodies in place so agents who `@` a single step still get the correct wire format.

**Alternative considered:** Freeze v2 blueprint and write a new playbook. Rejected — P0–P1 already ran against this file; a fork would split `docs/steps/P*.md`.

### 2. Sync `docs/backendGuide.md` from the sibling frontend guide

Replace the stale “API-only repo” framing with a frontend-facing header: this file is the **DashNotes copy of the backend protocol**. Note the sibling path `../dashnotesystemv1/docs/documentation/frontendguide.md` (parent workspace). After sync, fix only DashNotes-specific pointers (token storage remains sessionStorage + memory, not the guide’s demo localStorage).

**Alternative considered:** Stop copying and only `@` the backend file. Rejected for sessions that open `dashnotes` alone; a copy plus “OpenAPI wins” is safer.

### 3. SSE: parse JSON `type` from `data`

Keep `parseSseStream`. Chat/agent hooks MUST `JSON.parse(data)` and switch on `type`. Add a one-line comment on the parser that live AI streams do not set `event:`. Optionally add a tiny helper `parseSseJsonData(data)` in the same file if it avoids duplicating `[DONE]` handling — no new packages.

**Alternative considered:** Change the backend to emit `event: token`. Rejected — this change does not touch the API; frontendguide is the protocol.

**AGENTS.md:** Law 6 already says citations from metadata only. Extend it: identify stream frames by JSON `type` in `data:`, not SSE `event:` names.

### 4. Wishlist vs live in the contract doc

Restructure `docs/backend-frontend-contract.md` into **Live (in OpenAPI)** vs **Deferred**. Move `indexing_status`, `GET /health/ai`, `POST /auth/switch-workspace`, automation SSE to Deferred. Keep refresh + 401 circuit breaker as Live (backend already has `POST /auth/refresh`).

Phase 3.2–3.3 / 4.3: indexing util MAY accept optional `indexing_status` when present; default path is lag copy + refresh, not required polling of a missing field. Shared `useIndexingPoll` (v3) stays for when the field ships.

### 5. API origin env alias

Code today uses `NEXT_PUBLIC_API_URL`. Backend guide uses `NEXT_PUBLIC_API_BASE_URL`. Resolve origin as `NEXT_PUBLIC_API_BASE_URL || NEXT_PUBLIC_API_URL` in `lib/api/client.ts` and `lib/auth/token.ts`. Document both in stack/env examples. No package installs.

### 6. Command palette recents vs localStorage ban

AGENTS.md forbids `localStorage` for tokens; blueprint 7.3 also uses `localStorage` for recents and Phase 9 greps `lib/` for any `localStorage`. Patch 7.3 to in-memory or `sessionStorage` under a non-token key so later phases do not violate the grep. Token rule unchanged.

## Risks / Trade-offs

- **[Stale copy of backendGuide.md]** → Header states OpenAPI is normative; re-sync when applying if sibling guide changed.
- **[Agents still paste old step text from chat history]** → Overlay at top of `final-blueprint.md` + AGENTS.md; step-local patches for 2.4, 2.5, 3.2–3.3, 5.2, 6.1, 7.2.
- **[Indexing UX weaker without a status field]** → Accept time-based/copy UX until backend ships the field; do not block B-gate CRUD/chat.
- **[Two env names]** → Alias both; prefer documenting `NEXT_PUBLIC_API_BASE_URL` as protocol name.

## Migration Plan

1. Apply doc patches in `dashnotes` (this change).
2. Continue product build from `PROGRESS.md` 1.7 using patched prompts.
3. Rollback: revert the change branch; no backend deploy.

## Open Questions

None that block this docs change. Whether the backend later adds `indexing_status` is out of scope; the deferred contract section is the hook.
