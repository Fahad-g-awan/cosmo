# 🏥 Cosmediate Backend

**Modern Healthcare Platform - AWS Serverless Architecture**

[![AWS](https://img.shields.io/badge/AWS-Lambda-orange)](https://aws.amazon.com/lambda/)
[![Node.js](https://img.shields.io/badge/Node.js-ES_Modules-green)](https://nodejs.org/)
[![DynamoDB](https://img.shields.io/badge/Database-DynamoDB-blue)](https://aws.amazon.com/dynamodb/)
[![OpenSearch](https://img.shields.io/badge/Search-OpenSearch-yellow)](https://opensearch.org/)

---

## 📋 Table of Contents

- [Project Overview](#-project-overview)
- [Architecture](#️-architecture)
- [Technology Stack](#-technology-stack)
- [Project Structure](#-project-structure)
- [Key Features](#-key-features)
- [Recent Improvements](#-recent-improvements)
- [Getting Started](#-getting-started)
- [Authentication System](#-authentication-system)
- [Database Design](#️-database-design)
- [Search Infrastructure](#-search-infrastructure)
- [Real-time Features](#-real-time-features)
- [API Documentation](#-api-documentation)
- [Deployment](#-deployment)
- [Testing](#-testing)
- [Contributing](#-contributing)

---

## 🎯 Project Overview

Cosmediate is a comprehensive healthcare platform backend built on AWS serverless architecture. It provides a robust, scalable solution for managing clinics, specialists, treatments, reviews, and patient interactions.

### **What It Does**

- **Clinic Management** - Complete clinic profiles with categories, managers, and services
- **Specialist Profiles** - Healthcare professional management with expertise tracking
- **Treatment Catalog** - Medical procedures with pricing, brands, and sub-treatments
- **Review System** - Patient feedback with ratings, comments, and replies
- **User Management** - Multi-provider authentication with advanced account linking
- **Real-time Notifications** - WebSocket-based live updates
- **Advanced Search** - Full-text search with filters using OpenSearch

---

## 🏗️ Architecture

### **High-Level Architecture**

```
┌─────────────────────────────────────────────────────────────┐
│                     API Gateway                              │
│           (REST API + WebSocket API)                         │
└────────────────┬────────────────────────────────────────────┘
                 │
    ┌────────────┼────────────┐
    │            │            │
    ▼            ▼            ▼
┌─────────┐  ┌─────────┐  ┌──────────┐
│ Lambda  │  │ Lambda  │  │  Lambda  │
│Functions│  │Functions│  │ Functions│
└────┬────┘  └────┬────┘  └────┬─────┘
     │            │            │
     └────────────┼────────────┘
                  │
         ┌────────┼────────┐
         │        │        │
         ▼        ▼        ▼
    ┌────────┬────────┬──────────┐
    │DynamoDB│OpenSearch│ Cognito │
    │        │        │          │
    └────────┴────────┴──────────┘
         │
         ▼
    ┌──────────┐
    │DDB Streams│
    └─────┬────┘
          │
          ▼
    ┌──────────────────┐
    │Stream Handler    │
    │- OpenSearch Sync │
    │- WebSocket Notify│
    │- Aggregations    │
    └──────────────────┘
```

### **AWS Services Used**

- **AWS Lambda** - Serverless compute (17 functions)
- **API Gateway** - REST & WebSocket APIs
- **DynamoDB** - NoSQL database (single-table design)
- **DynamoDB Streams** - Real-time change data capture
- **OpenSearch** - Full-text search engine
- **Cognito** - User authentication & authorization
- **SQS** - Message queuing for async processing
- **S3** - File storage for images
- **SES** - Email delivery service
- **SSM Parameter Store** - Configuration management
- **CloudWatch** - Logging and monitoring

---

## 🛠 Technology Stack

### **Runtime & Language**

- **Node.js** (ES Modules)
- **JavaScript** (Modern ES6+)

### **Core Dependencies**

```json
{
  "@aws-sdk/client-dynamodb": "^3.928.0",
  "@aws-sdk/client-cognito-identity-provider": "^3.928.0",
  "@aws-sdk/client-s3": "^3.928.0",
  "@aws-sdk/client-sqs": "^3.928.0",
  "@opensearch-project/opensearch": "^3.5.1",
  "ajv": "^8.17.1",
  "luxon": "^3.7.1",
  "aws-jwt-verify": "^5.1.1",
  "busboy": "^1.6.0",
  "uuid": "^11.0.5"
}
```

### **Key Libraries**

- **AJV** - JSON Schema validation with strict type checking
- **Luxon** - Date/time manipulation
- **AWS JWT Verify** - Token validation
- **Busboy** - Multipart form data parsing
- **Nodemailer** - Email templates and delivery

---

## 📁 Project Structure

```
cosmediate/backend/
│
├── lambdaLayer/                    # Shared code layer
│   └── nodejs/
│       ├── lib/                    # Reusable libraries
│       │   ├── api/                # API utilities (routing, parsing)
│       │   ├── auth/               # Authentication & authorization
│       │   ├── db/                 # Database registries & constants
│       │   ├── mailer/             # Email templates & service
│       │   ├── openSearch/         # Search utilities
│       │   ├── socketApi/          # WebSocket client
│       │   ├── sqs/                # SQS client
│       │   ├── validation/         # Input validation schemas
│       │   ├── config.mjs          # Environment configuration
│       │   ├── ctx.mjs             # Request context management
│       │   └── utils.mjs           # Common utilities
│       │
│       └── services/               # Core services
│           ├── auth.mjs            # Cognito authentication
│           ├── db.mjs              # DynamoDB operations
│           └── mailer.mjs          # Email service
│
├── modules/                        # Lambda functions
│   ├── cosmediate-admins/          # Admin user management
│   ├── cosmediate-api-authorizer/  # JWT token validation
│   ├── cosmediate-authentication/  # Sign-up, sign-in, OAuth
│   ├── cosmediate-clinics/         # Clinic CRUD operations
│   ├── cosmediate-db-stream-handler/ # DynamoDB streams processor
│   │   ├── aggregation/            # Count updates
│   │   ├── opsIndexing/            # OpenSearch sync
│   │   └── socket/                 # WebSocket notifications
│   ├── cosmediate-image-upload/    # Image upload to S3
│   ├── cosmediate-opensearch-mapping/ # Index management
│   ├── cosmediate-pre-auth-signup/ # Cognito pre-signup trigger
│   ├── cosmediate-pre-auth-token-gen/ # JWT enrichment
│   ├── cosmediate-review-consumer/ # SQS review processor
│   ├── cosmediate-reviews/         # Review & reply CRUD
│   ├── cosmediate-specialists/     # Specialist management
│   ├── cosmediate-treatments/      # Treatment catalog
│   ├── cosmediate-users/           # User profile management
│   ├── cosmediate-websocket-connect/ # WebSocket connection
│   └── cosmedium-websocket-disconnect/ # WebSocket disconnection
│
├── docs/                           # Documentation
│   ├── AUTH_FLOW.md                # Authentication documentation
│   ├── COGNITO_SETUP.md            # Cognito configuration guide
│   ├── PROJECT_STATUS_AND_TODO.md  # Development status
│
└── README.md                       # This file
```

---

## ✨ Key Features

### **1. Advanced Authentication System**

#### Multi-Provider Support

- ✅ **Email/Password** authentication
- ✅ **OAuth 2.0** with Google, Facebook, Apple
- ✅ **Account Linking** - Link multiple auth methods to one account
- ✅ **Auto-Linking** - Automatic account merging on sign-in
- ✅ **JWT Tokens** - Custom claims with role & permissions

#### Account Linking Features

```javascript
// User signs up with email → later links Google
User: john@example.com (password)
  ↓ Links Google OAuth
User: john@example.com (password + Google)
  ↓ Can sign in with either method
✅ Single user profile, multiple auth methods
```

**See:** [`AUTH_FLOW.md`](./AUTH_FLOW.md) for detailed flows

---

### **2. Role-Based Access Control (RBAC)**

#### User Roles

- **USER** - Standard patients
- **ADMIN** - Platform administrators
- **MANAGER** - Clinic managers
- **SPECIALIST** - Healthcare professionals

#### Permission System

```javascript
{
  ADMIN: {
    CREATE: "admin:create",
    UPDATE: "admin:update",
    DELETE: "admin:delete",
    GET: "admin:get"
  },
  CLINIC: { /* ... */ },
  SPECIALIST: { /* ... */ },
  TREATMENT: { /* ... */ }
}
```

---

### **3. Single-Table DynamoDB Design**

#### Key Structure

```
PK (Partition Key)           SK (Sort Key)
───────────────────          ──────────────
USER#{userId}                METADATA
CLINIC#{clinicId}            METADATA
SPECIALIST#{specialistId}    METADATA
TREATMENT#{treatmentId}      METADATA
REVIEW#{reviewId}            METADATA
```

#### Global Secondary Indexes (GSIs)

- **GSI1** - Entity-based queries
- **GSI2** - User role lookups
- **GSI3** - Search entity type
- **GSI4** - Sub-based queries
- **GSI5** - Parent-child relationships
- **GSI6** - Parent-child relationships
- **GSI7** - Parent-child relationships
- **GSI8** - Parent-child relationships
- **GSI9** - Parent-child relationships
- **GSI10** - Parent-child relationships

---

### **4. Full-Text Search with OpenSearch**

#### Indexed Entities

- Clinics (with categories, specialists, treatments)
- Specialists (with working locations, expertise)
- Treatments (with brands, pricing, descriptions)
- Reviews (with ratings, comments)
- Users (for admin searches)

#### Search Features

- ✅ Autocomplete
- ✅ Fuzzy matching
- ✅ Multi-field search
- ✅ Filters (price, rating, location)
- ✅ Aggregations (counts, averages)
- ✅ Sorting

---

### **5. Real-Time Updates**

#### WebSocket Architecture

```
User Action → DynamoDB → Stream → Lambda Handler
                                        ↓
                                  WebSocket API
                                        ↓
                              Connected Clients
```

#### Use Cases

- New review notifications
- Clinic updates
- Treatment availability changes
- System announcements

---

### **6. Comprehensive Validation**

#### Schema-Based Validation (AJV)

```javascript
{
  "type": "object",
  "required": ["email", "password"],
  "properties": {
    "email": { "type": "string", "format": "email" },
    "password": { "type": "string", "minLength": 8 }
  }
}
```

#### Features

- Strict type checking
- Input sanitization
- Custom error messages
- Nested object validation

---

### **7. Email Service**

#### Capabilities

- ✅ Template-based emails
- ✅ CC/BCC support
- ✅ Retry logic with exponential backoff
- ✅ Queue system for batch processing
- ✅ AWS SES integration

#### Email Types

- Welcome emails
- Password reset
- Email verification
- Review notifications
- Admin notifications

## 🚀 Getting Started

### **Prerequisites**

- Node.js 18+ (for local development)
- AWS Account with appropriate permissions
- AWS CLI configured
- Access to DynamoDB, Cognito, OpenSearch cluster

### **1. Clone Repository**

```bash
git clone <repository-url>
cd cosmediate/backend
```

### **2. Install Lambda Layer Dependencies**

```bash
cd lambdaLayer/nodejs
npm install
cd ../..
```

### **3. Configure AWS Resources**

#### Set up Cognito User Pool

Follow detailed instructions in [`COGNITO_SETUP.md`](./COGNITO_SETUP.md)

#### Create DynamoDB Table

```bash
# Table name: cosmediate-{env}-main
# Partition Key: PK (String)
# Sort Key: SK (String)
# GSIs: GSI1-GSI5 (see database design section)
```

#### Configure SSM Parameters

```bash
aws ssm put-parameter \
  --name "/cosmediate/prod/config" \
  --value '{
    "DB_TABLE_NAME": "cosmediate-prod-main",
    "COGNITO_USER_POOL_ID": "...",
    "COGNITO_CLIENT_ID": "...",
    "OPENSEARCH_ENDPOINT": "...",
    ...
  }' \
  --type SecureString
```

### **4. Deploy Lambda Layer**

```bash
cd lambdaLayer
zip -r nodejs.zip nodejs/
aws lambda publish-layer-version \
  --layer-name cosmediate-layer \
  --zip-file fileb://nodejs.zip \
  --compatible-runtimes nodejs18.x
```

### **5. Deploy Lambda Functions**

```bash
# Deploy each module
cd modules/cosmediate-authentication
zip -r function.zip .
aws lambda update-function-code \
  --function-name cosmediate-authentication \
  --zip-file fileb://function.zip
```

### **6. Set Up API Gateway**

- Create REST API
- Create WebSocket API
- Configure routes to Lambda functions
- Set up custom authorizer using `cosmediate-api-authorizer`

---

## 🔐 Authentication System

### **Authentication Flow**

#### 1. Sign Up (Email/Password)

```
POST /auth/signup
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "fullName": "John Doe"
}

→ Creates Cognito user (UNCONFIRMED)
→ Sends verification email
→ Creates DynamoDB user record
```

#### 2. Email Verification

```
POST /auth/verify
{
  "email": "user@example.com",
  "code": "123456"
}

→ Confirms Cognito user
→ Updates DynamoDB status
```

#### 3. Sign In (Email/Password)

```
POST /auth/signin
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}

→ Returns JWT tokens
→ Creates session
→ Sets HttpOnly cookies
```

#### 4. OAuth Sign In (Google/Facebook/Apple)

```
GET /auth/oauth/google
→ Redirects to Google consent
→ Google returns authorization code
→ Backend exchanges code for tokens
→ Auto-links if email exists
→ Returns JWT tokens
```

### **Token Structure**

#### ID Token (JWT)

```json
{
  "sub": "user-uuid",
  "email": "user@example.com",
  "role": "user",
  "permissions": ["user:read", "user:update"],
  "userId": "USER#123",
  "authType": "email"
}
```

### **Authorization**

#### Protected Routes

```javascript
// Requires valid JWT token
Authorization: Bearer <token>

// Checked by cosmediate-api-authorizer
→ Validates signature
→ Checks expiration
→ Enriches request with user context
```

---

## 🗄️ Database Design

### **Single-Table Design Philosophy**

All entities in one DynamoDB table with strategic GSI usage for efficient queries.

### **Entity Patterns**

#### User Entity

```javascript
{
  PK: "USER#{userId}",
  SK: "METADATA",
  GSI1PK: "USER#{userId}",
  GSI1SK: "USER",
  GSI2PK: "ROLE#user",
  GSI2SK: "USER#email@example.com",
  GSI4PK: "{cognitoSub}",
  GSI4SK: "USER",

  id: "user123",
  email: "user@example.com",
  fullName: "John Doe",
  role: "user",
  permissions: ["user:read", "user:update"],
  linkedProviders: ["google", "facebook"],
  passwordSet: true,
  entityType: "user",
  createdAt: "2025-11-15T00:00:00Z",
  updatedAt: "2025-11-15T00:00:00Z"
}
```

#### Clinic Entity

```javascript
{
  PK: "CLINIC#{clinicId}",
  SK: "METADATA",
  GSI1PK: "CLINIC#{clinicId}",
  GSI1SK: "CLINIC",
  GSI3PK: "SEARCH",
  GSI3SK: "CLINIC#{clinicName}",

  id: "clinic123",
  name: "City Medical Center",
  about: "Premier healthcare facility",
  address: { /* ... */ },
  categoryIds: ["cat1", "cat2"],
  categories: [{ id, name }],
  managerIds: ["mgr1"],
  specialistIds: ["spec1", "spec2"],
  rating: 4.5,
  reviewCount: 120,
  entityType: "clinic"
}
```

### **Query Patterns**

```javascript
// Get user by ID
PK = "USER#123" AND SK = "METADATA"

// Get all users
GSI1PK = "USER" (begins_with)

// Find user by sub
GSI4PK = "{cognitoSub}" AND GSI4SK = "USER"

// Get user by role
GSI2PK = "ROLE#admin"

// Search entities
GSI3PK = "SEARCH" AND GSI3SK begins_with "CLINIC#"
```

---

## 🔍 Search Infrastructure

### **OpenSearch Index Strategy**

#### Separate Indices per Environment

```
- admins-dev / admins-prod
- users-dev / users-prod
- clinics-dev / clinics-prod
- specialists-dev / specialists-prod
- treatments-dev / treatments-prod
- reviews-dev / reviews-prod
```

### **Indexing Pipeline**

```
DynamoDB Write
    ↓
DynamoDB Stream
    ↓
cosmediate-db-stream-handler
    ↓
opsIndexing Module
    ↓
OpenSearch Index
```

### **Search Queries**

#### Basic Search

```javascript
{
  "query": {
    "multi_match": {
      "query": "dermatology",
      "fields": ["name^2", "about", "services"]
    }
  }
}
```

#### Advanced Search with Filters

```javascript
{
  "query": {
    "bool": {
      "must": [
        { "match": { "name": "clinic" } }
      ],
      "filter": [
        { "range": { "rating": { "gte": 4.0 } } },
        { "term": { "categoryIds": "dermatology" } }
      ]
    }
  },
  "sort": [
    { "rating": "desc" },
    { "reviewCount": "desc" }
  ]
}
```

---

## ⚡ Real-time Features

### **WebSocket Architecture**

#### Connection Management

```javascript
// Connect
WSS /connect → cosmediate-websocket-connect
→ Stores connection in DynamoDB

// Disconnect
WSS /disconnect → cosmediate-websocket-disconnect
→ Removes connection from DynamoDB
```

#### Message Broadcasting

```javascript
// On DynamoDB change
DynamoDB Stream → cosmediate-db-stream-handler
→ socket/handler.mjs
→ Fetches all active connections
→ Posts messages to WebSocket API
→ Delivers to connected clients
```

#### Message Format

```json
{
  "type": "REVIEW_CREATED",
  "data": {
    "reviewId": "review123",
    "clinicId": "clinic456",
    "rating": 5,
    "comment": "Excellent service!"
  },
  "timestamp": "2025-11-15T00:00:00Z"
}
```

---

## 📚 API Documentation

### **Core Endpoints**

#### Authentication

```
POST   /auth/signup              - Sign up with email/password
POST   /auth/signin              - Sign in
POST   /auth/verify              - Verify email
POST   /auth/forgot-password     - Request password reset
POST   /auth/reset-password      - Reset password
POST   /auth/update-password     - Change password
GET    /auth/oauth/google        - OAuth with Google
POST   /auth/link-oauth          - Link OAuth provider
POST   /auth/set-password-oauth  - Set password for OAuth user
POST   /auth/refresh             - Refresh tokens
POST   /auth/signout             - Sign out
```

#### Users

```
GET    /users/{id}               - Get user by ID
GET    /users                    - List users (admin)
PATCH  /users/{id}               - Update user
DELETE /users/{id}               - Delete user
```

#### Clinics

```
POST   /clinics                  - Create clinic
GET    /clinics/{id}             - Get clinic
GET    /clinics                  - List/search clinics
PATCH  /clinics/{id}             - Update clinic
DELETE /clinics/{id}             - Delete clinic
```

#### Specialists

```
POST   /specialists              - Create specialist
GET    /specialists/{id}         - Get specialist
GET    /specialists              - List/search specialists
PATCH  /specialists/{id}         - Update specialist
DELETE /specialists/{id}         - Delete specialist
```

#### Treatments

```
POST   /treatments               - Create treatment
GET    /treatments/{id}          - Get treatment
GET    /treatments               - List/search treatments
PATCH  /treatments/{id}          - Update treatment
DELETE /treatments/{id}          - Delete treatment
```

#### Reviews

```
POST   /reviews                  - Create review
GET    /reviews/{id}             - Get review
GET    /reviews                  - List reviews
PATCH  /reviews/{id}             - Update review
DELETE /reviews/{id}             - Delete review
POST   /reviews/{id}/reply       - Reply to review
```

### **Response Format**

#### Success Response

```json
{
  "statusCode": 200,
  "data": {
    "message": "Operation successful",
    "user": {
      /* ... */
    }
  }
}
```

#### Error Response

```json
{
  "statusCode": 400,
  "error": "Validation Error",
  "details": ["Email is required", "Password must be at least 8 characters"]
}
```

---

## 🚢 Deployment

### **Environment Configuration**

#### Development

```bash
ENV=dev
DB_TABLE_NAME=cosmediate-dev-main
COGNITO_USER_POOL_ID=eu-central-1_DEV
OPENSEARCH_ENDPOINT=https://search-dev.es.amazonaws.com
```

#### Production

```bash
ENV=prod
DB_TABLE_NAME=cosmediate-prod-main
COGNITO_USER_POOL_ID=eu-central-1_PROD
OPENSEARCH_ENDPOINT=https://search-prod.es.amazonaws.com
```

---

### **Development Guidelines**

1. **Code Style**

   - Use ES6+ features
   - Follow existing patterns
   - Add JSDoc comments
   - Use async/await (no callbacks)

2. **Naming Conventions**

   - Files: `camelCase.mjs`
   - Functions: `camelCase`
   - Constants: `UPPER_SNAKE_CASE`
   - Classes: `PascalCase`

3. **Error Handling**

   - Always use try-catch
   - Use `fail()` utility for errors
   - Log errors with context
   - Return structured error responses

4. **Validation**

   - Validate all inputs using AJV schemas
   - Sanitize user input
   - Use strict type checking

5. **Security**
   - Never log sensitive data
   - Validate JWT tokens
   - Check permissions
   - Use parameterized queries

### **Pull Request Process**

1. Create feature branch from `main`
2. Make changes with clear commits
3. Update documentation
4. Test thoroughly
5. Create PR with description
6. Address review comments
7. Merge after approval

---

## 📞 Support & Contact

For questions, issues, or contributions, please:

- Open an issue on GitHub
- Contact the development team
- Review existing documentation

---

## 📄 License

License information coming soon

---

## 🎉 Acknowledgments

Built with:

- **AWS Services** - Lambda, DynamoDB, Cognito, OpenSearch
- **Node.js Community** - For excellent packages
- **OpenSearch Project** - For powerful search capabilities

---

**Last Updated:** November 15, 2025  
**Version:** 1.0.0  
**Status:** ✅ Production Ready (with recommended improvements pending)
