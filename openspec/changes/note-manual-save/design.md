## Context

See `proposal.md` for why. Today `NoteTitleField` and `NoteBody` each own a 1500ms debounce that calls `onSave`, and `NoteEditor` turns those into `updateNote` calls plus a shared save-state indicator. Create still POSTs an "Untitled note" stub immediately (`NotesPageContent`) — that stays. Architecture v3 still wants leaf components with primitives + callbacks and mutations only in `NoteEditor`; only the *trigger* of save changes (button vs debounce).

## Goals / Non-Goals

**Goals:**

- Explicit Save upper-left; one action persists current title + body.
- No duplicate/concurrent `updateNote` from repeated Save clicks (debounce + in-flight guard).
- Keep composition: leaves stay dumb; `NoteEditor` owns mutations and save-state.
- Align B-gate e2e with the new gesture.
- Touch only the note-editor save path (+ related e2e/docs lines).

**Non-Goals:**

- Draft-before-create; any backend/API repo edits; deploy/TLS; agent-driven git commits.
- Unrelated frontend features (chat, agent, files, auth, shell, notes list create stub).
- beforeunload / route-block dirty guards and keyboard shortcut (optional follow-up).

## Decisions

1. **Local draft state, Save flushes both fields**  
   Title and body keep local state. Leaves expose current value upward (e.g. `onChange` / imperative get, or controlled props from `NoteEditor`). Save in `NoteEditor` calls `updateNote(id, { title, content })` once (or sequential patches if a single payload is awkward — prefer one call when the API accepts both).  
   *Alternative considered:* Keep debounce `onSave` but only wire it from a button — rejected; leaves should stop pretending to auto-save.

2. **Remove 1500ms debounce from title/body**  
   Delete timers in `NoteTitleField` / `NoteBody`. Rename callbacks if needed (`onChange` for local sync; Save is not the leaf's job).  
   *Alternative:* Keep debounce as "soft save" plus Save — rejected; product wants not automatic.

3. **Save button placement**  
   First control in the top row: `[Save] [title…] [Privacy] [⋯]`. Use existing shadcn `Button`.

4. **Save click debounce + in-flight guard (required)**  
   Distinct from the removed *typing* debounce. On Save:
   - Set `saveState` to `saving` and **disable** the Save button until the promise settles.
   - Early-return if a save is already in flight (ref or `saveState === "saving"`) so double-clicks never start a second `updateNote`.
   - Optionally collapse burst clicks with a short leading-edge debounce on the Save handler (e.g. ~300ms); the in-flight guard is the hard correctness guarantee.
   Retry uses the same guard.

5. **Privacy stays immediate**  
   Toggle still calls `updateNote({ is_private })` on change — not batched into Save — so Save remains about writing content. No other feature surfaces change.

6. **Save-state indicator stays**  
   Reuse `idle | saving | saved | error` + Retry, but only after Save (and privacy/delete paths as today). Idle until first Save in the session is fine.

7. **Docs conflict**  
   `docs/update_blueprint.md` / playbook still prescribe 1500ms typing auto-save. In-scope: patch only the note-editor sections that assert that behavior. Do not rewrite unrelated blueprint chapters.

8. **E2E**  
   After fill title/body, click role `button` name Save, then assert `Saving…|Saved` (or updated copy).

## Risks / Trade-offs

- **[Risk] Users lose unsaved edits on navigate** → Mitigation: accept for v1; optional dirty warning later.  
- **[Risk] Empty stub notes still appear on New note** → Out of scope (create-flow non-goal).  
- **[Risk] Blueprint validation scripts fail if they still check for `1500`** → Patch those checks with the docs task.  
- **[Trade-off] Manual save vs prior "silent auto-save"** → Intentional product change.  
- **[Risk] Double-click races two PATCHes** → Mitigation: disable + in-flight guard (+ optional short Save-click debounce).

## Migration Plan

1. Ship frontend change on the usual Next deploy path the team already uses.  
2. No API migration; rollback = revert the frontend commit.  
3. User owns git commits and deploy timing.

## Open Questions

- None that block implementation; Cmd/Ctrl+S and leave-guards deferred.
