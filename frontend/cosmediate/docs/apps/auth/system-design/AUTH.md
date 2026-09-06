# Authentication System Architecture

**Version:** 1.0.0  
**Last Updated:** December 11, 2024  
**Status:** Production Ready

---

## 📋 Overview

Cosmediate implements a sophisticated **OAuth 2.0-based authentication system** with a dedicated Identity Provider (IdP) and seamless multi-app integration. The system supports native email/password authentication, social login (Google), account linking, and provides enterprise-grade session management across multiple service provider (SP) applications.

### Core Components

- **Identity Provider (IdP)**: `apps/auth` - Centralized authentication server
- **Auth Package**: `packages/auth` - Shared authentication hooks and utilities
- **Service Providers (SPs)**: `apps/web`, `apps/app`, `apps/blog` - Consumer applications
- **Backend Integration**: AWS Cognito + DynamoDB for user management

---

## 🏗️ System Architecture

### Authentication Flow Pattern

```
┌──────────────────────────────────────────────────────────────┐
│                     OAuth 2.0 Flow                            │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  Service Provider (SP)        Identity Provider (IdP)        │
│  ┌─────────────┐              ┌─────────────────┐           │
│  │             │              │                 │           │
│  │  Web/App/   │──────────────▶  Auth App       │           │
│  │  Blog       │   Redirect   │  (auth.cosme    │           │
│  │             │              │   diate.com)    │           │
│  │             │              │                 │           │
│  │             │◀─────────────│  - Sign In      │           │
│  │             │  Auth Code   │  - Sign Up      │           │
│  │             │              │  - OAuth        │           │
│  │             │              │                 │           │
│  │             │──────────────▶                 │           │
│  │             │ Exchange Code│                 │           │
│  │             │◀─────────────│                 │           │
│  │             │  Session     │                 │           │
│  └─────────────┘              └─────────────────┘           │
│                                       │                      │
│                                       │                      │
│                                       ▼                      │
│                             ┌─────────────────┐             │
│                             │                 │             │
│                             │  AWS Cognito    │             │
│                             │  + DynamoDB     │             │
│                             │                 │             │
│                             └─────────────────┘             │
└──────────────────────────────────────────────────────────────┘
```

### Multi-TLD Architecture

**Challenge**: Cookies cannot be shared across different TLDs (e.g., `cosmediate.com` and `auth.cosmediate.com`)

**Solution**: OAuth context stored in DynamoDB with authorization codes

```typescript
// OAuth Context Storage (DynamoDB)
interface OAuthContext {
  authCode: string; // Authorization code (PK)
  client_id: string; // SP application ID
  redirect_uri: string; // Callback URL
  scope: string; // openid profile
  app_origin: string; // SP origin
  redirect_after_auth: string; // Final destination
  sessionData: {
    // Stored after signin
    sessionId: string;
    user: SessionUser;
    tokens: Tokens;
  };
  used: boolean; // One-time use flag
  ttl: number; // 10 minutes expiry
}
```

---

## 🔐 Authentication Features

### 1. Sign In Flow

#### 1.1 From Service Provider (SP)

**Scenario**: User clicks "Sign In" from any app (web, app, blog)

**Flow**:

1. **SP Initiates OAuth Flow**:

   ```typescript
   // Redirect to IdP authorize endpoint
   const authUrl = new URL("/oauth/authorize", AUTH_BASE_URL);
   authUrl.searchParams.set("client_id", CLIENT_ID);
   authUrl.searchParams.set("redirect_uri", REDIRECT_URI);
   authUrl.searchParams.set("scope", "openid profile");
   authUrl.searchParams.set("app_origin", window.location.origin);
   authUrl.searchParams.set("redirect_after_auth", currentPath);
   window.location.href = authUrl.toString();
   ```

2. **IdP Authorize Endpoint** (`/oauth/authorize`):
   - Validates `client_id`, `redirect_uri`, `scope`
   - Creates OAuth context and stores in DynamoDB
   - Checks for existing IdP session (**`cos_idp_*`** scalar cookies — see `@cosmediate/config` **`IDP_SESSION_COOKIE`**)

   **If session exists and valid**:
   - SSO Fast Path: Redirect back to SP immediately with auth code
   - Updates OAuth context with session data

   **If no session**:
   - Sets cookies: `client_auth_ctx`, `auth_context_id`
   - Redirects user to `/signin` page

3. **User Signs In** (`/signin`):
   - User enters email and password
   - Calls `/api/signin` endpoint
   - Backend validates with AWS Cognito
   - Creates IdP session cookies
   - Updates OAuth context with session data
   - Redirects to SP with auth code

4. **SP Exchanges Code for Session**:

   ```typescript
   // Calls /api/oauth/token with auth code
   const response = await fetch("/api/oauth/token", {
     method: "POST",
     body: JSON.stringify({
       grant_type: "authorization_code",
       code: authCode,
       redirect_uri: REDIRECT_URI,
       client_id: CLIENT_ID,
       client_secret: CLIENT_SECRET,
     }),
   });

   const session = await response.json();
   // session contains: sessionId, user, tokens
   ```

5. **SP Stores Session**:
   - Stores session in cookies/local storage
   - Redirects to `redirect_after_auth` or default route

#### 1.2 Direct Sign In (Landing on IdP)

**Scenario**: User directly navigates to `auth.cosmediate.com/signin`

**Flow**:

1. **Server-Side Validation** (`/signin/page.tsx`):

   ```typescript
   await validateAuthSession();
   // Checks if user already has IdP session
   // If yes, shows "Already signed in" message
   // If no, renders signin form
   ```

2. **After Signin**:
   - No OAuth context exists (user came directly)
   - IdP session created
   - Redirects to processing page
   - Shows message: "Signed in successfully. Return to your app."

#### 1.3 Sign In with Social Accounts (Google)

**Flow**:

1. **User Clicks "Sign in with Google"**:

   ```typescript
   // packages/auth/src/hooks/useSocialAccountsSignin.ts
   const handleSocialSignin = (provider: "Google") => {
     const authUrl = getAuthProviderUrl(provider);
     // Redirects to Cognito Hosted UI
     window.location.href = authUrl;
   };
   ```

2. **Google OAuth Callback**:
   - Cognito handles OAuth with Google
   - Returns to IdP callback URL with code
   - IdP exchanges code for Cognito tokens
   - Creates IdP session
   - Redirects back to SP (if OAuth context exists)

3. **Account Linking** (Backend):
   - If email matches existing account → Auto-link (PreSignUp Lambda)
   - If first time → Create new user with `linkedProviders: ["Google"]`
   - If OAuth-only user → `passwordSet: false`

---

### 2. Sign Up Flow

#### 2.1 Native Email/Password Sign Up

**Hook**: `useSignUp` (`packages/auth/src/hooks/useSignUp.ts`)

**Flow**:

1. **User Fills Sign Up Form**:

   ```typescript
   const { handleSignup, isProcessing } = useSignUp();

   await handleSignup(
     email,
     password,
     firstName,
     lastName,
     phone,
     city,
     age,
     country,
     state,
     postalCode
   );
   ```

2. **Validation**:
   - Email format validation
   - Password strength validation (min 8 chars, uppercase, lowercase, number, special char)

3. **API Call** (`/api/signup`):
   - Calls AWS Cognito SignUp
   - Creates user in DynamoDB
   - Sends verification email
   - Stores email in localStorage: `auth_new_signup_email`

4. **Response**:

   ```typescript
   {
     success: true,
     requiresVerification: true,
     email: "user@example.com",
     message: "Verification code sent to email"
   }
   ```

5. **Redirect to Confirmation**:
   - User redirected to `/confirm-signup`
   - Must verify email before signing in

#### 2.2 Email Verification

**Hook**: `useConfirmSignup` (`packages/auth/src/hooks/useConfirmSignup.ts`)

**Flow**:

1. **User Enters Verification Code**:

   ```typescript
   const { handleConfirmSignup, isProcessing } = useConfirmSignup();
   await handleConfirmSignup(email, code);
   ```

2. **API Call** (`/api/confirm-signup`):
   - Verifies code with Cognito
   - Updates user status to CONFIRMED
   - Auto-signs in user (creates IdP session)

3. **Post Verification**:
   - User now has active session
   - Redirected back to SP or shows success message

---

### 3. Password Management

#### 3.1 Forgot Password

**Hook**: `useForgotPassword` (`packages/auth/src/hooks/useForgotPassword.ts`)

**Flow**:

1. **User Requests Reset**:

   ```typescript
   const { handleForgotPassword, isProcessing } = useForgotPassword();
   await handleForgotPassword(email);
   ```

2. **API Call** (`/api/forgot-password`):
   - Checks if user has password (OAuth-only users rejected)
   - Sends reset code to email via Cognito

3. **Response**:

   ```typescript
   {
     success: true,
     message: "Reset code sent to email",
     email: "user@example.com"
   }
   ```

4. **Edge Case - OAuth Users**:
   ```typescript
   // If user signed up with Google only
   {
     success: false,
     message: "You signed up with Google. Please sign in with Google."
   }
   ```

#### 3.2 Reset Password

**Hook**: `useResetPassword` (`packages/auth/src/hooks/useResetPassword.ts`)

**Flow**:

1. **User Enters Code and New Password**:

   ```typescript
   const { handleResetPassword, isProcessing } = useResetPassword();
   await handleResetPassword(email, code, newPassword);
   ```

2. **API Call** (`/api/reset-password`):
   - Validates reset code
   - Updates password in Cognito
   - User can now sign in with new password

#### 3.3 Update Password (Authenticated)

**Hook**: `useUpdatePassword` (`packages/auth/src/hooks/useUpdatePassword.ts`)

**Flow**:

1. **User Changes Password from Settings**:

   ```typescript
   const { handleUpdatePassword, isProcessing } = useUpdatePassword();
   await handleUpdatePassword(currentPassword, newPassword);
   ```

2. **API Call** (`/api/update-password`):
   - Requires current password (verification)
   - Updates password in Cognito
   - Logs out all sessions (user must re-login)

#### 3.4 Set New Password (Admin Action)

**Hook**: `useSetNewPassword` (`packages/auth/src/hooks/useSetNewPassword.ts`)

**Use Case**: Admin-created accounts with temporary passwords

**Flow**:

1. **First-Time Login**:
   - User signs in with temp password
   - Cognito responds with `NEW_PASSWORD_REQUIRED` challenge

2. **User Sets Permanent Password**:

   ```typescript
   const { handleSetNewPassword, isProcessing } = useSetNewPassword();
   await handleSetNewPassword(email, tempPassword, newPassword);
   ```

3. **API Call** (`/api/set-password`):
   - Completes Cognito challenge
   - User now has permanent password

---

### 4. Session Management

#### 4.1 Silent Authentication

**Hook**: `useSilentAuth` (`packages/auth/src/hooks/useSilentAuth.ts`)

**Purpose**: Automatically check if user is authenticated on app load

**Flow**:

1. **On Component Mount**:

   ```typescript
   const {
     isSessionLoading,
     isAuthenticated,
     session,
     isAuthContextAvailable,
   } = useSilentAuth();
   ```

2. **Backend Check** (`/api/auth/get-session`):
   - Reads session from cookies/storage
   - Validates session expiry
   - Returns session data if valid

3. **Retry Mechanism**:
   - Max 10 retries with 800ms delay
   - Handles race conditions during initial load
   - Prevents flickering UI

4. **States**:
   - `isSessionLoading: true` → Checking session
   - `isSessionLoading: false, isAuthenticated: true` → User logged in
   - `isSessionLoading: false, isAuthenticated: false` → User logged out

#### 4.2 Auth Context Provider

**Component**: `AuthProvider` (`packages/auth/src/context/AuthProvider.tsx`)

**Purpose**: Centralized authentication state management

**Usage**:

```typescript
import { AuthProvider, useAuth } from "@cosmediate/auth";

// Wrap app with provider
<AuthProvider>{children}</AuthProvider>

// Use in components
const {
  sessionUser,
  userRole,
  session,
  isSessionLoading,
  isAuthenticated,
  handleLogout,
  handleSetSessionUser
} = useAuth();
```

**Features**:

- Automatically runs silent auth on mount
- Exposes session user, role, and tokens
- Provides logout functionality
- Handles session updates

#### 4.3 Logout Flow

**Hook**: `useAuth().handleLogout()`

**Flow**:

1. **User Clicks Logout**:

   ```typescript
   const { handleLogout } = useAuth();
   await handleLogout("/clear-session");
   ```

2. **API Call** (`/api/auth/logout`):
   - Calls Cognito global sign out
   - Clears IdP session cookies
   - Generates Cognito logout URL

3. **Redirect Flow**:

   ```
   SP → /api/auth/logout → Cognito Logout → /oauth/clear-session → SP
   ```

4. **Session Cleanup**:
   - All IdP cookies deleted
   - OAuth context marked as used
   - User must re-authenticate

---

### 5. Social Account Linking

**Hook**: `useSocialAccountsSignin` (`packages/auth/src/hooks/useSocialAccountsSignin.ts`)

**Scenarios**:

#### 5.1 Auto-Linking (Backend - PreSignUp Lambda)

**Case**: User signs up with Google, email already exists

**Flow**:

1. User has native account: `user@example.com`
2. User clicks "Sign in with Google" using same email
3. PreSignUp Lambda detects existing account
4. Calls `AdminLinkProviderForUser` API
5. Links Google provider to native account
6. User can now sign in with both methods
7. Database updated: `linkedProviders: ["Google"]`, `passwordSet: true`

#### 5.2 Manual Linking (Future Feature)

**Case**: User wants to link Google from settings

**Flow**:

1. User navigates to account settings
2. Clicks "Link Google Account"
3. Redirects to Google OAuth
4. Backend links accounts
5. User can sign in with either method

---

## 🎯 OAuth 2.0 Implementation

### OAuth Endpoints

#### 1. `/oauth/authorize` (Authorization Endpoint)

**Method**: GET  
**Purpose**: Initiate OAuth flow from SP

**Parameters**:

- `client_id`: SP application ID
- `redirect_uri`: Callback URL
- `scope`: `openid profile`
- `app_origin`: SP origin
- `redirect_after_auth`: Final destination path

**Response**:

- If session exists: Redirect to `redirect_uri` with `code`
- If no session: Redirect to `/signin` with cookies set

**Security**:

- Validates client_id against DynamoDB
- Validates redirect_uri against allowed list
- Enforces HTTPS in production

#### 2. `/api/oauth/token` (Token Endpoint)

**Method**: POST  
**Purpose**: Exchange auth code for session

**Request Body**:

```typescript
{
  grant_type: "authorization_code",
  code: "auth_code_from_authorize",
  redirect_uri: "https://app.cosmediate.com/auth/callback",
  client_id: "app_client_id",
  client_secret: "hashed_secret"
}
```

**Response**:

```typescript
{
  sessionId: "session_id",
  user: {
    userId: "user_id",
    email: "user@example.com",
    firstName: "John",
    lastName: "Doe",
    role: "user"
  },
  tokens: {
    accessToken: "...",
    refreshToken: "...",
    idToken: "...",
    expiresAt: 1234567890
  },
  redirectAfterAuth: "/dashboard"
}
```

**Security**:

- Validates client_secret using bcrypt
- One-time use of auth code
- 10-minute expiry on auth codes
- Verifies redirect_uri match

#### 3. `/oauth/clear-session` (Logout Callback)

**Method**: GET  
**Purpose**: Handle post-logout redirect from Cognito

**Flow**:

1. Cognito redirects here after global sign out
2. Clears any remaining cookies
3. Redirects to SP with logout confirmation

---

## 🔧 Auth Package Hooks

### Available Hooks

| Hook                      | Purpose                | File                               |
| ------------------------- | ---------------------- | ---------------------------------- |
| `useAuth`                 | Access auth context    | `hooks/useAuth.ts`                 |
| `useSignIn`               | Handle sign in         | `hooks/useSignIn.ts`               |
| `useSignUp`               | Handle sign up         | `hooks/useSignUp.ts`               |
| `useConfirmSignup`        | Verify email           | `hooks/useConfirmSignup.ts`        |
| `useForgotPassword`       | Request reset code     | `hooks/useForgotPassword.ts`       |
| `useResetPassword`        | Reset with code        | `hooks/useResetPassword.ts`        |
| `useUpdatePassword`       | Change password        | `hooks/useUpdatePassword.ts`       |
| `useSetNewPassword`       | Set permanent password | `hooks/useSetNewPassword.ts`       |
| `useSilentAuth`           | Auto-check session     | `hooks/useSilentAuth.ts`           |
| `useSocialAccountsSignin` | OAuth providers        | `hooks/useSocialAccountsSignin.ts` |

### Common Hook Pattern

```typescript
const { handleAction, isProcessing } = useHook();

// All hooks return:
// - handleAction: Async function to perform action
// - isProcessing: Loading state for UI feedback
```

---

## 🗄️ Database Integration

### User Data Structure (DynamoDB)

```typescript
interface User {
  PK: "USER#<userId>";
  SK: "PROFILE";
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  sub: string; // Cognito sub (always native sub)
  passwordSet: boolean; // Has password in Cognito
  linkedProviders: string[]; // ["Google", "Facebook"]
  defaultPasswordUsed: boolean; // Admin-created account
  emailVerified: boolean;
  status: "CONFIRMED" | "UNCONFIRMED" | "ARCHIVED";
  createdAt: string;
  updatedAt: string;
}
```

### OAuth Clients (DynamoDB)

```typescript
interface OAuthClient {
  PK: "OAUTH_CLIENT#<clientId>";
  SK: "CONFIG";
  clientId: string;
  hashedSecret: string; // bcrypt hashed
  redirectURIs: string[]; // Allowed callback URLs
  appName: string;
  appOrigin: string;
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
}
```

---

## 🔒 Security Measures

### 1. Password Security

- Min 8 characters
- Must contain: uppercase, lowercase, number, special char
- Stored securely in AWS Cognito (never in plain text)
- Bcrypt for client secrets

### 2. Session Security

- HTTP-only cookies for IdP sessions
- Secure flag in production (HTTPS only)
- SameSite=Lax to prevent CSRF
- 10-minute expiry for auth codes
- Refresh token rotation

### 3. OAuth Security

- Client secret validation
- Redirect URI whitelist
- One-time use auth codes
- PKCE flow (future enhancement)
- State parameter validation

### 4. CORS & Cross-Origin

- Strict CORS policies
- Credentials included for same-origin
- Multi-TLD support via DynamoDB (no cookie sharing)

---

## 🛠️ Utility Functions

### 1. `constructRedirectUri`

**File**: `packages/auth/src/lib/utils.ts`

**Purpose**: Build redirect URI with proper domain

```typescript
const redirectUri = constructRedirectUri("/dashboard");
// Returns: https://app.cosmediate.com/dashboard
```

### 2. `getRootDomain`

**Purpose**: Extract root domain from URL

```typescript
const domain = getRootDomain("https://app.cosmediate.com");
// Returns: cosmediate.com
```

### 3. `validateEmail` & `validatePassword`

**File**: `packages/auth/src/lib/auth.utils.ts`

**Purpose**: Client-side validation

```typescript
if (!validateEmail(email)) {
  throw new Error("Invalid email format");
}

if (!validatePassword(password)) {
  throw new Error("Password too weak");
}
```

---

## 📱 Service Provider (SP) Integration

### Setup in SP Apps

#### 1. Install Auth Package

```json
// package.json
{
  "dependencies": {
    "@cosmediate/auth": "workspace:*"
  }
}
```

#### 2. Wrap App with AuthProvider

```typescript
// app/layout.tsx or context/providers.tsx
import { AuthProvider } from "@cosmediate/auth";

export function Providers({ children }) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}
```

#### 3. Protect Routes (Middleware)

```typescript
// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const session = request.cookies.get("session");

  if (!session) {
    const authUrl = new URL("/oauth/authorize", process.env.AUTH_BASE_URL);
    authUrl.searchParams.set("client_id", process.env.CLIENT_ID!);
    authUrl.searchParams.set(
      "redirect_uri",
      `${request.nextUrl.origin}/auth/callback`
    );
    authUrl.searchParams.set("scope", "openid profile");
    authUrl.searchParams.set("redirect_after_auth", request.nextUrl.pathname);

    return NextResponse.redirect(authUrl);
  }

  return NextResponse.next();
}
```

#### 4. Handle OAuth Callback

```typescript
// app/auth/callback/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const redirectAfterAuth = req.nextUrl.searchParams.get("redirect_after_auth");

  if (!code) {
    return NextResponse.json({ error: "No code provided" }, { status: 400 });
  }

  // Exchange code for session
  const tokenResponse = await fetch(
    `${process.env.AUTH_BASE_URL}/api/oauth/token`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        grant_type: "authorization_code",
        code,
        redirect_uri: `${req.nextUrl.origin}/auth/callback`,
        client_id: process.env.CLIENT_ID!,
        client_secret: process.env.CLIENT_SECRET!,
      }),
    }
  );

  const session = await tokenResponse.json();

  // Store session (implementation varies)
  const response = NextResponse.redirect(redirectAfterAuth || "/");
  response.cookies.set("session", JSON.stringify(session), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  return response;
}
```

#### 5. Use Auth in Components

```typescript
"use client";

import { useAuth } from "@cosmediate/auth";

export function UserProfile() {
  const { sessionUser, isAuthenticated, isSessionLoading, handleLogout } = useAuth();

  if (isSessionLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return <div>Please sign in</div>;

  return (
    <div>
      <h1>Welcome, {sessionUser.firstName}!</h1>
      <p>Email: {sessionUser.email}</p>
      <p>Role: {sessionUser.role}</p>
      <button onClick={() => handleLogout()}>Logout</button>
    </div>
  );
}
```

---

## 🚀 Environment Configuration

### Identity Provider (Auth App)

```env
# Auth App (.env.local)
NEXT_PUBLIC_APP_NAME=auth
NEXT_PUBLIC_AUTH_BASE_URL=https://auth.cosmediate.com
AUTH_BASE_URL=https://auth.cosmediate.com

# AWS Cognito
COGNITO_USER_POOL_ID=us-east-1_xxxxx
COGNITO_CLIENT_ID=xxxxx
COGNITO_CLIENT_SECRET=xxxxx
COGNITO_DOMAIN=cosmediate-auth.auth.us-east-1.amazoncognito.com

# DynamoDB
DYNAMODB_TABLE_NAME=cosmediate-prod
AWS_REGION=us-east-1
```

### Service Provider (Web/App/Blog)

```env
# SP App (.env.local)
NEXT_PUBLIC_APP_NAME=web
NEXT_PUBLIC_AUTH_BASE_URL=https://auth.cosmediate.com

# OAuth Client Credentials
CLIENT_ID=web_client_id
CLIENT_SECRET=hashed_secret
REDIRECT_URI=https://cosmediate.com/auth/callback
```

---

## 🔄 Edge Cases & Error Handling

### 1. OAuth-Only Users Forgot Password

**Issue**: User signed up with Google, tries to use forgot password

**Solution**:

```typescript
// Backend checks passwordSet field
if (!user.passwordSet) {
  return {
    success: false,
    message: "You signed up with Google. Please sign in with Google instead.",
  };
}
```

### 2. Unconfirmed Email + OAuth Sign In

**Issue**: User signs up natively but doesn't verify email, then tries Google

**Solution**: PreSignUp Lambda blocks OAuth sign-in:

```typescript
if (existingUser.status === "UNCONFIRMED") {
  throw new Error("Please verify your email address first");
}
```

### 3. Expired Auth Code

**Issue**: User takes >10 minutes to complete OAuth flow

**Solution**:

```typescript
// Token endpoint validates TTL
if (Date.now() > oAuthContext.ttl) {
  return { error: "invalid_grant", message: "Authorization code expired" };
}
```

### 4. Session Expiry During Use

**Issue**: User's session expires while using app

**Solution**:

- Silent auth hook automatically detects expiry
- Redirects to sign-in with `redirect_after_auth` set
- Preserves user's current location

### 5. Multiple Browser Tabs

**Issue**: User signs out in one tab, other tabs still show as logged in

**Solution**:

- Use BroadcastChannel API (future enhancement)
- Current: Each tab checks session independently
- Failed API calls trigger re-auth

---

## 📊 Session Lifecycle

### Session States

```typescript
type SessionState =
  | "LOADING" // Checking session
  | "AUTHENTICATED" // Valid session
  | "UNAUTHENTICATED" // No session
  | "EXPIRED" // Session expired
  | "ERROR"; // Session error
```

### Session Refresh (Future Enhancement)

**Current**: Manual re-authentication required

**Planned**: Automatic refresh using refresh token

```typescript
// Future implementation
const refreshSession = async (refreshToken: string) => {
  const response = await fetch("/api/auth/refresh", {
    method: "POST",
    body: JSON.stringify({ refreshToken }),
  });

  const { accessToken, expiresAt } = await response.json();
  // Update session
};
```

---

## 🧪 Testing Authentication

### Manual Testing Checklist

- [ ] Sign up with email/password
- [ ] Verify email with code
- [ ] Sign in with email/password
- [ ] Sign in with Google
- [ ] Sign out
- [ ] Forgot password flow
- [ ] Reset password with code
- [ ] Update password from settings
- [ ] Sign in from different apps (web, app, blog)
- [ ] SSO between apps (sign in once, access all)
- [ ] Account linking (email + Google)
- [ ] Direct sign-in on auth app
- [ ] OAuth flow with invalid client_id
- [ ] OAuth flow with expired code
- [ ] Session expiry handling

---

## 📚 References

### Related Documentation

- [AWS Cognito Setup](../../../backend/docs/COGNITO_SETUP.md)
- [Auth Flow](../../../backend/docs/AUTH_FLOW.md)
- [Architecture Setup](../../ARCHITECTURE_SETUP.md)

### External Resources

- [OAuth 2.0 Specification](https://oauth.net/2/)
- [AWS Cognito Documentation](https://docs.aws.amazon.com/cognito/)
- [Next.js Authentication](https://nextjs.org/docs/authentication)

---

## 🔮 Future Enhancements

1. **PKCE Flow**: Add Proof Key for Code Exchange for mobile apps
2. **Refresh Token Rotation**: Automatic session refresh
3. **Multi-Factor Authentication**: SMS/Email OTP
4. **Biometric Authentication**: Face ID, Touch ID
5. **Account Deletion**: GDPR compliance
6. **Session Management Dashboard**: View/revoke active sessions
7. **Rate Limiting**: Prevent brute force attacks
8. **Passwordless Authentication**: Magic links
9. **Social Providers**: Facebook, Apple, Microsoft
10. **Session Synchronization**: BroadcastChannel for multi-tab sync
