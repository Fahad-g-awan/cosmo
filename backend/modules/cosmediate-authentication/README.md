# cosmediate-authentication

Sign-up, sign-in (native + OAuth), password flows, verification, sessions, and OAuth provider linking.

Platform registry and permission-grant APIs live in **cosmediate-platform**.

## Routes (auth Lambda)

| Area | Paths |
|------|--------|
| Sign-up / verify | `POST /auth/sign-up`, `POST /auth/confirm-signup`, `POST /auth/confirm-signup/resend` |
| Sign-in / out | `POST /auth/sign-in`, `POST /auth/logout`, `POST /auth/tokens/refresh` |
| Session profile | `GET /auth/me`, `GET /auth/me/methods` |
| Password | `POST /auth/password/*` |
| OAuth link (logged-in) | `POST /auth/oauth/link/start`, `POST /auth/oauth/link/callback` |

## Layout

```
controllers/             — thin handlers (call services with ctx), same as patients/admins
services/
  signin.service.mjs
  signin-native.service.mjs
  signin-oauth.service.mjs
  signup.service.mjs
  logout.service.mjs
  oauth-link.service.mjs — Pattern 1 provider linking
  password.service.mjs             — update / set-new (OAuth-first) / forgot / reset
  lib/password-guards.mjs
  lib/password-cognito.mjs
  verification.service.mjs
  tokens.service.mjs
  me.service.mjs
lib/
  routes.mjs
  identity.mjs
  identity-updates.mjs
  patient-provision.mjs
  session.mjs
  signin-response.mjs
  linked-providers.mjs
docs/
  OAUTH_FLOWS.md
index.mjs
```

## Cognito triggers (separate Lambdas)

- `cosmediate-pre-auth-signup` — PreSignUp auto-link / block scenarios
- `cosmediate-post-confirmation` — PostConfirmation: provision OAuth-first patient Identity before PreToken
- `cosmediate-pre-auth-token-gen` — JWT claims from Identity (`role`, `entityId`, …)

See `docs/OAUTH_FLOWS.md` for the full linking story.
