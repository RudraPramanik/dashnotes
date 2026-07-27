## 1. OpenSpec project context

- [x] 1.1 Fill `openspec/config.yaml` `context` with product identity (Next.js frontend for FastAPI DashNoteSystem), stack summary, doc map, current phase note from `PROGRESS.md`, and frontend laws
- [x] 1.2 Add `rules` for `proposal` and `tasks` artifacts (keep proposals concise; respect AGENTS hard rules; no invented API routes; cite OpenAPI for fields)

## 2. Baseline specs archive readiness

- [x] 2.1 Confirm delta specs exist for `project-context`, `auth-tenancy`, `workspace-content`, `ai-modes`, and `client-ops` under this change
- [x] 2.2 Run `openspec validate bootstrap-app-context` and fix any formatting issues
- [x] 2.3 After apply/validation, archive via `/opsx:archive` so specs land in `openspec/specs/<capability>/spec.md`

## 3. Sanity check against sources

- [x] 3.1 Spot-check auth/AI laws in specs against `docs/backendGuide.md` §§2–5 and this repo’s token storage rules (`sessionStorage` / Zustand, not localStorage)
- [x] 3.2 Spot-check stack bullets in `config.yaml` against `docs/frontend-stack.md` locked decisions
- [x] 3.3 Confirm no application source files under `app/` or `lib/` were modified by this change
