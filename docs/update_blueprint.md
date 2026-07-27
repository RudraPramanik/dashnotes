# DashNotes — Cursor Agent Prompts (v3 patch — resume from 1.7)

This file **supersedes** the equivalent sections of `CURSOR_PROMPTS.md` (v2).
Everything through **Step 1.7 is already built and unchanged** — do not redo it.
This document contains:

1. One retroactive patch to Step 1.6 (small, do it now).
2. A new gating step, **2.11**, inserted before Phase 3.
3. Revised prompts for every step where the architecture review found a
   violation of: Single Responsibility, Composition Over Inheritance, Strict
   Prop Contracts, Server Components by Default, Isolate Interactivity, State
   Colocation, or Minimal Unidirectional Flow.
4. A changelog table so Cursor (and you) can see exactly what moved.

Everything **not** listed in the changelog is unchanged — keep using the v2
prompt text for those steps as-is.

---

## Changelog — what changed and why

| Step | Status | Why |
|------|--------|-----|
| 1.6 | **Patched** | `request()` and `stream()` each re-implemented the 401 circuit breaker. Extracted into one shared `executeWithAuthRetry`. |
| 2.2 | **Revised** | Shell store scope trimmed to chrome-only state. `contextPanelContent`, and (later) `citationData`/`toolTrace` never get added — feature state stays with the feature. |
| 2.6 | **Cleaned** | Prompt text for `notification-sse.ts` contained a self-contradicting draft note about EventSource. Rewritten as a clean spec (behavior unchanged; still stub-by-default). |
| **2.11 (new)** | **Added** | Gate: generate real OpenAPI types before any component types `unknown`. Prevents `unknown`/`as` casts from spreading through Phases 3–8. |
| 2.9 | **Revised** | `app/(app)/layout.tsx` was `"use client"` just to host two hook calls, forcing the entire shell subtree client-side. Layout is now a Server Component; hooks move into a new invisible client leaf, `AppShellEffects`. |
| 3.3 / 4.3 | **Revised** | `use-note.ts` and `use-file.ts` each hand-rolled identical 3-minute polling-timeout logic. Extracted into shared `use-indexing-poll.ts`. |
| 3.4 | **Revised** | `NoteEditor.tsx` carried seven responsibilities in one file. Split into four single-purpose components composed by a thin `NoteEditor` shell. |
| Shell `ContextPanel` (touches 3.4, 4.5, 5.3, 5.4, 6.2, 6.4, 2.9) | **Revised** | `ContextPanel` was a switch statement importing every feature's panel component (chat, agent, files, notes) — a hub, and a hidden dependency magnet. It's now a plain slot (`{ children }`); each page renders its own panel content into it. Removes the `contextPanelContent` enum and the shell-store citation/tool-trace duplication in one move. |

All other steps (1.8–1.11, 2.1, 2.3–2.5, 2.7, 2.8, 2.10, Phase 3 remainder,
Phases 4–9) are unchanged from v2 **except** for the specific file edits called
out above (e.g. 4.5's `FileMetaPanel` render location, 5.3/5.4's citation
handling, 6.2/6.4's tool-trace handling) — those are folded into the
`ContextPanel` revision below and don't need separate new prompts.

---

## Patch — Step 1.6 (apply now, before continuing)

Your `lib/api/client.ts` already exists and passes validation. This is a
same-file refactor, not a rebuild — it removes duplicated retry logic between
the JSON path and the stream path.

```
TASK: Refactor lib/api/client.ts to share one 401-retry state machine between
apiClient's JSON methods (get/post/patch/delete) and apiClient.stream.
Behavior must not change — this is an internal extraction only.

Add one internal (not exported) helper:

async function executeWithAuthRetry<T>(
  attempt: (isRetry: boolean) => Promise<Response>,
  onResponse: (res: Response, isRetry: boolean) => Promise<T>
): Promise<T>

Logic (identical to what 1.6 already specifies, just centralized):
1. Call attempt(false) to get the first Response.
2. If status !== 401: return onResponse(res, false).
3. If status === 401:
   a. If this is already the retry pass (tracked via closure, not a param the
      caller passes in) → clearSession() + redirect to
      /auth/login?reason=unauthorized, then throw a 401 ApiError. Never call
      handleUnauthorized twice for the same logical request.
   b. Otherwise: ok = await handleUnauthorized()
      - if !ok: throw 401 ApiError
      - if ok: res2 = await attempt(true); return onResponse(res2, true)

request<T>() becomes a thin wrapper: it builds the fetch call as an
`attempt` closure and an `onResponse` closure that parses JSON / throws on
429 / 503, then delegates to executeWithAuthRetry.

apiClient.stream() becomes the same shape: `attempt` opens the SSE fetch,
`onResponse` just returns the raw Response (body not consumed) after checking
status for 429/503, then delegates to executeWithAuthRetry.

RULES (unchanged from original 1.6):
- Exactly ONE replay per original request, for both JSON and stream paths.
- handleUnauthorized is NEVER called on the retry pass.
- apiClient must NOT import React.
- No public method signature changes — get/post/patch/delete/stream keep
  their existing call signatures used elsewhere in the app.
```

**Validation:**
```bash
node -e "
const fs=require('fs');
const c=fs.readFileSync('lib/api/client.ts','utf8');
if(!c.includes('executeWithAuthRetry')) throw new Error('Missing shared executeWithAuthRetry helper');
const occurrences = (c.match(/handleUnauthorized/g)||[]).length;
if(occurrences > 2) throw new Error('handleUnauthorized referenced in more than one call site — retry logic likely still duplicated');
if(!c.includes('AiUnavailableError')) throw new Error('Missing AiUnavailableError');
console.log('1.6-patch PASS');
"
```

---

## NEW Step 2.11 — Generate and lock OpenAPI types (gate before Phase 3)

Insert this immediately after Step 2.10, as its own session. Nothing in
Phase 3 onward may use `unknown` for API response shapes once this step
passes — that was a v2 stopgap that Cursor would otherwise carry forward
indefinitely.

```
TASK: Generate real types from the running backend and create a single
typed re-export module. This replaces all future 'unknown' return types.

STEP 1 — Generate:
pnpm api:types
(This runs the script from Step 1.8: openapi-typescript against
http://127.0.0.1/openapi.json -> lib/api/schema.d.ts)

Confirm lib/api/schema.d.ts now exists and is non-empty.

STEP 2 — Create the app-facing type module:

FILE: lib/api/types.ts
- Plain TypeScript module, no "use client"
- Import component schemas from './schema' (the generated file's
  `components['schemas']` namespace)
- Re-export named, ergonomic aliases for every shape the frontend touches:

export type Note = components['schemas']['NoteResponse']  // adjust to actual generated name
export type NoteCreate = components['schemas']['NoteCreate']
export type NoteUpdate = components['schemas']['NoteUpdate']
export type Notebook = components['schemas']['NotebookResponse']
export type FileRecord = components['schemas']['FileResponse']
export type WorkspaceMember = components['schemas']['MemberResponse']
export type Thread = components['schemas']['ThreadResponse']
export type ThreadMessage = components['schemas']['MessageResponse']
export type ChatCitation = components['schemas']['Citation']
export type IndexingStatus = Note['indexing_status']  // derive, don't hand-type twice

If the generated schema names don't match these guesses exactly, inspect
lib/api/schema.d.ts and use the real names — do not invent fields that
aren't in the generated file.

STEP 3 — Update lib/api/*.ts stub return types:
Replace every `Promise<unknown>` in lib/api/notes.ts, files.ts, notebooks.ts,
workspaces.ts, ai/threads.ts with the corresponding type from lib/api/types.ts.
Example: getNotes(): Promise<unknown> -> getNotes(): Promise<Note[]>

RULES:
- No component or hook written from Phase 3 onward may type API data as
  'unknown' or cast with 'as' to bypass this — if a field is missing from
  the generated schema, that's a backend contract gap to flag, not a reason
  to cast.
- lib/api/types.ts is the only place that imports from schema.d.ts directly.
  Everything else imports from lib/api/types.ts.
- Re-run `pnpm api:types` any time the backend schema changes; do not
  hand-edit schema.d.ts.
```

**Validation:**
```bash
node -e "
const fs=require('fs');
if(!fs.existsSync('lib/api/schema.d.ts')) throw new Error('Missing generated schema.d.ts — run pnpm api:types');
if(!fs.existsSync('lib/api/types.ts')) throw new Error('Missing lib/api/types.ts');
const t=fs.readFileSync('lib/api/types.ts','utf8');
['Note','FileRecord','Thread','ChatCitation'].forEach(x=>{
  if(!t.includes('export type '+x)) throw new Error('Missing exported type: '+x);
});
const apiFiles=['lib/api/notes.ts','lib/api/files.ts'];
apiFiles.forEach(f=>{
  const c=fs.readFileSync(f,'utf8');
  if(c.includes('Promise<unknown>')) throw new Error(f+' still returns unknown — update to typed return');
});
console.log('2.11 PASS');
"
```

---

## Revised Step 2.2 — Shell store (scope trimmed)

Replace the v2 Step 2.2 prompt with this. The difference: no
`contextPanelContent` field, and an explicit rule banning feature data from
ever landing here (this rule is what keeps 5.3/6.2 clean later).

```
TASK: Build the shell UI state store. Scope is strictly chrome/layout state —
nothing that a feature (notes, files, chat, agents) owns.

FILE: lib/stores/shell-store.ts
- No "use client" — plain Zustand module
- Import create from zustand

Types (export all):
export type ShellState = {
  sidebarOpen: boolean
  contextPanelOpen: boolean
  paletteOpen: boolean
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  openContextPanel: () => void
  closeContextPanel: () => void
  setPaletteOpen: (open: boolean) => void
}

Defaults: sidebarOpen: true, contextPanelOpen: false, paletteOpen: false

RULES:
- This store holds ONLY presence/visibility flags for shell chrome. It does
  NOT hold WHAT is displayed inside the context panel — that content is
  owned and passed as props/children by whichever feature page opens it.
- Do not add fields like contextPanelContent, citationData, toolTrace, or
  anything resembling feature/domain data to this file, now or in later
  phases. If a later step's prompt asks you to add such a field, stop and
  flag it — the correct place for that state is the feature's own hook
  (use-chat-stream, use-agent-stream, etc.), passed down as props.
- No server data in this store — only UI state.
```

**Validation:**
```bash
node -e "
const fs=require('fs');
const s=fs.readFileSync('lib/stores/shell-store.ts','utf8');
if(s.includes('contextPanelContent')) throw new Error('VIOLATION: contextPanelContent must not exist — ContextPanel is a slot, not a switch');
if(s.includes('citationData') || s.includes('toolTrace')) throw new Error('VIOLATION: feature data leaking into shell store');
if(!s.includes('contextPanelOpen')) throw new Error('Missing contextPanelOpen');
if(!s.includes('paletteOpen')) throw new Error('Missing paletteOpen');
console.log('2.2 PASS');
"
```

---

## Cleaned Step 2.6 — Automation notification port (spec cleanup only)

Behavior is unchanged from v2 (stub is still the default, SSE port is still
inert unless `NEXT_PUBLIC_AUTOMATION_ENABLED=true`). Only the prompt text for
`notification-sse.ts` is rewritten, since the v2 draft argued with itself
mid-sentence.

```
FILE: lib/automation/notification-sse.ts
- Implements NotificationPort
- Cannot use the browser EventSource API directly, because EventSource has no
  way to attach an Authorization header and this endpoint requires Bearer
  auth. Use a fetch-based stream instead (same pattern as apiClient.stream).
- subscribe(onEvent, onError):
  1. Open a GET fetch stream to automationConfig.notificationsUrl with the
     Bearer token from the auth store and an AbortController stored on the
     instance.
  2. Parse the stream with parseSseStream (lib/api/sse-parser.ts).
  3. On an 'automation_pending' event: JSON.parse the data and call onEvent.
  4. On stream error or close: call onError, then reconnect with exponential
     backoff (1s, 2s, 4s, 8s, capped at 30s) as long as the port is still
     subscribed.
- disconnect(): abort the stored AbortController; stop any pending backoff
  reconnect timer.

RULES: unchanged from v2 — this file is built but never instantiated unless
automationConfig.enabled is true (see notification-factory.ts).
```

(No change to `notification-factory.ts`, `notification-stub.ts`,
`use-automation-notifications.ts`, or `use-automation-count.ts` — those were
already correct.)

---

## Revised Step 2.9 — App shell layout (Server Component by default)

This is the most important fix. In v2, the entire authenticated shell tree
was forced client-side because the layout called two hooks directly. Here,
the layout stays a Server Component; the hooks move into one invisible
client leaf.

```
TASK: Build the authenticated app shell layout as a Server Component. It
should render structure and compose client leaves — it should not itself
need "use client".

FILE 1: components/shell/AppShellEffects.tsx
- "use client" directive
- Named export: AppShellEffects
- No props, renders null
- Calls useAutomationNotifications() — establishes notification port
  (stub by default)
- Calls useAiHealth() — starts health polling
- This component exists ONLY to host session-wide side-effect hooks that the
  server layout cannot call directly. It must render nothing.

FILE 2: app/(app)/layout.tsx (REPLACE placeholder)
- NO "use client" directive — this is a Server Component
- Default export: AppLayout
- Props: { children: React.ReactNode }
- Renders <AppShellEffects /> once, near the top, alongside the real markup
- Renders OfflineBanner and AiDegradationBanner (both are themselves small
  client components — that's fine, they stay leaves)

Layout structure (three column desktop, responsive):
┌─────────────────────────────────────────────────────┐
│ OfflineBanner (client leaf, conditional)             │
│ AiDegradationBanner (client leaf, conditional)       │
├────────────┬─────────────────────┬──────────────────┤
│ AppSidebar │ main content        │ ContextPanel      │
│ (240px)    │ (flex-1)            │ (280px, cond.)    │
└────────────┴─────────────────────┴──────────────────┘

Header (inside main content area, sticky):
- Left: menu toggle button (mobile only) — client leaf, uses shell store
- Center/right: Search button "Search workspace… ⌘K" — client leaf, calls
  setPaletteOpen(true)
- Right: AiStatusIndicator, ThemeToggle, UserMenu — each already a
  self-contained client leaf from earlier steps

ContextPanel (revised — see "Revised ContextPanel contract" below):
- Rendered here as an empty slot: <ContextPanel />
- Individual feature pages (chat, agent, file, note) portal their own panel
  content into it — the layout itself renders no panel content and imports
  no feature component.

CommandPalette:
- Loaded here via next/dynamic (ssr: false), same as v2 Step 7.3 — this one
  component is legitimately client-only and heavy, so it stays a dynamic
  import inside the server layout, not a reason to make the whole layout
  client.

RULES:
- app/(app)/layout.tsx itself must contain no "use client" directive and no
  hook calls. If it needs interactivity, that interactivity is delegated to
  a named client leaf component, not absorbed into the layout.
- GlobalErrorBoundary lives ONLY in app/layout.tsx (Step 0.6) — do NOT add
  another here.
- AiErrorBoundary wraps ONLY the ContextPanel — not the sidebar or main
  content.
- AppShellEffects is rendered exactly once for the whole authenticated
  session.
```

**Validation:**
```bash
node -e "
const fs=require('fs');
const layout=fs.readFileSync('app/(app)/layout.tsx','utf8');
if(layout.includes('\"use client\"') || layout.includes(\"'use client'\")) throw new Error('VIOLATION: app/(app)/layout.tsx must be a Server Component (no use client)');
if(layout.includes('useAutomationNotifications') || layout.includes('useAiHealth')) throw new Error('VIOLATION: hooks must live in AppShellEffects, not the layout');
if(layout.includes('GlobalErrorBoundary')) throw new Error('VIOLATION: GlobalErrorBoundary must only be in app/layout.tsx');
if(!layout.includes('AppShellEffects')) throw new Error('Missing AppShellEffects render');
if(!layout.includes('ContextPanel')) throw new Error('Missing ContextPanel slot');
if(!layout.includes('AiErrorBoundary')) throw new Error('Missing AiErrorBoundary around ContextPanel');
const effects=fs.readFileSync('components/shell/AppShellEffects.tsx','utf8');
if(!effects.includes('use client')) throw new Error('AppShellEffects missing use client');
if(!effects.includes('useAutomationNotifications') || !effects.includes('useAiHealth')) throw new Error('AppShellEffects missing required hooks');
console.log('2.9 PASS');
"
```

Step 2.10 (mobile layout) is otherwise unchanged from v2 — `BottomTabBar` and
`ContextSheet` remain client leaves rendered conditionally; they don't
change the server/client boundary established above.

---

## Revised ContextPanel contract (touches 3.4, 4.5, 5.3/5.4, 6.2/6.4)

This replaces every later instruction of the form *"Update
components/shell/ContextPanel.tsx: add a case for X."* There is no longer a
central case statement to update.

```
FILE: components/shell/ContextPanel.tsx (build once, in Step 2.9's session
or its own small session — it has no feature dependencies)
- "use client" directive
- Named export: ContextPanel
- Props: { children?: React.ReactNode }
- Reads contextPanelOpen from shell store
- Renders nothing when contextPanelOpen is false OR children is undefined
- Otherwise renders: <aside className="w-[280px] border-l bg-card overflow-y-auto">{children}</aside>

RULES:
- ContextPanel imports NOTHING from components/notes, components/files,
  components/chat, or components/agents. It is a pure layout slot.
- Every feature page is responsible for (a) calling openContextPanel() /
  closeContextPanel() from the shell store on mount/unmount, exactly as
  before, and (b) rendering its own panel content as children of
  <ContextPanel> at its own call site.
```

This changes the later steps as follows (apply when you reach them — no new
sessions needed, just amend the existing step's file list):

- **Step 3.4 (note editor page)** — instead of "Update ContextPanel.tsx to
  add a 'note-outline' case," the note page itself renders:
  `<ContextPanel><NoteOutlinePanel noteId={noteId} /></ContextPanel>`
  alongside calling `openContextPanel()` on mount / `closeContextPanel()` on
  unmount. `NoteOutlinePanel` itself is unchanged from v2.

- **Step 4.5 (file detail page)** — same pattern:
  `<ContextPanel><FileMetaPanel fileId={fileId} /></ContextPanel>`.

- **Step 5.3/5.4 (chat)** — `CitationPanel` no longer reads from a shell
  store field. `citations` stays exactly where `use-chat-stream` already
  puts it (component-local state returned by the hook). The thread page
  renders: `<ContextPanel><CitationPanel citations={citations} /></ContextPanel>`,
  where `citations` comes straight from `useChatStream()`'s return value —
  no shell store round-trip. Delete any instruction to add `citationData`/
  `setCitations` to shell-store.ts; it was removed in Step 2.2 above.

- **Step 6.2/6.4 (agents)** — same pattern for tool trace:
  `<ContextPanel><ToolTracePanel toolEvents={toolEvents} stepsTaken={stepsTaken} isStreaming={isStreaming} /></ContextPanel>`,
  with `toolEvents`/`stepsTaken` coming directly from `useAgentStream()`'s
  return value. Delete any instruction to add `toolTrace`/`setToolTrace`/
  `clearToolTrace` to shell-store.ts.

**Validation (run once ContextPanel exists, and again after each feature
page that uses it):**
```bash
node -e "
const fs=require('fs');
const cp=fs.readFileSync('components/shell/ContextPanel.tsx','utf8');
['components/notes','components/files','components/chat','components/agents'].forEach(dir=>{
  if(cp.includes(dir)) throw new Error('VIOLATION: ContextPanel imports from '+dir+' — it must be a pure slot');
});
if(!cp.includes('children')) throw new Error('ContextPanel must accept children prop');
console.log('ContextPanel contract PASS');
"
```

---

## Revised Steps 3.3 / 4.3 — shared indexing-poll hook

Insert this as its own tiny session **before** 3.3 (or fold it into the top
of the 3.3 session — it's small enough either way).

```
TASK: Extract the indexing-poll timeout logic shared by notes and files into
one hook, before either use-note.ts or use-file.ts is written.

FILE: lib/hooks/use-indexing-poll.ts
- "use client" directive
- Named export: useIndexingPoll
- Signature:
  function useIndexingPoll(
    status: IndexingStatus | undefined | null,
    timeoutMs = 180_000
  ): { refetchInterval: number | false; pollingExceeded: boolean; resetPoll: () => void }
- Uses shouldPoll from lib/utils/indexing-status.ts to decide refetchInterval
  (5000 when shouldPoll(status), false otherwise)
- Tracks first-seen-pending time in a useRef; once (Date.now() - startedAt) >
  timeoutMs, sets pollingExceeded true and forces refetchInterval to false
  regardless of status
- resetPoll(): clears the ref and pollingExceeded, so a manual retry button
  can restart the timeout window
- Import IndexingStatus from lib/api/types.ts (Step 2.11), not hand-typed

RULES:
- This is the ONLY place the 3-minute timeout constant and the useRef timing
  logic exist. use-note.ts and use-file.ts both call this hook and forward
  its return values — they do not reimplement any part of it.
```

**Validation:**
```bash
node -e "
const fs=require('fs');
if(!fs.existsSync('lib/hooks/use-indexing-poll.ts')) throw new Error('Missing use-indexing-poll.ts');
const h=fs.readFileSync('lib/hooks/use-indexing-poll.ts','utf8');
if(!h.includes('180_000') && !h.includes('180000')) throw new Error('Missing 180s default timeout');
if(!h.includes('resetPoll')) throw new Error('Missing resetPoll');
console.log('use-indexing-poll PASS');
"
```

Then amend 3.3 and 4.3 as follows (file lists otherwise unchanged from v2):

```
FILE: lib/hooks/notes/use-note.ts
- useQuery(queryKeys.note(wid, id), () => getNote(id))
- Call const { refetchInterval, pollingExceeded } = useIndexingPoll(note?.indexing_status)
- Pass refetchInterval into the useQuery options
- Returns: { note, isLoading, isError, pollingExceeded }
- Do NOT reimplement the useRef timeout tracking here — it lives in
  use-indexing-poll.ts only.
```

```
FILE: lib/hooks/files/use-file.ts
- Same pattern: call useIndexingPoll(file?.indexing_status), forward
  refetchInterval and pollingExceeded. No local timeout logic.
```

**Validation (updated):**
```bash
node -e "
const fs=require('fs');
['lib/hooks/notes/use-note.ts','lib/hooks/files/use-file.ts'].forEach(f=>{
  const c=fs.readFileSync(f,'utf8');
  if(!c.includes('useIndexingPoll')) throw new Error(f+' must call useIndexingPoll, not reimplement timeout logic');
  if(c.includes('180_000') || c.includes('180000')) throw new Error(f+' has its own timeout constant — logic duplicated, should delegate to use-indexing-poll');
});
console.log('3.3/4.3 PASS');
"
```

---

## Revised Step 3.4 — Tiptap editor, split by responsibility

Same file-level goals as v2 (auto-save title/body, privacy toggle, char
count, delete/copy-link menu, error boundary), but composed from four small
components instead of one file carrying all of it.

```
TASK: Build the note editor as a composition of single-purpose components.
TiptapErrorBoundary is unchanged from v2 — build it first exactly as
specified there.

FILE 1: components/notes/NoteTitleField.tsx
- "use client" directive
- Named export: NoteTitleField
- Props: { initialTitle: string; onSave: (title: string) => void }
- Owns its own <input> local state and its own 1500ms debounce timer
- Calls onSave(title) when the debounce fires; clears timer on unmount
- No knowledge of noteId, mutations, or the API — purely "text in, debounced
  callback out"

FILE 2: components/notes/NoteBody.tsx
- "use client" directive
- Named export: NoteBody
- Props: { initialContent: string; onSave: (content: string) => void }
- Owns the useEditor() Tiptap instance (StarterKit, Placeholder,
  CharacterCount extensions)
- Owns its own 1500ms debounce timer independent of NoteTitleField's
- Calls onSave(content) on debounce fire; clears timer on unmount
- Exposes character/word count via its own local render (footer text), not
  via a prop threaded from the parent
- Wraps its <EditorContent> in <TiptapErrorBoundary> internally — the parent
  does not need to know Tiptap is involved

FILE 3: components/notes/NotePrivacyToggle.tsx
- "use client" directive
- Named export: NotePrivacyToggle
- Props: { isPrivate: boolean; onChange: (isPrivate: boolean) => void }
- shadcn Select with "Public"/"Private" options
- Calls onChange immediately on selection — no debounce
- Purely controlled — no local "is this saved yet" state; parent owns that

FILE 4: components/notes/NoteActionsMenu.tsx
- "use client" directive
- Named export: NoteActionsMenu
- Props: { onDelete: () => void; onCopyLink: () => void }
- shadcn DropdownMenu: "Delete" (opens AlertDialog confirm, then calls
  onDelete) and "Copy link" (calls onCopyLink directly)
- No knowledge of noteId or the delete mutation itself — just emits intent

FILE 5: components/notes/NoteEditor.tsx (composition root — now thin)
- "use client" directive
- Named export: NoteEditor
- Props: { noteId: string; initialContent: string; initialTitle: string; isPrivate: boolean }
- Calls useNoteMutations() once, here
- Tracks a single save-state indicator ('idle' | 'saving' | 'saved' | 'error')
  shared across title/body saves — this is the one piece of state that
  legitimately belongs at this level, since it reflects the combined result
  of both children's onSave calls
- Renders:
  <NoteTitleField initialTitle={...} onSave={handleTitleSave} />
  <NoteBody initialContent={...} onSave={handleBodySave} />
  <NotePrivacyToggle isPrivate={isPrivate} onChange={handlePrivacyChange} />
  <NoteActionsMenu onDelete={handleDelete} onCopyLink={handleCopyLink} />
  + the save indicator text: "Saving…" | "Saved · {n}s ago" | "Failed to save — Retry"
- handleTitleSave / handleBodySave / handlePrivacyChange / handleDelete /
  handleCopyLink are the only functions in this file — each calls the
  relevant mutation from useNoteMutations() and updates save-state

RULES:
- Each of the four leaf components takes primitive/callback props only — no
  leaf component imports useNoteMutations, apiClient, or noteId. This is the
  strict-prop-contract boundary: NoteEditor is the only place that knows
  about the network.
- Debounce timers are owned by the component that owns the value being
  debounced (title timer in NoteTitleField, body timer in NoteBody) — not
  hoisted to the parent. Both must clear their own timer on unmount.
- Privacy toggle has no debounce — unchanged from v2.
```

**Validation:**
```bash
node -e "
const fs=require('fs');
['components/notes/NoteTitleField.tsx','components/notes/NoteBody.tsx','components/notes/NotePrivacyToggle.tsx','components/notes/NoteActionsMenu.tsx','components/notes/NoteEditor.tsx','components/errors/TiptapErrorBoundary.tsx'].forEach(f=>{
  if(!fs.existsSync(f)) throw new Error('Missing: '+f);
});
const leaf1=fs.readFileSync('components/notes/NoteTitleField.tsx','utf8');
const leaf2=fs.readFileSync('components/notes/NotePrivacyToggle.tsx','utf8');
[leaf1, leaf2].forEach(c=>{
  if(c.includes('useNoteMutations') || c.includes('apiClient')) throw new Error('VIOLATION: leaf editor component must not know about mutations/network');
});
const body=fs.readFileSync('components/notes/NoteBody.tsx','utf8');
if(!body.includes('1500')) throw new Error('NoteBody missing 1500ms debounce');
if(!body.includes('TiptapErrorBoundary')) throw new Error('NoteBody must wrap its own EditorContent in TiptapErrorBoundary');
const root=fs.readFileSync('components/notes/NoteEditor.tsx','utf8');
if(!root.includes('useNoteMutations')) throw new Error('NoteEditor must own useNoteMutations');
if(!root.includes('NoteTitleField') || !root.includes('NoteBody') || !root.includes('NotePrivacyToggle') || !root.includes('NoteActionsMenu')) throw new Error('NoteEditor must compose all four leaf components');
console.log('3.4 PASS');
"
```

`app/(app)/notes/[noteId]/page.tsx` is unchanged from v2 except: it now
renders `<ContextPanel><NoteOutlinePanel noteId={noteId} /></ContextPanel>`
per the ContextPanel section above, instead of relying on a shell-store
content switch.

---

## Everything else

Steps 1.8, 1.9, 1.10, 1.11 — unchanged, proceed exactly as in v2.

Phase 2: 2.1, 2.3, 2.4, 2.5, 2.7, 2.8, 2.10 — unchanged. Only 2.2, 2.6, 2.9,
and the new 2.11 differ, as covered above. Recommended session order for the
rest of Phase 2:

```
P2-A: 2.1 + 2.2(revised) + 2.3
P2-B: 2.4
P2-C: 2.5
P2-D: 2.6(cleaned)
P2-E: 2.7
P2-F: 2.8
P2-G: 2.9(revised) — build ContextPanel-as-slot in this session too
P2-H: 2.10
P2-I: 2.11(new) — run this as its own short session; nothing in Phase 3 may start until it passes
```

Phase 3 remainder (3.1, 3.2, 3.5) — unchanged from v2. 3.3 and 3.4 are
revised above.

Phase 4 — unchanged from v2 except 4.3 (shared poll hook) and 4.5 (renders
into `<ContextPanel>` as children rather than updating a switch case).

Phase 5 — unchanged from v2 except: wherever the v2 text says "Update
components/shell/ContextPanel.tsx" for `citations`, instead render
`<ContextPanel><CitationPanel citations={citations} /></ContextPanel>` at
the call site, and skip any shell-store `citationData`/`setCitations`
addition.

Phase 6 — same adjustment for `tool-trace` / `ToolTracePanel`.

Phases 7, 8, 9 — unchanged from v2. Note that Step 9.6's error-boundary audit
should now also confirm: `app/(app)/layout.tsx` has no `"use client"`
directive, and `ContextPanel.tsx` has zero imports from any feature
directory — add these two checks to that step's manual audit when you get
there.

---

*v3 patch — resumes from Step 1.7. Server-Components-by-default layout,
props-based ContextPanel slot, deduplicated retry/polling logic, and a
typed-API gate before Phase 3.*