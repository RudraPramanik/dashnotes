# auth-tenancy Specification

## Purpose
TBD - created by archiving change bootstrap-app-context. Update Purpose after archive.
## Requirements
### Requirement: Auth JSON API integration
The frontend MUST integrate with JSON auth endpoints: `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh`, and `POST /auth/logout` (Bearer on logout). Success login/register/refresh responses SHALL be treated as `TokenResponse` with `access_token`, `refresh_token`, and `token_type`.

#### Scenario: Register creates session
- **WHEN** the user submits valid `{ email, password, workspace_name }` to register
- **THEN** the client MUST store the access token per project token rules and keep the refresh token in memory
- **AND** subsequent protected calls MUST send `Authorization: Bearer <access_token>`

### Requirement: JWT tenancy and role
The frontend MUST derive workspace tenancy from access JWT claim `wid` and role from claim `role` (`owner` | `admin` | `member`). The client MUST NOT send a client-chosen workspace id to override tenancy on notes, files, or AI routes.

#### Scenario: Protected notes list
- **WHEN** the client requests `GET /notes/`
- **THEN** it MUST authenticate with Bearer access token only
- **AND** it MUST NOT attach a separate `workspace_id` override intended to change tenant scope

### Requirement: Refresh on 401 with circuit breaker
On `401` from a protected API call, the client MUST attempt refresh via the shared token-refresh coordinator exactly once per request chain (`isRetry` circuit breaker). A second `401` MUST NOT call refresh again; the session MUST be cleared and the user sent to login.

#### Scenario: Expired access token
- **WHEN** a protected request returns `401` and refresh succeeds
- **THEN** the client MUST retry the original request once with the new access token

#### Scenario: Refresh also fails
- **WHEN** refresh fails or a retried request still returns `401`
- **THEN** the client MUST clear the session and require login

### Requirement: RBAC UI affordances
The UI MUST hide or disable actions that the JWT `role` does not allow, while treating the server as authoritative. Owners/admins MUST be offered manage affordances for workspace notes/files per backend rules; members MUST only be offered mutate affordances for content they are allowed to change (own notes/files and permitted public content).

#### Scenario: Member private note
- **WHEN** a member views notes they do not own that are private
- **THEN** the UI MUST NOT present edit/delete affordances as if permitted

