## Purpose

Defines Playwright end-to-end validation of DashNotes v1 against the live FastAPI Docker API so the B-gate demo path is a real browser test, not a mocked API.

## ADDED Requirements

### Requirement: Live API, not mocks
Playwright tests MUST drive the Next.js UI against the running API origin (`NEXT_PUBLIC_API_BASE_URL` or `http://127.0.0.1`). Tests MUST NOT stub FastAPI routes for notes, files, auth, chat, or agent. Unique emails MUST be used per run so register does not collide.

#### Scenario: Register hits Docker
- **WHEN** the B-gate spec runs register
- **THEN** the browser MUST complete `POST /auth/register` against the live API
- **AND** MUST land on Notes after a successful token session

### Requirement: B-gate browser path
The suite MUST include a spec that, in one flow: registers, creates a note, uploads a file, asks Chat, and runs Agent. Chat assertions MUST use citations from SSE `metadata` (OpenAPI fields). Agent assertions MUST show tool start/end (or equivalent visible tool state). The spec MUST wait for indexing lag before treating missing RAG hits as failure.

#### Scenario: Chat citations after lag
- **WHEN** a note and file were just created and Chat is asked about that content
- **THEN** the test MUST wait a bounded time for retrieval to succeed
- **AND** MUST NOT fail solely because citations are empty in the first few seconds

#### Scenario: Agent tools visible
- **WHEN** Agent is asked to search or create a note
- **THEN** the UI MUST show that a tool ran
- **AND** the test MUST NOT require citation excerpts

### Requirement: Operational errors are first-class
On `429`, the UI and tests MUST observe a wait/retry message. On AI `503` or SSE `type: "error"`, the UI MUST show a calm unavailable message; the suite MUST record that outcome (skip or dedicated assertion) and MUST NOT treat notes/files CRUD as failed because AI is down.

#### Scenario: LLM quota exhausted
- **WHEN** Agent or Chat returns `503`
- **THEN** the user-visible unavailable state MUST be present
- **AND** the suite MUST NOT fail the notes or files portions of the run for that reason

### Requirement: Playwright package and script
The project MUST add `@playwright/test` as a devDependency and a `test:e2e` script. Tests MUST live under `e2e/`. No other E2E framework MAY be introduced in this change.

#### Scenario: Script exists
- **WHEN** a developer runs the documented e2e command
- **THEN** Playwright MUST start from `package.json`
- **AND** MUST use `@playwright/test` only
