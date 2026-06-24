# DashNotes — Agent guardrails

Cursor loads this file automatically. **Do not paste these rules into every chat** — they apply to all sessions.

## Project context

- **App:** DashNotes — Next.js 16 App Router frontend for a FastAPI backend.
- **Progress:** Read `PROGRESS.md` first (current phase, last step, blockers).
- **Current work:** Follow the active step file only — `docs/steps/P0.md`, `P1.md`, etc.
- **Contracts:** `docs/backend-frontend-contract.md`, `docs/frontend-stack.md`.

Implement **only** the step prompt in the active session. Do not skip ahead or batch steps unless the step file explicitly allows it.

---

## HARD RULES — read before writing any code

1. NEVER install packages not listed in the prompt. If you think something is missing, stop and ask.
2. NEVER create files outside the paths explicitly named in the prompt.
3. NEVER use `any` type in TypeScript. All types must be explicit.
4. NEVER use `localStorage` for tokens. Access token → `sessionStorage` key `dashnotes_at`. Refresh token → Zustand memory only.
5. NEVER send `workspace_id` on `/ai/*` routes. Tenant comes from JWT only.
6. NEVER parse citations from SSE token stream. Citations come from the `metadata` event only.
7. NEVER use a Zustand store for server data that TanStack Query already owns.
8. ALL React components must be named exports, except `page.tsx` files (default export allowed).
9. ALL async functions must have explicit return types.
10. ALL error states, loading states, and empty states are REQUIRED — not optional.
11. If a file already exists, edit it — never recreate it.
12. After writing each file, state: `Written: <filepath>` so progress is trackable.
13. `apiClient` 401 handling MUST use `isRetry` circuit breaker — second 401 NEVER calls refresh (Step 1.6).
14. `apiClient` MUST import `handleUnauthorized` from `lib/auth/token-refresh.ts` — never inline `clearSession` on first 401.
15. Do NOT wrap `(app)/layout` main content in `GlobalErrorBoundary` — it lives only in `app/layout.tsx`.
16. Follow `docs/backend-frontend-contract.md` for auth refresh and `indexing_status` fields.

---

## After each step

1. Run that step's **Validation** script from the step file.
2. On PASS, append to `PROGRESS.md` and update the **Current** table.
3. Commit only when the user asks.

---

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->
