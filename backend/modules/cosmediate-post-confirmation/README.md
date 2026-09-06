# cosmediate-post-confirmation

Cognito **Post confirmation** trigger Lambda. Ensures a Postgres **Identity + Patient** row exists **after** the pool user is confirmed and **before** PreTokenGeneration needs `cognitoSub` → Identity claims.

Not an HTTP API — attach this Lambda to the user pool **Post confirmation** trigger in AWS.

## Why it exists

| Problem | Fix |
|---------|-----|
| Brand-new **Google** patient: PreSignUp allows signup, but Identity was only created in `signin-oauth` **after** code exchange | Create Identity here, so PreToken can issue tokens on first login |
| Staff / native signup already have Identity | Idempotent skip (lookup by `cognitoSub` or `email`) |

`cosmediate-authentication` `signin-oauth` still provisions as a **fallback** if this trigger misses; normal OAuth-first path should hit PostConfirmation first.

## When Cognito runs this trigger

Fires **once** when a user becomes **CONFIRMED**:

| `triggerSource` | Typical path |
|-----------------|--------------|
| `PostConfirmation_ConfirmSignUp` | Native email confirm **or** federated user auto-confirmed in PreSignUp |
| `PostConfirmation_ConfirmForgotPassword` | Password reset confirm — **passthrough only** (no provisioning) |

### Google-first (new email) — no email code

```
Hosted UI Google
  → PreSignUp (allow + autoConfirm)
  → ★ PostConfirmation (provision Identity)
  → FE code exchange → PreToken (claims OK) → POST /auth/sign-in
```

### Email/password signup — email code first

```
POST /auth/sign-up → Identity UNCONFIRMED in Postgres
  → user enters code → ConfirmSignUp
  → ★ PostConfirmation (Identity already exists → skip)
  → verification API sets ACTIVE → sign-in
```

## Layout

```
index.mjs                 — thin handler
lib/
  post-confirmation.mjs   — runPostConfirmation (main)
  provision-patient.mjs   — createIdentityWithProfile + EventBridge INSERT
  resolve-profile.mjs     — firstName / lastName from Cognito attributes
```

Shared layer (not in this module):

- `/opt/nodejs/lib/auth/triggers/pool-stage-config.mjs` — stage + env URLs
- `/opt/nodejs/services/prisma/identity/*` — read / write
- `/opt/nodejs/services/auth/cognito-linking.mjs` — `linkedProviders` slugs

## Provisioning rules

1. Skip if Identity exists by `cognitoSub` (not deleted).
2. Skip if Identity exists by `email` (staff create, native signup API).
3. Else create **PATIENT**, `ACTIVE`, default patient `perms`.
4. OAuth-first: `passwordSet: false`, `linkedProviders` from Cognito identities.
5. Orphan native edge: `passwordSet: true`, empty `linkedProviders`.

On failure the handler **throws** (fail-closed) so CloudWatch shows errors; Cognito may retry the trigger.

## Lambda environment

Same pattern as `cosmediate-pre-auth-signup` / `cosmediate-pre-auth-token-gen`:

| Variable | Purpose |
|----------|---------|
| `COGNITO_POOL_ID_DEV` / `COGNITO_POOL_ID_PROD` | Pool → stage map |
| `POSTGRES_DB_URL_DEV` / `POSTGRES_DB_URL_PROD` | Prisma / Identity |
| `EVENT_BUS_NAME_DEV` / `EVENT_BUS_NAME_PROD` | Patient INSERT index event (warn + skip emit if missing) |

## AWS setup

1. Create Lambda `cosmediate-post-confirmation` (Node, shared layer).
2. User pool → **Triggers** → **Post confirmation** → this function.
3. Grant Cognito permission to invoke the Lambda (console usually adds this).
4. IAM: VPC/RDS access if needed, `events:PutEvents` for EventBridge.

## Related triggers

| Lambda | Role |
|--------|------|
| `cosmediate-pre-auth-signup` | PreSignUp — block duplicates, auto-link OAuth, auto-confirm federated |
| `cosmediate-post-confirmation` | **This** — provision Identity before first tokens |
| `cosmediate-pre-auth-token-gen` | PreToken — JWT `role`, `identityId`, `entityId` from Identity |

See `modules/cosmediate-authentication/README.md` and `docs/system-design/auth/OAUTH_AUTO_LINKING.md` for the full auth story.
