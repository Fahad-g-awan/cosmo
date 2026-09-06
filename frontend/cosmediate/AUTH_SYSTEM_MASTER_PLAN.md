# Cosmediate Auth System — Master Overhaul Plan (v3)

> **Created**: April 8, 2026 · **Last realigned**: April 29, 2026 · **Last status sweep**: May 2026 (Phases **6–9** ✅ logout unified; Phase **10** ✅ scoped; Phase **11** ✅ **partial** — token endpoint + OAuth context hardening without `state`/PKCE; Phase **12** ✅ scalability & cleanup)
> **Companion doc**: `AUTH_SYSTEM_ANALYSIS.md` (bug inventory) · `AGENTS.md` §13 (auth system reference, post-Phase-2)
> **Goal**: Fix every bug, redesign the architecture, implement refresh tokens, fix session staleness, consolidate code, and produce a production-grade auth system.

> **Phase numbering**: this doc was realigned on Apr 29, 2026. The phase roadmap in §1.A is the **single source of truth**. Each phase section below uses the new number. Anywhere you see a P-number, it matches §1.A.

> **Progress so far** (May 2026): Phases **1–9** ✅ done; Phase **10** ✅ **scoped** (public **`web`**/**`blog`** + **`return_to`** on header Sign In). Phase **11** ✅ **partial** (atomic code claim, crypto **`oauthCode`**, **`redirect_uri`** + **`client_id`** binding at token exchange); **`state`** + **PKCE** still open if product wants full OAuth 2.1 alignment. Phase **12** ✅ **done** (origins generator, env-driven hosts, OAuth context expiry, doc sync, legacy shim removal — §14).

---

## Table of Contents

1. [Design Decisions (Agreed)](#1-design-decisions-agreed)
   - 1.A [Canonical Phase Roadmap](#1a-canonical-phase-roadmap)
2. [Complete Route Audit & Redesign](#2-complete-route-audit--redesign)
3. [Phase 1: Kill the Redirect Loop](#3-phase-1-kill-the-redirect-loop) — ✅ done
4. [Phase 2: Standardize Names, Routes, Env Vars, Files](#4-phase-2-standardize-names-routes-env-vars-files) — ✅ done
5. [Phase 3: Error Handling Standardization](#5-phase-3-error-handling-standardization) — ✅ done
6. [Phase 4: Config & URL Architecture](#6-phase-4-config--url-architecture) — ✅ done
7. [Phase 5: Data Layer Refactor](#7-phase-5-data-layer-refactor) — ✅ done
8. [Phase 6: Cookie & Session Redesign](#8-phase-6-cookie--session-redesign) — ✅ done
9. [Phase 7: Refresh Tokens](#9-phase-7-refresh-tokens) — ✅ done
10. [Phase 8: Shared Auth-BFF Package](#10-phase-8-shared-auth-bff-package) — ✅ done
11. [Phase 9: Logout — Unified](#11-phase-9-logout--unified) — ✅ done
12. [Phase 10: Client App Route Protection](#12-phase-10-client-app-route-protection) — ✅ scoped (May 2026)
13. [Phase 11: OAuth Flow Hardening & Security](#13-phase-11-oauth-flow-hardening--security) — ✅ partial (May 2026)
14. [Phase 12: Scalability & Cleanup](#14-phase-12-scalability--cleanup) — ✅ done
15. [Phase 13: Social Login](#15-phase-13-social-login)
16. [File-by-File Change Map](#16-file-by-file-change-map)
17. [New Files / Files to Delete](#17-new-files--files-to-delete)
18. [Phase 2 Audit Decisions Archive (historical)](#18-phase-2-audit-decisions-archive-historical)

---

## 1. Design Decisions (Agreed)

> All decisions below are the **target end state**. Where current implementation differs, the gap is captured in a phase. Audit-flagged exceptions live in §18.

### 1.A Canonical Phase Roadmap

> Replaces the old §15.2 roadmap (now archived in §18). Promoted to top of doc Apr 29, 2026 because the legacy 9-phase numbering inside §3-§11 prose was creating staleness traps (e.g. old `P3-1` referencing dropped designs).

| #   | Phase                          | Status    | One-liner                                                                                                                                                                                                                                     |
| --- | ------------------------------ | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Kill the Loop                  | ✅ done   | Redirect-loop bugs squashed. Login works. Cookie-split fix (`userId`+`userRole` instead of full `user`).                                                                                                                                      |
| 2   | Standardize Names, Routes, Env | ✅ done   | Renames (N1, N3, N4, N5), feature dirs (F2/F3), routes reorged under `/api/auth/*`, A2 unauthorized-access flow, surgical cleanup (A3/A4/A7/A8/L1-L7/M1/M4/M5/M7/M8).                                                                         |
| 3   | Error Handling Standardization | ✅ done   | One error contract (shape, codes, user-visible messages). Kills ad-hoc "error-in-URL" patterns. Inventory done Apr 30, 2026; tasks P3-1..P3-11 all landed May 4, 2026.                                                                        |
| 4   | Config & URL Architecture      | ✅ done   | A10 + M3. `packages/config` is now the single source of URL truth (TLD map, allowed-origins generator, auth IdP URL helpers, request-scoped client-app URL derivation). All `apps/*` URL construction routed through it. Legacy logout URL helpers in `packages/auth` removed in **P9 ✅** (May 2026).                                                                                  |
| 5   | Data Layer Refactor            | ✅ done   | A5 closed. `AuthTokens` unified in `@cosmediate/type-utils` with `expiresAt: number` (unix-seconds, canonical). New `SessionTokens` slim subset for cookie/DDB payloads. Duplicate `AuthTokens` in `@cosmediate/api` removed. `oauth-context-store` types now match DDB reality. No mappers needed — runtime ↔ DDB shapes are 1:1 for tokens.                                                                |
| 6   | Cookie & Session Redesign      | ✅ done   | Minimal **six scalar** cookies per surface (4+2): token quartet + `cos_user_id` / `cos_user_role` (client) / `cos_idp_*` on IdP. **Profile** via API (`useSilentAuth`). Snake_case OAuth token boundary. Legacy reads/DDB mapper removed **§14 P12-6** (May 2026 pre-prod). §8. May 2026. |
| 7   | Refresh Tokens                 | ✅ done   | Silent refresh via `/api/auth/refresh` (IdP + per-client BFF), proxy merges `Set-Cookie`; visibility + optional heartbeat + axios **401** interceptor (`ensureApiUnauthorizedInterceptor`). Backend: `POST /auth/tokens/refresh` primary, `/auth/refresh` fallback. **§9**. May 2026.                                               |
| 8   | Shared Auth-BFF Package        | ✅ done   | `@cosmediate/auth-bff` route factories for **`apps/app`**, **`web`**, **`blog`**; CORS dedupe; IdP **`apps/auth`** unchanged. Optional: **`/auth/signin` GET** factory, **`exchange-code`→`exchange`** rename. May 2026.                                                                                                                  |
| 9   | Logout — Unified               | ✅ done   | Unified **`access_token`** BFF → IdP Bearer + synthesized **`redirect_uri`** (`${AUTH_SELF_URL}/signin` when omitted); **`logoutUrl`** dropped from client contract; **`getAuthClearSessionUrlClient()`** hard redirect after BFF; **`auth-urls-client.ts`**; **`packages/auth/src/lib/utils.ts`** deleted; **`mode=clear_session`** removed from client **`/auth/signin`**; **`return_to`** on **`GET /oauth/clear-session`**. May 2026.  |
| 10  | Client App Route Protection    | ✅ scoped | **Web/blog** public-only — no middleware guards. **`return_to`** on **`@cosmediate/header`** Sign In (**May 2026**). **`apps/app`** dashboard **`proxy`** gate unchanged. Add **`proxy`** matchers later if member-only routes ship on **`web`**/**`blog`**.                                                                                                                                 |
| 11  | OAuth Hardening & Security     | ✅ partial | **Done (May 2026):** **`claimOAuthContextForTokenExchange`** — conditional DDB update sets **`used`** only when unused, unexpired, and request **`redirect_uri`** + **`client_id`** match stored authorize values; **`crypto.randomBytes(32).toString("hex")`** for **`oauthCode`**; **`invalid_grant`** → **400**. **`Deferred`:** **`state`** (P11-1), **PKCE** (P11-2). **P11-6:** **`readIdpSessionFromCookies`** reads **`cos_idp_*`** scalars only. **P11-7:** no `NEXT_PUBLIC_*` reCAPTCHA secret in monorepo; add server-only verify when marketing APIs enforce tokens. |
| 12  | Scalability & Cleanup          | ✅ done   | **`generateAllowedOrigins()`** + TLD map (**`packages/config`**, §14 P12-1). **`dev.`** apex/subdomains in origin set (P12-2); staging hosts = same env contract when deployed. OAuth contexts: **`expiresAt`** + conditional reads (P12-3); optional native DDB TTL on that attribute is infra-only. **`utils.ts`** sweep obviated P9-6 (P12-4). **`AGENTS.md`** §13 + **`docs/apps/auth/`** synced (P12-5). Legacy cookie/session shims removed (P12-6). **May 2026.** |
| 13  | Social Login                   | ⬜        | Google / Facebook / Apple via Cognito Hosted UI. Logout becomes conditional on `signin_method`. Last because backend Cognito work is required first.                                                                                          |

**Flow rule**: every phase stays inside its scope. Logout / D6 URL-helper cleanup shipped in **Phase 9 ✅** (May 2026). Touching cross-app URL derivation → **`packages/config`** (Phase 4). Detailed task specs are written **only when a phase becomes active** — long-lead specs go stale (e.g. the old P3-1 below).

---

### Decision 1: Minimal Cookies, Fresh User Data via API

**Cookies** (httpOnly, secure in production, sameSite: lax):

```
cos_session_id      → string   (backend session ID — authoritative identity)
cos_access_token    → string   (opaque token — transport credential for API calls)
cos_token_exp       → number   (Unix seconds — middleware quick-check, no JWT parsing)
cos_refresh_exp     → number   (Unix seconds — middleware knows if refresh is possible)
```

**NOT in cookies anymore**:

- User object → fetched via role-specific backend API (`getAdminApi` / `getUserApi` / etc.) inside `useSilentAuth`, cached in React AuthContext state
- Full tokens blob → only `access_token` needed
- Refresh token → stays on auth app's IdP side only (DynamoDB session)

**Current state vs target (Apr 2026)**:

| Cookie         | Current name                        | Target name                  | Phase that lands the rename |
| -------------- | ----------------------------------- | ---------------------------- | --------------------------- |
| Session id     | `session_id`                        | `cos_session_id`             | P6                          |
| Access token   | (inside `session_tokens` JSON blob) | `cos_access_token`           | P6                          |
| Token expiry   | (inside `session_tokens` JSON blob) | `cos_token_exp`              | P6                          |
| Refresh expiry | legacy / blob-only paths           | `cos_refresh_exp`            | P6 ✅ sets scalar · **P7 ✅** proxy/BFF refresh |
| User id        | `session_user_id`                   | (folded into session lookup) | P6                          |
| User role      | `session_user_role`                 | (folded into session lookup) | P6                          |

The `session_tokens` JSON-blob cookie + middleware's `JSON.parse(session)` step are P6 deletes.

**Why httpOnly**: BFF attaches token to backend calls. Frontend JS never touches it directly.

**Why separate `cos_token_exp`**: We don't parse JWTs anywhere on frontend or BFF. The backend gives us `expiresAt` and we store it as a simple number cookie. Middleware does `cookie_value < Date.now()/1000` — cheap and no dual source of truth since both come from the same backend response at the same time.

**User data freshness model**:

- `useSilentAuth` fetches session on initial page load → stores in AuthContext
- Cached in memory (React state) for the session lifetime
- Refetched on: full page reload, explicit mutation (e.g., profile update dispatches state update)
- Cross-app: eventually consistent on reload. User updates name on dashboard → navigates to blog → blog fetches fresh data on load. This is fine.

### Decision 2: Refresh Token Strategy

**Key**: Auth app owns refresh. Client apps never see refresh tokens. Refresh flow is a **direct BFF call** (not an OAuth round-trip).

**Backend API**: `POST /auth/tokens/refresh` — takes `sessionId`, returns new `{ access_token, token_exp, refresh_exp }`.

**Flow when access token expires on a client app** (decided Apr 29, 2026):

```
proxy.ts middleware (server-side fetch — invisible to user):
  ├── cos_token_exp > now? (still valid)
  │   └── NextResponse.next()
  ├── cos_token_exp < now && cos_refresh_exp > now? (need refresh)
  │   ├── Server-side fetch POST /api/auth/refresh (client BFF on same origin)
  │   ├── BFF calls auth IdP POST /api/auth/refresh with sessionId
  │   ├── IdP calls backend POST /auth/tokens/refresh
  │   ├── BFF updates client cos_* cookies on the response
  │   └── proxy returns NextResponse.next() with new Set-Cookie headers
  └── cos_refresh_exp < now? (everything expired)
      └── Redirect to /auth/signin?return_to=…
         + Set-Cookie deletes for ALL cos_* on the response

User sees: nothing. Refresh adds ~50-200ms to one navigation, no flash.
```

**Why a BFF route, not `/oauth/authorize?prompt=refresh`**: separation of concerns. `/oauth/authorize` exists to mint OAuth codes for cross-domain bootstrap. Token refresh inside an already-authenticated session is a same-origin server-to-server call — no auth code, no redirect, no client-app round trip. ✅ **Implemented in Phase 7** (May 2026).

**Loop-prevention rules baked in** (per Apr 29 review):

1. Middleware NEVER auto-redirects an authenticated-looking user away from `/auth/processing` or `/auth/refreshing` — those pages must always run to completion or set/refresh cookies, otherwise we ping-pong.
2. `/auth/signin` route handler does NOT short-circuit on local cookies (they could be stale). It always builds the OAuth URL; `/oauth/authorize` decides via SSO fast path.
3. Auth app `/oauth/authorize` does NOT auto-redirect-back-to-client just because IdP cookies exist — cookies alone can be stale. It validates the IdP session before issuing an auth code.
4. Refresh failure on client must redirect to `/auth/signin`, NEVER to another refresh attempt.
5. Full re-auth redirects (`refresh_exp < now`) MUST include `Set-Cookie` deletes for all `cos_*` so the next page load doesn't see stale state.

### Decision 3: Separation of Responsibilities

```
proxy.ts (MIDDLEWARE) — THE auth gatekeeper, ALWAYS returns a response
├── Check cos_token_exp cookie
├── If expired + refreshable → server-side fetch /api/auth/refresh, propagate Set-Cookie, NextResponse.next()
├── If expired + not refreshable → redirect to /auth/signin + Set-Cookie deletes for all cos_*
├── If refresh fetch itself fails → redirect to /auth/signin + cookie deletes (NEVER retry refresh)
├── If valid → NextResponse.next()
├── If authenticated + on /auth/signin → redirect to default route
├── Cross-app routing (/home, /dashboard, /blog prefixes)
└── NEVER falls through without a return

page.tsx (ROOT PAGE) — Just role-based redirect
├── Assumes user IS authenticated (middleware guarantees this)
├── Calls /api/user/default-route
├── Redirects to role-based page
└── NO auth checks, NO error redirects to signin

/auth/processing (PROCESSING PAGE) — Just code exchange
├── Reads code + return_to from URL params
├── Calls POST /api/auth/exchange-code (client BFF; optional future rename to `/exchange`)
├── On success → redirect to target
├── On error → SHOW error message (NOT redirect to signin — that loops)
└── Errors are displayed to user, never silently redirected

/auth/signin (ROUTE HANDLER) — Just builds OAuth URL and redirects
├── Builds authorize URL with params
├── Includes return_to param
├── Redirects to auth app
└── NO auth checks

/api/auth/* (BFF ROUTES) — Server-to-server communication
├── ALWAYS return JSON (NEVER redirect from POST endpoints)
├── exchange: exchange auth code for tokens, set cookies
├── session: read cookies, return session data
├── logout: call auth BFF logout, clear cookies
└── Standard error format: { success: false, error: "code", message: "..." }
```

### Decision 4: Naming Convention

| Category               | Current (Messy)                                            | New (Standard)                                                                           |
| ---------------------- | ---------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| **Function** ✅        | `refiredtToAuthSignin`                                     | `redirectToSignin`                                                                       |
| **Cookies (client)**   | `session_tokens`, `session_user`, `session_id`             | `cos_session_id`, `cos_access_token`, `cos_token_exp`, `cos_refresh_exp`                 |
| **Cookies (IdP)**      | `idp_session_tokens`, `idp_session_user`, `idp_session_id` | `cos_idp_session_id`, `cos_idp_access_token`, `cos_idp_token_exp`, `cos_idp_refresh_exp` |
| **Cookies (OAuth)**    | `auth_context_id`, `client_auth_ctx`                       | **`cos_oauth_code`** (one-time code, N1) + **`client_auth_ctx`** (context pointer; N2 rename deferred) |
| **URL param** ✅       | `redirect_after_auth` / `redirectAfterAuth`                | `return_to`                                                                              |
| **API response field** | `redirectTo` / `redirectAfterAuth`                         | `redirect_to` (snake_case for all API responses)                                         |
| **JS variable** ✅     | `redirectAfterAuth`                                        | `returnTo`                                                                               |
| **Env var (auth app)** | `AUTH_BASE_URL` (confusing — self reference)               | `AUTH_SELF_URL`                                                                          |
| **Env var (client)**   | _(removed)_                                                | **`AUTH_APP_TOKEN_ENDPOINT`**, **`AUTH_APP_LOGOUT_ENDPOINT`**, **`AUTH_APP_AUTHORIZE_ENDPOINT`**, **`AUTH_APP_REFRESH_ENDPOINT`** (optional overrides; defaults in `@cosmediate/config`) |
| **Feature dir (web)**  | `features/auth_temp/processing_temp/`                      | `features/auth/Processing/`                                                              |
| **Comment typo**       | `# IDP BFF Variabls`                                       | `# Auth Provider (IdP) Endpoints`                                                        |

### Decision 5: Environment Variables

Only truly environment-specific values in `.env` files:

```env
# ============================================
# Client App .env (web, app, blog)
# ============================================

# App Identity
AUTH_CLIENT_ID=app_local_xxx
AUTH_CLIENT_SECRET=secret_xxx

# Auth Provider Endpoints (see @cosmediate/config auth-urls.ts)
AUTH_PROVIDER_URL=http://localhost:3002
AUTH_APP_AUTHORIZE_ENDPOINT=/oauth/authorize
AUTH_APP_TOKEN_ENDPOINT=/api/auth/token
AUTH_APP_LOGOUT_ENDPOINT=/api/auth/logout
AUTH_APP_REFRESH_ENDPOINT=/api/auth/refresh

# OAuth callback (IdP redirects here with ?code=)
AUTH_REDIRECT_PATH=/auth/processing

# ============================================
# Auth App .env
# ============================================

# Self URL
AUTH_SELF_URL=http://localhost:3002

# Backend API
NEXT_PUBLIC_BACKEND_URL=https://api.cosmediate.com/dev

# DynamoDB
DYNAMODB_AUTH_TABLE_NAME=cosmediate_auth_dev
DYNAMODB_CLIENT_TABLE_NAME=cosmediate_clients_dev
AWS_REGION=eu-central-1

# Cognito (for social login + token operations)
COGNITO_APP_CLIENT_ID=xxx
COGNITO_DOMAIN=https://dev-cognito.cosmediate.com
COGNITO_OAUTH_PATH=/oauth2/authorize
COGNITO_CALLBACK_URI=http://localhost:3002/processing
```

**Removed from env** (computed in code):

- `ALLOWED_ORIGINS` → generated dynamically from a shared `COSMEDIATE_TLDS` config
- `ALLOWED_REDIRECT_URIS` → generated from `COSMEDIATE_TLDS` + callback path

### Decision 6: `return_to` vs `redirect_to`

**Two separate concepts, both intentional. Single canonical names.**

| Field         | Where it lives                                                                | Set by                                                                 | Means              |
| ------------- | ----------------------------------------------------------------------------- | ---------------------------------------------------------------------- | ------------------ |
| `return_to`   | URL param on `/auth/signin?return_to=…` and `/auth/processing?return_to=…`    | Client middleware (the page user originally wanted)                    | **User intent**    |
| `redirect_to` | JSON field in response from `/api/auth/exchange-code` and `/api/auth/refresh` | Server (role-based default route, e.g. `/clinic-management` for ADMIN) | **Server default** |

**Priority** (per Decision 4 N3 rename, codebase-wide as of Apr 23, 2026):

```
return_to (URL param) > redirect_to (server JSON) > "/"
```

**Flow**:

```
1. User visits /specialists/dr-smith (not logged in)
2. Middleware: no session → redirect to /auth/signin?return_to=/specialists/dr-smith
3. /auth/signin route: builds authorize URL, passes return_to
4. Auth /oauth/authorize: stores return_to in OAuth context (DDB attr `return_to`)
5. User signs in → auth code returned
6. Client /auth/processing?code=xxx&return_to=/specialists/dr-smith
7. Processing exchanges code → server JSON contains { redirect_to: "/clinic-management" }
8. Processing: window.location.href = return_to ?? redirect_to ?? "/"
   → "/specialists/dr-smith"
```

**Rules**:

- `return_to` is always a **relative path** (never a full URL — prevents open redirect).
- `redirect_to` from server is always a **relative path** (role-based default).
- Only ONE name per concept, ONE place where the decision is made.
- The current `/api/auth/exchange-code` (app) hardcodes `redirectTo: "/"` and Processing components ignore both — this is `TODO(phase-2/N3)` and lands properly in P6 + P7.

> Cross-doc: this contract is also documented in `AGENTS.md` §13.3 (URL params reference).

### Decision 7: Cross-App Session Invalidation (4-Layer Hybrid)

**Problem**: User logs out on Dashboard. Blog is still open in another tab with valid cookies. Blog doesn't know the session is dead.

**NOT doing**: proxy.ts calling auth app on every navigation. That adds 50-200ms latency to every page transition, blocks rendering synchronously, and if auth app is slow/down your entire app freezes.

**NOT doing**: Direct DynamoDB checks from client apps. Client apps shouldn't talk to DynamoDB.

**The 4-layer approach (all fast)**:

```
LAYER 1: proxy.ts Middleware — LOCAL cookie expiry check only (instant, no network)
├── Reads cos_token_exp cookie → number comparison → < 1ms
├── If expired → refresh or signin redirect
├── If valid → NextResponse.next()
└── NEVER calls auth app from middleware (zero latency added to navigation)

LAYER 2: useSilentAuth — Auth app validation (on load + visibility change)
├── On initial page load → GET /api/auth/session
│   Session route: checks local cookies AND validates with auth app
│   Auth app checks: does this session still exist? (DynamoDB lookup)
│   If auth says invalid → clear local cookies → isAuthenticated = false
├── On window focus/visibility change → re-validates
│   User logs out on App A → switches to App B tab → detected immediately
├── Optional: periodic heartbeat (every 5 min in background)
└── If invalid → AuthContext updates → UI reacts

LAYER 3: API 401 Interceptor — Instant detection on any action
├── Axios interceptor on EVERY backend API call
├── Backend returns 401 (tokens revoked by GlobalSignOutCommand)
├── Interceptor catches it → clears AuthContext → redirect to signin
└── Zero extra calls — piggybacks on normal API usage

LAYER 4: AuthContext State — UI reacts
├── Components read isAuthenticated from context
├── When Layer 2 or 3 sets false → protected components unmount/redirect
└── No stale UI shown
```

**Real-world scenarios**:

| Scenario                                          | Detection                         | Layer   | Delay   |
| ------------------------------------------------- | --------------------------------- | ------- | ------- |
| User logs out on Dashboard, switches to Blog tab  | Visibility change → session check | Layer 2 | < 1 sec |
| User logs out on Dashboard, clicks button on Blog | Backend returns 401               | Layer 3 | Instant |
| User logs out on Dashboard, Blog sits idle        | Periodic heartbeat (optional)     | Layer 2 | ≤ 5 min |
| Access token expires naturally                    | Middleware refreshes via BFF      | Layer 1 | 0-200ms |

**Current implementation status (May 2026)**:

| Layer                                | Implemented? | Notes                                                                                                                                                   |
| ------------------------------------ | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Layer 1 (proxy expiry check)         | ✅           | **`apps/{app,web,blog}/src/proxy.ts`** — reads **`cos_token_exp`** / **`cos_refresh_exp`**; when access expired but **`cos_refresh_exp > now`**, same-origin **`POST /api/auth/refresh`** with forwarded **`Cookie`**; merge **`Set-Cookie`**. **`apps/app`**: failure → signin redirect + clear cookies; **web/blog**: failure → clear cookies + continue.                                                        |
| Layer 2 (useSilentAuth on load)      | ✅           | `packages/auth/src/hooks/useSilentAuth.ts` (Phase 1 + 2 cleanup).                                                                                       |
| Layer 2 (visibility listener)        | ✅           | **`visibilitychange`** → silent refetch (no loading spinner). May 2026 (P7-prep).                                                                             |
| Layer 2 (heartbeat)                  | ✅ optional  | **`NEXT_PUBLIC_AUTH_HEARTBEAT=true`** → 5‑minute interval refetch. May 2026.                                                                                                                                |
| Layer 3 (axios 401 interceptor)      | ✅           | **`packages/auth/src/lib/api-unauthorized-interceptor.ts`** — installed once from **`AuthProvider`** via **`ensureApiUnauthorizedInterceptor()`**; skips **`/auth/*`** paths.                                    |
| Layer 4 (AuthContext reactive state) | ✅           | `packages/auth/src/context/AuthProvider.tsx`.                                                                                                           |

**Implementation details for Layer 2**:

```typescript
// In useSilentAuth hook:
useEffect(() => {
  const handleVisibilityChange = () => {
    if (document.visibilityState === "visible") {
      // Tab became active — re-validate session
      validateSession();
    }
  };
  document.addEventListener("visibilitychange", handleVisibilityChange);
  return () =>
    document.removeEventListener("visibilitychange", handleVisibilityChange);
}, []);
```

**Implementation details for Layer 3**:

```typescript
// In packages/api axiosInstance:
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Session revoked server-side — redirect to signin
      window.location.href = "/auth/signin";
    }
    return Promise.reject(error);
  }
);
```

### Decision 8: Cognito Hosted UI Logout — Not Needed (for now)

**Observation**: For email/password signin, you use direct Cognito SDK calls (`AdminInitiateAuth`) — NOT the Cognito hosted UI. So Cognito does **not** set any browser-side session cookies during email/password signin.

The Cognito hosted UI logout URL (`/logout?client_id=...&logout_uri=...`) only exists to clear Cognito's **browser cookies**. Since there are no Cognito browser cookies for email/password users, this redirect is unnecessary.

**Current backend** returns a `logoutUrl` (Cognito hosted UI) on every logout — this adds a confusing redirect hop for no reason when the user signed in via email/password.

**Simplified logout for Phase 9 (email/password only)** ✅ _(May 2026)_:

1. `GlobalSignOutCommand` → revokes all tokens server-side ✓
2. Clear IdP cookies on auth domain ✓ (**`GET /oauth/clear-session`** in the browser — server-side IdP `fetch` does not propagate `Set-Cookie`)
3. Clear client cookies ✓ (client BFF)
4. Land on auth **`/signin`** — no Cognito hosted UI detour (**`logoutUrl`** not used on the client contract)

**When social login is added (Phase 13)**:

- Social login DOES use Cognito hosted UI → Cognito DOES set browser cookies
- Logout becomes conditional:
  - If `signin_method === "password"` → skip Cognito hosted UI logout
  - If `signin_method === "social"` → include Cognito hosted UI logout URL
- The backend can decide based on how the user signed in (stored in session)

**Backend change needed**: `handleLogout` should either:

- Not return `logoutUrl` for email/password users, OR
- Frontend ignores `logoutUrl` for now and just redirects to auth signin (for now i think lets choose this method and later can update the backend and have proper login information and decide to send url or not like discussed right above).

---

## 2. Complete Route Audit & Redesign

> **Status reflection (Apr 26, 2026; logout May 2026)**: Phase 2 Step 8 moved 10 auth IdP routes under `/api/auth/*`. Phase **9** closed the unified logout redesign (**`/api/auth/logout`**, **`/oauth/clear-session`**). Tables below mix landed ✅ rows with forward-looking rows owned by **P8**/**P11**/etc.

### Auth App — Current vs Target

#### API Routes (Backend-for-Frontend)

| Current Path                       | Method | Status | Phase that lands change | Notes                                                                                                                                                        |
| ---------------------------------- | ------ | ------ | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `/api/auth/signin`                 | POST   | ✅ P2  | —                       | Moved from `/api/signin`.                                                                                                                                    |
| `/api/auth/signup`                 | POST   | ✅ P2  | —                       | Moved from `/api/signup`.                                                                                                                                    |
| `/api/auth/logout`                 | POST   | ✅ P2  | ✅ P9                   | Moved from `/api/logout`. Unified logout chain (**Bearer**, synthesized **`redirect_uri`**, **`logoutUrl`** stripped from client contract). May 2026.                                                                                                       |
| `/api/auth/confirm-signup`         | POST   | ✅ P2  | —                       | Moved from `/api/confirm-signup`.                                                                                                                            |
| `/api/auth/confirm-signup/resend`  | POST   | ✅ P2  | —                       | Subroute moved together.                                                                                                                                     |
| `/api/auth/forgot-password`        | POST   | ✅ P2  | —                       | Moved from `/api/forgot-password`.                                                                                                                           |
| `/api/auth/forgot-password/resend` | POST   | ✅ P2  | —                       | Subroute moved together.                                                                                                                                     |
| `/api/auth/reset-password`         | POST   | ✅ P2  | —                       | Moved from `/api/reset-password`.                                                                                                                            |
| `/api/auth/set-password`           | POST   | ✅ P2  | —                       | Moved from `/api/set-password`.                                                                                                                              |
| `/api/auth/update-password`        | POST   | ✅ P2  | —                       | Moved from `/api/update-password`.                                                                                                                           |
| `/api/auth/token`                  | POST   | ✅ P2  | ✅ P6 · **P11 partial**             | Snake_case scalar success body + `redirect_to` (P6). **`redirect_uri`** + **`client_id`** binding + atomic **`used`** (**P11** May 2026). **`state`/PKCE** deferred.                                                  |
| `/api/auth/session`                | GET    | ✅ P2  | ✅ P6                   | Reads `cos_idp_*` (+ legacy); mirrors camelCase session for callers.                                                                                       |
| `/api/auth/refresh`                | POST   | ✅ P7  | —                       | Takes `sessionId` (body or cookies), calls backend `POST /auth/tokens/refresh` (404 → `/auth/refresh`), returns snake_case scalars + updates IdP **`cos_idp_*`** when applicable.              |
| ~~`/api/auth/user`~~               | —      | 🚫     | —                       | **Dropped Apr 29, 2026.** Was proposed in old P3-4. Adds an extra Lambda hop with no benefit over current role-dispatch in `useSilentAuth.getSessionUser()`. |
| ~~`/api/auth/clear-session`~~      | GET    | 🗑️ ✅  | —                       | Deleted in P2 (was a byte-identical duplicate of `/oauth/clear-session`).                                                                                    |
| `/api/_ping`                       | GET    | —      | —                       | Keep as-is.                                                                                                                                                  |

#### OAuth Routes (Standard OAuth endpoints — NOT under /api/)

| Current Path           | Method | Status | Phase | Notes                                                                                                                                                                                                             |
| ---------------------- | ------ | ------ | ----- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/oauth/authorize`     | GET    | —      | P11   | Standard OAuth path. Stays. P11 adds CSRF `state` and PKCE; P7 design left it untouched (refresh moved to BFF instead of `?prompt=refresh`).                                                                      |
| `/oauth/clear-session` | GET    | ✅     | ✅ P9   | **KEPT**. Cross-origin **`window.location`** IdP cookie cleanup. **May 2026:** default **`/signin`** redirect + optional **`return_to`** query (path-only guard). |

#### UI Pages

| Current Path       | Type | New Path           | Notes                           |
| ------------------ | ---- | ------------------ | ------------------------------- |
| `/signin`          | Page | `/signin`          | Keep                            |
| `/signup`          | Page | `/signup`          | Keep                            |
| `/processing`      | Page | `/processing`      | Keep — Cognito callback landing |
| `/confirm-signup`  | Page | `/confirm-signup`  | Keep                            |
| `/forgot-password` | Page | `/forgot-password` | Keep                            |
| `/reset-password`  | Page | `/reset-password`  | Keep                            |
| `/`                | Page | `/`                | Root page                       |

### Client Apps (app, web, blog) — Current vs New

#### BFF API Routes

| Current Path                | Method | Status | Phase that lands change | Notes                                                                                                                                    |
| --------------------------- | ------ | ------ | ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `/api/auth/exchange-code`   | POST   | —      | P8                      | Renamed `→ /api/auth/exchange` deferred. P8 extracts the body to `@cosmediate/auth-bff` first; rename done with the move.                |
| `/api/auth/get-session`     | GET    | —      | P8                      | Rename `→ /api/auth/session` deferred (same reason). Hooks already use `/api/auth/get-session`.                                          |
| `/api/auth/logout`          | POST   | ✅     | ✅ P8 · ✅ P9           | **`createLogoutRouteHandlers`** (**P8**) + unified **`access_token`** body + IdP **`{}`** POST (**P9**, May 2026).                                                                                                 |
| `/api/auth/refresh`         | POST   | ✅ P7  | P8                      | Per **`apps/app`**, **`apps/web`**, **`apps/blog`**. Proxies to IdP; sets fresh **`cos_*`** cookies. Factoring to **`@cosmediate/auth-bff`** deferred to P8.   |
| `/api/auth/set-password`    | POST   | ⚠️     | tbd                     | (app only). Currently broken — reads removed `session_user` cookie. Hooks not wired anywhere. Refactor when password-change UX is built. |
| `/api/auth/update-password` | POST   | ⚠️     | tbd                     | Same as above.                                                                                                                           |
| `/api/user/default-route`   | GET    | —      | P4 (cleanup)            | (app only). Has commented-out parsing block from before Phase 1 split — P4 cleanup pass.                                                 |
| `/api/places`               | GET    | —      | —                       | (web only, unrelated to auth).                                                                                                           |

#### Auth Flow Routes (Redirect handlers — NOT /api/)

| Current Path       | Method | Type                     | Status | Phase | Notes                                            |
| ------------------ | ------ | ------------------------ | ------ | ----- | ------------------------------------------------ |
| `/auth/signin`     | GET    | Route handler (redirect) | —      | —     | Builds OAuth URL + redirects to auth IdP. Stays. |
| `/auth/processing` | —      | Page                     | —      | —     | Exchange-code landing. Stays.                    |

> **No `/auth/refreshing` page**: per Apr 29, 2026 review (Q1 = Option B), refresh is performed by `proxy.ts` via server-side fetch, not via a redirect-then-fetch page. Invisible to user.

### Key Observations (post-Phase-2)

1. **Auth app**: All API routes are now under `/api/auth/*` (10/10 routes moved in P2 Step 8 — Apr 26, 2026). No more `/api/signin` / `/api/oauth/token` paths exist.
2. **Auth app**: `/oauth/authorize` stays standard-OAuth. `/oauth/clear-session` is **kept** (deviation from earlier plan; required for cross-origin browser-redirect IdP cookie cleanup).
3. **Auth app**: `/api/auth/clear-session` was deleted in P2 (was a byte-identical duplicate of `/oauth/clear-session`).
4. **Client apps**: BFF route renames (`exchange-code` → `exchange`, `get-session` → `session`) deferred to **P8** — done together with the extraction to `@cosmediate/auth-bff` so we don't move twice.
5. **All BFF POST routes**: ALWAYS return JSON. NEVER return redirects. (Enforced post-P1.)
6. **GET routes that modify state**: `DELETE /api/auth/session` was the original plan, but `/oauth/clear-session` (GET) is kept because `window.location.href` cannot issue DELETE.
7. **New routes** (**✅ P7**, May 2026): `/api/auth/refresh` (auth IdP) + `/api/auth/refresh` (per-client BFF).

### Cross-TLD Logic for Signin Routes (P4 scope)

> **Phase ownership**: this entire section is the design brief for **Phase 4 — Config & URL Architecture**. Lifted out of legacy phase prose so it lives next to the rest of the architectural decisions.

The `/auth/signin` route handler in each client app constructs the OAuth authorize URL. It must correctly determine:

- Its own `redirect_uri` (callback URL) based on current hostname/TLD.
- The auth app's URL based on current TLD.

```
If hostname is localhost              → auth at http://localhost:3002
If hostname is app.cosmediate.nl      → auth at https://auth.cosmediate.com  (auth IdP is .com-only and centralized)
If hostname is dev.app.cosmediate.gr  → auth at https://dev.auth.cosmediate.com
```

**P4 solution sketch**: `packages/config` providing:

- `getAuthProviderUrl()` — returns the static auth URL per env (`localhost:3002` / `dev.auth.cosmediate.com` / `auth.cosmediate.com`). The auth IdP is `.com`-centralized, so no hostname derivation is needed (decision A10 + M3, locked Apr 22, 2026).
- `getClientAppUrl(app, request)` — derives client URL from request hostname's TLD (web/blog/app live on every TLD: `.com`, `.nl`, `.gr`, `.de`, etc.).
- `COSMEDIATE_TLDS` map + env-var contracts.
- Kills hardcoded URLs and per-app `lib/server/config.ts` duplication.
- **`packages/auth/src/lib/utils.ts`** URL helpers removed ✅ **`Phase 9`** (May 2026); browser redirects → **`packages/config/auth-urls-client.ts`**.

**Cross-TLD UX target** (one auth domain, many client TLDs): user signed in at `app.cosmediate.nl` is also signed in at `app.cosmediate.gr` and `app.cosmediate.com` because the auth IdP cookies live on `auth.cosmediate.com`. Logout centralized via that auth domain (**✅ P9**, May 2026).

---

## 3. Phase 1: Kill the Redirect Loop

**Goal**: Make login actually work. Zero loops.
**Scope**: Minimal surgical fixes only. No renaming, no refactoring.

### Tasks

#### P1-1: Fix missing `return` in proxy.ts (app)

- **File**: `apps/app/src/proxy.ts`
- **Change**: Add `return` before every `refiredtToAuthSignin()` call (lines 109, 136, 149, 164)

#### P1-2: Fix exchange-code returning redirect instead of JSON

- **Files**: `apps/{app,web,blog}/src/app/api/auth/exchange-code/route.ts`
- **Change**: Replace `NextResponse.redirect(...)` with `NextResponse.json({ success: false, error: "token_exchange_failed" }, { status: 401 })`
- **Why**: When exchange-code returns 302, `fetch()` follows it transparently → gets HTML → `res.json()` throws → catch → redirect to signin → **LOOP**. This was the pre-existing loop cause before the debug console.log.

#### P1-3: Fix double `res.json()` in Processing component (app)

- **File**: `apps/app/src/components/auth/Processing/index.tsx`
- **Change**: Remove `console.log("[/api/auth/exchange-code] res", await res.json())` — store result in variable

#### P1-4: Fix double `res.json()` in root page (app)

- **File**: `apps/app/src/app/page.tsx`
- **Change**: Remove `console.log("res", await res.json())` — store result

#### P1-5: Fix OAuth context reuse in authorize endpoint

- **File**: `apps/auth/src/app/oauth/authorize/route.ts`
- **Change**: Always create a fresh context. Remove `getOAuthContext({ clientId })` reuse.

#### P1-6: Fix authorize storing undefined session data

- **File**: `apps/auth/src/app/oauth/authorize/route.ts` (lines 150-166)
- **Change**: Only store session data in OAuth context if IdP session actually exists and is valid. Move `updateOAuthContext` inside the SSO fast path block.

#### P1-7: Re-enable error handling in web Processing

- **File**: `apps/web/src/features/auth_temp/processing_temp/index.tsx`
- **Change**: Uncomment error redirect logic

#### P1-8: ROOT CAUSE — User object too large for cookies (~4KB browser limit)

**The real bug** that caused the persistent loop:

The full `user` object (User / Admin / ClinicManager / Specialist types) can easily exceed the browser's ~4KB per-cookie limit when serialized to JSON. The browser **silently drops** oversized cookies — no error, no warning.

**Failure chain**:

1. Signin succeeds → sets `idp_session_user` cookie with full user JSON (often > 4KB)
2. Browser silently drops the cookie
3. User also set in OAuth context (DynamoDB) successfully, so first exchange works
4. On next auth cycle: `/oauth/authorize` sees `idp_session_tokens` cookie (small, survives) but NOT `idp_session_user` → takes SSO fast path WITHOUT user data
5. Token endpoint returns `user: undefined`
6. Client `exchange-code` sets `session_user` cookie to `JSON.stringify(undefined)` → invalid cookie
7. `default-route` / middleware can't find user → `authenticated: false` → back to signin → SSO loop

**The user's fix** (applied April 11, 2026): **Store only `userId` + `userRole` in cookies. Fetch full user on the client via role-specific APIs.**

**New cookie layout**:

| Old (failed)       | New (works)                                     |
| ------------------ | ----------------------------------------------- |
| `idp_session_user` | `idp_session_user_id` + `idp_session_user_role` |
| `session_user`     | `session_user_id` + `session_user_role`         |

Each new cookie is tiny (< 100 bytes), well within the 4KB limit.

**Full user object now fetched on client** via `useSilentAuth` hook:

```typescript
// packages/auth/src/hooks/useSilentAuth.ts
const getSessionUser = async (userId, userRole, token) => {
  if (userRole === "ADMIN")
    return (await getAdminApi({ id: userId }, token)).item;
  if (userRole === "MANAGER")
    return (await getClinicManagerApi({ id: userId }, token)).item;
  if (userRole === "SPECIALIST")
    return (await getSpecialistApi({ id: userId })).item;
  if (userRole === "USER")
    return (await getUserApi({ id: userId }, token)).item;
};
```

**Files changed** (for this fix):

| File                                                        | Change                                                                                                                                                   |
| ----------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `apps/auth/src/lib/oauth-context-store.ts`                  | `SessionData.user` → `SessionData.userId + userRole`                                                                                                     |
| `apps/auth/src/app/api/signin/route.ts`                     | Builds session with `userId: signInResponse.user.id`, `userRole: signInResponse.user.role`; sets `idp_session_user_id` + `idp_session_user_role` cookies |
| `apps/auth/src/app/oauth/authorize/route.ts`                | Reads `idp_session_user_id` + `idp_session_user_role` cookies for SSO; requires all 5 (tokens, id, user_id, user_role, expiresAt) for SSO fast path      |
| `apps/auth/src/app/api/oauth/token/route.ts`                | Returns `userId` + `userRole` instead of `user`; added guard for missing `userId`                                                                        |
| `apps/app,web,blog/src/app/api/auth/exchange-code/route.ts` | Sets `session_user_id` + `session_user_role` cookies; throws if `userId` missing                                                                         |
| `apps/app,web,blog/src/app/api/auth/get-session/route.ts`   | Reads `session_user_id` + `session_user_role`; returns them in session payload                                                                           |
| `apps/app/src/app/api/user/default-route/route.ts`          | Reads `session_user_role` directly (plain string, no JSON.parse)                                                                                         |
| `apps/app/src/lib/routing/roleRouting.ts`                   | `getRole()` reads `session_user_role` directly                                                                                                           |
| `packages/type-utils/src/auth.ts`                           | `Session` interface now has both `user?`, `userId?`, `userRole?` fields                                                                                  |
| `packages/auth/src/hooks/useSilentAuth.ts`                  | Fetches full user via role-specific API calls, injects into session                                                                                      |
| `packages/auth/src/context/AuthProvider.tsx`                | Removed unused `constructRedirectUri` import                                                                                                             |

**Status**: ✅ Fixed. Loop is dead.

### Verification

1. Visit `localhost:3003` → redirects to auth signin ✓
2. Login → redirects back → lands on dashboard ✓
3. No loops, no infinite spinners ✓
4. Second visit with IdP session → SSO fast path works (userId/userRole cookies survive) ✓
5. Session expires → redirects to signin → full flow works ✓

### Known Issues Remaining After Phase 1 (address in Phase 2)

The cookie rename was applied to some files but NOT propagated everywhere. The auth system is currently **functional but inconsistent** — several places still reference the old `session_user` / `idp_session_user` cookie names. These won't break logged-in users but will cause stale code paths to fail silently.

See **Section 5 — Phase 2 Refactor Audit** for the full list.

---

## 4. Phase 2: Standardize Names, Routes, Env Vars, Files

> **Status**: ✅ **DONE (Apr 26, 2026)** per §1.A. This section is retained as the trail-of-decisions for the standardization sweep. Every sub-item below is annotated with its final outcome: ✅ done / 🔜 deferred to phase N / 🚫 decided-to-keep / ⬜ pending (non-blocking).

**Goal**: Everything has one consistent name. Clean route structure. All references updated.
**Scope**: Renames + route moves + env updates + clean up inconsistencies from Phase 1 cookie-rename. No behavior changes.

---

### 4.-1 Phase 2 — Progress Log (live)

> Single source of truth for what's actually landed. Update on every commit.
> Legend: ✅ done · 🟡 in progress · ⬜ not started · ⛔ blocked · 🚫 dropped / deferred

**Step 1 — A2 Unauthorized-access flow** ✅ _(Apr 22, 2026)_

- Shared helper `packages/auth/src/lib/handle-unauthorized-access.ts` wired from `useSilentAuth`.
- Clears local session cookies, then hops to auth IdP `/oauth/clear-session` for cross-app logout.

**Step 2 — N5 rename `refiredtToAuthSignin` → `redirectToSignin`** ✅ _(Apr 22, 2026)_

- Applied in `apps/app/src/proxy.ts`. `grep -r refiredtToAuthSignin` returns 0.

**Step 3 — Surgical cleanup sweep** ✅ _(Apr 23, 2026)_

Covered audit items: **A8, L1, L2, L3, L5, L6, L7, M1, M2, M4, M5, M6, M8.**

- `L1` — Introduced `debugAuth()` helpers (`apps/auth/src/lib/debug-log.ts` + `packages/auth/src/lib/debug-log.ts`). All verbose structural logs now gated behind the `DEBUG_AUTH=true` env flag. `DEBUG_AUTH` added to `turbo.json` `globalEnv`.
- `L1` — Killed every log line that leaked `client_secret`, full `oAuthContext`, or full `sessionData`.
- `L2` — Removed commented blocks in: token route, both `clear-session` routes, `oauth-context-store.ts`, all 3 `Processing` components, web + blog exchange-code routes, `app/page.tsx`, `default-route`, `roleRouting.ts`, `packages/auth/src/lib/utils.ts` (`getRootDomain`).
- `L3` — Fixed stale "4KB cookie" comment in authorize route, stale `client_auth_ctx` comment in signin route, mislabeled `sessionData.user missing` log in token route.
- `L5` — `apps/auth/src/app/api/signin/route.ts` now asserts `signInResponse.user` after `success:true` instead of unsafe `?.user.id`.
- `L6` / `L7` — Removed duplicate `OAUTH CONTEXT` log; fixed mislabeled `responsePayload` log in token route.
- `A8` — Token route log label corrected: `sessionData.user missing` → `sessionData.userId missing`.
- `M1` — Fixed `[sblog:...]` → `[blog:...]` typo in blog exchange-code route.
- `M2` — Facebook/Apple login stubs tagged with `TODO(phase-13)` + master plan refs (P9-3/P9-4); eslint-disabled the unused `mode` arg.
- `M4` — Interim export of `getLogoutRedirectUri` + `getBlogAppUrl` from `packages/auth/src/index.ts` — **superseded**: both removed with **P9-6** (May 2026); file deleted.
- `M5` — Removed `console.log("got here")` + `console.log("fetchDefaultRoute")` from `apps/app/src/app/page.tsx`.
- `M6` — `/api/signin` no longer fabricates a `/dashboard` redirect when `auth_context_id` cookie is missing; returns `400 invalid_request` instead (direct signin on the auth domain is unsupported).
- `M8` — Proxy expiry branch (`apps/app/src/proxy.ts`) now returns directly with a redirect + cookie deletes instead of throwing and falling through.

**Step 4 — N3 rename `redirect_after_auth` → `return_to`** ✅ _(Apr 23, 2026)_

- Decision: **clean cut** on DynamoDB field (existing OAuth contexts expire in 10 min).
- URL param `redirect_after_auth` → `return_to`.
- JS variable `redirectAfterAuth` → `returnTo`.
- DynamoDB attribute `redirect_after_auth` → `return_to` in `apps/auth/src/lib/oauth-context-store.ts` (`OAuthClientContext` interface + write path + read path).
- Token response payload key `redirectAfterAuth` → `returnTo`.
- Client exchange-code consumers updated (`apps/{web,blog}/src/app/api/auth/exchange-code/route.ts`) to read `sessionData?.returnTo`.
- Files touched: `apps/app/src/proxy.ts`, `apps/{app,web,blog}/src/app/auth/signin/route.ts`, `apps/auth/src/app/oauth/authorize/route.ts`, `apps/auth/src/app/api/signin/route.ts`, `apps/auth/src/app/api/oauth/token/route.ts`, `apps/auth/src/lib/oauth-context-store.ts`, `apps/{web,blog}/src/app/api/auth/exchange-code/route.ts`, `apps/app/src/components/auth/Processing/index.tsx`.
- Processing components temporarily drop the `returnTo` argument; reinstated in a follow-up when they start honouring the server-returned `redirect_to`. Marked with inline `TODO(phase-2/N3)`.
- Verified: `grep -rn "redirect_after_auth\|redirectAfterAuth" src/` → only matches left are intentional "renamed from `redirect_after_auth`" docs comments.

**Step 5 — N1 `authCode` → `oauthCode`, `auth_context_id` → `cos_oauth_code`** ✅ _(Apr 25, 2026)_

- Decision: **clean cut** on the DynamoDB attribute (matches Step 4 approach — OAuth contexts have a 10 min TTL).
- JS variable `authCode` → `oauthCode` (camelCase) and `AuthCode` → `OAuthCode` (PascalCase identifiers `generateAuthCode` → `generateOAuthCode`, `getOAuthCtxParamsForAuthCode` → `getOAuthCtxParamsForOAuthCode`).
- DynamoDB attribute `authCode` → `oauthCode` in `OAuthClientContext` / `StoredOAuthContext` + write/read paths in `apps/auth/src/lib/oauth-context-store.ts`.
- Cookie `auth_context_id` → `cos_oauth_code` everywhere it is set / read / deleted.
- Files touched: `apps/auth/src/lib/oauth-context-store.ts`, `apps/auth/src/app/oauth/authorize/route.ts`, `apps/auth/src/app/oauth/clear-session/route.ts`, `apps/auth/src/app/api/signin/route.ts`, `apps/auth/src/app/api/oauth/token/route.ts`, `apps/auth/src/app/api/logout/route.ts`, `apps/auth/src/app/api/auth/clear-session/route.ts`, `apps/auth/src/app/api/auth/get-session/route.ts`, `apps/auth/src/app/api/set-password/route.ts`, `apps/auth/src/app/api/update-password/route.ts` (10 files).
- Also tidied: in signin route the local cookie var was renamed `oAuthCtxId` → `oauthCodeCookie` for consistency, and a stale `oaAuthCode` typo (pre-existing in authorize route) was collapsed into `oauthCode`.
- Verified: `grep \bauthCode\b\|\bauth_context_id\b` across `apps/` + `packages/` returns 0 matches.
- No client-app changes — this rename is fully scoped to the auth IdP (clients see only the spec-mandated `code` URL param).

**Step 6 — N4 env-var split `AUTH_BASE_URL` → `AUTH_SELF_URL` / `AUTH_PROVIDER_URL`** ✅ _(Apr 25, 2026)_

- Auth app reads `AUTH_SELF_URL` (its own public URL).
- Client apps (`app`, `web`, `blog`) read `AUTH_PROVIDER_URL` (where the auth IdP lives).
- JS local var renamed `authBaseUrl` → `authSelfUrl` (auth) / `authProviderUrl` (clients) for symmetry; log strings updated to match.
- Code files touched (10): `apps/auth/src/app/oauth/authorize/route.ts`; `apps/{app,web,blog}/src/app/auth/signin/route.ts`; `apps/{app,web,blog}/src/app/api/auth/exchange-code/route.ts`; `apps/{app,web,blog}/src/app/api/auth/logout/route.ts`; `apps/app/src/app/api/auth/{set-password,update-password}/route.ts`.
- Env files renamed (12): `apps/{auth,app,web,blog}/.env.{local,development,production}`.
- Amplify configs updated (4): `apps/{auth,app,web,blog}/amplify.yml`. **(Historical — these files were deleted Apr 28, 2026 when the project migrated off Amplify. The env-var keys still need to be set in **Vercel** project settings before deploy: `AUTH_SELF_URL` for auth, `AUTH_PROVIDER_URL` for the three client apps.)**
- `turbo.json` `globalEnv`: replaced `AUTH_BASE_URL` with `AUTH_SELF_URL` + `AUTH_PROVIDER_URL` so eslint stops complaining about undeclared env reads.
- `AGENTS.md` env-var reference list updated so future AI agents know the new contract. The aspirational env snippets in `docs/apps/*/OVERVIEW.md` and `docs/apps/auth/system-design/AUTH.md` were intentionally **not** touched — those docs already reference invented names like `NEXT_PUBLIC_AUTH_BASE_URL` / `CLIENT_ID` and need a separate doc-overhaul pass.
- Verified: `grep "AUTH_BASE_URL\|authBaseUrl"` across `apps/` returns 0 (excluding `.next/` build artifacts that will regenerate).

**Step 7 — F2/F3 feature-dir renames (Processing casing + symmetry across client apps)** ✅ _(Apr 25, 2026)_

- **Web**: `apps/web/src/features/auth/processing/` → `apps/web/src/features/auth/Processing/` via `git mv` (2-step on Windows case-insensitive FS); single import in `apps/web/src/app/auth/processing/page.tsx` updated.
- **App**: per explicit user choice, created the new `apps/app/src/features/` dir convention and moved `apps/app/src/components/auth/Processing/` → `apps/app/src/features/auth/Processing/`. Single import in `apps/app/src/app/auth/processing/page.tsx` updated. `apps/app/src/components/auth/SocialAccounts.tsx` left in place (it predates this rename and falls outside F2). Note: `apps/app` had no prior `features/` dir — Processing is currently the only entry, but additional features can colocate here as the app grows.
- **Blog**: already PascalCase; no change.
- Verified: `grep "components/auth/Processing\|features/auth/processing"` across `apps/` returns 0 source matches.

**Step 8 — Auth app route reorg under `/api/auth/*` (P2-3)** ✅ _(Apr 26, 2026)_

**Route moves completed (10 of 10):**

- `apps/auth/src/app/api/{signin,signup,logout,reset-password,set-password,update-password}/` → `/api/auth/<same>/` (via `git mv`).
- `apps/auth/src/app/api/oauth/token/` → `apps/auth/src/app/api/auth/token/` (and the now-empty `oauth/` parent dir removed).
- `apps/auth/src/app/api/auth/get-session/` → `apps/auth/src/app/api/auth/session/`.
- `apps/auth/src/app/api/auth/clear-session/` **deleted** (was a byte-identical duplicate of `/oauth/clear-session`, 0 callers).
- `apps/auth/src/app/api/confirm-signup/` + `forgot-password/` → moved via PowerShell `Move-Item` + `git add -A` (the `resend/` subdir was file-locked by the IDE's TS server even with dev servers stopped, which blocked `git mv`'s internal rename; `Move-Item` uses a different Win32 API and succeeded. Git still detected them as renames.)

**Deliberate deviation from plan — `/oauth/clear-session` KEPT (not removed):**

The plan said to remove `/oauth/clear-session` in favour of `DELETE /api/auth/session`. This was wrong — `/oauth/clear-session` serves a different purpose: **cross-origin browser-redirect cleanup of IdP cookies** on the auth domain. `handle-unauthorized-access.ts` does `window.location.href = .../oauth/clear-session` (hard browser nav — must be GET; a DELETE method endpoint cannot be hit via `<a href>` / `window.location`). Keeping it as-is.

**Bug fix bundled into this step:**

- `apps/auth/src/features/ClearSession.tsx` was calling `/api/oauth/clear-session` — a path that never existed. Silently failed via catch block, still redirected user to signin. Fixed to call the real `/oauth/clear-session`.

**Caller updates:**

- 7 hooks in `packages/auth/src/hooks/` updated (useSignIn/SignUp/ConfirmSignup/ResendSignupCode/ForgotPassword/ResendForgotPasswordCode/ResetPassword).
- `apps/app/src/app/api/auth/{set-password,update-password}/route.ts` — hardcoded `${authProviderUrl}/api/set-password` and `/api/update-password` → updated to `/api/auth/*`.
- `apps/{app,web,blog}/.env.{local,development,production}` — IdP paths via **`AUTH_APP_*_ENDPOINT`** (May 2026); historical migration from `/api/oauth/token` → `/api/auth/token`, etc.
- `amplify.yml` files for client apps were unchanged at the time, then **deleted Apr 28, 2026** during the Vercel migration. **Vercel** client projects must set **`AUTH_APP_TOKEN_ENDPOINT`**, **`AUTH_APP_LOGOUT_ENDPOINT`**, **`AUTH_APP_AUTHORIZE_ENDPOINT`**, **`AUTH_APP_REFRESH_ENDPOINT`** (or rely on in-code defaults — same paths as below).

**Remaining polish (non-blocking):**

- Log strings in moved routes (`[auth:/api/signin]` etc.) still reference old paths — functional but inaccurate for debugging. Should be updated to `[auth:/api/auth/signin]` in a follow-up pass.
- Auth app env keys for IdP paths: client apps use **`AUTH_APP_*_ENDPOINT`** (see P2-5 ✅ May 2026).

**Verified:**

- `grep "/api/signin"` / `/api/logout` / `/api/oauth/token` across `apps/` returns 0 — no callers remain on old paths.

---

### 4.0 Phase 2 Pre-Refactor Audit (April 11, 2026)

Full codebase sweep after the Phase 1 loop fix. All findings below must be addressed before or during Phase 2 tasks. Organized by severity.

#### 🔴 CRITICAL — Broken after Phase 1 cookie rename

The user's fix (split `user` → `userId` + `userRole`) was applied in the **happy path** (signin → authorize SSO → exchange-code → get-session → default-route → roleRouting). But **14 other places** still reference the old cookie names and will fail silently or on specific flows.

**Auth app (IdP) — still reading/deleting old `idp_session_user`**:

| File                                                | Line           | Issue                                                                                                                            |
| --------------------------------------------------- | -------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `apps/auth/src/app/api/auth/get-session/route.ts`   | 11, 16, 33, 54 | Reads `idp_session_user` cookie (no longer set); also `JSON.parse(rawSessionId)` double-parses the plain-string sessionId cookie |
| `apps/auth/src/app/api/auth/clear-session/route.ts` | 18             | Deletes `idp_session_user` only (misses `_id` + `_role`)                                                                         |
| `apps/auth/src/app/oauth/clear-session/route.ts`    | 18             | Same — deletes `idp_session_user` only                                                                                           |
| `apps/auth/src/app/api/logout/route.ts`             | 46, 66         | Deletes `idp_session_user` only                                                                                                  |
| `apps/auth/src/app/api/set-password/route.ts`       | (~line 59)     | Deletes `idp_session_user` (verify and fix)                                                                                      |
| `apps/auth/src/app/api/update-password/route.ts`    | (~line 62)     | Deletes `idp_session_user` (verify and fix)                                                                                      |

**Client apps (app/web/blog) — still deleting old `session_user`**:

| File                                         | Line    | Issue                                                                                |
| -------------------------------------------- | ------- | ------------------------------------------------------------------------------------ |
| `apps/app/src/proxy.ts`                      | 123     | Deletes `session_user` on expiry (should be `session_user_id` + `session_user_role`) |
| `apps/app/src/app/api/auth/logout/route.ts`  | 98, 121 | Deletes `session_user` only                                                          |
| `apps/web/src/app/api/auth/logout/route.ts`  | 99, 121 | Deletes `session_user` only                                                          |
| `apps/blog/src/app/api/auth/logout/route.ts` | 97, 119 | Deletes `session_user` only                                                          |

**Result**: After logout or session expiry, stale `session_user_id` + `session_user_role` cookies remain in the browser. On next visit, the middleware may still see an incomplete state and behave unpredictably.

**Client app password routes — reading old `session_user` cookie (currently BROKEN)**:

| File                                                 | Lines            | Issue                                                                                                                                   |
| ---------------------------------------------------- | ---------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `apps/app/src/app/api/auth/update-password/route.ts` | 43, 74-83, 85-87 | Reads `session_user` cookie, JSON.parses it, then accesses `.email` / `.id`. Cookie no longer set → throws at line 85. Route is BROKEN. |
| `apps/app/src/app/api/auth/set-password/route.ts`    | 42, 73-82, 84-86 | Same issue, same breakage.                                                                                                              |

Both routes are effectively dead right now — their hooks `useUpdatePassword` / `useSetNewPassword` are **not called from anywhere** in the codebase (verified via grep for `handleUpdatePassword` / `handleSetNewPassword`). They will need full refactoring when the password-change feature is wired up.

Proposed new contract:

- Client hook passes `email` + `userId` in request body (from `useAuth().sessionUser`)
- Route reads `session_tokens` cookie for `accessToken`, takes `email` + `userId` from body
- No cookie parsing for user data on the client app side

**P2-FIX-1** (APPLIED ✅): Replaced all `*_session_user` cookie deletions in logout / proxy / clear-session / set-password / update-password routes (10 files touched) with `*_session_user_id` + `*_session_user_role`.

**P2-FIX-2** (APPLIED ✅): Updated auth app's `/api/auth/get-session` to read new cookies (`idp_session_user_id` + `idp_session_user_role`) as plain strings; removed `JSON.parse(rawSessionId)` on the plain-string sessionId cookie.

**P2-FIX-PASSWORDS** (pending — dead feature, low priority): Refactor `apps/app/src/app/api/auth/{update-password,set-password}/route.ts` to accept `email` + `userId` in request body; update hooks `useUpdatePassword` + `useSetNewPassword` to pass them from `useAuth()` state.

---

#### 🟠 HIGH — Architectural / data-flow issues

**A1: Hybrid `Session` type creates ambiguity** 🚫 _(decided: **keep as-is** per §18.1; doc contract lives in `packages/type-utils`)_

```@e:\AXONYX\cosmediate\app\frontend\cosmediate\packages\type-utils\src\auth.ts:18-24
export interface Session {
  sessionId?: string;
  user?: User | Admin | ClinicManager | Specialist;
  userId?: string;
  userRole?: UserRole;
  tokens?: AuthTokens;
}
```

`Session` now has BOTH `user` (populated on the client by `useSilentAuth` after fetching) AND `userId` + `userRole` (from cookies). Every consumer has to know which is authoritative. **Decide**: either keep both with clear doc comments, or drop `user` from the type and have clients use `session.userId` + a separate `sessionUser` state.

**A2: `useSilentAuth` fetches user but returns `undefined` silently for unknown roles** ✅ _(done in Phase 2 Step 1 + `useSilentAuth.ts`:49-67, 133-157 — unknown role now routes through `handleUnauthorizedAccess`; explicit `cancelled` flag prevents setState after unmount)_

```@e:\AXONYX\cosmediate\app\frontend\cosmediate\packages\auth\src\hooks\useSilentAuth.ts:28-42
  const getSessionUser = async (
    userId: string,
    userRole: UserRole,
    token: string
  ) => {
    if (userRole === "ADMIN") {
      return (await getAdminApi({ id: userId }, token)).item;
    } else if (userRole === "MANAGER") {
      return (await getClinicManagerApi({ id: userId }, token)).item;
    } else if (userRole === "SPECIALIST") {
      return (await getSpecialistApi({ id: userId })).item;
    } else if (userRole === "USER") {
      return (await getUserApi({ id: userId }, token)).item;
    }
  };
```

Issues:

- No `else` branch → unknown roles return `undefined` → `setSession({ ...session, user: undefined })` → downstream null-safety bugs.
- `getSpecialistApi` does NOT receive the access token (line 38) while the others do. Likely a bug or intentional inconsistency that needs a comment.
- No abort on component unmount — setState on unmounted component is possible if nav happens mid-fetch.
- 10 retries × 800ms = up to 8s of blocking before final failure. Users wait a long time on real failures.

**A3: `useSilentAuth` spreads possibly-undefined data** ✅ _(done — `useSilentAuth.ts`:123-144 now only calls `getSessionUser` inside the `authenticated && session` guard, with explicit `decision A3` comment)_

```@e:\AXONYX\cosmediate\app\frontend\cosmediate\packages\auth\src\hooks\useSilentAuth.ts:80-88
        const user = await getSessionUser(
          data.session?.userId,
          data.session?.userRole,
          data.session?.tokens.accessToken
        );

        if (data.authenticated) {
          setIsAuthenticated(true);
          setSession({ ...data.session, user });
```

If `res.ok` but `authenticated: false`, `data.session` may be `null`. The fetch is called with `null` args → API throws or returns garbage. Should only call `getSessionUser` inside the `if (data.authenticated)` branch.

**A4: `AuthProvider` assumes `session.user` is the one from `useSilentAuth`'s merge** ✅ _(done — `AuthProvider.tsx`:65-80 now uses `session.userRole` as source of truth, with explicit `Decision A4` comment; `session.user` treated as nice-to-have)_

```@e:\AXONYX\cosmediate\app\frontend\cosmediate\packages\auth\src\context\AuthProvider.tsx:65-73
  useEffect(() => {
    if (isAuthenticated && session && session?.user) {
      console.log("session?.user.role", session?.user.role);

      dispatch({ type: "SET_SESSION", payload: session });
      dispatch({ type: "SET_SESSION_USER", payload: session?.user });
      dispatch({ type: "SET_USER_ROLE", payload: session?.user.role });
    }
  }, [isAuthenticated, session, session?.user]);
```

`userRole` is derived from `session.user.role`, not from `session.userRole`. If the API fetch fails (returns undefined), the whole provider stays in initial state even though `isAuthenticated === true`. Should use `session.userRole` as the source of truth and keep `session.user` as a nice-to-have.

**A5: `AuthTokens` interface has string expiries but code compares as numbers** 🔜 **P5** _(Data Layer Refactor — deferred per §18.1; solved via DDB↔runtime mappers)_

```@e:\AXONYX\cosmediate\app\frontend\cosmediate\packages\type-utils\src\auth.ts:10-16
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  idToken: string;
  expiresAt: string;
  refreshTokenExpiresAt: string;
}
```

vs middleware:

```@e:\AXONYX\cosmediate\app\frontend\cosmediate\apps\app\src\proxy.ts:115-120
      const expiresAt = tokens?.expiresAt;
      const now = Math.floor(Date.now() / 1000);
```

Type says `string`, middleware compares as number. In practice the backend returns numbers (Unix seconds). Fix the type.

**A6: Middleware does not validate other client apps** ✅ **scoped May 2026** — **`web`**/**`blog`** intentionally **public** (`proxy` **`mode: "public"`**). **`return_to`** UX: **`@cosmediate/header`** Sign In URLs + dashboard **`runProxySessionGate`** (`pathname + search`). Future authenticated **`web`**/**`blog`** routes → add **`proxy`** matchers (see §12 Phase 10).

**A7: `getSpecialistApi` call lacks auth token** ✅ _(done — `useSilentAuth.ts`:41-44 has explicit `decision A7` comment; endpoint is intentionally public)_

```@e:\AXONYX\cosmediate\app\frontend\cosmediate\packages\auth\src\hooks\useSilentAuth.ts:37-38
    } else if (userRole === "SPECIALIST") {
      return (await getSpecialistApi({ id: userId })).item;
```

Either `getSpecialistApi` doesn't need it (public endpoint) or this is a bug. Verify against `packages/api/src/apis/specialist.api.ts`.

**A8: Token endpoint error message references old field name** ✅ _(fixed Apr 23, 2026)_

```@e:\AXONYX\cosmediate\app\frontend\cosmediate\apps\auth\src\app\api\oauth\token\route.ts:177-186
    if (!sessionData?.userId) {
      console.error("CRITICAL: sessionData.user missing", sessionData);
```

Log says "user missing" but check is `!sessionData?.userId`. Update the message.

**A9: OAuth context `SessionData` has stale commented code** ✅ _(fixed Apr 23, 2026 — removed during L2 sweep)_

```@e:\AXONYX\cosmediate\app\frontend\cosmediate\apps\auth\src\lib\oauth-context-store.ts:23-33
export interface SessionData {
  sessionId: string;
  // userId: User | Admin | ClinicManager | Specialist;
  userId: string;
  userRole: UserRole;
```

Line 25 — nonsensical commented line left from refactor. Remove.

**A10: Exchange-code routes hardcode redirect for app (but not web/blog)** 🟡 **partial → 🔜 P6** _(N3 rename `redirect_after_auth` → `return_to` done in Step 4. Processing components still carry `TODO(phase-2/N3)` markers; the hardcoded `redirectTo: "/"` in `apps/app/src/app/api/auth/exchange-code/route.ts:106` is fixed when P6-2 rewrites the exchange route to emit `redirect_to` from `return_to`.)_

- `apps/app/src/app/api/auth/exchange-code/route.ts:106` → `redirectTo: "/"` (ignores `sessionData.redirectAfterAuth`)
- `apps/web/.../exchange-code/route.ts:124` → `redirectTo: sessionData?.redirectAfterAuth ?? "/"`
- `apps/blog/.../exchange-code/route.ts:107` → `redirectTo: sessionData?.redirectAfterAuth ?? "/"`

Also the processing components (`apps/app/.../Processing/index.tsx:47`, web, blog) all hardcode `const redirectTo = "/"` — ignoring both `redirectAfterAuth` and `data.redirectTo`. **Either the `redirect_after_auth` param should be respected everywhere, or the feature should be dropped. It's currently dead code that still flows through all layers.**

---

#### 🟡 MEDIUM — Code duplication (prime refactor targets)

**D1: `exchange-code` route is ~95% identical across 3 apps** 🔜 **P8** _(auth-bff `createExchangeHandler` factory)_

`apps/{app,web,blog}/src/app/api/auth/exchange-code/route.ts` — 100–150 lines of almost-identical code. Only differences:

- Import paths (`@app` vs `@web` vs `@blog`)
- Log prefix (`[app:...]` vs `[web:...]` vs `[blog:...]`)
- `app` hardcodes `redirectTo: "/"`; others use `sessionData.redirectAfterAuth`

**Refactor**: Move to a shared `packages/auth-server/exchange-code.ts` helper, each app's route is a 5-line wrapper.

**D2: `get-session` route is ~98% identical across 3 apps** 🔜 **P8** _(auth-bff `createSessionHandler` factory)_

Same story. Extract to `packages/auth-server/get-session.ts`.

**D3: `logout` route is ~95% identical across 3 apps** ✅ **P9** _(auth-bff `createLogoutRouteHandlers`; unified **`access_token`** body, May 2026)_

Same. Also the auth app's `/api/logout` has nearly-identical cookie cleanup logic to `/api/auth/clear-session` and `/oauth/clear-session`.

**D4: `proxy.ts` cross-app routing logic is 100% identical across all 4 apps** 🔜 **P8** _(`createCrossAppRouter` in auth-bff middleware)_

`apps/{app,web,blog,auth}/src/proxy.ts` — `/home`, `/dashboard`, `/blog` redirect blocks are byte-for-byte identical across all 4 apps.

**Refactor**: Extract to `packages/proxy-utils/cross-app-router.ts`, each app's proxy imports it.

**D5: Processing components duplicated across 3 apps** 🔜 **P8** _(shared in auth-bff or package; feature-dir rename F2 done Step 7)_

`apps/{app,web,blog}/src/{components|features}/auth/Processing/index.tsx` — ~100 lines each, differ only in log prefix. Already identified in existing P2-2 task.

**D6: clear-session route exists twice in auth app** ✅ _(Step 8: `/api/auth/clear-session/` **deleted** — was byte-identical dup, 0 callers. `/oauth/clear-session/` **kept** deliberately — see §2 Key Observation #3 + P9-4.)_

~~`apps/auth/src/app/api/auth/clear-session/route.ts`~~ and `apps/auth/src/app/oauth/clear-session/route.ts` — BYTE-IDENTICAL (both 45 lines). First one deleted. Second one retained because `window.location.href` cross-origin redirects require a GET endpoint (a `DELETE` method cannot be hit via `<a href>`).

**D7: Role-routing logic mixed between middleware, page, and lib** 🔜 **P8** _(consolidated into `packages/auth-bff` middleware + `packages/config` URL utils; deleted from per-app `lib/server/*` + `lib/routing/*`)_

- Middleware (`proxy.ts`) reads `session_tokens` and `session_user_role` cookies
- Root page (`page.tsx`) calls `/api/user/default-route`
- `roleRouting.ts` has `getRole()`, `validateRoleForUserRoutes()`, etc. using `next/headers` cookies

Three different ways to read the same cookies across three different contexts. Consolidate into a single server-side util.

---

#### 🟡 MEDIUM — Naming confusion (systematic)

Beyond the ones documented in Phase 2 P2-1...P2-7:

**N1: OAuth auth code has 3 names for the same value** ✅ _(fixed Apr 25, 2026)_

| Name              | Where                                                       |     |
| ----------------- | ----------------------------------------------------------- | --- |
| `authCode`        | `oauth-context-store.ts` — JS variable                      |
| `auth_context_id` | Cookie name stored by `/oauth/authorize`                    |
| `code`            | URL param on `/auth/processing` and `/api/oauth/token` body |

All three refer to the SAME string (generated by `generateAuthCode()`). Rename: `authCode` → `oauthCode` everywhere; cookie becomes `cos_oauth_code`; URL param stays `code` (OAuth spec).

**N2: `client_auth_ctx` cookie vs `authCode` concept** 🔜 **P6** _(Cookie & Session Redesign — per §18.1, may be removed entirely in P6 rather than renamed)_

`client_auth_ctx` cookie stores a **JSON blob** with `client_id`, `redirect_uri`, `scope`, etc. — basically the OAuth request payload. But it's named like an "auth context" which suggests session/identity. Rename to `cos_oauth_request` **or** eliminate the cookie-blob pattern entirely in P6.

**N3: `redirect_after_auth` has 4 names** ✅ _(fixed Apr 23, 2026 — codebase-wide rename to `return_to` / `returnTo`)_

- `redirect_after_auth` (URL param, snake_case)
- `redirectAfterAuth` (JS variable in JS, camelCase)
- `redirectTo` (response field from signin)
- `redirect_to` (nowhere currently — proposed in plan)

Standardize on `return_to` per Decision 4.

**N4: `AUTH_BASE_URL` env var overloaded** ✅ _(fixed Apr 25, 2026)_

- In auth app: means "this auth app's own public URL"
- In client apps: means "the URL where the auth app lives"

Same name, opposite meaning. Rename per plan Decision 5:

- Auth app: `AUTH_SELF_URL`
- Client apps: `AUTH_PROVIDER_URL`

**N5: Function name typo `refiredtToAuthSignin`** ✅ _(fixed Apr 22, 2026)_

`apps/app/src/proxy.ts:8` — should be `redirectToAuthSignin` or `redirectToSignin`. Already in P2-1.

**N6: Mixed snake_case / camelCase in API payloads** ✅ **P9** _(logout browser→BFF body uses **`access_token`**; BFF→IdP uses Bearer + `{}`; remaining payload rules in `CODING_STANDARDS.md`)_

- Auth app `/api/oauth/token` response: `redirectAfterAuth` (camelCase)
- Client app exchange-code sends: `redirect_uri` (snake_case) + `client_id` (snake_case)
- Client app logout sends: **`access_token`** (snake_case) to BFF; IdP accepts optional **`redirect_uri`** (snake_case) or defaults server-side

Pick one convention per boundary. OAuth spec fields (snake_case) for OAuth endpoints; camelCase for internal JSON payloads. Document in `packages/type-utils`.

---

#### 🟢 LOW — Dead code, debug logs, commented-out blocks

**L1: Debug console.logs littered across all auth routes** ✅ _(gated behind `DEBUG_AUTH` Apr 23, 2026)_

Dozens of `console.log(...)` in signin, authorize, token, exchange-code, default-route, proxy, processing components, and AuthProvider. Grep counts (approximate):

- `apps/auth/src/**/*.ts` → 30+ debug logs
- `apps/app/src/**/*.ts` → 20+ debug logs
- `packages/auth/src/**/*.ts` → 10+ debug logs

Gate behind `NODE_ENV === "development"` or remove entirely.

**L2: Commented-out code blocks** ✅ _(removed Apr 23, 2026)_ (all of these should be removed):

- `apps/auth/src/app/api/oauth/token/route.ts:18-24, 154-162` — commented body parsing + redirect_uri check
- `apps/auth/src/lib/oauth-context-store.ts:25` — `// userId: User | Admin | ClinicManager | Specialist;`
- `apps/auth/src/app/api/auth/clear-session/route.ts:35-40` — commented cookie deletes
- `apps/auth/src/app/oauth/clear-session/route.ts:35-40` — same
- `apps/app/src/app/api/user/default-route/route.ts:25-53` — large commented-out parsing block from before the refactor
- `apps/app/src/app/page.tsx:34` — `// const defaultRoute = getDefaultRouteForRole(userRole);`
- `apps/app/src/components/auth/Processing/index.tsx:7, 11, 45-46` — commented imports + dead redirect code
- `apps/web/src/features/auth/processing/index.tsx:7, 11, 45-46` — same
- `apps/blog/src/features/auth/Processing/index.tsx:7, 11, 45-46` — same
- `apps/{web,blog}/src/app/api/auth/exchange-code/route.ts:56-68` — commented-out fetch with JSON body
- `packages/auth/src/context/AuthProvider.tsx:111-117` — commented-out logout flow
- `packages/auth/src/lib/utils.ts:79-84` — commented-out return logic in `getRootDomain`
- `apps/app/src/lib/routing/roleRouting.ts:56-57` — commented normalizedRole

**L3: Stale comments no longer accurate** ✅ _(fixed Apr 23, 2026)_

- `apps/auth/src/app/oauth/authorize/route.ts:148` — `// Note: idpSessionUser may be undefined if the cookie exceeded browser's ~4KB limit` — no longer applies since we no longer store full user
- `apps/auth/src/app/api/signin/route.ts:119-122` — `"Missing client_auth_ctx cookie"` comment contradicts the `auth_context_id` cookie check in the code above
- `apps/auth/src/app/api/oauth/token/route.ts:178` — log message says `sessionData.user missing` but checks `userId`

**L4: `console.log("PUSh")` / `console.log("got here")` already removed** — confirmed clean.

**L5: `signInResponse?.user.id` is unsafe (optional chain then non-optional access)** ✅ _(fixed Apr 23, 2026)_

```@e:\AXONYX\cosmediate\app\frontend\cosmediate\apps\auth\src\app\api\signin\route.ts:72-81
    const session = {
      sessionId: signInResponse.sessionId,
      userId: signInResponse?.user.id,
      userRole: signInResponse?.user.role,
```

If `signInResponse` is defined but `signInResponse.user` is undefined (edge case), this throws. Either assert `signInResponse.user` upfront (we already know `success: true`) or drop the optional chain.

**L6: Duplicate `console.log("==> OAUTH CONTEXT", oAuthContext)` in token route** ✅ _(fixed Apr 23, 2026)_

```@e:\AXONYX\cosmediate\app\frontend\cosmediate\apps\auth\src\app\api\oauth\token\route.ts:130,141
    console.log("==> OAUTH CONTEXT", oAuthContext);
    ...
    console.log("==> OAUTH CONTEXT", oAuthContext);
```

Same log twice, 11 lines apart.

**L7: `apps/auth/src/app/api/oauth/token/route.ts:200` logs wrong label** ✅ _(fixed Apr 23, 2026)_

```typescript
console.log("[auth:/oauth/token] responsePayload", responsePayload);
console.log("[auth:/oauth/token] responsePayload", responsePayload?.userId);
```

Second log says "responsePayload" but actually logs `userId`. Fix label.

---

#### 🟢 LOW — Miscellaneous

**M1: `[sblog:...]` typo log prefix** ✅ _(fixed Apr 23, 2026)_

```@e:\AXONYX\cosmediate\app\frontend\cosmediate\apps\blog\src\app\api\auth\exchange-code\route.ts:36
      console.log("[sblog:/api/auth/exchange-code] Missing auth token path");
```

`[sblog:...]` should be `[blog:...]`.

**M2: `handleFacebookLogin` and `handleAppleLogin` are empty stubs** ✅ _(tagged `TODO(phase-13)` Apr 23, 2026 — deferred per Phase 13/P9-3,P9-4)_

```@e:\AXONYX\cosmediate\app\frontend\cosmediate\packages\auth\src\hooks\useSocialAccountsSignin.ts:78-80
  const handleFacebookLogin = async (mode: "manual" | "auto") => {};

  const handleAppleLogin = async (mode: "manual" | "auto") => {};
```

Either remove or mark as TODO with a ticket reference.

**M3: `handleGoogleLogin` uses `NEXT_PUBLIC_*` env vars in the hook — exposes to client bundle** ✅ _(decided: **keep as-is** per §18.1 M3: auth app is `.com`-only; social login runs only on the auth app; `NEXT_PUBLIC_COGNITO_OAUTH_REDIRECT_URI` stays as a static env var per environment. No hostname derivation needed.)_

**M4: `packages/auth/src/index.ts` re-exports utilities incompletely** ✅ _(resolved **Phase 9**, May 2026 — **`packages/auth/src/lib/utils.ts`** deleted; **`AuthProvider`** / **`handleUnauthorizedAccess`** import **`getAuthClearSessionUrlClient`** from **`@cosmediate/config`**.)_

_Historical note (Apr 2026):_ interim exports of `constructRedirectUri`, `getRootDomain`, etc. were inconsistent with internal `@auth-core/lib/utils` imports. **P9-6** removed the entire utils module.

**M5: `apps/app/src/app/page.tsx` still imports but doesn't use `useRouter`-adjacent logic** ✅ _(fixed Apr 23, 2026)_

```@e:\AXONYX\cosmediate\app\frontend\cosmediate\apps\app\src\app\page.tsx:50
  console.log("got here");
```

Debug log that runs on every render. Remove.

**M6: Hardcoded `/dashboard` fallback in auth app signin** ✅ _(fixed Apr 23, 2026 — now returns 400)_

```@e:\AXONYX\cosmediate\app\frontend\cosmediate\apps\auth\src\app\api\signin\route.ts:119-124
    } else {
      console.warn("[auth:/api/signin] Missing client_auth_ctx cookie");

      const target = new URL("/dashboard", request.url);
      redirectTo = target.toString();
    }
```

If user hits `/api/signin` without an `auth_context_id` cookie (direct signin on the auth app itself), they get redirected to `/dashboard` on the AUTH APP domain — which doesn't exist. This is dead code that should either redirect to a valid page or return an error.

**M7: Long retry loop in `useSilentAuth`** ✅ _(done — `useSilentAuth.ts`:21-24 now `MAX_RETRIES=3`, `RETRY_DELAY_MS=500`; retry only fires on thrown network errors (line 104-111), `!res.ok` HTTP errors return `null` without retry (line 93-101); explicit `decision M7` comment)_

**M8: `refiredtToAuthSignin` is imported-less used in app proxy on `/` path** ✅ _(fixed Apr 22, 2026 — expiry branch returns directly)_

```@e:\AXONYX\cosmediate\app\frontend\cosmediate\apps\app\src\proxy.ts:161-168
  if (pathname === "/") {
    if (!isAuthenticated) {
      return refiredtToAuthSignin(request, redirectAfterAuth);
    }
    // Authenticated users will be handled by the root page component
```

After user's fix, line 136 already redirects to signin when `tokens` is missing. If there ARE tokens but expired (line 120), it throws "Session expired" and sets `isAuthenticated = false` but doesn't return — falls through to line 148/161 checks. Convoluted flow. Simplify by making the expiry branch return directly.

---

#### 🟢 LOW — File layout

**F1: `apps/web/src/features/auth_temp/processing_temp/` — DELETED** ✅

Already cleaned up by user. New location: `apps/web/src/features/auth/processing/`. Verify no stale imports.

**F2: `apps/blog/src/features/auth/Processing/` capital P vs `apps/web/src/features/auth/processing/` lowercase p** ✅ _(Step 7 — all client apps now PascalCase `features/auth/Processing/`; `apps/app` also moved from `components/auth/Processing/` to `features/auth/Processing/`)_

**F3: Auth app has both `apps/auth/src/app/api/auth/*` and `apps/auth/src/app/api/*` route groups** ✅ _(Step 8 — all 10 auth IdP routes consolidated under `/api/auth/*`)_

---

### 4.1 Summary of Phase 2 Work

> **Legend**: ✅ done in P2 · 🔜 deferred to phase N · 🚫 decided-to-keep (no code change) · 🟡 partial · ⬜ pending (non-blocking)

| Task ID              | Summary                                                                                                         | Status                                         | Effort |
| -------------------- | --------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- | ------ |
| **P2-FIX-1**         | Replace all old `*_session_user` cookie references with `*_session_user_id` + `*_session_user_role` (14 places) | ✅                                             | Small  |
| **P2-FIX-2**         | Fix auth app `/api/auth/get-session` to read new cookies                                                        | ✅                                             | Small  |
| **P2-FIX-3**         | Fix `useSilentAuth` edge cases (A2, A3, A7)                                                                     | ✅                                             | Small  |
| **P2-FIX-4**         | Decide `Session.user` vs `Session.userId` split and clean up type (A1)                                          | ✅ 🚫 _kept both_                              | Small  |
| **P2-FIX-5**         | Fix `AuthTokens` type (`expiresAt: number`) (A5)                                                                | 🔜 **P5**                                      | Tiny   |
| **P2-FIX-6**         | Fix `AuthProvider` to use `session.userRole` (A4)                                                               | ✅                                             | Small  |
| **P2-FIX-7**         | Decide on `redirect_after_auth` (A10) — implement or remove                                                     | 🟡 rename ✅ · honour 🔜 **P6**                | Small  |
| **P2-FIX-PASSWORDS** | Refactor `set-password`/`update-password` client routes (dead feature)                                          | ⬜ _pending UX wire-up_                        | Small  |
| **P2-1**             | Rename function + typo (`refiredtToAuthSignin` → `redirectToSignin`) (N5)                                       | ✅                                             | Tiny   |
| **P2-2**             | Feature-dir renames (F2, auth_temp cleanup)                                                                     | ✅                                             | Small  |
| **P2-3**             | Auth app route reorg under `/api/auth/*` (F3)                                                                   | ✅                                             | Medium |
| **P2-4**             | Client app `exchange-code` → `exchange`, `get-session` → `session`                                              | 🔜 **P8** _(bundled with auth-bff extraction)_ | Small  |
| **P2-5**             | Env var: **`AUTH_APP_*_ENDPOINT`** for IdP path overrides (N4)                                                 | ✅ **`AUTH_APP_*_PATH` removed from code + turbo (May 2026)** | Small  |
| **P2-6**             | `redirect_after_auth` → `return_to` (N3)                                                                        | ✅                                             | Small  |
| **P2-7**             | Standardize API response format (error shape, `redirect_to`)                                                    | 🔜 **P3**                                      | Medium |
| **P2-8**             | Logout body snake_case fix (N6)                                                                                 | ✅ **P9** (May 2026)                           | Small  |
| **P2-9**             | Remove dead commented-out code (L2)                                                                             | ✅                                             | Small  |
| **P2-10**            | Gate / remove sensitive `console.log`s (L1)                                                                     | ✅                                             | Small  |
| **P2-DUP-1**         | Extract shared `exchange-code` / `get-session` / `logout` / `processing` logic (D1-D3, D5)                      | 🔜 **P8** _(D3 logout ✅ **P9** May 2026)_      | Large  |
| **P2-DUP-2**         | Extract shared `proxy.ts` cross-app router (D4)                                                                 | 🔜 **P8**                                      | Medium |
| **P2-LOG-1**         | Scrub debug logs (L1, L5-L7, M1)                                                                                | ✅                                             | Small  |
| **P2-DEAD-1**        | Remove all commented-out blocks (L2)                                                                            | ✅                                             | Small  |
| **P2-STALE-1**       | Fix stale comments and error messages (L3, A8, A9)                                                              | ✅                                             | Tiny   |

**Net**: 15 items closed in P2, 2 kept by decision (A1, M3), 1 partially closed (A10). Remaining deferred items roll into later phases per §1.A. **May 2026:** **P2-8** + the logout slice of **N6** landed in **Phase 9**.

---

### Tasks

#### P2-1: Rename function + fix typo ✅ _(Apr 22, 2026)_

- `refiredtToAuthSignin` → `redirectToSignin` in `apps/app/src/proxy.ts`

#### P2-2: Rename feature directories ✅ _(Apr 25, 2026 — Step 7)_

- `apps/web/src/features/auth_temp/processing_temp/` → `apps/web/src/features/auth/Processing/`
- Update all imports referencing old path

#### P2-3: Move auth app API routes under `/api/auth/` ✅ _(Apr 26, 2026 — Step 8)_

- Move and update: signin, signup, logout, confirm-signup, forgot-password, reset-password, set-password, update-password
- Move `/api/oauth/token/` → `/api/auth/token/`
- Rename `/api/auth/get-session/` → `/api/auth/session/`
- Remove `/api/auth/clear-session/` (will be DELETE handler on `/api/auth/session/`)
- Remove `/oauth/clear-session/` (redundant)
- Add DELETE handler to `/api/auth/session/route.ts` (same file as GET)
- **Update all references**: client app env vars, packages/auth hooks, any hardcoded paths

#### P2-4: Rename client app routes 🔜 **P8** _(deferred — bundled with auth-bff extraction to avoid touching these routes twice)_

- `exchange-code` → `exchange` in all 3 client apps
- `get-session` → `session` in all 3 client apps
- Update all client-side fetch calls in Processing components, useSilentAuth, AuthProvider

#### P2-5: Standardize env variable names ✅ _May 2026_

Per Decision 5. Update all `.env.local`, `.env.development`, `.env.production` files across all 4 apps.

- `AUTH_BASE_URL` (in auth) → `AUTH_SELF_URL` ✅
- `AUTH_BASE_URL` (in clients) → `AUTH_PROVIDER_URL` ✅
- `AUTH_APP_TOKEN_PATH` / **`AUTH_APP_TOKEN_ENDPOINT`** → **`AUTH_APP_TOKEN_ENDPOINT`** only ✅
- `AUTH_APP_LOGOUT_PATH` → **`AUTH_APP_LOGOUT_ENDPOINT`** only ✅
- `AUTH_APP_AUTHORIZE_PATH` → **`AUTH_APP_AUTHORIZE_ENDPOINT`** only ✅
- **`AUTH_APP_REFRESH_PATH`** → **`AUTH_APP_REFRESH_ENDPOINT`** only ✅
- **`AUTH_REDIRECT_PATH`** — canonical name (used in `turbo.json` + apps); **do not** rename to `AUTH_CALLBACK_PATH`
- Fix `# IDP BFF Variabls` → `# Auth Provider (IdP) Endpoints` ✅ _(comment blocks updated in client `.env*`)_

#### P2-6: Standardize `redirect_after_auth` → `return_to` ✅ _(Apr 23, 2026 — Step 4)_

- Auth app: authorize endpoint, signin route, OAuth context store schema
- Client apps: signin routes, Processing components, proxy.ts
- All URL params, all JS variables, all response fields

#### P2-7: Standardize API response format 🔜 **P3** _(Error Handling Standardization)_

```typescript
// Standard error: { success: false, error: "error_code", message: "Human readable" }
// Standard success: { success: true, ...data }
// Redirect field: redirect_to (snake_case, always)
```

Update all BFF and auth app routes. Deferred into P3 because the error-shape contract is feature-scoped to error-handling rather than a pure renaming sweep.

#### P2-8: Fix logout body field inconsistency (N6) ✅ **P9** _(May 2026 — Logout Unified)_

- Client BFF + AuthProvider: **`{ access_token }`** to **`/api/auth/logout`** (`accessToken` alias accepted).
- Client BFF → IdP: **`Authorization: Bearer`** + JSON **`{}`**; IdP synthesizes **`redirect_uri`** for Lambda when omitted.
- Legacy per-app **`logoutPayloadStyle`** removed from **`@cosmediate/auth-bff`**.

#### P2-9: Remove dead commented-out code ✅ _(Apr 23, 2026 — Step 3, L2)_

- Cleaned all files listed in §4.0 L2.

#### P2-10: Remove or guard sensitive `console.log`s ✅ _(Apr 23, 2026 — Step 3, L1)_

- Token/secret logging removed from auth app routes.
- Structural flow logs retained, values redacted.
- `DEBUG_AUTH=true` env flag introduced (`apps/auth/src/lib/debug-log.ts` + `packages/auth/src/lib/debug-log.ts`) for verbose logging in development; registered in `turbo.json` globalEnv.

### Verification

1. All login/logout flows still work (same logic, new names)
2. `grep -r "refiredtToAuthSignin"` → 0 results
3. `grep -r "redirect_after_auth"` → 0 results
4. `grep -r "exchange-code"` → 0 results (replaced by `exchange`)
5. `grep -r "get-session"` → 0 results (replaced by `session`)
6. All env files follow new naming

---

## 5. Phase 3: Error Handling Standardization

> **Status**: ✅ **DONE** — started Apr 30, 2026, completed May 4, 2026. All 11 tasks (P3-1..P3-11) landed. Verification per §5.4 ran clean.

**Goal**: One error contract across the auth chain. No more ad-hoc error strings, no silent mismatches between IdP, BFF, and frontend. Every auth route returns the same shape; every frontend consumer decodes it via one type.

---

### 5.1 Audit — current state (as of Apr 30, 2026)

Total `NextResponse.json(...)` call sites inventoried across 13 IdP routes + 11 client-BFF routes.

**Baseline shape** (inconsistent):

| Field                 | Used in     | Missing from                                                           | Notes                                                                             |
| --------------------- | ----------- | ---------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| `success: false`      | Most routes | `apps/auth/.../token/route.ts` (OAuth2 RFC 6749 shape)                 | Token route deliberately omits `success` to match OAuth2 spec. Keep as exception. |
| `error: "<code>"`     | Most routes | Some branches in `update-password`, `set-password` only send `message` | Inconsistent — some branches use only `message`, no `error` code.                 |
| `message: "<string>"` | Most routes | `exchange-code` routes never send `message`                            | Only `error` code, no human string.                                               |

**Observed error codes (current vocabulary)**:

| Code                         | Routes using it                                                                                             | Shape quality                             |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| `invalid_request`            | signin, signup, reset-password, forgot-password (+resend), confirm-signup (+resend), update-password, token | ✅ consistent                             |
| `server_error`               | all catch blocks across all routes                                                                          | ✅ consistent                             |
| `internal_server_error`      | signin (2 branches)                                                                                         | 🟡 duplicate of `server_error` — pick one |
| `invalid_client`             | token (2 branches)                                                                                          | ✅ OAuth2 spec                            |
| `invalid_grant`              | token (2 branches)                                                                                          | ✅ OAuth2 spec                            |
| `unsupported_grant_type`     | token                                                                                                       | ✅ OAuth2 spec                            |
| `invalid_session`            | token                                                                                                       | 🟡 IdP-internal, document it              |
| `missing_auth_code`          | exchange-code (app, web, blog)                                                                              | ✅ consistent                             |
| `server_misconfig`           | exchange-code (app, web, blog)                                                                              | ✅ consistent                             |
| `token_exchange_failed`      | exchange-code (app, web, blog)                                                                              | ✅ consistent                             |
| _(no code — `message` only)_ | `update-password` missing-session branch, `set-password` password-required branch                           | ❌ must add `error` code                  |

**Special-case response shapes** (not `success/error/message`):

| Route                                                   | Shape                                                             | Keep?                                           |
| ------------------------------------------------------- | ----------------------------------------------------------------- | ----------------------------------------------- |
| `apps/auth/.../token/route.ts` success                  | `{ accessToken, refreshToken, expiresIn, userId, userRole, ... }` | ✅ keep, OAuth2-style                           |
| `apps/auth/.../token/route.ts` error                    | `{ error, message }` (no `success`)                               | ✅ keep, OAuth2-style                           |
| `apps/auth/.../session/route.ts` + client `get-session` | `{ authenticated: bool, session: {...} \| null }`                 | ✅ keep — it's a query endpoint, not a mutation |

**Frontend consumption audit**:

| Consumer                                                     | Current behavior                                 | Problem                                                    |
| ------------------------------------------------------------ | ------------------------------------------------ | ---------------------------------------------------------- |
| `apps/auth/src/features/AuthProcessing/`                     | Reads `error` string directly                    | Switches on string — brittle (decision 3 violation)        |
| `apps/{app,web,blog}/src/app/auth/processing/page.tsx`       | Calls `/api/auth/exchange-code`, reads `success` | Ignores `error` code entirely — silent redirect on failure |
| `packages/auth/src/hooks/useSignIn.ts`, `useSignUp.ts`, etc. | Read `res.error` string                          | No shared type, no error enum                              |

---

### 5.2 Target contract

**Standard error shape** — enforced for every route that isn't `token` or `session`:

```ts
// packages/type-utils/src/auth.ts
export type AuthErrorCode =
  // Validation (400)
  | "invalid_request"
  // OAuth2 (400)
  | "invalid_grant"
  | "invalid_client"
  | "unsupported_grant_type"
  // Auth state (401)
  | "not_authenticated"
  | "invalid_session"
  // Flow-specific (400/500)
  | "missing_auth_code"
  | "token_exchange_failed"
  | "refresh_unavailable" // IdP/BFF refresh path (Phase 7 ✅)
  | "refresh_revoked" // IdP/BFF refresh path (Phase 7 ✅)
  // Server (500)
  | "server_misconfig"
  | "server_error";

export interface AuthErrorResponse {
  success: false;
  error: AuthErrorCode;
  message: string; // ALWAYS present — human-readable fallback
  details?: unknown; // optional structured detail (e.g. Cognito error payload)
}

export interface AuthSuccessResponse<T = unknown> {
  success: true;
  data?: T;
  message?: string;
  redirectTo?: string; // canonical field for client-side redirect hint
}

export type AuthResult<T = unknown> =
  | AuthSuccessResponse<T>
  | AuthErrorResponse;
```

**Kept exceptions** (documented, not standardized):

- `apps/auth/.../token/route.ts` — OAuth2 RFC 6749 shape (`{ error, message }` without `success`).
- `apps/auth/.../session/route.ts` + client `get-session` — query shape (`{ authenticated, session }`).

---

### 5.3 Tasks

| ID        | Task                                                                                                                                                                                                         | Files touched                                                                                                      | Size   |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------ | ------ |
| **P3-1** ✅ | Define `AuthErrorCode`, `AuthErrorResponse`, `AuthSuccessResponse`, `AuthResult` in `packages/type-utils/src/auth.ts` + export from index                                                                    | `packages/type-utils/src/auth.ts`, `packages/type-utils/src/index.ts`                                              | Small  |
| **P3-2** ✅ | Add `authError(code, message, status, details?)` + `authSuccess(data?, opts?)` helpers in `packages/type-utils` (or new `packages/auth-bff` stub — decide in P3) — **decided: lives in `type-utils` for P3; will be re-homed when `@cosmediate/auth-bff` lands in P8 (re-export from there)** | `packages/type-utils/src/auth-responses.ts` (new)                                                                  | Small  |
| **P3-3** ✅ | Normalize IdP routes to use helpers: `signin`, `signup`, `confirm-signup` (+resend), `forgot-password` (+resend), `reset-password`, `set-password`, `update-password`, `logout`                              | `apps/auth/src/app/api/auth/**/route.ts` (9 routes)                                                                | Medium |
| **P3-4** ✅ | Fix missing `error` codes: `update-password` missing-session branch (line 34), `set-password` password-required branch (line 22), `update-password` "Incomplete session information" branch                  | `apps/auth/src/app/api/auth/{update-password,set-password}/route.ts`                                               | Tiny   |
| **P3-5** ✅ | De-duplicate `internal_server_error` → standardize on `server_error` everywhere (signin has both)                                                                                                            | `apps/auth/src/app/api/auth/signin/route.ts`                                                                       | Tiny   |
| **P3-6** ✅ | Normalize client-BFF routes: `exchange-code`, `logout`, `set-password`, `update-password` (x3 apps where present)                                                                                            | `apps/{app,web,blog}/src/app/api/auth/**/route.ts` (11 routes)                                                     | Medium |
| **P3-7** ✅ | Add `message` field to all `exchange-code` error responses (currently code-only)                                                                                                                             | `apps/{app,web,blog}/src/app/api/auth/exchange-code/route.ts`                                                      | Tiny   |
| **P3-8** ✅ | Update `AuthProcessing` feature (IdP app) to switch on `AuthErrorCode` enum, not raw strings — now renders `InfoMessage` + "Back to sign in" instead of looping back to `/signin?error_description=…` (Decision 3 compliance); TS `never` exhaustiveness check on `AuthErrorCode`. | `apps/auth/src/features/AuthProcessing/**`                                                                         | Small  |
| **P3-9** ✅ | Update client-app `processing/page.tsx` (app, web, blog) to render errors in UI on failure instead of silent success-redirect — implemented in `apps/{app,web,blog}/src/features/auth/Processing/index.tsx` (the page files just delegate); switches on typed `AuthErrorCode` with TS `never` exhaustiveness check; loop-prevention rule from §1 Decision 3 satisfied. | `apps/{app,web,blog}/src/features/auth/Processing/index.tsx`                                                       | Small  |
| **P3-10** ✅ | Update consumer hooks in `packages/auth` (`useSignIn`, `useSignUp`, `useConfirmSignUp`, `useForgotPassword`, `useResetPassword`, `useUpdatePassword`, `useSetPassword`) to type responses as `AuthResult<T>` — landed via new `packages/auth/src/lib/parseAuthResponse.ts` (`AuthHookResult<TSuccess>` discriminated union + `parseAuthResponse` + `authClientError`); hooks no longer throw on server errors, return typed `AuthErrorResponse` instead; 5 form consumers updated (`Signin/Signup/ConfirmSignup/ForgotPassword/PasswordReset`) to switch on `result.success` then read `result.error` (typed `AuthErrorCode`) + `result.message`. Existing substring-matching fallback in `handleErrorMessage` is preserved — categorical Cognito error mapping is upstream backend work, not P3 scope. Resend hooks (`useResendSignupCode`, `useResendForgotPasswordCode`) intentionally left alone — not in P3-10's explicit list and consumers still rely on throw semantics. | `packages/auth/src/hooks/**`, `packages/auth/src/lib/parseAuthResponse.ts` (new), `apps/auth/src/features/{Signin,Signup,ConfirmSignup,ForgotPassword,PasswordReset}/components/*.tsx` | Medium |
| **P3-11** ✅ | Keep `token` + `session` routes as documented exceptions — add JSDoc comment linking back to §5.2 of this plan                                                                                               | `apps/auth/src/app/api/auth/{token,session}/route.ts`, `apps/{app,web,blog}/src/app/api/auth/get-session/route.ts` | Tiny   |

**Out of scope (explicitly deferred)**:

- `refresh_unavailable` / `refresh_revoked` codes are emitted by the **Phase 7** refresh routes (`apps/auth` IdP + client BFFs) when backend rotation fails or Cognito marks refresh revoked.
- `not_authenticated` code exists but is emitted only by `session` query routes (which keep their `{ authenticated: false }` shape); middleware usage lands in **P10**.
- Helper placement (`packages/type-utils` vs new `packages/auth-bff`) — if P8 is close, consider landing helpers directly in the new BFF package. Decision made in P3-2 itself.

---

### 5.4 Verification

1. `grep -r "NextResponse\.json" apps/**/src/app/api/auth apps/auth/src/app/api/auth` — every error branch returns the new shape (or is one of the 3 documented exceptions).
2. `grep -r "\"internal_server_error\"" apps` → 0 results.
3. `grep -r "error:.*}" apps/auth/src/app/api/auth apps/*/src/app/api/auth | grep -v message` — every error response has `message` (except `token` OAuth2 shape).
4. TypeScript: all auth hooks and Processing components compile against `AuthResult<T>` without casts.
5. Manual flow: trigger `token_exchange_failed` by tampering auth code → client `processing/page.tsx` renders error UI, does not silently redirect.
6. Unit check: `AuthErrorCode` enum exhaustively covered by a `switch` in each Processing component (TS compile-time check via `never`).

---

### 5.5 Out-of-scope for P3 (confirmed)

- Refresh token flow → ✅ **Phase 7** (May 2026).
- Cookie shape changes → P6.
- Middleware / route-guard wiring → P10.
- Error code telemetry / logging standardization → ops backlog (not gated on auth phases); baseline logging via **`DEBUG_AUTH`** + **`AuthErrorCode`** from **P3 ✅**.

---

## 6. Phase 4: Config & URL Architecture

> **Status**: ✅ DONE (May 4, 2026). All P4 tasks landed.

**Goal**: Kill hardcoded URLs and the broken / overlapping URL-construction utilities. New `packages/config` becomes the single source of cross-app, cross-TLD URL truth.

**Design seeds (locked)**:

- A10 + M3 (Apr 22, 2026). See §2 "Cross-TLD Logic for Signin Routes".
- Auth IdP is `.com`-only and centralized — no hostname-derivation needed for auth URLs.
- Client apps live on every TLD; URLs are derived from request hostname using `tldts`.

### What landed

**P4-1** — Scaffolded `packages/config` (`@cosmediate/config`, workspace pkg, mirrors `@cosmediate/type-utils` setup):

- `src/tlds.ts` — `COSMEDIATE_TLDS` (`com|nl|be|de|fr|gr|it`), `CLIENT_APPS`, `APP_PORTS` (web 3000 / blog 3001 / auth 3002 / app 3003), `APP_SUBDOMAINS`, `generateAllowedOrigins()`.
- `src/auth-urls.ts` — IdP path overrides: **`AUTH_APP_*_ENDPOINT`** only (defaults in code if unset).
- `src/client-urls.ts` — `getOrigin(request)`, `getRequestHostname(request)`, `getClientAppUrl(app, request)` (TLD-derived sibling-app URL), `getAuthCallbackUrl(request)`. Plus a `getRedirectUri = getAuthCallbackUrl` alias for the migration window.
- `src/index.ts` — barrel.

**P4-2** — Wired `@cosmediate/config` as a workspace dependency in `apps/{app,web,blog,auth}/package.json`.

**P4-3** — Migrated **per-app `lib/server/config.ts`** (4 files) to thin `@deprecated` wrappers that re-export `generateAllowedOrigins()` (4× ~80-line static lists collapsed to 1 generator). Files stay until P8-6/8-7 deletion window.

**P4-4** — Migrated **per-app `lib/routing/utils.ts`** (3 files: app/web/blog) to `@deprecated` re-exports of `@cosmediate/config`'s `getOrigin` / `getRedirectUri`.

**P4-5** — Migrated **client signin routes** (`apps/{app,web,blog}/src/app/auth/signin/route.ts`) to use `getAuthAuthorizeUrl()`, `getAuthClearSessionUrl()`, `getAuthCallbackUrl()`, `getOrigin()`. Replaced `NextResponse.json` misconfig errors with `authError("server_misconfig")` (P3 contract).

**P4-6** — Migrated **client BFF routes** (3× `exchange-code`, 3× `logout`, app `set-password`, app `update-password`) to use `getAuthCallbackUrl()`, `getAuthTokenUrl()`, `getAuthLogoutUrl()`, `getAuthProviderUrl()`, `getAuthSigninUrl()`. No inline IdP path `process.env` reads under `apps/`.

**P4-7** — Migrated `apps/auth/src/app/oauth/authorize/route.ts` to `getAuthSelfUrl()`.

**P4-8** — Cleanup sweep:

- `apps/app/src/app/api/auth/exchange-code/route.ts` — removed dead-commented `getDefaultRouteForRole` / `redirectTo` blocks (lines 101-110 of pre-P4 file). Removed unused import.
- `apps/app/src/app/api/auth/{set,update}-password/route.ts` — removed dead-commented "// Clear cookies" blocks.

**P4-9** — Pre-existing P3 typecheck regressions fixed in passing (3× `Processing/index.tsx` had a `const code` shadowing the `code` function-param → renamed inner const to `errCode` for app/web/blog). Auth app `.next/types/validator.ts` was stale from pre-P2-step-8 routes — cleared.

**P4-10** — Verified all 4 apps `pnpm typecheck` green; no stray `process.env.AUTH_PROVIDER_URL` / `AUTH_REDIRECT_PATH` reads under `apps/` outside intended use.

### Deferred (NOT P4 scope)

- **`packages/auth/src/lib/utils.ts`** (`getLogoutRedirectUri`, `constructRedirectUri`, `getRootDomain`, `getBlogAppUrl`) → **removed in P9 ✅** (May 2026).
- **Deletion** of per-app `apps/*/src/lib/server/config.ts` and `apps/*/src/lib/routing/utils.ts` → **P8-6/8-7**. They're now thin re-exports; deleting them requires migrating remaining `@app/lib/server/utils` callers (CORS helpers `originHandler` / `optionsHandler` / `requestHeader`) which is broader than P4.
- **Env vars** — **`AUTH_APP_*_ENDPOINT`** only (`auth-urls.ts`); no `AUTH_APP_*_PATH`.
- **`AUTH_PROVIDER_URL` / `AUTH_SELF_URL` env contract enforcement at startup** — `getAuth*Url()` throws on missing env at first call; a true boot-time check belongs in P10 (proxy/middleware) when route-protection lands.

---

## 7. Phase 5: Data Layer Refactor

> **Status**: ✅ DONE (May 4, 2026). A5 drift fully closed.

**Goal**: One source of truth for token/session shapes. No more `string` vs `number` drift.

### Canonical decision

`expiresAt` and `refreshTokenExpiresAt` are **unix-seconds (UTC) numbers** at every layer (backend wire format → IdP runtime → cookies → DDB → middleware). Aligns with Cognito `ExpiresIn` semantics and the existing numeric comparison in `apps/app/src/proxy.ts`. ISO-8601 strings only where a field is genuinely human-facing (`createdAt`, `updatedAt`, the dead-write `expiresAtISO` mirror in DDB).

### What landed

**P5-1** — Locked the canonical token shape: `expiresAt: number`, `refreshTokenExpiresAt: number`. The pre-Phase-5 `AuthTokens` type in `@cosmediate/type-utils` lied (`string`); runtime, DDB, middleware, and Cognito all spoke `number`. Type now matches reality.

**P5-2** — Rewrote `packages/type-utils/src/auth.ts`:

- `AuthTokens` is the canonical full shape: `{ accessToken, refreshToken, idToken, expiresAt: number, refreshTokenExpiresAt: number }`. Used inside the auth IdP and on the backend wire.
- New `SessionTokens = Pick<AuthTokens, "accessToken" | "expiresAt" | "refreshTokenExpiresAt">` — the slim, cookie-safe subset. Refresh + id tokens intentionally excluded; refresh tokens MUST stay backend-only.
- `Session.tokens` is now `SessionTokens` (was full `AuthTokens` — wrong; the cookie payload was always slim).

**P5-3** — Removed the duplicate `AuthTokens` in `packages/api/src/types/auth.types.ts`; re-exports the canonical type from `type-utils`. `SignInResponse` now `extends AuthTokens` and adds `sessionId` directly (was awkwardly modelled as a token field on the duplicate type).

**P5-4** — Updated `apps/auth/src/lib/oauth-context-store.ts`:

- `SessionData.tokens: SessionTokens` (was an inline 3-field interface — now the canonical slim type).
- `StoredOAuthContext.expiresAt: number` (was lyingly typed `string`; DDB always stored a number, runtime always read a number).
- Documented `expiresAtISO` as a write-only human-inspection mirror.

**P5-5** — Verified all 4 apps `pnpm typecheck` green.

**P5-6** — Grepped for `expiresAt.toString()`, `String(...expiresAt)`, etc. — zero matches. Confirms no consumer was relying on the lying `string` type to do string ops.

### Mappers — none needed

Pre-phase, the design seed contemplated DDB ↔ runtime mappers. Audit showed they're unnecessary: every DDB attribute on `OAuthContext` is already written and read with the correct runtime shape. The type drift was purely declarative. If Phase 6 / 7 introduces a richer DDB session-record schema with denormalised computed fields, mappers can land then.

### Deferred / not in P5

- `TODO(phase-5/A5)` markers from P6-10 — superseded by Phase **5** completion and P6 cookie work; sweep only if any stale markers remain in repo.
- Broader DDB session-record schema — only the `sessionData` blob on `OAuthContext` exists today; if a top-level `Session` entity gets added in P6 (Cookie & Session Redesign) its types live in this file from the start.

---

## 8. Phase 6: Cookie & Session Redesign

> **Status**: ✅ **DONE** (May 2026). Prereqs P3 / P4 / P5 were ✅ before execution.
>
> **Delivered**: `@cosmediate/config` cookie constants + parsers (`auth-cookies.ts`, `client-session-read.ts`), scalar **`cos_*` / `cos_idp_*`** everywhere in scope, OAuth token boundary snake_case + `redirect_to`, exchange/get-session/logout tri-apps, IdP signin/authorize/token/session/logout/clear-session/password routes, **`LegacySessionData`** mapper for in-flight DDB contexts, app **`proxy`** `cos_token_exp` gate (+ legacy fallback), Processing **`redirectTo`**, dashboard password BFF without **`session_user`** cookie (API-resolved email).
>
> **Carried forward** (was listed as P6-6 / P6-7): **`visibilitychange`** (+ optional **`NEXT_PUBLIC_AUTH_HEARTBEAT`**) on **`useSilentAuth`**; **axios 401** via **`ensureApiUnauthorizedInterceptor()`** from **`AuthProvider`** — ✅ **landed Phase 7** (May 2026), §9.

**Goal**: Minimal cookies, fresh user data via API, cross-app session invalidation wired up. No staleness, no cookie JSON blobs, no `JSON.parse` in middleware.
**Scope**: Cookie shape (client + IdP), exchange / session / token routes, `useSilentAuth`, AuthProvider, **`apps/app` proxy** scalar expiry gate (+ legacy fallback). Visibility / axios **401** partner work shipped **§9 Phase 7** alongside refresh BFF + proxy.
**Flow rule**: Refresh wiring belongs to **P7** ✅ — P6 sets up the shape; **P7** completed the refresh path. Logout-related work belongs to **P9** ✅ (May 2026).

### Active design decisions (from §1)

- **Decision 1 (locked May 2026)** — **six scalar cookies per surface** (client apps **and** IdP — same breakdown, client prefix `cos_*`, IdP prefix `cos_idp_*`):
  - **Token/session quartet**: `cos_session_id`, `cos_access_token`, `cos_token_exp`, `cos_refresh_exp` (client) / `cos_idp_session_id`, `cos_idp_access_token`, `cos_idp_token_exp`, `cos_idp_refresh_exp` (IdP).
  - **Identity pair** (avoids an extra IdP round-trip on every `get-session`; values are opaque IDs / enum, not profile blobs): `cos_user_id`, `cos_user_role` (client) / `cos_idp_user_id`, `cos_idp_user_role` (IdP).
  - Deletes the `session_tokens` JSON blob and the legacy names `session_id`, `session_user_id`, `session_user_role`. Same idea on IdP for `idp_session_*` after rename + blob split (see P6-1).
- **Decision 7** — Layer 2 visibility + Layer 3 axios 401: ✅ **Phase 7** (May 2026); cookie/read surface was completed in P6.
- **Apr 29 review** — token endpoint **drops `user`** from response (only `userId` + `userRole`); `/api/auth/user` is **dropped entirely** (`useSilentAuth` already does role-dispatch backend calls).
- **Apr 29 review** — `useSilentAuth` retry config stays at MAX_RETRIES=3, RETRY_DELAY=500ms (already shipped in P2 cleanup; keep). Retry only on network errors, never on `authenticated: false` or HTTP errors.

### Tasks

> Detailed task list. Each task has a one-line goal so we can pick them off one at a time. Sub-tasks documented when the active phase reaches them.

#### P6-1 — Auth IdP cookies: rename + split

- `apps/auth/src/app/api/auth/signin/route.ts`, `apps/auth/src/app/oauth/authorize/route.ts`
- Renames: `idp_session_id` → `cos_idp_session_id`, `idp_session_user_id` → `cos_idp_user_id`, `idp_session_user_role` → `cos_idp_user_role`.
- Split the JSON-blob `idp_session_tokens` into three scalars: `cos_idp_access_token`, `cos_idp_token_exp`, `cos_idp_refresh_exp`.
- **Net IdP cookie set after P6-1**: six scalars (`cos_idp_session_id`, `cos_idp_user_id`, `cos_idp_user_role`, `cos_idp_access_token`, `cos_idp_token_exp`, `cos_idp_refresh_exp`) — mirrors client **4+2** (Decision 1).
- Drop `idp_session_user` cookie (does not exist post-P1, just confirm).
- `auth_context_id` is already renamed to `cos_oauth_code` (P2 N1, Apr 25, 2026 — confirmed in `AGENTS.md` §13.4).

#### P6-2 — Token endpoint response shape

- `apps/auth/src/app/api/auth/token/route.ts`
- Today returns: `{ sessionId, userId, userRole, tokens, returnTo }` where `tokens = { accessToken, refreshTokenExpiresAt, expiresAt }`.
- Target: `{ session_id, access_token, token_exp, refresh_exp, user_id, user_role, return_to }` — **snake_case at the OAuth boundary** (per N6). **Locked May 2026** for implementation (exchange-code + IdP token route stay in sync).
- **No `user` field** (decision Apr 29). Client hydrates user via `useSilentAuth` role-dispatch.
- `oauth-context-store.ts` `SessionData` / stored blob aligns with whatever scalar fields the token route persists (no nested `tokens` wrapper if the wire shape is flat snake_case — resolve in impl so DDB `sessionData` and JSON response stay 1:1).

#### P6-3 — Client BFF exchange-code: set new cookies + return new shape

- `apps/{app,web,blog}/src/app/api/auth/exchange-code/route.ts`
- Read new token-endpoint response shape (P6-2).
- Set **six** client cookies per Decision 1: `cos_session_id`, `cos_user_id`, `cos_user_role`, `cos_access_token`, `cos_token_exp`, `cos_refresh_exp` (all `httpOnly` / `secure` in prod / `sameSite: lax` / `path: /`).
- Drop legacy cookies: `session_tokens`, `session_id`, `session_user_id`, `session_user_role`.
- Response JSON shape: `{ success, redirect_to }` (camelCase JSON on the client BFF boundary is fine; snake_case stays on the IdP OAuth token route only unless we standardise later — **do not mix shapes inside one hop**).
- Wire `redirect_to` correctly per Decision 6 — ends the `redirectTo: "/"` hardcode.

#### P6-4 — Client BFF get-session: read new cookies

- `apps/{app,web,blog}/src/app/api/auth/get-session/route.ts`
- Read **`cos_session_id`**, **`cos_user_id`**, **`cos_user_role`**, **`cos_access_token`**, **`cos_token_exp`** (**`cos_refresh_exp`** required for proxy refresh gate in P7 ✅).
- No `JSON.parse` on any cookie value — all scalars (numbers parsed with `Number(...)` / `parseInt` as needed).
- If `cos_token_exp` absent or `< now` → `{ authenticated: false }`.
- Else → `{ authenticated: true, session: { sessionId, userId, userRole, tokens: { accessToken, expiresAt } } }` (shape unchanged for `useSilentAuth`; `expiresAt` is unix-seconds **number**, canonical since **Phase 5 / A5**).
- **Resolved (May 2026)**: **4+2 cookies** — identity pair stays on the client domain so `get-session` does **not** require an IdP round-trip on every load. Optional IdP `/api/auth/session` call remains available for reconciliation / edge cases only (see P6-5).

#### P6-5 — Auth IdP `/api/auth/session` (GET)

- `apps/auth/src/app/api/auth/session/route.ts`
- Read `cos_idp_*` cookies (post P6-1).
- Return `{ authenticated, session: { sessionId, userId, userRole, accessToken, tokenExp, refreshExp } }`.
- This is what client BFFs call when they need to re-validate a session.

#### P6-6 — `useSilentAuth`: visibility listener ✅ *implemented Phase 7*

- `packages/auth/src/hooks/useSilentAuth.ts`
- Today: 3-retry, 500ms, network-only retry (M7 done). Role-dispatch user fetch (`getAdminApi` / `getClinicManagerApi` / `getSpecialistApi` / `getUserApi`) keeps working as-is.
- ✅ `visibilitychange` listener — on tab focus, re-call the session-fetch path (cancel-safe **`cancelled`** ref). May 2026.
- ✅ Optional 5‑min idle heartbeat behind `process.env.NEXT_PUBLIC_AUTH_HEARTBEAT === "true"` (off by default). May 2026.

#### P6-7 — Axios 401 interceptor (Decision 7, Layer 3) ✅ *implemented Phase 7*

- **`packages/auth/src/lib/api-unauthorized-interceptor.ts`** + **`AuthProvider`** (**✅ May 2026**) — **`ensureApiUnauthorizedInterceptor()`** registers on shared **`api`** from **`@cosmediate/api`** without importing **`@cosmediate/auth`** into **`axiosInstance`** (avoids package cycle).
- Response path: `error.response?.status === 401` → **`handleUnauthorizedAccess`** (Bearer from request config).
- Avoid loops: skip when **`window.location.pathname`** starts with **`/auth/`**.

#### P6-8 — proxy.ts: read new cookie shape

- **Cross-app shortcuts (`/home`, `/dashboard`, `/blog`)**: centralized in **`@cosmediate/config`** → `getCrossAppShortcutTargetUrl(request, { pathname, search })` (added May 2026). All four `apps/*/src/proxy.ts` call it first so redirects stay aligned with **`getClientAppUrl`** (TLD whitelist, dev detection via `tldts`, `APP_PORTS` on localhost, **`x-forwarded-host`** aware). **Auth IdP** runs the same shortcuts — URLs resolve correctly from **`auth.cosmediate.*`** too.
- **Session expiry gate** (`session_tokens` → later **`cos_token_exp`**): **`apps/app`** plus **`apps/web`** / **`apps/blog`** (**refresh fetch** ✅ P7); **`apps/auth`** shortcuts then `next()` only.
- Read **`cos_token_exp`** (number, no `JSON.parse`; legacy **`session_tokens`** JSON fallback for one deploy per notes below).
- If absent → redirect to `/auth/signin?return_to=…`.
- If `cos_token_exp > now` → `next()`.
- If `cos_token_exp < now` → attempt **`POST /api/auth/refresh`** when **`cos_refresh_exp > now`** (**✅ P7** — **`apps/app`**, **`apps/web`**, **`apps/blog`**); on failure **`apps/app`** → signin + clear **`cos_*`**; **`apps/web`** / **`apps/blog`** → clear **`cos_*`** + **`next()`** (May 2026).
- Move the existing `session_tokens` legacy branch to a one-version backwards-compat fallback, then delete after the deploy that shifts cookies.

#### P6-9 — AuthProvider logout shape ✅ _(closed Phase 9, May 2026)_

- **`handleLogout`** posts **`{ access_token }`** and always navigates to **`getAuthClearSessionUrlClient()`**. No client **`redirectUri`** / **`logoutUrl`** contract.

#### P6-10 — Types + cookie constants stay aligned with runtime

- **`packages/type-utils/src/auth.ts`** — Phase **5** already closed **A5**: `AuthTokens.expiresAt` / `refreshTokenExpiresAt` are **`number`** (unix-seconds); **`SessionTokens`** is the slim cookie-safe subset. **No duplicate type-unification work here.**
- **P6 scope**: when introducing **`cos_*` / `cos_idp_*`** names, add a **single shared constants module** (e.g. under `@cosmediate/config` or `@cosmediate/type-utils`) for cookie **names** so routes / logout / clear-session / proxy don’t string-drift.
- Optionally narrow **`Session`** / BFF JSON types if get-session payload fields rename — keep **one** canonical shape documented in AGENTS.md §13 once P6 lands.

### Verification

1. Fresh login on `apps/app` → **six** client scalars (`cos_*` per Decision 1), total size ≪ old `session_tokens` blob.
2. `apps/web` and `apps/blog` see the same `cos_*` cookies (Cookie domain is the parent root).
3. `useSilentAuth` returns full session including `user` (still hydrated client-side, not from cookie).
4. Switch tabs after a `GlobalSignOutCommand` on another tab → **`visibilitychange`** refetch (**✅ P7-prep**, May 2026).
5. In-flight axios after revocation → **`ensureApiUnauthorizedInterceptor`** (**✅ P7-prep**, May 2026).
6. proxy.ts — stale browser with `session_tokens` legacy cookie still loads (one deploy of fallback) then naturally migrates after re-login.

---

## 9. Phase 7: Refresh Tokens

> **Status**: ✅ **DONE** (May 2026). **Prereqs**: P6 ✅ (`cos_token_exp` + `cos_refresh_exp` on client and IdP after exchange).

**Goal**: Access tokens refresh silently and **invisibly** as long as the refresh token is valid. Users don't get randomly kicked out. No OAuth round-trip for refresh.
**Scope**: ✅ Auth IdP **`POST /api/auth/refresh`**, client BFF refresh per app, **`proxy.ts`** server-side refresh merge on **`apps/app`** / **`apps/web`** / **`apps/blog`**, plus Decision 7 (`visibilitychange`, optional heartbeat, axios **401** interceptor).

### Execution order (plan)

Shipped May 2026 (critical path **P7-prep → P7-1 → P7-2 → P7-3**; verify **P7-4** / **P7-5** against backend):

1. ✅ **P7-prep** — **`useSilentAuth`**: `visibilitychange` → refetch `/api/auth/get-session`; optional **`NEXT_PUBLIC_AUTH_HEARTBEAT`**. **`AuthProvider`**: **`ensureApiUnauthorizedInterceptor()`** on **`401`** (`packages/auth`; **`packages/api`** unchanged — no cycle).
2. ✅ **P7-1** — Auth IdP **`POST /api/auth/refresh`** + **`apps/auth/src/lib/refresh-tokens.ts`** → backend **`POST /auth/tokens/refresh`** (404 → **`/auth/refresh`**); success → Set-Cookie **`cos_idp_*`** where applicable.
3. ✅ **P7-2** — Client BFF **`POST /api/auth/refresh`** in **`apps/app`**, **`apps/web`**, **`apps/blog`**: proxy to IdP; success → Set-Cookie **`cos_access_token`**, **`cos_token_exp`**, **`cos_refresh_exp`**.
4. ✅ **P7-3** — **`proxy.ts`** (three apps): **`cos_token_exp < now`** ∧ **`cos_refresh_exp > now`** → same-origin **`fetch`** **`POST /api/auth/refresh`** + merge **`Set-Cookie`**. **`apps/app`**: refresh failure → signin redirect + clear; **`apps/web`** / **`apps/blog`**: refresh failure → clear + **`next()`**. Skip **`/auth/processing`**, **`/auth/signin`**, **`/api/auth/refresh`**, **`/api/auth/exchange-code`**, **`/api/auth/logout`**, static/API passthrough per loop rules below.
5. **P7-4** — Verify **`cos_refresh_exp`** populated on every successful exchange + refresh (adjust parsing if backend field names differ).
6. **P7-5** — IdP refresh failure taxonomy + DynamoDB revoke behaviour per tasks below.

Steps **2–4** were the critical path; **1** shipped alongside **2–4**.

### Backend Context

Backend API: `POST /auth/tokens/refresh` (already exists)

- Input: `sessionId` (not refresh token directly — backend resolves from DynamoDB session record).
- Internally calls Cognito `RefreshTokenCommand`.
- Returns: `{ access_token, id_token, expiresAt, refreshTokenExpiresAt }`.
- Failure: `{ error: "invalid_session" | "refresh_revoked" | "backend_error" }` with appropriate HTTP status.

### Architecture (decided Apr 29, 2026 — Q1 = Option B, Q2 = Option B)

```
proxy.ts (server-side fetch — invisible to user):
  if (cos_token_exp < now && cos_refresh_exp > now) {
    const r = await fetch(`${origin}/api/auth/refresh`, {
      method: "POST",
      headers: { cookie: request.headers.get("cookie") ?? "" },
    });
    if (r.ok) {
      const next = NextResponse.next();
      // forward Set-Cookie from BFF to the user agent
      r.headers.getSetCookie().forEach((c) => next.headers.append("set-cookie", c));
      return next;
    }
    // refresh fetch failed -> apps/app: signin redirect + cookie deletes;
    // apps/web + apps/blog (May 2026): clear cos_* + continue (no forced signin)
    return redirectToSigninAndClearCos(request, returnTo);
  }
```

```
Client BFF /api/auth/refresh (per app, body extracted to @cosmediate/auth-bff in P8):
  reads cos_session_id (and forwarded cos_idp_session_id if same root domain)
  POST {AUTH_PROVIDER_URL}/api/auth/refresh with sessionId
  on 200 -> Set-Cookie new cos_access_token, cos_token_exp, cos_refresh_exp, return { success: true }
  on err -> return { success: false, error } (no Set-Cookie)
```

```
Auth IdP /api/auth/refresh:
  reads cos_idp_session_id (or accepts sessionId in body for cross-domain BFF callers)
  validates session exists in DynamoDB, not revoked, not expired
  POST backend /auth/tokens/refresh with sessionId
  on 200 -> Set-Cookie new cos_idp_access_token + cos_idp_token_exp + cos_idp_refresh_exp,
            return { access_token, token_exp, refresh_exp } JSON
  on err -> 401/500 with { error }
```

### Loop-prevention rules (recap from §1 Decision 2)

1. proxy.ts NEVER retries the refresh fetch — single attempt; **`apps/app`**: failure → signin redirect + cookie deletes; **`apps/web`** / **`apps/blog`**: failure → clear **`cos_*`** + continue (May 2026).
2. proxy.ts NEVER refreshes for `/auth/processing`, `/auth/signin`, or `/api/auth/refresh` itself — those paths must always pass through.
3. The auth IdP refresh route NEVER falls back to issuing a fresh OAuth code on failure — it returns the error and lets the client BFF (and then proxy) make the redirect decision.
4. Refresh failure on client BFF returns success=false; proxy treats this exactly like an absent `cos_refresh_exp` and clears all `cos_*`.

### Tasks

#### P7-1 — Auth IdP `POST /api/auth/refresh` ✅

- ✅ `apps/auth/src/app/api/auth/refresh/route.ts`.
- ✅ `apps/auth/src/lib/refresh-tokens.ts` — backend **`/auth/tokens/refresh`** with **`/auth/refresh`** fallback.
- Returns updated `cos_idp_*` cookies on success.

#### P7-2 — Client BFF `POST /api/auth/refresh` (per app, then extracted) ✅

- ✅ `apps/{app,web,blog}/src/app/api/auth/refresh/route.ts`.
- Body lives in `@cosmediate/auth-bff` once **P8** lands; until then duplication accepted (3-app cost).
- Calls auth IdP `/api/auth/refresh` with the sessionId.
- On success: Set-Cookie the 3 token cookies (`cos_access_token`, `cos_token_exp`, `cos_refresh_exp`) and return `{ success: true }`.
- On error: `{ success: false, error }` — no cookies set.

#### P7-3 — proxy.ts: server-side refresh fetch ✅

- ✅ `apps/{app,web,blog}/src/proxy.ts`.
- Decision tree per Architecture block + **`apps/web`**/**`apps/blog`** failure semantics above.
- Skip-list: `/auth/processing`, `/auth/signin`, `/api/auth/refresh`, `/api/auth/exchange-code`, `/api/auth/logout` always `next()`.
- Helper extracted to a shared `proxyAuth.ts` once **P8** lands.

#### P7-4 — Refresh-token expiry cookie population

- `cos_refresh_exp` must be set by P6-3 (exchange-code) so P7 has data to read on first refresh attempt.
- Auth IdP must include `refresh_exp` in token-endpoint response (P6-2).

#### P7-5 — Failure handling on auth IdP refresh

- 401 from backend `/auth/tokens/refresh` — mark IdP session revoked in DynamoDB, return 401 with `error: "refresh_revoked"`.
- Network/5xx from backend — return 502 with `error: "refresh_unavailable"` — client BFF surfaces the error; proxy treats as failure (**`apps/app`** → signin redirect; **`apps/web`** / **`apps/blog`** → clear + **`next()`**, May 2026).
- Never silently swallow.

### Verification

1. Set short access-token TTL (≤ 60s) → navigate after expiry → page loads normally with new `cos_access_token` cookie. No flash, no signin redirect.
2. Network panel during refresh: exactly one POST to `/api/auth/refresh` (server-internal, not visible in DevTools) — confirmed via auth IdP access logs.
3. Force backend `/auth/tokens/refresh` to 401 → **`apps/app`**: next navigation lands on `/auth/signin` with **`cos_*`** cleared; **`apps/web`** / **`apps/blog`**: cookies cleared, page may continue signed-out UX without forced redirect.
4. Take down auth IdP → **`apps/app`** past expiry tends toward `/auth/signin`; **`apps/web`** / **`apps/blog`** clear stale **`cos_*`** when refresh fails.
5. Set `cos_refresh_exp < now` directly in browser → next navigation goes straight to `/auth/signin`, no refresh attempt logged.

---

## 10. Phase 8: Shared Auth-BFF Package

> **Status**: ✅ **DONE** (May 2026). **`@cosmediate/auth-bff`** ships client route factories + **`createCorsHelpers`**. **`apps/auth`** IdP routes unchanged. Optional follow-ups: thin **`createSigninRedirectHandler`**, rename **`exchange-code`→`exchange`**.

**Goal**: One source of truth for shared client-BFF auth logic. Adding a new app = import + configure. Resolves audit duplication findings D1, D2, D3, D4, D5, D6, D7.
**Scope**: Extract all 6 client-BFF route bodies (`exchange-code`, `get-session`, `logout`, `refresh`, `set-password`, `update-password`) plus the cross-app router (D4) and shared utils into a new package.
**Prereqs**: P6 ✅ (cookies stable) and **P7 ✅** (refresh route exists per app) — extraction targets the **finished** shape.

### Why now (not earlier)

Q2 Apr 29, 2026 = **Option B**: extract all 6 routes in this phase rather than dribble.

- 5 of the 6 routes are **already being touched** in P6/P7 (cookie reads change, response shape changes, refresh route is brand new). Doing the extraction in the same sweep is half the work of doing it twice.
- Audit items D1 (`exchange-code` triplicated), D2 (`get-session` triplicated), D3 (`logout` triplicated), D5 (`set-password` / `update-password` semi-duplicated against auth IdP), D7 (`lib/server/{config,utils}.ts` and `lib/routing/utils.ts` triplicated) all collapse here.
- D6 (`getLogoutRedirectUri` etc. in `packages/auth/src/lib/utils.ts`) collapsed in **P9 ✅** (May 2026) — file deleted.

### New Package: `packages/auth-bff/`

```
packages/auth-bff/
├── src/
│   ├── routes/
│   │   ├── exchange.ts          — createExchangeHandler(config)
│   │   ├── session.ts           — createSessionHandler(config)
│   │   ├── refresh.ts           — createRefreshHandler(config)
│   │   ├── logout.ts            — createLogoutRouteHandlers ✅ (P8 scaffold · P9 unified body, May 2026)
│   │   ├── set-password.ts      — createSetPasswordHandler(config) (broken — see P6 status)
│   │   ├── update-password.ts   — createUpdatePasswordHandler(config)
│   │   └── signin-redirect.ts   — createSigninRedirectHandler(config) (used by /auth/signin route handler)
│   ├── middleware/
│   │   ├── auth-guard.ts        — createAuthGuard(config) (the proxy.ts cookie-check core)
│   │   ├── refresh-fetch.ts     — createProxyRefresh(config) (server-side fetch helper from P7-3)
│   │   └── cross-app-router.ts  — createCrossAppRouter(config) (D4: /home /dashboard /blog redirects)
│   ├── utils/
│   │   ├── cors.ts              — originHandler, requestHeader, optionsHandler
│   │   └── cookies.ts           — setSessionCookies, clearSessionCookies, readSessionCookies
│   └── types/
│       └── index.ts             — AuthBffConfig, SessionCookies, RefreshResult, etc.
├── package.json
└── tsconfig.json
```

> URL/origin utils (`getOrigin`, `getRedirectUri`, `getAuthProviderUrl`) and `COSMEDIATE_TLDS` live in **`packages/config`** — owned by **P4**. `auth-bff` consumes from there. Don't duplicate.

Each route is a factory:

```typescript
// packages/auth-bff/src/routes/exchange.ts
export function createExchangeHandler(config: AuthBffConfig) {
  return async function POST(request: NextRequest) {
    // shared logic, uses config for env-specific values
  };
}

// apps/app/src/app/api/auth/exchange-code/route.ts (AFTER — thin wrapper)
import { createExchangeHandler } from "@cosmediate/auth-bff";
export const POST = createExchangeHandler({
  clientId: process.env.AUTH_CLIENT_ID! /* ... */,
});
```

### Tasks

#### P8-1 — Create `packages/auth-bff` scaffolding

- `package.json` exports map, `tsconfig.json` extending `@cosmediate/typescript-config/react-library.json`, `eslint.config.js`, `pnpm-workspace` registration.
- Add to all 4 apps' `package.json` dependencies.

#### P8-2 — Extract shared utils (cors, cookies)

- Move identical (or near-identical) bodies of `apps/{app,web,blog}/src/lib/server/utils.ts` (CORS helpers) into `packages/auth-bff/src/utils/cors.ts`.
- Move cookie set/clear helpers (currently inline in routes) into `packages/auth-bff/src/utils/cookies.ts`. Use `cos_*` names from P6.
- Delete the per-app `lib/server/utils.ts` (D7).

#### P8-3 — Extract route handlers as factory functions (the big sweep)

- 6 factories: `createExchangeHandler`, `createSessionHandler`, `createRefreshHandler`, `createLogoutHandler`, `createSetPasswordHandler`, `createUpdatePasswordHandler`.
- Each takes `AuthBffConfig` (`clientId`, `clientSecret`, `authProviderUrl`, `authTokenPath`, `cookieDomain`, etc.).
- Logout factory body ✅ finished in **P9** (May 2026): **`access_token`** + IdP **`{}`** POST + always **`{ success: true }`** after cookie cleanup.

#### P8-4 — Extract middleware composables

- `createAuthGuard` — the `cos_token_exp`/`cos_refresh_exp` decision tree from P6-8.
- `createProxyRefresh` — the server-side fetch helper from P7-3.
- `createCrossAppRouter` — D4: the `/home` / `/dashboard` / `/blog` cross-domain redirect logic currently triplicated in `proxy.ts`.

#### P8-5 — Update all 3 client apps to use the package (thin wrappers)

- Each app's `proxy.ts` becomes ~20 lines: compose `createCrossAppRouter`, `createAuthGuard`, `createProxyRefresh`.
- Each route under `apps/*/src/app/api/auth/*/route.ts` becomes 2-3 lines (import factory + export).
- Rename `exchange-code` → `exchange` and `get-session` → `session` as part of this move (deferred from §2 Key Observation #4).

#### P8-6 — Delete duplicated `lib/server/config.ts` from all 3 client apps

- D7. Replaced by config provided to factory + `packages/config` (from P4).

#### P8-7 — Delete duplicated `lib/routing/utils.ts` from all 3 client apps

- D7. `getOrigin` / `getRedirectUri` come from `packages/config` per P4.

#### P8-8 — Delete `apps/auth/src/lib/server/config.ts` if redundant

- Auth IdP has its own config; verify whether it overlaps with the new `packages/config` enough to consolidate. Decide at start of P8.

### Verification

1. All login / refresh / logout / session flows work identically pre/post-extraction.
2. Auth-related LOC per client app reduced by ≥70%.
3. Bug fix = 1 file change in `packages/auth-bff`, not 3.
4. New app onboarding = `pnpm add @cosmediate/auth-bff` + 6 wrapper files + env vars. **Verified P12 ✅** May 2026 (see **`AGENTS.md`** §3 / §13).

---

## 11. Phase 9: Logout — Unified

> **Status**: ✅ **DONE** (May 2026). Canonical behaviour: **`AGENTS.md`** §13.5–§13.7 + **`packages/config/auth-urls-client.ts`**.

**Goal**: Logout that actually works. Standard flow, no workarounds. All logout-touching code lives in one phase — nothing logout-related is touched before this.
**Scope**: Complete rewrite of logout across all layers (frontend handler → client BFF → auth IdP BFF → backend) + dedup audit findings D3 (logout body triplicated) and D6 (`getLogoutRedirectUri`/`constructRedirectUri` legacy utils).
**Prereqs**: P4 (`packages/config` with `getAuthSigninUrl` / `getAuthProviderUrl`), P6 (`cos_*` cookies), P8 (auth-bff package skeleton; logout factory body lands here).

### The Full Logout Chain (Simplified — No Cognito Hosted UI)

Per Decision 8: email/password signin uses direct Cognito SDK, NOT the hosted UI.
So Cognito has NO browser cookies to clear. `GlobalSignOutCommand` is sufficient.

```
STEP 1: User clicks "Logout" in UI
        ↓
STEP 2: AuthProvider.handleLogout()
        → POST /api/auth/logout (client BFF)
        → Body: { access_token }
        ↓
STEP 3: Client BFF /api/auth/logout
        → POST to auth IdP /api/auth/logout
        → Headers: Authorization: Bearer <access_token>
        → Body: {}  (IdP defaults redirect_uri for Lambda to ${AUTH_SELF_URL}/signin when omitted)
        ↓
STEP 4: Auth IdP /api/auth/logout
        → Calls Lambda backend logoutApi({ accessToken, redirectUri })
        ↓
STEP 5: Lambda backend handleLogout()
        → cognitoIDP.send(GlobalSignOutCommand({ AccessToken }))
          (revokes ALL tokens server-side — done)
        → Returns { success: true }
        → NOTE: Backend may still emit logoutUrl — IdP/client BFF do not forward it to the browser (Phase 13 social may revisit).
        ↓
STEP 6: Auth IdP completes POST
        → Best-effort Set-Cookie cookie cleanup on JSON response (invisible to browser when caller is server-side fetch)
        → Returns { success, message } to client BFF
        ↓
STEP 7: Client BFF
        → Clears ALL client session cookies (cos_*)
        → Returns { success: true } to frontend
        ↓
STEP 8: Frontend after BFF returns `{ success: true }`
        → window.location.href = getAuthClearSessionUrlClient()  (packages/config/auth-urls-client.ts)
          → GET IdP /oauth/clear-session clears cos_idp_* in the browser, then 302 to /signin
          (required because IdP POST responses from server-side fetch do not surface Set-Cookie to the browser)
        ↓
STEP 9: User lands on auth signin page. Fully logged out.
        - Backend tokens: revoked (GlobalSignOutCommand) ✓
        - Auth app IdP cookies: cleared (**Step 8** `GET /oauth/clear-session` in browser) ✓
        - Client app cookies: cleared (Step 7) ✓
        - Other open apps: detected via Decision 7 (visibility change [P6-6] / 401 interceptor [P6-7]) ✓
```

**Phase 13 addition (social login)**: When social login is added, logout becomes conditional:

- `signin_method === "password"` → above flow (no Cognito hosted UI)
- `signin_method === "social"` → include Cognito hosted UI redirect to clear Cognito cookies

### What Changes

#### AuthProvider.handleLogout() — ✅ landed (May 2026)

Implementation lives in **`packages/auth/src/context/AuthProvider.tsx`**: best-effort **`POST /api/auth/logout`** with **`{ access_token }`** when a token exists; **always** **`window.location.href = getAuthClearSessionUrlClient()`** afterward (no `logoutUrl`, no thrown errors blocking navigation).

#### Browser IdP URLs (`packages/config`)

**`getAuthClearSessionUrlClient()`** / **`getAuthSigninUrlClient()`** — **`auth-urls-client.ts`**. Optional **`NEXT_PUBLIC_AUTH_PROVIDER_URL`**; otherwise **`http://localhost:3002`** on localhost and **`https://auth.cosmediate.com`** in production (centralized IdP per M3).

> Server-side routes continue to use **`getAuthSigninUrl()`**, **`getAuthClearSessionUrl()`**, etc. from **`auth-urls.ts`** (`AUTH_PROVIDER_URL` / `AUTH_SELF_URL`). The old illustrative **`getAuthSigninUrl` + `tldts`** snippet that lived here is **obsolete** — **`packages/auth/src/lib/utils.ts` was deleted in P9-6.**

#### Client BFF `/api/auth/logout` — Simplified (factory body in `@cosmediate/auth-bff`)

- Receives `{ access_token }` from frontend (`accessToken` alias accepted). Snake_case at the browser→BFF boundary per N6.
- Calls auth IdP `/api/auth/logout` with `Authorization: Bearer <access_token>` and JSON body `{}`.
- Auth IdP supplies default **`redirect_uri`** for Lambda when the body omits it.
- Clears local client cookies (`cos_*` scalars via `clearClientSessionCookies`).
- Returns `{ success: true }` to frontend (errors from IdP are logged; cookie cleanup still runs).
- Frontend handles IdP cookie wipe via **`GET /oauth/clear-session`** — not via this JSON response.

#### Auth IdP `/api/auth/logout` — Standardized ✅

- Receives `Authorization: Bearer <access_token>` header.
- JSON body may omit **`redirect_uri`** — IdP defaults to **`${AUTH_SELF_URL}/signin`** for **`logoutApi`** / Lambda.
- Lambda performs **`GlobalSignOutCommand`** (revokes tokens server-side).
- Does not forward **`logoutUrl`** to the client BFF JSON contract (Phase 13 social login may extend).
- Always attempts IdP cookie cleanup on the outbound response; browser-visible wipe remains **`GET /oauth/clear-session`** when the caller was server-side `fetch`.
- Returns `{ success, message }` to client BFF.

#### `/oauth/clear-session` — KEPT ✅ hardened May 2026

- Originally slated for removal. Kept because it's the only path that can be reached via `window.location.href` for cross-origin IdP cookie cleanup. A `DELETE` on `/api/auth/session` cannot be hit from `<a href>` or `window.location.href`.
- **`GET`** clears IdP cookies then redirects — default **`/signin`**; optional same-origin **`return_to`** query path (`/` prefix, open-redirect guarded).
- Callers: **`AuthProvider.handleLogout`**, **`handleUnauthorizedAccess`**, **`ClearSession.tsx`** / password flows as before.

### Tasks — ✅ all landed May 2026

#### P9-1 — Rewrite `AuthProvider.handleLogout` ✅

- **`{ access_token }`** only to BFF; always hard-redirect to **`getAuthClearSessionUrlClient()`** after best-effort POST.

#### P9-2 — `createLogoutRouteHandlers` in `@cosmediate/auth-bff` ✅

- Unified factory used by **`apps/app`**, **`web`**, **`blog`** (no **`logoutPayloadStyle`** split).

#### P9-3 — Auth IdP `/api/auth/logout` standardization ✅

- Bearer access token; optional JSON **`redirect_uri`** (default **`${AUTH_SELF_URL}/signin`**).
- Response trimmed for BFF/browser contract; **`logoutUrl`** not forwarded.

#### P9-4 — Confirm + harden `/oauth/clear-session` ✅

- Default redirect **`/signin`**; optional **`return_to`** (path-only guard).
- Cookie names aligned with **`clearAllIdpAuthCookies`** (`@cosmediate/config`).

#### P9-5 — Remove `mode=clear_session` from client signin routes ✅

- Removed from **`apps/web`** and **`apps/blog`**; **`apps/app`** retains **`mode=update_password`** only.

#### P9-6 — D6 cleanup: kill legacy utils in `packages/auth/src/lib/utils.ts` ✅

- File deleted; **`@cosmediate/auth`** depends on **`@cosmediate/config`** for client URL helpers.

### Verification

1. Click logout on dashboard → lands on auth signin page
2. Try accessing dashboard again → redirected to signin (session cleared)
3. Navigate to blog → also not authenticated (IdP session cleared)
4. Cognito cookies cleared (social login won't auto-re-auth)

---

## 12. Phase 10: Client App Route Protection

> **Status**: ✅ **SCOPED — May 2026**. **`apps/web`** and **`apps/blog`** are **marketing/public-only**: intentionally **no** `proxy.ts` auth gate for those surfaces (backend APIs remain authoritative).

### Delivered

- **`return_to` after sign-in from header**: **`@cosmediate/header`** builds **`/auth/signin?return_to=<path>`** (path + query, open-redirect guarded server-side via **`safePostAuthRedirect`** on IdP token → **`redirect_to`**). Users return to the page they clicked **Sign In** from instead of always landing on **`/`**.
- **`apps/app`** was already passing **`pathname + search`** as **`return_to`** when **`runProxySessionGate`** redirects unauthenticated dashboard traffic (`packages/config/proxy-session-gate.ts`).

### Deferred (only if product adds authenticated-only **`web`**/**`blog`** routes)

- Per-route **`proxy.ts`** matchers + optional **`@cosmediate/auth-bff`** helper (`protectedRoutes` seed from master plan §12 pre-May-2026 draft).
- Mirrors **`apps/app/src/config/routes/`** when/if those routes exist.

### Historical design seeds (pre-scope decision)

- Original **A6** note assumed **`blog`** might need middleware protection — superseded while **`web`**/**`blog`** remain fully public.

---

## 13. Phase 11: OAuth Flow Hardening & Security

> **Status**: ✅ **PARTIAL — May 2026**. Shipped: **single-use authorization codes**, **crypto-strong `oauthCode`**, and **strict `redirect_uri` + `client_id` binding** at token exchange (`claimOAuthContextForTokenExchange` — one conditional DynamoDB update). **`state`** and **PKCE** **deferred** (optional OAuth 2.1 alignment).

**Goal** (full phase): Standards-aligned OAuth 2.0 / 2.1 with minimal holes.

**Prereqs**: P4 (`packages/config`) when **`state`/PKCE** land so helpers stay centralized.

### Delivered (May 2026)

| Task | Detail |
| ---- | ------ |
| **P11-3** | Request **`redirect_uri`** must equal value stored at authorize — enforced **inside** **`claimOAuthContextForTokenExchange`** (alongside existing **`getOAuthClient`** allow-list check). |
| **P11-4** | **`oauthCode`** = **`randomBytes(32).toString("hex")`** (`apps/auth/src/lib/oauth-context-store.ts`). |
| **P11-5** | Conditional **`UpdateItem`**: **`attribute_exists(PK/SK)`**, **`used === false`**, **`expiresAt > now`**, **`redirect_uri`** + **`client_id`** match; then **`SET used = true`**; **`ReturnValues: ALL_OLD`** for session payload. Replay / mismatch / expiry → **`invalid_grant`** (**HTTP 400**) from **`apps/auth/src/app/api/auth/token/route.ts`. |

### Already satisfied (no further change)

- **P11-6** — **`validateAuthSession`** uses **`readIdpSessionFromCookies`** (**`cos_idp_*`** only).

### Deferred

#### P11-1 — `state` (CSRF)

- Client **`/auth/signin`**: random **`state`**, httpOnly cookie · IdP authorize: persist in OAuth context · Client **`/auth/processing`**: verify before **`exchange-code`**.

#### P11-2 — PKCE

- **`code_verifier` / `code_challenge`** on authorize + cookie; token endpoint verifies verifier vs stored challenge.

#### P11-7 — reCAPTCHA server verify

- **Site key** stays public (**`NEXT_PUBLIC_GOOGLE_RECAPTCHA_SITE_KEY`**). Any **secret** for Google **`siteverify`** must be server-only — never **`NEXT_PUBLIC_`**. Monorepo today has **no** exposed reCAPTCHA secret; add verification when backend/marketing APIs enforce tokens.

### Verification

1. **`state` + PKCE end-to-end** — deferred (P11-1, P11-2).
2. Auth codes **single-use** — replay same **`code`** → **`invalid_grant`**.
3. Wrong **`redirect_uri`** on token POST → **`invalid_grant`** (condition fails; code not consumed for another URI).
4. **`grep NEXT_PUBLIC_GOOGLE_RECAPTCHA_SECRET`** → **0** (no client-bundled secret).

---

## 14. Phase 12: Scalability & Cleanup — ✅ **DONE** (May 2026)

**Goal**: Easy to add TLDs, environments, client apps. Final utility cleanup sweep.
**Prereqs**: P4 (`packages/config` is where the dynamic origins generator lives).

### Tasks

#### P12-1 — Dynamic allowed origins generation ✅ **May 2026**

> **Note:** The snippet below is **pseudocode** only (e.g. **`staging.`** is not generated as a loop today). The real implementation is **`generateAllowedOrigins()`** in **`packages/config/src/tlds.ts`** — open that file for exact origin rules.

```typescript
const COSMEDIATE_TLDS = ["com", "nl", "be", "de", "fr", "gr", "it"];
const SUBDOMAINS = ["", "www", "blog", "app", "auth"];
const ENVS = ["", "dev", "staging"];

export function generateAllowedOrigins(): string[] {
  /* generates all combos */
}
```

- **Implemented** in **`packages/config/src/tlds.ts`** — `COSMEDIATE_TLDS`, **`generateAllowedOrigins()`** (localhost + apex/www/app/blog + **`dev.`** variants + centralized auth host). Extends automatically when TLDs are added.
- Replaces hand-maintained **`ALLOWED_ORIGINS`** env blobs.

#### P12-2 — Add staging environment support ✅ **May 2026**

- Non-prod hosts covered via **`dev.*`** entries inside **`generateAllowedOrigins()`** and env-driven **`AUTH_PROVIDER_URL`** / **`AUTH_SELF_URL`** / `NEXT_PUBLIC_*` URLs. Dedicated **`staging.`** hostname prefixes are the same contract — add to the origin generator when that hostname goes live (no separate proxy fork required).

#### P12-3 — DynamoDB TTL for OAuth contexts ✅ **May 2026** _(application + infra contract)_

- OAuth authorize contexts carry **`expiresAt`** (unix seconds) with short TTL (~10m) and **conditional reads** / expiry checks in **`oauth-context-store`**. Optional **native DynamoDB TTL** on the same attribute is an **AWS console / IaC** toggle (no further monorepo gate).

#### P12-4 — `packages/auth/src/lib/utils.ts` ✅ _(obviated May 2026 — entire file deleted in **P9-6**; no remaining sweep)_

#### P12-5 — Final `AGENTS.md` and onboarding doc sync ✅ **May 2026**

- **`AGENTS.md`** §13 + **`docs/apps/auth/system-design/AUTH.md`** (and related references) aligned with scalar cookies, BFF package, and post–Phase 11 behaviour. Fourth-client onboarding path: **`pnpm add @cosmediate/auth-bff`** + wrappers + env (**§10**, **`AGENTS.md`**).

#### P12-6 — Remove Phase 6 backward-compat shims ✅ **May 2026 (pre-prod)**

Removed: **`LegacySessionData`** / legacy **`normalizeSessionDataForToken`** branch; **`readClientSessionSnapshot`** & **`readIdpSessionFromCookies`** legacy cookie reads; **`proxy-session-gate`** `session_tokens` path; exported **`LEGACY_*`** / **`clearLegacy*`** APIs. **`clearClientSessionCookies`** / **`clearIdpSessionCookies`** delete **`cos_*`** / **`cos_idp_*`** only. **`apps/app`** **`session_user_role`** fallbacks dropped. **`apps/auth`** **`lib/server/config.ts`** deleted (**`generateAllowedOrigins`** inlined via **`utils.ts`**). **`getRedirectUri`** alias removed from **`packages/config`**. Password BFF relies on API email resolution only.

---

## 15. Phase 13: Social Login (Last)

**Moved to last** — Requires Cognito setup for Facebook/Apple. Backend work needed first.

### Context

The social login flow is about TWO things:

1. **Sign in with social account** (Google/Facebook/Apple) — creates new account or signs in
2. **Connect social account** to existing email/password account — user already signed in

For (1), the flow is similar to email/password but goes through Cognito:

- User clicks "Google" on auth signin page
- Redirect to Cognito hosted UI → Google → back to auth `/processing`
- Auth app exchanges Cognito code → gets session
- **Key fix**: The **`cos_oauth_code`** cookie must survive the Cognito round-trip (same domain)
- After signin, auth app checks OAuth context → redirects back to client app with code
- Normal exchange flow continues

For (2), user is already authenticated:

- On dashboard settings, user clicks "Connect Google"
- This initiates Cognito OAuth directly (not through our OAuth flow)
- Cognito redirects back to auth app's `/processing`
- Auth app links the social identity to the existing user via backend API
- No redirect to another client app needed — user stays on dashboard

### Tasks (when ready)

#### P13-1 — Ensure `cos_oauth_code` cookie persists across the Cognito Hosted UI redirect

#### P13-2 — Update auth `AuthProcessing` component to detect post-Cognito flow and check OAuth context

#### P13-3 — Logout becomes conditional on `signin_method` (per Decision 8): include Cognito Hosted UI URL when `signin_method === "social"`

#### P13-4 — Implement Facebook login via Cognito (backend Cognito config first)

#### P13-5 — Implement Apple login via Cognito (backend Cognito config first)

#### P13-6 — Implement "Connect social account" flow for already-signed-in users

---

## 16. File-by-File Change Map

> **v3 simplified.** The exhaustive per-file matrix in v2 went stale fast (every renumber broke a dozen rows). Each phase section lists the files it touches. This section keeps a high-level pointer plus the always-touched cross-cutting files.

### Cross-cutting files (touched by many phases)

| File                                                          | Phases that touch it               | Reason                                                                                  |
| ------------------------------------------------------------- | ---------------------------------- | --------------------------------------------------------------------------------------- |
| `apps/{app,web,blog}/src/proxy.ts`                            | P1 ✅ · P2 ✅ · P6 ✅ · **P7 ✅** · P8 · **P10 ✅ scoped** | **`web`**/**`blog`**: public-only gate (`runProxySessionGate` **`mode: "public"`**). **`app`**: dashboard gate + **`return_to`** on sign-in redirect. Optional **`web`**/**`blog`** matchers if member routes ship later.                                              |
| `apps/{app,web,blog}/src/app/api/auth/exchange-code/route.ts` | P1 ✅ · P2 ✅ · P6 ✅ · P8            | `cos_*` cookies + snake_case parse (P6). Extract (P8).        |
| `apps/{app,web,blog}/src/app/api/auth/get-session/route.ts`   | P2 ✅ · P6 ✅ · P8                    | `readClientSessionSnapshot` (P6). Extract (P8).        |
| `apps/{app,web,blog}/src/app/api/auth/logout/route.ts`        | P2 ✅ · **P8 ✅** · **P9 ✅**                    | **`createLogoutRouteHandlers`** + unified logout (**May 2026**).                                     |
| `apps/auth/src/app/api/auth/token/route.ts`                   | P2 ✅ · P6 ✅ · **P11 partial**                   | Snake_case success body (P6). **`claimOAuthContextForTokenExchange`** + **`invalid_grant` 400** (**P11**). **`state`/PKCE** open.                           |
| `apps/auth/src/app/oauth/authorize/route.ts`                  | P1 ✅ · P2 ✅ · P6 ✅ · P11           | IdP scalar cookies (P6). State+PKCE (P11).                                       |
| `apps/auth/src/lib/oauth-context-store.ts`                    | P1 ✅ · P5 · P6 · **P11 partial**                   | Flat `SessionData` + legacy mapper (P6). **`claimOAuthContextForTokenExchange`**, crypto **`oauthCode`** (**P11** May 2026).       |
| `packages/auth/src/hooks/useSilentAuth.ts`                    | P1 ✅ · P2 ✅ · **P7 ✅**              | Visibility + optional heartbeat (**P7-prep**, landed P7).                                                               |
| `packages/auth/src/context/AuthProvider.tsx`                  | P1 ✅ · P2 ✅ · **P7 ✅** · **P9 ✅**          | **`ensureApiUnauthorizedInterceptor`** (**P7**). **`handleLogout`** unified (**P9**).                                                            |
| ~~`packages/auth/src/lib/utils.ts`~~                          | **P9 ✅** (May 2026)                | **Deleted** — D6 legacy URL helpers.                                                           |
| `packages/api/src/axiosInstance.ts`                           | —                                 | No `@cosmediate/auth` import; **401** handled from **`packages/auth`** (**✅ P7**).                                                   |
| `packages/type-utils/src/auth.ts`                             | P1 ✅ · P5                         | `Session` extension (P1 done). Type-unification (P5).                                   |

### New packages to create

| Phase | Package             | Purpose                                                                                                                |
| ----- | ------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| P4    | `packages/config`   | URL utils, TLD map, env contracts (+ **`auth-urls-client.ts`** for browser IdP redirects, **P9**). Legacy `packages/auth/src/lib/utils.ts` URL fns removed **P9**. |
| P8    | `packages/auth-bff` | All 6 client-BFF route factories + `proxy.ts` middleware composables.                                                  |

### Files to be deleted

| Phase | File                                                                                                                   | Reason                                                                    |
| ----- | ---------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| P2 ✅ | `apps/auth/src/app/api/auth/clear-session/`                                                                            | Byte-identical duplicate of `/oauth/clear-session`. Removed Apr 26, 2026. |
| P2 ✅ | `apps/web/src/features/auth_temp/`                                                                                     | Moved to proper path (F2).                                                |
| P6 ✅ | `session_tokens` JSON-blob cookie writes (primary path)                                                                     | Replaced by six `cos_*` scalars; legacy shim removal **P12-6** ✅ May 2026.                                      |
| P8    | `apps/{app,web,blog}/src/lib/server/config.ts`                                                                         | D7 — moved to `@cosmediate/auth-bff` + `packages/config`.                 |
| P8    | `apps/{app,web,blog}/src/lib/server/utils.ts`                                                                          | D7.                                                                       |
| P8    | `apps/{app,web,blog}/src/lib/routing/utils.ts`                                                                         | D7.                                                                       |
| P9 ✅ | `getLogoutRedirectUri`, `constructRedirectUri`, `getRootDomain`, `getBlogAppUrl` from `packages/auth/src/lib/utils.ts` (file deleted) | D6. May 2026.                                                                       |
| P9 ✅ | `mode=clear_session` handling in client `apps/web` + `apps/blog` `/auth/signin` routes                                                     | Folded into unified logout + direct **`/oauth/clear-session`** navigation.                                         |

### Files **kept** (deviations from earlier plan)

| File                                             | Why kept                                                                                                           |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------ |
| `apps/auth/src/app/oauth/clear-session/route.ts` | Required for `window.location.href` cross-origin IdP cookie cleanup. `DELETE /api/auth/session` cannot replace it. |

---

## 17. New Files / Summary of Net Changes

This section consolidates the v2 "New Files" + "Files to Delete" tables. The detailed per-phase entries are in each phase section's task list; this is just the at-a-glance.

| Net Change                                      | Phase | Description                                                                 |
| ----------------------------------------------- | ----- | --------------------------------------------------------------------------- |
| `apps/auth/src/lib/refresh-tokens.ts`           | **P7 ✅** | Internal helper for token refresh.                                          |
| `apps/auth/src/app/api/auth/refresh/`           | **P7 ✅** | POST route on auth IdP.                                                 |
| `apps/{app,web,blog}/src/app/api/auth/refresh/` | **P7 ✅** | POST route per client (extract **`@cosmediate/auth-bff`** body in P8). |
| `packages/config` (`getAuthRefreshUrl`, `session-refresh-fetch`, `idp-refresh-response`) | **P7 ✅** | Refresh URL helper + same-origin proxy fetch + IdP JSON parse for client BFFs (May 2026). |
| `packages/auth` (`api-unauthorized-interceptor.ts`) | **P7 ✅** | Single axios **401** → **`handleUnauthorizedAccess`** (no **`@cosmediate/api`** cycle). |
| `packages/config` (`auth-urls-client.ts`, `NEXT_PUBLIC_AUTH_PROVIDER_URL`) | **P9 ✅** | Browser IdP hard redirects (`getAuthClearSessionUrlClient`, etc.). May 2026. |
| `packages/auth-bff/`                            | **P8 ✅** | Client BFF route factories + **`createCorsHelpers`** (`apps/app`, `web`, `blog`).                                                         |
| Cookies renamed `cos_*` / `cos_idp_*` (six scalars each surface) | P6 ✅ | Client + IdP; **`clear*`** helpers drop **`cos_*`** / **`cos_idp_*`** only (**P12-6** ✅ May 2026).                                       |

---

## 18. Phase 2 Audit Decisions Archive (historical)

> **Status**: HISTORICAL. This section records the Phase 2 Pre-Refactor Audit decisions taken on Apr 22, 2026 plus the legacy phase-roadmap that was promoted to §1.A on Apr 29, 2026. Kept for trail-of-decisions only.
>
> - Canonical phase numbering is now in **§1.A** (above).
> - Audit-finding mappings (A-, D-, N-, M-, L- prefixes) are now distributed into the phase sections that own them.
> - Companion doc: `CODING_STANDARDS.md`.

### 18.1 Decisions on Audit Findings (Apr 22, 2026)

**CRITICAL - Already applied**

- P2-FIX-1, P2-FIX-2: Done. Phase 1 closed.
- P2-FIX-PASSWORDS: Pending. Dead feature (hooks not called anywhere). Picked up when password-change UX is wired. Not blocking any phase.

**HIGH - Architectural**

- **A1 - KEEP as-is.** `Session.user` + `Session.userId` + `Session.userRole` co-exist. `userId` + `userRole` come from cookies (authoritative). `user` is hydrated client-side by `useSilentAuth`. Document the contract in `type-utils`; no refactor unless a real logical bug surfaces.
- **A2 - FIX in Phase 2.** Unauthorized-access flow: when `userRole` unknown / user fetch fails / role missing / identity broken:
  1. Best-effort POST to backend logout API (revoke tokens if session exists).
  2. Call auth app's clear-session endpoint (wipe IdP cookies on auth domain).
  3. Clear all client cookies.
  4. `window.location.href = <auth app signin URL>`.

  Failures in steps 1-3 must NOT block the final redirect.

- **A3 - FIX in Phase 2.** Only call `getSessionUser` inside `if (data.authenticated)`. No calls with null args.
- **A4 - FIX in Phase 2.** `AuthProvider` uses `session.userRole` (cookie-sourced, authoritative) as source of truth for role. `session.user` populates `sessionUser` state but missing `user` must NOT block `isAuthenticated` / `userRole` from being set.
- **A5 - Defer to Phase 5 "Data Layer Refactor".** Token/expiry type mismatch (`string` vs `number`) is one symptom of bigger DynamoDB / session-record shape question. Solve in one phase, not piecemeal.
- **A6 - ✅ Scoped May 2026.** **`web`**/**`blog`** remain fully **public** (no **`proxy`** auth gate). **`return_to`** after OAuth from **`@cosmediate/header`** Sign In + existing **`apps/app`** **`runProxySessionGate`** redirects. Per-route **`web`**/**`blog`** middleware guards deferred until product defines member-only URLs (see §12 Phase 10).
- **A7 - FIX in Phase 2 cleanup.** `getSpecialistApi` confirmed public (no token param). Add a code comment. If backend requires auth later, update signature + call sites.
- **A8 - FIX in Phase 2 cleanup.** Log `CRITICAL: sessionData.user missing` -> `CRITICAL: sessionData.userId missing`.
- **A9 - Leave as-is.** Harmless commented line.
- **A10 - Defer to Phase 4 "Config & URL Architecture".** Decision: new `packages/config` package with:
  - `getAuthProviderUrl()` — returns static auth URL per env (`localhost:3002` / `dev.auth.cosmediate.com` / `auth.cosmediate.com`). **Auth app is `.com`-only and centralized**, so no hostname derivation needed.
  - `getClientAppUrl(app, request)` — derives client URL from request hostname's TLD (web/blog/app live on every TLD: `.com`, `.nl`, `.gr`, `.de`, etc.).
  - `COSMEDIATE_TLDS` map + env-var contracts.
  - Kills hardcoded URLs and per-app `lib/server/config.ts` duplication.

**MEDIUM - Duplication**

All duplication fixes live in ONE of two phases:

- **Phase 8 "Shared Auth-BFF Package"** -> D1, D2, D4, D5, D7.
- **Phase 9 "Logout Unified"** ✅ (May 2026) -> D3, D6.

Duplication fixes above **P8/P9/P12 ✅** are complete for their scoped items; remaining historical duplication notes are archived in §18 where applicable.

**MEDIUM - Naming**

- **N1** — Rename: JS var `authCode` -> `oauthCode`; cookie `auth_context_id` -> `cos_oauth_code`; URL param stays `code` (OAuth spec). Codebase-wide. Phase 2.
- **N2** — Rename `client_auth_ctx` -> `cos_oauth_request`. NOTE: may be removed entirely in Phase 6 (Cookie Redesign). Revisit at that phase.
- **N3** — Standardize on `return_to`. Kill `redirect_after_auth` / `redirectAfterAuth` / `redirectTo`. Codebase-wide. Phase 2.
- **N4** — Env split: auth app = `AUTH_SELF_URL`; client apps = `AUTH_PROVIDER_URL`. Phase 2.
- **N5** — Typo: `refiredtToAuthSignin` -> `redirectToSignin`. Phase 2.
- **N6** — Payload casing: OAuth-spec fields (`client_id`, `redirect_uri`, `code`, `state`, etc.) stay snake_case; internal JSON between our own services stays camelCase. Documented in `CODING_STANDARDS.md`. Logout boundary: **`access_token`** to client BFF; IdP **`redirect_uri`** optional with server default (**✅ Phase 9**, May 2026).

**LOW - Dead code, logs, misc**

| ID     | Decision                                                                                                                                                                                                         |
| ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| L1     | Gate verbose logs behind `process.env.DEBUG_AUTH === "true"`. Delete anything logging secrets/tokens.                                                                                                            |
| L2     | Delete all listed commented blocks.                                                                                                                                                                              |
| L3     | Fix stale comments.                                                                                                                                                                                              |
| L4     | Already clean.                                                                                                                                                                                                   |
| L5     | Assert upfront after `success: true` that `signInResponse.user` exists; throw 500 otherwise.                                                                                                                     |
| L6     | Remove duplicate log.                                                                                                                                                                                            |
| L7     | Fix log label.                                                                                                                                                                                                   |
| M1     | `[sblog:...]` -> `[blog:...]`.                                                                                                                                                                                   |
| M2     | Keep Facebook/Apple stubs (Phase 13).                                                                                                                                                                            |
| M3     | **RESOLVED.** Auth app is `.com`-only and centralized. Social login only runs on the auth app. Keep `NEXT_PUBLIC_COGNITO_OAUTH_REDIRECT_URI` as a static env var per environment. No hostname derivation needed. |
| M4     | Interim export of `getLogoutRedirectUri` + `getBlogAppUrl` from `packages/auth/src/index.ts`. **✅ Superseded:** file removed **Phase 9** (May 2026).                                                                                             |
| M5     | Delete `console.log("got here")` in `apps/app/src/app/page.tsx`.                                                                                                                                                 |
| M6     | **CORRECTED.** `/dashboard` in `proxy.ts` is cross-app routing (strips prefix, redirects to `app.*` subdomain). Unrelated to auth. Folded into D4 extraction (Phase 8).                                          |
| M7     | Retry only on network errors (no retries on `res.ok === false`). `MAX_RETRIES`=3, `RETRY_DELAY_MS`=500.                                                                                                          |
| M8     | `proxy.ts` expired-session branch: `return` directly instead of `throw` + fall-through.                                                                                                                          |
| F1     | Done.                                                                                                                                                                                                            |
| F2, F3 | Resolved by `CODING_STANDARDS.md`. Renames in Phase 2.                                                                                                                                                           |

### 18.2 Revised Phase Roadmap (Apr 22, 2026 — promoted to §1.A on Apr 29, 2026)

> Original location of the canonical phase table. Now lives in **§1.A** (top of doc) with up-to-date Apr 29 decisions baked in (refresh via BFF instead of `?prompt=refresh`, etc.). This is preserved as a historical reference — do NOT edit.

_See §1.A for the active table._

### 18.3 Phase 2 Execution Order (historical — Phase 2 done Apr 26, 2026)

1. **A2 unauthorized-access flow** — biggest behavior change; do first, test hard.
2. **Typo + function renames** (N5: `refiredtToAuthSignin` -> `redirectToSignin`).
3. **Cleanup sweep** (A3, A4, A7, A8, L1-L7, M1, M4, M5, M7, M8) — low-risk, mechanical.
4. **URL param rename** (N3: `redirect_after_auth` -> `return_to`) — codebase-wide, affects auth app + client apps + OAuth context store schema.
5. **OAuth code rename** (N1: `authCode` -> `oauthCode`, cookie `auth_context_id` -> `cos_oauth_code`).
6. **Env-var split** (N4: `AUTH_BASE_URL` -> `AUTH_SELF_URL` / `AUTH_PROVIDER_URL`) — `.env` files + code.
7. **Feature-dir renames** (F2/F3 per `CODING_STANDARDS.md`).
8. **Route reorganization** in auth app (`/api/signin` -> `/api/auth/signin`, etc.) — updates client env vars too.
