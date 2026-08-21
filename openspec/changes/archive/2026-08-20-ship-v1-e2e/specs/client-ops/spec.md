## ADDED Requirements

### Requirement: E2E respects indexing lag
Automated tests and UI MUST wait or retry for a short window after note create or file upload before concluding RAG cannot find the content. They MUST NOT require `indexing_status` unless OpenAPI lists it on the note/file schema.

#### Scenario: Playwright after upload
- **WHEN** a B-gate test uploads a file and then asks Chat
- **THEN** the test MUST allow tens of seconds of lag
- **AND** MUST NOT treat an immediate empty citation list as a hard product failure

### Requirement: Health AI optional even if listed here
This Docker OpenAPI lists `GET /health/ai`. The client MAY use it. A `404` or missing route on another environment MUST NOT fail the shell. CRUD MUST remain usable when AI is degraded.

#### Scenario: Other environment without health/ai
- **WHEN** `GET /health/ai` returns `404`
- **THEN** the shell MUST still render
- **AND** MUST infer AI problems from `/ai/*` `503` or SSE errors
