# cosmediate-platform

Staff platform APIs: SPA registry payload, permission grant tooling, and audit/activity log reads.

## Routes

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/platform/registry` | Auth/db constants for frontend (`USER_ROLES`, `ACTION_GROUPS`, `PROVIDER_LINKED_RETRY_CODE`, …) |
| `GET` | `/platform/navigation` | Role-scoped dashboard navigation (requires `platform:navigation`) |
| `GET` | `/platform/permissions/catalog` | Grant catalog for current admin (what they may assign) |
| `POST` | `/platform/audit-logs/list` | Cursor-paginated audit log list (`platform:logs`) |
| `GET` | `/platform/audit-logs?id=` | Audit log detail by id |
| `POST` | `/platform/activity-logs/list` | Cursor-paginated activity log list (`platform:logs`) |
| `GET` | `/platform/activity-logs?id=` | Activity log detail by id |

Permission grants are applied via **admin/patient profile update** (`PUT /admins`, `PUT /patients`) with `perms` in the body (compliance + EventBridge there).

**`platform:logs`** — admins and managers only. Admins see all logs globally; managers see manager-actor logs within their clinic/org scope.

List responses: `{ success, items, total: null, nextToken, paginationMode: "cursor" }`.

Auth sign-in/sign-up/OAuth remain in **cosmediate-authentication**.

## Layout

```
controllers/     — thin handlers
services/        — registry, navigation, permissions catalog, log list/query/scope
lib/
  routes.mjs
  platform-log-dto.mjs
index.mjs
```
