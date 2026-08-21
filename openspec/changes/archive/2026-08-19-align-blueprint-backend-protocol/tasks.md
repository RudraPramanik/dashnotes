## 1. Protocol copy and agent laws

- [x] 1.1 Sync `docs/backendGuide.md` from sibling `dashnotesystemv1/docs/documentation/frontendguide.md` (or latest local copy); replace “this repo is API-only” with a DashNotes protocol-copy header and sibling path; keep DashNotes token rule (sessionStorage + memory, never localStorage for tokens)
- [x] 1.2 Add a **Protocol overlay** section to the top of `docs/final-blueprint.md` and `docs/update_blueprint.md`: precedence (OpenAPI → backendGuide → playbook), mismatch table (SSE `type`, citations, `/workspaces/me`, `POST /ai/test-search`, wishlist fields)
- [x] 1.3 Update `AGENTS.md` contracts list and HARD RULES: JSON `type` in `data:` for SSE; OpenAPI citation fields; do not require `indexing_status` until OpenAPI lists it; protocol overlay applies to all steps
- [x] 1.4 Update `openspec/config.yaml` context (doc map, protocol precedence, indexing law) to match this change

## 2. Contract and stack docs

- [x] 2.1 Split `docs/backend-frontend-contract.md` into **Live (OpenAPI)** vs **Deferred** (`indexing_status`, `GET /health/ai`, switch-workspace, automation SSE); keep refresh + 401 circuit breaker as Live
- [x] 2.2 Update `docs/frontend-stack.md` env examples to `NEXT_PUBLIC_API_BASE_URL` with `NEXT_PUBLIC_API_URL` alias; point workspace label at `GET /workspaces/me`; note SSE `type` in AI streaming section
- [x] 2.3 Fix `docs/backendapi.md` drift that contradicts the protocol (`POST /ai/test-search`, current-workspace `GET /workspaces/me`) or add a banner that `docs/backendGuide.md` + OpenAPI supersede it

## 3. Playbook step patches

- [x] 3.1 Patch `docs/final-blueprint.md` step 2.4 (and `docs/steps` if duplicated): `GET /workspaces/me` for workspace name, not `GET /workspaces`
- [x] 3.2 Patch steps 2.5 / 2.6: `/health/ai` and automation SSE are optional/deferred; 404 must not fail the shell
- [x] 3.3 Patch steps 3.2–3.3 and 4.3: indexing UX without required `indexing_status`; optional field if present; do not infer from empty tags
- [x] 3.4 Patch steps 5.2 and 6.1 (and v3 notes in `docs/update_blueprint.md`): parse `JSON.parse(data).type`; OpenAPI citation shape; do not switch on SSE `event === 'token'`
- [x] 3.5 Patch step 7.2: `POST /ai/test-search` with `{ query_text, limit? }`; patch 7.3 recents to avoid `localStorage` (in-memory or sessionStorage non-token key)
- [x] 3.6 Mirror the same patches in `docs/steps/P1.md` and any later `docs/steps/P*.md` that still contain the old routes/SSE/citation text

## 4. Small runtime aliases (no new packages)

- [x] 4.1 Resolve API origin as `NEXT_PUBLIC_API_BASE_URL || NEXT_PUBLIC_API_URL` in `lib/api/client.ts` and `lib/auth/token.ts`
- [x] 4.2 Comment `lib/api/sse-parser.ts` that live `/ai/*/stream` frames use `data:` JSON `type` (default SSE `event` is `"message"`); add `parseSseJsonData` helper only if it stays in the same file and needs no new deps

## 5. Verify

- [x] 5.1 Grep playbook + steps for `GET /ai/test-search`, `GET /workspaces` (without `/me`), `event === 'token'`, `source_id`, and required-only `indexing_status`; leftover hits must be wishlist-labeled or removed
- [x] 5.2 Run `openspec validate --change align-blueprint-backend-protocol --strict` and confirm `pnpm build` still passes (env alias only)
