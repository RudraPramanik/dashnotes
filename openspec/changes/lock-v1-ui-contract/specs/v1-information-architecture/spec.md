## Purpose

Defines which authenticated screens are v1 product chrome versus deferred, how the three-column shell maps to live APIs, and how an empty workspace onboards via the B-gate demo path.

## ADDED Requirements

### Requirement: Five live destinations
Authenticated v1 navigation MUST expose exactly these primary destinations: Notes, Files, Chat, Agent, and Settings. Default landing after login/register MUST be Notes (`/notes`). The shell MUST show a read-only workspace name from `GET /workspaces/me`. The shell MUST NOT present a workspace switcher, a multi-agent marketplace, or an automation inbox as live chrome.

#### Scenario: New session lands on notes
- **WHEN** an authenticated user completes login or register
- **THEN** the client MUST navigate to Notes
- **AND** MUST show the current workspace label without a switch-workspace control

#### Scenario: Agent is a single destination
- **WHEN** the user opens Agent from primary nav
- **THEN** the client MUST enter the Workspace Assistant experience that calls `/ai/agent*`
- **AND** MUST NOT show coming-soon specialist agent cards as if they were live products

### Requirement: Context panel meaning by route
The context panel MUST remain a slot composed by the page. On Notes it MUST show note metadata (privacy, tags when present, attached files). On Files it MUST show file metadata (including processing/lag copy). On Chat it MUST show Sources from chat `metadata` citations. On Agent it MUST show a tool timeline from `tool_start` / `tool_end` / `done`. The shell MUST NOT import feature panels from a central switch.

#### Scenario: Chat opens sources
- **WHEN** the user is on Chat and a stream `metadata` event includes citations
- **THEN** the Sources panel MUST list those citations using OpenAPI fields
- **AND** MUST NOT invent excerpt text

### Requirement: Deferred chrome stays out of v1
v1 chrome MUST omit: extra agent products, automation approval inbox, workspace switching, required `GET /health/ai` status, required `indexing_status` badges, and citation excerpts. Command palette MAY ship in a later phase as a power-user overlay; it MUST NOT replace Chat as the primary Q&A surface. Threads copy MUST describe the current user's conversations, not a shared workspace chat.

#### Scenario: Automation flag off
- **WHEN** automation is not enabled
- **THEN** the shell MUST NOT show an automation inbox page as a primary destination

### Requirement: First-run empty notes
When the workspace has no notes (and typically no files), Notes MUST present an empty state that coaches the B-gate path: create a note, upload a file, then ask Chat. The empty state MUST be inline on Notes, not a separate start route. The client MUST NOT send a chat `note_id` context field; "ask about this" actions MUST prefill message text only.

#### Scenario: Empty workspace after register
- **WHEN** the user opens Notes and the notes list is empty
- **THEN** the UI MUST show the create / upload / ask-chat coach
- **AND** MUST still allow creating a note immediately
