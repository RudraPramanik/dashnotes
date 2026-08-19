## ADDED Requirements

### Requirement: V1 E2E program may span phases
When implementing change `ship-v1-e2e`, agents MUST follow `openspec/changes/ship-v1-e2e/tasks.md` slice order through B-gate (remaining Phase 1, shell, notes/files, chat, agent, Playwright). Session files `docs/steps/P*.md` and `docs/update_blueprint.md` remain the file-level prompts inside each slice. Chrome MUST follow `lock-v1-ui-contract`. Agents MUST NOT skip steps 1.7–1.11. Agents MUST NOT treat Phase 1 exit as the product exit.

#### Scenario: Apply this change
- **WHEN** an agent implements `ship-v1-e2e`
- **THEN** it MUST continue past Phase 1 into shell and B-gate features in task order
- **AND** MUST still complete stream guard, API stubs, middleware, login, and register before the shell

### Requirement: Playwright B-gate is the product exit
This change MUST NOT be marked complete until the Playwright B-gate spec has been run against Docker (or AI `503` is handled per `e2e-playwright`) and `docs/BUILD.md` lists B1–B6 as Implemented. Production TLS (B7) MUST remain backlog.

#### Scenario: Notes work but chat untested
- **WHEN** notes CRUD exists but the B-gate Playwright spec has not been run
- **THEN** this change MUST NOT be marked complete
