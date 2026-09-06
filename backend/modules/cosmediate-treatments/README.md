# cosmediate-treatments

Treatment catalog CRUD (categories, brands, treatments, results) with OpenSearch list, selection/sub-treatments, and compliance logging.

## Routes

Layer registry: `config/routes/treatment.routes.mjs`

### Public (no auth)

| Method | Path |
|--------|------|
| GET | `/treatments/categories?id=` |
| POST | `/treatments/categories/list` |
| GET | `/treatments/brands?id=` |
| POST | `/treatments/brands/list` |
| GET | `/treatments?id=` |
| POST | `/treatments/list` |
| GET | `/treatments/top-searched` |
| GET | `/treatments/results?id=` |
| POST | `/treatments/results/list` |
| GET/POST | sub-treatments, selection by clinic/specialist |

Public treatment **list** and **top-searched** enforce `published: true` and omit `htmlDescription` / `faqs`. Public **GET** includes full content.

### Management (permissioned)

| Method | Path | Permission |
|--------|------|------------|
| GET | `/management/treatments/categories?id=` | `treatment_category:read` |
| POST | `/management/treatments/categories/list` | `treatment_category:read` |
| POST/PUT/DELETE | `/treatments/categories` | create/update/delete |
| Same pattern | `/management/treatments/brands`, `/treatments/brands` | `treatment_brand:*` |
| Same pattern | `/management/treatments`, `/treatments` | `treatment:*` |
| Same pattern | `/management/treatments/results`, `/treatments/results` | `treatment_result:*` |

Mutations require the matching create/update/delete grant. Management reads require read grant.

## Layout

- `index.mjs` — Lambda handler; `routeKey` on request context
- `controllers/` — thin HTTP handlers
- `services/` — business logic, repositories, OpenSearch search, compliance
- `lib/routes.mjs` — route → handler map
- `lib/route-scope.mjs` — public vs management scope helpers
- `lib/*-dto.mjs` — API response shapes

Sub-treatments and selection remain in controllers (light refactor only).

## List queries

OpenSearch indices: `treatment_categories-{env}`, `treatment_brands-{env}`, `treatments-{env}`, `treatment_results-{env}`.

Shared query helpers: `lib/search/list-query.mjs` (layer). Pagination uses **limit + 1**.

Example body:

```json
{
  "search": { "query": "botox" },
  "filters": {
    "published": true,
    "categoryId": "…",
    "ownerType": "SPECIALIST"
  },
  "sort": { "by": "createdAt", "order": "desc" },
  "pagination": { "limit": 20, "nextToken": "…" }
}
```

## Treatment create

- `treatmentImage` in request → stored as `image`
- `entityType`: `ENTITY_TYPE.TREATMENT`
- Author fields from auth context (`authorId`, `authorName`, `authorEmail`)

## Treatment results

- `ownerType: ADMIN` → requires `treatmentId`
- `ownerType: SPECIALIST` → requires `specialistTreatmentId`

## Side effects per mutation

1. Postgres
2. EventBridge → OpenSearch indexer
3. DynamoDB audit + activity monitoring (`recordComplianceLogs`)
