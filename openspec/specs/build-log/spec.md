# build-log Specification

## Purpose

Defines the living build log so implementations, in-progress work, and backlog stay visible while shipping v1 end to end, without replacing protocol precedence or architecture hard rules.

## Requirements

### Requirement: BUILD.md is the program log
The repository MUST keep `docs/BUILD.md` with three sections: Implemented, In progress, and Backlog. Each implemented slice MUST name the user-visible behavior and the primary API. Backlog MUST list deferred chrome (agent marketplace, automation inbox, workspace switcher, Cmd-K as primary Q&A, production TLS B7, `indexing_status` badges until OpenAPI on notes/files). `PROGRESS.md` MUST still record the last completed playbook step for agent catchup.

#### Scenario: Slice completes
- **WHEN** a v1 slice is done (for example notes CRUD)
- **THEN** it MUST move to Implemented in `docs/BUILD.md`
- **AND** `PROGRESS.md` MUST be updated with the last playbook step

#### Scenario: Deferred item is not shipped as live chrome
- **WHEN** a Backlog item is not yet in OpenAPI or is explicitly deferred
- **THEN** the app MUST NOT present it as a live primary destination

### Requirement: Backlog vs live OpenAPI
Backlog entries MUST NOT invent routes. If OpenAPI later lists a deferred field or route, BUILD.md MAY move that item to In progress. Until notes/files schemas include `indexing_status`, indexing UX and tests MUST stay lag-based.

#### Scenario: health/ai present on Docker
- **WHEN** live OpenAPI lists `GET /health/ai`
- **THEN** the client MAY poll it for an indicator
- **AND** MUST still tolerate missing `/health/ai` on other environments without breaking the shell
