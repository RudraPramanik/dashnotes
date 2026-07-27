## ADDED Requirements

### Requirement: App shell is a Server Component composition root
`app/(app)/layout.tsx` MUST remain a Server Component (no `"use client"` directive and no React hook calls). Session-wide side-effect hooks MUST live in a dedicated client leaf (`AppShellEffects`) that renders null. Interactive chrome (banners, toggles, menus, palette) MUST be isolated client leaves composed by the layout. `GlobalErrorBoundary` MUST NOT be re-wrapped in the app layout (root layout only). `AiErrorBoundary` MUST wrap only the context panel region.

#### Scenario: Authenticated layout boundary
- **WHEN** an agent or developer inspects `app/(app)/layout.tsx`
- **THEN** the file MUST NOT contain `"use client"` or direct calls to `useAutomationNotifications` / `useAiHealth`
- **AND** it MUST render `AppShellEffects` exactly once for the authenticated session

### Requirement: Shell store holds chrome visibility only
The shell Zustand store MUST hold only layout/chrome presence flags (e.g. sidebar, context panel open, command palette). It MUST NOT store feature or domain payloads such as `contextPanelContent`, `citationData`, `toolTrace`, or server entities owned by TanStack Query.

#### Scenario: Feature data rejected from shell store
- **WHEN** a later step suggests adding citations or tool-trace arrays to `shell-store.ts`
- **THEN** that change MUST be rejected
- **AND** the data MUST remain in the owning feature hook and flow via props/children

### Requirement: ContextPanel is a pure layout slot
`ContextPanel` MUST accept optional `children`, read only open/close chrome state from the shell store, and render an aside when open and children are present. It MUST NOT import from `components/notes`, `components/files`, `components/chat`, or `components/agents`. Feature pages MUST open/close the panel and supply their own panel content as children.

#### Scenario: Chat citations panel
- **WHEN** the chat thread page shows citations from `useChatStream`
- **THEN** it MUST render `<ContextPanel><CitationPanel citations={citations} /></ContextPanel>` (or equivalent children composition)
- **AND** `ContextPanel.tsx` MUST NOT contain a switch/case that imports `CitationPanel`
