## ADDED Requirements

### Requirement: OpenSpec project identity
OpenSpec MUST identify this repository as the DashNotes Next.js frontend for the DashNoteSystem FastAPI backend, and MUST surface stack, doc map, and phase workflow to agents creating artifacts.

#### Scenario: Agent drafts a proposal
- **WHEN** an agent creates or updates an OpenSpec artifact in this repo
- **THEN** it MUST treat `docs/backendGuide.md`, `docs/frontend-stack.md`, `docs/backend-frontend-contract.md`, and OpenAPI `/docs` as the primary product/API references
- **AND** it MUST respect `PROGRESS.md` / active `docs/steps/*` as the implementation schedule (no skipping ahead unless the step file allows)

### Requirement: Non-negotiable frontend laws
The project context MUST encode the following laws as always-on constraints for proposals and implementation:

1. Never invent backend routes — verify against OpenAPI.
2. Never send client-chosen `workspace_id` on `/ai/*` (tenant from JWT only).
3. Chat and Agent remain separate UI modes and parsers.
4. Citations come only from SSE `metadata` events — never from token text.
5. Access token in `sessionStorage` (`dashnotes_at`); refresh token in Zustand memory only — never `localStorage` for tokens.
6. `apiClient` 401 handling uses `isRetry` circuit breaker; refresh via `handleUnauthorized` from `lib/auth/token-refresh.ts`.
7. Server data owned by TanStack Query — do not duplicate in Zustand.
8. Loading, empty, and error states are required for UI surfaces.

#### Scenario: Conflicting shortcut suggested
- **WHEN** a change proposal suggests parsing citations from streamed tokens or storing tokens in `localStorage`
- **THEN** the proposal MUST be rejected or rewritten to comply with the frontend laws above

### Requirement: Config.yaml context maintained
`openspec/config.yaml` MUST contain a filled `context` block summarizing product, stack, architecture laws, and current-phase posture, plus `rules` for proposal/tasks artifacts.

#### Scenario: Fresh OpenSpec session
- **WHEN** `openspec init` leftovers are replaced by this change’s apply step
- **THEN** `openspec/config.yaml` MUST no longer be comment-only placeholders for context
- **AND** subsequent artifact generation MUST receive that context from OpenSpec
