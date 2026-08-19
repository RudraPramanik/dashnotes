## ADDED Requirements

### Requirement: Current workspace from me endpoint
The client MUST load the current workspace display name and settings from `GET /workspaces/me` (JWT tenant). The client MUST NOT use `GET /workspaces` as the source of the current workspace label unless OpenAPI documents that list route and the product has shipped multi-workspace listing.

#### Scenario: Shell workspace label
- **WHEN** the authenticated shell shows the workspace name
- **THEN** the client MUST resolve that name via `GET /workspaces/me` (or equivalent OpenAPI current-workspace operation)
- **AND** MUST NOT require a workspace list endpoint that the live API does not expose
