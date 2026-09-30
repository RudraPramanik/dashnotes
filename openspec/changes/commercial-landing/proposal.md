## Why

Unauthenticated visitors currently land on `/auth/login` with no product story. DashNotes needs a commercial, enterprise-grade marketing page (ChatGPT / Anthropic style) so visitors understand the product and can enter the existing auth funnel before billing exists.

## What Changes

- Replace the unauthenticated `/` redirect with a frontend-only marketing landing page (hero, product, pricing, closing CTA).
- Keep authenticated `/` → `/notes` behavior.
- Wire all primary CTAs to existing `/auth/login` and `/auth/register` (optional `?plan=` query for UX only).
- Add a display-only Free / Standard / Max pricing section — no payment provider, no plan enforcement API.
- Treat marketing as a distinct visual surface (commercial / editorial), separate from quiet app chrome; auth screens stay as they are.
- Expand middleware public paths so `/` (and marketing assets) are reachable without `dashnotes_authed`.
- Update root metadata (title/description) for the product brand.

## Non-goals

- No Stripe / checkout / billing APIs.
- No backend plan limits or entitlement checks.
- No interactive live-demo against the API on the landing page.
- No new auth providers or redesign of login/register forms.
- No new npm packages beyond what AGENTS.md / stack already allow (prefer existing Tailwind + shadcn).

## Capabilities

### New Capabilities
- `marketing-landing`: Public commercial landing at `/` with product narrative, display pricing tiers, and CTA wiring into existing auth routes.

### Modified Capabilities
- `auth-tenancy`: Unauthenticated home routing changes from forced login redirect to public marketing landing; authenticated home remains `/notes`.

## Impact

- Frontend only: `app/page.tsx`, new marketing components, `middleware.ts` public-path rules, root `metadata`.
- Docs touch: `docs/BUILD.md` / wireframes route map note that `/` is marketing for guests.
- No FastAPI / OpenAPI changes.
- Auth cookie and token rules unchanged.
