# OAuth Auto-Linking Flow

## Overview

OAuth providers (Google, Facebook, etc.) are automatically linked to existing native (email/password) accounts during the sign-up process, **before** the OAuth account is created in Cognito.

## Architecture

### Key Components

1. **PreSignUp Trigger** (`cosmediate-pre-auth-signup`) - Performs linking before account creation
2. **PreTokenGeneration Trigger** (`cosmediate-pre-auth-token-gen`) - Enriches tokens with user data
3. **Auth Service** (`lambdaLayer/nodejs/services/auth.mjs`) - Provides linking utilities
4. **Auth Controller** (`cosmediate-authentication/controllers/auth.mjs`) - Handles sign-in flow

## Flow Diagrams

### Scenario 1: OAuth Sign-In with Existing Native Account (Auto-Linking)

```
┌─────────────────────────────────────────────────────────────────┐
│ User clicks "Sign in with Google" (has existing native account) │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
                 ┌───────────────────────┐
                 │ PreSignUp Trigger     │
                 │ - Detect OAuth signup │
                 │ - Find native account │
                 └───────────┬───────────┘
                             │
                             ▼
              ┌──────────────────────────────┐
              │ AdminLinkProviderForUser API │
              │ - Link Google to native      │
              │ - Linking persists in Cognito│
              └──────────────┬───────────────┘
                             │
                             ▼
                 ┌───────────────────────┐
                 │ BLOCK OAuth Account   │
                 │ Creation (throw error)│
                 │ "Please sign in again"│
                 └───────────┬───────────┘
                             │
                             ▼
          ┌──────────────────────────────────┐
          │ User Redirected to Retry Sign-In │
          └──────────────┬───────────────────┘
                         │
                         ▼
          ┌────────────────────────────────┐
          │ Second OAuth Sign-In Attempt   │
          │ - Cognito recognizes linking   │
          │ - Authenticates as NATIVE user │
          │ - Tokens have NATIVE sub       │
          └────────────────┬───────────────┘
                           │
                           ▼
           ┌───────────────────────────────┐
           │ PreTokenGeneration Trigger    │
           │ - Finds user by native sub    │
           │ - Adds role, perms to tokens  │
           └───────────────┬───────────────┘
                           │
                           ▼
            ┌──────────────────────────────┐
            │ authSignIn Controller        │
            │ - Finds user by email        │
            │ - Updates linkedProviders    │
            │ - Stores session             │
            └──────────────┬───────────────┘
                           │
                           ▼
                  ┌────────────────┐
                  │ User Signed In │
                  │ (Native Account)│
                  └────────────────┘
```

### Scenario 2: OAuth Sign-In with No Existing Account (New User)

```
┌──────────────────────────────────────────────┐
│ User clicks "Sign in with Google" (new user) │
└────────────────────┬─────────────────────────┘
                     │
                     ▼
          ┌──────────────────────┐
          │ PreSignUp Trigger    │
          │ - No native account  │
          │ - ALLOW signup       │
          └──────────┬───────────┘
                     │
                     ▼
           ┌─────────────────────┐
           │ OAuth Account Created│
           │ in Cognito           │
           └──────────┬──────────┘
                      │
                      ▼
        ┌─────────────────────────────┐
        │ PreTokenGeneration Trigger  │
        │ - User not in DB yet        │
        │ - Use default role/perms    │
        └─────────────┬───────────────┘
                      │
                      ▼
         ┌────────────────────────────┐
         │ authSignIn Controller      │
         │ - No user in DB            │
         │ - CREATE new user          │
         │ - Store session            │
         └────────────┬───────────────┘
                      │
                      ▼
             ┌────────────────┐
             │ User Signed In │
             │ (New OAuth User)│
             └────────────────┘
```

### Scenario 3: Subsequent OAuth Sign-Ins (Linked Account)

```
┌────────────────────────────────────────────────┐
│ User clicks "Sign in with Google" (linked acc) │
└────────────────────┬───────────────────────────┘
                     │
                     ▼
          ┌──────────────────────────┐
          │ Cognito Authenticates    │
          │ - Recognizes linked      │
          │ - Authenticates as native│
          │ - Tokens have NATIVE sub │
          └──────────┬───────────────┘
                     │
                     ▼
        ┌─────────────────────────────┐
        │ PreTokenGeneration Trigger  │
        │ - Finds user by native sub  │
        │ - Adds role, perms to tokens│
        └─────────────┬───────────────┘
                      │
                      ▼
         ┌────────────────────────────┐
         │ authSignIn Controller      │
         │ - Finds user by email      │
         │ - Session stored           │
         └────────────┬───────────────┘
                      │
                      ▼
             ┌────────────────┐
             │ User Signed In │
             │ (Native Account)│
             └────────────────┘
```

## Key Features

### 1. Linking in PreSignUp Trigger

**Location:** `backend/modules/cosmediate-pre-auth-signup/index.mjs`

- Detects OAuth sign-up with existing native account
- Extracts provider info from event (username format: "Google_123456")
- Links provider using `AdminLinkProviderForUser` API
- **BLOCKS** OAuth account creation to force native account authentication
- Throws user-friendly error: "Your Google account has been linked. Please sign in again."

### 2. Provider Detection

**Location:** `backend/modules/cosmediate-authentication/controllers/auth.mjs`

```javascript
// After linking: username is native email (not "provider_id")
// Before linking: username is "google_123456", "facebook_789", etc.
const hasOAuthPattern = /^(google|facebook|apple|amazon|twitter)_/.test(
  username
);
const oauthProvider = hasOAuthPattern
  ? username.split("_")[0].toLowerCase()
  : "google"; // Default for linked accounts
```

### 3. Sub Matching Validation

The controller validates sub consistency:

```javascript
if (ddbUser.sub !== cognitoOauthUser.sub) {
  console.warn("Sub mismatch detected - may indicate linking issue");
  // Don't fail - PreTokenGeneration handles correct claims
}
```

### 4. LinkedProviders Tracking

- Array field in DynamoDB user record
- Tracks all linked OAuth providers: `["google", "facebook"]`
- Updated during OAuth sign-in
- Used for UI display and account management

## Database Schema

### User Record

```javascript
{
  PK: "USER#<userId>",
  SK: "METADATA",
  sub: "<native-cognito-sub>", // Always native sub, never OAuth sub
  email: "user@example.com",
  linkedProviders: ["google"], // OAuth providers linked to this account
  // ... other fields
}
```

## Cognito Linking Details

### AdminLinkProviderForUser API

```javascript
{
  UserPoolId: "us-east-1_xxxxx",
  DestinationUser: {
    ProviderName: "Cognito",
    ProviderAttributeValue: "<native-sub>" // Native account sub
  },
  SourceUser: {
    ProviderName: "Google",
    ProviderAttributeName: "Cognito_Subject",
    ProviderAttributeValue: "<oauth-sub>" // OAuth provider sub
  }
}
```

After linking:

- Future OAuth authentications use the native account
- Tokens issued with native account's `sub`
- OAuth user record may exist but is not used for authentication

## Error Handling

### ProviderLinkedRetryException

- Thrown after successful linking
- Not a real error - user just needs to retry
- statusCode: 200 (success, but requires action)
- Message: "Your Google account has been linked. Please sign in again."

### ProviderLinkingException

- Thrown when linking fails
- statusCode: 500
- Prevents duplicate account creation
- Message: "Failed to link Google account. Please try again or contact support."

### UnconfirmedAccountException

- Thrown when OAuth sign-up attempted with unconfirmed native account
- statusCode: 400
- Message: "Please verify your email address first before signing in with a social account"

## Testing Scenarios

### Test 1: Link Google to Existing Native Account

1. Create native account: email: `test@example.com`, password: `Test123!`
2. Verify email
3. Sign out
4. Click "Sign in with Google" using same email
5. **Expected:** Error message "Your Google account has been linked. Please sign in again."
6. Click "Sign in with Google" again
7. **Expected:** Success, signed in as native account, `linkedProviders: ["google"]`

### Test 2: New OAuth User (No Native Account)

1. Click "Sign in with Google" with new email `newuser@example.com`
2. **Expected:** Success, new user created with `linkedProviders: ["google"]`

### Test 3: OAuth Sign-In with Unconfirmed Native Account

1. Create native account but DON'T verify email
2. Attempt to sign in with Google using same email
3. **Expected:** Error "Please verify your email address first"

### Test 4: Multiple Provider Linking

1. Native account exists and verified
2. Sign in with Google → Linked successfully
3. Sign in with Facebook (same email) → Linked successfully
4. **Expected:** `linkedProviders: ["google", "facebook"]`

### Test 5: Subsequent OAuth Sign-Ins

1. After linking (test 1 completed)
2. Sign out
3. Sign in with Google again
4. **Expected:** Instant success, no linking needed, native account used

## Monitoring & Debugging

### CloudWatch Logs - PreSignUp Trigger

```
✅ Successfully linked Google to native account (sub: abc-123)
event: pre_signup_auto_linking_complete
action: linked_blocking_oauth_creation
message: Provider linked. Blocking OAuth account creation to force native account authentication.
```

### CloudWatch Logs - authSignIn Controller

```
OAuth Sign-In: Provider detection:
  provider: google
  username: test@example.com (or google_123456 for new users)
  hasOAuthPattern: false (true for new users)
  isLinkedAccount: true

OAuth Sign-In: Database lookup result:
  ddbUserExists: true
  subsMatch: true

OAuth Sign-In: Storing session:
  userId: user-123
  userSub: abc-123 (native sub)
  cognitoSub: abc-123
  linkedProviders: ["google"]
  isLinked: true
```

### PreTokenGeneration Trigger

```
pre-token-gen: sub: abc-123 (native sub)
pre-token-gen: isOAuthUser: false (after linking)
pre-token-gen: Found user in DB: {
  userId: user-123,
  role: user,
  email: test@example.com,
  sub: abc-123
}
```

## Security Considerations

1. **Email Verification Required**

   - Native account MUST be verified before linking
   - Prevents unauthorized account takeover

2. **Sub Validation**

   - Controller validates sub consistency
   - Warns on mismatches but doesn't fail (allows PreTokenGeneration to handle)

3. **Audit Logging**

   - All OAuth sign-ins logged with provider info
   - Tracks linked vs new accounts

4. **Error Messages**
   - User-friendly messages that don't expose system internals
   - Guide users through retry flow

## Known Limitations

1. **Provider Detection After Linking**

   - Username becomes native email after linking
   - Can't reliably detect which provider was used from username alone
   - Relies on linkedProviders array in DB

2. **First Sign-In Requires Retry**

   - User must sign in twice when linking first OAuth provider
   - This is intentional to ensure proper Cognito linking
   - Could be improved with custom OAuth flow in future

3. **Audit Log Action**
   - Using `LINK_OAUTH_PROVIDER` action for OAuth sign-ins
   - Consider adding dedicated `OAUTH_SIGNIN` action in future

## Future Improvements

1. Add `OAUTH_SIGNIN` to `AUDIT_LOG_ACTION` enum
2. Store which provider was used for current session
3. Improve provider detection for linked accounts (check identity providers list)
4. Add user notification when provider is linked
5. Allow manual unlinking of providers in user settings
6. Support for more OAuth providers (Apple, Facebook, Amazon)
