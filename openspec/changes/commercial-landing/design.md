## Context

See `proposal.md` for motivation. Today `app/page.tsx` always redirects, and `middleware.ts` treats only `/auth/*` and `/api/*` as public while forcing `/` → login for guests. Auth screens and app shell already exist; there is no billing stack. This change adds a frontend-only marketing surface on `/` and widens public-path rules without touching FastAPI.

## Goals / Non-Goals

**Goals:**
- Ship a ChatGPT/Anthropic-class single-page landing with hero, product, pricing, closing CTA.
- Wire CTAs into existing `/auth/login` and `/auth/register`.
- Keep authed `/` → `/notes`.
- Keep protected app routes gated.

**Non-Goals:**
- Payment providers, plan entitlements, or backend pricing APIs.
- Interactive live product demo against the API.
- Redesigning auth forms or app chrome visual language.
- New npm packages unless an existing stack gap blocks layout (prefer Tailwind + shadcn only).

## Decisions

### 1. Single route `/` with anchors (not `/product` + `/pricing`)
**Choice:** One marketing page; nav uses `#product` / `#pricing`.  
**Why:** Matches ChatGPT-style density and your “3/4 sections” brief; fewer public routes to gate.  
**Alt considered:** Separate marketing routes — deferred until SEO/share needs appear.

### 2. Distinct marketing visual lane, same font stack
**Choice:** Editorial marketing layout (generous whitespace, strong brand hero, restrained motion) that may use lighter/darker contrast than quiet app chrome, but stay on Geist + existing CSS variables / Tailwind — no new font packages (AGENTS.md / ui-language constraint on stack).  
**Why:** Reads commercial without violating “no new fonts/UI kits.” Auth pages remain centered cards.  
**Alt considered:** Pixel-match app chrome — rejected for looking too “tool UI” for a commercial first viewport.

### 3. Product section = static chrome mock + short story
**Choice:** Non-interactive mock of Notes / Chat / citations / Agent flow (CSS/HTML illustration or static composition), not a live session.  
**Why:** Best UX for guests (instant, trustworthy, no auth/API dependency); avoids demos breaking on 503 LLM.  
**Alt considered:** Interactive sandbox — deferred; heavier and needs API.

### 4. Pricing is presentational only
**Choice:** Free / Standard / Max cards; CTAs → `/auth/register?plan=free|standard|max`. Register form may ignore `plan` for now; query is reserved for a future billing change.  
**Why:** Commercial completeness without inventing payment APIs.  
**Alt considered:** Hide pricing until Stripe — rejected; you want the commercial section now.

### 5. Component layout under `components/marketing/`
**Choice:** `LandingPage` composition + section leaves (`Hero`, `Product`, `Pricing`, `ClosingCta`, `MarketingNav`, `MarketingFooter`). `app/page.tsx` becomes a thin server page that renders the landing for the default export; middleware handles authed redirect so the page itself does not need cookie logic if middleware already redirects authed users away from `/` before render — keep that behavior in middleware for one source of truth.  
**Why:** Named exports, SRP, easy to style without polluting `(app)` shell.

### 6. Middleware public-path update
**Choice:** Extend `isPublicPath` so exact `/` is public; keep `/auth/*` and `/api/*`. Authed users on `/` still redirect to `/notes`. Do not mark `/notes` etc. public.  
**Why:** Minimal change to the existing gate; matches auth-tenancy delta.

### 7. Metadata
**Choice:** Update root `metadata` title/description to DashNotes product copy (or landing-specific `generateMetadata` on `page.tsx` if preferred).  
**Why:** Current “Create Next App” metadata is wrong for a commercial surface.

## Risks / Trade-offs

- **[Risk] Marketing look drifts from app chrome** → Mitigation: same Geist + token family; document marketing as a separate surface in a short note under `docs/ui-language.md` or BUILD route map only (no new design system).
- **[Risk] `?plan=` unused confuses future billing** → Mitigation: document in design/tasks as reserved; do not invent fake checkout success states.
- **[Risk] Guest `/` + authed redirect race** → Mitigation: keep redirect exclusively in middleware (already pattern for `/`).
- **[Trade-off] Static mock vs live demo** → Accept less “wow”; gain reliability and no API coupling.

## Migration Plan

1. Land middleware public `/` + landing components behind normal frontend deploy.
2. Smoke: guest `/` shows landing; guest `/notes` still redirected; authed `/` → `/notes`; CTAs hit auth routes.
3. Rollback: restore previous `page.tsx` redirect + middleware public-path list if needed.

## Open Questions

- Exact Free/Standard/Max bullet copy and dollar amounts (placeholders OK for v1 marketing).
- Whether register should surface the chosen plan label in UI later (out of scope until billing).
