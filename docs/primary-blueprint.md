# DashNotes Frontend — End-to-End Build Blueprint

Phased implementation plan for the Next.js client. Each phase is a **shippable slice** — the app should never be in a broken state at the end of any phase.

**Related docs**

| Doc | Role |
|-----|------|
| [backendapi.md](./backendapi.md) | Current backend routes and AI slices |
| [backend-frontend-contract.md](./backend-frontend-contract.md) | **Integration spec** — auth, indexing, automation APIs |
| [wireframes.md](./wireframes.md) | Screen layouts and UX |
| [frontend-stack.md](./frontend-stack.md) | Libraries, patterns, folder structure |

---

## Locked product decisions

| Topic | Decision |
|-------|----------|
| Refresh tokens | **Required** — `POST /auth/refresh`; proactive refresh before SSE; backend updated if missing ([contract](./backend-frontend-contract.md#p0--auth-required-before-frontend-phase-1-ships)) |
| Workspace switching | **Deferred at launch** — read-only `WorkspaceLabel`; `WorkspaceSwitcher` interface stubbed for later |
| Automation | **Abstract layer now** — feature-flagged ports; full SSE + inbox when backend ships |
| Indexing badges | **`indexing_status` from API** — no permanent tag-based heuristics |
| Editor | **Tiptap in Phase 3** — OSS, production-ready from day one |
| Theme | **shadcn + `next-themes`** — dark default, not custom Zustand theme |
| AI health | **`GET /health/ai`** with graceful 404 fallback |

---

## Conventions

- Installs happen **inside the phase that needs them**.
- Global components built **once**; feature components ship with their phase.
- Query keys **always include `workspaceId`** from JWT `wid`.
- **Never send `workspace_id`** on AI routes — tenant from JWT only.
- All auth/API behaviour must match [backend-frontend-contract.md](./backend-frontend-contract.md).

---

## Phase 0 — Foundation and visual identity

**Goal:** App boots, shadcn theme system works, providers wired, skeleton shell.

### 0.1 — Install core dependencies

```bash
pnpm add @tanstack/react-query zustand jose sonner next-themes
pnpm add -D @tanstack/react-query-devtools
```

### 0.2 — shadcn init + base component set

```bash
pnpm dlx shadcn@latest init
# TypeScript · App Router · dark mode class strategy · CSS variables · default style

pnpm dlx shadcn@latest add button input label badge tooltip separator skeleton scroll-area avatar dropdown-menu sheet dialog alert-dialog tabs
```

Single shadcn init for the project. Add components per phase after this.

### 0.3 — Theme: dark-first via `next-themes`

Tailwind 4 uses `postcss.config.mjs` + `globals.css` — follow [shadcn Tailwind 4 install](https://ui.shadcn.com/docs/installation/next).

| File | Responsibility |
|------|----------------|
| `providers/ThemeProvider.tsx` | `next-themes` `ThemeProvider` — `attribute="class"`, `defaultTheme="dark"`, `enableSystem` optional |
| `components/shell/ThemeToggle.tsx` | shadcn `DropdownMenu` or icon toggle using `useTheme()` from `next-themes` |

Do **not** use a Zustand theme store — `next-themes` handles persistence and SSR flash prevention (`suppressHydrationWarning` on `<html>`).

### 0.4 — Global providers

| File | Responsibility |
|------|----------------|
| `providers/QueryProvider.tsx` | TanStack Query — `staleTime: 60_000`, `retry: 1`, `refetchOnWindowFocus: false` |
| `providers/RootProvider.tsx` | `ThemeProvider` → `QueryProvider` → children |

Wire in `app/layout.tsx`:

```tsx
<html lang="en" suppressHydrationWarning>
```

### 0.5 — Route group scaffolding

Placeholder `page.tsx` files for full route tree (see [wireframes.md](./wireframes.md#route-map)).

### 0.6 — Global error boundaries

```bash
pnpm add react-error-boundary
```

| Component | Scope |
|-----------|--------|
| `GlobalErrorBoundary` | Root — reload affordance |
| `AiErrorBoundary` | Chat/agent views only |

### Phase 0 exit criteria

- Dark theme default; `next-themes` toggle works without flash
- Providers wired; routes exist
- No white-screen crashes

---

## Phase 1 — Auth + API foundation

**Goal:** Login, register, **refresh token rotation**, API client, SSE parser, route protection.

**Backend gate:** `POST /auth/refresh` must exist — see [contract](./backend-frontend-contract.md#post-authrefresh). If missing, implement on backend **before** marking Phase 1 complete.

### 1.1 — Install form dependencies

```bash
pnpm add react-hook-form @hookform/resolvers zod
```

### 1.2 — API client (`lib/api/client.ts`)

| Method | Behaviour |
|--------|-----------|
| `get/post/patch/delete` | JSON; Bearer from auth store |
| `stream` | Raw `Response` for SSE |
| All | On **401**: refresh + **one** retry max — see circuit breaker below |

| Status | Handling |
|--------|----------|
| 401 (first attempt) | `handleUnauthorized()` → refresh → retry with `isRetry: true` |
| 401 (`isRetry: true`) | **Do not refresh again** — `clearSession()` + redirect (or throw `ApiError`) |
| 429 | Throw `{ status: 429, retryAfter }` |
| 503 on `/ai/*` | Throw `AiUnavailableError` |

`lib/api/sse-parser.ts` — async generator `{ event, data }`; zero React coupling.

#### 401 circuit breaker (required — prevents infinite refresh loops)

"Retry once" must be enforced in code, not by convention. Pass an internal `isRetry` flag on every request path:

```ts
// lib/api/client.ts — internal shape
type RequestOptions = {
  method: string;
  body?: unknown;
  /** Set true only on the single post-refresh replay. Never on the first attempt. */
  isRetry?: boolean;
};

async function request<T>(path: string, options: RequestOptions): Promise<T> {
  const res = await fetch(url(path), {
    method: options.method,
    headers: authHeaders(),
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (res.status === 401) {
    // Circuit breaker: second 401 means refresh already ran (or replay used new token).
    // Causes: expired refresh, revoked session, valid token but no resource access (RBAC).
    // Must NOT call handleUnauthorized() again — that would loop refresh → retry → 401 → refresh…
    if (options.isRetry) {
      clearSession();
      redirectToLogin("unauthorized");
      throw new ApiError(401, "Unauthorized");
    }

    const refreshed = await handleUnauthorized();
    if (!refreshed) {
      clearSession();
      redirectToLogin("session_expired");
      throw new ApiError(401, "Session expired");
    }

    return request<T>(path, { ...options, isRetry: true });
  }

  // ... handle 429, 503, parse JSON
}
```

**Rules:**

| Rule | Why |
|------|-----|
| `isRetry` defaults to `false` | First 401 may be fixable with refresh |
| Exactly **one** replay per original call | `isRetry: true` on replay only |
| Second 401 → logout, never refresh | Token is fresh; failure is session/RBAC — not stale access token |
| `stream()` uses the same flag | Pre-check refresh via `guardStream()`; if stream returns 401 mid-flight, do not auto-refresh inside parser — abort and surface error |
| Public routes (`/auth/login`) skip refresh | `auth.ts` calls `fetch` directly or passes `skipAuthRefresh: true` |

**Phase 1 tests (manual or unit):**

1. First 401 + successful refresh → request succeeds on replay.
2. First 401 + failed refresh → logout, no replay.
3. Replay returns 401 → logout, `handleUnauthorized` called **once** total.
4. Concurrent 401s → mutex in `token-refresh.ts` dedupes to a single refresh.

### 1.3 — Auth store (`lib/stores/auth-store.ts`)

```ts
type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  userId: string | null;
  workspaceId: string | null;
  role: "owner" | "admin" | "member" | null;
  setSession: (tokens: TokenPair, claims: JwtClaims) => void;
  updateTokens: (tokens: TokenPair) => void;
  clearSession: () => void;
};

type TokenPair = { accessToken: string; refreshToken: string };
```

**Storage policy (production v1):**

| Token | Storage |
|-------|---------|
| Access | `sessionStorage` + Zustand (survives F5, not cross-tab) |
| Refresh | Zustand memory **or** httpOnly cookie if backend uses Option B |

When backend ships httpOnly refresh cookie: drop refresh from Zustand; set `credentials: "include"` on `auth.ts` only.

### 1.4 — Token utilities (`lib/auth/token.ts`)

```ts
getTokenExpiry(token: string): number;
isTokenExpiredOrExpiringSoon(token: string, bufferSeconds = 60): boolean;
refreshAccessToken(refreshToken: string): Promise<TokenPair>;
// POST /auth/refresh — updates both tokens (rotation)
```

### 1.5 — Token refresh coordinator (`lib/auth/token-refresh.ts`)

Single module — **only** place refresh logic lives:

```ts
refreshIfNeeded(): Promise<boolean>;  // proactive before SSE
handleUnauthorized(): Promise<boolean>; // reactive on 401, called by apiClient
```

Prevents concurrent refresh storms (mutex / in-flight promise dedup).

### 1.6 — Stream guard (`lib/hooks/use-stream-guard.ts`)

```ts
guardStream(): Promise<boolean>;
// await refreshIfNeeded() → false if redirecting to login
```

Used by `use-chat-stream` and `use-agent-stream`.

### 1.7 — API module scaffold

```
lib/api/
  client.ts
  sse-parser.ts
  auth.ts           login(), register(), refresh()
  notes.ts | files.ts | workspaces.ts | notebooks.ts
  ai/chat.ts | agent.ts | threads.ts | search.ts
```

### 1.8 — OpenAPI types

```bash
pnpm add -D openapi-typescript
```

Script: `"api:types": "openapi-typescript http://127.0.0.1/openapi.json -o lib/api/schema.d.ts"`

### 1.9 — Middleware

Presence cookie `dashnotes_authed=1` (no token value) for `(app)/*` redirect gate. Real security = Bearer on every API call.

### 1.10 — Login / register pages

- RHF + Zod forms
- `setSession(tokenPair, claims)` + presence cookie → `/notes`
- 429 inline countdown on auth pages

### Phase 1 exit criteria

- Login + register against live backend
- Refresh rotation works; SSE guard refreshes proactively
- **401 circuit breaker:** replay uses `isRetry: true`; second 401 never triggers another refresh
- 401 after failed refresh → logout
- Protected routes gated

---

## Phase 2 — App shell

**Goal:** Sidebar, **read-only workspace label**, AI health, automation **abstraction**, mobile layout.

### 2.1 — Shell dependencies

```bash
pnpm dlx shadcn@latest add sidebar
```

### 2.2 — Shell store (`lib/stores/shell-store.ts`)

Includes `paletteOpen`, `contextPanelContent`, sidebar state.

### 2.3 — Query keys (`lib/query-keys.ts`)

Full factory file — include `aiHealth`, `automationCount` (see frontend-stack).

### 2.4 — Workspace display (switching deferred)

| Component | Launch behaviour | Future |
|-----------|------------------|--------|
| `WorkspaceLabel` | Shows current workspace name from `GET /workspaces` + JWT `wid` | — |
| `WorkspaceSwitcher` | **Not rendered** | Drop-in when `POST /auth/switch-workspace` exists |

```ts
// lib/workspaces/workspace-context.ts — interface only
export type WorkspaceSwitchHandler = (workspaceId: string) => Promise<void>;
// Implementation: no-op stub today; real impl calls switch endpoint + queryClient.clear()
```

Sidebar shows `WorkspaceLabel` at top — not a dropdown.

### 2.5 — AI health

| Piece | Behaviour |
|-------|-----------|
| `use-ai-health.ts` | Poll `GET /health/ai` every 60s; `enabled: false` on 404 |
| `AiStatusIndicator` | green / amber / red |
| `AiDegradationBanner` | When `unavailable` or repeated `/ai/*` 503 |

### 2.6 — Automation abstraction (paused, wired)

Build the **port** now; connect backend later.

```
lib/automation/
  config.ts              # AUTOMATION_ENABLED from env
  types.ts               # AutomationPendingEvent, etc.
  notification-port.ts   # interface NotificationPort { subscribe(), disconnect() }
  notification-stub.ts   # no-op implementation (default)
  notification-sse.ts    # real EventSource — swap when backend ready
```

```ts
// lib/automation/config.ts
export const automationConfig = {
  enabled: process.env.NEXT_PUBLIC_AUTOMATION_ENABLED === "true",
  notificationsUrl: "/ai/notifications/stream",
};
```

| Hook / component | Launch | When enabled |
|------------------|--------|--------------|
| `useAutomationNotifications` | Uses stub port | SSE + invalidate count |
| `useAutomationCount` | Returns `{ pending: 0 }` on 404 | REST count |
| `AutomationBadgeSlot` | Renders nothing if disabled | Badge on Settings nav |

Wire `useAutomationNotifications()` in `(app)/layout.tsx` — stub is zero-cost.

### 2.7 — Sidebar, layout, mobile, RoleGate, Toaster

Per wireframes. Sidebar uses `WorkspaceLabel` not switcher. `AutomationBadgeSlot` on Settings item.

### Phase 2 exit criteria

- Full shell navigates; workspace name visible (not switchable)
- AI health works or hidden on 404
- Automation abstraction in place; stub active
- Mobile layout correct

---

## Phase 3 — Notes + notebooks

**Goal:** CRUD, **Tiptap** editor, privacy, notebooks, **`indexing_status`** badges.

**Backend gate:** `indexing_status` on note responses — [contract](./backend-frontend-contract.md#p0--indexing-status-required-before-frontend-phase-34-polish).

### 3.1 — Install

```bash
pnpm add @tiptap/react @tiptap/starter-kit @tiptap/extension-placeholder @tiptap/extension-character-count
pnpm add react-markdown remark-gfm   # assistant display + optional note preview
pnpm dlx shadcn@latest add select popover
```

Tiptap is MIT — no usage fees. Code-split with `next/dynamic` in editor page.

### 3.2 — Indexing utility (`lib/utils/indexing-status.ts`)

```ts
// Reads note.indexing_status from API — single source of truth
export function getIndexingDisplay(status: IndexingStatus): BadgeConfig;
```

Fallback only if backend field missing during dev: treat as `processing` for 3min then `failed` UI.

### 3.3 — Tiptap editor (`components/notes/NoteEditor.tsx`)

- StarterKit + Placeholder + CharacterCount
- Debounced auto-save 1500ms
- `TiptapErrorBoundary` — editor crash does not kill shell
- Store format: match backend (`content` / markdown / JSON — confirm from OpenAPI)

### 3.4 — Notes list, editor page, notebook view, polling

Poll `refetchInterval: 5000` while `indexing_status` is `pending` | `processing`.

### Phase 3 exit criteria

- Tiptap CRUD with auto-save
- Badges driven by `indexing_status`
- Privacy toggle works

---

## Phase 4 — Files

**Goal:** Upload, library, detail, **`indexing_status`** poll, AI summary.

Same indexing pattern as notes — `file.indexing_status`, not `summary` heuristics alone.

```bash
pnpm add react-dropzone
pnpm dlx shadcn@latest add progress
```

XHR upload for progress. Poll until `indexed` or `failed`.

### Phase 4 exit criteria

- Upload + list + detail + download
- Status badges from API field

---

## Phase 5 — Chat (RAG)

**Goal:** Threads, SSE, citations, refresh-guarded streams.

- `use-chat-stream` → `guardStream()` → `POST /ai/chat/stream`
- Citations **only** from `metadata` event
- `react-markdown` for assistant bubbles

### Phase 5 exit criteria

- Streaming + citations + thread persistence
- Token refresh before long streams

---

## Phase 6 — Agents

**Goal:** Hub, workspace assistant, tool trace, note cache invalidation.

- `use-agent-stream` — same guard pattern
- `tool_end` on `create_note` | `update_note` → invalidate notes + toast

### Phase 6 exit criteria

- Assistant live; tool trace real-time

---

## Phase 7 — Command palette

```bash
pnpm add cmdk
pnpm dlx shadcn@latest add command
```

`next/dynamic` load palette. Local cache search + `GET /ai/test-search`.

---

## Phase 8 — Settings

Members table, account, automation inbox page.

`AutomationQueue` reads REST when `AUTOMATION_ENABLED`; else "Coming soon" empty state with copy explaining governance inbox.

---

## Phase 9 — Production hardening

| Area | Requirement |
|------|-------------|
| Loading | Skeleton + empty + error on every route |
| Polling | 3min cap; manual retry on `failed` indexing |
| Rate limits | `toast.rateLimited` everywhere |
| Offline | Banner + reconnect refetch |
| a11y | WCAG contrast in light + dark (`next-themes`) |
| Performance | `React.memo` list items; dynamic Tiptap + CommandPalette |
| Security | No secrets in Next app; `.model.env` gitignored |
| Boundaries | Global + AI + Tiptap |
| Refresh | No refresh token in logs; rotate on use |

---

## Build order summary

| Phase | Ships | Backend dependency |
|-------|-------|-------------------|
| 0 | Theme, providers, routes | — |
| 1 | Auth + refresh + API client | `POST /auth/refresh` |
| 2 | Shell, workspace label, automation stub | `GET /health/ai` optional |
| 3 | Notes + Tiptap | `indexing_status` on notes |
| 4 | Files | `indexing_status` on files |
| 5 | Chat SSE | `/ai/chat/stream` |
| 6 | Agents | `/ai/agent/stream` |
| 7 | ⌘K palette | `/ai/test-search` |
| 8 | Settings | `/workspaces/members` |
| 9 | Polish | — |

**~28 days** solo — Phase 1 blocked until refresh endpoint exists.

---

## Extension points (future, no rework)

| Feature | Extension |
|---------|-----------|
| Workspace switch | Implement `WorkspaceSwitchHandler`; swap `WorkspaceLabel` → `WorkspaceSwitcher` |
| Automation | Set `NEXT_PUBLIC_AUTOMATION_ENABLED=true`; register `notification-sse.ts` in port factory |
| httpOnly refresh | Remove refresh from Zustand; `credentials: "include"` on auth routes |
| Multi-agent | Map `agentSlug` → endpoint in `lib/api/ai/agents.ts` registry |

---

*Blueprint v2 — production-grade defaults; locked decisions 2026-06-20.*
