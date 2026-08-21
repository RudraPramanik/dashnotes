## ADDED Requirements

### Requirement: Conversation chrome for chat and agent
Chat and Agent MUST remain separate modes and MUST share conversation chrome: a centered message column, a slim thread/session rail labeled as the current user's conversations, a sticky composer, and the ContextPanel slot (Sources on chat, Tools on agent). Mode MUST be chosen by navigation, not by a model-picker control. "Ask about this note/file" MUST prefill the composer message only; the request body MUST remain `{ message, thread_id? }` per OpenAPI.

#### Scenario: Shared chrome, separate endpoints
- **WHEN** the user sends a message from Chat
- **THEN** the client MUST call `/ai/chat/stream`
- **WHEN** the user sends a message from Agent
- **THEN** the client MUST call `/ai/agent/stream`
- **AND** both surfaces MUST use the conversation column + composer layout

### Requirement: Citation chips plus sources panel
After a chat `metadata` event, the UI MUST show citation chips on the assistant message and list the same citations in the Sources panel. Display fields MUST be OpenAPI citation fields (`note_id`, `chunk_id`, `title`, `relevance_score`). The UI MUST NOT require `excerpt` or `source_id`. Clicking a citation with `note_id` MUST navigate to that note.

#### Scenario: User opens a source
- **WHEN** the user activates a citation chip that includes `note_id`
- **THEN** the client MUST open the corresponding note detail
- **AND** MUST NOT fail if `excerpt` is absent

### Requirement: Inline tool blocks plus tools panel
On agent `tool_start` the UI MUST show an in-progress tool block in the transcript and in the Tools panel. On `tool_end` those blocks MUST show a finished state. After `done`, when tools may have mutated notes, the client MUST refresh notes list data and MAY toast that a note was created or updated. Agent MUST show a persistent hint that it can create and edit notes. The client MUST NOT show a confirm dialog that the API does not enforce.

#### Scenario: Agent creates a note
- **WHEN** an agent stream completes with `done` after note-mutating tools
- **THEN** the notes list MUST refresh
- **AND** the user MUST see that a tool ran (name and finished state)

### Requirement: Agent 503 suggests chat
On agent HTTP `503` or SSE `type: "error"` for unavailability, the UI MUST show a calm message and MUST offer falling back to Chat without replacing the Agent destination.

#### Scenario: LLM down on agent
- **WHEN** Agent returns `503` or an SSE error for LLM unavailability
- **THEN** the user MUST see a visible failure
- **AND** MUST be able to navigate to Chat
