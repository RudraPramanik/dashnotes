## 1. Guardrails and planning docs

- [x] 1.1 Update `AGENTS.md` to point agents at `docs/update_blueprint.md` for patched steps (1.6 retry helper, 2.2/2.6/2.9, 2.11 gate, ContextPanel slot, indexing poll, NoteEditor split) and add the seven architecture principles as hard rules
- [x] 1.2 Update `docs/frontend-stack.md` Architecture principles section to include Server Components by default, ContextPanel-as-slot, chrome-only shell store, and shared `executeWithAuthRetry` / `useIndexingPoll`
- [x] 1.3 Amend `docs/steps/P1.md` Step 1.6 notes (or add a 1.6-patch subsection) so the validation script expects `executeWithAuthRetry` and a single shared `handleUnauthorized` call site pattern per `docs/update_blueprint.md`
- [x] 1.4 Add a short Phase 2 planning note (in `PROGRESS.md` Notes or a stub `docs/steps/P2.md` pointer) listing session order P2-A…P2-I with 2.11 as the Phase 3 gate

## 2. Immediate code — 1.6 auth retry extraction

- [x] 2.1 Refactor `lib/api/client.ts` to introduce internal `executeWithAuthRetry` used by both JSON `request` and `apiClient.stream`, preserving public method signatures and existing 401 / 429 / 503 behavior
- [x] 2.2 Run the v3 Step 1.6-patch validation script from `docs/update_blueprint.md` and confirm `1.6-patch PASS`
- [x] 2.3 On PASS, append the patch result to `PROGRESS.md` validation log (keep Next step as 1.7 unless user directs otherwise)

## 3. Spec alignment check

- [x] 3.1 Verify change specs under `openspec/changes/adopt-architecture-v3-patch/specs/` cover shell-composition, api-type-gate, feature-composition, and deltas for project-context / auth-tenancy / client-ops
- [x] 3.2 Run `openspec validate --change adopt-architecture-v3-patch` (or project-equivalent) and fix any schema issues if the CLI reports failures

## 4. Deferred implement reminders (do not build in this apply unless PROGRESS reaches them)

- [x] 4.1 When Phase 2 starts: implement revised 2.2 shell store (no `contextPanelContent` / citation / tool-trace fields) per update_blueprint validation — deferred; scheduled in PROGRESS Notes (P2-A)
- [x] 4.2 When Step 2.9 starts: Server Component `(app)/layout`, `AppShellEffects`, ContextPanel-as-slot — run layout + ContextPanel validation scripts — deferred; scheduled in PROGRESS Notes (P2-G)
- [x] 4.3 When Step 2.11 starts: `pnpm api:types` + `lib/api/types.ts` + typed `lib/api/*.ts` — gate Phase 3 — deferred; scheduled in PROGRESS Notes (P2-I)
- [x] 4.4 Before 3.3/4.3: add `lib/hooks/use-indexing-poll.ts`; wire `use-note` / `use-file` — deferred until Phase 3
- [x] 4.5 At 3.4: split NoteEditor into leaf components with strict prop contracts; page composes ContextPanel children — deferred until Phase 3
