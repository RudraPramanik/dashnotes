## ADDED Requirements

### Requirement: Narrow-viewport conversation chrome
Chat and Agent MUST keep separate modes and shared conversation chrome on all viewports. Below the `md` breakpoint, the centered message column and sticky composer MUST remain usable at full available width. The ContextPanel slot semantics MUST remain: Sources on Chat from `metadata` citations, Tools on Agent from `tool_start` / `tool_end` / `done`. When the desktop ContextPanel is hidden, that slot content MUST still be reachable (sheet or equivalent) without moving citation or tool-trace data into the shell store.

#### Scenario: Mobile chat still uses chat stream
- **WHEN** the user sends a message from Chat on a narrow viewport
- **THEN** the client MUST call `/ai/chat/stream`
- **AND** the conversation column and composer MUST remain usable

#### Scenario: Mobile agent still uses agent stream
- **WHEN** the user sends a message from Agent on a narrow viewport
- **THEN** the client MUST call `/ai/agent/stream`
- **AND** Sources/Tools semantics MUST still apply via the page-composed slot (panel or sheet)

### Requirement: Thread listing presentation may adapt by viewport
The client MUST continue to support listing threads (`GET /ai/threads`), loading messages, soft-delete, rename, and continuing via `thread_id`. Below `md`, the presentation of the thread/session list MAY be an overlay or picker instead of a persistent side rail, provided all list actions remain available.

#### Scenario: Continue prior chat from mobile list
- **WHEN** the user selects an existing thread from the mobile thread list and sends a new message
- **THEN** the client MUST include that `thread_id` in the chat/agent request body
