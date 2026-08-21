# ai-modes Specification

## Purpose
TBD - created by archiving change bootstrap-app-context. Update Purpose after archive.
## Requirements
### Requirement: Separate chat and agent modes
The product MUST expose Fast RAG chat and LangGraph agent as two distinct UI modes (routes or clearly labeled tabs). Chat uses `/ai/chat` and `/ai/chat/stream`; agent uses `/ai/agent` and `/ai/agent/stream`. One mode MUST NOT replace the other.

#### Scenario: User chooses agent
- **WHEN** the user opens the agent experience
- **THEN** the client MUST call agent endpoints (not chat)
- **AND** the chat experience MUST remain available separately

### Requirement: RAG chat streaming and citations
For `POST /ai/chat/stream`, the client MUST parse SSE `data:` lines and: if the payload is the literal `[DONE]`, close the reader; otherwise parse JSON and switch on `type`. The client MUST append non-empty `content` when `type` is `token`; render citations only from the event with `type` `metadata`; show `type` `error` to the user. The client MUST use `fetch` + ReadableStream (POST + Bearer), not EventSource. The client MUST NOT treat the SSE `event:` field as the discriminator unless OpenAPI documents named events (the live API defaults that field to unused / `message`).

#### Scenario: Grounded answer with sources
- **WHEN** a chat stream completes with a `data:` JSON object `{ "type": "metadata", "citations": [...] }`
- **THEN** the UI MUST render those citations as sources
- **AND** MUST NOT scrape citation data from token text

#### Scenario: Token frames without named SSE events
- **WHEN** the server sends `data: {"type":"token","content":"..."}` with no `event:` line
- **THEN** the client MUST still append `content` to the answer

### Requirement: Threads sidebar
The client MUST support listing threads (`GET /ai/threads`), loading messages (`GET /ai/threads/{id}/messages`), soft-deleting (`DELETE /ai/threads/{id}`), and continuing conversations by passing returned `thread_id` into chat/agent requests.

#### Scenario: Continue prior chat
- **WHEN** the user selects an existing thread and sends a new message
- **THEN** the client MUST include that `thread_id` in the chat/agent request body

### Requirement: Agent tool timeline
For agent SSE (`POST /ai/agent/stream`), the UI MUST handle JSON `type` values `token`, `tool_start`, `tool_end`, `done`, and `error` inside `data:` lines, then close on literal `[DONE]`. After `done` when tools may have mutated notes, the client SHOULD refresh notes list data. On agent failure / 503, the UI MUST show a user-visible message and MAY suggest falling back to chat.

#### Scenario: Tool execution visible
- **WHEN** the agent stream emits `{"type":"tool_start",...}` then `{"type":"tool_end",...}`
- **THEN** the UI MUST show that a tool ran (name and finished state)

### Requirement: AI tenancy from JWT only
All AI routes require Bearer auth. The client MUST NOT send `workspace_id`, `user_id`, or `role` in AI request bodies to override JWT claims.

#### Scenario: Chat request body
- **WHEN** the client sends a chat or agent request
- **THEN** the body MUST be limited to message content and optional `thread_id` (per OpenAPI)
- **AND** MUST NOT include a client-chosen workspace override field

### Requirement: Diagnostic search uses POST
When the client performs AI diagnostic or command-palette retrieval via `/ai/test-search`, it MUST `POST` a JSON body `{ "query_text": "...", "limit": <optional> }` per OpenAPI. The client MUST NOT call `GET /ai/test-search` with query-string `q`.

#### Scenario: Palette AI search
- **WHEN** the user runs workspace AI search from the command palette
- **THEN** the client MUST POST `{ query_text, limit? }` to `/ai/test-search` with Bearer auth
- **AND** MUST treat this as non-primary product UI (RAG chat remains the primary Q&A surface)

### Requirement: Citation fields from OpenAPI
Citation objects rendered from chat `metadata` MUST use the fields defined by OpenAPI / the backend frontend guide (typical: `note_id`, `chunk_id`, `title`, `relevance_score`). The client MUST NOT require blueprint-invented citation fields such as `source_id` or `excerpt` unless OpenAPI lists them.

#### Scenario: Metadata citations render
- **WHEN** a chat stream `metadata` payload includes citations in the OpenAPI shape
- **THEN** the UI MUST display those sources (title and navigation to the note when `note_id` is present)
- **AND** MUST NOT fail the stream solely because `source_id` or `excerpt` is absent
