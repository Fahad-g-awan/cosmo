# cosmediate-opensearch-indexing

EventBridge-driven Lambda: builds denormalized search documents from Postgres and writes to OpenSearch.

## Active entities

| Entity | Module | Index alias |
|--------|--------|-------------|
| Admin | `domains/admin/` | `admins-{env}` |
| Patient | `domains/patient/` | `patients-{env}` |

All other `entityType` values are **skipped** (logged, no error).

## Flow

```
EventBridge → index.mjs → routeIndexer → domain indexer → upsert → runIndexPipeline → writers
```

## Event detail

- `detail-type`: `INSERT` | `UPDATE` | `SOFT_DELETE` | `DELETE`
- `detail.entityId`, `detail.entityType`, `detail.ENV` (required on publish)

## Layout

- `domains/admin/`, `domains/patient/` — production paths
- `lib/constants.mjs` — `ENTITY_TO_BASE` (entity type → index base name)
- `lib/opensearch/` — documents, mappers, transform, writers
- `lib/pipeline/` — `runIndexPipeline`
- `legacy/` — old helpers/services (**reference only**, not wired)
