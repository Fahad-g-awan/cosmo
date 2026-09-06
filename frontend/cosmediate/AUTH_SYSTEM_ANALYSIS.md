# Cosmediate Auth System — Full Analysis & Bug Report System

> **Generated**: April 7, 2025
> **Scope**: Complete auth flow across all 4 apps (auth, app, web, blog) + packages/auth
> **Status**: CRITICAL — Multiple bugs including infinite redirect loop

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Current Auth Flow (Intended)](#2-current-auth-flow-intended)
3. [File Inventory](#3-file-inventory)
4. [The Redirect Loop — Root Cause Analysis](#4-the-redirect-loop--root-cause-analysis)
5. [Critical Bugs](#5-critical-bugs)
6. [Moderate Bugs](#6-moderate-bugs)
7. [Design & Architecture Issues](#7-design--architecture-issues)
8. [Code Quality Issues](#8-code-quality-issues)
9. [Security Vulnerabilities](#9-security-vulnerabilities)
10. [Naming & Consistency Issues](#10-naming--consistency-issues)
11. [Scalability Blockers](#11-scalability-blockers)
12. [Flow Diagrams](#12-flow-diagrams)
13. [Recommended Fix Priority](#13-recommended-fix-priority)

---

## 1. Architecture Overview

### What You're Building

A custom OAuth 2.0 Authorization Code flow where:

- **Auth App** (`apps/auth/`, port 3002) = the Identity Provider (IdP)
- **Client Apps** (web/app/blog) = OAuth 2.0 clients (Relying Parties)
- **DynamoDB** stores OAuth contexts and client registrations
- **AWS Cognito** is used for social logins (Google) behind the auth app

### Current Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         BROWSER (User)                              │
└──────┬──────────────────────────────────────────────────────────────┘
       │
       │  1. Visit app.cosmediate.com
       ▼
┌──────────────────┐     2. No session cookie → redirect
│  App Dashboard   │────────────────────────────────────┐
│  (port 3003)     │                                    │
│                  │     8. Exchange code for tokens     │
│  proxy.ts        │     POST /api/auth/exchange-code   │
│  (middleware)     │◄──────────────────────────────┐    │
└──────────────────┘                               │    │
                                                   │    │
       ┌───────────────────────────────────────────┘    │
       │  9. Set session_* cookies, return redirectTo   │
       ▼                                                │
┌──────────────────┐                                    │
│  /auth/processing│  7. Page loads with ?code=xxx      │
│  (client-side)   │     Calls POST /api/auth/exchange  │
└──────────────────┘                                    │
       ▲                                                │
       │  6. Redirect back: app.cosmediate.com/         │
       │     auth/processing?code=xxx                   │
       │                                                ▼
┌──────────────────────────────────────────────────────────┐
│                    AUTH APP (port 3002)                    │
│                                                           │
│  3. GET /oauth/authorize                                  │
│     - Stores OAuth context in DynamoDB                    │
│     - Sets client_auth_ctx + auth_context_id cookies      │
│     - If IdP session exists & valid → SSO fast path (6)   │
│     - If no session → redirect to /signin (4)             │
│                                                           │
│  4. /signin page → user enters credentials                │
│     POST /api/signin → calls backend userSignInApi        │
│     - Stores session in DynamoDB OAuth context             │
│     - Sets idp_session_* cookies on auth domain           │
│     - Returns redirectTo = client redirect_uri + code     │
│                                                           │
│  5. Frontend does window.location.href = redirectTo       │
│     → Goes to client's /auth/processing?code=xxx          │
│                                                           │
│  7b. POST /api/oauth/token (called by client BFF)         │
│      - Validates client_id, client_secret, code           │
│      - Returns session data from DynamoDB context          │
└──────────────────────────────────────────────────────────┘
```

### Cookie Domains

| Cookie               | Set By     | Domain              | Purpose                             |
| -------------------- | ---------- | ------------------- | ----------------------------------- |
| `idp_session_id`     | auth app   | auth.cosmediate.com | IdP session ID                      |
| `idp_session_tokens` | auth app   | auth.cosmediate.com | IdP tokens (accessToken, expiresAt) |
| `idp_session_user`   | auth app   | auth.cosmediate.com | IdP user data                       |
| `auth_context_id`    | auth app   | auth.cosmediate.com | OAuth auth code reference           |
| `client_auth_ctx`    | auth app   | auth.cosmediate.com | OAuth client context JSON           |
| `session_tokens`     | client app | app.cosmediate.com  | Client-side session tokens          |
| `session_user`       | client app | app.cosmediate.com  | Client-side user data               |
| `session_id`         | client app | app.cosmediate.com  | Client-side session ID              |

---

## 2. Current Auth Flow (Intended)

### Login Flow (Happy Path)

```
Step 1:  User visits app.cosmediate.com (dashboard)
Step 2:  proxy.ts middleware checks session_tokens cookie → not found
Step 3:  Middleware calls refiredtToAuthSignin() → redirect to /auth/signin
Step 4:  /auth/signin is a route handler (GET) that builds OAuth authorize URL
Step 5:  Redirect to auth.cosmediate.com/oauth/authorize?client_id=...&redirect_uri=...
Step 6:  /oauth/authorize stores context in DynamoDB, checks IdP session
Step 7:  No IdP session → redirect to /signin on auth app
Step 8:  User sees signin form, enters email+password
Step 9:  POST /api/signin → backend validates → returns tokens
Step 10: Signin route stores session in OAuth context (DynamoDB)
Step 11: Sets idp_session_* cookies, returns redirectTo URL
Step 12: Frontend does window.location.href = redirectTo
         (redirectTo = app.cosmediate.com/auth/processing?code=xxx)
Step 13: /auth/processing page loads, extracts code from URL
Step 14: POST /api/auth/exchange-code with { code }
Step 15: exchange-code route calls auth app's /api/oauth/token
Step 16: Token endpoint validates code, client_id, client_secret
Step 17: Returns session data from DynamoDB
Step 18: exchange-code sets session_* cookies on client domain
Step 19: Returns { success: true, redirectTo: "/clinic-management" }
Step 20: Frontend does window.location.href = redirectTo
```

### SSO Flow (Already Logged In on Auth)

```
Step 1:  User visits blog.cosmediate.com, needs auth
Step 2:  Redirected to auth.cosmediate.com/oauth/authorize
Step 3:  /oauth/authorize finds valid idp_session_* cookies
Step 4:  Immediately redirects back to blog's redirect_uri with code
Step 5:  Blog exchanges code → gets session → sets cookies → done
```

---

## 3. File Inventory

### Auth App (`apps/auth/`)

| File                                      | Purpose                                            |
| ----------------------------------------- | -------------------------------------------------- |
| `src/app/api/signin/route.ts`             | POST — email/password or Cognito code signin       |
| `src/app/api/signup/route.ts`             | POST — user registration                           |
| `src/app/api/confirm-signup/route.ts`     | POST — email verification                          |
| `src/app/api/forgot-password/route.ts`    | POST — forgot password                             |
| `src/app/api/reset-password/route.ts`     | POST — reset password with code                    |
| `src/app/api/set-password/route.ts`       | POST — set new password (first time)               |
| `src/app/api/update-password/route.ts`    | POST — change password                             |
| `src/app/api/logout/route.ts`             | POST — logout, clear IdP cookies                   |
| `src/app/api/oauth/token/route.ts`        | POST — OAuth token exchange                        |
| `src/app/api/auth/clear-session/route.ts` | GET — clear IdP cookies, redirect to /             |
| `src/app/api/auth/get-session/route.ts`   | GET — return IdP session from cookies              |
| `src/app/api/_ping/route.ts`              | GET — health check                                 |
| `src/app/oauth/authorize/route.ts`        | GET — OAuth authorize endpoint                     |
| `src/app/oauth/clear-session/route.ts`    | GET — clear session + redirect to /                |
| `src/app/signin/page.tsx`                 | Signin UI page                                     |
| `src/app/signup/page.tsx`                 | Signup UI page                                     |
| `src/app/processing/page.tsx`             | Cognito social auth processing                     |
| `src/app/confirm-signup/page.tsx`         | Confirm signup page                                |
| `src/app/forgot-password/page.tsx`        | Forgot password page                               |
| `src/app/reset-password/page.tsx`         | Reset password page                                |
| `src/features/AuthProcessing/index.tsx`   | Cognito code → signin exchange                     |
| `src/features/Signin/index.tsx`           | Signin form UI                                     |
| `src/features/ClearSession.tsx`           | Clear session client component                     |
| `src/lib/oauth-context-store.ts`          | DynamoDB OAuth context CRUD                        |
| `src/lib/oauth-client-store.ts`           | DynamoDB OAuth client lookup                       |
| `src/lib/db-config.ts`                    | DynamoDB client config                             |
| `src/lib/server-utils.ts`                 | validateAuthSession (checks session_tokens cookie) |
| `src/lib/server/utils.ts`                 | CORS origin handler, requestHeader                 |
| `src/lib/server/config.ts`                | ALLOWED_ORIGINS array                              |
| `src/proxy.ts`                            | Middleware — cross-app routing                     |

### App Dashboard (`apps/app/`)

| File                                        | Purpose                                     |
| ------------------------------------------- | ------------------------------------------- |
| `src/app/api/auth/exchange-code/route.ts`   | POST — exchange auth code for tokens        |
| `src/app/api/auth/get-session/route.ts`     | GET — return session from cookies           |
| `src/app/api/auth/logout/route.ts`          | POST — logout via auth app                  |
| `src/app/api/auth/set-password/route.ts`    | POST — proxy set-password to auth           |
| `src/app/api/auth/update-password/route.ts` | POST — proxy update-password to auth        |
| `src/app/api/user/default-route/route.ts`   | GET — role-based default route              |
| `src/app/auth/signin/route.ts`              | GET — build OAuth authorize URL, redirect   |
| `src/app/auth/processing/page.tsx`          | Processing page (exchange code)             |
| `src/app/page.tsx`                          | Root page — fetch default route, redirect   |
| `src/components/auth/Processing/index.tsx`  | Processing component                        |
| `src/proxy.ts`                              | Middleware — auth guard + cross-app routing |
| `src/lib/routing/utils.ts`                  | getOrigin, getRedirectUri                   |
| `src/lib/routing/roleRouting.ts`            | Role-based routing, getDefaultRouteForRole  |
| `src/lib/server/utils.ts`                   | CORS origin handler                         |
| `src/lib/server/config.ts`                  | ALLOWED_ORIGINS array                       |

### Web App (`apps/web/`)

| File                                               | Purpose                                   |
| -------------------------------------------------- | ----------------------------------------- |
| `src/app/api/auth/exchange-code/route.ts`          | POST — exchange auth code for tokens      |
| `src/app/api/auth/get-session/route.ts`            | GET — return session from cookies         |
| `src/app/api/auth/logout/route.ts`                 | POST — logout via auth app                |
| `src/app/auth/signin/route.ts`                     | GET — build OAuth authorize URL, redirect |
| `src/app/auth/processing/page.tsx`                 | Processing page                           |
| `src/features/auth_temp/processing_temp/index.tsx` | Processing component                      |
| `src/proxy.ts`                                     | Middleware — cross-app routing            |
| `src/lib/routing/utils.ts`                         | getOrigin, getRedirectUri                 |

### Blog App (`apps/blog/`)

| File                                      | Purpose                                   |
| ----------------------------------------- | ----------------------------------------- |
| `src/app/api/auth/exchange-code/route.ts` | POST — exchange auth code for tokens      |
| `src/app/api/auth/get-session/route.ts`   | GET — return session from cookies         |
| `src/app/api/auth/logout/route.ts`        | POST — logout via auth app                |
| `src/app/auth/signin/route.ts`            | GET — build OAuth authorize URL, redirect |
| `src/app/auth/processing/page.tsx`        | Processing page                           |
| `src/features/auth/Processing/index.tsx`  | Processing component                      |
| `src/proxy.ts`                            | Middleware — cross-app routing            |
| `src/lib/routing/utils.ts`                | getOrigin, getRedirectUri                 |

### Shared Package (`packages/auth/`)

| File                                   | Purpose                                                   |
| -------------------------------------- | --------------------------------------------------------- |
| `src/context/AuthProvider.tsx`         | AuthProvider + useReducer, logout, session                |
| `src/hooks/useAuth.ts`                 | useContext(AuthContext)                                   |
| `src/hooks/useSilentAuth.ts`           | Check session via GET /api/auth/get-session               |
| `src/hooks/useSignIn.ts`               | POST /api/signin (used by auth app)                       |
| `src/hooks/useSignUp.ts`               | POST /api/signup                                          |
| `src/hooks/useConfirmSignup.ts`        | POST /api/confirm-signup                                  |
| `src/hooks/useForgotPassword.ts`       | POST /api/forgot-password                                 |
| `src/hooks/useResetPassword.ts`        | POST /api/reset-password                                  |
| `src/hooks/useSetNewPassword.ts`       | POST /api/set-password                                    |
| `src/hooks/useUpdatePassword.ts`       | POST /api/update-password                                 |
| `src/hooks/useSocialAccountsSignin.ts` | Cognito hosted UI redirect                                |
| `src/lib/utils.ts`                     | constructRedirectUri, getLogoutRedirectUri, getRootDomain |
| `src/lib/auth.utils.ts`                | validateEmail, validatePassword                           |

---

## 4. The Redirect Loop — Root Cause Analysis

### 🔴 THIS IS YOUR MAIN ISSUE

The infinite redirect loop when logging into the dashboard app has **multiple contributing causes**:

### Root Cause #1: `res.json()` called TWICE in Processing component (app)

**File**: `apps/app/src/components/auth/Processing/index.tsx` lines 32-44

```typescript
// LINE 32: Consumes the body stream
console.log("[/api/auth/exchange-code] res", await res.json());

// LINE 34: res.ok check happens AFTER body was already consumed
if (!res.ok) {
  const errorData = await res.json().catch(() => null); // FAILS - stream consumed
  // ...
}

// LINE 44: Tries to read body AGAIN — stream already consumed!
const data = await res.json(); // THROWS — body already read
```

**What happens**: `res.json()` is called on line 32 for logging, which consumes the Response body stream. The `res.ok` check on line 34 still works (it's a property, not stream-dependent). But then `res.json()` on line 44 **throws** because the stream is already consumed. This throws an error, which is caught, and the catch block redirects to `/auth/signin`, which starts the OAuth flow again → **infinite loop**.

### Root Cause #2: `res.json()` called TWICE in root page (app)

**File**: `apps/app/src/app/page.tsx` lines 21-28

```typescript
// LINE 21: Consumes the body stream
console.log("res", await res.json());

// LINE 23: res.ok check still works
if (!res.ok) { ... }

// LINE 28: Tries to read body AGAIN — THROWS
const data = await res.json();
```

Same issue — the root page that does role-based routing also double-consumes the response body, causing it to error out and redirect to signin → loop.

### Root Cause #3: Middleware doesn't return redirect response

**File**: `apps/app/src/proxy.ts` lines 108-110, 136

```typescript
// LINE 109: Calls the function but DOESN'T RETURN the result!
refiredtToAuthSignin(request, redirectAfterAuth);
// Falls through to NextResponse.next() at line 171

// LINE 136: Same - no return statement
refiredtToAuthSignin(request, redirectAfterAuth);

// LINE 149: Same - no return statement
refiredtToAuthSignin(request, redirectAfterAuth);
```

The `refiredtToAuthSignin` function returns a `NextResponse.redirect()`, but the middleware **never returns it**. The request falls through to `NextResponse.next()`, so unauthenticated users reach protected pages, which then fail and start the loop.

### Root Cause #4: OAuth context reuse causes stale/used codes

**File**: `apps/auth/src/app/oauth/authorize/route.ts` lines 89-113

```typescript
const authCtx = await getOAuthContext({ clientId });
let authCode = authCtx?.authCode ?? "";

if (!authCode) {
  authCode = await storeOAuthContext(clientAuthCtx, 10);
}
```

When looking up by `clientId`, it may return an **already-used** or **stale** context because:

- The `getOAuthContext` with `clientId` uses GSI5 which returns the FIRST matching item
- If there are multiple contexts for the same client_id, it might return a wrong one
- After the code is used (`used: true`), the `getOAuthContext` filters it out — but there's a race condition window

### Root Cause #5: The "exchange-code returns redirect on error" pattern

**File**: `apps/app/src/app/api/auth/exchange-code/route.ts` lines 78-89

```typescript
if (!tokenRes.ok) {
  // Instead of returning JSON error to the Processing component,
  // it does a server-side REDIRECT from a POST handler
  const signinUrl = new URL("/signin", authBaseUrl);
  signinUrl.searchParams.set("mode", "clear_session");
  const response = NextResponse.redirect(signinUrl);
  return response; // This is a 302 redirect from a POST endpoint!
}
```

The Processing component calls this as `fetch()` (AJAX). A redirect response from a `fetch()` POST is followed transparently by the browser, but the final response won't be what the component expects. This causes the error handling in the component to trigger, which then redirects to `/auth/signin` → loop again.

### The Combined Loop Path

```
1. User visits app.cosmediate.com/
2. proxy.ts middleware: no session → calls refiredtToAuthSignin() BUT DOESN'T RETURN IT
3. Request falls through → page.tsx loads
4. page.tsx fetches /api/user/default-route → double res.json() → THROWS
5. Catch block → router.push("/auth/signin?error_description=...")
6. /auth/signin (GET route) → redirects to auth app /oauth/authorize
7. /oauth/authorize → no IdP session → redirects to /signin
8. User enters credentials → signin succeeds → redirects back with code
9. app.cosmediate.com/auth/processing?code=xxx
10. Processing component calls POST /api/auth/exchange-code
11. exchange-code calls auth's /api/oauth/token
12. Token exchange might fail (context already used / redirect_uri mismatch)
13. OR: exchange-code returns 302 redirect (can't be handled by fetch)
14. OR: exchange-code succeeds, but Processing calls res.json() TWICE → THROWS
15. Processing catch → redirects to /auth/signin
16. GOTO STEP 6 → INFINITE LOOP
```

---

## 5. Critical Bugs

### BUG-001: Double `res.json()` in App Processing Component

- **File**: `apps/app/src/components/auth/Processing/index.tsx:32-44`
- **Impact**: Exchange code always fails even on success
- **Severity**: 🔴 CRITICAL — Primary loop cause
- **Fix**: Remove the console.log that consumes the stream, or clone/store result

### BUG-002: Double `res.json()` in App Root Page

- **File**: `apps/app/src/app/page.tsx:21-28`
- **Impact**: Role-based routing always fails
- **Severity**: 🔴 CRITICAL — Primary loop cause
- **Fix**: Remove the console.log that consumes the stream, or store result

### BUG-003: Missing `return` on `refiredtToAuthSignin()` calls in proxy.ts

- **File**: `apps/app/src/proxy.ts:109, 136, 149, 164`
- **Impact**: Unauthenticated users reach protected pages, middleware is ineffective
- **Severity**: 🔴 CRITICAL — Auth guard completely broken
- **Fix**: Add `return` before each `refiredtToAuthSignin()` call

### BUG-004: `NextResponse.redirect()` from POST fetch endpoint

- **File**: `apps/app/src/app/api/auth/exchange-code/route.ts:88`
- **File**: `apps/web/src/app/api/auth/exchange-code/route.ts:110`
- **File**: `apps/blog/src/app/api/auth/exchange-code/route.ts:87`
- **Impact**: fetch() POST can't handle 302 redirects properly; the Processing component receives a redirect response, not JSON
- **Severity**: 🔴 CRITICAL — Makes error handling in Processing unpredictable
- **Fix**: Return JSON error response instead of redirect; let the client-side handle navigation

### BUG-005: OAuth Context Lookup by clientId Returns Wrong Context

- **File**: `apps/auth/src/app/oauth/authorize/route.ts:89`
- **Impact**: If multiple OAuth contexts exist for the same client_id (e.g., user retries login), the GSI5 query may return any of them. Used contexts are filtered, but expired ones or race conditions can cause issues.
- **Severity**: 🔴 CRITICAL
- **Fix**: Always create a fresh context per authorize request; don't reuse existing

### BUG-006: `redirect_uri` validation disabled in token endpoint

- **File**: `apps/auth/src/app/api/oauth/token/route.ts:154-162`
- **Impact**: The redirect_uri check is commented out. This means any registered redirect_uri works for any auth code, breaking OAuth 2.0 security.
- **Severity**: 🔴 CRITICAL (security)
- **Fix**: Re-enable redirect_uri validation

---

## 6. Moderate Bugs

### BUG-007: `validateAuthSession` checks wrong cookie name

- **File**: `apps/auth/src/lib/server-utils.ts:10`
- **Impact**: Checks `session_tokens` but auth app uses `idp_session_tokens`. This function is used by signin/signup/forgot-password pages to redirect authenticated users, but it never detects them as authenticated.
- **Severity**: 🟡 MODERATE
- **Fix**: Check `idp_session_tokens` instead of `session_tokens`

### BUG-008: `getLogoutRedirectUri()` hardcodes `auth.cosmediate.com`

- **File**: `packages/auth/src/lib/utils.ts:17`
- **Impact**: Only works for `.com` TLD. Users on `.nl`, `.de`, `.fr` etc. will get redirected to wrong domain on logout.
- **Severity**: 🟡 MODERATE
- **Fix**: Derive auth domain from current hostname dynamically

### BUG-009: `getBlogAppUrl()` returns wrong fallback

- **File**: `packages/auth/src/lib/utils.ts:97`
- **Impact**: Falls back to `http://localhost:3002` (auth port) instead of `http://localhost:3001` (blog port)
- **Severity**: 🟡 MODERATE
- **Fix**: Return `http://localhost:3001`

### BUG-010: App logout sends `redirectUri` but auth logout expects `redirect_uri`

- **File**: `apps/app/src/app/api/auth/logout/route.ts:65` sends `{ redirectUri, accessToken }`
- **File**: `apps/auth/src/app/api/logout/route.ts:27` expects `{ redirect_uri }`
- **Impact**: Auth app always gets `undefined` redirectUri, logout may not redirect properly
- **Severity**: 🟡 MODERATE
- **Fix**: Use consistent field naming

### BUG-011: Web logout sends `redirect_uri` but app logout sends `redirectUri`

- **File**: `apps/web/src/app/api/auth/logout/route.ts:67` sends `{ redirect_uri: redirectUri }`
- **File**: `apps/app/src/app/api/auth/logout/route.ts:65` sends `{ redirectUri, accessToken }`
- **Impact**: Inconsistent behavior between apps
- **Severity**: 🟡 MODERATE

### BUG-012: `constructRedirectUri` has broken domain logic

- **File**: `packages/auth/src/lib/utils.ts:53-66`
- **Impact**: For `app.cosmediate.com` (3 parts), `hasSubdomain` is true, so it uses the full hostname as-is. But the auth app is on `auth.cosmediate.com`, not `app.cosmediate.com`. The function doesn't replace the subdomain — it just uses the current hostname.
- **Severity**: 🟡 MODERATE
- **Fix**: Use `tldts` to properly extract root domain and construct auth subdomain

### BUG-013: `useSilentAuth` retries 10 times with 800ms delay on failure

- **File**: `packages/auth/src/hooks/useSilentAuth.ts:13-14`
- **Impact**: If session check fails (e.g., no cookies), user waits up to 8 seconds before seeing "not authenticated". This is terrible UX.
- **Severity**: 🟡 MODERATE
- **Fix**: Only retry on network errors, not on "not authenticated" responses. A 200 with `authenticated: false` should not trigger retries.

### BUG-014: Web Processing component silently swallows errors

- **File**: `apps/web/src/features/auth_temp/processing_temp/index.tsx:59-61`
- **Impact**: Error handling code is commented out. If exchange fails, user sees infinite loading spinner.
- **Severity**: 🟡 MODERATE
- **Fix**: Re-enable error handling redirect to signin

### BUG-015: `expiresAt` stored differently in different places

- **File**: `apps/auth/src/lib/oauth-context-store.ts:72` — stored as Unix seconds
- **File**: `apps/auth/src/app/oauth/authorize/route.ts:168` — compared using `DateTime.utc().toSeconds()`
- **File**: `apps/app/src/proxy.ts:116` — compared using `Math.floor(Date.now() / 1000)`
- **Impact**: Different precision/timezone handling could cause premature or delayed expiry detection
- **Severity**: 🟡 MODERATE

---

## 7. Design & Architecture Issues

### ARCH-001: Massive Code Duplication

The following are **nearly identical** across web, app, and blog:

- `exchange-code/route.ts` — ~90% identical across 3 apps
- `get-session/route.ts` — ~95% identical across 3 apps
- `logout/route.ts` — ~85% identical across 3 apps
- `auth/signin/route.ts` — ~90% identical across 3 apps
- `Processing/index.tsx` — ~90% identical across 3 apps
- `proxy.ts` — ~80% identical across 4 apps
- `lib/routing/utils.ts` — 100% identical across 3 apps
- `lib/server/utils.ts` — ~95% identical across 4 apps
- `lib/server/config.ts` — 100% identical across all apps

**Impact**: Bug fixes need to be applied to 3-4 files. Any divergence (as we see with the inconsistent logout body field names) creates bugs.

**Fix**: Extract into `packages/auth` or a new `packages/auth-bff` package.

### ARCH-002: No Token Refresh Mechanism

- Access tokens expire (there's an `expiresAt` field)
- There's a `refreshTokenExpiresAt` field but no actual refresh token stored
- No refresh flow exists anywhere in the code
- When token expires, user is just kicked to signin

**Impact**: Users are randomly logged out when tokens expire.

### ARCH-003: OAuth Context Stored in DynamoDB Per Request

- Every `/oauth/authorize` call either reuses or creates an OAuth context in DynamoDB
- There's no cleanup of expired/used contexts
- The TTL is 10 minutes but DynamoDB TTL is eventual (can take up to 48 hours to actually delete)
- No DynamoDB TTL attribute is configured (the field is `expiresAt` as a number, but DynamoDB TTL needs to be enabled on the table)

**Impact**: Table grows unbounded with stale contexts.

### ARCH-004: Cross-Domain Session Sharing is NOT Implemented

- Each app has its own cookies on its own domain
- Auth app cookies are on `auth.cosmediate.com`
- App cookies are on `app.cosmediate.com`
- Web cookies are on `cosmediate.com`
- **These are all different domains — cookies are NOT shared**
- The SSO "fast path" in `/oauth/authorize` only works because the IdP cookies are on the auth domain, so when a second client app redirects there, the auth app can see its own cookies
- But there's NO cross-app session synchronization. Logging out of one app does NOT log out of others.

**Impact**: "Login once, logged in everywhere" only works via SSO redirect. "Logout once, logged out everywhere" does NOT work at all.

### ARCH-005: No CSRF Protection

- No `state` parameter in the OAuth flow (required by OAuth 2.0 spec)
- No PKCE (Proof Key for Code Exchange)
- Auth codes are simple random strings, not cryptographically secure

**Impact**: Vulnerable to CSRF and authorization code injection attacks.

### ARCH-006: Mixing BFF and OAuth Server in One App

The auth app serves dual roles:

1. OAuth 2.0 Authorization Server (authorize, token endpoints)
2. User-facing UI + API (signin, signup, forgot-password pages)

This makes the flow confusing and creates cookie conflicts.

### ARCH-007: Social Login Flow is Separate and Disconnected

- Social login (Google) goes through Cognito Hosted UI → redirects to auth app's `/processing` page
- This flow is completely separate from the OAuth flow
- The auth code from Cognito is exchanged in the auth app's `/processing` page using `handleSignin({ code })`
- But this doesn't set up the OAuth context for client apps
- After social login on the auth app, there's no redirect back to the original client app

**Impact**: Social login doesn't work in the cross-app SSO context.

---

## 8. Code Quality Issues

### QA-001: Typo in function name

- **File**: `apps/app/src/proxy.ts:8`
- `refiredtToAuthSignin` should be `redirectToAuthSignin`

### QA-002: Excessive console.log statements

- Dozens of `console.log` statements with sensitive data (tokens, secrets, session data)
- `console.log("==> IDP SESSION TOKENS", idpSessionTokens)` — logs actual tokens
- Production builds will log this to server logs

### QA-003: Commented-out code everywhere

- Major blocks of commented-out code in:
  - `apps/app/src/app/api/auth/exchange-code/route.ts` (lines 73-96)
  - `apps/app/src/app/api/auth/set-password/route.ts` (lines 111-137)
  - `apps/app/src/app/api/auth/update-password/route.ts` (lines 115-142)
  - `apps/web/src/app/api/auth/exchange-code/route.ts` (lines 56-68, 95-118)
  - `apps/web/src/features/auth_temp/processing_temp/index.tsx` (lines 59-61)
  - `packages/auth/src/context/AuthProvider.tsx` (lines 114-120)
  - `packages/auth/src/lib/utils.ts` (lines 79-84)

### QA-004: Inconsistent error handling patterns

- Some routes return `{ success: false, error: "..." }`
- Some routes return `{ error: "..." }` without `success`
- Some routes return `{ authenticated: false }` (no error field)
- Some routes redirect on error (mixing JSON API and redirect patterns)

### QA-005: `throw new Error(error as string)` anti-pattern

- **File**: `packages/auth/src/hooks/useSignIn.ts:90`
- **File**: `packages/auth/src/hooks/useSocialAccountsSignin.ts:33`
- Casting an Error object to string produces `[object Object]`

### QA-006: Feature directory naming inconsistency

- Web app: `features/auth_temp/processing_temp/` — has `_temp` suffix
- Blog app: `features/auth/Processing/` — proper naming
- Auth app: `features/AuthProcessing/` — PascalCase
- App dashboard: `components/auth/Processing/` — in components, not features

### QA-007: Environment variable comment typo

- `apps/app/.env.local:20` and `apps/web/.env.local:13`: `# IDP BFF Variabls` (missing 'e')

---

## 9. Security Vulnerabilities

### SEC-001: AWS Credentials in .env files

- **File**: `apps/auth/.env.local:18-19`
- `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` are in the `.env.local` file
- These are IAM credentials that should be managed via IAM roles or environment injection, not committed to files

### SEC-002: Client secrets in .env files

- `AUTH_CLIENT_SECRET` in web, app, blog .env files
- These should be injected via deployment environment, not stored in repo files
- Note: .env.local is gitignored, so this is OK for local dev. But .env.development and .env.production are NOT gitignored and contain sensitive values.

### SEC-003: Google API keys and reCAPTCHA secret in .env.local

- **File**: `apps/web/.env.local:19-25`
- `NEXT_PUBLIC_GOOGLE_RECAPTCHA_SECRET_KEY` is a SECRET key exposed as `NEXT_PUBLIC_` — this is sent to the browser!
- reCAPTCHA secret key should NEVER be public

### SEC-004: No auth code one-time-use enforcement

- **File**: `apps/auth/src/lib/oauth-context-store.ts:157-162`
- The `used` check exists in `getOAuthContext`, but there's a race condition: between reading and updating, the same code can be exchanged twice
- No atomic "check-and-mark-used" operation

### SEC-005: No `HttpOnly` enforcement consistency

- Auth app cookies are set with `httpOnly: true` — good
- Client app cookies are set with `httpOnly: true` — good
- `secure` flag is only set when `NODE_ENV === "production"`, but `NODE_ENV=production` is set in `.env.development` too (line 1 of most .env.development files)

### SEC-006: `NODE_ENV=production` in `.env.development`

- **File**: `apps/app/.env.development:1`, `apps/auth/.env.development:1`, etc.
- All `.env.development` files set `NODE_ENV=production`
- This means development deployments think they're production
- Cookie `secure` flag will be true, but if using HTTP → cookies won't be set

---

## 10. Naming & Consistency Issues

### Cookie Names

| Auth App (IdP)       | Client Apps (web/app/blog) |
| -------------------- | -------------------------- |
| `idp_session_tokens` | `session_tokens`           |
| `idp_session_user`   | `session_user`             |
| `idp_session_id`     | `session_id`               |
| `auth_context_id`    | —                          |
| `client_auth_ctx`    | —                          |

The prefix inconsistency is fine (different domains), but the different naming makes debugging confusing.

### Environment Variable Names

- `AUTH_REDIRECT_PATH` — Used by client apps (web, app, blog)
- `AUTH_PROVIDER_URL` — Client apps: URL of the auth IdP
- `AUTH_SELF_URL` — Auth IdP app: its own public URL (replaces overloaded `AUTH_BASE_URL`)
- `AUTH_APP_TOKEN_ENDPOINT` — Optional override; default `/api/auth/token` in `@cosmediate/config`
- `AUTH_APP_LOGOUT_ENDPOINT` — Optional; default `/api/auth/logout`
- `AUTH_APP_AUTHORIZE_ENDPOINT` — Optional; default `/oauth/authorize`
- `AUTH_APP_REFRESH_ENDPOINT` — Optional; default `/api/auth/refresh`
- `AUTH_CLIENT_ID` / `AUTH_CLIENT_SECRET` — Used by client apps

### Route Path Inconsistency

| Auth App                  | Purpose            | Convention Violation       |
| ------------------------- | ------------------ | -------------------------- |
| `/api/signin`             | Signin API         | Not under `/api/auth/`     |
| `/api/signup`             | Signup API         | Not under `/api/auth/`     |
| `/api/logout`             | Logout API         | Not under `/api/auth/`     |
| `/api/auth/clear-session` | Clear session      | Under `/api/auth/` ✓       |
| `/api/auth/get-session`   | Get session        | Under `/api/auth/` ✓       |
| `/api/oauth/token`        | Token exchange     | Under `/api/oauth/`        |
| `/oauth/authorize`        | Authorize          | Not API route (page route) |
| `/oauth/clear-session`    | Clear session page | Not API route (page route) |

There's mixing of `/api/auth/`, `/api/oauth/`, `/api/`, and `/oauth/` conventions.

### Body Field Names

| App → Auth Logout | Field Name                                   |
| ----------------- | -------------------------------------------- |
| App dashboard     | `{ redirectUri, accessToken }` (camelCase)   |
| Web app           | `{ redirect_uri: redirectUri }` (snake_case) |
| Blog app          | `{ redirect_uri: redirectUri }` (snake_case) |
| Auth app expects  | `{ redirect_uri }` (snake_case)              |

---

## 11. Scalability Blockers

### SCALE-001: Hardcoded TLD Lists

- **Files**: `apps/*/src/lib/server/config.ts`, `redirectUri.ts`
- Adding a new TLD requires updating:
  1. `ALLOWED_ORIGINS` in 4 config files (auth, app, web, blog)
  2. `ALLOWED_REDIRECT_URIS` in the backend DynamoDB
  3. DNS and deployment configs
- Each TLD requires ~8-12 new entries across files
- **Fix**: Generate allowed origins dynamically from a config or check domain suffix pattern

### SCALE-002: Hardcoded `auth.cosmediate.com` in packages/auth

- **File**: `packages/auth/src/lib/utils.ts:17`
- Logout redirect is hardcoded to `cosmediate.com` TLD
- Won't work for other TLDs

### SCALE-003: Social Login Only Works on Auth App

- Google login redirects to Cognito, which redirects back to `localhost:3002/processing`
- This processing page is on the auth app only
- After Cognito auth, there's no mechanism to redirect back to the original client app
- Adding Facebook/Apple login requires duplicating the same broken pattern

### SCALE-004: No Staging Environment Support

- Env files only have `development`, `local`, and `production`
- URL patterns only handle `dev.` prefix and production (no `staging.` prefix)
- `isDev` check in proxy.ts only checks `hostname.startsWith("dev.")`

### SCALE-005: Each New Client App Requires Full BFF Implementation

- Adding a new client app means copying:
  - `exchange-code/route.ts`
  - `get-session/route.ts`
  - `logout/route.ts`
  - `auth/signin/route.ts`
  - `auth/processing/page.tsx`
  - Processing component
  - `proxy.ts`
  - `lib/routing/utils.ts`
  - `lib/server/utils.ts`
  - `lib/server/config.ts`
  - Environment variables

---

## 12. Flow Diagrams

### Current Login Flow (With Bugs Annotated)

```
┌──────────┐        ┌──────────┐        ┌──────────┐
│  BROWSER │        │ APP(3003)│        │AUTH(3002) │
└────┬─────┘        └────┬─────┘        └────┬─────┘
     │                   │                    │
     │ GET /             │                    │
     ├──────────────────►│                    │
     │                   │                    │
     │  proxy.ts runs    │                    │
     │  no session_tokens│                    │
     │  ❌ BUG-003:      │                    │
     │  refiredtToAuth   │                    │
     │  NOT returned     │                    │
     │  ◄─falls through──│                    │
     │                   │                    │
     │  page.tsx loads   │                    │
     │  fetch /api/user/ │                    │
     │  default-route    │                    │
     │──────────────────►│                    │
     │                   │ no cookies → 200   │
     │  ❌ BUG-002:     │ {authenticated:false}│
     │  res.json() x2   │◄───────────────────│
     │  THROWS!         │                    │
     │                   │                    │
     │  catch → push     │                    │
     │  /auth/signin     │                    │
     │──────────────────►│                    │
     │                   │                    │
     │  GET /auth/signin │                    │
     │  (route handler)  │                    │
     │                   │  302 to /oauth/    │
     │                   │  authorize?...     │
     │  ◄────────────────┤───────────────────►│
     │                   │                    │
     │                   │   /oauth/authorize │
     │                   │   Store context    │
     │                   │   No IdP session   │
     │  302 to /signin   │                    │
     │  ◄────────────────┤◄───────────────────│
     │                   │                    │
     │  User sees signin │                    │
     │  form on auth app │                    │
     │  Enters creds     │                    │
     │───────────────────┤───────────────────►│
     │                   │   POST /api/signin │
     │                   │   → backend verify │
     │                   │   → store session  │
     │                   │   → return redirect│
     │  ◄────────────────┤◄───────────────────│
     │                   │                    │
     │  window.location  │                    │
     │  = redirect_uri   │                    │
     │  + ?code=xxx      │                    │
     │──────────────────►│                    │
     │                   │                    │
     │  /auth/processing │                    │
     │  page loads       │                    │
     │  fetch POST       │                    │
     │  /api/auth/       │                    │
     │  exchange-code    │                    │
     │──────────────────►│                    │
     │                   │  POST /api/oauth/  │
     │                   │  token to auth app │
     │                   │───────────────────►│
     │                   │                    │
     │                   │ ❌ BUG-005:        │
     │                   │ context may be used│
     │                   │ or 400 error       │
     │                   │◄───────────────────│
     │                   │                    │
     │  ❌ BUG-004:      │                    │
     │  302 redirect from│                    │
     │  POST endpoint    │                    │
     │  OR               │                    │
     │  ❌ BUG-001:      │                    │
     │  res.json() x2    │                    │
     │  THROWS!          │                    │
     │  ◄────────────────│                    │
     │                   │                    │
     │  catch → redirect │                    │
     │  to /auth/signin  │                    │
     │  ═══ LOOP ═══════►│                    │
     ▼                   ▼                    ▼
```

### Intended Correct Flow

```
┌──────────┐        ┌──────────┐        ┌──────────┐
│  BROWSER │        │ APP(3003)│        │AUTH(3002) │
└────┬─────┘        └────┬─────┘        └────┬─────┘
     │ GET /             │                    │
     ├──────────────────►│                    │
     │                   │                    │
     │  proxy.ts:        │                    │
     │  no session       │                    │
     │  RETURN redirect  │                    │
     │  to /auth/signin  │                    │
     │  ◄────────────────│                    │
     │                   │                    │
     │  /auth/signin     │                    │
     │  builds authorize │                    │
     │  URL, 302         │                    │
     │  ◄────────────────│                    │
     │                   │                    │
     │  /oauth/authorize │                    │
     │──────────────────────────────────────►│
     │                   │  fresh context     │
     │                   │  302 to /signin    │
     │  ◄──────────────────────────────────── │
     │                   │                    │
     │  User signs in    │                    │
     │──────────────────────────────────────►│
     │                   │  tokens + redirect │
     │  ◄──────────────────────────────────── │
     │                   │                    │
     │  /auth/processing?code=xxx            │
     │──────────────────►│                    │
     │                   │  POST /api/oauth/  │
     │                   │  token             │
     │                   │───────────────────►│
     │                   │  session data      │
     │                   │◄───────────────────│
     │                   │                    │
     │  200 JSON:        │                    │
     │  {success, redir} │                    │
     │  + Set-Cookie     │                    │
     │  ◄────────────────│                    │
     │                   │                    │
     │  window.location  │                    │
     │  = /clinic-mgmt   │                    │
     │──────────────────►│                    │
     │                   │                    │
     │  proxy.ts:        │                    │
     │  has session ✓    │                    │
     │  page loads ✓     │                    │
     │  ◄────────────────│                    │
     ▼                   ▼                    ▼
```

### Logout Flow (Current Issues)

```
CLIENT APP                      AUTH APP
     │                              │
     │  AuthProvider.handleLogout() │
     │  POST /api/auth/logout       │
     │  { accessToken, redirectUri }│
     │──────────────────────────────│
     │                              │
     │  App's logout route:         │
     │  POST to auth /api/logout    │
     │  ❌ BUG-010: wrong field name│
     │──────────────────────────────►
     │                              │
     │  Auth clears IdP cookies     │
     │  Returns logoutUrl           │
     │  ◄──────────────────────────│
     │                              │
     │  App clears session_* cookies│
     │  Returns logoutUrl to client │
     │  ◄──────────────────────────│
     │                              │
     │  window.location.href =      │
     │  logoutUrl (clear-session)   │
     │                              │
     │  ❌ ISSUE: Other apps still  │
     │  have valid session cookies! │
     │  No cross-app logout!        │
     ▼                              ▼
```

---

## 13. Recommended Fix Priority

### Phase 1: Stop the Loop (IMMEDIATE)

| #   | Fix                                                         | Files                                                      |
| --- | ----------------------------------------------------------- | ---------------------------------------------------------- |
| 1   | Remove double `res.json()` in Processing component          | `apps/app/src/components/auth/Processing/index.tsx`        |
| 2   | Remove double `res.json()` in root page                     | `apps/app/src/app/page.tsx`                                |
| 3   | Add `return` to all `refiredtToAuthSignin()` calls          | `apps/app/src/proxy.ts`                                    |
| 4   | Return JSON errors instead of redirects from POST endpoints | `apps/*/src/app/api/auth/exchange-code/route.ts` (3 files) |

### Phase 2: Fix Remaining Bugs (THIS WEEK)

| #   | Fix                                                 | Ref              |
| --- | --------------------------------------------------- | ---------------- |
| 5   | Fix OAuth context reuse — always create fresh       | BUG-005          |
| 6   | Re-enable redirect_uri validation in token endpoint | BUG-006          |
| 7   | Fix `validateAuthSession` cookie name               | BUG-007          |
| 8   | Fix logout body field name inconsistency            | BUG-010, BUG-011 |
| 9   | Fix `getLogoutRedirectUri` to support all TLDs      | BUG-008          |
| 10  | Fix `getBlogAppUrl` fallback port                   | BUG-009          |
| 11  | Fix `constructRedirectUri` domain logic             | BUG-012          |
| 12  | Re-enable error handling in web Processing          | BUG-014          |

### Phase 3: Architecture Improvements (NEXT SPRINT)

| #   | Fix                                          | Ref      |
| --- | -------------------------------------------- | -------- |
| 13  | Extract shared BFF routes into a package     | ARCH-001 |
| 14  | Implement token refresh flow                 | ARCH-002 |
| 15  | Add `state` parameter and PKCE to OAuth flow | ARCH-005 |
| 16  | Implement proper cross-app logout            | ARCH-004 |
| 17  | Connect social login to OAuth flow           | ARCH-007 |
| 18  | Remove sensitive console.logs                | QA-002   |
| 19  | Clean up commented-out code                  | QA-003   |
| 20  | Fix NODE_ENV in .env.development files       | SEC-006  |

### Phase 4: Scalability (FUTURE)

| #   | Fix                                                | Ref       |
| --- | -------------------------------------------------- | --------- |
| 21  | Dynamic TLD/origin generation                      | SCALE-001 |
| 22  | Add staging environment support                    | SCALE-004 |
| 23  | DynamoDB TTL for OAuth contexts                    | ARCH-003  |
| 24  | Implement centralized cross-domain session sharing | ARCH-004  |

---

## Quick Reference: Environment Variables

### Client Apps (web, app, blog) — BFF Variables

| Variable                      | Purpose                       | Example (local)         |
| ----------------------------- | ----------------------------- | ----------------------- |
| `AUTH_REDIRECT_PATH`          | Path for OAuth callback       | `/auth/processing`      |
| `AUTH_PROVIDER_URL`           | Auth IdP origin               | `http://localhost:3002` |
| `AUTH_CLIENT_ID`              | OAuth client ID               | `app_local_QWi...`      |
| `AUTH_CLIENT_SECRET`          | OAuth client secret           | `secret_Fiw5...`        |
| `AUTH_APP_TOKEN_ENDPOINT`     | IdP token path (optional)     | `/api/auth/token`       |
| `AUTH_APP_LOGOUT_ENDPOINT`    | IdP logout path (optional)    | `/api/auth/logout`      |
| `AUTH_APP_AUTHORIZE_ENDPOINT` | IdP authorize path (optional) | `/oauth/authorize`      |
| `AUTH_APP_REFRESH_ENDPOINT`   | IdP refresh path (optional)   | `/api/auth/refresh`     |

### Auth App — IdP Variables

| Variable                     | Purpose                   | Example (local)                    |
| ---------------------------- | ------------------------- | ---------------------------------- |
| `AUTH_SELF_URL`              | Auth app public URL       | `http://localhost:3002`            |
| `DYNAMODB_AUTH_TABLE_NAME`   | Auth context table        | `cosmediate_auth_dev`              |
| `DYNAMODB_CLIENT_TABLE_NAME` | Client registration table | `cosmediate_clients_dev`           |
| `AWS_REGION`                 | AWS region                | `eu-central-1`                     |
| `AWS_ACCESS_KEY_ID`          | DynamoDB access           | `AKIA...`                          |
| `AWS_SECRET_ACCESS_KEY`      | DynamoDB secret           | `qlMX...`                          |
| `COGNITO_OAUTH_REDIRECT_URI` | Cognito callback          | `http://localhost:3002/processing` |

### Shared (All Apps)

| Variable                                 | Purpose                     |
| ---------------------------------------- | --------------------------- |
| `NEXT_PUBLIC_BACKEND_URL`                | Lambda API Gateway base URL |
| `NEXT_PUBLIC_COGNITO_APP_CLIENT_ID`      | Cognito app client ID       |
| `NEXT_PUBLIC_COGNITO_DOMAIN`             | Cognito hosted UI domain    |
| `NEXT_PUBLIC_COGNITO_OAUTH_PATH`         | Cognito OAuth path          |
| `NEXT_PUBLIC_COGNITO_OAUTH_REDIRECT_URI` | Cognito redirect URI        |

---

_End of analysis. All bugs, issues, and improvements documented above._
