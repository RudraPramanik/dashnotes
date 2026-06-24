# Dev progress

**For AI catchup** — read this first in a new session, then open the current phase file (`docs/steps/P0.md`, `P1.md`, …).

## What to record

After each step **PASS** (validation script succeeds), append one line:

```
- [x] 0.3 — ThemeProvider, ThemeToggle, globals.css vars
```

After the **last step in a session** (or phase complete): update **Current** below, note any blockers or deviations, and commit if requested.

## Current

| Field | Value |
|-------|-------|
| Phase | P0 |
| Last completed step | 0.2 |
| Next step | 0.3 |
| Branch | — |

## Completed steps

- [x] 0.1 — core deps installed
- [x] 0.2 — shadcn init + base component set

## Notes / blockers

- shadcn CLI v4 (`@latest`) no longer exposes interactive Slate/Default prompts; init used v2.5.0 for `baseColor: slate`, then `@latest add` for components + `utils`.
