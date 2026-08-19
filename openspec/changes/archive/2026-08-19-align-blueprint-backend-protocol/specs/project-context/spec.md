## ADDED Requirements

### Requirement: Protocol-aware doc map
OpenSpec and agent context MUST identify OpenAPI and `docs/backendGuide.md` as the API/UX contract, `docs/final-blueprint.md` as the implementation playbook, and `docs/update_blueprint.md` as architecture overrides for listed steps. `docs/backend-frontend-contract.md` MUST be described as an integration wishlist plus auth refresh rules, not as live field lists when those fields are absent from OpenAPI.

#### Scenario: Agent drafts a later-phase prompt
- **WHEN** an agent creates or updates an implementation artifact that calls the API
- **THEN** it MUST cite OpenAPI / `docs/backendGuide.md` for paths and JSON
- **AND** MUST NOT treat `docs/final-blueprint.md` alone as sufficient for wire format

## MODIFIED Requirements

### Requirement: OpenSpec project identity
OpenSpec MUST identify this repository as the DashNotes Next.js frontend for the DashNoteSystem FastAPI backend, and MUST surface stack, doc map, and phase workflow to agents creating artifacts.

#### Scenario: Agent drafts a proposal
- **WHEN** an agent creates or updates an OpenSpec artifact in this repo
- **THEN** it MUST treat `docs/backendGuide.md`, OpenAPI `/docs`, `docs/frontend-stack.md`, and `docs/backend-frontend-contract.md` as references with protocol precedence (OpenAPI and `docs/backendGuide.md` win on live API behavior)
- **AND** it MUST respect `PROGRESS.md` / active `docs/steps/*` as the implementation schedule (no skipping ahead unless the step file allows)
- **AND** it MUST treat `docs/final-blueprint.md` as the playbook subject to `docs/update_blueprint.md` and protocol overrides

### Requirement: Non-negotiable frontend laws
The project context MUST encode the following laws as always-on constraints for proposals and implementation:

1. Never invent backend routes — verify against OpenAPI.
2. Never send client-chosen `workspace_id` on `/ai/*` (tenant from JWT only).
3. Chat and Agent remain separate UI modes and parsers.
4. Citations come only from SSE `metadata` payloads — never from token text. Stream events are identified by JSON `type` inside `data:` lines, not by SSE `event:` names unless OpenAPI documents named events.
5. Access token in `sessionStorage` (`dashnotes_at`); refresh token in Zustand memory only — never `localStorage` for tokens.
6. `apiClient` 401 handling uses `isRetry` circuit breaker; refresh via `handleUnauthorized` from `lib/auth/token-refresh.ts`.
7. Server data owned by TanStack Query — do not duplicate in Zustand.
8. Loading, empty, and error states are required for UI surfaces.
9. Indexing lag MUST be handled in UX; the client MUST NOT require an `indexing_status` field until OpenAPI includes it. Workspace switching remains deferred at launch.

#### Scenario: Conflicting shortcut suggested
- **WHEN** a change proposal suggests parsing citations from streamed tokens, treating SSE `event:` as the chat discriminator, or storing tokens in `localStorage`
- **THEN** the proposal MUST be rejected or rewritten to comply with the frontend laws above
