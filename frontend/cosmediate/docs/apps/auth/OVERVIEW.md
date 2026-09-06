# Auth App Overview

**Application**: Identity Provider (IDP)  
**Domain**: `auth.cosmediate.com`  
**Purpose**: Centralized authentication server for Cosmediate ecosystem

---

## 📋 Description

The **Auth App** serves as the Identity Provider (IdP) for the entire Cosmediate platform. It implements a custom OAuth 2.0 authorization server that provides secure authentication and authorization services to all service provider (SP) applications (Web, App Dashboard, Blog).

### Key Responsibilities

- **User Authentication**: Handle sign-in, sign-up, and password management
- **OAuth 2.0 Server**: Provide authorization codes and tokens to SP applications
- **Session Management**: Maintain centralized user sessions across multiple apps
- **Social Authentication**: Integrate with Google, Facebook, and Apple OAuth providers
- **Account Linking**: Auto-link and manually link multiple auth providers
- **Security**: Enforce security policies, password requirements, and session controls

---

## 🏗️ Architecture

### Application Type

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS v4 + shadcn/ui
- **State Management**: React Context API
- **Backend Integration**: AWS Cognito + DynamoDB

### Core Features

#### 1. Authentication Pages

- **Sign In** (`/signin`): Email/password and social sign-in
- **Sign Up** (`/signup`): User registration with email verification
- **Confirm Sign Up** (`/confirm-signup`): Email verification
- **Forgot Password** (`/forgot-password`): Request password reset
- **Reset Password** (`/reset-password`): Reset password with code
- **Processing** (`/processing`): Post-auth processing and redirects

#### 2. OAuth Endpoints

- **Authorization** (`/oauth/authorize`): Initiate OAuth flow
- **Token Exchange** (`/api/oauth/token`): Exchange auth code for session
- **Clear Session** (`/oauth/clear-session`): Post-logout cleanup

#### 3. API Routes

- `/api/signin`: Authenticate user with Cognito
- `/api/signup`: Register new user
- `/api/confirm-signup`: Verify email
- `/api/forgot-password`: Send reset code
- `/api/reset-password`: Reset password
- `/api/update-password`: Change password (authenticated)
- `/api/set-password`: Set permanent password (first-time login)
- `/api/logout`: Global sign-out

---

## 🔐 Authentication Features

### Native Authentication

- Email/password sign-in and sign-up
- Email verification with 6-digit code
- Password strength validation
- Forgot/reset password flow
- Update password (requires current password)
- Set new password (admin-created accounts)

### Social Authentication

**Implemented:**

- ✅ Google OAuth integration
- ✅ Auto-account linking for matching emails
- ✅ Seamless user experience
- ✅ Fallback to native auth if social provider unavailable

**Upcoming (In Development):**

- 🚧 Facebook OAuth integration
- 🚧 Apple OAuth integration
- 🚧 Enhanced social sign-in hooks in `@cosmediate/auth` package

> **Note**: Facebook and Apple OAuth providers will be added soon. The auth package already includes hooks structure (`useSocialAccountsSignin`) used for Google auth, which will be extended to support Facebook and Apple.

### Session Management

- IdP session cookies (HTTP-only, secure)
- Cross-domain session support via OAuth
- Session expiry and refresh handling
- Global sign-out (revokes all sessions)

---

## 🎨 UI Components

### Shared Components

- **AuthUiTemplate**: Consistent layout for all auth pages
- **FieldContainer**: Form field wrapper with validation
- **SocialAccounts**: Social sign-in buttons (Google implemented, Facebook & Apple upcoming)

### Features

- Responsive design (mobile-first)
- Accessibility compliant (WCAG 2.1)
- Loading states and error handling
- Toast notifications for user feedback

---

## 🔄 OAuth Flow

### Service Provider Initiated

1. SP redirects to `/oauth/authorize` with client_id
2. Auth app checks for existing IdP session
3. If no session → redirect to `/signin`
4. User signs in → creates IdP session
5. Redirect back to SP with authorization code
6. SP exchanges code for session at `/api/oauth/token`

### Direct Access

1. User navigates directly to `auth.cosmediate.com/signin`
2. Signs in → creates IdP session
3. Shows success message (no SP to redirect to)
4. User returns to their app manually
5. App automatically authenticates via SSO

---

## 🗄️ Data Storage

### OAuth Context (DynamoDB)

- Authorization codes and associated metadata
- Client information and redirect URIs
- Session data for token exchange
- TTL: 10 minutes

### User Data (DynamoDB)

- User profiles and credentials
- Linked providers information
- Email verification status
- Password set flag

### OAuth Clients (DynamoDB)

- Registered SP applications
- Client secrets (bcrypt hashed)
- Allowed redirect URIs
- Application metadata

---

## 🛡️ Security

### Password Security

- Minimum 8 characters
- Must include: uppercase, lowercase, number, special character
- Stored securely in AWS Cognito
- Never stored in plain text

### Session Security

- HTTP-only cookies (prevents XSS)
- Secure flag in production (HTTPS only)
- SameSite=Lax (prevents CSRF)
- Session expiry enforcement

### OAuth Security

- Client secret validation (bcrypt)
- Redirect URI whitelist
- One-time use authorization codes
- 10-minute code expiry
- State parameter validation (future)

---

## 📦 Dependencies

### Core

- `next`: ^15.x
- `react`: ^19.x
- `typescript`: ^5.x

### UI

- `@cosmediate/ui`: Shared component library
- `tailwindcss`: ^4.x
- `lucide-react`: Icons

### Auth

- `@aws-sdk/client-cognito-identity-provider`: Cognito integration
- `@aws-sdk/client-dynamodb`: DynamoDB operations
- `bcryptjs`: Password hashing
- `luxon`: Date/time handling

---

## 🚀 Deployment

### Environment Variables

```env
NEXT_PUBLIC_APP_NAME=auth
NEXT_PUBLIC_AUTH_BASE_URL=https://auth.cosmediate.com
AUTH_BASE_URL=https://auth.cosmediate.com

COGNITO_USER_POOL_ID=us-east-1_xxxxx
COGNITO_CLIENT_ID=xxxxx
COGNITO_CLIENT_SECRET=xxxxx
COGNITO_DOMAIN=cosmediate-auth.auth.us-east-1.amazoncognito.com

DYNAMODB_TABLE_NAME=cosmediate-prod
AWS_REGION=us-east-1
```

### Build Configuration

- Standalone output for production
- Static page generation where possible
- API routes for dynamic authentication

---

## 🔮 Future Enhancements

### Immediate (In Development)

1. **Facebook OAuth**: Integration with Facebook Login
2. **Apple OAuth**: Sign in with Apple support
3. **Enhanced Auth Hooks**: Extend `@cosmediate/auth` package hooks for all providers

### Planned

1. **Multi-Factor Authentication**: SMS/Email OTP
2. **Additional Providers**: Microsoft, LinkedIn, GitHub
3. **Session Management**: View and revoke active sessions
4. **Rate Limiting**: Brute force protection
5. **Account Recovery**: Additional verification methods
6. **Audit Logging**: Track all auth events

---

## 📚 Related Documentation

- [Authentication System Architecture](./system-design/AUTH.MD)
- [Auth Package Documentation](../../packages/auth/README.md)
- [Backend Auth Setup](../../../../backend/docs/AUTH_FLOW.md)
