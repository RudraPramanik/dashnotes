## 1. Public routing

- [x] 1.1 Update `middleware.ts` so exact `/` is public for guests while authenticated `/` still redirects to `/notes`
- [x] 1.2 Confirm `/notes` and other app routes remain gated for unauthenticated users
- [x] 1.3 Replace `app/page.tsx` redirect-with-render so guests see the marketing landing (middleware remains source of truth for authed `/`)

## 2. Marketing composition

- [x] 2.1 Add `components/marketing/` leaves: `MarketingNav`, `Hero`, `ProductSection`, `PricingSection`, `ClosingCta`, `MarketingFooter` (named exports)
- [x] 2.2 Add `LandingPage` composer that stacks hero → product → pricing → closing CTA (3–4 sections) with `#product` / `#pricing` anchors
- [x] 2.3 Style as commercial editorial surface (ChatGPT/Anthropic density) using Geist + existing tokens/Tailwind — no new font or UI-kit packages
- [x] 2.4 Build static product mock telling Notes → Files → Chat/citations → Agent (no live API calls)

## 3. Auth and pricing CTAs

- [x] 3.1 Wire nav/hero/closing CTAs to `/auth/login` and `/auth/register`
- [x] 3.2 Implement Free / Standard / Max pricing cards with placeholder copy/prices; CTAs to `/auth/register?plan=free|standard|max` (display-only; no payment)
- [x] 3.3 Ensure register/login forms still work when `plan` query is present (ignore is OK; do not invent billing UI)

## 4. Metadata and docs

- [x] 4.1 Update root (or page) metadata title/description from Create Next App to DashNotes commercial copy
- [x] 4.2 Note in `docs/BUILD.md` and/or `docs/wireframes.md` that guest `/` is marketing and authed `/` still lands on `/notes`

## 5. Verification

- [x] 5.1 Smoke: guest `/` renders landing; anchors scroll; CTAs hit auth routes
- [x] 5.2 Smoke: guest `/notes` still redirects to login; authed `/` redirects to `/notes`
- [x] 5.3 Smoke: pricing CTAs never call payment endpoints; page loads with no protected API dependency
