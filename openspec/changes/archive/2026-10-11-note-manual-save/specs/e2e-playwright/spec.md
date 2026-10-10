## MODIFIED Requirements

### Requirement: B-gate browser path
The suite MUST include a spec that, in one flow: registers, creates a note, uploads a file, asks Chat, and runs Agent. After editing note title/body, the suite MUST activate the note editor Save control before asserting save feedback or relying on that content for later RAG steps. Chat assertions MUST use citations from SSE `metadata` (OpenAPI fields). Agent assertions MUST show tool start/end (or equivalent visible tool state). The spec MUST wait for indexing lag before treating missing RAG hits as failure.

#### Scenario: Note content saved explicitly
- **WHEN** the B-gate flow creates a note and fills title/body
- **THEN** the test MUST activate Save
- **AND** MUST assert save feedback (saving/saved or equivalent) after that action
- **AND** MUST NOT rely on debounce auto-save after typing alone

#### Scenario: Chat citations after lag
- **WHEN** a note and file were just created and Chat is asked about that content
- **THEN** the test MUST wait a bounded time for retrieval to succeed
- **AND** MUST NOT fail solely because citations are empty in the first few seconds

#### Scenario: Agent tools visible
- **WHEN** Agent is asked to search or create a note
- **THEN** the UI MUST show that a tool ran
- **AND** the test MUST NOT require citation excerpts
