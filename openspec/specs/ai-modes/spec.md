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
For `POST /ai/chat/stream`, the client MUST parse SSE events and: append non-empty `token` content to the answer; render citations only from the `metadata` event; show `error` events to the user; close on `data: [DONE]`. The client MUST use `fetch` + ReadableStream (POST + Bearer), not EventSource.

#### Scenario: Grounded answer with sources
- **WHEN** a chat stream completes with a `metadata` event containing citations
- **THEN** the UI MUST render those citations as sources
- **AND** MUST NOT scrape citation data from token text

### Requirement: Threads sidebar
The client MUST support listing threads (`GET /ai/threads`), loading messages (`GET /ai/threads/{id}/messages`), soft-deleting (`DELETE /ai/threads/{id}`), and continuing conversations by passing returned `thread_id` into chat/agent requests.

#### Scenario: Continue prior chat
- **WHEN** the user selects an existing thread and sends a new message
- **THEN** the client MUST include that `thread_id` in the chat/agent request body

### Requirement: Agent tool timeline
For agent SSE, the UI MUST handle `token`, `tool_start`, `tool_end`, `done`, and `error` events. After `done` when tools may have mutated notes, the client SHOULD refresh notes list data. On agent failure / 503, the UI MUST show a user-visible message and MAY suggest falling back to chat.

#### Scenario: Tool execution visible
- **WHEN** the agent stream emits `tool_start` then `tool_end`
- **THEN** the UI MUST show that a tool ran (name and finished state)

### Requirement: AI tenancy from JWT only
All AI routes require Bearer auth. The client MUST NOT send `workspace_id`, `user_id`, or `role` in AI request bodies to override JWT claims.

#### Scenario: Chat request body
- **WHEN** the client sends a chat or agent request
- **THEN** the body MUST be limited to message content and optional `thread_id` (per OpenAPI)
- **AND** MUST NOT include a client-chosen workspace override field

