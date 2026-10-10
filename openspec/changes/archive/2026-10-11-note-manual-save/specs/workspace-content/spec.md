## ADDED Requirements

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
