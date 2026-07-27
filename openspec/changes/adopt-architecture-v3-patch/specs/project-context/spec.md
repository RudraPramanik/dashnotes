## ADDED Requirements

### Requirement: Architecture composition principles
OpenSpec and step work MUST enforce these frontend composition principles in addition to existing frontend laws:

1. Single Responsibility — one module owns one concern (e.g. one 401-retry helper, one indexing-poll hook).
2. Composition Over Inheritance — prefer slots and leaf composition over hub switch statements and god components.
3. Strict Prop Contracts — interactive leaves take primitives/callbacks; network ownership stays at composition roots.
4. Server Components by Default — route layouts stay Server Components unless interactivity requires a client leaf.
5. Isolate Interactivity — `"use client"` is pushed to the smallest leaf that needs hooks or browser APIs.
6. State Colocation — UI/ephemeral state lives with the owner of the value (debounce with the field; stream state with the stream hook).
7. Minimal Unidirectional Flow — feature → props/children → presentational panel; shell store is chrome flags only.

#### Scenario: Proposal contradicts principles
- **WHEN** a change proposal forces `app/(app)/layout.tsx` to `"use client"` solely to call session hooks, or adds feature payloads to the shell store
- **THEN** the proposal MUST be rejected or rewritten to use a client leaf and/or props-based composition
