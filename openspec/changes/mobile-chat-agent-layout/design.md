## Context

See `proposal.md` for why. Product UI is live after `ship-v1-e2e`: BottomTabBar exists (`md:hidden`), AppSidebar is `hidden md:flex`, ContextPanel is `hidden lg:block`, but Chat/Agent still always render `w-60` ThreadList/SessionList. Header hamburger toggles `sidebarOpen` that AppSidebar never reads. Architecture v3: ContextPanel is a **slot** (`{ children }` only); shell Zustand is chrome flags only — never citation or tool-trace data. shadcn `Sheet` is already installed. Wireframes (`docs/wireframes.md`) already specify: mobile = full-screen conversation + context bottom sheet; tablet = threads collapse.

## Goals / Non-Goals

**Goals:**

- Usable Chat/Agent on &lt;768px without changing routes or APIs.
- Slot-compatible mobile context (same children as ContextPanel).
- Honest mobile nav (tabs win; no dead hamburger).
- Prefer CSS breakpoint classes; add `useMediaQuery` only if sheet open-state needs it.

**Non-Goals:**

- Redesigning Notes/Files.
- New packages.
- Hoisting Sources/Tools into shell store (forbidden by AGENTS.md / update_blueprint).
- Perfect tablet polish beyond collapsing the rail at `md`.

## Decisions

### 1. Collapse rails with CSS + Sheet, not a new route
**Choice:** Below `md`, hide the persistent `w-60` rail. Expose the same list UI inside a left/top Sheet opened from a header control in the conversation chrome ("Conversations" / "Sessions"). Close on navigate/New.
**Why:** Keeps list logic in ThreadList/SessionList; matches wireframes; no new routes.
**Alternative:** Separate `/chat/threads` route — more navigation churn for v1.

### 2. ContextSheet is a slot twin of ContextPanel
**Choice:** Add `ContextSheet` (or shared wrapper) that accepts `{ children }` like ContextPanel. Pages keep composing `<ContextPanel>…</ContextPanel>` and `<ContextSheet>…</ContextSheet>` with the same Sources/Tools children (or one component that renders panel on `lg+` and sheet trigger below). Open via chrome flag `contextPanelOpen` and/or an explicit "Sources"/"Tools" control when content exists.
**Why:** Preserves ContextPanel-as-slot; avoids 2.10's obsolete plan to read `contextPanelContent` from the store.
**Alternative:** Shell switch importing CitationPanel/ToolTracePanel — rejected (AGENTS.md).

### 3. Hamburger: remove on mobile
**Choice:** Hide the header Menu button below `md` (or remove it entirely). BottomTabBar is the primary nav.
**Why:** Wiring a full sidebar sheet duplicates tabs; dead control is worse than none.
**Alternative:** Sidebar sheet with workspace label + settings — deferred if tabs prove enough.

### 4. Height / composer clearance
**Choice:** Keep `pb-14 md:pb-0` on the shell content wrapper; ensure Chat/Agent height calc includes header + tab bar (prefer `100dvh` minus known chrome, or flex column `min-h-0` so the composer sits in-flow above tabs). Fix crushed sticky composer as part of full-width layout.
**Why:** Current `h-[calc(100dvh-8rem)]` plus padding is brittle once the rail is gone.
**Alternative:** Fixed composer over tabs with extra `pb` — acceptable if flex proves awkward.

### 5. Breakpoints
**Choice:** Rail collapse at `md` (&lt;768). Context sheet vs panel at `lg` (&lt;1024), matching today's ContextPanel hide.
**Why:** Aligns with existing Tailwind usage and wireframes mobile/tablet split.
**Alternative:** Single `md` for both — would show empty 280px gap on tablet if panel stays hidden until `lg`.

## Risks / Trade-offs

- [Duplicate list markup for rail vs sheet] → Extract shared list body; thin wrappers for rail vs sheet chrome.
- [Two ContextPanel instances — layout empty + page-filled] → Prefer page-composed panel/sheet only on Chat/Agent; leave layout slot for Notes/Files as today; do not invent shell content store.
- [Sheet + bottom tabs z-index fight] → Use existing Sheet z-index; verify composer and tabs under overlay.
- [Hover-only rename/delete on threads] → Ensure mobile has non-hover affordances (long-press optional later; at minimum overflow menu or always-visible icon buttons in the sheet).

## Migration Plan

1. Implement rail collapse + thread/session sheet on Chat/Agent pages.
2. Add ContextSheet slot usage on Chat/Agent; keep desktop ContextPanel.
3. Remove/hide dead hamburger; verify BottomTabBar.
4. Manual check at 390×844 (and optional Playwright viewport smoke).
5. Rollback: revert UI files; specs archive only after apply.

## Open Questions

None that block implementation. Trigger copy ("Sources" vs icon) can be tuned during apply without changing requirements.
