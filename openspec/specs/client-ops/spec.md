# client-ops Specification

## Purpose
TBD - created by archiving change bootstrap-app-context. Update Purpose after archive.
## Requirements
### Requirement: Indexing lag UX
After note create/update or file upload, the UI MUST account for background embedding/automation delay. The UI MUST present an indexing or pending state where appropriate and MUST NOT treat temporary RAG misses as a permanent AI outage.

#### Scenario: Fresh upload not yet searchable
- **WHEN** a file was uploaded seconds ago and RAG returns no hits for that content
- **THEN** the UI MUST allow for indexing lag (message and/or status) rather than only showing a generic hard failure

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

