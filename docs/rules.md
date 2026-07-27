1. NEVER install packages not listed in the prompt. If you think something is missing, stop and ask.
2. NEVER create files outside the paths explicitly named in the prompt.
3. NEVER use `any` type in TypeScript. All types must be explicit.
4. NEVER use `localStorage` for tokens. Access token → sessionStorage key `dashnotes_at`. Refresh token → Zustand memory only.
5. NEVER send workspace_id on /ai/* routes. Tenant comes from JWT only.
6. NEVER use a Zustand store for server data that TanStack Query already owns.
7. ALL React components must be named exports, except page.tsx files (default export allowed).
8. ALL async functions must have explicit return types.
9. ALL error states, loading states, and empty states are REQUIRED — not optional.
10. If a file already exists, edit it — never recreate it.
11. After writing each file, state: "Written: <filepath>" so progress is trackable.
12. apiClient 401 handling MUST use isRetry circuit breaker — second 401 NEVER calls refresh (see Step 1.6).
13. apiClient MUST import handleUnauthorized from lib/auth/token-refresh.ts — never inline clearSession on first 401.
14. Follow docs/backend-frontend-contract.md for auth refresh.