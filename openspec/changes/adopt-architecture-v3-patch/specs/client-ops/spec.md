## ADDED Requirements

### Requirement: Shared indexing poll timeout
Indexing lag UX for notes and files MUST use one shared client hook for poll interval and timeout (default three minutes). Duplicate per-feature timeout implementations are forbidden. The UI MUST still present indexing/pending states from API `indexing_status` and MUST NOT treat temporary RAG misses as a permanent AI outage.

#### Scenario: Polling exceeded
- **WHEN** indexing remains pending longer than the shared timeout window
- **THEN** polling MUST stop (`refetchInterval` false)
- **AND** the UI MUST expose a recoverable exceeded state (e.g. `pollingExceeded` with retry via `resetPoll`) rather than spinning forever
