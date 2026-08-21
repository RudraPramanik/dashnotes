## 1. Program log and UI contract

- [x] 1.1 Add `docs/BUILD.md` with Implemented / In progress / Backlog. Seed Backlog: agent marketplace, automation inbox, workspace switcher, Cmd-K as primary Q&A, B7 TLS, `indexing_status` badges. Set In progress to `ship-v1-e2e`.
- [x] 1.2 Apply `lock-v1-ui-contract` docs: add `docs/ui-language.md`; overlay `docs/wireframes.md`; point `docs/frontend-stack.md`, `docs/update_blueprint.md`, and `AGENTS.md` at the v1 chrome + this change’s task order.
- [x] 1.3 Point `PROGRESS.md` at this change for product work while keeping last completed step **1.6**.

## 2. Finish Phase 1 (required for E2E)

- [x] 2.1 Step 1.7 stream guard per `docs/steps/P1.md` / `docs/update_blueprint.md`. Run that step’s validation.
- [x] 2.2 Step 1.8 API stubs + `openapi-typescript` + `api:types` against `http://127.0.0.1/openapi.json`. Do not add `GET /notebooks/{id}` unless OpenAPI lists it. Run 1.8 validation.
- [x] 2.3 Step 1.9 middleware (`dashnotes_authed` presence cookie only). Run 1.9 validation.
- [x] 2.4 Step 1.10 login (shadcn `form` `card` as listed in P1.md) — visual language: centered dark-first, inline 429. Run 1.10 validation.
- [x] 2.5 Step 1.11 register. Run 1.11 validation + `pnpm build`. Update BUILD.md Implemented: auth.

## 3. Playwright scaffold

- [x] 3.1 Install `@playwright/test`. Add `playwright.config.ts`, `e2e/` folder, `package.json` script `test:e2e`. `baseURL` local Next app; API origin `http://127.0.0.1`.
- [x] 3.2 Add `e2e/auth.spec.ts`: unique email register → `/notes`. Run against Docker. Move failures to BUILD.md if API/CORS.

## 4. Shell (Phase 2 slice)

- [x] 4.1 Implement app shell per `docs/update_blueprint.md` (Server Component layout, `AppShellEffects`, chrome-only store, five destinations, `WorkspaceLabel` from `GET /workspaces/me`). Optional `GET /health/ai` with 404-safe hide. No marketplace, no automation nav.
- [x] 4.2 Step 2.11 OpenAPI types gate before any Phase 3+ UI types `unknown`/`as` bypass. Update BUILD.md.

## 5. Notes and files (B2)

- [x] 5.1 Notes list + editor + first-run empty coach + indexing-lag copy (no `indexing_status` required). Tiptap only if the Phase 3 prompt lists those packages. ContextPanel slot for note meta. Playbook: Phase 3 / update_blueprint NoteEditor composition.
- [x] 5.2 Files upload/list/detail/download/attach-to-note. `react-dropzone` only if Phase 4 prompt lists it. Lag copy after upload. Update BUILD.md Implemented: notes + files.

## 6. Chat and agent (B3–B5)

- [x] 6.1 Chat: threads, `POST /ai/chat/stream`, conversation chrome, citation chips + Sources from `metadata` only. `guardStream` before SSE.
- [x] 6.2 Agent: single destination, `POST /ai/agent/stream`, tool blocks + Tools panel, notes invalidate on `done`, persistent mutate hint, 503 → suggest Chat. Update BUILD.md.

## 7. Settings and operational UX (B6)

- [x] 7.1 Workspace members settings for owner/admin (`/workspaces/members*`). Hide from member nav.
- [x] 7.2 Visible 429 and AI 503 banners. CRUD remains usable when AI is down.

## 8. B-gate Playwright and close-out

- [x] 8.1 Add `e2e/b-gate.spec.ts`: register → create note → upload file → wait lag → Chat citations → Agent tools. Soft-handle AI 503. Unique users.
- [x] 8.2 Run `pnpm test:e2e` against Docker. Record result in BUILD.md. Mark B1–B6 Implemented or note blockers. Leave B7 and other deferred items in Backlog.
- [x] 8.3 Run `openspec validate ship-v1-e2e --strict`.
