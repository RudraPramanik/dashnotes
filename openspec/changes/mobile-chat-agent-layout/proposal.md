## Why

Chat and Agent are unusable on phone-width viewports: the always-visible `w-60` thread/session rail leaves ~100px for the conversation column, crushing the composer. Sources/Tools live only in a desktop `ContextPanel` (`hidden lg:block`) with no mobile equivalent, and the header hamburger toggles unused shell state. `docs/wireframes.md` and playbook step 2.10 already describe bottom tabs + context sheet + collapsing rails — BottomTabBar shipped, the rest did not. Fix now so v1 conversation chrome works on mobile without inventing new IA.

## What Changes

- Collapse Chat `ThreadList` and Agent `SessionList` below `md` into an overlay (sheet) so the conversation column is full-width.
- Add a slot-based mobile context surface (bottom sheet) for Chat Sources and Agent Tools — same children pages already compose into `ContextPanel`; no shell feature switch.
- Keep the sticky composer usable above the bottom tab bar (viewport height / padding).
- Fix or remove the dead mobile hamburger (bottom tabs already own primary nav).
- Align `docs/wireframes.md` responsive summary with shipped behavior if wording drifts.

**Non-goals**

- Notes/Files density redesign (out of scope unless blocked by the same shell bug).
- Tablet thread dropdown polish beyond a workable `md` breakpoint (MAY follow wireframes lightly).
- New packages, fonts, or API routes.
- Agent marketplace, workspace switcher, or other deferred chrome.
- Putting citation/tool data into the Zustand shell store.

## Capabilities

### New Capabilities

- `mobile-responsive-shell`: Narrow-viewport shell and conversation layout — collapsing thread/session rails, slot-based context sheet, composer clearance above bottom tabs, hamburger behavior.

### Modified Capabilities

- `ai-modes`: Conversation chrome MUST remain usable on narrow viewports; thread/session listing MAY use a non-persistent rail (sheet/picker) below desktop breakpoints; Sources/Tools MUST remain reachable when ContextPanel is hidden.

## Impact

- **UI:** `components/chat/ThreadList.tsx`, `components/agents/SessionList.tsx`, chat/agent pages, `components/shell/ContextPanel.tsx` (+ new ContextSheet or equivalent slot wrapper), `AppHeader` / `AppSidebar` / `(app)/layout.tsx`, possibly `MessageInput` / `AgentInput` sticky spacing.
- **Hooks:** MAY add SSR-safe `useMediaQuery` if needed for sheet open state (CSS-first preferred).
- **Docs:** Optional wireframes responsive line sync.
- **API:** None — OpenAPI and SSE contracts unchanged.
- **Deps:** Existing shadcn `Sheet` only; no new installs.
