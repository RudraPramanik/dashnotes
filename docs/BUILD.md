# DashNotes — Build log

Living program log for OpenSpec change `ship-v1-e2e`. Protocol still wins: OpenAPI `{API_BASE}/docs` → `docs/backendGuide.md` → playbook.

`PROGRESS.md` records the last playbook step for agent catchup. This file records **product** slices, B-gate, and backlog.

---

## In progress


| Item | Notes                                                                  |
| ---- | ---------------------------------------------------------------------- |
| —    | `ship-v1-e2e` tasks complete. Archive with `/opsx:archive` when ready. |


---

## Implemented


| Slice                       | Behavior                                                              | Primary API                               |
| --------------------------- | --------------------------------------------------------------------- | ----------------------------------------- |
| Foundation (P0)             | Theme, providers, route placeholders, error boundaries                | —                                         |
| API client (P1 through 1.6) | Bearer fetch, SSE parser, refresh, `executeWithAuthRetry`             | `POST /auth/refresh`                      |
| Auth screens (1.7–1.11)     | Stream guard, API stubs, middleware, login, register                  | `POST /auth/login`, `POST /auth/register` |
| Playwright scaffold         | `pnpm test:e2e` vs Docker                                             | —                                         |
| App shell                   | 5 destinations, WorkspaceLabel, ContextPanel slot, 404-safe AI health | `GET /workspaces/me`, `GET /health/ai`    |
| OpenAPI types (2.11)        | `lib/api/types.ts` from live schema                                   | —                                         |
| Notes                       | List, empty coach, composed Tiptap editor, lag copy                   | `GET/POST/PATCH/DELETE /notes*`           |
| Files                       | Dropzone upload, grid/list, detail, download, attach-to-note          | `POST /files/upload`, `GET /files*`       |
| Chat                        | Threads, SSE tokens, citation chips + Sources from `metadata`         | `POST /ai/chat/stream`                    |
| Agent                       | Workspace Assistant, tool blocks + Tools panel, note invalidate       | `POST /ai/agent/stream`                   |
| Settings                    | Members for owner/admin; account sign-out                             | `/workspaces/members*`                    |
| Operational banners         | Visible 429 countdown and AI 503; CRUD stays up                       | —                                         |
| Home route                  | `/` redirects to `/auth/login` or `/notes`                            | —                                         |


---



## Backlog (not live chrome)


| Item                                      | Why deferred                                            |
| ----------------------------------------- | ------------------------------------------------------- |
| Agent marketplace (Research / Writer / …) | Live API has one agent: `POST /ai/agent*`               |
| Automation inbox                          | Feature-flagged; queue APIs not required for v1         |
| Workspace switcher                        | No `POST /auth/switch-workspace` in launch contract     |
| Cmd-K as primary Q&A                      | `POST /ai/test-search` is diagnostic; Chat is Q&A       |
| B7 — frontend TLS production deploy       | Local Docker B-gate is B1–B6                            |
| `indexing_status` badges                  | Use lag UX until OpenAPI lists the field on notes/files |


---



## B-gate (target)


| #   | Task                                 | Status                                        |
| --- | ------------------------------------ | --------------------------------------------- |
| B1  | Auth: register, login, Bearer        | Implemented                                   |
| B2  | Notes CRUD + file upload             | Implemented                                   |
| B3  | Chat SSE + citations from `metadata` | Implemented (Playwright asserts RAG or 503)   |
| B4  | Threads sidebar + history            | Implemented                                   |
| B5  | Agent tool start/end                 | Implemented (Playwright asserts tools or 503) |
| B6  | Error UX: 503 LLM, 429               | Implemented                                   |
| B7  | Frontend deployed with TLS           | Backlog                                       |


---



## E2E notes

- Playwright against Next.js + `http://127.0.0.1` (Docker). Do not mock FastAPI.
- Wait for indexing lag before RAG assertions.
- AI `503` is a visible state, not a CRUD failure.
- Visiting `http://localhost:3000/` no longer shows the Phase 0 “hello there” placeholder; middleware sends you to login or `/notes`.
- **2026-08-19:** `pnpm test:e2e` — 3 passed (auth register, `/` → login, B-gate register → note → file → chat → agent).

