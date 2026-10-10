# workspace-content Specification

## Purpose
TBD - created by archiving change bootstrap-app-context. Update Purpose after archive.
## Requirements
### Requirement: Notes CRUD UI contract
The notes UI MUST map to `/notes` workspace-scoped APIs: list, create `{ title, content, is_private? }`, read, patch, and delete. After create/update, the UI MUST allow for embedding/indexing lag before assuming RAG can retrieve the note.

#### Scenario: Create note
- **WHEN** the user creates a note successfully
- **THEN** the note MUST appear in the notes list for the JWT workspace
- **AND** the UI MUST be prepared to show an indexing/pending state until search can find it

### Requirement: Note editor manual save
The note editor MUST expose a Save control in the **top-right** of the editor chrome (alongside privacy/actions, not to the left of the title). Title and body edits MUST remain local until the user activates Save. Activating Save MUST persist the current title and body through the existing notes update API (`PATCH` / `updateNote`). The editor MUST NOT auto-save title or body on a typing debounce timer. While a Save-triggered update is in flight, further Save activations MUST NOT start additional concurrent update requests (in-flight guard and/or Save-click debounce), and the Save control MUST show a loading/saving state and remain disabled. After a successful Save, the UI MUST show a clear note-saved response and the Save control MUST stay disabled until the user changes the title or body again (dirty). On failure, the UI MUST offer a retry path.

#### Scenario: Save persists title and body
- **WHEN** the user edits the note title and/or body and activates Save
- **THEN** the client MUST send an update with the current title and body
- **AND** the UI MUST show a saving/loading state while the update is in flight
- **AND** after success the UI MUST show a note-saved response
- **AND** the Save control MUST be disabled until the title or body changes again

#### Scenario: Typing does not persist without Save
- **WHEN** the user types in the title or body and does not activate Save
- **THEN** the client MUST NOT issue a notes update solely because of a debounce timer after typing
- **AND** the Save control MUST be enabled (unless a save is already in flight)

#### Scenario: Repeated Save clicks do not stack requests
- **WHEN** the user activates Save multiple times while a Save update is already in progress
- **THEN** the client MUST NOT issue multiple concurrent notes update requests for that Save action
- **AND** the Save control MUST be disabled or otherwise ignore surplus activations until the in-flight update settles

#### Scenario: Save sits top-right
- **WHEN** the note editor chrome is shown
- **THEN** the Save control MUST appear in the top-right action cluster (not left of the title field)

### Requirement: Notebooks list and create
The notebooks UI MUST support `GET /notebooks/` and `POST /notebooks/` as the primary notebook operations described for the client.

#### Scenario: List notebooks
- **WHEN** an authenticated user opens the notebooks surface
- **THEN** the client MUST load notebooks from `GET /notebooks/` with Bearer auth

### Requirement: Files upload and management
The files UI MUST support multipart upload to `POST /files/upload` (`file`, `is_private`, `description`) without manually setting `Content-Type`, list/detail/download/patch/delete routes under `/files`, and attach-to-note via `POST /files/{file_id}/attach/{note_id}`. Admin/owner broader listing MAY use `GET /files/admin/all`.

#### Scenario: Upload file
- **WHEN** the user uploads a file
- **THEN** the client MUST send multipart form data with Bearer auth
- **AND** the UI MUST tolerate worker processing delay before metadata/extraction is complete

### Requirement: Workspace members surfaces
Workspace settings UI MUST use `/workspaces/me` and `/workspaces/members*` for current workspace and membership management. Multi-workspace switching is deferred at launch unless product scope explicitly expands.

#### Scenario: View current workspace
- **WHEN** the user opens workspace settings
- **THEN** the client MUST load `GET /workspaces/me` under the JWT tenant

### Requirement: Current workspace from me endpoint
The client MUST load the current workspace display name and settings from `GET /workspaces/me` (JWT tenant). The client MUST NOT use `GET /workspaces` as the source of the current workspace label unless OpenAPI documents that list route and the product has shipped multi-workspace listing.

#### Scenario: Shell workspace label
- **WHEN** the authenticated shell shows the workspace name
- **THEN** the client MUST resolve that name via `GET /workspaces/me` (or equivalent OpenAPI current-workspace operation)
- **AND** MUST NOT require a workspace list endpoint that the live API does not expose

