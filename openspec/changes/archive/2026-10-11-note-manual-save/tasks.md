## 1. Editor leaves — stop auto-save

- [x] 1.1 Remove 1500ms debounce from `NoteTitleField`; keep local title state and notify parent of changes (e.g. `onChange`) without calling mutations
- [x] 1.2 Remove 1500ms debounce from `NoteBody`; keep TipTap local content and notify parent of changes without calling mutations
- [x] 1.3 Confirm leaves still take primitives + callbacks only (no `useNoteMutations` / `apiClient`)

## 2. NoteEditor — Save button (initial)

- [x] 2.1 Hold current title/body in `NoteEditor` (or via leaf callbacks) so Save can read both
- [x] 2.2 Add **Save** button; on click call `updateNote` with current `{ title, content }` and drive existing save-state (`saving` / `saved` / `error` + Retry)
- [x] 2.3 Add Save click protection: disable Save while `saving`, early-return if a save is in flight, and short debounce on the Save handler so rapid clicks cannot start concurrent `updateNote` calls (Retry shares the same guard)
- [x] 2.4 Keep privacy toggle immediate; do not change actions menu, create flow, or unrelated features/backend
- [x] 2.5 Verify typing alone does not trigger `updateNote` for title/body; verify multi-click Save while in flight does not stack requests

## 3. Docs and e2e alignment (related only)

- [x] 3.1 Patch note-editor auto-save / `1500` assertions in `docs/update_blueprint.md` (and any step validation that requires typing debounce) to match manual Save — no unrelated doc rewrites
- [x] 3.2 Update `e2e/b-gate.spec.ts` to click Save after filling title/body, then assert save feedback
- [ ] 3.3 Smoke-check create → edit → Save → reload shows persisted content (manual or e2e)

## 4. Save UX polish (placement + feedback)

- [x] 4.1 Move Save to the **top-right** action cluster (`[title…] [Save] [Privacy] [⋯]`)
- [x] 4.2 Track dirty vs last-saved title/content snapshot; enable Save only when dirty and not saving
- [x] 4.3 On successful Save: show clear **Note saved** (or equivalent) feedback; keep Save disabled until the user edits again
- [x] 4.4 While saving: Save shows loading/Saving… (`aria-busy`, disabled) for the real request duration
- [x] 4.5 Patch blueprint / e2e copy for top-right placement and dirty/disabled Save if assertions mention layout or always-enabled Save
