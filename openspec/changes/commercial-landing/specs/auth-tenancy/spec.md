## ADDED Requirements

### Requirement: Unauthenticated home serves marketing
When the `dashnotes_authed` cookie is absent, the client MUST treat `/` as a public marketing route and MUST NOT redirect guests from `/` to `/auth/login` solely because they are unauthenticated. Authenticated visitors who open `/` MUST still be sent into the app default (`/notes`). Token storage, refresh, and JWT tenancy rules are unchanged.

#### Scenario: Guest home is public
- **WHEN** an unauthenticated request hits `/`
- **THEN** middleware MUST allow the marketing page through as a public path
- **AND** MUST NOT force a login redirect for `/` alone

#### Scenario: Authed home still enters app
- **WHEN** an authenticated request (present `dashnotes_authed` cookie) hits `/`
- **THEN** the client MUST redirect to `/notes`
