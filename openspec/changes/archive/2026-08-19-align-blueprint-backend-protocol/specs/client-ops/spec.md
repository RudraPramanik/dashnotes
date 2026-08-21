## ADDED Requirements

### Requirement: Optional AI health endpoint
The client MAY call `GET /health/ai` when present. A `404` MUST NOT be treated as an application error; the UI MUST hide or omit the AI health indicator and MAY infer degradation from `/ai/*` `503` or SSE `type: "error"` instead. Core CRUD MUST remain usable when this endpoint is absent.

#### Scenario: Health AI not deployed
- **WHEN** `GET /health/ai` returns `404`
- **THEN** the client MUST NOT block the app shell or notes/files surfaces
- **AND** MUST NOT surface the 404 as a generic fatal error

### Requirement: Public API origin env
The client MUST document and use a single public API origin variable matching the backend frontend guide (`NEXT_PUBLIC_API_BASE_URL`). If existing code uses `NEXT_PUBLIC_API_URL`, docs and runtime MUST alias or migrate so agents do not split origin configuration. No long-lived secrets SHALL appear in `NEXT_PUBLIC_*`.

#### Scenario: Local API calls
- **WHEN** the Next.js app calls the FastAPI backend in local Compose
- **THEN** the origin MUST resolve to the documented API base (typically `http://127.0.0.1`)
- **AND** MUST NOT require a second undocumented public env for the same origin

## MODIFIED Requirements

### Requirement: Indexing lag UX
After note create/update or file upload, the UI MUST account for background embedding/automation delay. The UI MUST present an indexing or pending state where appropriate and MUST NOT treat temporary RAG misses as a permanent AI outage. Until OpenAPI includes `indexing_status` (and optional `indexed_at`) on notes/files, the client MUST implement this UX without that field (time-based pending state, list refresh, and/or copy that indexing may take tens of seconds). The client MUST NOT infer indexing completion solely from empty `tags`.

#### Scenario: Fresh upload not yet searchable
- **WHEN** a file was uploaded seconds ago and RAG returns no hits for that content
- **THEN** the UI MUST allow for indexing lag (message and/or status) rather than only showing a generic hard failure

#### Scenario: Status field not in schema
- **WHEN** note or file JSON has no `indexing_status` property
- **THEN** CRUD and detail views MUST still load
- **AND** MUST NOT poll a missing field as if it were required
