# 🌊 DynamoDB Stream Handler Architecture

**Lambda Function**: `cosmediate-db-stream-handler`  
**Purpose**: Real-time processing of DynamoDB change events for search indexing, aggregation, and WebSocket notifications  
**Trigger**: DynamoDB Streams

---

## 📋 Overview

The **DB Stream Handler** is a critical Lambda function that processes DynamoDB Stream events in real-time. It acts as the central nervous system for keeping derived data stores synchronized and notifying connected clients of data changes.

### Key Responsibilities

- **OpenSearch Synchronization**: Keep search indices up-to-date with database changes
- **Aggregation Management**: Update entity counts (reviews, specialists, etc.)
- **WebSocket Notifications**: Broadcast real-time updates to connected clients
- **Event Orchestration**: Coordinate multiple downstream operations for each DB change

---

## 🏗️ Architecture

### Event Flow

```
┌─────────────────┐
│   DynamoDB      │
│   Table         │
└────────┬────────┘
         │ Change Events
         ↓
┌─────────────────┐
│ DynamoDB Streams│
│  (CDC)          │
└────────┬────────┘
         │
         ↓
┌────────────────────────────┐
│ DB Stream Handler Lambda   │
├────────────────────────────┤
│  1. Parse Stream Records   │
│  2. Identify Entity Type   │
│  3. Process in Parallel:   │
│     ├─ OpenSearch Sync     │
│     ├─ Aggregation Update  │
│     └─ WebSocket Notify    │
└────────────────────────────┘
         │
    ┌────┼────┐
    │    │    │
    ▼    ▼    ▼
┌─────┐┌──┐┌────┐
│ OPS ││SQS││WS  │
└─────┘└──┘└────┘
```

### Handler Structure

```
cosmediate-db-stream-handler/
├── index.mjs                    # Main handler
├── opsIndexing/                 # OpenSearch synchronization
│   ├── handler.mjs              # OPS event processor
│   └── lib/
│       ├── registry.mjs         # Entity-to-index mapping
│       └── utils.mjs            # Index utilities
├── aggregation/                 # Count management
│   ├── handler.mjs              # Aggregation processor
│   └── [entity-specific]/       # Per-entity aggregation logic
└── socket/                      # WebSocket notifications
    ├── handler.mjs              # Socket event processor
    └── lib/                     # Socket utilities
```

---

## 🔄 Core Components

### 1. Main Handler (`index.mjs`)

**Responsibilities:**

- Receive and parse DynamoDB Stream records
- Unmarshal DynamoDB JSON to standard JavaScript objects
- Determine entity type from stream event
- Route to appropriate sub-handlers
- Error handling and logging

**Event Structure:**

```javascript
{
  Records: [
    {
      eventName: "INSERT" | "MODIFY" | "REMOVE",
      dynamodb: {
        NewImage: {
          /* DynamoDB JSON */
        },
        OldImage: {
          /* DynamoDB JSON */
        },
      },
    },
  ];
}
```

**Processing Logic:**

```javascript
for (const rec of event.Records) {
  // 1. Unmarshal DynamoDB JSON
  const newItem = unmarshall(rec.dynamodb.NewImage);
  const oldItem = unmarshall(rec.dynamodb.OldImage);

  // 2. Determine entity type
  const entityType = newItem?.GSI3PK || newItem?.entityType;

  // 3. Process in parallel
  await Promise.all([
    opsEventHandler({...}),
    aggregationHandler({...}),
    socketHandler({...})
  ]);
}
```

---

### 2. OpenSearch Indexing (`opsIndexing/`)

**Purpose**: Synchronize DynamoDB changes to OpenSearch indices for full-text search

#### Entity-to-Index Mapping

```javascript
export const ENTITY_TO_BASE = {
  "ENTITY_TYPE#OAUTH_CLIENT_APP": "oauth_client_apps",
  "ENTITY_TYPE#ADMIN": "admins",
  "ENTITY_TYPE#USER": "users",
  "ENTITY_TYPE#TREATMENT_CATEGORY": "treatment_categories",
  "ENTITY_TYPE#MASTER_TREATMENT": "master_treatments",
  "ENTITY_TYPE#SELECTED_TREATMENT": "selected_treatments",
  "ENTITY_TYPE#SUB_TREATMENT": "sub_treatments",
  "ENTITY_TYPE#TREATMENT_RESULT": "treatment_results",
  "ENTITY_TYPE#TREATMENT_BRAND": "treatment_brands",
  "ENTITY_TYPE#CLINIC_CATEGORY": "clinic_categories",
  "ENTITY_TYPE#CLINIC_MANAGER": "clinic_managers",
  "ENTITY_TYPE#CLINIC": "clinics",
  "ENTITY_TYPE#SPECIALIST": "specialists",
  "ENTITY_TYPE#REVIEW": "reviews",
  "ENTITY_TYPE#REVIEW_REPLY": "review_replies",
};
```

#### Operations by Event Type

| Event Type | Action          | Description                     |
| ---------- | --------------- | ------------------------------- |
| `INSERT`   | Index Document  | Add new document to OpenSearch  |
| `MODIFY`   | Update Document | Update existing document fields |
| `REMOVE`   | Delete Document | Remove document from index      |

#### Index Alias Pattern

```javascript
// Alias format: {base}-{env}
// Examples:
// - admins-dev
// - clinics-prod
// - reviews-dev

const indexAlias = `${baseEntityName}-${env}`;
```

**Processing Steps:**

1. Map entity type to OpenSearch index base
2. Construct index alias with environment
3. Extract document ID from DynamoDB item
4. Perform appropriate OpenSearch operation:
   - INSERT → `index()` operation
   - MODIFY → `update()` operation
   - REMOVE → `delete()` operation

---

### 3. Aggregation Handler (`aggregation/`)

**Purpose**: Maintain count fields and aggregate statistics

#### Aggregation Types

**1. Review Counts**

- Update clinic `totalReviews` count when review is added/removed
- Update specialist `totalReviews` count
- Recalculate average ratings

**2. Specialist Counts**

- Update clinic `totalSpecialists` when specialist is linked/unlinked

**3. Treatment Counts**

- Update clinic `totalTreatments` when treatment offering changes

**Processing Logic:**

```javascript
// Example: Review count aggregation
if (entityType === "ENTITY_TYPE#REVIEW") {
  if (eventType === "INSERT") {
    // Increment clinic/specialist review count
    await incrementReviewCount(clinicId);
  } else if (eventType === "REMOVE") {
    // Decrement clinic/specialist review count
    await decrementReviewCount(clinicId);
  }
}
```

**Update Methods:**

- Direct DynamoDB updates using `UpdateItemCommand`
- Atomic increment/decrement operations
- OpenSearch sync happens automatically via stream

---

### 4. WebSocket Handler (`socket/`)

**Purpose**: Broadcast real-time updates to connected WebSocket clients

#### Notification Flow

```
Stream Event
     │
     ▼
Determine Affected Entities
     │
     ▼
Build Notification Payload
     │
     ▼
Get Connected Client IDs
     │
     ▼
Send to SQS (async fanout)
     │
     ▼
WebSocket API broadcasts to clients
```

#### Event Types

| Database Event   | WebSocket Event      | Affected Clients             |
| ---------------- | -------------------- | ---------------------------- |
| Review Created   | `review:created`     | Clinic managers, specialists |
| Review Updated   | `review:updated`     | Review author, clinic        |
| Specialist Added | `specialist:created` | Clinic managers, admins      |
| Clinic Updated   | `clinic:updated`     | Clinic managers, subscribers |

#### Payload Structure

```javascript
{
  event: "review:created",
  entityType: "REVIEW",
  entityId: "review_123",
  data: {
    clinicId: "clinic_456",
    specialistId: "specialist_789",
    rating: 5,
    comment: "Great experience!"
  },
  timestamp: "2024-12-11T20:00:00Z"
}
```

**Processing Steps:**

1. Parse stream event and extract relevant data
2. Determine notification type based on entity and event
3. Identify affected users/connections
4. Build notification payload
5. Send to SQS for async delivery
6. SQS consumer sends via WebSocket API

---

## 🔐 Access Patterns

### DynamoDB Read Operations

```javascript
// Get entity for aggregation
const params = {
  TableName: config.DB_TABLE_NAME,
  Key: {
    PK: { S: clinicId },
    SK: { S: clinicId },
  },
};
```

### DynamoDB Update Operations

```javascript
// Atomic increment
const params = {
  TableName: config.DB_TABLE_NAME,
  Key: { PK: clinicId, SK: clinicId },
  UpdateExpression: "ADD totalReviews :inc",
  ExpressionAttributeValues: {
    ":inc": 1,
  },
};
```

### OpenSearch Operations

```javascript
// Index document
await opsClient.index({
  index: indexAlias,
  id: documentId,
  body: documentData,
});

// Update document
await opsClient.update({
  index: indexAlias,
  id: documentId,
  body: {
    doc: partialUpdate,
  },
});

// Delete document
await opsClient.delete({
  index: indexAlias,
  id: documentId,
});
```

---

## ⚙️ Configuration

### Environment Variables

```env
# DynamoDB
DB_TABLE_NAME=cosmediate-prod
AWS_REGION=us-east-1

# OpenSearch
OPENSEARCH_DOMAIN=https://search-cosmediate-xxx.us-east-1.es.amazonaws.com
OPENSEARCH_USERNAME=admin
OPENSEARCH_PASSWORD=xxx

# WebSocket
WEBSOCKET_API_ENDPOINT=wss://xxx.execute-api.us-east-1.amazonaws.com/prod

# SQS
SQS_NOTIFICATION_QUEUE=cosmediate-notifications
```

### Stream Configuration

- **Batch Size**: 100 records
- **Batch Window**: 10 seconds
- **Concurrent Batches**: 2
- **Retry Attempts**: 2
- **Bisect on Error**: Enabled

---

## 🎯 Processing Guarantees

### At-Least-Once Delivery

DynamoDB Streams guarantee at-least-once delivery, meaning:

- Events may be processed multiple times
- Handler must be idempotent
- OpenSearch operations use document IDs (upsert behavior)
- Aggregations use atomic operations

### Ordering Guarantees

- **Per Shard**: Events are ordered within a shard
- **Cross Shard**: No ordering guarantee
- **Same Item**: Updates to the same item maintain order

### Error Handling

```javascript
try {
  await opsEventHandler({...});
} catch (error) {
  console.error("opsEventHandler failed:", error);
  results.push({ entityType, eventType, error });
  // Continue processing other handlers
}
```

**Strategy:**

- Each sub-handler has independent error handling
- Failures logged but don't block other operations
- Failed records can be retried via dead-letter queue
- Critical failures trigger CloudWatch alarms

---

## 📊 Monitoring

### CloudWatch Metrics

- **Invocations**: Total stream handler executions
- **Errors**: Failed processing attempts
- **Duration**: Processing time per batch
- **Iterator Age**: Stream processing lag

### Custom Metrics

```javascript
// Track processing results
{
  ok: true,
  results: [
    { entityType: "REVIEW", eventType: "INSERT", status: "success" },
    { entityType: "CLINIC", eventType: "MODIFY", status: "success" }
  ]
}
```

### Alerts

- Stream iterator age > 1 minute
- Error rate > 5%
- Processing duration > 30 seconds
- Dead-letter queue depth > 10

---

## 🚀 Performance Optimization

### Batch Processing

```javascript
// Process multiple records in parallel
await Promise.all(records.map((record) => processRecord(record)));
```

### Connection Reuse

```javascript
// Initialize clients outside handler
const opsClient = await getOpenSearchClient(config);
const socketClient = await getSocketApiClient(config);
const sqsClient = await getSqsClient(config);
```

### Selective Processing

```javascript
// Skip unknown entities early
const base = ENTITY_TO_BASE[entityType];
if (!base) {
  console.log("Skip: unknown entity", entityType);
  continue;
}
```

---

## 🔮 Future Enhancements

1. **Event Sourcing**: Store all events for replay and debugging
2. **Transformation Pipelines**: Pluggable transformation logic
3. **Conditional Processing**: Skip updates if data hasn't changed
4. **Metrics Dashboard**: Real-time monitoring dashboard
5. **Schema Validation**: Validate documents before indexing
6. **Retry Queue**: Dedicated queue for failed operations
7. **Rate Limiting**: Throttle OpenSearch operations during high load

---

## 📚 Related Documentation

- [OpenSearch Mapping Architecture](./OPS_MAPPING.md)
- [WebSocket API Documentation](../websocket/README.md)
- [DynamoDB Table Design](../database/TABLE_DESIGN.md)
- [Aggregation Logic](../aggregation/README.md)

---

**Last Updated**: December 11, 2024  
**Version**: 1.0.0  
**Status**: Production
