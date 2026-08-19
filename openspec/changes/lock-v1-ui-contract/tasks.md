## 1. Visual language doc

- [ ] 1.1 Add `docs/ui-language.md`: density split (conversation vs writing), composer rules, citation/tool chips, token constraints (existing shadcn/Geist only), auth-screen language, Chat vs Agent placeholders — no new packages.

## 2. Wireframes overlay

- [ ] 2.1 Edit `docs/wireframes.md`: v1 nav is Notes / Files / Chat / Agent / Settings; default `/notes`; Agent is a single destination; ContextPanel meaning by route; first-run empty Notes coach; threads copy is current-user conversations.
- [ ] 2.2 Edit `docs/wireframes.md`: mark marketplace, automation inbox, workspace switcher, citation excerpts, required `indexing_status`, and required `/health/ai` as deferred — not live chrome. Citation chips use OpenAPI fields only.

## 3. Playbook pointers

- [ ] 3.1 Edit `docs/frontend-stack.md` to point Phase 2+ chrome at `docs/ui-language.md` and the v1 wireframe overlay.
- [ ] 3.2 Edit `docs/update_blueprint.md` protocol overlay: v1 UI contract overlays marketplace sketches; session order unchanged.
- [ ] 3.3 Edit `AGENTS.md` with a short pointer: v1 chrome follows `docs/ui-language.md` + updated `docs/wireframes.md`; do not skip remaining Phase 1.

## 4. Validate

- [ ] 4.1 Run `openspec validate lock-v1-ui-contract --strict` and fix any spec issues.
- [ ] 4.2 Confirm `PROGRESS.md` still lists next product step as **1.7** — this change MUST NOT implement shell, notes, chat, or agent UI.
