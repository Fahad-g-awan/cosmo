# 🔐 AWS Cognito Setup - COMPLETE GUIDE

**EVERYTHING YOU NEED TO CONFIGURE IN AWS CONSOLE**

---

## ⚡ Quick Navigation

1. [Google OAuth Setup](#1-google-oauth-setup)
2. [Cognito Identity Provider](#2-cognito-identity-provider)
3. [App Client Configuration](#3-app-client-configuration)
4. [Lambda Triggers](#4-lambda-triggers)
5. [IAM Permissions](#5-iam-permissions)
6. [Environment Variables](#6-environment-variables)
7. [Testing](#7-testing)

---

## 1. Google OAuth Setup

### Create OAuth Credentials

```
1. Go to: https://console.cloud.google.com
2. Select/Create project
3. Navigate to: APIs & Services → Credentials
4. Click "Create Credentials" → "OAuth 2.0 Client IDs"
5. Application type: Web application
6. Name: Cosmediate App
```

### Add Authorized Redirect URIs

```
Add these (replace with your values):

https://your-domain.auth.region.amazoncognito.com/oauth2/idpresponse
http://localhost:3000/auth/callback

Example:
https://cosmediate.auth.eu-central-1.amazoncognito.com/oauth2/idpresponse
```

### Get Credentials

```
After creating:
✅ Copy Client ID
✅ Copy Client Secret
(You'll need these for Cognito)
```

---

## 2. Cognito Identity Provider Setup

### Navigate to Cognito

```
AWS Console → Amazon Cognito → User Pools → [Your Pool]
```

---

### 2a. Add Google Provider

```
1. Click "Sign-in experience" tab
2. Click "Federated identity provider sign-in"
3. Click "Add identity provider"
4. Select "Google"
5. Enter:
   Google app ID: [Your Client ID from step 1]
   Google app secret: [Your Client Secret from step 1]
   Authorized scopes: profile email openid
6. Click "Add identity provider"
```

**✅ Checkpoint:** "Google" appears under identity providers

---

### 2b. Add Facebook Provider (Optional)

**Step 1: Create Facebook App**

```
1. Go to: https://developers.facebook.com
2. Click "My Apps" → "Create App"
3. Choose "Consumer" type
4. Fill in app details and create
5. Go to Settings → Basic
6. Copy App ID and App Secret
```

**Step 2: Configure OAuth Redirect**

```
In Facebook App:
1. Go to Products → Add Product → Facebook Login
2. Settings → Valid OAuth Redirect URIs
3. Add: https://your-domain.auth.region.amazoncognito.com/oauth2/idpresponse
4. Save changes
```

**Step 3: Add to Cognito**

```
In AWS Cognito:
1. Sign-in experience tab → Add identity provider
2. Select "Facebook"
3. Enter:
   Facebook app ID: [from Facebook App]
   Facebook app secret: [from Facebook App]
   Authorized scopes: public_profile,email
4. Click "Add identity provider"
```

**✅ Checkpoint:** "Facebook" appears under identity providers

---

### 2c. Add Apple Provider (Optional)

**Step 1: Configure in Apple Developer**

```
1. Go to: https://developer.apple.com/account
2. Certificates, Identifiers & Profiles
3. Identifiers → Create new identifier → Services IDs
4. Register Services ID (e.g., com.yourapp.signin)
5. Enable "Sign in with Apple"
6. Configure domains and return URLs:
   - Domain: your-domain.auth.region.amazoncognito.com
   - Return URL: https://your-domain.auth.region.amazoncognito.com/oauth2/idpresponse
```

**Step 2: Create Private Key**

```
1. Keys → Create a new key
2. Enable "Sign in with Apple"
3. Download the .p8 file (KEEP THIS SAFE!)
4. Note your Key ID and Team ID
```

**Step 3: Add to Cognito**

```
In AWS Cognito:
1. Sign-in experience tab → Add identity provider
2. Select "Sign in with Apple"
3. Enter:
   Services ID: [from Apple, e.g., com.yourapp.signin]
   Team ID: [from Apple Developer account]
   Key ID: [from created key]
   Private key: [paste content of .p8 file]
   Authorized scopes: name email
4. Click "Add identity provider"
```

**✅ Checkpoint:** "SignInWithApple" appears under identity providers

---

## 3. App Client Configuration

### Navigate to App Client

```
Click "App integration" tab
→ Scroll to "App clients and analytics"
→ Click your app client name
→ Click "Edit"
```

### Enable OAuth Flows

```
Hosted UI settings:

OAuth 2.0 grant types:
✅ [x] Authorization code grant
✅ [x] Implicit grant (optional)

Click "Save changes"
```

### Add Callback URLs

```
Allowed callback URLs:
http://localhost:3000/auth/callback
https://yourdomain.com/auth/callback
(Add all your callback URLs, one per line)

Allowed sign-out URLs:
http://localhost:3000
https://yourdomain.com
```

### Configure OAuth Scopes

```
OpenID Connect scopes:
✅ [x] openid
✅ [x] email
✅ [x] profile
✅ [x] aws.cognito.signin.user.admin
```

### Select Identity Providers

```
Identity providers:
✅ [x] Cognito user pool (required)
✅ [x] Google (if configured)
✅ [x] Facebook (if configured)
✅ [x] SignInWithApple (if configured)

(Check all that you've configured!)
```

**✅ Checkpoint:** All configured sign-in methods enabled

---

## 4. Lambda Triggers

### Navigate to Triggers

```
Click "User pool properties" tab
→ Scroll to "Lambda triggers"
→ Click "Add Lambda trigger"
```

### Add Pre Sign-up Trigger

```
Trigger type: Authentication
Sign-up: Pre sign-up
Lambda function: cosmediate-pre-auth-signup
Click "Add Lambda trigger"
```

### Add Pre Token Generation Trigger

```
Trigger type: Authentication
Authentication: Pre token generation
Lambda function: cosmediate-pre-auth-token-gen
Click "Add Lambda trigger"
```

**✅ Checkpoint:** Both triggers show your function names

---

## 5. IAM Permissions

### Lambda Execution Role

Find your Lambda execution role:

```
AWS Console → IAM → Roles
→ Search for: cosmediate-authentication-role (or similar)
→ Click the role
```

### Add Inline Policy

```
Click "Add permissions" → "Create inline policy"
→ Click "JSON" tab
→ Paste this policy:
```

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "cognito-idp:AdminLinkProviderForUser",
        "cognito-idp:AdminGetUser",
        "cognito-idp:AdminSetUserPassword",
        "cognito-idp:ListUsers"
      ],
      "Resource": "arn:aws:cognito-idp:REGION:ACCOUNT_ID:userpool/USER_POOL_ID"
    },
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:GetItem",
        "dynamodb:PutItem",
        "dynamodb:UpdateItem",
        "dynamodb:Query"
      ],
      "Resource": "arn:aws:dynamodb:REGION:ACCOUNT_ID:table/TABLE_NAME"
    }
  ]
}
```

**Replace:**
- `REGION` → Your region (e.g., eu-central-1)
- `ACCOUNT_ID` → Your AWS account ID
- `USER_POOL_ID` → Your Cognito pool ID
- `TABLE_NAME` → Your DynamoDB table name

```
Name: CognitoAccountLinkingPolicy
Click "Create policy"
```

**✅ Checkpoint:** Policy attached to Lambda role

---

## 6. Environment Variables

### Authentication Lambda

```
Function: cosmediate-authentication

Add/verify these:
COGNITO_USER_POOL_ID=eu-central-1_XXXXX
COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxx
COGNITO_CLIENT_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
COGNITO_REGION=eu-central-1
DB_TABLE_NAME=your-table-name
```

### Pre-Signup Lambda

```
Function: cosmediate-pre-auth-signup

No environment variables needed
(Gets userPoolId from event)
```

### Pre-Token-Gen Lambda

```
Function: cosmediate-pre-auth-token-gen

Verify these exist:
DB_TABLE_NAME_DEV=your-dev-table
DB_TABLE_NAME_PROD=your-prod-table
DEFAULT_STAGE=dev
```

---

## 7. Testing

### Test Hosted UI

```
1. Go to: App integration → App client
2. Click "View Hosted UI"
3. Should see:
   - Sign in with email/password
   - Continue with Google button
```

### Test OAuth Flow

```
1. Click "Continue with Google"
2. Google consent screen appears
3. Approve permissions
4. Redirects to callback URL with code
```

### Test Triggers

```
1. Try to sign up with duplicate email
2. Check CloudWatch Logs
3. Should see "Duplicate email" in logs
```

**✅ Checkpoint:** Everything working

---

## 🚨 Common Issues

### Issue 1: "Invalid redirect URI"

**Fix:**
```
✅ Check Cognito callback URL matches exactly
✅ Check Google Console redirect URI
✅ Must include https://
✅ No trailing slash
```

### Issue 2: "User is not authorized"

**Fix:**
```
✅ Check IAM policy attached to Lambda role
✅ Verify resource ARNs are correct
✅ Check Lambda has Cognito permissions
```

### Issue 3: "AdminLinkProviderForUser failed"

**Fix:**
```
✅ Verify IAM permission exists
✅ Check user pool ID is correct
✅ Verify both users exist in Cognito
✅ Provider name must be "Google" (capitalized)
```

---

## ✅ Final Checklist

### Google Setup (Required for examples):
- [ ] Google OAuth credentials created
- [ ] Cognito Google provider configured
- [ ] Google redirect URIs configured

### Facebook Setup (Optional):
- [ ] Facebook app created
- [ ] Facebook OAuth redirect configured
- [ ] Cognito Facebook provider configured

### Apple Setup (Optional):
- [ ] Apple Services ID created
- [ ] Apple private key generated
- [ ] Cognito Apple provider configured

### Common Setup (Required):
- [ ] App client OAuth settings enabled
- [ ] Callback URLs added for all providers
- [ ] OAuth scopes selected
- [ ] Identity providers selected in app client
- [ ] Lambda triggers attached
- [ ] IAM permissions added
- [ ] Environment variables set

### Testing (Required):
- [ ] Hosted UI shows all configured providers
- [ ] OAuth flow tested for each provider
- [ ] Auto-linking tested for each provider

---

## 📊 Verification Commands

### Check User in Cognito (AWS CLI)

```bash
aws cognito-idp admin-get-user \
  --user-pool-id eu-central-1_XXXXX \
  --username user@example.com
```

### List Users

```bash
aws cognito-idp list-users \
  --user-pool-id eu-central-1_XXXXX \
  --filter "email = \"user@example.com\""
```

### Check Lambda Logs

```bash
aws logs tail /aws/lambda/cosmediate-authentication --follow
```

---

## 🎯 Quick Setup Summary

**Time: 30 minutes**

1. Create Google OAuth (5 min)
2. Configure Cognito provider (5 min)
3. Configure app client (5 min)
4. Attach Lambda triggers (3 min)
5. Add IAM permissions (5 min)
6. Set environment variables (2 min)
7. Test everything (5 min)

---

## 🔄 Multi-Provider Support

**Your implementation automatically supports ALL configured OAuth providers!**

### How It Works:

```
User signs in with Google:
  → Cognito creates: google_123456
  → Code detects: "google"
  → Links to native account ✅

User signs in with Facebook:
  → Cognito creates: facebook_789012
  → Code detects: "facebook"
  → Links to native account ✅

User signs in with Apple:
  → Cognito creates: apple_345678
  → Code detects: "apple"
  → Links to native account ✅
```

### What You Get:

```javascript
// DynamoDB user record:
{
  email: "user@example.com",
  sub: "abc-111",
  linkedProviders: ["google", "facebook", "apple"]
}

// User can now sign in with:
✅ Email + password
✅ Google
✅ Facebook
✅ Apple

// All methods access SAME account!
```

### Testing Multiple Providers:

**Day 1:**
```
1. Sign up: email@example.com + password
2. Sign in: Works ✅
```

**Day 2:**
```
3. Sign in with Google (same email)
4. Auto-links to existing account ✅
5. DynamoDB: linkedProviders = ["google"]
```

**Day 3:**
```
6. Sign in with Facebook (same email)
7. Auto-links to existing account ✅
8. DynamoDB: linkedProviders = ["google", "facebook"]
```

**Day 4:**
```
9. Sign in with Apple (same email)
10. Auto-links to existing account ✅
11. DynamoDB: linkedProviders = ["google", "facebook", "apple"]
```

**Result:** User can use ANY of the 4 methods to sign in! 🎉

---

**Cognito Setup Complete!** ✅

Now proceed to `AUTH_FLOW.md` for backend code.
