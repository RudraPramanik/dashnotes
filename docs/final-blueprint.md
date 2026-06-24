# DashNotes — Cursor Agent Prompts

Phase-by-phase implementation guide for Cursor Agent mode.

**Source of truth (attach with `@` — do not duplicate in prompts):**

| Doc | Use |
|-----|-----|
| `docs/final-blueprint.md` | This file — step prompts + validation |
| `docs/primary-blueprint.md` | Phase goals and exit criteria |
| `docs/frontend-stack.md` | Libraries and patterns |
| `docs/backend-frontend-contract.md` | Auth, indexing, API contracts |
| `docs/wireframes.md` | UI layout |
| `PROGRESS.md` | Current slice + branch (update after each step PASS) |

---

## How to use this file

1. **New Cursor Agent chat per session** in the [batching table](#cursor-session-batching-table) below.
2. Paste **HARD RULES** below at the start of every session.
3. Copy prompts for **every step in that session** (in order).
4. Run **each step's Validation** block before continuing within the session.
5. Update `PROGRESS.md` + commit after the **last step** in the session passes.
6. If validation fails, fix in the **same** chat — do not open the next session until all steps in the batch pass.

> **Rule:** Never batch across Phase 1 steps 1.2–1.6 out of order. Never combine **1.6** (apiClient) with anything else.

---

## Cursor session batching table

| Session | Steps | Mode | New chat? | ~Time | Why |
|---------|-------|------|-----------|-------|-----|
| **P0-A** | 0.1 + 0.2 | **Together** | Yes | 30–45m | Install + shadcn init — tooling only, no app logic |
| **P0-B** | 0.3 + 0.4 | **Together** | Yes | 45–60m | Theme + providers must wire together in `layout.tsx` |
| **P0-C** | 0.5 + 0.6 | **Together** | Yes | 30–45m | Routes scaffold + error boundaries complete foundation |
| **P1-A** | 1.1 | **Single** | Yes | 5m | Install only — too small to merge with auth logic |
| **P1-B** | 1.2 | **Single** | Yes | 20m | SSE parser isolated; blocks wrong early apiClient |
| **P1-C** | 1.3 | **Single** | Yes | 30m | Auth store is critical — deserves full agent focus |
| **P1-D** | 1.4 + 1.5 | **Together** | Yes | 45m | Token utils + refresh coordinator are one auth layer |
| **P1-E** | 1.6 | **Single** | Yes | 45–60m | **apiClient + isRetry** — never batch; highest risk step |
| **P1-F** | 1.7 | **Single** | Yes | 15m | Small hook; verify after heavy 1.6 |
| **P1-G** | 1.8 | **Single** | Yes | 30m | Many API stubs + openapi-typescript |
| **P1-H** | 1.9 | **Single** | Yes | 20m | Middleware is security-sensitive — keep isolated |
| **P1-I** | 1.10 | **Single** | Yes | 45–60m | Login form + cookie + setSession — test before register |
| **P1-J** | 1.11 | **Single** | Yes | 30m | Register mirrors login; separate session catches copy-paste bugs |
| **P2-A** | 2.1 + 2.2 + 2.3 | **Together** | Yes | 45m | Sidebar install + shell store + query keys — small infra |
| **P2-B** | 2.4 | **Single** | Yes | 25m | Workspace label + stub interface |
| **P2-C** | 2.5 | **Single** | Yes | 30m | AI health hooks + banner |
| **P2-D** | 2.6 | **Single** | Yes | 45m | Automation port/stub/factory — many files |
| **P2-E** | 2.7 | **Single** | Yes | 20m | RoleGate + toast helpers |
| **P2-F** | 2.8 | **Single** | Yes | 45–60m | Sidebar nav is large |
| **P2-G** | 2.9 | **Single** | Yes | 45–60m | App shell layout — complex; don't merge with mobile |
| **P2-H** | 2.10 | **Single** | Yes | 30m | Mobile tabs + context sheet — depends on 2.9 |
| **P3-A** | 3.1 + 3.2 | **Together** | Yes | 20m | Install + pure util `indexing-status.ts` |
| **P3-B** | 3.3 | **Single** | Yes | 45m | Notes API + hooks + polling logic |
| **P3-C** | 3.4 | **Single** | Yes | 60–90m | Tiptap + boundary + editor page — heavy |
| **P3-D** | 3.5 | **Single** | Yes | 60m | Notes list + notebook view — many components |
| **P4-A** | 4.1 | **Single** | Yes | 10m | Install only |
| **P4-B** | 4.2 | **Single** | Yes | 30m | XHR upload hook — distinct from fetch apiClient |
| **P4-C** | 4.3 + 4.4 | **Together** | Yes | 45m | Files hooks/API + icons + list components |
| **P4-D** | 4.5 | **Single** | Yes | 45m | File detail + context panel integration |
| **P5-A** | 5.1 | **Single** | Yes | 20m | Thread hooks |
| **P5-B** | 5.2 | **Single** | Yes | 45–60m | Chat stream hook — critical SSE logic |
| **P5-C** | 5.3 | **Single** | Yes | 45m | Chat UI components |
| **P5-D** | 5.4 | **Single** | Yes | 45m | Thread list + pages + AiErrorBoundary |
| **P6-A** | 6.1 | **Single** | Yes | 45m | Agent stream hook |
| **P6-B** | 6.2 | **Single** | Yes | 30m | Tool trace panel |
| **P6-C** | 6.3 | **Single** | Yes | 20m | Agent hub (mostly static) |
| **P6-D** | 6.4 | **Single** | Yes | 45m | Agent session pages |
| **P7-A** | 7.1 + 7.2 | **Together** | Yes | 30m | Install + search hook |
| **P7-B** | 7.3 | **Single** | Yes | 45m | Command palette UI + layout wire |
| **P8-A** | 8.1 | **Single** | Yes | 10m | Install only |
| **P8-B** | 8.2 | **Single** | Yes | 25m | Account settings |
| **P8-C** | 8.3 | **Single** | Yes | 45m | Members table + invite |
| **P8-D** | 8.4 | **Single** | Yes | 30m | Automation inbox |
| **P9-A** | 9.1 + 9.2 | **Together** | Yes | 45m | Audits — no new features |
| **P9-B** | 9.3 | **Single** | Yes | 25m | Offline banner |
| **P9-C** | 9.4 + 9.5 | **Together** | Yes | 45m | Performance + security grep audits |
| **P9-D** | 9.6 + 9.7 | **Together** | Yes | 30m | Boundary audit + final build |

**Total: 38 Cursor sessions** (vs 52 steps if every step were alone).

### Quick reference — always single (never batch)

| Step | Reason |
|------|--------|
| **1.6** | apiClient + `isRetry` circuit breaker |
| **1.10** | Login — test before register |
| **2.9** | App shell layout — too many moving parts |
| **3.4** | Tiptap editor |
| **5.2** | Chat SSE stream hook |
| **6.1** | Agent SSE stream hook |

### Quick reference — good to batch

| Batch | Steps |
|-------|-------|
| Foundation tooling | 0.1 + 0.2 |
| Theme + providers | 0.3 + 0.4 |
| Routes + boundaries | 0.5 + 0.6 |
| Token layer | 1.4 + 1.5 |
| Shell infra | 2.1 + 2.2 + 2.3 |
| Notes util install | 3.1 + 3.2 |
| Files mid-phase | 4.3 + 4.4 |
| Palette setup | 7.1 + 7.2 |
| Final audits | 9.1 + 9.2, 9.4 + 9.5, 9.6 + 9.7 |

### Not recommended (your question: 0.1 + 0.2 + 0.3)

| Batch | Verdict |
|-------|---------|
| 0.1 + 0.2 + 0.3 | **Avoid** — 0.3 edits `layout.tsx` before 0.4 adds `RootProvider`; easy to wire theme wrong |
| 1.1 + 1.2 + 1.3 | **Avoid** — auth store should follow SSE alone; order matters |
| 1.4 + 1.5 + 1.6 | **Avoid** — 1.6 must be isolated and verified alone |
| 2.8 + 2.9 + 2.10 | **Avoid** — shell layout breaks often; validate 2.9 before mobile |

### Per-session prompt header (when batching)

```
SESSION P2-A — implement steps 2.1, then 2.2, then 2.3 in order.
Run validation after EACH step before continuing.
Do not start step 2.4.
@docs/final-blueprint.md @PROGRESS.md
[paste HARD RULES]
[paste step 2.1 prompt]
[after 2.1 PASS — paste step 2.2 prompt in same chat]
...
```

---

## Error boundary hierarchy (production)

```
app/layout.tsx
  └── GlobalErrorBoundary          ← root; reload / reset only
        └── RootProvider
              └── (app)/layout.tsx
                    ├── main {children}     ← never wrapped in AiErrorBoundary
                    └── AiErrorBoundary     ← ContextPanel only (Phase 2.9)
                          └── ContextPanel

(app)/chat/*, (app)/agents/* pages:
  └── AiErrorBoundary              ← full chat/agent column (Phase 5.4 / 6.4)

(app)/notes/[noteId]:
  └── TiptapErrorBoundary          ← editor only (Phase 3.4)
```

| Boundary | On error | Must NOT |
|----------|----------|----------|
| `GlobalErrorBoundary` | Full-page fallback + reload | Clear session |
| `AiErrorBoundary` | Inline "AI unavailable" + retry | Kill sidebar/shell |
| `TiptapErrorBoundary` | Inline editor error + retry | Kill note page shell |

---

## AGENT.md — Paste at the start of EVERY Cursor session

```
HARD RULES — read before writing any code:

1. NEVER install packages not listed in the prompt. If you think something is missing, stop and ask.
2. NEVER create files outside the paths explicitly named in the prompt.
3. NEVER use `any` type in TypeScript. All types must be explicit.
4. NEVER use `localStorage` for tokens. Access token → sessionStorage key `dashnotes_at`. Refresh token → Zustand memory only.
5. NEVER send workspace_id on /ai/* routes. Tenant comes from JWT only.
6. NEVER parse citations from SSE token stream. Citations come from the metadata event only.
7. NEVER use a Zustand store for server data that TanStack Query already owns.
8. ALL React components must be named exports, except page.tsx files (default export allowed).
9. ALL async functions must have explicit return types.
10. ALL error states, loading states, and empty states are REQUIRED — not optional.
11. If a file already exists, edit it — never recreate it.
12. After writing each file, state: "Written: <filepath>" so progress is trackable.
13. apiClient 401 handling MUST use isRetry circuit breaker — second 401 NEVER calls refresh (see Step 1.6).
14. apiClient MUST import handleUnauthorized from lib/auth/token-refresh.ts — never inline clearSession on first 401.
15. Do NOT wrap (app)/layout main content in GlobalErrorBoundary — it lives only in app/layout.tsx.
16. Follow docs/backend-frontend-contract.md for auth refresh and indexing_status fields.
```

---

## Phase 0 — Foundation and Visual Identity

---

### Step 0.1 — Install core dependencies

```
You are setting up the foundation for a Next.js 16 App Router project called DashNotes.

TASK: Install the following packages exactly as listed. Nothing else.

Run:
pnpm add @tanstack/react-query zustand jose sonner next-themes react-error-boundary
pnpm add -D @tanstack/react-query-devtools

After installing, verify:
1. All packages appear in package.json under the correct dependencies/devDependencies
2. No peer dependency warnings that indicate version mismatches
3. pnpm-lock.yaml is updated

Do not create any files. Do not modify any existing files. Installation only.

Report back: list each installed package with its resolved version number.
```

**Validation — run before 0.2:**
```bash
node -e "const p = require('./package.json'); ['@tanstack/react-query','zustand','jose','sonner','next-themes','react-error-boundary'].forEach(d => { if(!p.dependencies[d]) throw new Error('Missing: ' + d) }); console.log('0.1 PASS')"
```

---

### Step 0.2 — shadcn init + base component set

```
TASK: Initialise shadcn/ui for this Next.js 16 App Router project, then install the base component set.

Step 1 — Run shadcn init:
pnpm dlx shadcn@latest init

When prompted, choose:
- TypeScript: Yes
- Style: Default
- Base color: Slate
- CSS variables: Yes
- Dark mode: class strategy (IMPORTANT — not media)
- components.json location: root
- Import alias: @/components
- Include example styles: No

Step 2 — Install base components:
pnpm dlx shadcn@latest add button input label badge tooltip separator skeleton scroll-area avatar dropdown-menu sheet dialog alert-dialog tabs

Step 3 — Verify these files now exist:
- components.json (shadcn config)
- components/ui/button.tsx
- components/ui/input.tsx
- components/ui/badge.tsx
- components/ui/dialog.tsx
- lib/utils.ts (cn helper)

Do NOT modify any installed shadcn component files.
Do NOT create any other files.
```

**Validation:**
```bash
node -e "const fs=require('fs'); ['components/ui/button.tsx','components/ui/input.tsx','components/ui/badge.tsx','lib/utils.ts','components.json'].forEach(f=>{if(!fs.existsSync(f)) throw new Error('Missing: '+f)}); console.log('0.2 PASS')"
```

---

### Step 0.3 — Theme system (dark-first via next-themes)

```
TASK: Implement the dark-first theme system using next-themes. No custom Zustand theme store — next-themes handles persistence and SSR flash prevention.

FILE 1: providers/ThemeProvider.tsx
- Import ThemeProvider from 'next-themes'
- Named export: ThemeProvider (re-export wrapper)
- Props: { children: React.ReactNode }
- Config: attribute="class", defaultTheme="dark", enableSystem={false}
- Wrap children in next-themes ThemeProvider

FILE 2: components/shell/ThemeToggle.tsx
- Named export: ThemeToggle
- Uses useTheme() from next-themes
- Renders a shadcn Button variant="ghost" size="icon"
- Shows Sun icon when theme is dark (clicking switches to light)
- Shows Moon icon when theme is light (clicking switches to dark)
- Use lucide-react icons: Sun, Moon
- Must have aria-label="Toggle theme"

FILE 3: app/layout.tsx (EDIT existing file)
- Add suppressHydrationWarning to <html> element
- lang="en" on html element
- Do NOT wrap in ThemeProvider yet — that happens in Step 0.4 when RootProvider is built
- Import and apply globals.css

FILE 4: app/globals.css (EDIT existing file)
- Keep existing Tailwind directives
- Add CSS variables for both :root (light) and .dark (dark):
  Light: --background: 0 0% 100%; --foreground: 222.2 47.4% 11.2%;
  Dark: --background: 222.2 84% 4.9%; --foreground: 210 40% 98%;
  Both: --border, --input, --ring, --primary, --primary-foreground, --muted, --muted-foreground, --accent, --accent-foreground, --destructive, --destructive-foreground, --card, --card-foreground, --popover, --popover-foreground
  Use shadcn default slate values for all variables

RULES:
- No Zustand for theme state
- No localStorage reads in any component (next-themes handles this)
- ThemeToggle must work without hydration errors
```

**Validation:**
```bash
node -e "const fs=require('fs'); ['providers/ThemeProvider.tsx','components/shell/ThemeToggle.tsx'].forEach(f=>{if(!fs.existsSync(f)) throw new Error('Missing: '+f)}); const toggle=fs.readFileSync('components/shell/ThemeToggle.tsx','utf8'); if(!toggle.includes('aria-label')) throw new Error('Missing aria-label on ThemeToggle'); if(!toggle.includes('useTheme')) throw new Error('ThemeToggle must use useTheme'); console.log('0.3 PASS')"
```

---

### Step 0.4 — Global providers

```
TASK: Build the global provider tree and wire it into the app layout.

FILE 1: providers/QueryProvider.tsx
- Named export: QueryProvider
- Props: { children: React.ReactNode }
- Creates QueryClient with useState (not module-level — important for Next.js SSR)
- Config: defaultOptions.queries = { staleTime: 60_000, retry: 1, refetchOnWindowFocus: false }
- In development only (process.env.NODE_ENV === 'development'): render <ReactQueryDevtools initialIsOpen={false} /> from @tanstack/react-query-devtools
- "use client" directive at top

FILE 2: providers/RootProvider.tsx
- Named export: RootProvider
- Props: { children: React.ReactNode }
- Composition order (outer to inner): ThemeProvider → QueryProvider → children
- "use client" directive at top
- Import ThemeProvider from ./ThemeProvider
- Import QueryProvider from ./QueryProvider

FILE 3: app/layout.tsx (EDIT)
- Import RootProvider from @/providers/RootProvider
- Import { Toaster } from 'sonner'
- Wrap the body content: <RootProvider>{children}<Toaster /></RootProvider>
- Keep suppressHydrationWarning on <html>
- Keep lang="en" on <html>
- Body must NOT have suppressHydrationWarning (only html needs it)

RULES:
- QueryClient must be created inside useState — never at module level in Next.js App Router
- Toaster lives here once and never again in any other layout
- No other providers added here until their phase requires them
```

**Validation:**
```bash
node -e "const fs=require('fs'); const root=fs.readFileSync('providers/RootProvider.tsx','utf8'); if(!root.includes('ThemeProvider')) throw new Error('RootProvider missing ThemeProvider'); if(!root.includes('QueryProvider')) throw new Error('RootProvider missing QueryProvider'); const layout=fs.readFileSync('app/layout.tsx','utf8'); if(!layout.includes('RootProvider')) throw new Error('layout.tsx missing RootProvider'); if(!layout.includes('suppressHydrationWarning')) throw new Error('layout.tsx missing suppressHydrationWarning'); if(!layout.includes('Toaster')) throw new Error('layout.tsx missing Toaster'); console.log('0.4 PASS')"
```

---

### Step 0.5 — Route group scaffolding

```
TASK: Create the full route tree with placeholder page files. No UI content — each page.tsx returns a minimal placeholder only.

Create the following directory structure and files:

AUTH GROUP (app/(auth)/):
- app/(auth)/login/page.tsx → export default function LoginPage() { return <div>Login</div> }
- app/(auth)/register/page.tsx → export default function RegisterPage() { return <div>Register</div> }

APP GROUP (app/(app)/):
- app/(app)/layout.tsx → export default function AppLayout({ children }: { children: React.ReactNode }) { return <div>{children}</div> }
- app/(app)/notes/page.tsx
- app/(app)/notes/[noteId]/page.tsx
- app/(app)/notebooks/[notebookId]/page.tsx
- app/(app)/files/page.tsx
- app/(app)/files/[fileId]/page.tsx
- app/(app)/chat/page.tsx
- app/(app)/chat/[threadId]/page.tsx
- app/(app)/agents/page.tsx
- app/(app)/agents/[agentSlug]/page.tsx
- app/(app)/agents/[agentSlug]/[threadId]/page.tsx
- app/(app)/search/page.tsx
- app/(app)/settings/account/page.tsx
- app/(app)/settings/workspace/page.tsx
- app/(app)/settings/automation/page.tsx

Each app/(app)/* page.tsx must:
- Be a default export function
- Function name matches the route (e.g. NotesPage, FilesPage)
- Return <div>{route name}</div> as placeholder
- No imports needed yet

RULES:
- Do NOT add any logic to these files
- Do NOT create components yet
- Directory creation is implicit — create the file and the directory is created
- app/(app)/layout.tsx is NOT a placeholder — it is a real layout wrapper that will be filled in Phase 2
```

**Validation:**
```bash
node -e "const fs=require('fs'); const routes=['app/(app)/notes/page.tsx','app/(app)/files/page.tsx','app/(app)/chat/page.tsx','app/(app)/agents/page.tsx','app/(app)/settings/account/page.tsx','app/(auth)/login/page.tsx','app/(auth)/register/page.tsx','app/(app)/layout.tsx']; routes.forEach(r=>{if(!fs.existsSync(r)) throw new Error('Missing: '+r)}); console.log('0.5 PASS')"
```

---

### Step 0.6 — Global error boundaries

```
TASK: Build two error boundary components. These wrap specific areas of the app to prevent white screens.

FILE 1: components/errors/GlobalErrorBoundary.tsx
- Named export: GlobalErrorBoundary
- Props: { children: React.ReactNode }
- Uses ErrorBoundary from react-error-boundary
- FallbackComponent: a component named GlobalErrorFallback
- GlobalErrorFallback receives { error: Error, resetErrorBoundary: () => void }
- Renders:
  - A full-screen centered layout (min-h-screen flex items-center justify-center)
  - Dark background compatible (bg-background text-foreground)
  - Heading: "Something went wrong"
  - Paragraph: error.message (truncated to 200 chars max)
  - Button: "Reload page" → calls window.location.reload()
  - Button: "Try again" → calls resetErrorBoundary()
  - Uses shadcn Button component
- "use client" directive

FILE 2: components/errors/AiErrorBoundary.tsx
- Named export: AiErrorBoundary
- Props: { children: React.ReactNode; onReset?: () => void }
- Uses ErrorBoundary from react-error-boundary
- Lighter fallback — inline, not full screen
- FallbackComponent: AiErrorFallback
- Renders:
  - A bordered box (border border-destructive/50 rounded-md p-4)
  - Text: "AI features unavailable"
  - Subtext: "Notes and files are unaffected."
  - Button: "Try again" → calls resetErrorBoundary() and optional onReset prop
  - No page reload — user continues using the app
- "use client" directive

FILE 3: app/layout.tsx (EDIT)
- Wrap RootProvider with GlobalErrorBoundary
- Order: GlobalErrorBoundary (outermost) → html → body → RootProvider → children

RULES:
- AiErrorBoundary must NOT trigger navigation or session clearing
- GlobalErrorBoundary reload uses window.location.reload(), not Next.js router
- Both components are "use client" — error boundaries cannot be server components
```

**Validation:**
```bash
node -e "const fs=require('fs'); ['components/errors/GlobalErrorBoundary.tsx','components/errors/AiErrorBoundary.tsx'].forEach(f=>{if(!fs.existsSync(f)) throw new Error('Missing: '+f)}); const g=fs.readFileSync('components/errors/GlobalErrorBoundary.tsx','utf8'); if(!g.includes('use client')) throw new Error('GlobalErrorBoundary missing use client'); if(!g.includes('resetErrorBoundary')) throw new Error('GlobalErrorBoundary missing reset handler'); const layout=fs.readFileSync('app/layout.tsx','utf8'); if(!layout.includes('GlobalErrorBoundary')) throw new Error('layout.tsx not wrapped in GlobalErrorBoundary'); console.log('0.6 PASS')"
```

---

### Phase 0 — Final validation

```bash
# Build check — must pass with zero errors
pnpm build 2>&1 | tail -20
# Expected: "Route (app)" table with all routes listed, no TypeScript errors
```

---

## Phase 1 — Auth + API Foundation

---

### Step 1.1 — Install form dependencies

```
TASK: Install form and validation dependencies for Phase 1.

Run:
pnpm add react-hook-form @hookform/resolvers zod

After installing verify all three appear in package.json dependencies.

Do not create any files. Installation only.
Report resolved versions for all three packages.
```

**Validation:**
```bash
node -e "const p=require('./package.json'); ['react-hook-form','@hookform/resolvers','zod'].forEach(d=>{if(!p.dependencies[d]) throw new Error('Missing: '+d)}); console.log('1.1 PASS')"
```

---

### Step 1.2 — SSE parser (no API client yet)

```
TASK: Build the SSE parser only. The API client is built in Step 1.6 AFTER auth store and token-refresh exist.

FILE: lib/api/sse-parser.ts
- Named export: parseSseStream
- Signature: async function* parseSseStream(body: ReadableStream<Uint8Array>): AsyncGenerator<SseEvent>
- Type export: export type SseEvent = { event: string; data: string }
- Logic:
  → Create TextDecoder
  → Read chunks from body.getReader() in a while loop
  → Accumulate into string buffer
  → Split on double newline (\n\n) to get SSE message blocks
  → For each block: parse lines starting with 'event:' and 'data:'
  → Default event name to 'message' if no event: line
  → Yield { event, data } for each complete block that has data
  → On done: break
- Zero React coupling — no imports from React, no hooks
- Zero coupling to apiClient or auth

RULES:
- Do NOT create lib/api/client.ts in this step
- SSE parser is a pure async generator — no side effects
```

**Validation:**
```bash
node -e "const fs=require('fs'); if(fs.existsSync('lib/api/client.ts')) throw new Error('VIOLATION: client.ts must not exist until Step 1.6'); const sse=fs.readFileSync('lib/api/sse-parser.ts','utf8'); if(!sse.includes('AsyncGenerator')) throw new Error('sse-parser must be AsyncGenerator'); if(sse.includes('import React')) throw new Error('sse-parser must not import React'); console.log('1.2 PASS')"
```

---

### Step 1.3 — Auth store

```
TASK: Build the Zustand auth store with refresh token rotation support.

FILE: lib/stores/auth-store.ts
- "use client" NOT added — plain module
- Import create from zustand
- Import decodeJwt from jose

Types (export all):
export type UserRole = 'owner' | 'admin' | 'member'
export type TokenPair = { accessToken: string; refreshToken: string }
export type JwtClaims = { sub: string; wid: string; role: UserRole; exp: number }

export type AuthState = {
  accessToken: string | null
  refreshToken: string | null
  userId: string | null
  workspaceId: string | null
  role: UserRole | null
  isAuthenticated: boolean
  setSession: (tokens: TokenPair, claims: JwtClaims) => void
  updateTokens: (tokens: TokenPair) => void
  clearSession: () => void
}

Store implementation:
- Create with zustand create<AuthState>()
- setSession: sets all fields from tokens + claims; sets isAuthenticated: true; persists accessToken to sessionStorage (key: 'dashnotes_at'); stores refreshToken in Zustand memory ONLY (never sessionStorage, never localStorage)
- updateTokens: updates accessToken and refreshToken only; re-persists accessToken to sessionStorage
- clearSession: sets all fields to null/false; removes 'dashnotes_at' from sessionStorage; also removes presence cookie 'dashnotes_authed' via document.cookie = 'dashnotes_authed=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'

Hydration on init:
- In the create callback, before returning state, attempt to read sessionStorage.getItem('dashnotes_at')
- If found and valid JWT (try decodeJwt, catch silently): set accessToken and decode claims into store
- refreshToken cannot be recovered from sessionStorage — set to null (user will re-authenticate if refresh is needed after hard reload)
- This must be guarded with typeof window !== 'undefined' check

RULES:
- refreshToken NEVER goes to any storage — memory only
- accessToken to sessionStorage only (key: dashnotes_at)
- clearSession must remove the presence cookie (not just Zustand state)
- Hydration guard must be present for SSR safety
- isAuthenticated is derived from accessToken !== null
```

**Validation:**
```bash
node -e "const fs=require('fs'); const store=fs.readFileSync('lib/stores/auth-store.ts','utf8'); if(!store.includes('sessionStorage')) throw new Error('Missing sessionStorage for accessToken'); if(store.includes('localStorage')) throw new Error('VIOLATION: localStorage must not be used'); if(!store.includes('refreshToken')) throw new Error('Missing refreshToken in store'); if(!store.includes('clearSession')) throw new Error('Missing clearSession'); if(!store.includes('typeof window')) throw new Error('Missing SSR hydration guard'); console.log('1.3 PASS')"
```

---

### Step 1.4 — Token utilities

```
TASK: Build token management utilities. These are pure functions — no React, no store imports.

FILE: lib/auth/token.ts
- No "use client" — plain TypeScript module
- Import decodeJwt from jose
- Import type TokenPair from @/lib/stores/auth-store
- All functions are named exports

FUNCTION 1: getTokenExpiry(token: string): number
- Decodes JWT with decodeJwt
- Returns claims.exp as number
- Returns 0 if decode fails (try/catch)

FUNCTION 2: isTokenExpiredOrExpiringSoon(token: string, bufferSeconds = 60): boolean
- Calls getTokenExpiry
- Returns true if exp - Math.floor(Date.now() / 1000) < bufferSeconds
- Returns true if exp is 0 (decode failed = treat as expired)

FUNCTION 3: refreshAccessToken(refreshToken: string): Promise<TokenPair>
- POST to process.env.NEXT_PUBLIC_API_URL + '/auth/refresh'
- Body: { refresh_token: refreshToken }
- Headers: Content-Type: application/json
- On 200: return { accessToken: data.access_token, refreshToken: data.refresh_token }
- On 401: throw new Error('REFRESH_EXPIRED') — caller handles logout
- On 429: throw new Error('REFRESH_RATE_LIMITED')
- On other error: throw new Error('REFRESH_FAILED')
- Uses native fetch — NOT apiClient (avoids circular dependency)

RULES:
- No React imports
- No store imports (token.ts must not import auth-store — prevents circular deps)
- refreshAccessToken uses fetch directly, never apiClient
- All throws use specific error message strings (callers pattern-match on these)
```

**Validation:**
```bash
node -e "const fs=require('fs'); const t=fs.readFileSync('lib/auth/token.ts','utf8'); if(!t.includes('isTokenExpiredOrExpiringSoon')) throw new Error('Missing isTokenExpiredOrExpiringSoon'); if(!t.includes('refreshAccessToken')) throw new Error('Missing refreshAccessToken'); if(t.includes('apiClient')) throw new Error('VIOLATION: token.ts must not import apiClient'); if(t.includes('auth-store')) throw new Error('VIOLATION: token.ts must not import auth-store'); if(!t.includes('REFRESH_EXPIRED')) throw new Error('Missing REFRESH_EXPIRED error string'); console.log('1.4 PASS')"
```

---

### Step 1.5 — Token refresh coordinator

```
TASK: Build the refresh coordinator — the single place refresh logic lives. Prevents concurrent refresh storms.

FILE: lib/auth/token-refresh.ts
- No "use client"
- Import isTokenExpiredOrExpiringSoon, refreshAccessToken from ./token
- Import useAuthStore from @/lib/stores/auth-store

Module-level state (not exported):
- let refreshPromise: Promise<boolean> | null = null
  (this is the mutex — if refresh is already in flight, return the same promise)

FUNCTION 1: refreshIfNeeded(): Promise<boolean>
- If no token in store: return false
- If token NOT expiring soon: return true (no refresh needed)
- If refreshPromise is not null: return refreshPromise (dedup in-flight)
- Otherwise:
  → Set refreshPromise = inner async function that:
    1. Gets refreshToken from store
    2. If no refreshToken: clearSession() + redirect + return false
    3. Calls refreshAccessToken(refreshToken)
    4. On success: calls store.updateTokens(newTokenPair), sets refreshPromise = null, returns true
    5. On error 'REFRESH_EXPIRED': calls store.clearSession(), redirects to /auth/login?reason=session_expired, sets refreshPromise = null, returns false
    6. On other error: sets refreshPromise = null, returns false (let caller retry)
  → return refreshPromise

FUNCTION 2: handleUnauthorized(): Promise<boolean>
- Called by apiClient on 401 response
- Checks if refresh token exists in store
- If yes: attempt refresh once via refreshIfNeeded()
- If refresh succeeds: return true (caller should retry the original request)
- If refresh fails or no refresh token: clearSession() + redirect, return false
- This function does NOT retry the original request — it only refreshes; apiClient retries

EXPORT both functions as named exports.

RULES:
- refreshPromise mutex is critical — without it, 5 simultaneous 401s trigger 5 refresh calls
- refreshIfNeeded is called PROACTIVELY before streams (token might expire mid-stream)
- handleUnauthorized is called REACTIVELY by apiClient on 401 (first attempt only — see Step 1.6 isRetry)
- Both functions redirect on unrecoverable failure — never just return false silently
```

**Validation:**
```bash
node -e "const fs=require('fs'); const rc=fs.readFileSync('lib/auth/token-refresh.ts','utf8'); if(!rc.includes('refreshPromise')) throw new Error('Missing mutex variable'); if(!rc.includes('refreshIfNeeded')) throw new Error('Missing refreshIfNeeded'); if(!rc.includes('handleUnauthorized')) throw new Error('Missing handleUnauthorized'); if(!rc.includes('REFRESH_EXPIRED')) throw new Error('Missing REFRESH_EXPIRED handling'); console.log('1.5 PASS')"
```

---

### Step 1.6 — API client (401 circuit breaker)

```
TASK: Build lib/api/client.ts. Depends on Step 1.3 (auth store), 1.5 (token-refresh), 1.2 (sse-parser exists separately).

FILE: lib/api/client.ts
- No "use client" directive — plain TypeScript module
- Named export: apiClient with get, post, patch, delete, stream

Import handleUnauthorized from @/lib/auth/token-refresh
Import useAuthStore via getState() for accessToken

Internal type (not exported):
type RequestOptions = {
  method: string
  body?: unknown
  signal?: AbortSignal
  isRetry?: boolean        // CRITICAL — circuit breaker
  skipAuthRefresh?: boolean // true for /auth/login, /auth/register, /auth/refresh
}

Core function: request<T>(path: string, options: RequestOptions): Promise<T>
1. If skipAuthRefresh or no token needed: fetch without Bearer
2. Else: attach Authorization: Bearer {accessToken from getState()}
3. On response:
   - if ok: parse JSON return T
   - if status === 401:
       a. if options.isRetry === true:
          → clearSession() + redirect /auth/login?reason=unauthorized
          → throw ApiError 401 — DO NOT call handleUnauthorized again (circuit breaker)
       b. if options.skipAuthRefresh: throw 401
       c. else: ok = await handleUnauthorized()
          → if !ok: throw 401
          → return request<T>(path, { ...options, isRetry: true })
   - if 429: throw with retryAfter from Retry-After header
   - if 503 and path starts with /ai/: throw AiUnavailableError
   - else: throw ApiError with status + message

apiClient.get/post/patch/delete delegate to request() with isRetry: false

apiClient.stream(path, body, signal): Promise<Response>
- Uses same 401 circuit breaker via internal requestRaw or duplicate isRetry logic on fetch
- On 401 first attempt: handleUnauthorized → retry fetch once with isRetry: true
- On second 401: clearSession + throw — never refresh again
- On success: return raw Response (body not consumed)
- 429 / 503: same as JSON methods

Type exports:
export type ApiError = { status: number; message: string; retryAfter?: number }
export class AiUnavailableError extends Error { status = 503 }

RULES:
- isRetry defaults to false on every public apiClient call
- Exactly ONE replay per original request
- handleUnauthorized is NEVER called when isRetry is true
- apiClient must NOT import React
- auth.ts login/register/refresh use fetch with skipAuthRefresh: true OR separate raw fetch — never trigger refresh loop on login 401
```

**Validation:**
```bash
node -e "const fs=require('fs'); const c=fs.readFileSync('lib/api/client.ts','utf8'); if(!c.includes('isRetry')) throw new Error('CRITICAL: Missing isRetry circuit breaker'); if(!c.includes('handleUnauthorized')) throw new Error('Must import handleUnauthorized from token-refresh'); if(c.includes('clearSession') && !c.includes('isRetry')) throw new Error('clearSession without isRetry guard'); if(!c.includes('AiUnavailableError')) throw new Error('Missing AiUnavailableError'); if(!c.includes('stream')) throw new Error('Missing stream method'); if(c.includes('use client')) throw new Error('client.ts must not have use client'); const i=c.indexOf('isRetry'); const h=c.indexOf('handleUnauthorized'); if(c.indexOf('isRetry', i+1) < 0 && !c.includes('isRetry === true') && !c.includes('isRetry===true')) throw new Error('isRetry must be checked on 401 branch'); console.log('1.6 PASS')"
```

---

### Step 1.7 — Stream guard hook

```
TASK: Build the stream guard hook. This is the only file that calls refreshIfNeeded.

FILE: lib/hooks/use-stream-guard.ts
- "use client" directive at top
- Import refreshIfNeeded from @/lib/auth/token-refresh

Named export: useStreamGuard
- Returns: { guardStream: () => Promise<boolean> }
- guardStream():
  → Calls await refreshIfNeeded()
  → If returns false: return false (redirect already triggered by coordinator)
  → If returns true: return true (safe to start stream)
- No state, no side effects beyond calling refreshIfNeeded

RULES:
- This hook does nothing except call refreshIfNeeded and return the result
- Do not duplicate refresh logic here — it lives in token-refresh.ts
- Both use-chat-stream and use-agent-stream call guardStream() before opening any SSE connection
```

**Validation:**
```bash
node -e "const fs=require('fs'); const sg=fs.readFileSync('lib/hooks/use-stream-guard.ts','utf8'); if(!sg.includes('use client')) throw new Error('Missing use client'); if(!sg.includes('refreshIfNeeded')) throw new Error('Must call refreshIfNeeded'); if(!sg.includes('guardStream')) throw new Error('Missing guardStream export'); console.log('1.7 PASS')"
```

---

### Step 1.8 — API module scaffold + OpenAPI types

```
TASK: Create typed API module stubs and set up OpenAPI type generation.

STEP 1 — Install openapi-typescript:
pnpm add -D openapi-typescript

STEP 2 — Add script to package.json:
In the "scripts" section add:
"api:types": "openapi-typescript http://127.0.0.1/openapi.json -o lib/api/schema.d.ts"

STEP 3 — Create API module stubs.
Each file exports typed async functions wrapping apiClient.
Use 'unknown' as return type placeholder where OpenAPI schema not yet generated.

FILE: lib/api/auth.ts
export async function login(email: string, password: string): Promise<{ access_token: string; refresh_token: string }>
export async function register(email: string, password: string, workspaceName?: string): Promise<{ access_token: string; refresh_token: string }>
export async function refresh(refreshToken: string): Promise<{ access_token: string; refresh_token: string }>
(login and register use fetch directly with full URL — not apiClient — since no Bearer token available yet)
(refresh delegates to token.ts refreshAccessToken)

FILE: lib/api/notes.ts
export async function getNotes(params?: Record<string, string>): Promise<unknown>
export async function getNote(id: string): Promise<unknown>
export async function createNote(data: { title: string; content: string; is_private: boolean; notebook_id?: string }): Promise<unknown>
export async function updateNote(id: string, data: Partial<{ title: string; content: string; is_private: boolean }>): Promise<unknown>
export async function deleteNote(id: string): Promise<void>

FILE: lib/api/files.ts
export async function getFiles(params?: Record<string, string>): Promise<unknown>
export async function getFile(id: string): Promise<unknown>
export async function deleteFile(id: string): Promise<void>
(uploadFile is not here — it uses XHR for progress tracking, built in Phase 4)

FILE: lib/api/notebooks.ts
export async function getNotebooks(): Promise<unknown>
export async function getNotebook(id: string): Promise<unknown>

FILE: lib/api/workspaces.ts
export async function getWorkspaces(): Promise<unknown>
export async function updateWorkspace(data: { name: string }): Promise<unknown>
export async function getMembers(): Promise<unknown>
export async function inviteMember(data: { email: string; role: string }): Promise<unknown>
export async function updateMemberRole(userId: string, role: string): Promise<unknown>
export async function removeMember(userId: string): Promise<void>

FILE: lib/api/ai/threads.ts
export async function getThreads(): Promise<unknown>
export async function getThreadMessages(threadId: string): Promise<unknown>
export async function deleteThread(threadId: string): Promise<void>

FILE: lib/api/ai/search.ts
export async function testSearch(q: string, limit = 5): Promise<unknown>

FILE: lib/api/ai/chat.ts — stub only:
// Chat uses SSE — see lib/hooks/ai/use-chat-stream.ts
export const CHAT_STREAM_PATH = '/ai/chat/stream'

FILE: lib/api/ai/agent.ts — stub only:
// Agent uses SSE — see lib/hooks/ai/use-agent-stream.ts
export const AGENT_STREAM_PATH = '/ai/agent/stream'

RULES:
- All stub functions call apiClient.get/post/patch/delete with the correct path
- Return types use 'unknown' now — replaced with generated types when pnpm api:types runs
- auth.ts login/register use fetch directly (not apiClient) — they don't have a token yet
- Do not implement the function bodies beyond the apiClient call
```

**Validation:**
```bash
node -e "const fs=require('fs'); ['lib/api/auth.ts','lib/api/notes.ts','lib/api/files.ts','lib/api/notebooks.ts','lib/api/workspaces.ts','lib/api/ai/threads.ts','lib/api/ai/search.ts','lib/api/ai/chat.ts','lib/api/ai/agent.ts'].forEach(f=>{if(!fs.existsSync(f)) throw new Error('Missing: '+f)}); const p=require('./package.json'); if(!p.devDependencies['openapi-typescript']) throw new Error('Missing openapi-typescript'); if(!p.scripts['api:types']) throw new Error('Missing api:types script'); console.log('1.8 PASS')"
```

---

### Step 1.9 — Next.js middleware (route protection)

```
TASK: Build Next.js middleware for route protection using a presence cookie.

FILE: middleware.ts (at project root, same level as package.json)
- Import NextResponse from 'next/server'
- Import NextRequest from 'next/server'

Logic:
- Match all routes under /app/* (the protected group)
- Actually in Next.js App Router, route groups don't appear in URLs
- Protect all paths EXCEPT: /, /auth/login, /auth/register, /_next/*, /favicon.ico, /api/*
- Read cookie: request.cookies.get('dashnotes_authed')?.value
- If cookie absent AND route is protected: redirect to /auth/login?reason=unauthenticated
- If cookie present OR route is not protected: NextResponse.next()

Export:
export function middleware(request: NextRequest): NextResponse
export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico|auth).*)'] }

RULES:
- Middleware NEVER reads JWT tokens — only the presence cookie
- Real security is Bearer token on every API call — middleware is UX only
- The presence cookie value is '1' — no token data, just existence flag
- Redirects use NextResponse.redirect(new URL('/auth/login', request.url))
```

**Validation:**
```bash
node -e "const fs=require('fs'); if(!fs.existsSync('middleware.ts')) throw new Error('Missing middleware.ts'); const m=fs.readFileSync('middleware.ts','utf8'); if(!m.includes('dashnotes_authed')) throw new Error('Missing presence cookie check'); if(!m.includes('config')) throw new Error('Missing matcher config'); if(m.includes('access_token') || m.includes('Bearer')) throw new Error('VIOLATION: middleware must not read JWT tokens'); console.log('1.9 PASS')"
```

---

### Step 1.10 — shadcn form components + Login page

```
TASK: Install shadcn form components and build the login page.

STEP 1 — Install shadcn components:
pnpm dlx shadcn@latest add form card

STEP 2 — Build login form component:

FILE: components/auth/LoginForm.tsx
- "use client" directive
- Named export: LoginForm
- Uses react-hook-form with zodResolver
- Zod schema:
  const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
  })
- Form fields: email (type="email"), password (type="password")
- Submit button: "Sign in" — disabled and shows "Signing in…" while submitting
- On submit:
  1. Call login(email, password) from lib/api/auth.ts
  2. Decode JWT claims from access_token using decodeJwt from jose
  3. Call setSession({ accessToken, refreshToken }, claims) from auth store
  4. Set presence cookie: document.cookie = 'dashnotes_authed=1; path=/'
  5. Router push to /notes
- Error handling:
  → 429: show inline message with retryAfter countdown "Too many requests. Try again in {n}s" — use setInterval for countdown
  → 401/invalid: show "Invalid email or password" below form
  → Network error: show "Connection failed. Check your connection."
  → All errors: inline below the form, NOT as toasts (user is not in app shell yet)
- Shows "No account? Register" link to /auth/register

FILE: app/(auth)/login/page.tsx (REPLACE placeholder)
- Default export: LoginPage
- Renders centered layout: min-h-screen flex items-center justify-center bg-background
- Shows app name "DashNotes" as h1 above the form
- Renders <LoginForm />
- No auth check here — middleware handles redirect if already logged in

RULES:
- Form errors are inline, never toasts — Toaster is not available on auth pages
- setSession is called BEFORE the cookie is set (store is source of truth)
- router.push happens AFTER both setSession and cookie are set
- countdown timer must use setInterval and clear on component unmount
```

**Validation:**
```bash
node -e "const fs=require('fs'); ['components/auth/LoginForm.tsx','app/(auth)/login/page.tsx'].forEach(f=>{if(!fs.existsSync(f)) throw new Error('Missing: '+f)}); const form=fs.readFileSync('components/auth/LoginForm.tsx','utf8'); if(!form.includes('use client')) throw new Error('Missing use client'); if(!form.includes('zodResolver')) throw new Error('Missing zodResolver'); if(!form.includes('retryAfter')) throw new Error('Missing 429 handling'); if(!form.includes('dashnotes_authed')) throw new Error('Missing presence cookie set'); if(!form.includes('setSession')) throw new Error('Missing setSession call'); console.log('1.10 PASS')"
```

---

### Step 1.11 — Register page

```
TASK: Build the register page following the same patterns as the login page.

FILE: components/auth/RegisterForm.tsx
- "use client" directive
- Named export: RegisterForm
- Zod schema:
  const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
    confirmPassword: z.string(),
    workspaceName: z.string().min(2).optional(),
  }).refine(data => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
- Fields: email, password, confirmPassword, workspaceName (optional, placeholder "Your company or team name")
- Submit: "Create account" → disabled + "Creating…" while loading
- On success: same flow as login (setSession + cookie + redirect)
- Errors: same inline pattern as login

FILE: app/(auth)/register/page.tsx (REPLACE placeholder)
- Mirror login page layout
- "Already have an account? Sign in" link

RULES:
- Same error handling pattern as LoginForm — no toasts
- workspaceName is optional — don't require it
```

**Validation:**
```bash
node -e "const fs=require('fs'); ['components/auth/RegisterForm.tsx','app/(auth)/register/page.tsx'].forEach(f=>{if(!fs.existsSync(f)) throw new Error('Missing: '+f)}); const form=fs.readFileSync('components/auth/RegisterForm.tsx','utf8'); if(!form.includes('confirmPassword')) throw new Error('Missing confirmPassword field'); if(!form.includes('refine')) throw new Error('Missing password match validation'); console.log('1.11 PASS')"
```

---

### Phase 1 — Final validation

```bash
pnpm build 2>&1 | tail -30
# Must pass with zero TypeScript errors
# Auth routes must appear in build output

# Circuit breaker smoke check (grep — must exist):
node -e "const c=require('fs').readFileSync('lib/api/client.ts','utf8'); if(!/isRetry/.test(c)) process.exit(1); console.log('isRetry circuit breaker: OK')"
```
```

---

## Phase 2 — App Shell

---

### Step 2.1 — Shell dependencies

```
TASK: Install shell UI dependencies.

Run:
pnpm dlx shadcn@latest add sidebar

Verify sidebar component files are created under components/ui/.
Do not create any other files.
```

**Validation:**
```bash
node -e "const fs=require('fs'); if(!fs.existsSync('components/ui/sidebar.tsx')) throw new Error('Missing sidebar component'); console.log('2.1 PASS')"
```

---

### Step 2.2 — Shell store

```
TASK: Build the shell UI state store.

FILE: lib/stores/shell-store.ts
- No "use client" — plain Zustand module
- Import create from zustand

Types (export all):
export type ContextPanelContent = 'citations' | 'tool-trace' | 'file-meta' | 'note-outline' | null

export type ShellState = {
  sidebarOpen: boolean
  contextPanelOpen: boolean
  contextPanelContent: ContextPanelContent
  paletteOpen: boolean
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  openContextPanel: (content: ContextPanelContent) => void
  closeContextPanel: () => void
  setPaletteOpen: (open: boolean) => void
}

Defaults: sidebarOpen: true, contextPanelOpen: false, contextPanelContent: null, paletteOpen: false

RULES:
- No server data in this store — only UI state
- sidebarOpen default is true (desktop) — mobile will override via CSS
```

**Validation:**
```bash
node -e "const fs=require('fs'); const s=fs.readFileSync('lib/stores/shell-store.ts','utf8'); if(!s.includes('contextPanelContent')) throw new Error('Missing contextPanelContent'); if(!s.includes('paletteOpen')) throw new Error('Missing paletteOpen'); if(!s.includes('ContextPanelContent')) throw new Error('Missing ContextPanelContent type export'); console.log('2.2 PASS')"
```

---

### Step 2.3 — Query keys

```
TASK: Build the central query key factory file. This is the single source of truth for all TanStack Query cache keys.

FILE: lib/query-keys.ts
- Plain TypeScript module — no "use client"
- Named export: queryKeys object

ALL keys must include workspaceId from the wid JWT claim:

export const queryKeys = {
  notes: (wid: string) => ['notes', wid] as const,
  note: (wid: string, id: string) => ['notes', wid, id] as const,
  notebooks: (wid: string) => ['notebooks', wid] as const,
  notebook: (wid: string, id: string) => ['notebooks', wid, id] as const,
  files: (wid: string) => ['files', wid] as const,
  file: (wid: string, id: string) => ['files', wid, id] as const,
  threads: (wid: string) => ['ai', 'threads', wid] as const,
  threadMessages: (wid: string, tid: string) => ['ai', 'threads', wid, tid, 'messages'] as const,
  workspaces: () => ['workspaces'] as const,
  members: (wid: string) => ['members', wid] as const,
  aiHealth: () => ['ai', 'health'] as const,
  automationCount: (wid: string) => ['automation', 'pending-count', wid] as const,
  automationItems: (wid: string) => ['automation', 'items', wid] as const,
}

RULES:
- Every key that is workspace-scoped MUST include wid as first or second param
- workspaces() and aiHealth() are the only keys without wid (they are global)
- These keys are imported everywhere — never define inline query keys in components
```

**Validation:**
```bash
node -e "const fs=require('fs'); const qk=fs.readFileSync('lib/query-keys.ts','utf8'); ['notes','files','threads','members','automationCount','aiHealth'].forEach(k=>{if(!qk.includes(k+':')) throw new Error('Missing queryKey: '+k)}); console.log('2.3 PASS')"
```

---

### Step 2.4 — Workspace display (label only — no switcher)

```
TASK: Build workspace display components. Switching is deferred — show read-only label only.

FILE: lib/hooks/use-current-workspace.ts
- "use client" directive
- Named export: useCurrentWorkspace
- Uses useAuthStore to get workspaceId
- Uses useQuery(queryKeys.workspaces()) to fetch workspace list
- Returns: { name: string | null, id: string | null, isLoading: boolean }
- Finds the workspace matching workspaceId from the list
- Falls back to 'Workspace' if not found

FILE: components/shell/WorkspaceLabel.tsx
- "use client" directive
- Named export: WorkspaceLabel
- Calls useCurrentWorkspace()
- Renders: a non-interactive div showing workspace name
- While loading: Skeleton component (w-24 h-4)
- Styling: text-sm font-medium text-foreground px-2 py-1

FILE: lib/workspaces/workspace-context.ts
- Plain TypeScript module
- Export type WorkspaceSwitchHandler = (workspaceId: string) => Promise<void>
- Export const noopWorkspaceSwitchHandler: WorkspaceSwitchHandler = async () => { /* deferred */ }
- Comment: "Replace with real implementation when POST /auth/switch-workspace is available"

RULES:
- WorkspaceLabel is NOT a button/dropdown — it is display only
- Do NOT build WorkspaceSwitcher yet
- noopWorkspaceSwitchHandler is the extension point — never remove it
```

**Validation:**
```bash
node -e "const fs=require('fs'); ['lib/hooks/use-current-workspace.ts','components/shell/WorkspaceLabel.tsx','lib/workspaces/workspace-context.ts'].forEach(f=>{if(!fs.existsSync(f)) throw new Error('Missing: '+f)}); const wl=fs.readFileSync('components/shell/WorkspaceLabel.tsx','utf8'); if(wl.includes('<button') || wl.includes('onClick')) throw new Error('VIOLATION: WorkspaceLabel must not be interactive'); console.log('2.4 PASS')"
```

---

### Step 2.5 — AI health indicator

```
TASK: Build AI health monitoring components.

FILE: lib/hooks/use-ai-health.ts
- "use client" directive
- Named export: useAiHealth
- Fetches GET /health/ai using apiClient.get
- Uses queryKeys.aiHealth()
- refetchInterval: 60_000 (every 60s)
- retry: false
- On 404: treat as { status: 'unavailable' } — do not throw
- Returns: { status: 'ok' | 'degraded' | 'unavailable' | null, isLoading: boolean }

FILE: components/shell/AiStatusIndicator.tsx
- "use client" directive
- Named export: AiStatusIndicator
- Calls useAiHealth()
- Renders a dot: green (ok), amber (degraded), red (unavailable), grey (loading/null)
- Uses Tooltip from shadcn: tooltip message explains state
  → ok: "AI features are operational"
  → degraded: "AI features are degraded — some requests may be slow"
  → unavailable: "AI features are unavailable — notes and files still work"
- Dot: w-2 h-2 rounded-full inline-block
- aria-label matching tooltip message

FILE: components/shell/AiDegradationBanner.tsx
- "use client" directive
- Named export: AiDegradationBanner
- Calls useAiHealth()
- Renders ONLY when status === 'unavailable'
- Full-width banner above main content
- Message: "AI features are temporarily unavailable. Notes and files work normally."
- Retry button: calls queryClient.invalidateQueries(queryKeys.aiHealth()) to re-poll
- Dismiss button: hides banner for current session (local useState isDismissed)
- Styling: bg-destructive/10 border-b border-destructive/20 text-sm px-4 py-2

RULES:
- 404 from /health/ai is NOT an error — AI health indicator is optional
- Banner dismissal is session-only (useState) — re-appears on next page load if still unavailable
```

**Validation:**
```bash
node -e "const fs=require('fs'); ['lib/hooks/use-ai-health.ts','components/shell/AiStatusIndicator.tsx','components/shell/AiDegradationBanner.tsx'].forEach(f=>{if(!fs.existsSync(f)) throw new Error('Missing: '+f)}); const h=fs.readFileSync('lib/hooks/use-ai-health.ts','utf8'); if(!h.includes('60_000')) throw new Error('Missing 60s poll interval'); if(!h.includes('404')) throw new Error('Missing 404 graceful handling'); console.log('2.5 PASS')"
```

---

### Step 2.6 — Automation abstraction layer

```
TASK: Build the automation abstraction with port/stub pattern. No backend connection yet — zero-cost stub is default.

FILE: lib/automation/config.ts
export const automationConfig = {
  enabled: process.env.NEXT_PUBLIC_AUTOMATION_ENABLED === 'true',
  notificationsUrl: '/ai/notifications/stream',
  pendingCountUrl: '/automation/pending/count',
  pendingItemsUrl: '/automation/pending',
}

FILE: lib/automation/types.ts
export type AutomationPendingEvent = { id: string; type: string; confidence: number }
export type AutomationItem = { id: string; type: string; confidence: number; isDestructive: boolean; description: string }
export type AutomationCountResponse = { pending: number }

FILE: lib/automation/notification-port.ts
export interface NotificationPort {
  subscribe(onEvent: (event: AutomationPendingEvent) => void, onError: (err: Error) => void): void
  disconnect(): void
}

FILE: lib/automation/notification-stub.ts
- Implements NotificationPort
- subscribe: does nothing (no-op)
- disconnect: does nothing
export const stubNotificationPort: NotificationPort = { subscribe: () => {}, disconnect: () => {} }

FILE: lib/automation/notification-sse.ts
- Implements NotificationPort
- subscribe: opens EventSource to automationConfig.notificationsUrl
  → reads access token from auth store (Bearer in URL not possible with EventSource — use fetch-based SSE instead)
  → Actually: EventSource cannot send headers. Use fetch with stream for auth.
  → subscribe opens a fetch-based GET stream using apiClient (but GET with no body)
  → On 'automation_pending' event: call onEvent(JSON.parse(data))
  → On error: call onError; implement exponential backoff (1s, 2s, 4s, 8s, max 30s)
  → Store AbortController for cleanup
- disconnect: aborts the fetch stream

FILE: lib/automation/notification-factory.ts
- Named export: getNotificationPort(): NotificationPort
- If automationConfig.enabled: return new SseNotificationPort (from notification-sse.ts)
- Else: return stubNotificationPort

FILE: lib/hooks/use-automation-notifications.ts
- "use client" directive
- Named export: useAutomationNotifications
- Gets port from getNotificationPort()
- On mount: port.subscribe(onEvent, onError)
  → onEvent: call queryClient.invalidateQueries(queryKeys.automationCount(wid))
- On unmount: port.disconnect()
- Only runs when role === 'owner' || role === 'admin'
- Returns void

FILE: lib/hooks/use-automation-count.ts
- "use client" directive
- Named export: useAutomationCount
- useQuery(queryKeys.automationCount(wid), fetch automationConfig.pendingCountUrl)
- On 404: return { pending: 0 } (not an error)
- enabled: only when role is admin/owner AND automationConfig.enabled
- Returns: { pending: number }

RULES:
- Default is ALWAYS stub — automationConfig.enabled defaults to false
- notification-sse.ts is built but never instantiated unless env var is set
- useAutomationNotifications is zero-cost when stub is active
```

**Validation:**
```bash
node -e "const fs=require('fs'); ['lib/automation/config.ts','lib/automation/types.ts','lib/automation/notification-port.ts','lib/automation/notification-stub.ts','lib/automation/notification-sse.ts','lib/automation/notification-factory.ts','lib/hooks/use-automation-notifications.ts','lib/hooks/use-automation-count.ts'].forEach(f=>{if(!fs.existsSync(f)) throw new Error('Missing: '+f)}); const factory=fs.readFileSync('lib/automation/notification-factory.ts','utf8'); if(!factory.includes('enabled')) throw new Error('Factory missing enabled check'); console.log('2.6 PASS')"
```

---

### Step 2.7 — RoleGate + Toaster utilities

```
TASK: Build global utility components used throughout the app.

FILE: components/auth/RoleGate.tsx
- "use client" directive
- Named export: RoleGate
- Props: { roles: UserRole[]; children: React.ReactNode; fallback?: React.ReactNode }
- Reads role from useAuthStore
- If role is in roles array: render children
- Else: render fallback if provided, else null
- Import UserRole from @/lib/stores/auth-store

FILE: lib/toast.ts
- Plain module — not a React component
- Import { toast } from 'sonner'
- Named exports:
  toastSuccess(message: string): void → toast(message, { ... })
  toastError(message: string): void → toast.error(message)
  toastRateLimited(retryAfter: number): void
    → Shows countdown toast
    → Initial message: "Too many requests. Try again in {retryAfter}s"
    → Updates every second (use toast with id + update pattern from sonner docs)
    → Clears automatically when countdown reaches 0

RULES:
- RoleGate is purely presentational — UI-only gate, backend enforces permissions
- toastRateLimited must actually count down — not just show the number once
```

**Validation:**
```bash
node -e "const fs=require('fs'); ['components/auth/RoleGate.tsx','lib/toast.ts'].forEach(f=>{if(!fs.existsSync(f)) throw new Error('Missing: '+f)}); const rg=fs.readFileSync('components/auth/RoleGate.tsx','utf8'); if(!rg.includes('UserRole')) throw new Error('Missing UserRole type'); if(!rg.includes('fallback')) throw new Error('Missing fallback prop'); console.log('2.7 PASS')"
```

---

### Step 2.8 — Sidebar + navigation

```
TASK: Build the app sidebar with full navigation structure.

FILE: components/shell/Sidebar.tsx
- "use client" directive
- Named export: AppSidebar
- Uses usePathname() from next/navigation for active route detection
- Uses useAuthStore for role

Navigation structure (hard-coded — no config file needed):
Section 1 (main):
  - Notes → /notes (icon: FileText)
  - Notebooks → /notebooks (not a real route yet — links to /notes for now)
  - Files → /files (icon: FolderOpen)
Separator
Section 2 (AI):
  - Chat → /chat (icon: MessageSquare)
  - Agents → /agents (icon: Bot), collapsible
    → Workspace Assistant → /agents/workspace-assistant (LIVE badge)
    → Research Agent (greyed, opacity-50, cursor-not-allowed, no link)
    → Writer Agent (greyed)
Separator
Section 3 (admin):
  - Settings → /settings/account (icon: Settings)
    → AutomationBadgeSlot here (see below)

Bottom:
  - [+ New ▾] dropdown: New note, Upload file, New chat, Ask agent

AutomationBadgeSlot (inline in Settings nav item):
  - Renders <AutomationBadge /> component
  - FILE: components/shell/AutomationBadge.tsx
    → Named export: AutomationBadge
    → Calls useAutomationCount()
    → Wrapped in <RoleGate roles={['owner', 'admin']}>
    → Renders shadcn Badge variant="destructive" with count
    → Renders null when pending === 0

Active state: current path matching → bg-accent text-accent-foreground on nav item
Mobile: sidebar collapses — handled by shadcn Sidebar component internals

RULES:
- Greyed-out future agents have no onClick and no href — they are display only
- AutomationBadge is role-gated inside the component — RoleGate wraps it
- [+ New ▾] actions are navigation only in Phase 2 — actual creation happens in later phases
```

**Validation:**
```bash
node -e "const fs=require('fs'); ['components/shell/Sidebar.tsx','components/shell/AutomationBadge.tsx'].forEach(f=>{if(!fs.existsSync(f)) throw new Error('Missing: '+f)}); const s=fs.readFileSync('components/shell/Sidebar.tsx','utf8'); if(!s.includes('usePathname')) throw new Error('Missing usePathname for active state'); if(!s.includes('opacity-50')) throw new Error('Missing greyed-out future agents'); console.log('2.8 PASS')"
```

---

### Step 2.9 — App shell layout

```
TASK: Build the authenticated app shell layout. This is the wrapper for all (app)/* routes.

FILE: app/(app)/layout.tsx (REPLACE placeholder)
- "use client" directive
- Default export: AppLayout
- Props: { children: React.ReactNode }
- Calls useAutomationNotifications() — establishes notification port (stub by default)
- Calls useAiHealth() — starts health polling

Layout structure (three column desktop, responsive):
┌─────────────────────────────────────────────────────┐
│ AiDegradationBanner (full width, conditional)       │
├────────────┬─────────────────────┬──────────────────┤
│ AppSidebar │ main content        │ ContextPanel     │
│ (240px)    │ (flex-1)            │ (280px, cond.)   │
└────────────┴─────────────────────┴──────────────────┘

Header (inside main content area, sticky):
- Left: menu toggle button (mobile only)
- Center/right: Search button "Search workspace… ⌘K" → setPaletteOpen(true)
- Right: AiStatusIndicator, ThemeToggle, UserMenu

UserMenu component (build inline or separate file):
FILE: components/shell/UserMenu.tsx
- Named export: UserMenu
- shadcn DropdownMenu with Avatar trigger
- Items: "Account" → /settings/account, "Workspace" → /settings/workspace, separator, "Sign out"
- Sign out: calls clearSession() + router.push('/auth/login')

ContextPanel:
FILE: components/shell/ContextPanel.tsx
- Named export: ContextPanel
- Reads contextPanelOpen and contextPanelContent from shell store
- Renders nothing when contextPanelOpen is false
- Renders different content based on contextPanelContent:
  → 'citations': placeholder <div>Citations panel</div>  (filled in Phase 5)
  → 'tool-trace': placeholder <div>Tool trace panel</div> (filled in Phase 6)
  → 'file-meta': placeholder <div>File meta panel</div>   (filled in Phase 4)
  → 'note-outline': placeholder <div>Note outline</div>   (filled in Phase 3)
- Width: 280px, border-l, bg-card

Wrap layout children in:
- AiErrorBoundary wraps ONLY the ContextPanel — not main content, not sidebar

RULES:
- GlobalErrorBoundary lives ONLY in app/layout.tsx (Step 0.6) — do NOT add another here
- AiErrorBoundary wraps ONLY the ContextPanel — not the sidebar or main content
- Header search button calls setPaletteOpen(true) — CommandPalette is built in Phase 7
- useAutomationNotifications must be called here — only one instance for the session
```

**Validation:**
```bash
node -e "const fs=require('fs'); const layout=fs.readFileSync('app/(app)/layout.tsx','utf8'); if(layout.includes('GlobalErrorBoundary')) throw new Error('VIOLATION: GlobalErrorBoundary must only be in app/layout.tsx'); if(!layout.includes('AiDegradationBanner')) throw new Error('Missing AiDegradationBanner'); if(!layout.includes('useAutomationNotifications')) throw new Error('Missing notification hook'); if(!layout.includes('ContextPanel')) throw new Error('Missing ContextPanel'); if(!layout.includes('AiErrorBoundary')) throw new Error('Missing AiErrorBoundary around ContextPanel'); console.log('2.9 PASS')"
```

---

### Step 2.10 — Mobile layout

```
TASK: Build the mobile bottom tab bar and context bottom sheet.

FILE: lib/hooks/use-media-query.ts
- "use client" directive
- Named export: useMediaQuery(query: string): boolean
- Uses useState + useEffect with window.matchMedia
- SSR safe: returns false on server (typeof window check)

FILE: components/shell/BottomTabBar.tsx
- "use client" directive
- Named export: BottomTabBar
- Only rendered below 768px (checked via useMediaQuery)
- 5 tabs: Notes (/notes), Files (/files), Chat (/chat), Agents (/agents), More
- "More" tab: opens a shadcn Sheet from bottom with: Settings, Account links
- Active tab: highlighted with accent color
- Fixed to bottom: fixed bottom-0 left-0 right-0 z-50 bg-background border-t

FILE: components/shell/ContextSheet.tsx
- "use client" directive
- Named export: ContextSheet
- shadcn Sheet with side="bottom"
- Reads contextPanelOpen and contextPanelContent from shell store
- Same content rendering as ContextPanel but in a sheet
- Only rendered on mobile (useMediaQuery)

Update app/(app)/layout.tsx:
- On mobile (<768px): hide sidebar (hidden md:block on sidebar wrapper), show BottomTabBar
- On mobile: ContextPanel hidden, ContextSheet shown instead
- Use CSS classes for this: md:flex for desktop three-column, block for mobile

RULES:
- useMediaQuery must be SSR-safe (returns false on server)
- BottomTabBar and ContextSheet are additional renders on mobile — ContextPanel still exists in DOM on desktop
```

**Validation:**
```bash
node -e "const fs=require('fs'); ['lib/hooks/use-media-query.ts','components/shell/BottomTabBar.tsx','components/shell/ContextSheet.tsx'].forEach(f=>{if(!fs.existsSync(f)) throw new Error('Missing: '+f)}); const mq=fs.readFileSync('lib/hooks/use-media-query.ts','utf8'); if(!mq.includes('typeof window')) throw new Error('Missing SSR safety guard in useMediaQuery'); console.log('2.10 PASS')"
```

---

### Phase 2 — Final validation

```bash
pnpm build 2>&1 | tail -30
# Must pass with zero errors
# Visit http://localhost:3000 after pnpm dev — shell must render with sidebar
# Theme toggle must switch between dark and light
# /auth/login must redirect to /notes if already logged in (middleware)
# /notes must redirect to /auth/login if not logged in (middleware)
```

---

## Phase 3 — Notes + Notebooks

---

### Step 3.1 — Install notes dependencies

```
TASK: Install Tiptap and markdown dependencies for Phase 3.

Run:
pnpm add @tiptap/react @tiptap/starter-kit @tiptap/extension-placeholder @tiptap/extension-character-count
pnpm add react-markdown remark-gfm
pnpm dlx shadcn@latest add select popover

Verify all packages appear in package.json.
Do not create any files. Installation only.
```

**Validation:**
```bash
node -e "const p=require('./package.json'); ['@tiptap/react','@tiptap/starter-kit','react-markdown','remark-gfm'].forEach(d=>{if(!p.dependencies[d]) throw new Error('Missing: '+d)}); console.log('3.1 PASS')"
```

---

### Step 3.2 — Indexing status utility

```
TASK: Build the indexing status display utility. This reads indexing_status from the API — never inferred from tags.

FILE: lib/utils/indexing-status.ts
- Plain TypeScript module

export type IndexingStatus = 'pending' | 'processing' | 'indexed' | 'failed'

export type BadgeConfig = {
  label: string
  variant: 'default' | 'secondary' | 'destructive' | 'outline'
  showSpinner: boolean
}

export function getIndexingDisplay(status: IndexingStatus | undefined | null): BadgeConfig
- 'pending': { label: '⏳ Pending', variant: 'secondary', showSpinner: false }
- 'processing': { label: '⏳ Indexing…', variant: 'secondary', showSpinner: true }
- 'indexed': { label: '✓ Indexed', variant: 'default', showSpinner: false }
- 'failed': { label: 'Index failed', variant: 'destructive', showSpinner: false }
- undefined/null: { label: '⏳ Pending', variant: 'secondary', showSpinner: false }

export function shouldPoll(status: IndexingStatus | undefined | null): boolean
- Returns true when status is 'pending' or 'processing'
- Returns false when 'indexed', 'failed', or unknown

RULES:
- Never infer indexing from tags being empty — only from indexing_status field
- This file has zero React imports — pure TypeScript
```

**Validation:**
```bash
node -e "const fs=require('fs'); const u=fs.readFileSync('lib/utils/indexing-status.ts','utf8'); if(!u.includes('shouldPoll')) throw new Error('Missing shouldPoll'); if(!u.includes('IndexingStatus')) throw new Error('Missing IndexingStatus type'); if(u.includes('import React')) throw new Error('VIOLATION: must have zero React imports'); console.log('3.2 PASS')"
```

---

### Step 3.3 — Notes API + hooks

```
TASK: Fill in the notes API module and build data hooks.

FILE: lib/api/notes.ts (EDIT — fill in stubs from 1.7)
- Fill all function bodies using apiClient
- getNotes: GET /notes (accepts optional params as URLSearchParams)
- getNote: GET /notes/{id}
- createNote: POST /notes/
- updateNote: PATCH /notes/{id}
- deleteNote: DELETE /notes/{id}

FILE: lib/hooks/notes/use-notes.ts
- "use client" directive
- Named export: useNotes
- Props: { notebookId?: string; tag?: string }
- useQuery(queryKeys.notes(wid), () => getNotes(params))
- Returns: { notes, isLoading, isError, isEmpty: notes.length === 0 }

FILE: lib/hooks/notes/use-note.ts
- "use client" directive
- Named export: useNote(id: string)
- useQuery(queryKeys.note(wid, id), () => getNote(id))
- refetchInterval: computed — if shouldPoll(note.indexing_status): 5000, else false
- POLLING TIMEOUT: track first poll time with useRef; after 3 minutes (180_000ms), set a local exceeded state, stop polling regardless
- Returns: { note, isLoading, isError, pollingExceeded: boolean }

FILE: lib/hooks/notes/use-note-mutations.ts
- "use client" directive
- Named export: useNoteMutations
- createNote mutation: on success → invalidate notes list + navigate to /notes/{id} + toastSuccess('Note created')
- updateNote mutation: on success → invalidate note + invalidate notes list (silent — no toast on auto-save)
- deleteNote mutation: on success → invalidate notes list + navigate to /notes + toastSuccess('Note deleted')

RULES:
- 3-minute polling timeout is enforced via useRef tracking start time
- updateNote mutation has NO toast — auto-save is silent (save indicator is separate)
- shouldPoll imported from lib/utils/indexing-status.ts
```

**Validation:**
```bash
node -e "const fs=require('fs'); ['lib/hooks/notes/use-notes.ts','lib/hooks/notes/use-note.ts','lib/hooks/notes/use-note-mutations.ts'].forEach(f=>{if(!fs.existsSync(f)) throw new Error('Missing: '+f)}); const un=fs.readFileSync('lib/hooks/notes/use-note.ts','utf8'); if(!un.includes('180_000') && !un.includes('3 * 60')) throw new Error('Missing 3-minute polling timeout'); if(!un.includes('shouldPoll')) throw new Error('Must use shouldPoll from indexing-status'); console.log('3.3 PASS')"
```

---

### Step 3.4 — Tiptap editor + TiptapErrorBoundary

```
TASK: Build TiptapErrorBoundary as a reusable component, then the editor. Code-split with next/dynamic.

FILE 1: components/errors/TiptapErrorBoundary.tsx
- Named export: TiptapErrorBoundary
- Props: { children: React.ReactNode }
- Uses ErrorBoundary from react-error-boundary
- Fallback: bordered box "Editor unavailable" + "Try again" button → resetErrorBoundary()
- Must NOT clear session or navigate away
- "use client" directive

FILE 2: components/notes/NoteEditor.tsx
- "use client" directive
- Named export: NoteEditor
- Props: { noteId: string; initialContent: string; initialTitle: string; isPrivate: boolean }
- Uses useEditor from @tiptap/react with extensions: StarterKit, Placeholder({ placeholder: 'Start writing…' }), CharacterCount
- Auto-save with debounce:
  → On editor content change: set debounce timer (1500ms)
  → On timer fire: call updateNote mutation
  → Clear timer on unmount
  → Track save state: 'idle' | 'saving' | 'saved' | 'error'
- Save indicator (below editor): "Saving…" | "Saved · {n}s ago" | "Failed to save — Retry"
  → "Retry" button calls updateNote immediately
- Title: <input> above editor, same 1500ms debounce auto-save
- Privacy toggle: shadcn Select with "Public" / "Private" options → calls updateNote({ is_private }) immediately on change (no debounce)
- Character count: shown in footer "n words · n characters"
- ⋯ menu (shadcn DropdownMenu): Delete (opens confirm AlertDialog), Copy link
- Wrap EditorContent with <TiptapErrorBoundary> (import from components/errors/TiptapErrorBoundary.tsx)

FILE: app/(app)/notes/[noteId]/page.tsx (REPLACE placeholder)
- Default export: NoteEditorPage
- Load note with useNote(noteId)
- Skeleton loading state: title skeleton + body skeleton (not a spinner)
- Error state: "Note not found" with back button if isError
- On load: call openContextPanel('note-outline') from shell store
- On unmount: call closeContextPanel()
- Use next/dynamic to import NoteEditor: const NoteEditor = dynamic(() => import('@/components/notes/NoteEditor'), { ssr: false })
- Render NoteEditor with note data as props

Context panel content for 'note-outline' (add to ContextPanel in shell):
Update components/shell/ContextPanel.tsx:
  → 'note-outline': render <NoteOutlinePanel noteId={noteId} /> 
  → FILE: components/notes/NoteOutlinePanel.tsx
    → Named export: NoteOutlinePanel
    → Props: { noteId: string }
    → Placeholder for now: renders note tags and an [Ask about this →] button (navigate to /chat with note context — actual prefill in Phase 5)
    → Shows indexing badge using getIndexingDisplay(note.indexing_status)

RULES:
- NoteEditor MUST be loaded with next/dynamic (ssr: false) — Tiptap is not SSR compatible
- TiptapErrorBoundary wraps EditorContent only — import from components/errors/TiptapErrorBoundary.tsx
- Auto-save debounce timer MUST be cleared on unmount to prevent memory leaks
- Privacy toggle change calls mutation immediately — no debounce
```

**Validation:**
```bash
node -e "const fs=require('fs'); ['components/errors/TiptapErrorBoundary.tsx','components/notes/NoteEditor.tsx'].forEach(f=>{if(!fs.existsSync(f)) throw new Error('Missing: '+f)}); const ne=fs.readFileSync('components/notes/NoteEditor.tsx','utf8'); if(!ne.includes('1500')) throw new Error('Missing 1500ms debounce'); if(!ne.includes('TiptapErrorBoundary')) throw new Error('Missing TiptapErrorBoundary'); const page=fs.readFileSync('app/(app)/notes/[noteId]/page.tsx','utf8'); if(!page.includes('next/dynamic')) throw new Error('NoteEditor must use next/dynamic'); console.log('3.4 PASS')"
```

---

### Step 3.5 — Notes list page + notebook view

```
TASK: Build the notes list page with all required states and notebook filtering.

COMPONENTS TO BUILD:

FILE: components/notes/NoteCard.tsx
- Named export: NoteCard
- Props: note object (type from API — use unknown cast until OpenAPI types regenerated)
- Renders: title, tags (as badges), "X ago" relative time, private badge (🔒), indexing badge
- getIndexingDisplay for badge
- On click: navigate to /notes/{id}
- Hover state: bg-accent/50

FILE: components/notes/NotesFilterBar.tsx
- Named export: NotesFilterBar
- Props: { onNotebookChange, onTagChange, onSortChange }
- Notebook filter: select from useQuery notebooks list
- Tag filter: text input with debounce
- Sort: dropdown (newest, oldest, title A-Z)

FILE: components/notes/NotesSidebar.tsx
- Named export: NotesSidebar
- Notebook list (from useNotebooks hook — build this hook)
- Tag cloud: collected from all notes
- "All notes" option at top

FILE: components/notes/NotesEmptyState.tsx
- Named export: NotesEmptyState
- Props: { hasFilters: boolean }
- With filters: "No notes match your filters" + "Clear filters" button
- Without filters: "Create your first note" + "New note" button

FILE: app/(app)/notes/page.tsx (REPLACE placeholder)
- Default export: NotesPage
- Three states: loading (NoteCard skeletons x5), empty (NotesEmptyState), list (NoteCard list)
- Error state: "Couldn't load notes" + retry button calling refetch()
- [+ New note] button: calls createNote mutation with defaults → navigates to editor
- Layout: NotesSidebar (left, collapsible) + filter bar (top) + notes list

FILE: app/(app)/notebooks/[notebookId]/page.tsx (REPLACE placeholder)
- Default export: NotebookPage
- Reuses NotesPage layout with notebookId pre-applied as filter
- Header: notebook name + note count
- No duplicate component code — pass notebookId prop to useNotes

RULES:
- All three states required: loading skeleton (not spinner), empty state, error state
- NoteCard skeleton: use shadcn Skeleton component matching card dimensions
- New note navigates to editor immediately — do not wait for user to fill form
```

**Validation:**
```bash
node -e "const fs=require('fs'); ['components/notes/NoteCard.tsx','components/notes/NotesEmptyState.tsx','app/(app)/notes/page.tsx'].forEach(f=>{if(!fs.existsSync(f)) throw new Error('Missing: '+f)}); const page=fs.readFileSync('app/(app)/notes/page.tsx','utf8'); if(!page.includes('Skeleton')) throw new Error('Missing skeleton loading state'); if(!page.includes('NotesEmptyState')) throw new Error('Missing empty state'); console.log('3.5 PASS')"
```

---

### Phase 3 — Final validation

```bash
pnpm build 2>&1 | tail -20
# Visit /notes — must show skeleton then list (or empty state)
# Create a note — must navigate to editor
# Edit title — must auto-save after 1500ms
# Privacy toggle — must update immediately
# Tiptap editor must render correctly (dark theme)
```

---

## Phase 4 — Files

---

### Step 4.1 — Install files dependencies

```
TASK:
pnpm add react-dropzone
pnpm dlx shadcn@latest add progress

Verify. No other files.
```

**Validation:**
```bash
node -e "const p=require('./package.json'); if(!p.dependencies['react-dropzone']) throw new Error('Missing react-dropzone'); console.log('4.1 PASS')"
```

---

### Step 4.2 — File upload hook (XHR for progress)

```
TASK: Build file upload hook using XMLHttpRequest for upload progress tracking.

FILE: lib/hooks/files/use-file-upload.ts
- "use client" directive
- Named export: useFileUpload
- Returns: { upload, isUploading, progress, error, reset }
- upload(file: File, isPrivate: boolean, description?: string): void
- Uses XMLHttpRequest (not fetch) — only way to track upload progress in browser
- xhr.upload.onprogress: updates progress state (0–100)
- xhr.onload: on 200/201 → invalidate queryKeys.files(wid) + toastSuccess('File uploaded') + call onSuccess callback
- xhr.onerror: set error state
- Sets Authorization: Bearer header from auth store (useAuthStore.getState().accessToken)
- URL: process.env.NEXT_PUBLIC_API_URL + '/files/upload'
- Sends as FormData: file, is_private, description

RULES:
- XMLHttpRequest is required — fetch cannot report upload progress
- Bearer token must be read from store at upload time (not on hook mount)
- invalidateQueries called ONLY on success (not optimistic)
```

**Validation:**
```bash
node -e "const fs=require('fs'); const u=fs.readFileSync('lib/hooks/files/use-file-upload.ts','utf8'); if(!u.includes('XMLHttpRequest')) throw new Error('Must use XMLHttpRequest for progress'); if(!u.includes('onprogress')) throw new Error('Missing progress handler'); console.log('4.2 PASS')"
```

---

### Step 4.3 — Files hooks + API

```
TASK: Fill in files API module and build data hooks.

Fill lib/api/files.ts:
- getFiles: GET /files
- getFile: GET /files/{id}
- deleteFile: DELETE /files/{id}

FILE: lib/hooks/files/use-files.ts
- Same pattern as use-notes.ts

FILE: lib/hooks/files/use-file.ts
- Same polling pattern as use-note.ts (shouldPoll on indexing_status, 3min timeout)
- Returns: { file, isLoading, isError, pollingExceeded }
```

**Validation:**
```bash
node -e "const fs=require('fs'); ['lib/hooks/files/use-files.ts','lib/hooks/files/use-file.ts'].forEach(f=>{if(!fs.existsSync(f)) throw new Error('Missing: '+f)}); const uf=fs.readFileSync('lib/hooks/files/use-file.ts','utf8'); if(!uf.includes('shouldPoll')) throw new Error('Must use shouldPoll'); console.log('4.3 PASS')"
```

---

### Step 4.4 — File type utilities + components

```
TASK: Build file display utilities and card components.

FILE: lib/utils/file-icons.ts
export function getFileIcon(mimeType: string): string → '📄' | '📊' | '📝' | '🖼' | '📦'
export function getFileTypeLabel(mimeType: string): string → 'PDF' | 'CSV' | 'Word' | 'Text' | 'Image' | 'File'

FILE: components/files/FileCard.tsx
- Named export: FileCard
- Props: file object
- Renders: icon, name, type label, size, indexing badge, private badge
- On click: navigate to /files/{id}

FILE: components/files/UploadDropzone.tsx
- Named export: UploadDropzone
- Uses react-dropzone
- Accepts: PDF, DOCX, CSV, TXT, MD, images
- Max size: 10MB (match backend limits)
- Calls useFileUpload hook
- States: idle (drop area), uploading (progress bar), success, error
- Full-page drag detection: also listen on document dragenter to show overlay

FILE: components/files/FileGrid.tsx + components/files/FileList.tsx
- Grid: 4-col responsive grid of FileCard
- List: table-like rows with columns: icon+name, type, status, size, actions

FILE: app/(app)/files/page.tsx (REPLACE placeholder)
All three states: skeleton, empty, list
Grid/list toggle stored in local state (not shell store — it's page-local)
```

**Validation:**
```bash
node -e "const fs=require('fs'); ['components/files/FileCard.tsx','components/files/UploadDropzone.tsx','app/(app)/files/page.tsx'].forEach(f=>{if(!fs.existsSync(f)) throw new Error('Missing: '+f)}); console.log('4.4 PASS')"
```

---

### Step 4.5 — File detail page

```
TASK: Build the file detail page with context panel integration.

FILE: components/files/FilePreview.tsx
- Named export: FilePreview
- Props: { file }
- PDF (application/pdf): <iframe> with download_url
- Text files: <pre> with extracted_text preview (first 2000 chars + "Show more")
- Images: <img> with download_url
- Others: generic icon + file name

Update components/shell/ContextPanel.tsx:
- 'file-meta' content: <FileMetaPanel fileId={fileId} />

FILE: components/files/FileMetaPanel.tsx
- Named export: FileMetaPanel
- Props: { fileId: string }
- Shows: indexing status badge, extracted ✓/✗, summary (when indexed), tags, [Ask about file →] button
- Uses useFile hook

FILE: app/(app)/files/[fileId]/page.tsx (REPLACE placeholder)
- Load with useFile
- Skeleton, error, loaded states
- On load: call openContextPanel('file-meta')
- On unmount: closeContextPanel()
- Download button: links to file.download_url (target="_blank")
- pollingExceeded → show "Still processing — check back later" in place of indexing badge
```

**Validation:**
```bash
node -e "const fs=require('fs'); ['components/files/FilePreview.tsx','components/files/FileMetaPanel.tsx','app/(app)/files/[fileId]/page.tsx'].forEach(f=>{if(!fs.existsSync(f)) throw new Error('Missing: '+f)}); const p=fs.readFileSync('app/(app)/files/[fileId]/page.tsx','utf8'); if(!p.includes('openContextPanel')) throw new Error('Missing openContextPanel call'); if(!p.includes('pollingExceeded')) throw new Error('Missing polling exceeded handling'); console.log('4.5 PASS')"
```

---

### Phase 4 — Final validation

```bash
pnpm build 2>&1 | tail -20
# Upload a file — progress bar must show
# File card must show indexing badge updating every 5s
# File detail must open context panel with meta
```

---

## Phase 5 — Chat (RAG)

---

### Step 5.1 — Threads hooks

```
TASK: Fill in AI threads API and build hooks.

Fill lib/api/ai/threads.ts with apiClient calls.

FILE: lib/hooks/ai/use-threads.ts
- useQuery(queryKeys.threads(wid), getThreads)

FILE: lib/hooks/ai/use-thread-messages.ts
- useQuery(queryKeys.threadMessages(wid, threadId), () => getThreadMessages(threadId))
- enabled: !!threadId
```

**Validation:**
```bash
node -e "const fs=require('fs'); ['lib/hooks/ai/use-threads.ts','lib/hooks/ai/use-thread-messages.ts'].forEach(f=>{if(!fs.existsSync(f)) throw new Error('Missing: '+f)}); console.log('5.1 PASS')"
```

---

### Step 5.2 — Chat stream hook

```
TASK: Build the chat SSE stream hook. This is the most important hook in Phase 5.

FILE: lib/hooks/ai/use-chat-stream.ts
- "use client" directive
- Named export: useChatStream(initialThreadId?: string)

Types:
type Citation = { source_id: string; title: string; score: number; excerpt: string; type: 'note' | 'file' }
type ChatMessage = { role: 'user' | 'assistant' | 'system'; content: string; id: string }

State:
- messages: ChatMessage[]
- citations: Citation[]
- threadId: string | null
- isStreaming: boolean
- error: string | null  ← null when ok; specific message when failed

Returns: { messages, citations, threadId, isStreaming, error, sendMessage, cancel }

sendMessage(message: string): Promise<void>
1. const safe = await guardStream() — if false, return (redirect already triggered)
2. abortRef.current?.abort(); abortRef.current = new AbortController()
3. Append user message to messages state
4. Append empty assistant message placeholder
5. Set isStreaming: true, error: null, citations: []
6. const res = await apiClient.stream(CHAT_STREAM_PATH, { message, thread_id: threadId ?? undefined }, abortRef.current.signal)
7. for await (const { event, data } of parseSseStream(res.body!)):
   - if data === '[DONE]': break
   - if event === 'token': append data to last assistant message content
   - if event === 'metadata': parse JSON → set citations, set threadId from meta.thread_id
8. After stream: set isStreaming: false
9. After threadId received: invalidate queryKeys.threads(wid)
10. catch (err): 
    - if AbortError or err.name === 'AbortError': silently stop (user cancelled)
    - if AiUnavailableError: set error = 'LLM temporarily unavailable; retry shortly'
    - if status 429: toastRateLimited(err.retryAfter)
    - else: set error = 'Something went wrong. Please try again.'
11. finally: isStreaming: false

cancel(): void → abortRef.current?.abort()

AbortController in useRef — NOT useState
Cleanup on unmount: cancel()

RULES:
- Citations ONLY from metadata event — never from token stream content
- error state shows inline in UI — NOT as toast (user is in chat view)
- AiUnavailableError message exactly matches backend: "LLM temporarily unavailable; retry shortly"
- guardStream() called first — any token refresh happens before stream opens
```

**Validation:**
```bash
node -e "const fs=require('fs'); const h=fs.readFileSync('lib/hooks/ai/use-chat-stream.ts','utf8'); if(!h.includes('guardStream')) throw new Error('Missing guardStream call'); if(!h.includes('metadata')) throw new Error('Missing metadata event handler'); if(h.includes('token') && h.includes('citation')) { const tokenIdx=h.indexOf(\"event === 'token'\"); const citIdx=h.indexOf('citations'); if(citIdx < tokenIdx + 50 && citIdx > tokenIdx - 50) throw new Error('VIOLATION: citations must only come from metadata event'); } if(!h.includes('AbortController')) throw new Error('Missing AbortController'); if(!h.includes('AiUnavailableError')) throw new Error('Missing AiUnavailableError handling'); console.log('5.2 PASS')"
```

---

### Step 5.3 — Chat UI components

```
TASK: Build all chat UI components.

FILE: components/chat/MessageList.tsx
- Named export: MessageList
- Props: { messages: ChatMessage[]; isStreaming: boolean }
- Scrollable list (ScrollArea from shadcn)
- Auto-scrolls to bottom when messages change (useEffect + ref on bottom div)
- Renders UserMessage, AssistantMessage, or SystemMessage based on role

FILE: components/chat/UserMessage.tsx
- Named export: UserMessage
- Right-aligned bubble, bg-primary text-primary-foreground, rounded-2xl rounded-tr-sm

FILE: components/chat/AssistantMessage.tsx
- Named export: AssistantMessage
- Props: { content: string; isStreaming?: boolean }
- Renders markdown using react-markdown with remark-gfm
- While streaming (isStreaming AND this is the last message): shows cursor ▌ after content
- Left-aligned, bg-muted, rounded-2xl rounded-tl-sm

FILE: components/chat/SystemMessage.tsx
- Named export: SystemMessage
- Props: { content: string }
- Centered, text-muted-foreground text-sm italic

FILE: components/chat/MessageInput.tsx
- Named export: MessageInput
- Props: { onSend: (message: string) => void; isStreaming: boolean; onCancel: () => void }
- Textarea with auto-resize (rows 1–4)
- Send button: disabled when isStreaming or empty message
- Cancel button: shown only when isStreaming
- Keyboard: Enter (without shift) = send; Shift+Enter = new line

FILE: components/chat/CitationPanel.tsx
- Named export: CitationPanel
- Props: { citations: Citation[] }
- Empty state while streaming: "Searching your workspace…" (subtle text)
- Empty state with no citations after done: "No sources found"
- List of citation cards: source icon (📝 or 📄), title, score badge, excerpt, [Open note]/[Open file] link
- Score badge: green if > 0.7, amber if > 0.4, grey otherwise

Update components/shell/ContextPanel.tsx:
- 'citations': render <CitationPanel citations={citations} />
- Citations come from the parent page via shell store — use a new shell store field:
  Add to shell-store.ts: citationData: Citation[] and setCitations: (c: Citation[]) => void

RULES:
- react-markdown renders assistant messages — NOT dangerouslySetInnerHTML
- AssistantMessage streaming cursor is only on the last message while isStreaming is true
- CitationPanel is shown in context panel — it is NOT inline in the message
```

**Validation:**
```bash
node -e "const fs=require('fs'); ['components/chat/MessageList.tsx','components/chat/CitationPanel.tsx','components/chat/MessageInput.tsx'].forEach(f=>{if(!fs.existsSync(f)) throw new Error('Missing: '+f)}); const am=fs.readFileSync('components/chat/AssistantMessage.tsx','utf8'); if(am.includes('dangerouslySetInnerHTML')) throw new Error('VIOLATION: must use react-markdown not dangerouslySetInnerHTML'); console.log('5.3 PASS')"
```

---

### Step 5.4 — Thread list + chat pages

```
TASK: Build the thread list sidebar and both chat pages.

FILE: components/chat/ThreadList.tsx
- Named export: ThreadList
- Uses useThreads hook
- Grouped: Today, Yesterday, Older
- Each thread: title (from first message or "New conversation"), timestamp
- Active: highlighted
- Delete button (🗑): shows only on hover, opens AlertDialog confirm → deleteThread mutation

FILE: app/(app)/chat/page.tsx (REPLACE placeholder)
- New conversation — no threadId
- Two-column layout: ThreadList (left, 240px) + chat area (right)
- Wrap chat area (MessageList + MessageInput) in <AiErrorBoundary>
- Chat area: empty state "Ask anything about your workspace" → MessageInput at bottom
- On first send: useChatStream(undefined) — threadId will come back from metadata event
- After threadId received: update URL to /chat/{threadId} (router.push, no full reload)

FILE: app/(app)/chat/[threadId]/page.tsx (REPLACE placeholder)
- Wrap entire chat column in <AiErrorBoundary>
- Loads thread messages with useThreadMessages(threadId)
- Maps messages to ChatMessage format
- Passes to useChatStream(threadId) as initial state
- On mount: openContextPanel('citations')
- On unmount: closeContextPanel()

RULES:
- After receiving threadId from stream, router.push to /chat/{threadId}
- Thread delete uses AlertDialog — no silent deletes
- Context panel opens on thread page load, not on new chat page (which has no citations yet)
```

**Validation:**
```bash
node -e "const fs=require('fs'); ['components/chat/ThreadList.tsx','app/(app)/chat/page.tsx','app/(app)/chat/[threadId]/page.tsx'].forEach(f=>{if(!fs.existsSync(f)) throw new Error('Missing: '+f)}); const cp=fs.readFileSync('app/(app)/chat/page.tsx','utf8'); const tp=fs.readFileSync('app/(app)/chat/[threadId]/page.tsx','utf8'); if(!cp.includes('AiErrorBoundary')) throw new Error('chat page missing AiErrorBoundary'); if(!tp.includes('AiErrorBoundary')) throw new Error('thread page missing AiErrorBoundary'); if(!tp.includes('openContextPanel')) throw new Error('Missing openContextPanel in thread page'); console.log('5.4 PASS')"
```

---

### Phase 5 — Final validation

```bash
pnpm build 2>&1 | tail -20
# Send a message — tokens must stream in real time
# Citations appear in right panel only after stream completes metadata event
# Thread persists in left panel after conversation
# Refresh token flow: manually expire token, send message — must silently refresh
```

---

## Phase 6 — Agents

---

### Step 6.1 — Agent stream hook

```
TASK: Build the agent stream hook. Similar to chat but handles tool events.

FILE: lib/hooks/ai/use-agent-stream.ts
- "use client" directive
- Named export: useAgentStream(initialThreadId?: string)

Additional types:
type ToolEvent = { name: string; params: Record<string, unknown>; status: 'running' | 'complete' | 'failed'; stepIndex: number }

Additional state vs chat:
- toolEvents: ToolEvent[]
- stepsTaken: number
- toolCallsMade: number

SSE events handled (in addition to token):
- 'tool_start': parse JSON → add { name, params, status: 'running', stepIndex } to toolEvents
- 'tool_end': parse JSON → update matching tool event to status: 'complete'
  → If tool name is 'create_note' or 'update_note': 
    → invalidate queryKeys.notes(wid)
    → toastSuccess(name === 'create_note' ? 'Note created by agent' : 'Note updated by agent')
- 'done': parse JSON → set stepsTaken and toolCallsMade
- 'tool_start' for failed tool: add with status: 'failed'

Everything else identical to use-chat-stream (guardStream, abort, error handling).

RULES:
- Tool mutations (create_note, update_note) MUST invalidate notes query + show toast
- guardStream() called before stream (same as chat)
- toolEvents array: new tool_start appends; tool_end finds by name+stepIndex and updates
```

**Validation:**
```bash
node -e "const fs=require('fs'); const h=fs.readFileSync('lib/hooks/ai/use-agent-stream.ts','utf8'); if(!h.includes('tool_start')) throw new Error('Missing tool_start handler'); if(!h.includes('tool_end')) throw new Error('Missing tool_end handler'); if(!h.includes('create_note') || !h.includes('update_note')) throw new Error('Missing note mutation invalidation'); if(!h.includes('guardStream')) throw new Error('Missing guardStream'); console.log('6.1 PASS')"
```

---

### Step 6.2 — Tool trace panel

```
TASK: Build the tool trace context panel.

FILE: components/agents/ToolTracePanel.tsx
- Named export: ToolTracePanel
- Props: { toolEvents: ToolEvent[]; stepsTaken: number; isStreaming: boolean }
- Header: "Step {stepsTaken} of {total}" — total from toolEvents.length
- While empty and streaming: "Waiting for agent…" subtle text
- Each tool row:
  → Step number
  → Tool name (human readable: search_notes → "Search notes", create_note → "Create note", etc.)
  → Key params truncated to 40 chars
  → Status icon: spinner (running), ✓ (complete), ✗ (failed)
- [Expand all] toggle: shows full params JSON in a <pre> block
- Empty state (not streaming, no events): "No tools used yet"

Update components/shell/ContextPanel.tsx:
- 'tool-trace': render <ToolTracePanel toolEvents={toolEvents} stepsTaken={stepsTaken} isStreaming={isStreaming} />
- toolEvents/stepsTaken come from shell store — add to shell-store.ts:
  toolTrace: { events: ToolEvent[]; stepsTaken: number } | null
  setToolTrace: (data: ...) => void
  clearToolTrace: () => void
```

**Validation:**
```bash
node -e "const fs=require('fs'); if(!fs.existsSync('components/agents/ToolTracePanel.tsx')) throw new Error('Missing ToolTracePanel'); const tp=fs.readFileSync('components/agents/ToolTracePanel.tsx','utf8'); if(!tp.includes('Expand all')) throw new Error('Missing expand all toggle'); console.log('6.2 PASS')"
```

---

### Step 6.3 — Agent hub page

```
TASK: Build the agent hub with live vs coming-soon cards.

FILE: components/agents/AgentCard.tsx
- Named export: AgentCard
- Props: { name: string; description: string; icon: React.ReactNode; status: 'live' | 'coming-soon'; href?: string }
- LIVE: normal card with [Open →] button navigating to href
- COMING SOON: opacity-50, cursor-not-allowed, [Notify me] button (no-op, shows toast "We'll let you know when this is ready")

FILE: app/(app)/agents/page.tsx (REPLACE placeholder)
- Grid of AgentCards:
  - Workspace Assistant: live, /agents/workspace-assistant
  - Research Agent: coming-soon
  - Writer Agent: coming-soon
  - File Ops Agent: coming-soon
  - Automation Agent: coming-soon
```

**Validation:**
```bash
node -e "const fs=require('fs'); ['components/agents/AgentCard.tsx','app/(app)/agents/page.tsx'].forEach(f=>{if(!fs.existsSync(f)) throw new Error('Missing: '+f)}); console.log('6.3 PASS')"
```

---

### Step 6.4 — Agent session pages

```
TASK: Build the agent session UI.

FILE: components/agents/AgentMessageList.tsx
- Same as MessageList but also renders tool events inline between messages
- When a tool_start event occurs: show a system-style message "Searching workspace…" / "Creating note…"

FILE: components/agents/AgentInput.tsx
- Props: { onSend, isStreaming, onCancel }
- Placeholder: "e.g. Summarise my Q4 planning docs into a new note…"
- [Run] button (not Send)
- Same Enter/Shift+Enter behaviour as MessageInput

FILE: components/agents/SessionList.tsx
- Same pattern as ThreadList but labeled "Sessions"

FILE: app/(app)/agents/[agentSlug]/page.tsx (REPLACE placeholder)
- If agentSlug is not 'workspace-assistant': redirect to /agents (unknown agent)
- Wrap session column (AgentMessageList + AgentInput) in <AiErrorBoundary>
- New session: empty message list, AgentInput at bottom

FILE: app/(app)/agents/[agentSlug]/[threadId]/page.tsx (REPLACE placeholder)
- Wrap session column in <AiErrorBoundary>
- On mount: openContextPanel('tool-trace'); clearToolTrace()
- On unmount: closeContextPanel()
- Loads thread messages (reuses useThreadMessages)
- Uses useAgentStream(threadId)
- On tool events: setToolTrace({ events, stepsTaken }) in shell store
```

**Validation:**
```bash
node -e "const fs=require('fs'); const sp=fs.readFileSync('app/(app)/agents/[agentSlug]/[threadId]/page.tsx','utf8'); if(!sp.includes('AiErrorBoundary')) throw new Error('Missing AiErrorBoundary on agent session'); if(!sp.includes('openContextPanel')) throw new Error('Missing openContextPanel'); if(!sp.includes('tool-trace')) throw new Error('Must open tool-trace panel'); if(!sp.includes('clearToolTrace')) throw new Error('Missing clearToolTrace on mount'); console.log('6.4 PASS')"
```

---

### Phase 6 — Final validation

```bash
pnpm build 2>&1 | tail -20
# Visit /agents — live card navigates, coming-soon cards show notify-me toast
# Run a workspace assistant task — tool trace updates in right panel in real time
# After create_note tool: notes list refreshes + toast appears
```

---

## Phase 7 — Command Palette

---

### Step 7.1 — Install palette dependencies

```
TASK:
pnpm add cmdk
pnpm dlx shadcn@latest add command
```

**Validation:**
```bash
node -e "const p=require('./package.json'); if(!p.dependencies['cmdk']) throw new Error('Missing cmdk'); console.log('7.1 PASS')"
```

---

### Step 7.2 — Search API + palette hook

```
TASK: Fill search API and build command palette hook.

Fill lib/api/ai/search.ts:
- testSearch: GET /ai/test-search?q={q}&limit={limit}
- On 503: return [] (graceful — palette still works without AI)

FILE: lib/hooks/use-command-palette.ts
- "use client" directive
- Named export: useCommandPalette
- Global shortcut: useEffect listening for (metaKey || ctrlKey) && key === 'k' → setPaletteOpen(true)
- Local fuzzy search: filter notes and files from TanStack Query cache (getQueryData) by query string
  → Match on title substring — no external fuzzy library needed
- AI search: debounced 300ms → call testSearch(query) → append to results
- Returns: { localResults, aiResults, isAiSearching }

RULES:
- Event listener added on mount, removed on unmount (cleanup in useEffect return)
- Cache-based local search does NOT trigger API calls
- AI search returns [] on 503 — palette works without AI
```

**Validation:**
```bash
node -e "const fs=require('fs'); const h=fs.readFileSync('lib/hooks/use-command-palette.ts','utf8'); if(!h.includes('metaKey')) throw new Error('Missing keyboard shortcut'); if(!h.includes('300')) throw new Error('Missing 300ms debounce for AI search'); console.log('7.2 PASS')"
```

---

### Step 7.3 — Command palette component

```
TASK: Build the command palette component. Code-split with next/dynamic.

FILE: components/shell/CommandPalette.tsx
- "use client" directive
- Named export: CommandPalette
- Uses shadcn Command + CommandDialog
- Reads paletteOpen from shell store; onOpenChange → setPaletteOpen
- Sections:
  → RECENT: last 5 from local results (track with useRef/localStorage — 5 recently visited)
  → ACTIONS: New note, Upload file, New chat, Ask agent — navigation actions
  → AI SEARCH: aiResults list with "Open in Chat" action (navigates to /chat with query)
  → LOCAL SEARCH: localResults list

- AI results: show loading skeleton while isAiSearching
- Enter on note/file result: navigate to /notes/{id} or /files/{id}
- Enter on AI result: navigate to /chat and pre-fill input with query (use URL param: /chat?q={query})

Update app/(app)/layout.tsx:
- Load CommandPalette with next/dynamic (ssr: false, load on first open)
- Render once in layout

RULES:
- next/dynamic with ssr: false — cmdk is heavy, defer loading
- CommandPalette rendered ONCE in layout, controlled by shell store
```

**Validation:**
```bash
node -e "const fs=require('fs'); if(!fs.existsSync('components/shell/CommandPalette.tsx')) throw new Error('Missing CommandPalette'); const layout=fs.readFileSync('app/(app)/layout.tsx','utf8'); if(!layout.includes('CommandPalette')) throw new Error('CommandPalette not in layout'); const cp=fs.readFileSync('components/shell/CommandPalette.tsx','utf8'); if(!cp.includes('paletteOpen')) throw new Error('Must read paletteOpen from shell store'); console.log('7.3 PASS')"
```

---

### Phase 7 — Final validation

```bash
pnpm build 2>&1 | tail -10
# Press ⌘K — palette must open
# Type a note title — local results appear instantly
# AI results appear after ~300ms debounce
# Escape closes palette
```

---

## Phase 8 — Settings

---

### Step 8.1 — Install settings dependencies

```
TASK:
pnpm add @tanstack/react-table
pnpm dlx shadcn@latest add table select

Verify. No other files.
```

**Validation:**
```bash
node -e "const p=require('./package.json'); if(!p.dependencies['@tanstack/react-table']) throw new Error('Missing @tanstack/react-table'); console.log('8.1 PASS')"
```

---

### Step 8.2 — Account settings page

```
TASK:

FILE: app/(app)/settings/account/page.tsx (REPLACE placeholder)
- Profile section: email (read-only input)
- Sign out button: clearSession() + router.push('/auth/login') + remove presence cookie

RULES:
- Sign out clears both Zustand store and presence cookie
- Email is read-only — backend does not support email change
```

**Validation:**
```bash
node -e "const fs=require('fs'); const p=fs.readFileSync('app/(app)/settings/account/page.tsx','utf8'); if(!p.includes('clearSession')) throw new Error('Missing clearSession on sign out'); console.log('8.2 PASS')"
```

---

### Step 8.3 — Workspace settings + members

```
TASK:

Fill lib/api/workspaces.ts fully.

FILE: lib/hooks/use-members.ts
- useQuery(queryKeys.members(wid), getMembers)

FILE: components/settings/MembersTable.tsx
- Named export: MembersTable
- TanStack Table with columns: Name, Email, Role, Actions
- Role column: owner row is static; admin/member rows show Select (role change) — PATCH /workspaces/members/{id}
- Actions: Remove button → AlertDialog confirm → removeMember mutation
- Owner cannot be removed (hide Remove button for owner rows)

FILE: components/settings/InviteMemberDialog.tsx
- Named export: InviteMemberDialog
- shadcn Dialog
- RHF form: email + role select
- On submit: inviteMember mutation → toastSuccess + close dialog + invalidate members

FILE: app/(app)/settings/workspace/page.tsx (REPLACE placeholder)
- Wrapped in <RoleGate roles={['owner', 'admin']} fallback={<div>Not authorised</div>}>
- Workspace name form (PATCH /workspaces)
- MembersTable
- InviteMemberDialog triggered by [Invite member] button
```

**Validation:**
```bash
node -e "const fs=require('fs'); const p=fs.readFileSync('app/(app)/settings/workspace/page.tsx','utf8'); if(!p.includes('RoleGate')) throw new Error('Missing RoleGate on workspace settings'); console.log('8.3 PASS')"
```

---

### Step 8.4 — Automation inbox page

```
TASK:

FILE: components/settings/AutomationQueue.tsx
- Named export: AutomationQueue
- If !automationConfig.enabled: render "Automation governance inbox coming soon." empty state with description
- If enabled: fetch pending items from automationConfig.pendingItemsUrl
  → List each item: description, confidence badge, destructive indicator
  → Approve/Reject buttons → POST to approve/reject endpoints → invalidate count + items

FILE: app/(app)/settings/automation/page.tsx (REPLACE placeholder)
- RoleGate: owner/admin only
- Renders AutomationQueue
- Header: "Automation queue" with pending count badge from useAutomationCount
```

**Validation:**
```bash
node -e "const fs=require('fs'); const p=fs.readFileSync('app/(app)/settings/automation/page.tsx','utf8'); if(!p.includes('RoleGate')) throw new Error('Missing RoleGate'); console.log('8.4 PASS')"
```

---

### Phase 8 — Final validation

```bash
pnpm build 2>&1 | tail -10
# Sign out clears session and redirects
# Workspace settings hidden from members (RoleGate)
# Members table renders with role selects
```

---

## Phase 9 — Production Hardening

---

### Step 9.1 — Loading states audit

```
Audit every page route. For each page in app/(app)/:
- Confirm skeleton loading state exists (not spinner)
- Confirm empty state exists with a meaningful action
- Confirm error state exists with a retry affordance

TASK: For any page missing any of these three states, add them now.
Check every page: notes, files, chat, agents, settings/workspace.
Report which pages needed changes.
```

---

### Step 9.2 — Polling timeout audit

```
Audit all refetchInterval usages:
- lib/hooks/notes/use-note.ts
- lib/hooks/files/use-file.ts

Confirm each has:
1. 3-minute (180_000ms) timeout via useRef tracking start time
2. pollingExceeded state returned
3. Post-timeout: show "Still processing — check back later" + manual retry button in UI

For the retry button:
- It calls queryClient.invalidateQueries for the specific item
- It resets the poll timeout timer
- It sets pollingExceeded back to false
```

---

### Step 9.3 — Offline detection

```
TASK:

FILE: lib/hooks/use-online-status.ts
- "use client" directive
- Named export: useOnlineStatus(): boolean
- useState(true), useEffect adds 'online'/'offline' event listeners on window
- Returns current online state

FILE: components/shell/OfflineBanner.tsx
- Named export: OfflineBanner
- Calls useOnlineStatus()
- When offline: renders full-width banner "No internet connection — changes may not save"
- When back online: refetch active queries once via queryClient.refetchQueries({ type: 'active' })
- Banner auto-hides when online

Update app/(app)/layout.tsx:
- Add OfflineBanner above AiDegradationBanner
```

**Validation:**
```bash
node -e "const fs=require('fs'); ['lib/hooks/use-online-status.ts','components/shell/OfflineBanner.tsx'].forEach(f=>{if(!fs.existsSync(f)) throw new Error('Missing: '+f)}); console.log('9.3 PASS')"
```

---

### Step 9.4 — Performance

```
TASK: Apply performance optimisations.

1. Wrap these with React.memo:
   - components/notes/NoteCard.tsx
   - components/files/FileCard.tsx
   - components/chat/UserMessage.tsx
   - components/chat/AssistantMessage.tsx
   Each is rendered in long lists.

2. Verify next/dynamic is applied to:
   - NoteEditor (Phase 3 — already done)
   - CommandPalette (Phase 7 — already done)
   Add if missing.

3. Add useCallback to:
   - sendMessage in use-chat-stream.ts
   - sendMessage in use-agent-stream.ts

RULES:
- React.memo only wraps components that receive stable props and render in lists
- Do not memo components that render only once (shell, layout, etc.)
```

---

### Step 9.5 — Security audit

```
TASK: Run final security checks.

1. Confirm .gitignore includes: .env.local, .env*, .model.env
2. Confirm no OPENAI_API_KEY, GEMINI_API_KEY, or NVIDIA_API_KEY in any Next.js file
3. Confirm NEXT_PUBLIC_* vars contain only: NEXT_PUBLIC_API_URL, NEXT_PUBLIC_AUTOMATION_ENABLED
4. Confirm refreshToken is never written to any storage (search codebase for localStorage and sessionStorage — only 'dashnotes_at' should appear in sessionStorage calls)
5. Confirm no console.log statements include token values
```

**Validation:**
```bash
grep -r "localStorage" lib/ --include="*.ts" --include="*.tsx" | grep -v "node_modules"
# Should show zero results (localStorage is banned)

grep -r "OPENAI_API_KEY\|GEMINI_API_KEY\|NVIDIA" . --include="*.ts" --include="*.tsx" | grep -v "node_modules"
# Should show zero results

grep -r "refreshToken" lib/stores/ --include="*.ts"
# Should only show auth-store.ts with in-memory storage (no sessionStorage/localStorage calls for refreshToken)
```

---

### Step 9.6 — Error boundary audit

```
TASK: Verify error boundary placement matches the hierarchy in this doc.

Checklist:
1. GlobalErrorBoundary — ONLY in app/layout.tsx wrapping RootProvider
2. app/(app)/layout.tsx — MUST NOT import GlobalErrorBoundary
3. AiErrorBoundary — ContextPanel in (app)/layout.tsx
4. AiErrorBoundary — chat pages (app/(app)/chat/*)
5. AiErrorBoundary — agent session pages (app/(app)/agents/[agentSlug]/*)
6. TiptapErrorBoundary — EditorContent in NoteEditor only
7. No boundary calls clearSession() except via normal auth flows

Fix any violations. Report files changed.
```

**Validation:**
```bash
node -e "const fs=require('fs'); const root=fs.readFileSync('app/layout.tsx','utf8'); const app=fs.readFileSync('app/(app)/layout.tsx','utf8'); if(!root.includes('GlobalErrorBoundary')) throw new Error('Root missing GlobalErrorBoundary'); if(app.includes('GlobalErrorBoundary')) throw new Error('VIOLATION: GlobalErrorBoundary in app layout'); if(!app.includes('AiErrorBoundary')) throw new Error('App layout missing AiErrorBoundary on ContextPanel'); console.log('9.6 boundary audit PASS')"
```

---

### Step 9.7 — Final build + type check

```
TASK: Run the full production build and fix any remaining issues.

pnpm build

Requirements:
- Zero TypeScript errors
- Zero "any" types (check with: grep -r ": any" lib/ components/ app/ | grep -v node_modules | grep -v ".d.ts")
- All routes appear in build output
- No "missing key" warnings in console

If TypeScript errors exist: fix them. Do not suppress with @ts-ignore.
If "any" types exist: replace with explicit types.
```

---

### Phase 9 — Final validation

```bash
pnpm build 2>&1
# Zero errors required

grep -r ": any" lib/ components/ app/ --include="*.ts" --include="*.tsx" | grep -v "node_modules" | grep -v ".d.ts"
# Zero results required

grep -r "localStorage" lib/ components/ --include="*.ts" --include="*.tsx"
# Zero results required
```

---

## Cross-cutting rules (repeat at start of any session that touches AI or auth routes)

```
AI + AUTH RULES — enforced in every session:
1. workspace_id is NEVER sent in request body or query params to /ai/* routes
2. Citations are NEVER parsed from token stream — metadata event only
3. guardStream() is called before EVERY SSE connection open
4. AiUnavailableError is shown INLINE in the chat/agent view — never as a toast
5. SSE connections use fetch (not EventSource) for POST streams with Bearer token
6. AbortController cleanup on component unmount is MANDATORY
7. apiClient 401: isRetry circuit breaker — second 401 NEVER calls handleUnauthorized
8. GlobalErrorBoundary only in app/layout.tsx — never nested in (app)/layout
```

---

## Step index (Phase 1 — build order matters)

| Step | Builds |
|------|--------|
| 1.1 | Form deps |
| 1.2 | SSE parser only |
| 1.3 | Auth store |
| 1.4 | Token utils |
| 1.5 | Token refresh coordinator |
| 1.6 | **API client + isRetry circuit breaker** |
| 1.7 | Stream guard |
| 1.8 | API module stubs |
| 1.9 | Middleware |
| 1.10 | Login |
| 1.11 | Register |

---

*Cursor prompts v2 — blueprint v2, backend-frontend-contract, isRetry circuit breaker, error boundary hierarchy*
Full session table (38 chats, 52 steps)
Session	Steps	Together or single?
P0-A
0.1 + 0.2
Together
P0-B
0.3 + 0.4
Together
P0-C
0.5 + 0.6
Together
P1-A
1.1
Single
P1-B
1.2
Single
P1-C
1.3
Single
P1-D
1.4 + 1.5
Together
P1-E
1.6
Single (never batch)
P1-F
1.7
Single
P1-G
1.8
Single
P1-H
1.9
Single
P1-I
1.10
Single
P1-J
1.11
Single
P2-A
2.1 + 2.2 + 2.3
Together
P2-B
2.4
Single
P2-C
2.5
Single
P2-D
2.6
Single
P2-E
2.7
Single
P2-F
2.8
Single
P2-G
2.9
Single
P2-H
2.10
Single
P3-A
3.1 + 3.2
Together
P3-B
3.3
Single
P3-C
3.4
Single
P3-D
3.5
Single
P4-A
4.1
Single
P4-B
4.2
Single
P4-C
4.3 + 4.4
Together
P4-D
4.5
Single
P5-A
5.1
Single
P5-B
5.2
Single
P5-C
5.3
Single
P5-D
5.4
Single
P6-A
6.1
Single
P6-B
6.2
Single
P6-C
6.3
Single
P6-D
6.4
Single
P7-A
7.1 + 7.2
Together
P7-B
7.3
Single
P8-A
8.1
Single
P8-B
8.2
Single
P8-C
8.3
Single
P8-D
8.4
Single
P9-A
9.1 + 9.2
Together
P9-B
9.3
Single
P9-C
9.4 + 9.5
Together
P9-D
9.6 + 9.7
Together
Rules of thumb
Pattern	Batch?
Install-only + next install step
Yes (e.g. 0.1+0.2, 3.1+3.2)
Tightly coupled wiring (theme + providers)
Yes (0.3+0.4)
1.6 apiClient
Always single
Stream hooks (5.2, 6.1)
Always single
Big UI (2.9 shell, 3.4 Tiptap, 1.10 login)
Always single
Phase 9 audits
Batch in pair