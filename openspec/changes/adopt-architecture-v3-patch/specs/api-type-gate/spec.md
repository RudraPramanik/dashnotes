## ADDED Requirements

### Requirement: OpenAPI-generated types before feature UI
Before Phase 3 component work that consumes API response shapes, the frontend MUST generate types via the project’s `pnpm api:types` script into `lib/api/schema.d.ts` and expose ergonomic aliases from `lib/api/types.ts`. `lib/api/types.ts` is the only module that MAY import generated schema types directly; all other modules MUST import from `lib/api/types.ts`.

#### Scenario: Type gate passes
- **WHEN** Step 2.11 validation runs
- **THEN** `lib/api/schema.d.ts` and `lib/api/types.ts` MUST exist
- **AND** `lib/api/types.ts` MUST export at least `Note`, `FileRecord`, `Thread`, and `ChatCitation` (or the real OpenAPI-backed aliases for those concepts)

### Requirement: No unknown API shapes in domain API modules
Domain API modules under `lib/api/` that the type gate covers (including notes and files at minimum) MUST NOT return `Promise<unknown>` for typed entity endpoints. Missing fields in the generated schema MUST be treated as backend contract gaps, not bypassed with TypeScript `as` casts in feature code from Phase 3 onward.

#### Scenario: Notes list typing
- **WHEN** `getNotes` (or equivalent) is declared after the type gate
- **THEN** its return type MUST use aliases from `lib/api/types.ts`
- **AND** it MUST NOT be typed as `Promise<unknown>`
