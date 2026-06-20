# DashNotes — Frontend Tech Stack

Implementation guide for the DashNotes Next.js client. Aligns with **`docs/backendapi.md`** (FastAPI backend) and **`docs/wireframes.md`** (UI layouts).

Use this doc when choosing libraries, scaffolding folders, or reviewing PRs. Prefer conventions here over ad-hoc additions.

---

## Stack at a glance

| Layer | Choice | Notes |
|-------|--------|-------|
| Framework | **Next.js 16** App Router | Already in repo |
| UI runtime | **React 19** + **TypeScript** | Strict mode |
| Styling | **Tailwind CSS 4** | Already in repo |
| Components | **shadcn/ui** + **Radix** | Copy-in components, full control |
| Icons | **lucide-react** | Bundled with shadcn |
| Server state | **TanStack Query v5** | REST lists, mutations, polling |
| Client state | **Zustand** | Auth, workspace, shell UI only |
| Forms | **React Hook Form** + **Zod** | All user input |
| API types | **openapi-typescript** | Generated from FastAPI OpenAPI |
| HTTP | **fetch** wrapper | Bearer token, 401/429/503 handling |
| AI streaming | **Custom SSE hooks** | Not Vercel AI SDK (see below) |
| Toasts | **sonner** | Mutations, errors, retry countdown |
| Command palette | **cmdk** | ⌘K search + actions |
| Tables | **@tanstack/react-table** | Files, members |
| File upload | **react-dropzone** | Multipart to `/files/upload` |
| JWT decode | **jose** | Read claims client-side only |
| Note editor | **Markdown MVP → Tiptap** | Phased upgrade |

### Explicitly deferred

| Package | Why skip (for now) |
|---------|-------------------|
| **Vercel AI SDK** (`ai`, `@ai-sdk/react`) | AI runs on FastAPI with custom SSE events; SDK targets Next route handlers / provider-native streams |
| **Redux / Jotai for server data** | TanStack Query covers server state |
| **Axios** | `fetch` + thin wrapper is enough |
| **SWR** | Overlaps with TanStack Query; pick one |

---

## Architecture principles

1. **Backend owns AI** — RAG, agent tools, citations, and governance live in FastAPI. The frontend consumes HTTP + SSE; it does not embed LLM logic.
2. **Workspace is the cache boundary** — JWT `wid` scopes all queries. Switching workspace → `queryClient.clear()`.
3. **Never send `workspace_id` from the client on AI routes** — tenant comes from JWT only (matches backend laws).
4. **Chat ≠ Agent** — separate routes, hooks, and UI parsers (see wireframes).
5. **Citations from metadata** — parse SSE `metadata` events for citations and `thread_id`; never scrape citations from token text.
6. **Types from OpenAPI** — regenerate when backend schemas change; avoid hand-written duplicate DTOs.

---

## Core framework

Already configured in `package.json`:

```json
"next": "16.2.4",
"react": "19.2.4",
"tailwindcss": "^4"
```

**Routing:** App Router with route groups:

```
app/
  (auth)/          ← public: login, register
  (app)/           ← protected shell: notes, files, chat, agents, settings
```

**Rendering split:**

| Use | Pattern |
|-----|---------|
| Static shell, metadata | Server Components |
| Forms, streaming, uploads, interactive lists | Client Components (`"use client"`) |

Read `node_modules/next/dist/docs/` before using Next.js APIs — this project uses Next 16 conventions.

---

## UI layer — shadcn/ui

Install via [shadcn CLI](https://ui.shadcn.com/docs/installation/next) (Tailwind 4 + App Router).

**Install early:**

| Component / lib | Used for |
|-----------------|----------|
| `button`, `input`, `label`, `form` | Auth, settings |
| `sidebar`, `sheet`, `dropdown-menu` | App shell |
| `dialog`, `alert-dialog` | Confirm delete, invite member |
| `badge` | Processing, indexed, private, role |
| `tabs` | File grid/list, settings |
| `table` + TanStack Table | Files, members |
| `command` (cmdk) | ⌘K palette |
| `sonner` | Toasts |
| `skeleton` | Loading states |
| `avatar` | User menu |
| `scroll-area` | Chat, thread lists |
| `separator`, `tooltip` | Shell polish |

**Theming:** start light-only; add `next-themes` when dark mode is requested.

---

## Data layer — TanStack Query

Single source of truth for all REST data from the backend.

### Query key convention

```ts
// lib/query-keys.ts
export const queryKeys = {
  notes: (wid: string) => ["notes", wid] as const,
  note: (wid: string, id: string) => ["notes", wid, id] as const,
  files: (wid: string) => ["files", wid] as const,
  file: (wid: string, id: string) => ["files", wid, id] as const,
  threads: (wid: string) => ["ai", "threads", wid] as const,
  threadMessages: (wid: string, threadId: string) =>
    ["ai", "threads", wid, threadId, "messages"] as const,
  workspaces: () => ["workspaces"] as const,
  members: (wid: string) => ["members", wid] as const,
};
```

Always include `workspaceId` from JWT in keys so cache isolation is automatic.

### Patterns by feature

| Feature | Pattern |
|---------|---------|
| Notes / files list | `useQuery` with `staleTime: 60_000` (aligns with backend Redis cache TTL) |
| Note/file update | `useMutation` → `invalidateQueries` on success |
| File/note AI processing | `refetchInterval: 5000` until `extracted_text` / `summary` / `tags` populated, then stop |
| Workspace switch | `queryClient.clear()` + update Zustand `workspaceId` + new token |
| Thread list after chat | Invalidate `queryKeys.threads(wid)` when SSE `metadata` returns `thread_id` |
| Agent created note | Invalidate `queryKeys.notes(wid)` on `tool_end` for `create_note` / `update_note` |

### Provider setup

```tsx
// providers/query-provider.tsx
"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { retry: 1, refetchOnWindowFocus: false },
        },
      })
  );
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
```

Add `@tanstack/react-query-devtools` in development only.

---

## Client state — Zustand

Keep this store **small**. Do not mirror TanStack Query data here.

```ts
// lib/stores/auth-store.ts — shape only
type AuthState = {
  accessToken: string | null;
  userId: string | null;
  workspaceId: string | null;
  role: "owner" | "admin" | "member" | null;
  setSession: (token: string, claims: JwtClaims) => void;
  clearSession: () => void;
};

type ShellState = {
  sidebarOpen: boolean;
  contextPanelOpen: boolean;
  toggleSidebar: () => void;
};
```

Separate `auth-store` and `shell-store` (or one slice-based store). Persist token to `sessionStorage` if needed across refresh — never commit tokens to git.

---

## Forms — React Hook Form + Zod

Standard pattern for every form:

```tsx
const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const form = useForm<z.infer<typeof schema>>({
  resolver: zodResolver(schema),
});
```

### Schemas aligned with backend

| Form | Zod rules (match API) |
|------|------------------------|
| Login / register | email, password min length |
| Note create/edit | title, body, `is_private: boolean` |
| Chat / agent message | `message`: string min 1 max 2000 |
| File upload | File type + size (mirror `core/storage/utils.py` limits) |
| Invite member | email, `role`: enum `owner` \| `admin` \| `member` |

Use shadcn `<Form>` + `<FormField>` wrappers. Surface API validation errors from FastAPI `detail` in form-level or field-level messages.

**Why Zod over Valibot/Yup:** best TypeScript inference, largest shadcn ecosystem, easy shared schemas between forms and API response parsing.

---

## API client & types

### Type generation

When backend is running locally:

```bash
npx openapi-typescript http://127.0.0.1/openapi.json -o lib/api/schema.d.ts
```

Commit generated types or regenerate in CI. Add a script:

```json
"scripts": {
  "api:types": "openapi-typescript $NEXT_PUBLIC_API_URL/openapi.json -o lib/api/schema.d.ts"
}
```

### Fetch wrapper

```ts
// lib/api/client.ts — responsibilities
// - base URL from NEXT_PUBLIC_API_URL (default http://127.0.0.1 for dev)
// - Authorization: Bearer from auth store
// - JSON parse + typed errors
// - 401 → clearSession + redirect /auth/login
// - 429 → throw with retryAfter seconds from Retry-After header
// - 503 on /ai/* → AiUnavailableError for degradation banner
```

Organize by domain:

```
lib/api/
  client.ts
  schema.d.ts      ← generated
  auth.ts
  notes.ts
  files.ts
  workspaces.ts
  ai/
    chat.ts
    agent.ts
    threads.ts
    search.ts
```

---

## Auth

### Phase 0 (ship first)

1. `POST /auth/login` → store `access_token`
2. Decode JWT with **jose** (`sub`, `wid`, `role`) — display only; backend validates
3. Next.js middleware on `(app)/*`: redirect if no token
4. Attach Bearer on every API call

### Phase 1 (optional hardening)

- Next.js Route Handler sets **httpOnly** cookie
- Refresh token flow when backend exposes it

### RBAC in UI

| Role | UI |
|------|-----|
| `member` | Hide member admin; restrict delete on others' notes |
| `admin`, `owner` | Settings → workspace members; full file visibility |

Use a `<RoleGate roles={["owner", "admin"]}>` wrapper — never rely on UI alone; backend enforces permissions.

---

## AI streaming — custom hooks (not Vercel AI SDK)

Backend SSE contracts (from `docs/backendapi.md`):

**Chat** (`POST /ai/chat/stream`):

```
event: token     → append to assistant message
event: metadata  → citations[], thread_id, chunks_retrieved, latency_ms
event: [DONE]
```

**Agent** (`POST /ai/agent/stream`):

```
event: token       → append to assistant message
event: tool_start  → add row to tool trace panel
event: tool_end    → complete tool row; invalidate notes if mutation tool
event: done        → steps_taken, tool_calls_made
event: [DONE]
```

### Hook structure

```
lib/hooks/
  use-sse-stream.ts       ← low-level: fetch POST + ReadableStream + SSE parse
  use-chat-stream.ts      ← chat-specific state + citation panel
  use-agent-stream.ts     ← agent-specific state + tool trace
```

Requirements:

- `Cache-Control: no-cache` respected; use `fetch` streaming (POST body), not GET `EventSource`
- AbortController on unmount / new message
- **503** → user message: "LLM temporarily unavailable; retry shortly"
- Citations rendered **only** after `metadata` event

### Why not Vercel AI SDK

| Vercel AI SDK fits | DashNotes today |
|--------------------|-----------------|
| `useChat` against Next.js `/api/chat` | Chat runs on FastAPI `/ai/chat/stream` |
| Provider-native stream format | Custom SSE event names |
| Tool calls via SDK abstractions | LangGraph agent on backend |

Revisit AI SDK only if you add Next.js BFF routes that proxy and normalize streams.

---

## Note editor (phased)

| Phase | Stack | When |
|-------|-------|------|
| **MVP** | `<Textarea>` + `react-markdown` preview | Phase 1 notes CRUD |
| **V1** | **Tiptap** (`@tiptap/react`, starter-kit) | When rich text is priority |

Store markdown or JSON from Tiptap — match whatever `POST /notes` accepts today.

---

## Command palette (⌘K)

- shadcn `Command` + **cmdk**
- Actions: new note, upload file, new chat, open agent
- AI search: `GET /ai/test-search?q=&limit=5` (workspace from JWT)
- Local fuzzy filter on cached notes/files from TanStack Query

Global shortcut: `useEffect` + `(e.metaKey || e.ctrlKey) && e.key === "k"`.

---

## Environment variables

```bash
# .env.local (never commit — .gitignore covers .env*)
NEXT_PUBLIC_API_URL=http://127.0.0.1
```

Use port **80** (Nginx) in local full-stack dev per backend docs. Never put LLM keys in the Next.js app — they stay on the backend.

**Also ignore:** `.model.env` (explicitly in `.gitignore` — does not match `.env*` pattern).

---

## Folder structure

```
app/
  (auth)/
    login/page.tsx
    register/page.tsx
  (app)/
    layout.tsx              ← shell, auth guard
    notes/...
    files/...
    chat/...
    agents/...
    settings/...
  layout.tsx
  globals.css

components/
  shell/                    ← Sidebar, WorkspaceSwitcher, AiStatusBanner
  notes/
  files/
  ai/                       ← MessageList, CitationPanel, ToolTrace
  ui/                       ← shadcn

lib/
  api/
  hooks/
  stores/
  query-keys.ts
  utils.ts

providers/
  query-provider.tsx
  auth-provider.tsx         ← optional hydration wrapper
```

---

## Install checklist

Run from repo root when starting implementation:

```bash
# Data & state
pnpm add @tanstack/react-query zustand

# Forms
pnpm add zod react-hook-form @hookform/resolvers

# Auth utils
pnpm add jose

# UX
pnpm add sonner cmdk react-dropzone

# Tables
pnpm add @tanstack/react-table

# Dev
pnpm add -D openapi-typescript @tanstack/react-query-devtools

# shadcn — follow https://ui.shadcn.com/docs/installation/next
pnpm dlx shadcn@latest init
pnpm dlx shadcn@latest add button input label form sidebar dialog badge table command scroll-area sonner skeleton
```

Editor (later):

```bash
pnpm add @tiptap/react @tiptap/starter-kit
pnpm add react-markdown   # MVP preview
```

---

## Implementation order

Follow this sequence — matches `docs/wireframes.md` build order:

| Step | Deliverable | Stack used |
|------|-------------|------------|
| 1 | shadcn init, app shell, providers | shadcn, Query, Zustand |
| 2 | Auth pages + middleware | RHF, Zod, jose, fetch wrapper |
| 3 | OpenAPI types + API modules | openapi-typescript |
| 4 | Notes + notebooks CRUD | TanStack Query, RHF |
| 5 | Files upload + processing poll | dropzone, Query `refetchInterval` |
| 6 | Chat UI + SSE | custom `use-chat-stream` |
| 7 | Agent hub + tool trace | custom `use-agent-stream` |
| 8 | ⌘K palette | cmdk, test-search |
| 9 | Settings / members | RoleGate, TanStack Table |
| 10 | Tiptap editor | Tiptap |
| 11 | Automation inbox | when backend exposes queue API |

---

## Error & degradation UX

| HTTP | UI behavior |
|------|-------------|
| **401** | Clear session → `/auth/login` |
| **404** | Thread/note not found (cross-workspace) |
| **429** | Toast with `Retry-After` countdown |
| **503** on `/ai/*` | Inline retry + global AI banner; notes/files still work |
| **Network** | Toast + Query retry |

Poll `GET /health/ai` (when available) for AI status indicator in shell (green / amber / red).

---

## Code review checklist

- [ ] Query keys include `workspaceId`
- [ ] No `workspace_id` in AI request bodies or query params
- [ ] Mutations invalidate the right query keys
- [ ] No secrets in env files committed (`.env*`, `.model.env`)
- [ ] Streaming hooks abort on unmount
- [ ] Citations from SSE metadata only
- [ ] RBAC reflected in UI; not only hidden buttons
- [ ] New API fields prefer generated types over manual interfaces

---

## Related docs

| Doc | Content |
|-----|---------|
| `docs/backendapi.md` | FastAPI routes, AI slices, RBAC, SSE contracts |
| `docs/wireframes.md` | Screen layouts, routes, API → screen index |
| `docs/frontend-stack.md` | This file — libraries, patterns, build order |

---

*Stack doc v1 — Next.js 16 client for DashNotes multi-tenant notes, files, RAG chat, and LangGraph agents.*
