# Account Linking & Cross-Method Auth — Design Doc

**Status:** Proposed (NEXT, not blocking identity-upgrade)
**Owner:** Backend
**Scope:** Audit the current account-linking implementation end-to-end, fix the bugs that make it fragile today, and add a first-class "cross-method authentication" capability:

- Social signup → later add a password → sign in with email+password.
- Email/password signup → later link Google/Facebook/Apple → sign in with any.
- All linked methods resolve to **one** user row (one identity).

**Depends on:** `docs/identity-upgrade.md` is the ideal substrate for this. This doc assumes it lands first; notes are included for doing it on the current 4-table schema if we must ship earlier.

---

## 1. Scope of the audit

Files/flows inspected:

- `@e:\AXONYX\cosmediate\app\backend\modules\cosmediate-pre-auth-signup\index.mjs` — PreSignUp trigger (gatekeeper + auto-linker).
- `@e:\AXONYX\cosmediate\app\backend\modules\cosmediate-pre-auth-token-gen\index.mjs` — PreTokenGeneration trigger.
- `@e:\AXONYX\cosmediate\app\backend\modules\cosmediate-authentication\controllers\auth.mjs` — `authSignUp`, `authSignIn` (email+pwd and OAuth code exchange), `linkOAuthProvider`.
- `@e:\AXONYX\cosmediate\app\backend\modules\cosmediate-authentication\controllers\password.mjs` — `updatePassword`, `setNewPassword`, `forgotPassword`, `resetPassword`.
- `@e:\AXONYX\cosmediate\app\backend\modules\cosmediate-authentication\controllers\verification.mjs` — `signupConfirmation`, `resendSignupCode`.
- `@e:\AXONYX\cosmediate\app\backend\modules\cosmediate-authentication\lib\utils.mjs` — `getUserByEmail` (4-table fallback), `updateUser_LinkedProviders`, `updateUser_PasswordSet_Status`.

---

## 2. Current linking flow (as implemented)

### 2.1 "Email already exists → user signs in with Google" (auto-link)

1. Google IdP → Cognito → `PreSignUp_ExternalProvider` trigger fires.
2. Trigger looks up native user by email (`cognitoGetUserByEmail`). If found + CONFIRMED + this provider not already linked → it calls `AdminLinkProviderForUser` linking `Google/<providerUserId>` → native user's `sub`.
3. Trigger `return event` (does **not** block). Cognito proceeds to create the external-provider user anyway.
4. Hosted UI redirects with a code. `authSignIn({ code })` exchanges code for tokens, calls `cognitoGetUserByAccessToken`.
5. DB lookup by email finds the native row. If `oauthProvider` not in `linkedProviders[]`, push and persist.
6. `dbUser.sub !== cognitoOauthUser.sub` is **warned** but ignored.

### 2.2 Manual linking (`POST /auth/link-oauth-provider`)

1. Authenticated user completes a Hosted UI flow with a `state` indicating "link".
2. Controller exchanges the code, checks `oauthUser.email === authContext.email`.
3. **The actual `AdminLinkProviderForUserCommand` is commented out** (`auth.mjs` lines 811–828). Only the DB `linkedProviders` array is updated.

### 2.3 OAuth-only user later sets a password

1. Client calls `POST /auth/set-new-password` with the user's own `userId + email + password`.
2. Controller finds `cognitoUsername` via `ListUsers` filter `email = "..."`, picks the one whose `sub` matches `foundUser.sub`.
3. Calls `AdminSetUserPasswordCommand({ Username: cognitoUsername, Password, Permanent: true })`.
4. Flips `passwordSet=true` in DB.

### 2.4 Password user later wants to sign in with Google (same email)

Covered by §2.1 — same code path.

---

## 3. Bugs & sharp edges found

### 3.1 PreSignUp does not block the orphan OAuth user

File: `@e:\AXONYX\cosmediate\app\backend\modules\cosmediate-pre-auth-signup\index.mjs:99-227`.

After calling `AdminLinkProviderForUser` the code logs "Blocking OAuth account creation" but the `throw` is commented out (lines 194–202) and the handler `return event`s. Cognito therefore:

- Creates a new external-provider user row (`google_123…`) **in addition to** the linking record.
- That user now has its own `sub`, different from the native user's `sub`.
- On the very first post-link sign-in, Cognito may return tokens for either the native identity or the just-created external user (behavior is not deterministic across flows and SDK versions).

Symptoms downstream:

- `authSignIn` logs `Sub mismatch detected` (lines 507–515) and ignores it.
- `pre-token-gen` can't find a row by `sub` on first sign-in, so it falls back to `DEFAULT_ROLE` with default perms — authorizer then sees a weakly-permissioned token until the user signs in again.

**Fix direction:** re-enable the post-link block (throw `ProviderLinkedRetryException` or similar). Alternatively, always uppercase the provider name and link *before* Cognito creates the external user, then `event.response.autoConfirmUser=true` only on the retry path — but the "block + retry" pattern is the documented AWS workaround and should be restored.

### 3.2 "Manual link" endpoint does not actually link

File: `@e:\AXONYX\cosmediate\app\backend\modules\cosmediate-authentication\controllers\auth.mjs:811-828`.

`AdminLinkProviderForUserCommand` is commented out. We only push the provider name into the DB array. Consequence: subsequent Hosted UI sign-ins with that provider still create/use the orphan external user; the DB marker lies.

**Fix direction:** uncomment + adapt the command, use the capitalized provider name and `ProviderAttributeName: "Cognito_Subject"`, wrap in a transaction so the DB update only happens if the Cognito call succeeds.

### 3.3 Password flows assume a native Cognito user exists

`forgotPassword` (`password.mjs:464-473`) passes `Username: email` to `ForgotPasswordCommand`. For a user whose ONLY Cognito presence is `google_107…`, Cognito returns `UserNotFoundException`. Today we gate this with `!foundUser.passwordSet` (lines 450-462), which is correct **as long as `passwordSet` is accurate**. But:

- Newly created DB users via admin seeding can have `passwordSet=true` with no real Cognito user.
- If we add §4 ("OAuth user sets password") and the Cognito write fails partway, the flag drift locks users out.

`authSignIn` email+password path (`auth.mjs:310-354`) also silently falls through to `AdminInitiateAuth` against `email` when `ListUsers` returns 0 — same failure mode, with a worse error message.

**Fix direction:** treat `passwordSet` as a derived projection, not a source of truth; always resolve the Cognito username once and refuse the request if no native (Cognito-pool) identity exists.

### 3.4 Provider name capitalization is inconsistent

- `pre-auth-signup` capitalizes (`Google`) when calling `AdminLinkProviderForUser`.
- `authSignIn` lowercases (`google`) when storing in `linkedProviders`.
- `linkOAuthProvider` splits on `_` and lowercases, then re-capitalizes for messages.

Not a functional bug today, but any future `identities` comparison (e.g. "is this provider already linked?") will silently miss if the casing convention drifts again.

**Fix direction:** single constant `PROVIDER_NAMES = { GOOGLE: "Google", FACEBOOK: "Facebook", APPLE: "SignInWithApple" | "Apple" }` in `lib/auth/registry.mjs`. Always store lowercase in DB, always use the Cognito-native spelling when calling Cognito APIs.

### 3.5 OAuth provider detection fallbacks to `"google"`

File: `@e:\AXONYX\cosmediate\app\backend\modules\cosmediate-authentication\controllers\auth.mjs:424-436`.

When the Cognito username does **not** match the `provider_` pattern (which is exactly the "linked account" case — username is now the native email/UUID), we default to `oauthProvider = "google"` and append it to `linkedProviders`. A user who linked Facebook will end up with `linkedProviders = ["google", "facebook"]`.

**Fix direction:** read `event`/user `identities` attribute (JSON array of `{ providerName, userId, … }`) and use the entry whose `dateCreated` matches this session, or — simpler — trust the `identities` list as the source of truth and overwrite `linkedProviders` from it on every OAuth sign-in.

### 3.6 `getUserByEmail` 4-table cascade leaks identity across role tables

`@e:\AXONYX\cosmediate\app\backend\modules\cosmediate-authentication\lib\utils.mjs:17-46` scans `user → admin → specialist → clinicManager` in order and returns the first match. This is the exact anti-pattern `identity-upgrade.md` is retiring. Until identity-upgrade lands, this is the correct shim, but linking flows assume `prisma.user.update(...)` downstream (e.g. `updateUser_LinkedProviders`), which silently no-ops for an Admin/Specialist found by email.

**Fix direction:** make `updateUser_LinkedProviders`/`updateUser_PasswordSet_Status` dispatch on `entityType`, OR block linking flows from operating on non-patient roles until `Identity` exists.

### 3.7 Pre-token-gen returns default role on first OAuth login

`@e:\AXONYX\cosmediate\app\backend\modules\cosmediate-pre-auth-token-gen\index.mjs:91-138`. The DB lookup runs for OAuth users only if `userName.includes("_")`, but after linking the username no longer contains `_`. On the very first sign-in after linking, the DB row's `sub` still matches the native sub — so the lookup *would* succeed — but the 2s timeout + cold start makes it flaky. When it times out, the user gets a token with `role=user, perms=[default]` regardless of their actual role (Admin, Specialist, etc.).

**Fix direction:** post-identity-upgrade, `getIdentityBySub` is one indexed query; raise the timeout safely. Also, cache the resolved role+perms in a DynamoDB single-read cache keyed by sub so Cognito's 5s budget is respected.

### 3.8 `signupConfirmation` only flips status on `user` table

`@e:\AXONYX\cosmediate\app\backend\modules\cosmediate-authentication\controllers\verification.mjs:66-69` calls `updateUserStatus({ userId })` which runs `prisma.user.update`. If the found entity was an Admin/Specialist/Manager, status is never flipped in DB even though Cognito is confirmed.

Not linking-specific but blocks the "admin signed up with OAuth" future scenario.

### 3.9 No audit trail on linking events

All `createAuditLog` calls in `linkOAuthProvider` and password controllers are commented out. Linking and password-set are security-sensitive; we should have server-side records.

---

## 4. Target feature: cross-method authentication

### 4.1 User stories

1. **OAuth → password.** "I signed up with Google. From Settings → Security, let me set a password so I can also sign in with email+password."
2. **Password → OAuth.** "I signed up with email. From Settings → Security, let me connect Google/Facebook/Apple so I can sign in with any."
3. **Unlink.** "Remove Google from my account. Refuse if it is my only sign-in method."
4. **Revoke password.** "I only use Google now; remove my password." Refuse if no linked providers.
5. **Forgot password on a linked account** works exactly like a native account.
6. **Same email, different provider, first time** auto-links silently (already §2.1, needs to actually work — see §3.1).

### 4.2 Invariants

- One `Identity` per email, period (post-identity-upgrade).
- An identity must have ≥1 sign-in method at all times: `passwordSet === true || linkedProviders.length > 0`.
- Cognito side: at most one native-pool user per identity (`Username = email or a stable UUID`), plus N linked external-provider identities. No orphan `google_<id>` users.
- DB `linkedProviders` is a **projection** of Cognito's `identities` attribute, refreshed on every OAuth sign-in.

### 4.3 API surface (new / clarified)

```
POST /auth/password/set            # OAuth-only user sets first password; requires fresh OAuth session
POST /auth/password/update         # existing — native users change password
POST /auth/password/remove         # remove password if ≥1 linked provider remains

POST /auth/providers/link          # start linking flow → returns Hosted UI URL with state=link
POST /auth/providers/link/callback # exchange code, call AdminLinkProviderForUser, refresh linkedProviders
POST /auth/providers/unlink        # { provider }; refuses if it is the last sign-in method

GET  /auth/me/methods              # { passwordSet, linkedProviders: [...], canRemovePassword, canUnlink: {google: bool, ...} }
```

### 4.4 Flow — OAuth-only user sets a password

Pre-req: the Cognito user *is* the external-provider user (`google_123…`). `AdminSetUserPasswordCommand` on that user does **not** give them email+password sign-in, because email+password auth requires a native-pool user with that username.

Two options:

**Option A (recommended) — create a native user on demand, then link.**

1. Client completes current OAuth session (proves identity).
2. Server calls `AdminCreateUser({ Username: email, MessageAction: "SUPPRESS", UserAttributes: [email, email_verified=true] })`.
3. `AdminSetUserPasswordCommand({ Username: email, Password, Permanent: true })`.
4. `AdminLinkProviderForUser` — destination = native `email`, source = existing `Google/<id>`. This migrates the user record so the external provider now points to the native user.
5. Update `Identity.passwordSet = true`. Refresh `linkedProviders` from Cognito `identities`.
6. Invalidate all sessions (`AdminUserGlobalSignOutCommand`) and require fresh sign-in.

**Option B — keep the external-provider-only user, block email+password sign-in.**

Only viable if we never promise "sign in with email+password" to this user. Not what the feature asks for; rejected.

Edge cases:
- Race: two tabs calling `password/set` simultaneously. `AdminCreateUser` is the idempotency gate (`UsernameExistsException` on 2nd call → treat as "already migrated", continue).
- The external user was *already* auto-linked during PreSignUp (§2.1): in that case `AdminCreateUser` already happened, skip to step 3.

### 4.5 Flow — password user links a provider

1. `/auth/providers/link` → return Hosted UI URL: `identity_provider=Google&state=link:<nonce>:<identityId>`.
2. Client redirects. Hosted UI redirects back to `/auth/providers/link/callback?code=...&state=...`.
3. Server validates state, exchanges code for tokens, calls `cognitoGetUserByAccessToken`.
4. Confirms `oauthUser.email === identity.email`. If not → reject with `EMAIL_MISMATCH`.
5. `AdminLinkProviderForUser`: destination = native user's `sub`, source = `Google/<oauthUser.sub>`.
6. Refresh `linkedProviders` from Cognito. Return `{ linkedProviders }`.
7. Sign out the just-created external session (the user is already logged in as the native user in another tab).

PreSignUp handles this for the "very first time" case (§2.1). The callback endpoint is for "user is already logged in and explicitly links."

### 4.6 Flow — unlink

1. `POST /auth/providers/unlink { provider }`.
2. Refuse if `!passwordSet && linkedProviders.length === 1`.
3. `AdminDisableProviderForUser({ User: { ProviderName: "Google", ProviderAttributeValue: <providerUserId> } })`.
4. Refresh `linkedProviders`. Return.

### 4.7 Flow — remove password

1. `POST /auth/password/remove`.
2. Refuse if `linkedProviders.length === 0`.
3. We cannot truly "remove" a Cognito password. Instead: rotate to a long random value, set a DB flag `passwordSet=false`, optionally `AdminDisableUser` on the native-pool user and rely on external providers for sign-in. **Decision needed** (§5.Q1).

---

## 5. Open questions

1. **Remove-password semantics.** Do we actually delete the native-pool user (`AdminDeleteUser`), or keep it disabled? Deleting loses the link target for future re-links; disabling is reversible but leaves a dormant user in the pool.
2. **Apple's relay emails.** Apple can give `<randomhash>@privaterelay.appleid.com` instead of the real email. Our "same email → auto-link" assumption fails. Document as a known limitation for now?
3. **Provider priority on sign-in.** If a user has both Google and Facebook linked and the Hosted UI lets them pick — does the server care which they used this session? Only for audit logs.
4. **Email change after linking.** If an identity changes its email, Cognito's external-provider link stays anchored to the **old** email. Do we force re-link? Need a sub-task here, related to `identity-upgrade.md §9`.
5. **MFA.** Out of scope for this doc, but `AdminSetUserMFAPreference` interacts with Option A (§4.4). Worth flagging.

---

## 6. Module-by-module changes (preview)

| Module | Change |
|---|---|
| `cosmediate-pre-auth-signup` | Re-enable the post-link block (throw retry exception). Unify provider name casing with registry constants. Handle Apple relay email edge case. |
| `cosmediate-pre-auth-token-gen` | Post identity-upgrade: one indexed `getIdentityBySub`. Add short-lived cache to stay under Cognito's 5s. Never fall back to `DEFAULT_ROLE` when DB timeout occurs — return 500 so Cognito rejects the token instead of minting a weakly-permissioned one. |
| `cosmediate-authentication/controllers/auth.mjs` | Split `linkOAuthProvider` into `/providers/link` + `/providers/link/callback`. Actually call `AdminLinkProviderForUser`. Refresh `linkedProviders` from Cognito `identities` on every OAuth sign-in. Remove the `"google"` fallback. |
| `cosmediate-authentication/controllers/password.mjs` | Add `/password/set` that runs Option A (`AdminCreateUser` + `AdminSetUserPassword` + `AdminLinkProviderForUser`). Add `/password/remove`. Resolve Cognito username once per request through a shared helper. |
| `cosmediate-authentication/controllers/verification.mjs` | Dispatch status update by `entityType` (or better: update `Identity.status` once identity-upgrade lands). |
| `cosmediate-authentication/lib/utils.mjs` | Replace `getUserByEmail` 4-table cascade with `getIdentityByEmail` once identity-upgrade lands. Until then, document that linking only supports `USER` role. |
| `lib/auth/registry.mjs` | Add `PROVIDER_NAMES` constant. Add audit log actions: `PROVIDER_LINKED`, `PROVIDER_UNLINKED`, `PASSWORD_SET`, `PASSWORD_REMOVED`. |
| `docs/COGNITO_SETUP.md` | Add "Native + External user migration" section documenting the Option A flow. |

---

## 7. Rollout

1. **Phase 0 (bug-fix only, can ship before identity-upgrade):**
   - Restore the PreSignUp post-link block (§3.1).
   - Uncomment and harden `AdminLinkProviderForUser` in `linkOAuthProvider` (§3.2).
   - Replace the `"google"` fallback with `identities`-derived provider detection (§3.5).
   - Unify provider-name casing (§3.4).
2. **Phase 1 (new endpoints, requires identity-upgrade for sanity):**
   - `/auth/providers/link{,/callback}`, `/auth/providers/unlink`.
   - `/auth/password/set` via Option A.
   - `/auth/password/remove`.
   - `/auth/me/methods` read endpoint.
3. **Phase 2 (polish):**
   - Audit logs, email notifications on link/unlink/password-set.
   - Session revocation on method change.
   - Apple relay-email UX (ask user to confirm real email before linking).

---

## 8. Testing checklist

- [ ] New user signs up with email → later links Google → sign in with Google resolves to same `identityId`, `linkedProviders=["google"]`, `passwordSet=true`.
- [ ] New user signs up with Google → `setPassword` → sign in with email+password resolves to same `identityId`, `passwordSet=true`.
- [ ] OAuth auto-link: existing email user → first Google sign-in → single DB row, no orphan `google_<id>` Cognito user, `linkedProviders=["google"]`.
- [ ] Unlink Google when password is not set → 400.
- [ ] Remove password when no providers linked → 400.
- [ ] Two providers linked (Google + Facebook), unlink Google → Facebook still works, `linkedProviders=["facebook"]`.
- [ ] `forgotPassword` on OAuth-only user → clear 400 with "You signed up with Google" message (already works, keep).
- [ ] Attempt to link a provider whose email differs from identity's email → 400 `EMAIL_MISMATCH`.
- [ ] `pre-token-gen` DB timeout → token minting fails (not: mints with default perms).
- [ ] Concurrent `setPassword` calls → one succeeds, the other is a no-op (idempotent on `UsernameExistsException`).
- [ ] Admin/Specialist row with same email as a Patient → linking flow refuses until identity-upgrade lands.

---

## 9. Non-goals

- Multiple emails per identity (Google primary + work email).
- Passwordless / WebAuthn.
- Username-based sign-in (we stay email-only).
- Cross-region Cognito pool migrations.
