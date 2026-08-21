# DashNotes — Build Progress

**For AI catchup** — read this first in a new session, then open the current phase file (`docs/steps/P0.md`, `P1.md`, …).

## Current

| Field | Value |
|-------|-------|
| Phase | P1 |
| Last completed step | 1.11 — Register page (`pnpm build` PASS) |
| Next step | Archive `ship-v1-e2e` (`/opsx:archive`) |
| Product program | `ship-v1-e2e` — see `docs/BUILD.md` |
| Branch | `feat/phase-0-foundation` |

## Completed

- [x] 0.1 — core deps installed
- [x] 0.2 — shadcn init + base component set
- [x] 0.3 — ThemeProvider, ThemeToggle, globals.css slate vars
- [x] 0.4 — RootProvider, QueryProvider, Toaster wired in layout
- [x] 0.5 — route group scaffolding (auth + app placeholders)
- [x] 0.6 — GlobalErrorBoundary, AiErrorBoundary, layout wrap
- [x] 1.2 — SSE parser (`lib/api/sse-parser.ts`)
- [x] 1.3 — Auth store (`lib/stores/auth-store.ts`)
- [x] 1.4 — Token utilities (`lib/auth/token.ts`)
- [x] 1.5 — Token refresh coordinator (`lib/auth/token-refresh.ts`)
- [x] 1.6 — API client (`lib/api/client.ts`)
- [x] 1.7 — Stream guard (`lib/hooks/use-stream-guard.ts`)
- [x] 1.8 — API stubs + OpenAPI types
- [x] 1.9 — middleware presence cookie
- [x] 1.10 — Login page
- [x] 1.11 — Register page

## Notes

- shadcn CLI v4 (`@latest`) no longer exposes interactive Slate/Default prompts; init used v2.5.0 for `baseColor: slate`, then `@latest add` for components + `utils`.
- `ThemeToggle` is temporarily on `app/page.tsx` (top-right) for manual theme verification — remove when shell lands in Phase 2.
- **Architecture v3:** Patched steps live in `docs/update_blueprint.md` (OpenSpec change `adopt-architecture-v3-patch`). When Phase 2 starts, use this session order (from update_blueprint); **2.11 gates Phase 3**:
  - P2-A: 2.1 + 2.2(revised) + 2.3
  - P2-B: 2.4
  - P2-C: 2.5
  - P2-D: 2.6(cleaned)
  - P2-E: 2.7
  - P2-F: 2.8
  - P2-G: 2.9(revised) — ContextPanel-as-slot in this session
  - P2-H: 2.10
  - P2-I: 2.11(new) — OpenAPI types; nothing in Phase 3 until PASS
  - Stub step file when needed: `docs/steps/P2.md` (point at update_blueprint for revised prompts).

## Validation log

```
0.1 PASS
0.2 PASS
0.3 PASS
0.4 PASS
0.5 PASS
0.6 PASS
1.2 PASS
1.3 PASS
1.4 PASS
1.5 PASS
1.6 PASS
1.6-patch PASS
1.7 PASS
1.8 PASS
1.9 PASS
1.10 PASS
1.11 PASS
pnpm build PASS
```
