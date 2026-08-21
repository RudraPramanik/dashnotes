# client-ops Specification

## Purpose
TBD - created by archiving change bootstrap-app-context. Update Purpose after archive.
## Requirements
### Requirement: Indexing lag UX
After note create/update or file upload, the UI MUST account for background embedding/automation delay. The UI MUST present an indexing or pending state where appropriate and MUST NOT treat temporary RAG misses as a permanent AI outage. Until OpenAPI includes `indexing_status` (and optional `indexed_at`) on notes/files, the client MUST implement this UX without that field (time-based pending state, list refresh, and/or copy that indexing may take tens of seconds). The client MUST NOT infer indexing completion solely from empty `tags`.

#### Scenario: Fresh upload not yet searchable
- **WHEN** a file was uploaded seconds ago and RAG returns no hits for that content
- **THEN** the UI MUST allow for indexing lag (message and/or status) rather than only showing a generic hard failure

#### Scenario: Status field not in schema
- **WHEN** note or file JSON has no `indexing_status` property
- **THEN** CRUD and detail views MUST still load
- **AND** MUST NOT poll a missing field as if it were required

### Requirement: Rate limit visibility
On HTTP `429`, the client MUST surface a clear wait message and honor `Retry-After` when present. Silent tight retry loops without backoff are forbidden.

#### Scenario: Login rate limited
- **WHEN** `POST /auth/login` returns `429`
- **THEN** the user MUST see a visible rate-limit message

### Requirement: AI unavailable visibility
On AI `503` (or SSE `type: "error"` for AI streams), the UI MUST show a calm user-visible message that AI is temporarily unavailable. Core CRUD surfaces MAY continue to work when AI is degraded.

#### Scenario: LLM down during chat
- **WHEN** chat/agent returns `503` or an SSE error for LLM unavailability
- **THEN** the UI MUST display the failure to the user
- **AND** MUST NOT fail the entire app shell solely because AI is down

### Requirement: API base and CORS awareness
The frontend MUST use `NEXT_PUBLIC_API_BASE_URL` for the API origin only (no long-lived secrets in `NEXT_PUBLIC_*`). Local/prod CORS must allow the frontend origin; agents diagnosing browser blocks MUST consider CORS misconfiguration before blaming application logic.

#### Scenario: Browser blocks API calls
- **WHEN** the API is healthy but the browser blocks requests
- **THEN** troubleshooting MUST include verifying frontend origin against backend `CORS_ORIGINS`

### Requirement: Streaming proxy buffering
Chat/agent streams rely on non-buffered SSE (`Cache-Control: no-cache`, `X-Accel-Buffering: no`). If tokens arrive in one burst, diagnosis MUST include proxy buffering as well as React state updates.

#### Scenario: Tokens arrive as a single burst
- **WHEN** streamed tokens appear all at once instead of incrementally
- **THEN** the team MUST check proxy buffering configuration in addition to client rendering

### Requirement: Optional AI health endpoint
The client MAY call `GET /health/ai` when present. A `404` MUST NOT be treated as an application error; the UI MUST hide or omit the AI health indicator and MAY infer degradation from `/ai/*` `503` or SSE `type: "error"` instead. Core CRUD MUST remain usable when this endpoint is absent.

#### Scenario: Health AI not deployed
- **WHEN** `GET /health/ai` returns `404`
- **THEN** the client MUST NOT block the app shell or notes/files surfaces
- **AND** MUST NOT surface the 404 as a generic fatal error

#### Scenario: Other environment without health/ai
- **WHEN** `GET /health/ai` returns `404` on an environment other than the Docker stack whose OpenAPI lists the route
- **THEN** the shell MUST still render
- **AND** MUST infer AI problems from `/ai/*` `503` or SSE errors

### Requirement: Public API origin env
The client MUST document and use a single public API origin variable matching the backend frontend guide (`NEXT_PUBLIC_API_BASE_URL`). If existing code uses `NEXT_PUBLIC_API_URL`, docs and runtime MUST alias or migrate so agents do not split origin configuration. No long-lived secrets SHALL appear in `NEXT_PUBLIC_*`.

#### Scenario: Local API calls
- **WHEN** the Next.js app calls the FastAPI backend in local Compose
- **THEN** the origin MUST resolve to the documented API base (typically `http://127.0.0.1`)
- **AND** MUST NOT require a second undocumented public env for the same origin

### Requirement: E2E respects indexing lag
Automated tests and UI MUST wait or retry for a short window after note create or file upload before concluding RAG cannot find the content. They MUST NOT require `indexing_status` unless OpenAPI lists it on the note/file schema.

#### Scenario: Playwright after upload
- **WHEN** a B-gate test uploads a file and then asks Chat
- **THEN** the test MUST allow tens of seconds of lag
- **AND** MUST NOT treat an immediate empty citation list as a hard product failure
