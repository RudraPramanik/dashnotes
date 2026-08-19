## ADDED Requirements

### Requirement: V1 UI contract overlays marketplace wireframes
For authenticated chrome and visual language, `docs/wireframes.md` plus `docs/ui-language.md` (this change) MUST overlay older marketplace sketches (multi-agent hub, automation inbox as live nav, citation excerpts, required `indexing_status`). Session order in `docs/final-blueprint.md` and architecture patches in `docs/update_blueprint.md` MUST remain the implementation playbook. Remaining Phase 1 steps MUST still run before Phase 2 shell UI.

#### Scenario: Agent implements Phase 2 shell
- **WHEN** an agent implements the app shell
- **THEN** it MUST use five live destinations and conversation/writing density from the v1 UI contract
- **AND** MUST NOT ship coming-soon agent cards or an automation inbox as live chrome

#### Scenario: Phase 1 is not skipped
- **WHEN** this UI contract is approved
- **THEN** implementers MUST continue from the current `PROGRESS.md` step (1.7 stream guard)
- **AND** MUST NOT start Phase 2 application chrome until Phase 1 exit criteria pass
