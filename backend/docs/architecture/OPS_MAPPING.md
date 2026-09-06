# 🔍 OpenSearch Mapping & Index Management

**Lambda Function**: `cosmediate-opensearch-mapping`  
**Purpose**: Manage OpenSearch index creation, migration, and schema evolution  
**Execution**: Manual invocation for index operations

---

## 📋 Overview

The **OpenSearch Mapping** module is a management Lambda function responsible for creating, updating, and maintaining OpenSearch indices. It handles index schema definitions, mapping configurations, and index lifecycle operations.

### Key Responsibilities

- **Index Creation**: Create new indices with proper mappings
- **Schema Migration**: Update existing indices with new fields
- **Index Management**: Truncate, delete, and manage indices
- **Environment Separation**: Maintain separate indices for dev and prod
- **Type Safety**: Enforce strict mappings for all searchable entities

---

## 🏗️ Architecture

### Mapping System

```
┌───────────────────────────────────┐
│  cosmediate-opensearch-mapping    │
├───────────────────────────────────┤
│  1. Define Target & Action        │
│  2. Load Mapping Schema           │
│  3. Execute OpenSearch Operation  │
│  4. Verify Result                 │
└───────────────────────────────────┘
         │
    ┌────┼────┐
    │         │
    ▼         ▼
┌─────────┐ ┌──────────┐
│  Index  │ │  Alias   │
│ Creation│ │Management│
└─────────┘ └──────────┘
```

### Module Structure

```
cosmediate-opensearch-mapping/
├── index.mjs                  # Main handler
├── legacy/                    # Deferred entity schemas (reference only)
└── lib/
    ├── schemas/               # Active: admin, patient, mappingFor
    ├── operations.mjs         # Index operations (CRUD)
    ├── constants.mjs          # TARGET, ACTION, ENV, shard/replica defaults
    ├── settings.mjs           # Index settings
    ├── types.mjs              # Field type definitions
    └── utils.mjs              # Utility functions
```

---

## 📊 Index Registry

### Supported Entities

```javascript
export const TARGET = {
  OAUTH_CLIENT_APPS: "oauth_client_apps",
  ADMINS: "admins",
  USERS: "users",
  TREATMENT_BRANDS: "treatment_brands",
  TREATMENT_CATEGORIES: "treatment_categories",
  MASTER_TREATMENTS: "master_treatments",
  SELECTED_TREATMENTS: "selected_treatments",
  SUB_TREATMENTS: "sub_treatments",
  TREATMENT_RESULTS: "treatment_results",
  CLINIC_CATEGORIES: "clinic_categories",
  CLINIC_MANAGERS: "clinic_managers",
  CLINICS: "clinics",
  SPECIALISTS: "specialists",
  REVIEWS: "reviews",
  REVIEW_REPLIES: "review_replies",
};
```

### Environment Configuration

```javascript
export const ENV = {
  DEV: "dev",
  PROD: "prod",
};
```

### Index Actions

```javascript
export const ACTION = {
  CREATE: "create", // Create new index with alias
  MIGRATE: "migrate", // Reindex with new mapping
  TRUNCATE: "truncate", // Clear all documents (with backup)
  DELETE_ALL: "deleteAll", // Delete all indices
  DELETE_STRAY: "deleteStray", // Delete indices without aliases
  DELETE_DOC: "deleteDoc", // Delete specific document
  ADD_FIELDS: "addFields", // Add new fields to existing mapping
  GET: "get", // Get index information
};
```

---

## 🗂️ Field Type System

### Base Types (`types.mjs`)

```javascript
// Keyword - Exact match, aggregations, sorting
export const kw = () => ({ type: "keyword" });

// Keyword with normalizer - Case-insensitive search
export const kwNorm = () => ({
  type: "keyword",
  normalizer: "lowercase",
});

// Text - Full-text search
export const text = () => ({
  type: "text",
  analyzer: "standard",
});

// Text with autocomplete - Search-as-you-type
export const textAC = () => ({
  type: "text",
  analyzer: "autocomplete",
  search_analyzer: "standard",
});

// Boolean
export const Boolean = () => ({ type: "boolean" });

// Integer
export const Integer = () => ({ type: "integer" });

// Float
export const Float = () => ({ type: "float" });

// Geo Point - Location data
export const geoPoint = () => ({ type: "geo_point" });

// Disabled field - Not indexed
export const blobOff = () => ({ type: "object", enabled: false });
```

---

## 🔧 Index Mappings

### Base Properties

All entities inherit these base properties:

```javascript
const baseProps = {
  PK: kw(), // Primary key
  SK: kw(), // Sort key
  searchableText: text(), // Combined text for full-text search
  createdAt: kw(), // ISO timestamp
  updatedAt: kw(), // ISO timestamp
  status: kw(), // Entity status
};
```

### Example: User Mapping

```javascript
export const buildUserMapping = (baseProps) => {
  return {
    settings: indexSettings(),
    mappings: {
      dynamic: "strict", // Reject unknown fields
      properties: {
        ...baseProps,

        // Identity
        image: kw(),
        phone: kw(),
        email: kwNorm(), // Case-insensitive
        age: Integer(),
        firstName: textAC(), // Autocomplete
        lastName: textAC(),
        fullName: textAC(),
        role: kw(),

        // Location
        country: textAC(),
        state: textAC(),
        city: textAC(),
        postalCode: kw(),
        completeAddress: text(),
        location: geoPoint(), // For geo queries

        // Authorization
        perms: kw(),
        status: kw(),
        linkedProviders: kw(),
        defaultPasswordUsed: Boolean(),
        passwordSet: Boolean(),
      },
    },
  };
};
```

### Example: Clinic Mapping

```javascript
export const buildClinicMapping = (baseProps) => {
  return {
    settings: indexSettings(),
    mappings: {
      dynamic: "strict",
      properties: {
        ...baseProps,

        // Basic Info
        name: textAC(),
        description: text(),
        image: kw(),
        images: kw(),
        phone: kw(),
        email: kwNorm(),
        website: kw(),

        // Location
        country: textAC(),
        state: textAC(),
        city: textAC(),
        postalCode: kw(),
        completeAddress: text(),
        location: geoPoint(),

        // Categorization
        categories: kw(), // Array of category IDs
        treatments: kw(), // Array of treatment IDs
        specialists: kw(), // Array of specialist IDs

        // Metrics
        totalReviews: Integer(),
        averageRating: Float(),
        totalSpecialists: Integer(),
        totalTreatments: Integer(),

        // Management
        managers: kw(), // Array of manager IDs
      },
    },
  };
};
```

### Example: Review Mapping

```javascript
export const buildReviewMapping = (baseProps) => {
  return {
    settings: indexSettings(),
    mappings: {
      dynamic: "strict",
      properties: {
        ...baseProps,

        // References
        userId: kw(),
        clinicId: kw(),
        specialistId: kw(),

        // Content
        rating: Integer(),
        comment: text(),
        images: kw(),

        // Metadata
        verifiedPurchase: Boolean(),
        helpful: Integer(), // Helpful count
        totalReplies: Integer(),
      },
    },
  };
};
```

---

## ⚙️ Index Settings

### Configuration

```javascript
export const indexSettings = () => ({
  number_of_shards: SHARDS, // 1 for dev, 3+ for prod
  number_of_replicas: REPLICAS, // 0 for dev, 2+ for prod
  refresh_interval: "1s", // Real-time search

  analysis: {
    analyzer: {
      // Autocomplete analyzer
      autocomplete: {
        type: "custom",
        tokenizer: "standard",
        filter: ["lowercase", "autocomplete_filter"],
      },
    },
    filter: {
      // Edge n-gram for autocomplete
      autocomplete_filter: {
        type: "edge_ngram",
        min_gram: 2,
        max_gram: 20,
      },
    },
    normalizer: {
      // Lowercase normalizer for case-insensitive keywords
      lowercase: {
        type: "custom",
        filter: ["lowercase"],
      },
    },
  },
});
```

---

## 🔄 Index Operations

### 1. CREATE - Create New Index

**Purpose**: Create a new index with specified mapping

**Process:**

1. Generate unique index name with timestamp
2. Create index with mapping
3. Create alias pointing to new index

```javascript
// Index naming: {base}-{timestamp}
// Example: clinics-20241211123045

// Alias naming: {base}-{env}
// Example: clinics-prod

await createIndexWithAlias({
  target: "clinics",
  env: "prod",
  mapping: buildClinicMapping(baseProps),
});
```

**Result:**

- New index created: `clinics-20241211123045`
- Alias points to it: `clinics-prod → clinics-20241211123045`

---

### 2. MIGRATE - Reindex with New Mapping

**Purpose**: Apply mapping changes to existing data

**Process:**

1. Create new index with updated mapping
2. Reindex documents from old to new
3. Verify document count
4. Update alias to new index
5. Delete old index

```javascript
await migrateIndex({
  target: "clinics",
  env: "prod",
  newMapping: buildClinicMapping(baseProps),
});
```

**Use Cases:**

- Add new searchable fields
- Change field types
- Update analyzers
- Fix mapping issues

**Caution:**

- Downtime during reindex
- Requires sufficient disk space
- Test in dev first

---

### 3. TRUNCATE - Clear All Documents

**Purpose**: Remove all documents while keeping mapping

**Process:**

1. Create snapshot for backup
2. Delete all documents
3. Keep index and mapping intact

```javascript
await truncateIndex({
  target: "reviews",
  env: "dev",
});
```

**Use Cases:**

- Clear test data
- Reset development environment
- Prepare for data reload

---

### 4. ADD_FIELDS - Add New Fields

**Purpose**: Add fields to existing mapping without reindex

**Process:**

1. Validate new fields don't conflict
2. Update mapping with new fields
3. New documents will have new fields
4. Old documents remain unchanged

```javascript
await addFields({
  target: "users",
  env: "prod",
  newFields: {
    bio: text(),
    socialLinks: kw(),
  },
});
```

**Limitations:**

- Cannot change existing field types
- Cannot remove fields (requires migration)
- Old documents won't have new fields until updated

---

### 5. DELETE Operations

**DELETE_ALL**: Delete all indices (dangerous!)

```javascript
await deleteAllIndices({ env: "dev" });
```

**DELETE_STRAY**: Delete indices without aliases

```javascript
await deleteStrayIndices({ env: "prod" });
```

**DELETE_DOC**: Delete specific document

```javascript
await deleteDocumentById({
  target: "reviews",
  env: "prod",
  documentId: "review_123",
});
```

---

### 6. GET - Index Information

**Purpose**: Retrieve index details and statistics

```javascript
const info = await getIndices({
  target: "clinics",
  env: "prod"
});

// Returns:
{
  alias: "clinics-prod",
  indices: [
    {
      index: "clinics-20241211123045",
      docs: 150,
      size: "2.5mb",
      health: "green"
    }
  ],
  mapping: { /* full mapping */ },
  settings: { /* index settings */ }
}
```

---

## 🎯 Naming Conventions

### Index Names

**Format**: `{base}-{timestamp}`

Examples:

- `clinics-20241211123045`
- `users-20241210153020`
- `reviews-20241209094512`

**Purpose:**

- Unique identification
- Zero-downtime migrations
- Rollback capability

### Alias Names

**Format**: `{base}-{env}`

Examples:

- `clinics-prod`
- `users-dev`
- `reviews-prod`

**Purpose:**

- Environment separation
- Application references aliases (not indices)
- Easy index swapping

---

## 🔐 Search Patterns

### Full-Text Search

```javascript
// Search across all text fields
GET /clinics-prod/_search
{
  "query": {
    "multi_match": {
      "query": "cosmetic surgery",
      "fields": ["name^3", "description", "searchableText"]
    }
  }
}
```

### Autocomplete Search

```javascript
// Search-as-you-type
GET /clinics-prod/_search
{
  "query": {
    "match": {
      "name": {
        "query": "cosme",
        "analyzer": "autocomplete"
      }
    }
  }
}
```

### Geo Search

```javascript
// Find clinics within 10km
GET /clinics-prod/_search
{
  "query": {
    "bool": {
      "must": { "match_all": {} },
      "filter": {
        "geo_distance": {
          "distance": "10km",
          "location": {
            "lat": 40.7128,
            "lon": -74.0060
          }
        }
      }
    }
  }
}
```

### Aggregations

```javascript
// Count by category
GET /clinics-prod/_search
{
  "size": 0,
  "aggs": {
    "by_category": {
      "terms": {
        "field": "categories",
        "size": 10
      }
    }
  }
}
```

---

## 🚀 Best Practices

### 1. Dynamic Mapping Disabled

```javascript
mappings: {
  dynamic: "strict"; // Reject unknown fields
}
```

**Why:**

- Prevent accidental field creation
- Maintain schema consistency
- Catch bugs early

### 2. Appropriate Field Types

- **keyword**: IDs, status, exact match fields
- **text**: Full-text search content
- **textAC**: Names that need autocomplete
- **kwNorm**: Case-insensitive exact match (emails)

### 3. Index Aliases

Always use aliases in application code:

```javascript
// ❌ Bad - Direct index reference
await opsClient.search({ index: "clinics-20241211" });

// ✅ Good - Alias reference
await opsClient.search({ index: "clinics-prod" });
```

### 4. Testing in Dev

Always test mapping changes in dev first:

```bash
# 1. Create/migrate in dev
ACTION=CREATE TARGET=clinics ENV=dev

# 2. Verify data
ACTION=GET TARGET=clinics ENV=dev

# 3. Test queries
# Run application tests

# 4. Apply to prod
ACTION=MIGRATE TARGET=clinics ENV=prod
```

### 5. Backup Before Operations

```javascript
// Create snapshot before destructive operations
await createSnapshot({ index: "clinics-prod" });

// Then proceed with operation
await truncateIndex({ target: "clinics", env: "prod" });
```

---

## 📊 Monitoring

### Health Checks

```javascript
// Check cluster health
GET / _cluster / health;

// Check index health
GET / clinics - prod / _health;
```

### Index Statistics

```javascript
// Get index stats
GET / clinics - prod / _stats;

// Important metrics:
// - docs.count: Document count
// - store.size: Disk usage
// - search.query_time_in_millis: Query performance
// - indexing.index_time_in_millis: Indexing performance
```

---

## 🔄 Environment reset runbook (dev / prod)

Use this after wiping OpenSearch or Postgres, or when aliases are missing / misconfigured.

### Architecture reminder

```
admins-dev          ← alias (API + indexer target)
  └── admins-dev-<timestamp>   ← real index (mapping lambda creates this)
```

The **indexer never creates indices**. If an alias is missing, indexing fails loudly instead of auto-creating a bad index.

### 1. Deploy

Deploy `lambda-service-provider` (shared search helpers) plus `cosmediate-opensearch-mapping` and `cosmediate-opensearch-indexing`.

### 2. Wipe dev indices (mapping lambda)

In `cosmediate-opensearch-mapping/index.mjs`:

```javascript
const action = ACTION.DELETE_ALL;
const dryRun = true; // inspect response first
```

Run once with `dryRun: true`, confirm `indicesToDelete` / `aliasesToRemove`, then set `dryRun: false` and run again.

`DELETE_ALL` removes every index whose name contains `-dev` and aliases ending in `-dev`. System indices (`.kibana`, etc.) are untouched.

### 3. Create all indices + aliases

```javascript
const action = ACTION.CREATE_TARGETS;
const dryRun = true; // ignored for create
```

Uncomment **all** entries in the `targets` array. Run the lambda.

Verify each result has `validation.healthy: true` and `summary.failed: 0`.

### 4. Verify in Dev Tools

```json
GET _cat/aliases?v
GET admins-dev/_settings
GET admins-dev/_mapping
```

Expect:

- `admins-dev` is an **alias** (in `_cat/aliases`), not only in `_cat/indices`
- `number_of_shards: 1`, `number_of_replicas: 0`
- `dynamic: strict` on the backing index

Or use mapping lambda `ACTION.GET` — response includes `healthy`, `diagnose.aliasHealth`, and per-index `indexHealth`.

### 5. Reset Postgres (optional)

If the database is reset, new rows emit `INSERT` events and the indexer fills OpenSearch automatically **only if step 3 succeeded**.

### 6. Smoke test

Create one admin, one clinic, one treatment category. Confirm `/list` endpoints return data and CloudWatch indexer logs show no `[search-index] Not ready for writes` errors.

### Indexer behaviour (post-fix)

| Event | Behaviour |
|-------|-----------|
| `INSERT` | Full mapped `index()` after alias check |
| `UPDATE` / `SOFT_DELETE` | Partial `update()`; on 404 → full mapped `index()` (no fields dropped) |
| Missing alias | Indexing fails with clear error — **no auto-create** |

### Index template safety net

`CREATE_TARGETS` registers template `cosmediate-{env}` so any index matching `*-{env}` or `*-{env}-*` defaults to 1 shard / 0 replicas.

---

## ⚠️ Common Issues

### 1. Mapping Conflicts

**Problem**: Field type mismatch

```
Cannot change field type from 'keyword' to 'text'
```

**Solution**: Perform MIGRATE operation

### 2. Dynamic Mapping Errors

**Problem**: Unknown field rejected

```
Strict dynamic mapping: unknown field [newField]
```

**Solution**: Add field to mapping first using ADD_FIELDS

### 3. Alias Not Found

**Problem**: Application can't find index

```
IndexNotFoundException: no such index [clinics-prod]
```

**Solution**: Run `CREATE_TARGETS` for that environment before using the app. The indexer will not auto-create indices.

### 3b. Alias name is a concrete index (auto-create anti-pattern)

**Problem**: `admins-dev` exists as an index, not an alias; wrong shard/replica counts; yellow cluster health

**Symptoms**: `existsAlias(admins-dev)` → false; `GET admins-dev/_settings` → 5 shards / 1 replica

**Solution**: `DELETE_ALL` or `DELETE_TARGET` for that entity, then `CREATE_TARGETS` again. Never rely on indexer writes to create indices.

### 5. Insufficient Disk Space

**Problem**: Reindex fails

```
ClusterBlockException: index read-only / allow delete
```

**Solution**: Free disk space or increase disk size

---

## 🔮 Future Enhancements

1. **Automated Migrations**: CI/CD pipeline integration
2. **Schema Versioning**: Track mapping version history
3. **Rollback Support**: Quick rollback to previous mapping
4. **Validation**: Pre-flight checks before operations
5. **Documentation Generation**: Auto-generate mapping docs
6. **Performance Tuning**: Per-index optimization profiles
7. **Multi-Language**: Support for multiple languages

---

## 📚 Related Documentation

- [DB Stream Handler](./DB_STREAM_HANDLER.md)
- [OpenSearch Best Practices](../search/BEST_PRACTICES.md)
- [Query Examples](../search/QUERY_EXAMPLES.md)
- [Performance Tuning](../search/PERFORMANCE.md)

---

**Last Updated**: December 11, 2024  
**Version**: 1.0.0  
**Status**: Production
