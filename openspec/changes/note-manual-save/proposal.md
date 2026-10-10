## Why

The note editor auto-saves title and body after a 1500ms debounce, so users never get an explicit commit moment and half-finished typing hits the API. Product wants a clear Save control: persist only when the user clicks Save, with unmistakable feedback about whether the note is saved.

## What Changes

- **BREAKING (UX):** Remove debounced auto-save for note title and body. Edits stay local until Save.
- Add a **Save** button at the **top right** of the note editor chrome (with Privacy / actions — not left of the title).
- Clicking Save persists the current title and body via existing `PATCH /notes/{id}` (`updateNote`).
- **Save click protection:** debounce / in-flight guard so rapid or repeated Save clicks MUST NOT fire multiple concurrent update API calls.
- **Saved / dirty UX:** After a successful Save, the UI MUST show a clear “note saved” response and the Save button MUST be **disabled** until the user edits title or body again (dirty). While a save is in flight, show a loading/saving state on the control (and status) if the request takes noticeable time.
- Keep error + retry on failed Save.
- Update B-gate Playwright expectations that currently wait for `Saving…|Saved` after typing without an explicit Save click.
- Privacy toggle remains immediate (unchanged API).

### Non-goals

- Changing the create flow (New note still creates a stub via `POST /notes`, then opens the editor).
- Local-only drafts before first create.
- **Backend / API / unrelated features** — no backend edits, no new routes/packages, and no changes to chat, agent, files, auth, shell, or other notes surfaces beyond the editor save path and its e2e/docs.
- Production deploy / TLS (B7) — out of band; commits by the user.
- Unsaved-navigation blockers and Cmd/Ctrl+S (nice-to-have; not required for this change).
- Sonner/toast-only feedback as the sole signal (inline status + button state is the primary contract).

## Capabilities

### New Capabilities

- (none)

### Modified Capabilities

- `workspace-content`: Note editor MUST persist title/body only on explicit Save; MUST NOT auto-save on typing debounce; MUST prevent duplicate Save-triggered update calls; MUST place Save top-right; MUST communicate saving/saved/dirty via status + Save enabled/disabled.
- `e2e-playwright`: B-gate note step MUST click Save (or equivalent) before asserting persisted content / save feedback.

## Impact

- Frontend only (related files): `NoteEditor`, `NoteTitleField`, `NoteBody`, save-state UI; e2e note step; note-editor blueprint lines that still assert typing debounce / Save placement.
- Existing APIs unchanged: `createNote` / `updateNote` as today — **call sites only**, no backend work.
