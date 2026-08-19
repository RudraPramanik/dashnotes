## Purpose

Defines how DashNotes planning documents relate to the live FastAPI protocol so agents can follow `final-blueprint.md` without inventing routes or JSON shapes that the backend does not implement.

## ADDED Requirements

### Requirement: Document precedence for API behavior
When planning or implementing client integration, the system SHALL treat sources in this order for API behavior: (1) OpenAPI at `{API_BASE}/docs` for request/response field lists, (2) the synced backend frontend guide (`docs/backendGuide.md`, kept aligned with `dashnotesystemv1/docs/documentation/frontendguide.md`) for UX/API laws (SSE, tenancy, errors, CORS), (3) `docs/final-blueprint.md` plus `docs/update_blueprint.md` for session order, file paths, and architecture patches. A lower-precedence source MUST NOT override a higher one on routes, methods, or JSON fields.

#### Scenario: Blueprint disagrees with OpenAPI
- **WHEN** a blueprint step names a path, method, or field that OpenAPI does not list
- **THEN** implementers MUST follow OpenAPI (and the backend frontend guide for SSE/tenancy laws)
- **AND** MUST NOT ship a client call that matches only the blueprint text

### Requirement: Wishlist contract vs live protocol
`docs/backend-frontend-contract.md` MAY list desired backend fields or routes that are not yet in OpenAPI. The client MUST NOT require those fields or routes for core notes, files, auth, chat, agent, or threads flows until OpenAPI lists them. Wishlist items MUST be labeled as deferred and MUST degrade or no-op if absent.

#### Scenario: Unshipped indexing_status
- **WHEN** OpenAPI note/file schemas do not include `indexing_status`
- **THEN** the client MUST still present indexing-lag UX per the backend frontend guide
- **AND** MUST NOT treat missing `indexing_status` as an integration failure that blocks CRUD or chat

### Requirement: Architecture patch still applies
Architecture corrections in `docs/update_blueprint.md` (shared 401 retry helper, chrome-only shell store, Server Component app layout, ContextPanel as a slot, OpenAPI type gate before Phase 3, shared indexing poll when a status field exists) SHALL remain in force for listed steps. Unlisted steps remain in `docs/final-blueprint.md` except where this protocol override applies.

#### Scenario: Phase 2 shell vs v2 prompt
- **WHEN** an agent implements a step that `docs/update_blueprint.md` revises
- **THEN** the agent MUST use the v3 patch text for that step
- **AND** MUST still obey protocol precedence for any API mentioned in that step
