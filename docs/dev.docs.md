# DashNotes — Developer Reading Guide

Curated documentation to read **before or during** implementation. Use this alongside:

| Internal doc | When |
|--------------|------|
| [final-blueprint.md](./final-blueprint.md) | Step-by-step Cursor prompts |
| [primary-blueprint.md](./primary-blueprint.md) | Phase goals and exit criteria |
| [frontend-stack.md](./frontend-stack.md) | Locked libraries and patterns |
| [backend-frontend-contract.md](./backend-frontend-contract.md) | Auth, indexing, AI, automation contracts |
| [wireframes.md](./wireframes.md) | Layout and UX |

Read topics **in phase order** when possible. Skim “why it matters” first; deep-read sections marked **critical** before writing that code.

---

## Phase 0 — Foundation (Next.js, React, Tailwind, shadcn)

### Next.js 16 App Router **critical**

- [App Router overview](https://nextjs.org/docs/app) — layouts, nested routes, route groups `(auth)` / `(app)`
- [Project structure](https://nextjs.org/docs/app/getting-started/project-structure) — where `layout.tsx`, `page.tsx`, `loading.tsx`, `error.tsx` live
- [Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components) — `"use client"` boundaries; most DashNotes UI is client
- [Layouts](https://nextjs.org/docs/app/building-your-application/routing/pages-and-layouts#layouts) — root vs `(app)/layout.tsx` shell
- [Dynamic imports](https://nextjs.org/docs/app/building-your-application/optimizing/lazy-loading) — `next/dynamic` for Tiptap (`ssr: false`)
- [Environment variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables) — `NEXT_PUBLIC_*` only for client-safe values

> **Note:** This repo uses **Next.js 16** with breaking changes vs older tutorials. Prefer current `nextjs.org` docs over blog posts from 2023–2024.

### React 19

- [React docs — Learn](https://react.dev/learn) — refresh if rusty on hooks, effects, composition
- [useState](https://react.dev/reference/react/useState) — QueryClient must be created inside `useState`, not at module level
- [useEffect](https://react.dev/reference/react/useEffect) — polling, stream cleanup, debounced saves
- [Rules of Hooks](https://react.dev/reference/rules/rules-of-hooks) — stream hooks and auth hooks depend on this

### TypeScript (strict patterns)

- [Handbook — Everyday types](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html)
- [Handbook — Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html) — API error shapes, `indexing_status` unions
- [satisfies operator](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-9.html#the-satisfies-operator) — query keys and config objects

### Tailwind CSS 4

- [Tailwind v4 docs](https://tailwindcss.com/docs) — `@import "tailwindcss"` + PostCSS setup
- [Dark mode (class strategy)](https://tailwindcss.com/docs/dark-mode) — pairs with `next-themes` `attribute="class"`

### shadcn/ui + Radix **critical**

- [shadcn — Next.js installation (Tailwind v4)](https://ui.shadcn.com/docs/installation/next) — **read before Phase 0.2**
- [Theming / CSS variables](https://ui.shadcn.com/docs/theming) — dark-first palette in `globals.css`
- [Dark mode with next-themes](https://ui.shadcn.com/docs/dark-mode/next) — `suppressHydrationWarning` on `<html>`
- [Sidebar component](https://ui.shadcn.com/docs/components/sidebar) — Phase 2 shell
- [Form component](https://ui.shadcn.com/docs/components/form) — React Hook Form + Zod integration
- [Command (cmdk)](https://ui.shadcn.com/docs/components/command) — Phase 7 palette

### next-themes

- [next-themes README](https://github.com/pacocoursey/next-themes) — `ThemeProvider`, `useTheme()`, class vs data attribute

### Error boundaries

- [react-error-boundary](https://github.com/bvaughn/react-error-boundary) — `GlobalErrorBoundary`, `AiErrorBoundary`, `TiptapErrorBoundary` scopes

---

## Phase 1 — Auth, API client, forms, middleware

### TanStack Query v5 **critical**

- [Overview](https://tanstack.com/query/latest/docs/framework/react/overview) — server state vs Zustand client state
- [Queries](https://tanstack.com/query/latest/docs/framework/react/guides/queries) — `useQuery`, `staleTime`, `enabled`
- [Query keys](https://tanstack.com/query/latest/docs/framework/react/guides/query-keys) — **always include `workspaceId`**
- [Mutations](https://tanstack.com/query/latest/docs/framework/react/guides/mutations) — login, note save, file upload metadata
- [Query invalidation](https://tanstack.com/query/latest/docs/framework/react/guides/query-invalidation) — after create/update/delete
- [Window focus refetching](https://tanstack.com/query/latest/docs/framework/react/guides/window-focus-refetching) — DashNotes sets `refetchOnWindowFocus: false`
- [Dependent queries](https://tanstack.com/query/latest/docs/framework/react/guides/dependent-queries) — auth-gated fetches
- [Paginated / polling queries](https://tanstack.com/query/latest/docs/framework/react/guides/paginated-queries) — `refetchInterval` for `indexing_status`

### Zustand (auth + shell only)

- [Zustand — Getting started](https://zustand.docs.pmnd.rs/getting-started/introduction)
- [Persist middleware](https://zustand.docs.pmnd.rs/integrations/persisting-store-data) — **do not persist refresh token**; access token uses `sessionStorage` per blueprint
- [TypeScript guide](https://zustand.docs.pmnd.rs/guides/typescript) — `AuthState`, `ShellState`

### JWT (client-side decode only)

- [jose — `decodeJwt`](https://github.com/panva/jose#decodejwt) — read `sub`, `wid`, `role`, `exp`; never verify on client
- [JWT.io intro](https://jwt.io/introduction) — claims mental model (optional background)

### Auth refresh + fetch wrapper **critical**

Read these **before Step 1.6** (`apiClient` + `isRetry` circuit breaker):

- [MDN — `fetch`](https://developer.mozilla.org/en-US/docs/Web/API/Window/fetch)
- [MDN — HTTP 401](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/401) vs [403](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/403) — backend should prefer 403 for RBAC
- [OAuth 2.0 — Refresh token (conceptual)](https://oauth.net/2/refresh-tokens/) — rotation, reuse detection (backend owns this)
- Internal: [backend-frontend-contract.md § Auth](./backend-frontend-contract.md#p0--auth-required-before-frontend-phase-1-ships) — **source of truth** for refresh body vs httpOnly cookie

**Design takeaway:** First 401 → refresh once → replay with `isRetry: true`. Second 401 → `clearSession()`, never refresh again.

### Next.js Middleware **critical**

- [Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware) — route protection via presence cookie (not JWT parsing in middleware)
- [Matcher config](https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher) — protect `(app)` routes only

### Forms + validation

- [React Hook Form — Get started](https://react-hook-form.com/get-started)
- [Zod](https://zod.dev/) — schemas for login, register, settings
- [@hookform/resolvers](https://github.com/react-hook-form/resolvers#zod) — `zodResolver`

### OpenAPI types from FastAPI

- [openapi-typescript](https://openapi-ts.dev/introduction) — `pnpm api:types` from `/openapi.json`
- [FastAPI — OpenAPI](https://fastapi.tiangolo.com/reference/openapi/) — understand backend schema source

### Toasts

- [Sonner](https://sonner.emilkowal.ski/) — shadcn toast integration

---

## Phase 2 — App shell, sidebar, AI health

### shadcn Sidebar (deep)

- [Sidebar — anatomy & provider](https://ui.shadcn.com/docs/components/sidebar) — `SidebarProvider`, collapse, mobile sheet behavior

### Role-based UI

- No single library — pattern: read `role` from JWT claims + `RoleGate` component; pair with backend RBAC docs in [backend-frontend-contract.md](./backend-frontend-contract.md)

### Graceful degradation (AI health)

- [TanStack Query — `retry` and error states](https://tanstack.com/query/latest/docs/framework/react/guides/queries#query-basics) — treat `GET /health/ai` 404 as “feature absent”, not fatal

---

## Phase 3 — Notes, Tiptap, indexing

### Tiptap **critical**

- [Tiptap — Install React](https://tiptap.dev/docs/editor/getting-started/install/react)
- [StarterKit](https://tiptap.dev/docs/editor/extensions/functionality/starterkit)
- [Placeholder extension](https://tiptap.dev/docs/editor/extensions/functionality/placeholder)
- [Character count](https://tiptap.dev/docs/editor/extensions/functionality/character-count)
- [Events — onUpdate](https://tiptap.dev/docs/editor/api/events) — debounced save (~1500ms per blueprint)

### Markdown rendering (chat previews)

- [react-markdown](https://github.com/remarkjs/react-markdown)
- [remark-gfm](https://github.com/remarkjs/remark-gfm) — tables, task lists in AI messages

### Indexing status polling

- Internal: [backend-frontend-contract.md § Indexing](./backend-frontend-contract.md#p0--indexing-status-required-before-frontend-phase-34-polish)
- [TanStack Query — `refetchInterval` as function](https://tanstack.com/query/latest/docs/framework/react/reference/useQuery) — poll every 5s while `pending` | `processing`

---

## Phase 4 — Files and uploads

### Multipart upload (XHR, not apiClient fetch)

- [MDN — `FormData`](https://developer.mozilla.org/en-US/docs/Web/API/FormData)
- [MDN — `XMLHttpRequest` upload progress](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/upload) — progress events for large files
- [react-dropzone](https://react-dropzone.js.org/) — drag-and-drop UX

### Tables

- [TanStack Table — React guide](https://tanstack.com/table/latest/docs/guide/introduction) — members table, file list sorting

---

## Phase 5–6 — AI chat & agent (SSE) **critical**

DashNotes uses **custom SSE hooks**, not Vercel AI SDK. Read streaming fundamentals first.

### Server-Sent Events

- [MDN — Server-sent events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events) — `event:`, `data:`, blank line framing
- [MDN — `ReadableStream`](https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream) — `response.body.getReader()` in `sse-parser.ts`
- [WHATWG Streams — BYOB / default reader](https://streams.spec.whatwg.org/#example-rbs-pull) — incremental chunk parsing

### DashNotes SSE contract (internal **must read**)

- [backend-frontend-contract.md](./backend-frontend-contract.md) — chat vs agent event types
- [frontend-stack.md § AI streaming](./frontend-stack.md#ai-streaming) — `token` → `metadata` (citations) → `[DONE]`; never parse citations from token stream

### Stream + auth

- Refresh access token **before** opening SSE ([`use-stream-guard`](./frontend-stack.md#auth-and-refresh-tokens)) — 60s buffer before JWT `exp`
- [AbortController](https://developer.mozilla.org/en-US/docs/Web/API/AbortController) — cancel stream on unmount or new message

### What **not** to adopt for this project

| Resource | Why skip |
|----------|----------|
| [Vercel AI SDK](https://sdk.vercel.ai/docs) | Backend is FastAPI with custom SSE events |
| [EventSource API](https://developer.mozilla.org/en-US/docs/Web/API/EventSource) | No custom headers for Bearer auth; use `fetch` + stream reader instead |

---

## Phase 7 — Command palette

- [cmdk](https://cmdk.paco.me/) — keyboard navigation, groups
- [shadcn Command](https://ui.shadcn.com/docs/components/command) — dialog wrapper, ⌘K wiring

---

## Phase 8 — Settings, members, automation inbox

### Automation port pattern (deferred backend)

- Internal: [frontend-stack.md § Automation](./frontend-stack.md#automation-abstraction) — port + stub + feature flag
- [Feature flags (Martin Fowler)](https://martinfowler.com/articles/feature-toggles.html) — conceptual background for `NEXT_PUBLIC_AUTOMATION_ENABLED`

---

## Phase 9 — Audits (performance, security, boundaries)

- [Next.js — Production checklist](https://nextjs.org/docs/app/building-your-application/deploying/production-checklist)
- [React — Profiler](https://react.dev/reference/react/Profiler) — optional spot checks
- [OWASP — XSS Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html) — markdown rendering, user content
- [web.dev — Content Security Policy](https://web.dev/articles/csp) — if you harden headers later

---

## Backend context (read for better frontend decisions)

You are building the **Next.js client** against a **FastAPI** backend. Skim these so API shapes and errors make sense:

| Topic | Link |
|-------|------|
| FastAPI tutorial | https://fastapi.tiangolo.com/tutorial/ |
| FastAPI security / OAuth2 JWT | https://fastapi.tiangolo.com/tutorial/security/oauth2-jwt/ |
| CORS + credentials | https://fastapi.tiangolo.com/tutorial/cors/ |
| Internal API surface | [backendapi.md](./backendapi.md) |
| Integration contract | [backend-frontend-contract.md](./backend-frontend-contract.md) |

---

## Suggested reading order (first week)

| Day | Focus | Docs |
|-----|-------|------|
| 1 | App Router + project conventions | Next.js App Router, Server/Client Components, [frontend-stack.md](./frontend-stack.md) |
| 2 | UI foundation | shadcn Next install, theming, next-themes, Tailwind dark mode |
| 3 | Data layer | TanStack Query overview, query keys, mutations |
| 4 | Auth layer | backend-frontend-contract auth, Zustand, jose, middleware |
| 5 | API client | fetch, 401 handling, openapi-typescript |
| 6 | Shell | shadcn Sidebar, layouts, error boundaries |
| 7 | Streaming prep | MDN SSE + ReadableStream, frontend-stack AI streaming |

Then read **Tiptap** before Phase 3 and **SSE deep dive** before Phase 5.

---

## Quick decision cheatsheet

| Question | Answer for DashNotes |
|----------|----------------------|
| Where does server data live? | TanStack Query — not Zustand |
| Where do tokens live? | Access: Zustand + `sessionStorage`. Refresh: Zustand memory only |
| How to theme? | `next-themes` + shadcn CSS variables — no Zustand theme |
| How to type APIs? | Regenerate from `/openapi.json` |
| How to stream AI? | Custom `fetch` + `sse-parser.ts` — not Vercel AI SDK |
| Citations from where? | SSE `metadata` event only |
| Send `workspace_id` on `/ai/*`? | **Never** — JWT `wid` only |
| Second 401 after refresh? | Logout — do not refresh again (`isRetry` circuit breaker) |

---

*Last updated: 2026-06-24 — aligned with `frontend-stack.md` v2 and `final-blueprint.md` phases 0–9.*
