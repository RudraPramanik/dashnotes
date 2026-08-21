## Context

See `proposal.md` for why. Current code: Phase 1 after step 1.6; routes are placeholders; shell is not built. Architecture v3 already locked a 3-column Server Component shell and ContextPanel-as-slot. `docs/wireframes.md` still includes a multi-agent hub and other wishlist chrome. Stack is locked: shadcn + Geist + `next-themes` dark default; no Vercel AI SDK; no new packages unless a phase prompt lists them.

This change is a **docs/spec overlay**. Pixel work happens in later playbook phases against this contract.

## Goals / Non-Goals

**Goals:**

- One IA (five destinations, first-run on Notes, Sources vs Tools).
- One visual language (conversation chrome on Chat/Agent, writing chrome on Notes) using existing tokens.
- Playbook session order unchanged; wireframes marketplace sketches no longer win for v1 chrome.

**Non-Goals:**

- Implementing shell, notes, chat, or agent in this change.
- New fonts, UI kits, or animation libraries.
- Backend changes.

## Decisions

### 1. Contract overlay, not a parallel playbook
**Choice:** Update `docs/wireframes.md` and add `docs/ui-language.md`; point `frontend-stack.md` / `AGENTS.md` / `update_blueprint.md` at them. Keep `final-blueprint.md` session order.
**Why:** Skipping 1.7–1.11 would violate `AGENTS.md` and leave auth unfinished. Auth screens are the first place this language appears.
**Alternative:** New playbook from scratch — rejected, too much rework.

### 2. Steal conversation chrome, not chat-as-home
**Choice:** Chat/Agent use a ~42rem centered column, sticky rounded composer, streaming caret, citation/tool chips, slim thread rail. Landing stays `/notes`.
**Why:** Claude/GPT/Grok quality is the conversation surface, not the IA. Knowledge-first matches RAG + agent tools.
**Alternative:** Chat as home like ChatGPT — rejected; empty workspace has nothing to cite.

### 3. Mode via nav, not a model picker
**Choice:** Separate Chat and Agent nav items; shared composer chrome; different placeholders and inspectors.
**Why:** Backend is two routes, not N models. A picker would lie.
**Alternative:** Tabs on one `/ai` page — weaker mental model, easier to merge parsers.

### 4. No marketplace, no fake confirms
**Choice:** Single Agent destination; persistent “can create and edit notes” hint; no confirm the API ignores.
**Why:** Coming-soon cards and fake dialogs train distrust.
**Alternative:** Hub with greyed cards — rejected for v1.

### 5. Tokens only — no new packages
**Choice:** Restyle `globals.css` variables (deeper dark, softer borders, larger composer radius) in Phase 2; keep Geist.
**Why:** Phase prompts forbid unlisted installs. Geist is already close to current AI-app type.
**Alternative:** New serif for assistant (Claude-like) — rejected until a phase explicitly allows a font package.

### 6. Notebooks as filter
**Choice:** List+create only until OpenAPI shows richer notebook APIs.
**Why:** `docs/backendGuide.md` documents `GET/POST /notebooks/` only.

### 7. Cmd-K stays Phase 7
**Choice:** Power-user overlay; `POST /ai/test-search` remains diagnostic.
**Why:** Chat is the Q&A surface (`ai-modes` already says this).

## Risks / Trade-offs

- [Agents paint marketplace from old wireframes] → Overlay language in wireframes + AGENTS.md; specs MUST win for chrome.
- [Visual language drifts per phase] → `docs/ui-language.md` is the token/layout source; Phase 2 establishes CSS variables once.
- [Conversation column too narrow on files] → Density split: only Chat/Agent use the 42rem column.
- [User expects skip-to-UI] → This change does not implement product UI; next code is still 1.7.

## Migration Plan

1. Apply this change: write docs + archive specs later.
2. Resume Phase 1 at 1.7 through login/register (centered auth, 429).
3. Phase 2: quiet sidebar, five destinations, token pass.
4. Phase 3–4: writing/library density + first-run empty + indexing lag.
5. Phase 5–6: conversation chrome, chips, Sources/Tools.
6. Rollback: revert the overlay docs; playbook order is unchanged.

## Open Questions

None that block the contract. Composer placeholder copy can be tuned in Phase 5/6 without changing specs.
