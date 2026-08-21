# DashNotes — Backend ↔ Frontend Contract

API surface the **Next.js client** uses or will integrate with. **OpenAPI `{API_BASE}/docs` and `docs/backendGuide.md` win** on live routes and JSON fields.

**Status:** Split below into **Live** (in OpenAPI today) vs **Deferred** (wishlist — do not require for core auth/notes/files/chat/agent/threads).

---

## Live vs deferred (read this first)

| Class | What |
|-------|------|
| **Live** | Auth JSON + refresh + 401 circuit breaker; notes/files/notebooks/workspaces/me/members; `/ai/chat*`, `/ai/agent*`, `/ai/threads*`; `POST /ai/test-search`; `GET /health` |
| **Deferred** | `indexing_status` / `indexed_at`; `GET /health/ai`; `POST /auth/switch-workspace`; automation SSE + queue APIs |

---

## Locked decisions (product)

| Topic | Decision |
|-------|----------|
| Refresh tokens | **Required (live)** — silent refresh before SSE and on 401 |
| Workspace switching | **Deferred** — single workspace per session; UI shows read-only label from `GET /workspaces/me` |
| Automation notifications | **Deferred** — frontend wires ports + feature flags; backend ships SSE + queue when ready |
| Indexing status | **Deferred** until OpenAPI lists the field — until then, indexing-lag UX (copy / refresh), never infer from empty `tags` |
| Note editor | **Tiptap from Phase 3** — OSS, no license cost |
| Theming | **shadcn + `next-themes`** — dark default, class strategy |
| AI health | **Deferred** `GET /health/ai` — 404 MUST NOT fail the shell; infer from `/ai/*` 503 |

---

## Live — Auth (required before frontend Phase 1 ships)

### `POST /auth/login`

**Response must include:**

```json
{
  "access_token": "eyJ...",
  "refresh_token": "eyJ...",
  "token_type": "bearer"
}
```

Access token JWT claims (existing): `sub`, `wid`, `role`.

### `POST /auth/refresh`

**Request** (choose one pattern — frontend supports both):

**Option A — body (v1):**

```json
{ "refresh_token": "<refresh_token>" }
```

**Option B — httpOnly cookie (preferred for production):**

- Login sets `Set-Cookie: refresh_token=...; HttpOnly; Secure; SameSite=Lax`
- Refresh reads cookie; body empty
- Frontend `credentials: "include"` on auth routes only

**Response:**

```json
{
  "access_token": "eyJ...",
  "refresh_token": "eyJ..."
}
```

Rotate refresh token on each use (rotation). Invalidate old refresh on reuse (detect token theft).

**Errors:**

| Status | Meaning |
|--------|---------|
| 401 | Invalid/expired refresh → client clears session |
| 429 | Rate limited → `Retry-After` header |

### `POST /auth/register`

Same token pair as login on success, or 201 + redirect to login (frontend handles both).

### Token lifetimes (recommended)

| Token | TTL |
|-------|-----|
| Access | 15–60 minutes |
| Refresh | 7–30 days |

Access expiry must be decodable from JWT `exp` for proactive refresh (60s buffer before SSE).

### Client 401 handling (frontend contract)

The apiClient **must** implement a circuit breaker:

| Attempt | On 401 |
|---------|--------|
| First (`isRetry: false`) | Call `POST /auth/refresh`; on success replay original request once |
| Replay (`isRetry: true`) | **Do not refresh** — `clearSession()` and redirect to login |

A second 401 after refresh means the access token is already fresh. Typical causes: revoked refresh/session, user removed from workspace, or resource-level denial. The client must not enter a refresh loop.

Prefer **403** for RBAC denials on the backend so clients can distinguish forbidden (show error) from unauthenticated (refresh/logout). If the backend returns 401 for both expired token and denied access, the circuit breaker still prevents loops — user lands on login after replay fails.

---

## Deferred — Indexing status (not in OpenAPI yet; do not require for Phase 3–4)

When the backend adds these fields to **Note** and **File** schemas, the client MAY poll them. Until then, show indexing-lag UX per `docs/backendGuide.md` (tens of seconds; refresh list/detail; do not claim AI is broken).

Add to **Note** and **File** response schemas:

```ts
type IndexingStatus = "pending" | "processing" | "indexed" | "failed";

// Note
indexing_status: IndexingStatus;
indexed_at: string | null;      // ISO8601 when vectors + metadata complete

// File (same field names)
indexing_status: IndexingStatus;
indexed_at: string | null;
```

### State machine (worker-owned)

| State | When |
|-------|------|
| `pending` | Row committed; job not started |
| `processing` | Worker extracting / embedding / tagging |
| `indexed` | Qdrant upsert complete (and file `extracted_text` saved for files) |
| `failed` | Unrecoverable error; expose optional `indexing_error` string for admin |

Frontend polls every 5s while `pending` or `processing`; stops at `indexed` or `failed` (3min client timeout → show manual retry).

**Do not** infer indexing from empty `tags` alone — embed and tag jobs are independent.

---

## Deferred — AI health (optional; 404 is success for the shell)

### `GET /health/ai`

**200:**

```json
{
  "status": "ok" | "degraded" | "unavailable",
  "dependencies": {
    "qdrant": "ok" | "unavailable",
    "llm": "ok" | "unavailable"
  },
  "timestamp": "2026-06-20T12:00:00Z"
}
```

**404** — frontend hides status dot; infers degradation from `/ai/*` 503 only.

Does not block deploy gate (`GET /health` remains db + redis only).

---

## Deferred — Workspace switching

Not required at launch. When implemented:

### `POST /auth/switch-workspace`

```json
{ "workspace_id": "uuid" }
```

**Response:** new `access_token` + `refresh_token` with updated `wid` claim.

Frontend will: `queryClient.clear()` → `setSession(newTokens)` → redirect `/notes`.

Until then: display workspace name from `GET /workspaces/me`.

---

## Deferred — Automation (frontend abstracts now)

### `GET /ai/notifications/stream` (SSE)

- Auth: Bearer access token
- Scope: `workspace_id` from JWT
- Role: `owner` | `admin` only
- Events:

```
event: automation_pending
data: { "id": "uuid", "type": "string", "confidence": 0.88 }
```

### `GET /automation/pending`

List pending governance items for inbox UI.

### `GET /automation/pending/count`

```json
{ "pending": 3 }
```

### `POST /automation/{id}/approve` | `.../reject`

Human review for `AutomationDecisionEngine` blocked actions.

Frontend: feature flag `NEXT_PUBLIC_AUTOMATION_ENABLED=false` until these exist.

---

## CORS and cookies (production)

If using refresh cookie (Option B):

```
Access-Control-Allow-Origin: https://app.dashnotes.com
Access-Control-Allow-Credentials: true
```

If using refresh in body (Option A): standard Bearer CORS without credentials.

---

## OpenAPI

All endpoints above must appear in `/openapi.json` for `pnpm api:types` regeneration.

---

## Phase gate summary

| Backend delivers | Frontend phase unblocked |
|------------------|--------------------------|
| Login + refresh tokens | Phase 1 |
| `indexing_status` on notes/files | **Deferred** — Phase 3–4 badges when OpenAPI lists the field; lag UX until then |
| `GET /health/ai` | **Deferred** — Phase 2 AI indicator (optional 404 OK) |
| Workspace switch | Future — swap `WorkspaceLabel` → `WorkspaceSwitcher` |
| Automation SSE + queue | Set `AUTOMATION_ENABLED=true` |

---

## Related docs

| Doc | Content |
|-----|---------|
| [backendGuide.md](./backendGuide.md) | **Live** UX/API protocol (synced) |
| [backendapi.md](./backendapi.md) | Backend internals — superseded by backendGuide + OpenAPI for client calls |
| [primary-blueprint.md](./primary-blueprint.md) | Phased build plan |
| [final-blueprint.md](./final-blueprint.md) | Cursor step prompts + validation |
| [frontend-stack.md](./frontend-stack.md) | Libraries and patterns |
