# cosmediate-admins

Admin CRUD (Postgres Identity + Admin profile) with OpenSearch list and compliance logging.

## Routes

| Method | Path | Access |
|--------|------|--------|
| POST | `/admins/bootstrap` | PUBLIC (only when zero active admins) |
| GET | `/admins?id=` | PERMISSIONED |
| POST | `/admins/list` | PERMISSIONED |
| POST | `/admins` | PERMISSIONED |
| PUT | `/admins` | PERMISSIONED |
| DELETE | `/admins?id=` | PERMISSIONED |

Layer registry: `config/routes/admin.routes.mjs`

## Layout

- `controllers/` — thin HTTP handlers
- `services/` — business logic, Cognito, search, compliance, bootstrap
- `lib/routes.mjs` — route → handler map
- `lib/admin-dto.mjs` — profile + identity API shape

## List (`POST /admins/list`)

OpenSearch on `admins-{env}`. Body shape:

```json
{
  "search": { "query": "simon" },
  "filters": {
    "status": "ACTIVE",
    "country": "UK",
    "age": [25, 60],
    "userLocation": { "lat": 51.5074, "lon": -0.1278 },
    "distance": 50,
    "createdAt": ["01-01-2024", "31-12-2024"]
  },
  "sort": { "by": "distance", "order": "asc" },
  "pagination": { "limit": 20, "nextToken": "..." }
}
```

Supported filters: `id`, `ids`, `status`, `role`, `gender`, `country`, `state`, `city`, `postalCode`, `phone`, `email`, `age`, `defaultPasswordUsed`, `passwordSet`, `createdAt`, `updatedAt`, `userLocation` + `distance` (km radius on `location`).

Sort `by: "distance"` uses geo distance when `userLocation` is set (or when a geo filter is active).

Pagination uses **limit + 1** (same as users module): requests `limit + 1` hits, returns `limit` items, sets `nextToken` when an extra row exists.

Shared query helpers: `lib/search/list-query.mjs` (layer).

## Side effects per mutation

1. Postgres (Identity + Admin)
2. Cognito user (create / bootstrap only)
3. EventBridge → OpenSearch indexer (`admins-{env}`)
4. DynamoDB audit + activity monitoring (`recordComplianceLogs`)
