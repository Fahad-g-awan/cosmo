# 🚀 Account Linking - COMPLETE IMPLEMENTATION GUIDE

**ONE FILE - ALL CODE - ALL EXPLANATIONS - ALL FLOWS**

---

## 📋 Table of Contents

1. [What You're Building & Why](#1-what-youre-building--why)
2. [Architecture & Flow Diagrams](#2-architecture--flow-diagrams)
3. [Phase 1: Auto-Linking (CRITICAL)](#3-phase-1-auto-linking-critical)
4. [Phase 2: Manual Linking (Optional)](#4-phase-2-manual-linking-optional)
5. [Phase 3: Set Password (Optional)](#5-phase-3-set-password-optional)
6. [Database Schema](#6-database-schema)
7. [Testing Guide](#7-testing-guide)
8. [Troubleshooting](#8-troubleshooting)

---

## 1. What You're Building & Why

### The Problem

```
❌ User signs up: email@example.com + password123
❌ User verifies email and uses app
❌ Later user clicks: "Sign in with Google" (same email)
❌ System says: "Email already exists"
❌ User confused and frustrated
```

### Your Solution (3 Scenarios)

**Scenario 1: Auto-Linking (MOST IMPORTANT)**

```
✅ User signs up: email@example.com + password
✅ Later clicks: "Sign in with Google" (same email)
✅ System automatically links Google to existing account
✅ User signs in successfully with merged account
✅ Can now use EITHER method anytime
```

**Scenario 2: Manual Linking (Optional)**

```
✅ User is logged in
✅ Goes to settings
✅ Clicks "Link Google Account"
✅ Google account linked
✅ Can now use both methods
```

**Scenario 3: Set Password (Optional)**

```
✅ User signed up with Google only
✅ Goes to settings
✅ Sets password
✅ Can now use email + password OR Google
```

---

## 2. Architecture & Flow Diagrams

### Before vs After Linking

**BEFORE LINKING (Problem):**

```
Email Account:              OAuth Account:
john@email.com             john@email.com
Username: john@email.com   Username: google_123456
Sub: abc-111               Sub: xyz-999
    ↓                          ↓
USER#abc-111               USER#xyz-999
(DynamoDB)                 (DynamoDB)
    ↓                          ↓
TWO DIFFERENT ACCOUNTS ❌
User confused!
```

**AFTER LINKING (Solution):**

```
Email Account (PRIMARY):    OAuth Account (LINKED):
john@email.com             john@email.com
Username: john@email.com   Username: google_123456
Sub: abc-111               Sub: abc-111 (SAME!)
    ↓                          ↓
    └──────────┬───────────────┘
               ↓
         USER#abc-111
         (DynamoDB)
               ↓
    ONE MERGED ACCOUNT ✅
    Both methods work!
```

---

### Complete Auto-Linking Flow

```
USER ACTION: Clicks "Sign in with Google"
    ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 1: Google OAuth                                        │
│ Google returns: email@example.com                           │
└─────────────────────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 2: Cognito Check                                       │
│ Cognito: "Does google_123456 exist?"                        │
│                                                             │
│ IF EXISTS:                                                  │
│   → Just authenticate (pre-signup doesn't fire)             │
│   → Sign in normally ✅                                     │
│                                                             │
│ IF NOT EXISTS:                                              │
│   → Need to create Google user                              │
│   → Go to Step 3                                            │
└─────────────────────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 3: Pre-Signup Trigger Fires                           │
│                                                             │
│ Question: "Should I allow creating this Google user?"       │
│                                                             │
│ Check: Does native account exist with this email?          │
│                                                             │
│ YES - Native + Confirmed:                                   │
│   → ALLOW ✅ (will link later)                              │
│   → Create Google user                                      │
│   → Go to Step 4                                            │
│                                                             │
│ YES - Native + Unconfirmed:                                 │
│   → BLOCK ❌ "Verify email first"                           │
│   → Process stops                                           │
│                                                             │
│ YES - OAuth exists:                                         │
│   → BLOCK ❌ "Already registered"                           │
│   → Process stops                                           │
│                                                             │
│ NO - New user:                                              │
│   → ALLOW ✅ (new OAuth user)                               │
│   → Go to Step 4                                            │
└─────────────────────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 4: Google User Created                                │
│ Cognito creates:                                            │
│   Username: google_123456                                   │
│   Sub: xyz-999 (temporary)                                  │
│   Email: email@example.com                                  │
└─────────────────────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 5: OAuth Sign-In Controller Fires                     │
│                                                             │
│ Controller checks: Does native account exist?               │
│                                                             │
│ YES:                                                        │
│   → Call AdminLinkProviderForUser                           │
│   → Link: Google user → Native user                         │
│   → Google sub changes: xyz-999 → abc-111                   │
│   → Update DynamoDB: linkedProviders = ["google"]           │
│   → Use NATIVE account data                                 │
│   → Sign in with native account ✅                          │
│                                                             │
│ NO:                                                         │
│   → Create new user in DynamoDB                             │
│   → Sign in with OAuth account ✅                           │
└─────────────────────────────────────────────────────────────┘
    ↓
✅ USER SIGNED IN SUCCESSFULLY
```

---

### Key Concept: Two-Stage Process

**STAGE 1: Pre-Signup Trigger (Gatekeeper)**

```
Role: Decide if Cognito should create the Google user
NOT: Perform the linking
```

**STAGE 2: Sign-In Controller (Linker)**

```
Role: Detect existing native account and link it
ALSO: Handle actual sign-in and token generation
```

**Why Two Stages?**

```
1. Pre-signup must ALLOW Google user creation
2. Only then can sign-in controller LINK it
3. If pre-signup blocks, linking never happens
```

---

### When Pre-Signup Runs vs Doesn't Run

**Pre-Signup RUNS when:**

```
✅ First time Google sign-in (creating Google user)
✅ First time email sign-up (creating native user)
✅ Any operation creating a NEW Cognito user
```

**Pre-Signup DOESN'T RUN when:**

```
❌ User already exists in Cognito
❌ Regular sign-in with existing credentials
❌ Token refresh
❌ Subsequent Google sign-ins (user already exists)
```

---

## 🎯 Multi-Provider Support

**This implementation supports ALL OAuth providers:**

✅ **Google** - Fully configured in examples  
✅ **Facebook** - Supported (needs Cognito setup)  
✅ **Apple** - Supported (needs Cognito setup)  
✅ **Any future OAuth provider** - Code auto-detects provider

**How it works:**

```javascript
// Cognito creates OAuth users with format: provider_id
// Examples:
//   - Google: google_123456789
//   - Facebook: facebook_987654321
//   - Apple: apple_111222333

// Code automatically detects provider:
const providerName = oauthUsername.split("_")[0]; // "google", "facebook", "apple"
```

**What you need to do for each provider:**

1. Configure provider in AWS Cognito (see `COGNITO_SETUP.md`)
2. Update validation schema to include provider name
3. Test with that provider

**That's it! No other code changes needed.**

---

## 3. Phase 1: Auto-Linking (CRITICAL)

---

### File 1: Pre-Signup Trigger

**Path:** `modules/cosmediate-pre-auth-signup/index.mjs`  
**Action:** REPLACE ENTIRE FILE

**What This File Does:**

- Acts as GATEKEEPER for user creation
- Decides: Should Cognito create this new user?
- Allows OAuth user creation when native account exists (enables linking)
- Blocks duplicate sign-ups
- Blocks OAuth for unverified email accounts

**When This Runs:**

- Every time Cognito tries to CREATE a new user
- First Google sign-in (creating Google user)
- First email sign-up (creating native user)
- Does NOT run for existing users signing in

---

**COMPLETE CODE:**

```javascript
import { cognitoGetUserByEmail } from "/opt/nodejs/services/auth.mjs";
import { runLayerTest } from "/opt/nodejs/lib/utils.mjs";

export const handler = async (event) => {
  runLayerTest(event);

  const { userPoolId } = event;
  const email = event?.request?.userAttributes?.email;
  const triggerSource = event.triggerSource;
  // triggerSource values:
  // - "PreSignUp_SignUp" = Email/password sign-up
  // - "PreSignUp_ExternalProvider" = OAuth (Google) sign-up

  console.log("=== Pre-Signup Trigger ===", { triggerSource, email });

  // If no email, allow (graceful degradation)
  if (!email) {
    console.warn("No email - allowing");
    return event;
  }

  try {
    // Check if user already exists with this email
    let existing = null;
    try {
      existing = await cognitoGetUserByEmail(
        { COGNITO_USER_POOL_ID: userPoolId },
        email
      );
    } catch (err) {
      console.error("Error checking user:", err);
      // Continue - if check fails, allow (fail-open for availability)
    }

    // If existing user found, apply rules
    if (existing) {
      const isOAuthSignIn = triggerSource === "PreSignUp_ExternalProvider";
      const isNativeUser = existing.Username === email; // Native users have username = email
      const isOAuthUser = existing.Username !== email; // OAuth users have username = google_123
      const isConfirmed = existing.UserStatus === "CONFIRMED";

      console.log({ isOAuthSignIn, isNativeUser, isOAuthUser, isConfirmed });

      // ============================================
      // RULE 1: OAuth sign-in with existing NATIVE account
      // ============================================
      // WHY ALLOW: We WANT to create Google user so we can LINK it later!
      // WHAT HAPPENS NEXT: Sign-in controller will link Google → Native
      if (isOAuthSignIn && isNativeUser && isConfirmed) {
        console.log(
          "✅ RULE 1: OAuth for native account - allowing for auto-link"
        );
        event.response.autoConfirmUser = true;
        event.response.autoVerifyEmail = true;
        return event; // ALLOW: Create Google user (will be linked in sign-in)
      }

      // ============================================
      // RULE 2: Duplicate OAuth account
      // ============================================
      // WHY BLOCK: User already signed up with Google!
      // SCENARIO: Day 1 Google sign-up, Day 2 trying Google sign-up again
      // NOTE: This is edge case - usually Cognito authenticates existing user
      if (isOAuthSignIn && isOAuthUser) {
        console.log("❌ RULE 2: Duplicate OAuth - blocking");
        throw Object.assign(new Error("Google account already registered!"), {
          code: "UsernameExistsException",
          statusCode: 400,
        });
      }

      // ============================================
      // RULE 3: Duplicate email sign-up
      // ============================================
      // WHY BLOCK: Email already exists - prevent duplicates!
      // SCENARIO: Day 1 email sign-up, Day 2 trying email sign-up again with same email
      if (!isOAuthSignIn) {
        console.log("❌ RULE 3: Duplicate email - blocking");
        throw Object.assign(new Error("Email already in use!"), {
          code: "UsernameExistsException",
          statusCode: 400,
        });
      }

      // ============================================
      // RULE 4: Unconfirmed native account
      // ============================================
      // WHY BLOCK: User must verify email first!
      // SCENARIO: Day 1 email sign-up (not verified), Day 2 trying Google sign-in
      // SOLUTION: User must verify email before using Google
      if (isOAuthSignIn && isNativeUser && !isConfirmed) {
        console.log("❌ RULE 4: Unconfirmed native - blocking");
        throw Object.assign(new Error("Please verify your email first."), {
          code: "UserNotConfirmedException",
          statusCode: 400,
        });
      }
    }

    // ============================================
    // RULE 5: New user (no existing account)
    // ============================================
    // WHY ALLOW: This is a brand new user!
    console.log("✅ RULE 5: New user - allowing");

    // Auto-confirm OAuth users (email already verified by Google)
    if (triggerSource === "PreSignUp_ExternalProvider") {
      event.response.autoConfirmUser = true;
      event.response.autoVerifyEmail = true;
    }

    return event; // ALLOW: Create new user
  } catch (err) {
    console.error("❌ Error:", err);
    throw err; // Re-throw error to block sign-up
  }
};
```

---

**🔑 KEY POINTS:**

**Rule 1 (ALLOW) is CRITICAL for linking:**

```javascript
if (isOAuthSignIn && isNativeUser && isConfirmed) {
  return event; // ALLOW
}
```

- This ALLOWS Google user creation when native account exists
- Without this, linking is IMPOSSIBLE!
- Sign-in controller will link Google → Native after creation

**Rules 2-4 (BLOCK) prevent duplicates:**

```javascript
// Block duplicate OAuth
// Block duplicate email
// Block unverified email
```

- These protect against duplicate accounts
- When error thrown, entire process stops
- User sees error message and can't proceed

**When error is thrown:**

```
Pre-signup throws error
    ↓
Cognito: "Stopping everything"
    ↓
User creation: CANCELLED ❌
Sign-in controller: NEVER RUNS ❌
User sees: ERROR MESSAGE ❌
```

---

### File 2: OAuth Controller (Auto-Linking)

**Path:** `modules/cosmediate-authentication/controllers/auth.mjs`

**What This File Does:**

- Handles OAuth sign-in flow
- Detects if native account exists
- Performs ACTUAL LINKING using AdminLinkProviderForUser
- Updates DynamoDB with linkedProviders
- Generates session with correct sub (native sub if linked!)
- Falls back gracefully if linking fails

**When This Runs:**

- After pre-signup allows Google user creation
- When OAuth callback returns with code
- During actual sign-in process

---

**Step 1:** ADD import at top of file:

```javascript
import { handleUpdateCommand } from "/opt/nodejs/services/db.mjs";
```

---

**Step 2:** FIND OAuth section (around line 320-400)

Look for this existing code:

```javascript
// Existing OAuth code
const authTokens = await oAuthLogin(code, redirectUri, config);
const cognitoOAuthUser = await cognitoGetUserByAccessToken(...);
// ... rest of OAuth code
```

REPLACE entire OAuth section with this:

```javascript
// ============================================
// OAUTH SIGN-IN WITH AUTO-LINKING
// ============================================

console.log("=== OAuth Sign-In Start ===");

// STEP 1: Get OAuth tokens from Google
const authTokens = await oAuthLogin(code, redirectUri, config);

// STEP 2: Get OAuth user info from Cognito
// At this point, pre-signup has already allowed Google user creation
const cognitoOAuthUser = await cognitoGetUserByAccessToken(
  config.COGNITO_USER_POOL_ID,
  authTokens.access_token
);

const oauthEmail = cognitoOAuthUser.UserAttributes.find(
  (a) => a.Name === "email"
)?.Value;
const oauthUsername = cognitoOAuthUser.Username; // e.g., "google_123456"
const oauthSub = cognitoOAuthUser.UserAttributes.find(
  (a) => a.Name === "sub"
)?.Value;

console.log("OAuth user:", {
  email: oauthEmail,
  username: oauthUsername,
  sub: oauthSub,
});

// STEP 3: Check if NATIVE account exists with this email
// This is WHERE WE DETECT if linking is needed!
let existingNativeUser = null;
let shouldAutoLink = false;

try {
  const user = await cognitoGetUserByEmail(config, oauthEmail);

  // Check if it's a NATIVE user (username = email, not google_123)
  if (user && user.Username === oauthEmail) {
    existingNativeUser = user;
    shouldAutoLink = true;
    console.log("✅ Found native account - will auto-link");
  }
} catch (err) {
  console.log("No native account found - normal OAuth flow");
}

// Initialize final values (will be updated if linking happens)
let finalSub = oauthSub; // Default to OAuth sub
let finalUser = null;

// ============================================
// STEP 4: AUTO-LINK if native account exists
// ============================================
if (shouldAutoLink && existingNativeUser) {
  console.log("=== AUTO-LINKING START ===");

  try {
    // Get NATIVE account's sub
    const nativeSub = existingNativeUser.Attributes.find(
      (a) => a.Name === "sub"
    )?.Value;

    // DETECT PROVIDER: Cognito formats OAuth usernames as google_123, facebook_456, apple_789
    const providerName = oauthUsername.split("_")[0]; // "google", "facebook", or "apple"
    const providerNameCapitalized =
      providerName.charAt(0).toUpperCase() + providerName.slice(1); // "Google", "Facebook", "Apple"

    console.log("Detected provider:", providerNameCapitalized);
    console.log("Linking:");
    console.log("  Source (" + providerNameCapitalized + "):", {
      username: oauthUsername,
      sub: oauthSub,
    });
    console.log("  Destination (Native):", {
      username: oauthEmail,
      sub: nativeSub,
    });

    // CRITICAL: Call AdminLinkProviderForUser API
    // This merges OAuth user (Google/Facebook/Apple) into Native user
    // After this, OAuth user will use NATIVE sub!
    // Here you have to use sdk3 version instead of this old style code
    // Update the imports and import whatever needed for alternat of adminLinkProviderForUser
    await cognitoIDP
      .adminLinkProviderForUser({
        UserPoolId: config.COGNITO_USER_POOL_ID,
        DestinationUser: {
          ProviderName: "Cognito", // Native account provider
          ProviderAttributeValue: oauthEmail, // Native username (email)
        },
        SourceUser: {
          ProviderName: providerNameCapitalized, // ✅ DYNAMIC: "Google", "Facebook", or "Apple"
          ProviderAttributeName: "Cognito_Subject",
          ProviderAttributeValue: oauthSub, // OAuth sub to link
        },
      })
      .promise();

    console.log("✅ AdminLinkProviderForUser successful!");
    console.log(
      "✅ " + providerNameCapitalized + " account linked to native account"
    );

    // IMPORTANT: Use NATIVE account from now on!
    finalSub = nativeSub; // NOT oauthSub!

    // Get user data from DynamoDB using NATIVE sub
    finalUser = await getUserBySub(config.DB_TABLE_NAME, nativeSub);

    // Update DynamoDB with linked provider
    if (finalUser) {
      const providers = finalUser.linkedProviders || [];

      // Only update if not already linked
      if (!providers.includes(providerName)) {
        await handleUpdateCommand({
          TableName: config.DB_TABLE_NAME,
          Key: { PK: finalUser.PK, SK: finalUser.SK },
          UpdateExpression:
            "SET linkedProviders = list_append(if_not_exists(linkedProviders, :empty), :provider), updatedAt = :updatedAt",
          ExpressionAttributeValues: {
            ":empty": [],
            ":provider": [providerName], // ✅ DYNAMIC: "google", "facebook", or "apple"
            ":updatedAt": new Date().toISOString(),
          },
        });
        console.log(
          "✅ DynamoDB updated: linkedProviders includes '" + providerName + "'"
        );
      } else {
        console.log(
          "ℹ️  " + providerNameCapitalized + " already in linkedProviders"
        );
      }
    }

    console.log("=== AUTO-LINKING COMPLETE ===");
  } catch (linkError) {
    console.error("❌ Linking failed:", linkError);
    console.error("Error code:", linkError.code);
    console.error("Error message:", linkError.message);

    // IMPORTANT: Don't break sign-in if linking fails!
    // Fall through to normal OAuth flow
    console.log("⚠️  Continuing with OAuth user (linking failed)");
    shouldAutoLink = false;
  }
}

// ============================================
// STEP 5: Normal OAuth flow (no linking OR linking failed)
// ============================================
if (!shouldAutoLink || !finalUser) {
  console.log("=== Normal OAuth Flow (No Linking) ===");

  // Use OAuth sub
  finalSub = oauthSub;

  // Check if OAuth user exists in DynamoDB
  finalUser = await getUserBySub(config.DB_TABLE_NAME, oauthSub);

  // Create new user if doesn't exist
  if (!finalUser) {
    console.log("Creating new OAuth user in DynamoDB");

    const newUserId = generateId();
    await createUserInDB({
      tableName: config.DB_TABLE_NAME,
      newUserId,
      sub: oauthSub,
      userLookupKey: generateLookupKey(oauthEmail),
      email: oauthEmail,
      firstName: "", // Could extract from OAuth if available
      lastName: "",
      phone: "",
      age: "",
      country: "",
      state: "",
      city: "",
      completeAddress: "",
      postalCode: "",
      status: USER_STATUS.ACTIVE,
      role: USER_ROLES.USER,
      perms: ROLE_DEFAULT_PERMS[USER_ROLES.USER] || [],
      authType: AUTH_TYPE.OAUTH,
    });

    // Fetch newly created user
    finalUser = await getUserBySub(config.DB_TABLE_NAME, oauthSub);
    console.log("✅ New OAuth user created:", finalUser.id);
  } else {
    console.log("✅ Existing OAuth user found:", finalUser.id);
  }
}

// ============================================
// STEP 6: Generate session and return tokens
// ============================================
console.log("=== Generating Session ===");
console.log("Final sub being used:", finalSub);
console.log("User ID:", finalUser.id);
console.log("Linked to native:", shouldAutoLink);

const sessionId = generateSessionId();

// Store session with correct sub
// CRITICAL: If linked, this is NATIVE sub! If not, it's OAuth sub.
await storeSession({
  tableName: config.DB_TABLE_NAME,
  sessionId,
  accessToken: authTokens.access_token,
  refreshToken: authTokens.refresh_token,
  idToken: authTokens.id_token,
  expiresIn: authTokens.expires_in,
  userId: finalUser.id,
  sub: finalSub, // Native sub if linked, OAuth sub otherwise
});

console.log("✅ Session created successfully:", sessionId);

// Return response with tokens and user data
return sendResponse({
  accessToken: authTokens.access_token,
  sessionId,
  idToken: authTokens.id_token,
  expiresIn: authTokens.expires_in,
  user: finalUser,
  authType: AUTH_TYPE.OAUTH,
});

// ============================================
// END OF OAUTH SIGN-IN FLOW
// ============================================
```

---

**🔑 CRITICAL POINTS:**

**1. Use NATIVE sub after linking:**

```javascript
finalSub = nativeSub; // NOT oauthSub!
finalUser = await getUserBySub(config.DB_TABLE_NAME, nativeSub);
```

- This is THE MOST IMPORTANT part!
- After linking, everything uses NATIVE account
- Database lookup, session storage, tokens - all use native sub

**2. AdminLinkProviderForUser does the magic:**

```javascript
await cognitoIDP.adminLinkProviderForUser({
  DestinationUser: {
    ProviderName: "Cognito",
    ProviderAttributeValue: oauthEmail,
  },
  SourceUser: { ProviderName: "Google", ProviderAttributeValue: oauthSub },
});
```

- Merges Google user → Native user
- After this, both sign-in methods use SAME sub
- Google sub changes from xyz-999 → abc-111 (native sub)

**3. Graceful fallback:**

```javascript
catch (linkError) {
  shouldAutoLink = false; // Continue with OAuth user
}
```

- If linking fails, don't break sign-in!
- User still signs in with OAuth account
- Can retry linking later

**4. DynamoDB update tracks linking:**

```javascript
linkedProviders: ["google"]; // Stored in user entity
```

- Helps track which providers are linked
- Can show in UI: "Linked: Email, Google"

---

**📊 WHAT HAPPENS AFTER PHASE 1:**

```
User can now sign in TWO ways:

1. Email + Password:
   → Uses native sub (abc-111)
   → Gets USER#abc-111 from DynamoDB
   → Signs in ✅

2. Google Sign-In:
   → Uses native sub (abc-111) ← SAME!
   → Gets USER#abc-111 from DynamoDB ← SAME!
   → Signs in ✅

SAME ACCOUNT! SAME DATA! ✅
```

---

## 4. Phase 2: Manual Linking (OPTIONAL)

**Skip this if you only want auto-linking. This allows users to manually link Google from settings.**

### What This Does:

- User is logged in with email/password
- User goes to settings page
- User clicks "Link Google Account"
- Google asks permission
- Account gets linked
- User can now use both methods

### When To Use:

- If you want users to have manual control
- If you want a "Link Google" button in settings
- Nice to have, but not critical

---

### File: Manual Linking Controller

**Path:** `modules/cosmediate-authentication/controllers/auth.mjs`  
**Action:** ADD at end of file

**COMPLETE CODE:**

```javascript
/**
 * Manual OAuth Account Linking
 * Endpoint: POST /auth/link-oauth
 * User must be authenticated to call this
 */
export const linkOAuthAccount = async () => {
  try {
    const context = getCtx();
    const { config, authContext } = context;
    const { value: reqBody } = await validateRequestBody(
      CRUD_ACTIONS.AUTH.LINK_OAUTH,
      context.reqBody
    );

    const { provider, code, redirectUri } = reqBody;

    if (!authContext?.sub) {
      throw fail(401, "Unauthorized", ["Must be signed in"]);
    }

    const currentUser = await getUserBySub(
      config.DB_TABLE_NAME,
      authContext.sub
    );
    if (!currentUser) {
      throw fail(404, "User Not Found");
    }

    // Check already linked
    if ((currentUser.linkedProviders || []).includes(provider)) {
      throw fail(400, "Already Linked");
    }

    // Get OAuth tokens
    const oauthTokens = await oAuthLogin(code, redirectUri, config);
    const oauthUserInfo = await cognitoGetUserByAccessToken(
      config.COGNITO_USER_POOL_ID,
      oauthTokens.access_token
    );

    const oauthEmail = oauthUserInfo.UserAttributes.find(
      (a) => a.Name === "email"
    )?.Value;

    // Verify email match
    if (oauthEmail !== currentUser.email) {
      throw fail(400, "Email Mismatch");
    }

    // Get OAuth user
    const oauthUser = await cognitoGetUserByEmail(config, oauthEmail);
    const oauthSub = oauthUser.Attributes.find((a) => a.Name === "sub")?.Value;

    // Link
    await cognitoIDP
      .adminLinkProviderForUser({
        UserPoolId: config.COGNITO_USER_POOL_ID,
        DestinationUser: {
          ProviderName: "Cognito",
          ProviderAttributeValue: currentUser.email,
        },
        SourceUser: {
          ProviderName: provider.charAt(0).toUpperCase() + provider.slice(1),
          ProviderAttributeName: "Cognito_Subject",
          ProviderAttributeValue: oauthSub,
        },
      })
      .promise();

    // Update DB
    await handleUpdateCommand({
      TableName: config.DB_TABLE_NAME,
      Key: { PK: currentUser.PK, SK: currentUser.SK },
      UpdateExpression:
        "SET linkedProviders = list_append(if_not_exists(linkedProviders, :empty), :provider)",
      ExpressionAttributeValues: {
        ":empty": [],
        ":provider": [provider],
      },
    });

    return { statusCode: 200, data: { message: "Linked!", success: true } };
  } catch (error) {
    console.error("Linking error:", error);
    if (error?.statusCode) throw error;
    throw fail(500, "Internal Server Error");
  }
};
```

**Routes:** `modules/cosmediate-authentication/lib/routes.mjs`

```javascript
ROUTES.set("POST:/auth/link-oauth", linkOAuthAccount);
```

SKIP FROM HERE
**Validation:** `lambdaLayer/nodejs/lib/api/registry.mjs`

```javascript
LINK_OAUTH: "AUTH.LINK_OAUTH",
```

**Schema:** `lambdaLayer/nodejs/lib/validation/schemas/auth.mjs`

```javascript
export const linkOAuthSchema = Joi.object({
  provider: Joi.string()
    .valid("google", "facebook", "apple")
    .required(), // ✅ Supports all providers
  code: Joi.string().required(),
  redirectUri: Joi.string().uri().required(),
}).required();

// Add to map:
[CRUD_ACTIONS.AUTH.LINK_OAUTH]: linkOAuthSchema,
```

TO HERE
I will do it afterwards by myself.

---

## 🟢 PHASE 3: SET PASSWORD (OPTIONAL)

**Path:** `modules/cosmediate-authentication/controllers/password.mjs`  
**Action:** ADD at end

```javascript
export const setPasswordForOAuthUser = async () => {
  try {
    const context = getCtx();
    const { config, authContext } = context;
    const { value: reqBody } = await validateRequestBody(
      CRUD_ACTIONS.AUTH.SET_PASSWORD_OAUTH,
      context.reqBody
    );

    const { password } = reqBody;

    if (!authContext?.sub) {
      throw fail(401, "Unauthorized");
    }

    if (authContext?.authType !== "oauth") {
      throw fail(400, "Only for OAuth users");
    }

    const user = await getUserBySub(config.DB_TABLE_NAME, authContext.sub);
    if (!user) {
      throw fail(404, "User Not Found");
    }

    if (user.passwordSet) {
      throw fail(400, "Password already set");
    }

    // Set password
    await cognitoIDP
      .adminSetUserPassword({
        UserPoolId: config.COGNITO_USER_POOL_ID,
        Username: authContext.email,
        Password: password,
        Permanent: true,
      })
      .promise();

    // Update DB
    await updateUser_PasswordSet_Status({
      tableName: config.DB_TABLE_NAME,
      PK: user.PK,
      SK: user.SK,
    });

    return {
      statusCode: 200,
      data: { message: "Password set!", success: true },
    };
  } catch (error) {
    console.error("Set password error:", error);
    if (error?.statusCode) throw error;
    throw fail(500, "Internal Server Error");
  }
};
```

**Routes:** `modules/cosmediate-authentication/lib/routes.mjs`

```javascript
ROUTES.set("POST:/auth/set-password-oauth", setPasswordForOAuthUser);
```

**Validation:** Add to registry and schema like Phase 2

---

## 6. Database Schema

### Fields to Add to User Entity

```javascript
{
  // Existing fields...
  email: "john@example.com",
  sub: "abc-123-native",
  authType: "email", // or "oauth"

  // NEW FIELDS FOR LINKING:
  linkedProviders: [],     // Array: ["google", "facebook", "apple"]
  passwordSet: false,      // Boolean: has password been set?

  // Other existing fields...
  role: "user",
  perms: [...],
  status: "ACTIVE"
}
```

### Field Descriptions:

**linkedProviders:**

- Type: Array of strings
- Default: `[]`
- Values: `["google"]`, `["google", "facebook"]`, etc.
- Purpose: Track which OAuth providers are linked
- Updated when: Provider is linked (auto or manual)
- Used for: Showing "Linked: Email, Google" in UI

**passwordSet:**

- Type: Boolean
- Default: `false` for OAuth users, `true` for email users
- Purpose: Track if OAuth user has set a password
- Updated when: OAuth user sets password (Phase 3)
- Used for: Knowing if user can sign in with email/password

**authType:**

- Type: String
- Values: `"email"` or `"oauth"`
- Purpose: Track primary authentication method
- Set during: Initial user creation
- Used for: Analytics, user segmentation

---

## 7. Testing Guide

### Test Phase 1: Auto-Linking

**Test 1.1: Auto-Link Success (CRITICAL)**

```
Step 1: Sign up with email
  Email: test@example.com
  Password: TestPass123!
  ✅ Verify email

Step 2: Sign in with email/password
  ✅ Should work

Step 3: Sign out

Step 4: Click "Sign in with Google"
  Use Google account: test@example.com
  ✅ Should sign in successfully (auto-linked!)

Step 5: Check DynamoDB
  linkedProviders: ["google"] ✅

Step 6: Try both methods
  Email/password: ✅ Works
  Google: ✅ Works
  Both access SAME account ✅
```

**Test 1.2: Duplicate Email Blocked**

```
Step 1: Sign up: test2@example.com + password
Step 2: Try to sign up again: test2@example.com
  ❌ Should be blocked: "Email already in use"
```

**Test 1.3: New OAuth User**

```
Step 1: Sign in with Google: newuser@gmail.com
  ✅ Creates new OAuth account
  ✅ Signs in successfully
```

**Test 1.4: Multiple Providers (If Configured)**

```
Step 1: Sign up with email: multi@example.com + password
  ✅ Verify email

Step 2: Sign in with Google: multi@example.com
  ✅ Auto-links to email account
  ✅ DynamoDB: linkedProviders = ["google"]

Step 3: Sign in with Facebook: multi@example.com
  ✅ Auto-links to same account
  ✅ DynamoDB: linkedProviders = ["google", "facebook"]

Step 4: Sign in with Apple: multi@example.com
  ✅ Auto-links to same account
  ✅ DynamoDB: linkedProviders = ["google", "facebook", "apple"]

Step 5: Try all sign-in methods
  Email + password: ✅ Works
  Google: ✅ Works
  Facebook: ✅ Works
  Apple: ✅ Works
  All access SAME account with SAME data ✅
```

**Check CloudWatch Logs:**

```
Search for: "AUTO-LINKING"

For Google linking:
- "Detected provider: Google"
- "Found native account - will auto-link"
- "AdminLinkProviderForUser successful"
- "Google account linked to native account"
- "DynamoDB updated: linkedProviders includes 'google'"

For Facebook linking (if configured):
- "Detected provider: Facebook"
- "Facebook account linked to native account"
- "linkedProviders includes 'facebook'"

For Apple linking (if configured):
- "Detected provider: Apple"
- "Apple account linked to native account"
- "linkedProviders includes 'apple'"
```

---

### Test Phase 2: Manual Linking (Optional)

**Test 2.1: Manual Link Success**

```
Step 1: Sign in with email/password
Step 2: Go to settings
Step 3: Click "Link Google Account"
Step 4: Approve Google consent
  ✅ Should show: "Google account linked!"
Step 5: Check DynamoDB
  linkedProviders: ["google"] ✅
```

**Test 2.2: Email Mismatch Blocked**

```
Step 1: Signed in as: user1@example.com
Step 2: Try to link Google: different@gmail.com
  ❌ Should be blocked: "Email mismatch"
```

---

### Test Phase 3: Set Password (Optional)

**Test 3.1: Set Password Success**

```
Step 1: Sign up with Google: oauth@gmail.com
Step 2: Go to settings
Step 3: Set password: NewPass123!
  ✅ Should show: "Password set!"
Step 4: Sign out
Step 5: Sign in with email/password
  Email: oauth@gmail.com
  Password: NewPass123!
  ✅ Should work!
```

---

## 8. Troubleshooting

### Issue 1: Auto-Linking Not Working

**Symptoms:**

- User signs in with Google after email signup
- Creates new account instead of linking
- User ends up with 2 accounts

**Debug:**

1. Check pre-signup logs:

   ```
   Search for: email address
   Look for: "OAuth for native account - allowing for auto-link"
   If missing: Pre-signup not detecting native account
   ```

2. Check OAuth controller logs:
   ```
   Search for: "AUTO-LINKING"
   If missing: Controller not detecting native account
   ```

**Fix:**

- Verify pre-signup trigger code (Rule 1 allows OAuth)
- Verify OAuth controller detects native account
- Check IAM permissions for AdminLinkProviderForUser

---

### Issue 2: "AccessDeniedException" on Linking

**Symptoms:**

```
❌ Linking failed: AccessDeniedException
❌ User is not authorized to perform: cognito-idp:AdminLinkProviderForUser
```

**Fix:**

```
1. Go to IAM Console
2. Find Lambda execution role
3. Add policy:
   {
     "Effect": "Allow",
     "Action": "cognito-idp:AdminLinkProviderForUser",
     "Resource": "arn:aws:cognito-idp:REGION:ACCOUNT:userpool/POOL_ID"
   }
```

---

### Issue 3: Wrong User Data After Linking

**Symptoms:**

- User signs in with Google after linking
- Gets wrong user data

**Cause:** Using wrong sub for database lookup

**Fix:**

```javascript
// ✅ CORRECT:
finalSub = nativeSub; // Use NATIVE sub
const user = await getUserBySub(config.DB_TABLE_NAME, nativeSub);

// ❌ WRONG:
finalSub = oauthSub; // Don't use OAuth sub!
```

---

### Issue 4: Pre-Signup Errors Block Sign-In

**What Happens:**

```
Pre-signup throws error
    ↓
User creation cancelled
    ↓
Sign-in doesn't happen
    ↓
User sees error message
```

**This is NORMAL for:**

- Duplicate email sign-ups ✅
- Unverified email trying OAuth ✅
- Duplicate OAuth accounts ✅

**Check logs to confirm it's expected behavior**

---

## ✅ FINAL CHECKLIST

### Phase 1 (MUST DO):

- [ ] Updated pre-signup trigger code
- [ ] Updated OAuth controller code
- [ ] Added handleUpdateCommand import
- [ ] Deployed Lambda functions
- [ ] Tested auto-linking (email → Google)
- [ ] Tested both sign-in methods work
- [ ] Verified CloudWatch logs show success
- [ ] Verified DynamoDB has linkedProviders

### Phase 2 (OPTIONAL):

- [ ] Added linkOAuthAccount function
- [ ] Added route mapping
- [ ] Added validation schema
- [ ] Tested manual linking from settings

### Phase 3 (OPTIONAL):

- [ ] Added setPasswordForOAuthUser function
- [ ] Added route mapping
- [ ] Added validation schema
- [ ] Tested setting password for OAuth users

### AWS Configuration:

- [ ] Google OAuth configured in Cognito
- [ ] Lambda triggers attached
- [ ] IAM permissions set
- [ ] Environment variables configured

---

## 🎉 COMPLETE!

**You now have:**
✅ Full auto-linking implementation
✅ Complete code with explanations
✅ Flow diagrams and architecture
✅ Testing procedures
✅ Troubleshooting guide

**Users can:**
✅ Sign up with email or Google
✅ Automatically link when trying other method
✅ Use either method to sign in
✅ Access same account with same data

**Next Steps:**

1. Implement Phase 1 (critical)
2. Test thoroughly
3. Deploy to production
4. Add Phase 2 & 3 if needed

---

**END OF GUIDE**
