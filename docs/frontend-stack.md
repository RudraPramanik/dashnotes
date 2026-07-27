# DashNotes — Frontend Tech Stack

Implementation guide for the DashNotes Next.js client. Aligns with **`docs/backendapi.md`**, **`docs/backend-frontend-contract.md`**, **`docs/wireframes.md`**, and **`docs/primary-blueprint.md`**.

Use this doc when choosing libraries, scaffolding folders, or reviewing PRs.

---

## Locked decisions

| Topic | Choice |
|-------|--------|
| Refresh tokens | Required — `POST /auth/refresh`, proactive before SSE, mutex dedup |
| Workspace switching | Deferred — `WorkspaceLabel` only at launch |
| Automation | Abstract port + `NEXT_PUBLIC_AUTOMATION_ENABLED` feature flag |
| Indexing UI | `indexing_status` from API — not tag heuristics |
| Editor | **Tiptap** from Phase 3 (MIT, no usage fees) |
| Theme | **shadcn + `next-themes`** — dark default |
| AI streaming | Custom SSE hooks — not Vercel AI SDK |

---

## Stack at a glance

| Layer | Choice | Notes |
|-------|--------|-------|
| Framework | **Next.js 16** App Router | Already in repo |
| UI runtime | **React 19** + **TypeScript** | Strict mode |
| Styling | **Tailwind CSS 4** | `globals.css` + shadcn CSS variables |
| Components | **shadcn/ui** + **Radix** | Copy-in; single `shadcn init` |
| Theme | **`next-themes`** | Class strategy; `defaultTheme="dark"` |
| Icons | **lucide-react** | Via shadcn |
| Server state | **TanStack Query v5** | REST, mutations, polling |
| Client state | **Zustand** | Auth tokens, shell UI only — **not** theme |
| Forms | **React Hook Form** + **Zod** | All user input |
| API types | **openapi-typescript** | From FastAPI `/openapi.json` |
| HTTP | **fetch** wrapper | 401 → refresh → retry once (`isRetry` circuit breaker) |
| AI streaming | **Custom SSE hooks** | `sse-parser.ts` + chat/agent hooks |
| Toasts | **sonner** | shadcn integration |
| Command palette | **cmdk** + shadcn `Command` | ⌘K |
| Tables | **@tanstack/react-table** | Members, file list |
| File upload | **react-dropzone** | Multipart `/files/upload` |
| Note editor | **Tiptap** | `@tiptap/react`, starter-kit |
| Markdown display | **react-markdown** + **remark-gfm** | Chat bubbles, previews |
| JWT | **jose** | `decodeJwt` for claims display only |
| Errors | **react-error-boundary** | Global + AI + Tiptap scopes |

### Explicitly not used

| Package | Reason |
|---------|--------|
| Vercel AI SDK | AI on FastAPI with custom SSE events |
| Custom Zustand theme store | `next-themes` is the standard with shadcn |
| Redux / SWR | TanStack Query covers server state |
| Axios | `fetch` + thin wrapper sufficient |

---

## Architecture principles

1. **Backend owns AI** — frontend consumes HTTP + SSE only.
2. **Workspace is the cache boundary** — JWT `wid` in every query key.
3. **Never send `workspace_id` on AI routes** — tenant from JWT.
4. **Chat ≠ Agent** — separate hooks and UI parsers.
5. **Citations from SSE `metadata` only** — never parse token stream.
6. **Types from OpenAPI** — regenerate on backend schema change; Phase 3+ uses `lib/api/types.ts` (Step 2.11 gate) — no `unknown` / cast bypass.
7. **Refresh in one module** — `lib/auth/token-refresh.ts`; apiClient and stream guard call it.
8. **401 circuit breaker** — shared internal `executeWithAuthRetry` for JSON and `stream`; `isRetry` flag; second 401 never calls refresh again.
9. **Feature flags for unfinished backend** — automation, optional health endpoint.
10. **Server Components by default** — `app/(app)/layout.tsx` stays a Server Component; interactivity in named client leaves (`AppShellEffects`, banners, toggles).
11. **ContextPanel is a slot** — `{ children }` only; no feature-directory imports. Pages own panel content.
12. **Chrome-only shell store** — sidebar / panel open / palette flags only — never citations, tool-trace, or domain payloads.
13. **Shared indexing poll** — `useIndexingPoll` owns the ~180s timeout; `use-note` / `use-file` delegate to it.
14. **Composition + strict props** — prefer leaf composition (e.g. NoteEditor) over god components; leaves take primitives/callbacks only.

Patched step text: see `docs/update_blueprint.md` (supersedes matching v2 sections in `docs/final-blueprint.md`).

---

## Theming — shadcn + next-themes

```bash
pnpm add next-themes
```

```tsx
// providers/ThemeProvider.tsx
"use client";
import { ThemeProvider as NextThemesProvider } from "next-themes";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="dark" enableSystem>
      {children}
    </NextThemesProvider>
  );
}
```

```tsx
// app/layout.tsx
<html lang="en" suppressHydrationWarning>
  <body>
    <ThemeProvider>...</ThemeProvider>
  </body>
</html>
```

```tsx
// components/shell/ThemeToggle.tsx
import { useTheme } from "next-themes";
// Toggle between "dark" | "light"
```

Use shadcn CSS variables in `globals.css` — no parallel theme system.

---

## Auth and refresh tokens

### Token storage (v1)

| Token | Where |
|-------|--------|
| Access | Zustand + `sessionStorage` |
| Refresh | Zustand memory (rotate on each refresh) |

**Future:** httpOnly refresh cookie from backend — see [backend-frontend-contract.md](./backend-frontend-contract.md#post-authrefresh).

### Auth store

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
```

### Refresh flow

```
apiClient.request(path, { isRetry: false })
  → 401?
    → isRetry === true?
        YES → clearSession() + redirect (circuit breaker — do NOT refresh)
        NO  → handleUnauthorized() (mutex, once)
              → refresh OK? → replay request(path, { isRetry: true })
              → refresh fail? → clearSession() + redirect

use-stream-guard.guardStream()
  → refreshIfNeeded() (60s buffer before exp)
  → false if redirecting
```

```ts
// lib/api/client.ts — required pattern
type RequestOptions = {
  isRetry?: boolean; // internal; true only on post-refresh replay
};

async function request<T>(path: string, opts: RequestOptions): Promise<T> {
  const res = await fetch(...);
  if (res.status === 401) {
    if (opts.isRetry) {
      clearSession();
      throw new ApiError(401, "Unauthorized");
    }
    const ok = await handleUnauthorized();
    if (!ok) throw new ApiError(401, "Session expired");
    return request<T>(path, { ...opts, isRetry: true });
  }
  // ...
}
```

**Why:** After a successful refresh, a second 401 means the token is valid but the session or resource access failed (revoked user, RBAC, wrong workspace). Calling refresh again causes an infinite loop.

Never log tokens. Never commit tokens. Rotate refresh on every use.

---

## Workspace (deferred switching)

At launch:

```tsx
// components/shell/WorkspaceLabel.tsx — read-only
// GET /workspaces → match JWT wid → display name
```

Future:

```tsx
// components/shell/WorkspaceSwitcher.tsx
// POST /auth/switch-workspace → queryClient.clear() → setSession
```

```ts
// lib/workspaces/workspace-context.ts
export type WorkspaceSwitchHandler = (workspaceId: string) => Promise<void>;
```

---

## Automation abstraction

```ts
// lib/automation/config.ts
export const automationConfig = {
  enabled: process.env.NEXT_PUBLIC_AUTOMATION_ENABLED === "true",
};
```

```
lib/automation/
  config.ts
  types.ts
  notification-port.ts    // interface
  notification-stub.ts    // default no-op
  notification-sse.ts     // when backend ready
```

```ts
// Factory
export function createNotificationPort(): NotificationPort {
  return automationConfig.enabled
    ? new SseNotificationPort()
    : new StubNotificationPort();
}
```

Enable with `NEXT_PUBLIC_AUTOMATION_ENABLED=true` when `GET /ai/notifications/stream` ships.

---

## Indexing status

Use backend field — do not infer from empty tags:

```ts
type IndexingStatus = "pending" | "processing" | "indexed" | "failed";
```

```ts
// Poll while pending | processing
refetchInterval: (query) =>
  ["pending", "processing"].includes(query.state.data?.indexing_status)
    ? 5000
    : false;
```

See [backend-frontend-contract.md](./backend-frontend-contract.md#p0--indexing-status).

---

## Data layer — TanStack Query

### Query keys

```ts
export const queryKeys = {
  notes: (wid: string) => ["notes", wid] as const,
  note: (wid: string, id: string) => ["notes", wid, id] as const,
  files: (wid: string) => ["files", wid] as const,
  file: (wid: string, id: string) => ["files", wid, id] as const,
  notebooks: (wid: string) => ["notebooks", wid] as const,
  threads: (wid: string) => ["ai", "threads", wid] as const,
  threadMessages: (wid: string, tid: string) =>
    ["ai", "threads", wid, tid, "messages"] as const,
  workspaces: () => ["workspaces"] as const,
  members: (wid: string) => ["members", wid] as const,
  aiHealth: () => ["ai", "health"] as const,
  automationCount: (wid: string) => ["automation", "pending-count", wid] as const,
};
```

`staleTime: 60_000` on list queries (aligns with backend Redis cache TTL).

---

## Note editor — Tiptap

```bash
pnpm add @tiptap/react @tiptap/starter-kit @tiptap/extension-placeholder @tiptap/extension-character-count
```

```tsx
// app/(app)/notes/[noteId]/page.tsx
const NoteEditor = dynamic(() => import("@/components/notes/NoteEditor"), {
  ssr: false,
  loading: () => <EditorSkeleton />,
});
```

Tiptap is MIT-licensed — safe for commercial production with no per-seat fees.

---

## AI streaming

```
lib/api/sse-parser.ts           ← parse ReadableStream
lib/auth/token-refresh.ts       ← refresh before stream
lib/hooks/use-stream-guard.ts
lib/hooks/ai/use-chat-stream.ts
lib/hooks/ai/use-agent-stream.ts
```

Chat: `token` → `metadata` (citations) → `[DONE]`

Agent: `token` | `tool_start` | `tool_end` | `done` → `[DONE]`

---

## Folder structure

```
app/
  (auth)/login | register
  (app)/layout.tsx
  (app)/notes | files | chat | agents | settings/...

components/
  shell/          ThemeToggle, WorkspaceLabel, Sidebar, AiStatusIndicator
  auth/           LoginForm, RoleGate
  notes/          NoteEditor (Tiptap), NoteCard
  files/
  ai/             CitationPanel, ToolTracePanel, MessageList
  errors/         GlobalErrorBoundary, AiErrorBoundary
  ui/             shadcn

lib/
  api/
  auth/           token.ts, token-refresh.ts
  automation/     port + stub + sse
  workspaces/     workspace-context.ts
  hooks/
  stores/         auth-store.ts, shell-store.ts
  query-keys.ts
  utils/

providers/
  ThemeProvider.tsx
  QueryProvider.tsx
  RootProvider.tsx
```

---

## Environment variables

```bash
# .env.local
NEXT_PUBLIC_API_URL=http://127.0.0.1
NEXT_PUBLIC_AUTOMATION_ENABLED=false
```

Never put LLM API keys in the Next.js app. Ignore `.model.env` in git.

---

## Install checklist (ordered)

```bash
# Phase 0
pnpm add @tanstack/react-query zustand jose sonner next-themes react-error-boundary
pnpm add -D @tanstack/react-query-devtools

pnpm dlx shadcn@latest init
pnpm dlx shadcn@latest add button input label badge tooltip separator skeleton scroll-area avatar dropdown-menu sheet dialog alert-dialog tabs sidebar

# Phase 1
pnpm add react-hook-form @hookform/resolvers zod
pnpm add -D openapi-typescript

# Phase 3
pnpm add @tiptap/react @tiptap/starter-kit @tiptap/extension-placeholder @tiptap/extension-character-count
pnpm add react-markdown remark-gfm

# Phase 4
pnpm add react-dropzone

# Phase 7
pnpm add cmdk

# Phase 8
pnpm add @tanstack/react-table
```

---

## Implementation order

Follow **`docs/primary-blueprint.md`** phases 0–9.

| Phase | Gate |
|-------|------|
| 1 | Backend `POST /auth/refresh` |
| 3–4 | Backend `indexing_status` on notes/files |
| 2 | `GET /health/ai` optional (404 OK) |
| Automation | Set env flag when SSE + queue API ready |

---

## Code review checklist

- [ ] Query keys include `workspaceId`
- [ ] No `workspace_id` in AI request bodies
- [ ] Refresh logic only in `token-refresh.ts`
- [ ] 401 replay passes `isRetry: true`; second 401 does not call refresh
- [ ] No tokens in logs or git
- [ ] `indexing_status` used for badges (not tag heuristics)
- [ ] Citations from SSE metadata only
- [ ] Stream hooks call `guardStream()`
- [ ] Automation behind feature flag
- [ ] Theme via `next-themes` only
- [ ] OpenAPI types regenerated for API changes

---

## Related docs

| Doc | Content |
|-----|---------|
| [backendapi.md](./backendapi.md) | Current backend |
| [backend-frontend-contract.md](./backend-frontend-contract.md) | Integration spec for backend team |
| [final-blueprint.md](./final-blueprint.md) | Cursor implementation prompts (this workflow) |
| [wireframes.md](./wireframes.md) | UI layouts |
| [primary-blueprint.md](./primary-blueprint.md) | Phased build plan |
| [frontend-stack.md](./frontend-stack.md) | This file |

---

*Stack doc v2 — production-grade; aligned with locked decisions 2026-06-20.*
