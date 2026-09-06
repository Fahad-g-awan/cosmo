# cosmediate-lambda-test

Smoke-test and **reference** Lambda for the shared utility layer (`lambda-service-provider`). Use it to confirm the layer zip loads, config/SSM resolves, Prisma and OpenSearch connect, the API authorizer enforces route policies, validation schemas work, and multipart upload reaches S3.

Route definitions live in the layer as `LAMBDA_TEST_ROUTE_DEFS` ([`lambdaTest.routes.mjs`](../../lambda-service-provider/nodejs/config/routes/lambdaTest.routes.mjs)) and are registered in the global `ROUTE_REGISTRY` — the authorizer treats these like any other module (no special-case env vars).

This module’s [`index.mjs`](./index.mjs) is an upgraded HTTP handler template: refactored imports, `formatControllerResponse`, full request context (`loadConfig`, `parseBody`, `getAuthorizerContext`, Prisma, OpenSearch). Copy patterns from here when refactoring other `cosmediate-*` modules.

**Deploy:** zip this module, attach the utility layer, map API Gateway paths under `/test/*`, attach the same Lambda authorizer as production when testing auth.

**Headers (typical):**

- `Origin` — must be on the CORS whitelist
- `Authorization: Bearer <access_token>` — required for `AUTH_ONLY` / `PERMISSIONED` routes when the authorizer is enabled

---

## Routes

| Method | Path | Access | Auth (authorizer) |
|--------|------|--------|-------------------|
| GET | `/test/health` | PUBLIC | No |
| GET | `/test/env` | PUBLIC | No |
| GET | `/test/clients` | AUTH_ONLY | Valid identity |
| GET | `/test/auth-probe` | PERMISSIONED | `platform:registry` |
| GET | `/test/routes` | PUBLIC | No |
| POST | `/test/validate` | PUBLIC | No |
| POST | `/test/route-access` | PUBLIC | No |
| POST | `/test/grants` | PERMISSIONED | `permissions:grant` |
| POST | `/test/upload` | PERMISSIONED | `image:upload` |
| POST | `/test/errors` | PUBLIC | No |

---

### `GET /test/health`

Layer loaded + cold/warm flag. No body.

---

### `GET /test/env`

Returns resolved stage and normalized route key. No body.

---

### `GET /test/clients`

Read-only Postgres (`SELECT 1`) and OpenSearch `ping`. No body. Requires authorizer context (logged-in user).

---

### `GET /test/auth-probe`

Returns sanitized authorizer context and whether `platform:registry` is present. Use this to confirm auth end-to-end. No body.

Requires permission: `platform:registry` (or `*:*`).

---

### `GET /test/routes`

Lists registered `/test/*` keys and total route count. No body.

---

### `POST /test/validate`

Runs AJV schema `lambda_test_validate`.

```json
{
  "email": "test@example.com",
  "note": "optional"
}
```

---

### `POST /test/route-access`

Simulates `canAccessRegisteredRoute` (same rules as the authorizer) without hitting the DB.

Allowed example:

```json
{
  "routeKey": "GET:/test/auth-probe",
  "perms": ["platform:registry"]
}
```

Denied example:

```json
{
  "routeKey": "GET:/test/auth-probe",
  "perms": []
}
```

Super-access example:

```json
{
  "routeKey": "PUT:/auth/permissions",
  "perms": ["*:*"]
}
```

---

### `POST /test/grants`

Runs grant validation (`assertGrantRequest`) + catalog snapshot. Requires `permissions:grant` on the token.

```json
{
  "granterRole": "ADMIN",
  "targetRole": "MANAGER",
  "granterGrants": ["permissions:grant", "platform:registry"],
  "targetCurrentGrants": ["profile:get"],
  "requestedGrants": ["profile:get", "profile:update"]
}
```

Minimal body (uses caller `authContext.perms` when `granterGrants` is omitted):

```json
{
  "granterRole": "ADMIN",
  "targetRole": "MANAGER",
  "requestedGrants": ["profile:get"]
}
```

---

### `POST /test/upload`

**Not JSON.** Send `multipart/form-data` with one image file (jpeg, png, gif, webp; max 10MB). Any file field name is fine (e.g. `file`). Requires `image:upload` (or `*:*`).

Response includes parsed upload metadata / S3 URLs from `parseBody`.

---

### `POST /test/errors`

Smoke test for `respondError`. No schema.

OK:

```json
{}
```

Force error:

```json
{
  "intentionalError": true
}
```

---

## Authorizer dev bypass

On the **authorizer** Lambda only (not this module): `AUTHORIZER_DEV_BYPASS=true`. Optional stub perms: `AUTHORIZER_DEV_PERMS="platform:registry image:upload"`.
