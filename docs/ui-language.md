# DashNotes — Visual language (v1)

Implementation overlay for chrome and conversation/writing density. Stack stays **shadcn + Geist + `next-themes`**. No new fonts, UI kits, or Vercel AI SDK.

Companion: `docs/wireframes.md` (v1 IA overlay), OpenSpec `lock-v1-ui-contract`.

---

## Density split

| Surface | Density | Hero |
|---------|---------|------|
| Chat, Agent | Conversation | Centered ~42rem column, sticky composer, streaming caret |
| Notes, Files | Writing / library | Document or file content, not a transcript |
| Auth | Quiet centered card | Generous type, inline 429 countdown |

All authenticated surfaces share dark-first tokens, quiet sidebar, Geist sans + mono.

---

## Conversation chrome (Chat and Agent)

- Centered message column, generous vertical whitespace, assistant markdown with comfortable line-height.
- Sticky rounded composer at the bottom; send control; no model-picker dropdown.
- Slim thread/session rail labeled **Your conversations** (current user, not workspace-shared chat).
- Empty Chat: centered prompt + composer — not an empty data table.

**Placeholders**

| Mode | Placeholder intent |
|------|--------------------|
| Chat | Ask about your notes and files… |
| Agent | Ask the assistant to search or create a note… |

**Trust chips**

- Chat: citation chips after `metadata` (`title`, `relevance_score`, open note when `note_id` is present). No fabricated excerpts.
- Agent: inline tool blocks on `tool_start` / `tool_end` plus Tools panel.
- Streaming: caret (or equivalent) while tokens arrive.

---

## Auth screens

Centered `min-h-screen` layout, `bg-background`, product name as heading, form card. Errors inline (not toasts). 429 shows Retry-After countdown.

---

## Tokens

Restyle via existing CSS variables in `app/globals.css` (deeper dark, softer borders, larger composer radius in Phase 2). Do not add packages for visual language.
