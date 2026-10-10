## ADDED Requirements

### Requirement: Note editor manual save
The note editor MUST expose a Save control in the upper-left of the editor chrome (to the left of the title field). Title and body edits MUST remain local until the user activates Save. Activating Save MUST persist the current title and body through the existing notes update API (`PATCH` / `updateNote`). The editor MUST NOT auto-save title or body on a typing debounce timer. The editor MUST show save feedback for the Save action: saving in progress, saved, or failed with a retry path. While a Save-triggered update is in flight, further Save activations MUST NOT start additional concurrent update requests (in-flight guard and/or Save-click debounce).

#### Scenario: Save persists title and body
- **WHEN** the user edits the note title and/or body and activates Save
- **THEN** the client MUST send an update with the current title and body
- **AND** the UI MUST show saving/saved (or error with retry) feedback for that action

#### Scenario: Typing does not persist without Save
- **WHEN** the user types in the title or body and does not activate Save
- **THEN** the client MUST NOT issue a notes update solely because of a debounce timer after typing

#### Scenario: Repeated Save clicks do not stack requests
- **WHEN** the user activates Save multiple times while a Save update is already in progress
- **THEN** the client MUST NOT issue multiple concurrent notes update requests for that Save action
- **AND** the Save control MUST be disabled or otherwise ignore surplus activations until the in-flight update settles
