## ADDED Requirements

### Requirement: Shared indexing poll hook
Notes and files indexing UI MUST share a single client hook (`useIndexingPoll`) that derives TanStack Query `refetchInterval` from API `indexing_status` (via `shouldPoll`) and enforces a default ~180s polling timeout with `pollingExceeded` and `resetPoll`. Feature hooks (`use-note`, `use-file`) MUST call this hook and MUST NOT reimplement the timeout constant or timing `useRef` logic locally. `IndexingStatus` MUST come from `lib/api/types.ts` after the type gate.

#### Scenario: Note and file hooks delegate
- **WHEN** `use-note.ts` and `use-file.ts` implement indexing polling
- **THEN** both MUST call `useIndexingPoll`
- **AND** neither MUST embed its own `180_000` / `180000` timeout constant

### Requirement: Note editor composed from strict-prop leaves
The note editor MUST be composed of single-purpose leaf components (title field, body/Tiptap, privacy toggle, actions menu) plus a thin `NoteEditor` composition root. Leaf components MUST accept primitive and callback props only and MUST NOT import `useNoteMutations`, `apiClient`, or otherwise own network/mutation concerns. Debounce timers MUST live in the component that owns the debounced value. `NoteEditor` is the only editor component that MAY call note mutations and own the combined save-state indicator.

#### Scenario: Title leaf isolation
- **WHEN** `NoteTitleField` saves a title
- **THEN** it MUST call an `onSave` callback after its own debounce
- **AND** it MUST NOT import mutation hooks or `apiClient`

### Requirement: Feature-owned context panel content
Citation, tool-trace, note-outline, and file-meta panels MUST receive their data from the owning feature hook or page props, not from the shell store. Pages MUST compose those panels as `ContextPanel` children per `shell-composition`.

#### Scenario: Agent tool trace
- **WHEN** the agent page displays tool events from `useAgentStream`
- **THEN** those events MUST be passed as props into `ToolTracePanel` inside `ContextPanel`
- **AND** the shell store MUST NOT hold `toolTrace` state
