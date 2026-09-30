## Purpose

Public commercial marketing surface for DashNotes: product narrative, display-only pricing, and auth CTAs that convert visitors into the existing login/register funnel without calling billing APIs.

## ADDED Requirements

### Requirement: Public commercial home for guests
Unauthenticated visitors MUST be able to open `/` and view the marketing landing without being redirected to login. The landing MUST present DashNotes as a workspace product for notes, files, RAG chat with citations, and an agent — in a commercial, editorial layout (ChatGPT / Anthropic class density), distinct from authenticated app chrome.

#### Scenario: Guest opens home
- **WHEN** an unauthenticated user navigates to `/`
- **THEN** the marketing landing MUST render (not redirect to `/auth/login`)
- **AND** the page MUST include a hero with brand, one headline, supporting copy, and a primary CTA into registration

### Requirement: Four-section single-page composition
The landing MUST be a single route `/` with in-page sections reachable by anchors: hero, product, pricing, and closing CTA. Section count MUST stay at three to four primary sections (no dense feature dashboard).

#### Scenario: Anchor navigation
- **WHEN** the user activates Product or Pricing nav links
- **THEN** the page MUST scroll to the corresponding in-page section (`#product`, `#pricing`) without leaving `/`

### Requirement: Product section shows static UX story
The product section MUST communicate Notes → Files → Chat (citations) → Agent using static marketing visuals and short copy. It MUST NOT require live API sessions, streaming demos, or authenticated data.

#### Scenario: Guest views product
- **WHEN** a guest views the product section
- **THEN** they MUST see a non-interactive product story or static app-chrome mock
- **AND** no protected API calls MUST be required to render that section

### Requirement: Display-only pricing tiers
The pricing section MUST show three tiers labeled Free, Standard, and Max with short feature bullets and CTAs. Tier selection MUST NOT invoke payment providers, checkout, or plan-enforcement APIs. CTAs MUST route into existing auth registration, optionally preserving a `plan` query hint for UX only.

#### Scenario: Guest chooses Standard
- **WHEN** a guest activates the Standard plan CTA
- **THEN** the client MUST navigate to `/auth/register` (with `plan=standard` or equivalent query allowed)
- **AND** the client MUST NOT call any payment or billing endpoint

#### Scenario: Guest chooses Free
- **WHEN** a guest activates the Free plan CTA
- **THEN** the client MUST navigate to `/auth/register` (or equivalent start-auth path)
- **AND** no payment flow MUST start

### Requirement: Auth and product CTA wiring
Primary header actions MUST expose Log in → `/auth/login` and Get started (or equivalent) → `/auth/register`. Closing CTA MUST also enter the register path. Marketing MUST NOT invent new auth endpoints.

#### Scenario: Log in from marketing
- **WHEN** a guest activates Log in on the landing
- **THEN** the client MUST navigate to `/auth/login`

#### Scenario: Get started from hero
- **WHEN** a guest activates the hero primary CTA
- **THEN** the client MUST navigate to `/auth/register`

### Requirement: Marketing does not weaken protected routes
All existing authenticated app destinations (notes, files, chat, agent, settings) MUST remain cookie-gated. Marketing public access MUST be limited to the home landing and existing `/auth/*` paths (plus static/assets already public).

#### Scenario: Guest tries notes
- **WHEN** an unauthenticated user navigates to `/notes`
- **THEN** middleware MUST still redirect them to login (or equivalent unauthenticated handling)
- **AND** the notes shell MUST NOT render as a public page
