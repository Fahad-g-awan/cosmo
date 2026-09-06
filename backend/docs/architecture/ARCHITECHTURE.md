# 🏗️ Cosmediate Backend Architecture

**Comprehensive Technical Architecture & System Design**

---

## 📋 Table of Contents

1. [System Overview](#1-system-overview)
2. [Architectural Principles](#2-architectural-principles)
3. [System Architecture](#3-system-architecture)
4. [Technology Stack](#4-technology-stack)
5. [Data Architecture](#5-data-architecture)
6. [Authentication & Authorization](#6-authentication--authorization)
7. [Lambda Functions](#7-lambda-functions)
8. [Real-Time Features](#8-real-time-features)
9. [Search Infrastructure](#9-search-infrastructure)
10. [Security Architecture](#10-security-architecture)
11. [Scalability & Performance](#11-scalability--performance)
12. [Deployment & Configuration](#12-deployment--configuration)

---

## 1. System Overview

### 1.1 Purpose

Cosmediate is a serverless healthcare platform backend managing cosmetic treatment services across clinics, specialists, treatments, reviews, and patient interactions.

### 1.2 Core Business Domains

```
┌─────────────────────────────────────────────────┐
│              COSMEDIATE PLATFORM                │
├─────────────────────────────────────────────────┤
│                                                 │
│  Clinics          Specialists      Treatments   │
│  Management       Profiles         Catalog      │
│                                                 │
│  Reviews &        Users            Auth         │
│  Ratings          Management       System       │
│                                                 │
│  Search &         Real-time        Admin        │
│  Discovery        Notifications    Portal       │
└─────────────────────────────────────────────────┘
```

### 1.3 Key Features

- **Multi-Provider Authentication** - Email/password + OAuth (Google, Facebook, Apple) with auto-linking
- **RBAC System** - Granular permissions (Admin, Manager, Specialist, User)
- **Full-Text Search** - OpenSearch-powered search across all entities
- **Real-Time Updates** - WebSocket notifications for critical events
- **Audit Logging** - Complete audit trail for compliance

---

## 2. Architectural Principles

### 2.1 Core Principles

1. **Serverless-First** - AWS managed services, zero server management
2. **Event-Driven** - DynamoDB Streams, SQS, WebSocket for decoupling
3. **Single-Table Design** - One DynamoDB table for all entities
4. **API-First** - RESTful APIs with JSON, consistent error handling
5. **Security by Design** - JWT auth, input validation, permission checks

### 2.2 Design Patterns

- **API Gateway Pattern** - Single entry point for all requests
- **Lambda Layer Pattern** - Shared code across functions
- **Stream Processing Pattern** - Real-time data synchronization
- **Repository Pattern** - Data access abstraction

---

## 3. System Architecture

### 3.1 High-Level Architecture

```
┌──────────────────────────────────────────────────────┐
│                    CLIENTS                           │
│         (Web, Mobile, Admin Dashboard)               │
└────────────────────┬─────────────────────────────────┘
                     │ HTTPS
                     ▼
┌──────────────────────────────────────────────────────┐
│               API GATEWAY (REST + WebSocket)         │
│  • Request Routing  • Rate Limiting  • CORS          │
└────────────────────┬─────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────┐
│             LAMBDA AUTHORIZER                        │
│  • JWT Validation  • Permission Checks               │
└────────────────────┬─────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        ▼                         ▼
┌──────────────────┐     ┌──────────────────┐
│ Business Logic   │     │   WebSocket      │
│ Lambdas (17)     │     │   Handlers       │
└────────┬─────────┘     └────────┬─────────┘
         │                        │
         └────────────┬───────────┘
                      ▼
┌──────────────────────────────────────────────────────┐
│                   DATA LAYER                         │
│                                                      │
│  DynamoDB ──Streams──> Stream Handler Lambda        │
│  (Single Table)         ├─ Aggregations             │
│                         ├─ OpenSearch Sync          │
│                         └─ WebSocket Notifications  │
│                                                      │
│  OpenSearch     Cognito      S3        SQS          │
│  (Search)       (Auth)       (Files)   (Queues)     │
└──────────────────────────────────────────────────────┘
```

### 3.2 Request Flow

```
Client → API Gateway → Lambda Authorizer (JWT validation)
                    ↓ Allow/Deny
                    → Business Logic Lambda
                    ↓ Read/Write
                    → DynamoDB
                    ↓ Stream Event
                    → Stream Handler Lambda
                        ├─ Update Aggregations
                        ├─ Sync to OpenSearch
                        └─ Send WebSocket Notification
```

---

## 4. Technology Stack

### 4.1 AWS Services

| Service                 | Purpose               | Configuration                  |
| ----------------------- | --------------------- | ------------------------------ |
| **Lambda**              | Serverless compute    | Node.js 18.x, ES Modules       |
| **API Gateway**         | REST + WebSocket APIs | Regional, CORS enabled         |
| **DynamoDB**            | Primary database      | On-demand, Streams enabled     |
| **DynamoDB Streams**    | Change data capture   | NEW_AND_OLD_IMAGES             |
| **OpenSearch**          | Full-text search      | Multi-AZ, Auto-tune            |
| **Cognito**             | Authentication        | User Pool, OAuth providers     |
| **S3**                  | File storage          | Versioning, lifecycle policies |
| **SQS**                 | Message queues        | FIFO queues, DLQ enabled       |
| **SSM Parameter Store** | Configuration         | Secure strings, versioning     |
| **CloudWatch**          | Logging & monitoring  | Log groups, metrics, alarms    |

### 4.2 Core Dependencies

```json
{
  "runtime": "Node.js 18.x (ES Modules)",
  "aws-sdk": "@aws-sdk/client-* ^3.928.0",
  "validation": "ajv ^8.17.1",
  "search": "@opensearch-project/opensearch ^3.5.1",
  "auth": "aws-jwt-verify ^5.1.1",
  "utilities": "luxon ^3.7.1, uuid ^11.0.5, busboy ^1.6.0"
}
```

---

## 5. Data Architecture

### 5.1 Single-Table Design

**Table:** `cosmediate-{env}-main`

**Keys:**

- **PK** (Partition Key): Entity identifier (e.g., `USER#123`, `CLINIC#456`)
- **SK** (Sort Key): Item type or relationship (e.g., `METADATA`, `REVIEW#789`)

### 5.2 Entity Patterns

#### User Entity

```javascript
{
  PK: "USER#{userId}",
  SK: "METADATA",
  GSI1PK: "USER#{userId}",
  GSI1SK: "ENTITY_TYPE#USER",
  GSI4PK: "{cognitoSub}",
  GSI4SK: "SEARCH#SUB",

  id: "user123",
  email: "user@example.com",
  fullName: "John Doe",
  role: "user",
  permissions: ["user:read", "user:update"],
  linkedProviders: ["google"],
  passwordSet: true,
  status: "active",
  authType: "email"
}
```

#### Clinic Entity

```javascript
{
  PK: "CLINIC#{clinicId}",
  SK: "METADATA",

  id: "clinic123",
  name: "City Medical Center",
  about: "Premier healthcare facility",
  address: { /* ... */ },
  categoryIds: ["cat1"],
  specialistIds: ["spec1"],
  rating: 4.5,
  reviewCount: 120,
  status: "active"
}
```

#### Review Entity

```javascript
{
  PK: "REVIEW#{reviewId}",
  SK: "METADATA",
  GSI5PK: "CLINIC#{clinicId}",
  GSI5SK: "REVIEW#{reviewId}",

  id: "review123",
  userId: "user123",
  clinicId: "clinic123",
  specialistId: "spec123",
  rating: 5,
  comment: "Excellent service!",
  reply: { /* ... */ }
}
```

### 5.3 Global Secondary Indexes

| GSI         | Partition Key | Sort Key | Purpose                    |
| ----------- | ------------- | -------- | -------------------------- |
| **GSI1**    | GSI1PK        | GSI1SK   | Entity by ID queries       |
| **GSI2**    | GSI2PK        | GSI2SK   | Lookup by email hash       |
| **GSI3**    | GSI3PK        | GSI3SK   | Query by entity type       |
| **GSI4**    | GSI4PK        | GSI4SK   | Query by Cognito sub       |
| **GSI5-10** | Various       | Various  | Parent-child relationships |

### 5.4 Common Query Patterns

```javascript
// Get user by ID
PK = "USER#123" AND SK = "METADATA"

// Get user by Cognito sub
GSI4: GSI4PK = "{sub}" AND GSI4SK = "SEARCH#SUB"

// Get all clinic reviews
GSI5: GSI5PK = "CLINIC#123" AND GSI5SK begins_with "REVIEW#"

// Get all users
GSI3: GSI3PK = "SEARCH#ENTITY_TYPE" AND GSI3SK begins_with "ENTITY_TYPE#USER"
```

---

## 6. Authentication & Authorization

### 6.1 Authentication Mechanisms

**1. Email/Password**

```
Sign Up → Cognito CreateUser → Pre-Signup Trigger → Email Verification → Confirmed
Sign In → Cognito InitiateAuth → Pre-Token-Generation → JWT Tokens
```

**2. OAuth (Google/Facebook/Apple)**

```
OAuth Flow → Authorization Code → Exchange for Tokens → Auto-Link (if native exists) → JWT Tokens
```

**3. Account Linking** (See `AUTH_FLOW.md` for details)

- Automatic linking when OAuth user has same email as native account
- Uses `AdminLinkProviderForUser` API
- Both methods access same user profile

### 6.2 JWT Token Structure

```json
{
  "sub": "cognito-sub-uuid",
  "email": "user@example.com",
  "custom:userId": "USER#123",
  "custom:role": "user",
  "custom:permissions": "user:read,user:update",
  "custom:authType": "email",
  "exp": 1700000000
}
```

### 6.3 Authorization Flow

```
1. Client sends request with JWT in Authorization header
2. API Gateway invokes Lambda Authorizer
3. Authorizer validates JWT signature & expiration
4. Extracts user context (sub, role, permissions)
5. Checks if user has required permission for route
6. Returns Allow/Deny IAM policy
7. If Allow, invokes business logic Lambda with user context
```

### 6.4 Role-Based Access Control

**Roles:**

- **ADMIN** - Full system access, user management, content moderation
- **MANAGER** - Manage assigned clinics, specialists, respond to reviews
- **SPECIALIST** - Manage profile, respond to reviews
- **USER** - Create reviews, search, manage profile

**Permission Format:** `{resource}:{action}` (e.g., `clinic:update`, `review:delete`)

---

## 7. Lambda Functions

### 7.1 Function Inventory

| Function                            | Purpose                                  | Trigger                  |
| ----------------------------------- | ---------------------------------------- | ------------------------ |
| **cosmediate-authentication**       | Sign-up, sign-in, OAuth                  | API Gateway              |
| **cosmediate-api-authorizer**       | JWT validation, permissions              | API Gateway (Authorizer) |
| **cosmediate-pre-auth-signup**      | Signup validation, account linking check | Cognito Trigger          |
| **cosmediate-pre-auth-token-gen**   | JWT enrichment with custom claims        | Cognito Trigger          |
| **cosmediate-users**                | User CRUD operations                     | API Gateway              |
| **cosmediate-admins**               | Admin management                         | API Gateway              |
| **cosmediate-clinics**              | Clinic CRUD operations                   | API Gateway              |
| **cosmediate-specialists**          | Specialist management                    | API Gateway              |
| **cosmediate-treatments**           | Treatment catalog CRUD                   | API Gateway              |
| **cosmediate-reviews**              | Review & reply operations                | API Gateway              |
| **cosmediate-review-consumer**      | Process review SQS messages              | SQS                      |
| **cosmediate-db-stream-handler**    | Aggregations, search sync, notifications | DynamoDB Streams         |
| **cosmediate-image-upload**         | S3 image upload                          | API Gateway              |
| **cosmediate-opensearch-mapping**   | Index management (CREATE/MIGRATE/DELETE) | API Gateway              |
| **cosmediate-websocket-connect**    | WebSocket connection                     | API Gateway WebSocket    |
| **cosmediate-websocket-disconnect** | WebSocket disconnection                  | API Gateway WebSocket    |

### 7.2 Lambda Layer (Shared Code)

**Path:** `lambdaLayer/nodejs/`

**Structure:**

```
lib/
├── api/          # Request parsing, routing
├── auth/         # Auth utilities, permissions
├── db/           # Database registries, constants
├── mailer/       # Email templates & service
├── openSearch/   # Search utilities
├── socketApi/    # WebSocket client
├── sqs/          # SQS client
├── validation/   # AJV schemas
├── config.mjs    # SSM parameter loading
├── ctx.mjs       # Request context management
└── utils.mjs     # Common utilities

services/
├── auth.mjs      # Cognito operations
├── db.mjs        # DynamoDB operations
└── mailer.mjs    # Email service
```

---

## 8. Real-Time Features

### 8.1 WebSocket Architecture

```
Client ←WebSocket→ API Gateway ←→ WebSocket Lambdas
                                        ↓
                                  Store connection in DynamoDB
                                        ↓
DynamoDB Write → Streams → Stream Handler → Post to WebSocket API
                                                    ↓
                                            Notify connected clients
```

### 8.2 Notification Types

- **Review Created** - Notify clinic/specialist of new review
- **Review Reply** - Notify user of clinic response
- **Clinic Updated** - Notify followers of changes
- **Treatment Availability** - Notify interested users

### 8.3 Connection Management

```javascript
// Connect
{
  PK: "WEBSOCKET_CONNECTION#{connectionId}",
  SK: "METADATA",
  userId: "USER#123",
  connectionId: "abc123",
  connectedAt: "2025-11-15T00:00:00Z"
}
```

---

## 9. Search Infrastructure

### 9.1 OpenSearch Indices

**Pattern:** `{entity}-{env}` (e.g., `clinics-prod`, `specialists-dev`)

**Indexed Entities:**

- `admins-{env}`
- `users-{env}`
- `clinics-{env}`
- `specialists-{env}`
- `treatments-{env}`
- `reviews-{env}`

### 9.2 Indexing Pipeline

```
DynamoDB Write → DynamoDB Streams → Stream Handler Lambda
                                          ↓
                                    opsIndexing Module
                                          ↓
                                    OpenSearch Index
```

### 9.3 Search Features

- **Full-text search** across multiple fields
- **Fuzzy matching** for typo tolerance
- **Filters** (rating, price, location, status)
- **Aggregations** (counts, averages)
- **Sorting** (relevance, rating, date)

### 9.4 Index Operations

**Operations via `cosmediate-opensearch-mapping`:**

- **CREATE** - Create new index with alias
- **MIGRATE** - Reindex with new mapping
- **TRUNCATE** - Clear index with snapshot backup
- **DELETE** - Remove index
- **GET** - Retrieve mapping info

---

## 10. Security Architecture

### 10.1 Security Layers

```
Layer 1: API Gateway
  ├─ HTTPS only
  ├─ Rate limiting
  └─ CORS policies

Layer 2: Lambda Authorizer
  ├─ JWT signature validation
  ├─ Token expiration check
  └─ Permission verification

Layer 3: Input Validation
  ├─ AJV schema validation
  ├─ Type checking
  └─ Sanitization

Layer 4: Data Access
  ├─ Parameterized queries
  ├─ Least privilege IAM
  └─ Encryption at rest
```

### 10.2 Security Best Practices

**Authentication:**

- JWT tokens with short expiration (1 hour)
- Refresh tokens for session renewal
- HttpOnly cookies for web clients
- Secure password hashing (Cognito managed)

**Authorization:**

- Permission checks on every request
- Resource-level access control
- Audit logging for sensitive operations

**Data Protection:**

- Encryption at rest (DynamoDB, S3)
- Encryption in transit (TLS 1.2+)
- Secrets in AWS Secrets Manager
- No sensitive data in logs

**Input Validation:**

- AJV schema validation on all inputs
- `additionalProperties: false` to reject unknown fields
- SQL/NoSQL injection prevention
- XSS protection

---

## 11. Scalability & Performance

### 11.1 Scalability Features

**Auto-Scaling:**

- Lambda: Automatic concurrent execution scaling
- DynamoDB: On-demand billing with auto-scaling
- API Gateway: Handles millions of requests
- OpenSearch: Auto-tune for optimal performance

**Caching Strategy:**

- Redis for frequently accessed data
- API Gateway response caching
- CloudFront CDN for static assets
- Lambda layer caching across warm invocations

### 11.2 Performance Optimizations

**DynamoDB:**

- Single-table design reduces latency
- Strategic GSI usage for query patterns
- Batch operations for bulk writes
- DynamoDB Accelerator (DAX) ready

**Lambda:**

- Shared layer for common code (reduces cold starts)
- Provisioned concurrency for critical functions
- Memory optimization (1024MB-3008MB based on needs)
- Environment variable caching

**OpenSearch:**

- Dedicated master nodes
- Index rollover for large datasets
- Query result caching
- Shard optimization

---

## 12. Deployment & Configuration

### 12.1 Environment Configuration

**Environments:** `dev`, `staging`, `prod`

**Configuration Management:**

```
SSM Parameter Store
├─ /cosmediate/{env}/cognito/user_pool_id
├─ /cosmediate/{env}/cognito/client_id
├─ /cosmediate/{env}/db/table_name
├─ /cosmediate/{env}/opensearch/endpoint
├─ /cosmediate/{env}/s3/bucket
├─ /cosmediate/{env}/sqs/reviews_queue
└─ /cosmediate/{env}/url/backend_api

Secrets Manager
└─ /cosmediate/{env}/cognito/client_secret
```

### 12.2 Deployment Process

```
1. Build Lambda Layer
   └─ cd lambdaLayer && zip -r nodejs.zip nodejs/

2. Deploy Layer
   └─ aws lambda publish-layer-version

3. Build Lambda Functions
   └─ cd modules/{function} && zip -r function.zip .

4. Deploy Functions
   └─ aws lambda update-function-code

5. Configure API Gateway
   └─ Routes, authorizers, CORS, stages

6. Configure DynamoDB Streams
   └─ Enable streams, attach to stream handler

7. Configure Cognito Triggers
   └─ Attach pre-signup & pre-token-generation Lambdas
```

### 12.3 Infrastructure as Code (IaC)

**Recommended:** Use AWS CDK or Terraform for:

- DynamoDB table with GSIs
- Lambda functions with layer
- API Gateway (REST + WebSocket)
- Cognito User Pool with OAuth providers
- OpenSearch domain
- IAM roles and policies
- CloudWatch alarms

---

## 13. Monitoring & Observability

### 13.1 CloudWatch Metrics

**Lambda Metrics:**

- Invocations, Errors, Duration
- Concurrent executions
- Throttles

**DynamoDB Metrics:**

- Read/Write capacity units
- Throttled requests
- System errors

**API Gateway Metrics:**

- Request count, Latency (4xx, 5xx errors)
- Integration latency

### 13.2 Logging Strategy

**Log Groups:**

```
/aws/lambda/cosmediate-{function-name}
/aws/apigateway/cosmediate-{env}-api
/aws/opensearch/cosmediate-{env}
```

**Structured Logging:**

```javascript
console.log(
  JSON.stringify({
    level: "INFO",
    message: "User created",
    userId: "USER#123",
    timestamp: new Date().toISOString(),
    requestId: context.requestId,
  })
);
```

### 13.3 Alerting

**CloudWatch Alarms:**

- Lambda error rate > 5%
- API Gateway 5xx errors > 1%
- DynamoDB throttled requests > 0
- OpenSearch cluster status red

---

## 14. Data Flow Examples

### 14.1 Create Review Flow

```
1. Client: POST /reviews
   ↓
2. API Gateway → Lambda Authorizer (validate JWT)
   ↓
3. Lambda Authorizer → Allow policy
   ↓
4. cosmediate-reviews Lambda
   ├─ Validate input (AJV schema)
   ├─ Check user permissions
   ├─ Write to DynamoDB
   └─ Queue to SQS (async processing)
   ↓
5. DynamoDB Stream Event
   ↓
6. Stream Handler Lambda
   ├─ Update clinic review count
   ├─ Update clinic rating (aggregation)
   ├─ Sync to OpenSearch (indexing)
   └─ Send WebSocket notification to clinic
   ↓
7. SQS Consumer Lambda
   └─ Send email notification to clinic
```

### 14.2 Search Clinics Flow

```
1. Client: GET /clinics/search?q=dermatology&rating=4+
   ↓
2. API Gateway → cosmediate-clinics Lambda
   ↓
3. Lambda queries OpenSearch
   ├─ Multi-match query on name, about, services
   ├─ Filter: rating >= 4
   ├─ Sort by relevance score
   └─ Pagination (from, size)
   ↓
4. Return enriched results with aggregations
```

---

## 15. Key Architectural Decisions

### 15.1 Why Single-Table Design?

**Benefits:**

- ✅ Lower latency (single table queries)
- ✅ Cost efficiency (fewer resources)
- ✅ Atomic transactions across entities
- ✅ Easier data modeling

**Trade-offs:**

- ⚠️ Requires careful GSI design
- ⚠️ Complex access patterns need planning

### 15.2 Why DynamoDB Streams?

**Benefits:**

- ✅ Decoupled architecture
- ✅ Guaranteed delivery
- ✅ Real-time synchronization
- ✅ At-least-once processing

**Use Cases:**

- Aggregation updates (counts, ratings)
- OpenSearch synchronization
- WebSocket notifications
- Audit logging

### 15.3 Why OpenSearch?

**Benefits:**

- ✅ Full-text search capabilities
- ✅ Complex queries with filters
- ✅ Aggregations for analytics
- ✅ Scalable search infrastructure

**Alternative Considered:** DynamoDB scan/query

- ❌ Limited search capabilities
- ❌ High cost for large datasets
- ❌ No relevance scoring

---

## 16. Future Enhancements

### 16.1 Planned Improvements

1. **Caching Layer**

   - Implement Redis for frequently accessed data
   - Reduce DynamoDB read costs
   - Improve response times

2. **GraphQL API**

   - Add AppSync for flexible queries
   - Reduce over-fetching
   - Better frontend experience

3. **Enhanced Analytics**

   - Aggregate data warehouse (Redshift/Athena)
   - Business intelligence dashboards
   - Predictive analytics

4. **Multi-Region Support**

   - DynamoDB Global Tables
   - Route53 geo-routing
   - CloudFront distribution

5. **Advanced Search**
   - Geospatial search
   - Image-based search
   - Recommendation engine

---

## 17. References

- **README.md** - Project overview and getting started guide
- **AUTH_FLOW.md** - Detailed authentication and account linking flows
- **COGNITO_SETUP.md** - AWS Cognito configuration guide
- **PROJECT_STATUS_AND_TODO.md** - Development status and roadmap

---

**Last Updated:** November 16, 2025  
**Version:** 1.0.0  
**Architecture Status:** ✅ Production-Ready
