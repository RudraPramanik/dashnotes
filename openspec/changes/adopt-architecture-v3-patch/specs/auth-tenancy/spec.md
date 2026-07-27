## MODIFIED Requirements

### Requirement: Refresh on 401 with circuit breaker
On `401` from a protected API call, the client MUST attempt refresh via the shared token-refresh coordinator exactly once per request chain (`isRetry` circuit breaker). A second `401` MUST NOT call refresh again; the session MUST be cleared and the user sent to login. JSON request methods and `apiClient.stream` MUST share one internal 401-retry helper (e.g. `executeWithAuthRetry`); they MUST NOT each re-implement the circuit breaker. Refresh MUST go through `handleUnauthorized` from `lib/auth/token-refresh.ts` — never an inlined first-401 `clearSession` path.

#### Scenario: Expired access token
- **WHEN** a protected request returns `401` and refresh succeeds
- **THEN** the client MUST retry the original request once with the new access token

#### Scenario: Refresh also fails
- **WHEN** refresh fails or a retried request still returns `401`
- **THEN** the client MUST clear the session and require login

#### Scenario: Shared retry helper for JSON and stream
- **WHEN** both a JSON `apiClient.get` and an `apiClient.stream` call hit `401`
- **THEN** both paths MUST use the same internal retry helper
- **AND** `handleUnauthorized` MUST NOT be invoked on the retry pass for either path
