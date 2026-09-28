## 1. Shell honesty and context sheet slot

- [x] 1.1 Hide or remove the AppHeader hamburger below `md` so primary nav is only BottomTabBar (no dead `sidebarOpen` control)
- [x] 1.2 Add `components/shell/ContextSheet.tsx` as a named-export slot (`children` only) using existing shadcn Sheet `side="bottom"`, gated for viewports below `lg`, driven by shell `contextPanelOpen` / open-close actions — no citation or tool-trace data in the store
- [x] 1.3 Wire ContextSheet beside ContextPanel usage on Chat and Agent pages so the same Sources/Tools children render in panel (`lg+`) or sheet (`<lg`); keep layout ContextPanel slot for Notes/Files unchanged in behavior

## 2. Chat / Agent rail collapse

- [x] 2.1 Update `ThreadList` so the persistent `w-60` rail is `hidden md:flex` (or equivalent) and expose the list body for a mobile Sheet opened from Chat chrome ("Conversations"); close on thread select / New; ensure rename/delete work without hover-only affordances in the sheet
- [x] 2.2 Update `SessionList` the same way for Agent ("Sessions")
- [x] 2.3 Update Chat pages (`app/(app)/chat/page.tsx`, `[threadId]/page.tsx`) for full-width conversation below `md`, thread sheet trigger, Sources sheet trigger when citations exist, and height/flex so the composer clears the bottom tab bar
- [x] 2.4 Update Agent pages (`agents/[agentSlug]/page.tsx`, `[threadId]/page.tsx`) likewise for sessions sheet, Tools sheet, ApprovalCard, and composer clearance

## 3. Validate

- [x] 3.1 Manual or Playwright check at ~390×844: Chat and Agent composers usable; thread/session sheet works; Sources/Tools reachable; bottom tabs intact; hamburger absent or functional
- [x] 3.2 Run `pnpm build` (or project typecheck) and fix any TypeScript / named-export / `any` regressions from this change
- [x] 3.3 Optionally sync `docs/wireframes.md` responsive summary if shipped behavior needs a one-line clarification; do not expand scope into Notes/Files redesign
