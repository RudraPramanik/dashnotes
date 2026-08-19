## ADDED Requirements

### Requirement: Writing-first notes surface
The Notes list and editor MUST treat the document as the primary content (title + body), not a conversation transcript. Privacy (`is_private`) MUST be visible. After create/update, the UI MUST show indexing-lag copy without requiring `indexing_status` and MUST NOT infer readiness from empty `tags` alone.

#### Scenario: New note not yet searchable
- **WHEN** the user creates a note
- **THEN** the note MUST appear in the list
- **AND** the UI MUST present indexing-lag copy until search can reasonably find it

### Requirement: First-run empty notes coach
When the notes list is empty, Notes MUST show an inline coach: create a note, upload a file, ask Chat. The coach MUST NOT block creating a note. File attach (`POST /files/{file_id}/attach/{note_id}`) MAY appear on the note context panel in v1; it MUST NOT be a separate linking product.

#### Scenario: Coach does not trap the user
- **WHEN** the notes list is empty and the user chooses to create a note from the coach
- **THEN** the client MUST create/open a note via `/notes`
- **AND** MUST NOT require completing upload or chat first

### Requirement: Notebooks are a notes filter until OpenAPI is richer
Until OpenAPI documents note-to-notebook filtering and notebook-by-id reads, the notebooks UI MUST be limited to list + create (`GET /notebooks/`, `POST /notebooks/`) as a filter on Notes. The client MUST NOT depend on `GET /notebooks/{id}` or `GET /notes?notebook_id=` unless OpenAPI lists those operations.

#### Scenario: Notebook APIs are list and create only
- **WHEN** OpenAPI lists only notebook list and create for the client
- **THEN** Notes MAY filter by notebooks returned from `GET /notebooks/`
- **AND** MUST NOT treat a missing notebook-detail route as a product failure
