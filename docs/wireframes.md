# DashNotes — Frontend Wireframes

Wireframe layouts for the DashNotes client, aligned with the current backend API (`docs/backendapi.md`). Backend is pre-production; routes and contracts may evolve — this doc maps **UI intent → API surface** so implementation stays in sync.

**Stack (client):** Next.js 16 App Router · React 19 · Tailwind 4  
**Tenancy:** JWT claims `sub`, `wid`, `role` — workspace scope never sent from client body/query on AI routes.

**v1 chrome overlay (normative):** OpenSpec `lock-v1-ui-contract` + `docs/ui-language.md` win over marketplace sketches below. Visual language: conversation chrome on Chat/Agent, writing-first Notes.

### v1 live chrome (ship this)

- Nav: **Notes · Files · Chat · Agent · Settings**. Default landing `/notes`.
- Agent is a **single destination** (Workspace Assistant → `/ai/agent*`). Do not show coming-soon specialist cards as live products.
- Workspace name: read-only `GET /workspaces/me`. No switcher.
- ContextPanel is a **slot**: Notes → meta; Files → file meta + lag copy; Chat → Sources from `metadata`; Agent → Tools from `tool_start` / `tool_end`.
- Threads copy: **Your conversations** (current user).
- First-run: inline empty Notes coach (create note → upload file → ask Chat). Prefill chat message only — never send `note_id` on chat body.
- Citations: OpenAPI fields (`note_id`, `chunk_id`, `title`, `relevance_score`). No excerpts.

### v1 deferred (not live chrome)

Agent marketplace, automation inbox as primary nav, workspace switcher, required `indexing_status` badges, required `/health/ai` dot (404-safe if used), citation excerpts, Cmd-K as primary Q&A.

---

## Design principles

| Principle | UI implication |
|-----------|----------------|
| Workspace is the boundary | Switching workspace clears caches, threads, and lists |
| Chat ≠ Agent | Separate nav entries; different latency, tool trace, expectations |
| Citations are trust | Always show source panel; link to note/file detail |
| Async AI pipeline | Processing badges on notes/files (~45s worker cycle) |
| RBAC is visible | Private badges, role-gated actions, member vs admin views |
| Graceful degradation | Banner when `/health/ai` or AI routes return **503**; notes/files still work |
| Multi-agent ready | **Deferred.** v1 nav is a single Agent item. Extra agent routes stay in the tree for later. |

---

## Route map

```
/auth/login
/auth/register

/app                          ← protected shell (requires Bearer token)
  /notes                      ← default landing
  /notes/[noteId]
  /notebooks/[notebookId]
  /files
  /files/[fileId]
  /chat
  /chat/[threadId]
  /agents                     ← v1: redirect or land on Workspace Assistant (single agent)
  /agents/workspace-assistant
  /agents/workspace-assistant/[threadId]
  /search                     ← deferred power-user; cmd-K not primary Q&A
  /settings/account
  /settings/workspace         ← owner/admin: members, roles
  /settings/automation        ← backlog — omit from primary nav while flag off
```

---

## Global app shell

All authenticated routes share this frame.

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ [≡] DashNotes          [🔍 Search workspace…  ⌘K]     [AI ●] [👤 Niloy ▾]   │
├──────────────┬───────────────────────────────────────────────┬───────────────┤
│              │                                               │               │
│  WORKSPACE   │                                               │  CONTEXT      │
│  ┌─────────┐ │                                               │  PANEL        │
│  │ Acme    │ │              MAIN CONTENT                     │  (optional)   │
│  └─────────┘ │                                               │               │
│              │                                               │  Citations    │
│  Notes       │                                               │  Tool trace   │
│  Files       │                                               │  File meta    │
│  ─────────   │                                               │  Note outline │
│  ─────────   │                                               │               │
│  Chat        │                                               │               │
│  Agent       │                                               │               │
│  ─────────   │                                               │               │
│  Settings    │                                               │               │
│              │                                               │               │
│  [+ New ▾]   │                                               │               │
│              │                                               │               │
└──────────────┴───────────────────────────────────────────────┴───────────────┘

v1: no greyed future-agent rows
```

**Shell behaviors**

- **Workspace label (`Acme`):** `GET /workspaces/me` → display name. **Switching deferred at launch** — dropdown switcher added later with `POST /auth/switch-workspace` (see `backend-frontend-contract.md`).
- **AI status (`AI ●`):** green = `/health/ai` ok; amber = degraded; red = unavailable. Tooltip explains Qdrant/LLM state.
- **`[+ New ▾]`:** New note · Upload file · New chat · Ask agent (context-aware default).
- **Context panel:** collapsible; auto-opens on chat (citations) and agent (tool trace).

**Mobile (<768px):** bottom tab bar — Notes · Files · Chat · Agent · More. Context panel becomes bottom sheet.

---

## Auth — Login / Register

### Login (`/auth/login`)

```
┌────────────────────────────────────────┐
│            DashNotes                   │
│                                        │
│   Email                                │
│   ┌──────────────────────────────────┐ │
│   │ you@company.com                  │ │
│   └──────────────────────────────────┘ │
│                                        │
│   Password                             │
│   ┌──────────────────────────────────┐ │
│   │ ••••••••••                       │ │
│   └──────────────────────────────────┘ │
│                                        │
│   [        Sign in        ]            │
│                                        │
│   No account? Register                 │
│                                        │
│   ── After login ──                    │
│   If user has 1 workspace → /notes     │
│   If multiple → workspace picker modal │
└────────────────────────────────────────┘

API: POST /auth/login → access_token (JWT: sub, wid, role)
Rate limit UI: 429 → show Retry-After countdown
```

### Register (`/auth/register`)

Same layout + confirm password + optional workspace name on first signup.

```
API: POST /auth/register → access_token or redirect to login
```

---

## Notes — List & editor

### Notes list (`/notes`)

```
┌─ Main ─────────────────────────────────────────────────────────────────────┐
│ Notes                                    [Filter ▾] [Sort ▾] [+ New note]  │
├────────────────────────────────────────────────────────────────────────────┤
│ ┌─ Sidebar (within main) ──┐  ┌─ Note list ──────────────────────────────┐ │
│ │ All notes                  │  │ ● Q4 planning              2h ago       │ │
│ │ Notebook: Product          │  │   tags: planning, q4  [public]          │ │
│ │ Notebook: Engineering      │  │                                         │ │
│ │ ── Tags ──                 │  │ ● API design draft         yesterday    │ │
│ │ planning  api  draft         │  │   tags: api  [private 🔒]  indexing…   │ │
│ └────────────────────────────┘  │                                         │ │
│                                 │ ● Meeting notes — Jan 12   Jan 12       │ │
│                                 │   tags: meeting  [public]               │ │
│                                 └─────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────────┘

API: GET /notes (RBAC-filtered list)
      GET /notebooks
States: empty state · skeleton · error · "indexing…" badge when embed pending
Member: only edit/delete own notes; view public + own private
Owner/admin: CRUD any note
```

### Note editor (`/notes/[noteId]`)

```
┌─ Main ────────────────────────────────────────────────┬─ Context (opt) ─────┐
│ ← Notes    [Untitled note ▾]     [Public ▾] [⋯]       │ Linked files        │
├───────────────────────────────────────────────────────┤ Attachments (2)     │
│ # Title                                               │ ┌─────────────────┐ │
│ ┌───────────────────────────────────────────────────┐ │ │ contract.pdf    │ │
│ │ Rich text / markdown editor                       │ │ └─────────────────┘ │
│ │                                                   │ │ Tags (auto)         │
│ │ Lorem ipsum…                                      │ │ planning · q4       │
│ │                                                   │ │                     │
│ └───────────────────────────────────────────────────┘ │ [Ask about this →]  │
│ Saved · 3s ago · indexed ✓                            │ opens Chat w/ ctx   │
├───────────────────────────────────────────────────────┴─────────────────────┤
│ [💬 Chat]  [🤖 Agent]  — quick actions with note_id context (future param) │
└─────────────────────────────────────────────────────────────────────────────┘

API: GET/PATCH /notes/{id}
      POST /notes/ on create → worker: embed + generate_note_tags
Privacy toggle: is_private (member creates private by default option)
Delete: confirm modal; owner/admin can delete any
```

### Notebook view (`/notebooks/[notebookId]`)

Same as notes list, filtered by notebook. Header shows notebook title + note count.

```
API: GET /notebooks/{id} · GET /notes?notebook_id=…
```

---

## Files — Drive

### Files library (`/files`)

```
┌─ Main ─────────────────────────────────────────────────────────────────────┐
│ Files                         [Grid | List]  [Upload]  [Drop files here]   │
├────────────────────────────────────────────────────────────────────────────┤
│ Filter: [All types ▾]  [Visibility ▾]  [Tags ▾]  Search filenames…         │
├────────────────────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐                    │
│  │ 📄 PDF   │  │ 📄 DOCX  │  │ 📊 CSV   │  │ 📝 TXT   │                    │
│  │ contract │  │ spec     │  │ metrics  │  │ readme   │                    │
│  │ ✓ indexed│  │ ⏳ proc… │  │ ✓ indexed│  │ ✓ indexed│                    │
│  │ public   │  │ private🔒│  │ public   │  │ public   │                    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘                    │
└────────────────────────────────────────────────────────────────────────────┘

API: GET /files (RBAC: member sees non-private + own)
      POST /files/upload multipart(file, is_private, description?)
Upload flow: optimistic row → poll until extracted_text / summary populated
Member: cannot see others' private files
```

### File detail (`/files/[fileId]`)

```
┌─ Main ────────────────────────────────────────────────┬─ Context ───────────┐
│ ← Files    contract.pdf              [Download] [⋯]   │ Status              │
├───────────────────────────────────────────────────────┤ ● Indexed           │
│ Preview (PDF iframe / text excerpt)                   │ Extracted ✓         │
│ ┌───────────────────────────────────────────────────┐ │ Summary ✓           │
│ │ "This agreement covers…" (extracted_text preview) │ │ Tags ✓              │
│ └───────────────────────────────────────────────────┘ │                     │
│                                                       │ AI summary          │
│ Description                                           │ "Vendor contract…"  │
│ Uploaded by you · Jan 10 · application/pdf            │                     │
│                                                       │ Tags                │
│ Tags: legal · contract · vendor                       │ legal · contract    │
│                                                       │                     │
│ Linked notes (future)                                 │ [Ask about file →]  │
└───────────────────────────────────────────────────────┴─────────────────────┘

API: GET /files/{id} · GET download_url
Poll: every 5s while processing; stop when summary/tags present or timeout banner
```

---

## Chat — Fast RAG (`/ai/chat*`)

Separate from agents. Optimized for Q&A with citations.

### Chat layout (`/chat`, `/chat/[threadId]`)

```
┌─ Main ────────────────────────────────────────────────┬─ Citations ─────────┐
│ Chat                              [+ New conversation]│ Sources (3)       │
├──────────────┬────────────────────────────────────────┤─────────────────────┤
│ THREADS      │  Conversation                          │ ┌─────────────────┐ │
│              │                                        │ │ 📄 contract.pdf │ │
│ Today        │  ┌─ You ────────────────────────────┐ │ │ score 0.82      │ │
│ ● Q4 budget  │  │ What did we decide on budget?    │ │ │ "…allocated…"   │ │
│              │  └──────────────────────────────────┘ │ │ [Open file]     │ │
│ Yesterday    │                                        │ └─────────────────┘ │
│ ○ API risks  │  ┌─ Assistant ──────────────────────┐ │ ┌─────────────────┐ │
│ ○ Onboarding │  │ Based on your notes, the Q4…▌    │ │ │ 📝 Q4 planning  │ │
│              │  │ (streaming tokens)               │ │ │ score 0.71      │ │
│ [🗑 delete]  │  └──────────────────────────────────┘ │ │ [Open note]     │ │
│              │                                        │ └─────────────────┘ │
│              │  chunks: 8 retrieved · 5 used · 1.2s   │                     │
├──────────────┴────────────────────────────────────────┤                     │
│ ┌───────────────────────────────────────────────────┐ │                     │
│ │ Ask anything about your workspace…          [Send]│ │                     │
│ └───────────────────────────────────────────────────┘ │                     │
│ Mode: RAG Chat · searches notes + files                 │                     │
└───────────────────────────────────────────────────────┴─────────────────────┘

API: GET /ai/threads
      GET /ai/threads/{id}/messages
      DELETE /ai/threads/{id}
      POST /ai/chat/stream { message, thread_id? }
SSE: token → metadata(citations, thread_id) → [DONE]
Citations: render only from metadata event — never parse from token stream
503: inline retry banner "LLM temporarily unavailable"
429: show Retry-After
```

### Chat message states

```
[User bubble — right aligned]
[Assistant bubble — streaming cursor ▌]
[Citation chips under bubble after metadata arrives]
[System — "Searching your workspace…"]
[Error — degraded AI with link to /health/ai status]
```

---

## Agents — Hub & sessions

Backend today: **Workspace Assistant** at `POST /ai/agent*`. Wireframes assume additional agents on separate routes (e.g. `/ai/agents/research`) — UI is ready before backend ships.

### Agent hub (`/agents`)

```
┌─ Main ─────────────────────────────────────────────────────────────────────┐
│ Agents — pick a specialist                                                 │
├────────────────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐  │
│ │ 🤖 Workspace        │  │ 🔬 Research         │  │ ✍️ Writer           │  │
│ │    Assistant        │  │    Agent            │  │    Agent            │  │
│ │ LIVE                │  │ COMING SOON         │  │ COMING SOON         │  │
│ │ Search, create &    │  │ Deep multi-doc      │  │ Drafts, rewrites,   │  │
│ │ update notes        │  │ synthesis           │  │ tone matching       │  │
│ │ [Open →]            │  │ [Notify me]         │  │ [Notify me]         │  │
│ └─────────────────────┘  └─────────────────────┘  └─────────────────────┘  │
│ ┌─────────────────────┐  ┌─────────────────────┐                           │
│ │ 📁 File Ops         │  │ ⚡ Automation        │                           │
│ │    Agent            │  │    Agent            │                           │
│ │ COMING SOON         │  │ COMING SOON         │                           │
│ │ Bulk organize,      │  │ Trigger workflows,  │                           │
│ │ tag, summarize      │  │ approval queue      │                           │
│ └─────────────────────┘  └─────────────────────┘                           │
└────────────────────────────────────────────────────────────────────────────┘

Current backend mapping:
  workspace-assistant → POST /ai/agent, POST /ai/agent/stream
Future (illustrative):
  research-agent      → POST /ai/agents/research (TBD)
  writer-agent        → POST /ai/agents/writer (TBD)
  file-ops-agent      → POST /ai/agents/file-ops (TBD)
  automation-agent    → POST /ai/agents/automation (TBD)
```

### Workspace Assistant session (`/agents/workspace-assistant/[threadId]`)

```
┌─ Main ────────────────────────────────────────────────┬─ Tool trace ────────┐
│ ← Agents · Workspace Assistant    [+ New task]        │ Step 2 of 4         │
├──────────────┬────────────────────────────────────────┤─────────────────────┤
│ SESSIONS     │  Task conversation                     │ ✓ search_notes      │
│              │                                        │   query: "Q4 budget"│
│ ● Summarize  │  ┌─ You ────────────────────────────┐ │   5 chunks          │
│   workspace  │  │ Create a summary note from my    │ │                     │
│              │  │ Q4 planning docs                 │ │ ▶ create_note       │
│ ○ Tag files  │  └──────────────────────────────────┘ │   title: "Q4 Summary"│
│              │                                        │   running…          │
│              │  ┌─ Assistant ──────────────────────┐ │                     │
│              │  │ I'll search your workspace first…│ │ ○ summarize_workspace│
│              │  └──────────────────────────────────┘ │                     │
│              │                                        │ steps_taken: 2      │
├──────────────┴────────────────────────────────────────┤ tool_calls: 2       │
│ ┌───────────────────────────────────────────────────┐ │ [Expand all]        │
│ │ e.g. Summarize Q4 docs into a new note…     [Run]│ │                     │
└───────────────────────────────────────────────────────┴─────────────────────┘

API: POST /ai/agent/stream { message, thread_id? }
SSE events: token · tool_start · tool_end · done · [DONE]
Response fields: answer, thread_id, steps_taken, tool_calls_made
Tools (current backend): search_notes · create_note · update_note · summarize_workspace
On note mutation: toast + invalidate GET /notes cache
503: same degraded pattern as chat
```

### Agent vs Chat — user-facing distinction

| | **Chat** | **Agent (Assistant)** |
|---|----------|------------------------|
| Nav label | Chat | Agents → Workspace Assistant |
| Speed | Fast RAG | Slower; multi-step |
| Side panel | Citations | Tool trace |
| Can mutate data | No | Yes (notes via tools) |
| Best for | "What does X say?" | "Do X across my workspace" |

---

## Command palette — Workspace search (`⌘K`)

```
┌────────────────────────────────────────────────────────────┐
│ 🔍  Search notes, files, or ask…                          │
├────────────────────────────────────────────────────────────┤
│ RECENT                                                      │
│   📝 Q4 planning                                            │
│   📄 contract.pdf                                           │
│ ────────────────────────────────────────────────────────── │
│ ACTIONS                                                     │
│   + New note                                                │
│   ↑ Upload file                                             │
│   💬 New chat                                               │
│   🤖 Ask agent                                              │
│ ────────────────────────────────────────────────────────── │
│ AI SEARCH (vector)                                          │
│   "budget allocation"  → 3 notes, 1 file     [Open in Chat]│
└────────────────────────────────────────────────────────────┘

API: POST /ai/test-search `{ query_text, limit? }`  (RBAC-filtered, workspace from JWT)
      + local fuzzy search on cached note/file lists
Enter on AI result → prefill Chat with query or open top citation
```

---

## Settings

### Account (`/settings/account`)

```
Profile · email (read-only) · change password (if supported)
Sign out · token revoke
```

### Workspace (`/settings/workspace`) — owner/admin

```
┌─ Main ─────────────────────────────────────────────────────────────────────┐
│ Workspace settings — Acme Corp                                               │
├────────────────────────────────────────────────────────────────────────────┤
│ Name: [ Acme Corp                    ]  [Save]                             │
│                                                                              │
│ Members                                                    [Invite member]   │
│ ┌──────────────┬────────────────┬──────────────┬─────────────────────────┐ │
│ │ Name         │ Email          │ Role         │ Actions                 │ │
│ ├──────────────┼────────────────┼──────────────┼─────────────────────────┤ │
│ │ Niloy        │ niloy@…        │ owner        │ —                       │ │
│ │ Alex         │ alex@…         │ admin ▾      │ Remove                  │ │
│ │ Sam          │ sam@…          │ member ▾     │ Remove                  │ │
│ └──────────────┴────────────────┴──────────────┴─────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────────┘

API: GET/PATCH /workspaces
      GET/POST/PATCH/DELETE /workspaces/members
Role-gated: require_roles("owner", "admin") — hide page from member nav
```

### Automation inbox (`/settings/automation`) — future

Maps to `AutomationDecisionEngine` governance blocks (`[AUTOMATION_GOVERNANCE_BLOCK]`).

```
┌─ Main ─────────────────────────────────────────────────────────────────────┐
│ Automation queue                                      [Pending: 3]         │
├────────────────────────────────────────────────────────────────────────────┤
│ ⚠️ Suggested: Archive duplicate notes "API draft" / "API draft v2"         │
│    Confidence: 0.88 · Destructive: no                                      │
│    [Approve]  [Reject]  [View details]                                     │
│ ─────────────────────────────────────────────────────────────────────────  │
│ 🛑 Blocked: Auto-merge meeting notes (needs review)                        │
│    Confidence: 0.72 · Destructive: yes                                     │
│    [Review manually]                                                       │
└────────────────────────────────────────────────────────────────────────────┘

Backend: not exposed via HTTP yet — placeholder UI for Slice 7.4+ human review
```

---

## System states & banners

### Global AI degradation banner

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ ⚠️ AI features are temporarily unavailable. Notes and files work normally.  │
│    [Retry]  [Status details]                                    [Dismiss ✕]  │
└──────────────────────────────────────────────────────────────────────────────┘

Trigger: GET /health/ai → degraded OR POST /ai/* → 503
Copy: "LLM temporarily unavailable; retry shortly" (matches backend agent route)
```

### Entity processing badges

| Badge | Meaning | API signal |
|-------|---------|------------|
| `⏳ Processing…` | Worker extracting / embedding | no `extracted_text` or empty tags yet |
| `⏳ Indexing…` | Vectors not in Qdrant yet | poll; chat may not cite |
| `✓ Indexed` | Ready for RAG | summary/tags populated |
| `🔒 Private` | `is_private=true` | member-only visibility |

### Rate limit toast

```
Too many requests. Try again in 42s.
Source: 429 + Retry-After header (global 100/min; login 5/min)
```

---

## Responsive summary

| Breakpoint | Shell | Chat / Agent |
|------------|-------|--------------|
| Desktop ≥1280px | 3-column: nav + main + context | Threads + conversation + panel |
| Tablet 768–1279px | Collapsible nav; context as drawer | Threads collapse to dropdown |
| Mobile <768px | Bottom tabs | Full-screen conversation; panel = bottom sheet |

---

## API → screen index

| Screen | Primary endpoints |
|--------|-------------------|
| Login / Register | `POST /auth/login`, `POST /auth/register` |
| Workspace label | `GET /workspaces/me` (read-only at launch) |
| Notes list / editor | `GET/POST/PATCH/DELETE /notes` |
| Notebooks | `GET/POST/PATCH/DELETE /notebooks` |
| Files library / detail | `GET /files`, `POST /files/upload`, download |
| Chat | `GET /ai/threads`, `GET …/messages`, `DELETE …`, `POST /ai/chat/stream` |
| Workspace Assistant | `POST /ai/agent/stream` |
| Cmd-K search | `POST /ai/test-search` + cached lists |
| Members admin | `GET/POST/PATCH/DELETE /workspaces/members` |
| Health indicators | `GET /health`, `GET /health/ai` (optional) |

---

## Implementation order (matches wireframes)

1. **Shell + auth** — login, workspace context, nav, degradation banner  
2. **Notes + notebooks** — core CRUD, tags, privacy, indexing badges  
3. **Files** — upload, list, detail, processing poll  
4. **Chat** — threads, SSE stream, citations panel  
5. **Agents hub** — assistant live; placeholder cards for future agents  
6. **Workspace Assistant** — tool trace panel, session list  
7. **Cmd-K** — test-search + actions  
8. **Settings** — members/RBAC  
9. **Automation inbox** — when backend exposes review queue  

---

## Related docs

| Doc | Content |
|-----|---------|
| `docs/backendapi.md` | Full backend routes, AI slices, RBAC |
| `docs/backend-frontend-contract.md` | Auth, indexing, automation — frontend ↔ backend integration spec |
| `docs/frontend-stack.md` | Libraries, patterns, folder structure, build order |
| `docs/primary-blueprint.md` | Phased build plan — what to ship in each phase |
| `docs/wireframes.md` | This file — UI layouts and API mapping |

---

*Last updated: wireframes v1 — multi-agent hub includes Workspace Assistant (live) + Research, Writer, File Ops, Automation (planned).*
