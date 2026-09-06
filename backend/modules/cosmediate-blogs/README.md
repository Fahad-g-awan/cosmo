# cosmediate-blogs

Blog and blog-category CRUD (Postgres) with OpenSearch list/search, public read routes, and compliance logging.

## Routes

| Method | Path | Access |
|--------|------|--------|
| GET | `/blogs?id=` | PUBLIC (published only) |
| POST | `/blogs/list` | PUBLIC (published only, light payload) |
| GET | `/blogs/related?id=` | PUBLIC (published only) |
| GET | `/blogs/top-searched` | PUBLIC (published only) |
| GET | `/management/blogs?id=` | PERMISSIONED (`blog:read`) |
| POST | `/management/blogs/list` | PERMISSIONED (`blog:read`, light payload) |
| POST | `/blogs` | PERMISSIONED (`blog:create`) |
| PUT | `/blogs` | PERMISSIONED (`blog:update`) |
| DELETE | `/blogs?id=` | PERMISSIONED (`blog:delete`) |
| GET | `/blogs/categories?id=` | PUBLIC (published categories) |
| POST | `/blogs/categories/list` | PUBLIC (published categories) |
| GET | `/management/blogs/categories?id=` | PERMISSIONED (`blog_category:read`) |
| POST | `/management/blogs/categories/list` | PERMISSIONED (`blog_category:read`) |
| POST | `/blogs/categories` | PERMISSIONED (`blog_category:create`) |
| PUT | `/blogs/categories` | PERMISSIONED (`blog_category:update`) |
| DELETE | `/blogs/categories?id=` | PERMISSIONED (`blog_category:delete`) |

Layer registry: `config/routes/blog.routes.mjs`

## Layout

- `controllers/` — thin HTTP handlers
- `services/` — business logic, search, compliance, repositories
- `lib/routes.mjs` — route → handler map
- `lib/route-scope.mjs` — public vs management route detection
- `lib/blog-dto.mjs` / `lib/blog-category-dto.mjs` — API shapes

## List payloads

List endpoints (`POST /blogs/list`, related, top-searched, category lists) return items **without** `content`. Single GET endpoints include full `content`.

Public blog list/search automatically filters `status=PUBLISHED`. Management list has no status filter.

## Create / update

- `blogImage` in the request body maps to `image` in Postgres.
- Create sets `authorId`, `authorName`, and `authorEmail` from the authenticated user context.

## List (`POST /blogs/list`)

OpenSearch on `blogs-{env}`. Body shape:

```json
{
  "search": { "query": "skincare" },
  "filters": {
    "blogCategories": ["cat-id"],
    "tags": ["wellness"],
    "status": "PUBLISHED",
    "publishedAt": ["01-01-2024", "31-12-2024"],
    "createdAt": ["01-01-2024", "31-12-2024"]
  },
  "sort": { "by": "publishedAt", "order": "desc" },
  "pagination": { "limit": 20, "nextToken": "..." }
}
```

Shared query helpers: `lib/search/list-query.mjs` (layer).

Pagination uses **limit + 1** (same as admins/users modules).

## Side effects per mutation

1. Postgres (`Blog` / `BlogCategory`)
2. EventBridge → OpenSearch indexer (`blogs-{env}`, `blog_categories-{env}`)
3. DynamoDB audit + activity monitoring (`recordComplianceLogs`)
