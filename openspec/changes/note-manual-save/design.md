## Context

See `proposal.md` for why. Manual Save (no typing debounce) is already largely implemented in `NoteEditor` / leaves; this revision adjusts placement and makes saved vs dirty unmistakable. Create still POSTs an "Untitled note" stub immediately (`NotesPageContent`) — that stays. Composition rule unchanged: leaves stay dumb; `NoteEditor` owns mutations and save-state.

## Goals / Non-Goals

**Goals:**

- Explicit Save **top-right**; one action persists current title + body.
- Clear user feedback: saving (loading) → note saved; Save disabled when clean, enabled when dirty.
- No duplicate/concurrent `updateNote` from repeated Save clicks (debounce + in-flight guard).
- Keep composition: leaves stay dumb; `NoteEditor` owns mutations and save-state.
- Align B-gate e2e with the Save gesture.
- Touch only the note-editor save path (+ related e2e/docs lines).

**Non-Goals:**

- Draft-before-create; any backend/API repo edits; deploy/TLS; agent-driven git commits.
- Unrelated frontend features (chat, agent, files, auth, shell, notes list create stub).
- beforeunload / route-block dirty guards and keyboard shortcut (optional follow-up).
- Replacing inline status with toast-only (toast MAY be added later; not required).

## Decisions

1. **Local draft state, Save flushes both fields**  
   Title and body keep local state. Leaves expose current value upward via `onChange`. Save in `NoteEditor` calls `updateNote(id, { title, content })` once when the API accepts both.

2. **Remove 1500ms typing debounce from title/body**  
   Leaves call `onChange` only; no network. (Already applied.)

3. **Save button placement — top right**  
   Top row: `[title…] … [Save] [Privacy] [⋯]` (Save with the action cluster on the right, not left of the title).  
   *Rationale:* Title stays the primary left focus; Save sits with other commit/actions controls.  
   *Earlier plan (upper left) superseded by product feedback.*

4. **Dirty tracking drives enable/disable**  
   Keep a snapshot of last successfully saved `{ title, content }` (initially `initialTitle` / `initialContent`).  
   - `dirty` = current title/content ≠ snapshot.  
   - Save **enabled** only when `dirty && !saving`.  
   - On successful Save, update snapshot, set status to saved (“Note saved” / “Saved”), **disable** Save until the user edits again.  
   - On edit after save, clear “fully clean” and re-enable Save; status may return to idle or show unsaved (optional short “Unsaved changes” — prefer minimal: enable Save is enough).  
   *Alternative:* Disable forever after first save — rejected; users must be able to save again after edits.

5. **Loading while saving**  
   While in flight: Save button `disabled`, `aria-busy`, label **Saving…** (spinner optional if already in design system; text is enough). Status line may also show “Saving…”. No artificial delay; loading appears for the real request duration.

6. **Saved feedback**  
   Primary: status text **“Note saved”** (or keep `Saved · {n}s ago` — prefer clear “Note saved” at success, elapsed optional). Secondary: disabled Save communicates “nothing left to commit.” Do not rely on users noticing only the muted footer.

7. **Save click debounce + in-flight guard (required)**  
   Early-return if in flight; short leading-edge debounce (~300ms); Retry shares the guard.

8. **Privacy stays immediate**  
   Toggle still calls `updateNote({ is_private })` on change — not batched into Save.

9. **Docs / e2e**  
   Blueprint step 3.4 and e2e already updated for manual Save; patch placement language to top-right and dirty/disabled behavior as needed. E2E: edit → click Save (must be enabled) → assert saved feedback.

## Risks / Trade-offs

- **[Risk] Users lose unsaved edits on navigate** → Accept for v1; optional dirty warning later.  
- **[Risk] Empty stub notes still appear on New note** → Out of scope.  
- **[Risk] Double-click races two PATCHes** → Disable + in-flight + debounce.  
- **[Trade-off] Disable when clean** → User must edit to re-enable Save; correct signal for “already saved.”

## Migration Plan

1. Adjust existing frontend Save UX (placement + dirty/loading/saved).  
2. No API migration; rollback = revert the frontend commit.  
3. User owns git commits and deploy timing.

## Open Questions

- None that block implementation.
