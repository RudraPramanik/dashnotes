# playbook-protocol Specification

## Purpose

Defines how DashNotes planning documents relate to the live FastAPI protocol so agents can follow `final-blueprint.md` without inventing routes or JSON shapes that the backend does not implement.

## Requirements

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

### Requirement: V1 E2E program may span phases
When implementing change `ship-v1-e2e`, agents MUST follow `openspec/changes/ship-v1-e2e/tasks.md` slice order through B-gate (remaining Phase 1, shell, notes/files, chat, agent, Playwright). Session files `docs/steps/P*.md` and `docs/update_blueprint.md` remain the file-level prompts inside each slice. Chrome MUST follow `lock-v1-ui-contract`. Agents MUST NOT skip steps 1.7–1.11. Agents MUST NOT treat Phase 1 exit as the product exit.

#### Scenario: Apply this change
- **WHEN** an agent implements `ship-v1-e2e`
- **THEN** it MUST continue past Phase 1 into shell and B-gate features in task order
- **AND** MUST still complete stream guard, API stubs, middleware, login, and register before the shell

### Requirement: Playwright B-gate is the product exit
This change MUST NOT be marked complete until the Playwright B-gate spec has been run against Docker (or AI `503` is handled per `e2e-playwright`) and `docs/BUILD.md` lists B1–B6 as Implemented. Production TLS (B7) MUST remain backlog.

#### Scenario: Notes work but chat untested
- **WHEN** notes CRUD exists but the B-gate Playwright spec has not been run
- **THEN** this change MUST NOT be marked complete
