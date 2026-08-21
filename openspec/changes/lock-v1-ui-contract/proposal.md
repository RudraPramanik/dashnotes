## Why

DashNotes is ready to freeze a v1 UI, but `docs/wireframes.md` still sketches a multi-agent marketplace, automation inbox, citation excerpts, and required `indexing_status` — surfaces the live API cannot back. At the same time, the honest IA (notes/files + RAG chat + one agent) will feel like an admin CRUD app unless Chat/Agent use conversation chrome in the Claude / ChatGPT / Grok class. Lock the contract now, before Phase 2 paints the shell, so end-to-end implementation follows one IA and one visual language — without skipping remaining Phase 1 work.

## What Changes

- Freeze **v1 information architecture**: five live destinations (Notes, Files, Chat, Agent, Settings). Default landing `/notes`. ContextPanel stays a per-page slot: note/file meta, chat Sources, agent Tools.
- Freeze **visual language**: dark-first, quiet sidebar, centered conversation column + sticky composer on Chat/Agent, writing-first Notes. Steal AI-app patterns (whitespace, streaming caret, citation/tool chips), not chat-as-home or a model picker.
- **BREAKING (vs wireframes v1 marketplace):** v1 nav is a single Agent item into Workspace Assistant. No coming-soon agent cards, no automation inbox in chrome, no workspace switcher, no citation excerpts.
- Overlay `docs/wireframes.md` (and a short visual-language note) so Phase 2+ implement this contract. OpenAPI / `docs/backendGuide.md` still win on routes and JSON.

### Non-goals

- Do not skip remaining Phase 1 (`1.7`–`1.11`) or implement Phases 2–9 in this change.
- Do not add packages, fonts, or Vercel AI SDK.
- Do not invent API fields (`excerpt`, `indexing_status`, `note_id` on chat body) or routes (`/health/ai` required, switch-workspace, extra agents).
- Do not merge Chat and Agent into one screen.

## Capabilities

### New Capabilities

- `v1-information-architecture`: Which screens are v1 chrome vs deferred; first-run empty Notes; ContextPanel meaning by route.
- `visual-language`: Conversation vs writing density, composer, tokens (existing shadcn/Geist only), Chat vs Agent visual distinction.

### Modified Capabilities

- `ai-modes`: Chat/Agent MUST use conversation chrome (column, composer, chips, Sources vs Tools panel) while remaining separate modes.
- `workspace-content`: Notes MUST be writing-first with a B-gate first-run empty state; notebooks MUST be a Notes filter until OpenAPI documents richer notebook APIs.
- `playbook-protocol`: This v1 UI contract overlays `docs/wireframes.md` marketplace sketches for chrome; playbook session order is unchanged.

## Impact

- Docs: `docs/wireframes.md`, new `docs/ui-language.md`, pointers in `docs/frontend-stack.md` / `AGENTS.md` / `docs/update_blueprint.md`.
- Specs: new + delta specs under this change; archive later.
- Code: none in this change. Phase 2 shell, Phase 3 notes, Phases 5–6 chat/agent MUST implement against this overlay. Resume `PROGRESS.md` at step **1.7**.
- Backend: unchanged.
