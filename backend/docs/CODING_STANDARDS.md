# Cosmediate Backend — Coding Standards

> **Audience**: Human engineers + AI agents working on the Cosmediate backend.
> **Scope**: All Lambda modules under `modules/*`, the shared Lambda Layer under `lambdaLayer/nodejs/*`, Prisma schema/migrations under `prisma/*`, and deployment glue.
> **Status**: Living document. Update when conventions change.

This document codifies the naming, folder structure, and layering conventions for the Cosmediate backend (AWS Lambda + API Gateway + DynamoDB + Prisma/Postgres + OpenSearch + Cognito + SQS/EventBridge).

---

## 1. Core Principle

> **Classify code by responsibility, not by "type of code".**

- Wrong thinking: "this talks to AWS → `utils`"
- Right thinking: "this is infrastructure wiring → `lib/`. This is business logic → `services/`. This is request orchestration → `controllers/`."

Every file fits into one of the layers below. No exceptions.

---

## 2. Top-Level Layout

```
backend/
  modules/                      # One Lambda per domain (kebab-case, prefixed "cosmediate-")
    cosmediate-<domain>/
      index.mjs                 # Lambda handler (entrypoint only — no business logic)
      lib/
        routes.mjs              # METHOD:/path -> controller map
        utils/                  # Domain-scoped helpers (NOT generic utils)
      controllers/              # Request orchestration (one file per resource)
      services/                 # Business logic (optional; add when controllers get fat)
  lambdaLayer/
    nodejs/
      lib/                      # Shared infrastructure + cross-cutting helpers
        api/                    # Route dispatch, CORS, body parsing
        auth/                   # Auth context, token helpers
        db/                     # DynamoDB client + helpers
        openSearch/             # OpenSearch client + helpers
        redis/                  # Redis client
        mailer/                 # SES/mailer setup
        sqs/                    # SQS client
        eventBridge/            # EventBridge client
        socketApi/              # API Gateway WebSocket client
        recaptcha/              # reCAPTCHA integration
        validation/             # Zod/Joi schemas, shared validators
        config.mjs              # Env/SSM config loader
        ctx.mjs                 # AsyncLocalStorage request context
        utils.mjs               # Truly generic helpers (respond, getAuthToken, ...)
      services/                 # Shared service clients (auth, prisma, db, mailer, location)
  prisma/                       # Prisma schema + migrations (Postgres)
  docs/                         # Architecture + standards (this file lives here)
```

Rule: if a helper is **only** used in one module, keep it inside that module (`modules/<domain>/lib/utils/`). Promote to the Lambda Layer **only** when ≥2 modules need it.

---

## 3. The Layers

### 3.1 Module (Domain Lambda)

A module under `modules/cosmediate-<domain>/` is one deployable Lambda owning one bounded context (treatments, clinics, users, auth, reviews, blogs, leads, specialists, admins, …).

```
modules/cosmediate-treatments/
  index.mjs                 # handler: wires ctx, delegates to dispatchRoute
  lib/
    routes.mjs              # ROUTES Map
    utils/
      treatment.mjs         # domain helpers for treatments
      brand.mjs             # domain helpers for brands
      ...
  controllers/
    treatments.mjs
    brands.mjs
    category.mjs
    ...
  services/                 # optional — only when logic grows beyond controllers
```

Rule: if it only makes sense inside "treatments" → it lives in `modules/cosmediate-treatments/`.

### 3.2 Handler (`index.mjs`)

The handler is **glue only**. Its job:

1. Handle `OPTIONS` preflight.
2. Resolve origin + CORS base headers.
3. Load env/config (`loadConfig`).
4. Parse body / query / path params.
5. Build clients (`prisma`, `opsClient`, …) and auth context.
6. Stash everything in a `ctx` via `runWithCtx`.
7. Dispatch to `dispatchRoute(event, env, ROUTES)`.
8. Wrap the result in `respond({ statusCode, payload, headers, cookies })`.

The handler **never** contains business logic, DB queries, or branching on domain state.

### 3.3 Routes (`lib/routes.mjs`)

`routes.mjs` exports a single `ROUTES` Map keyed by `"METHOD:/path"`:

```js
export const ROUTES = new Map([
  ["GET:/treatments", getTreatment],
  ["POST:/treatments/list", getTreatments],
  ["POST:/treatments", createTreatment],
  ["PUT:/treatments", updateTreatment],
  ["DELETE:/treatments", deleteTreatment],
]);
```

- One route → one controller function. No inline handlers.
- Keep the Map ordered by resource, then by verb (GET → POST → PUT → DELETE).
- Prefer `POST :/.../list` for search/list endpoints that take a filter body; reserve `GET` for trivially cacheable reads.

### 3.4 Controller

A controller = **request orchestration**. It reads `ctx`, validates input, calls services/utils, maps the result, returns a response object.

```js
export const createTreatment = async () => {
  const { reqBody, prisma, authContext } = getCtx();
  const input = treatmentCreateSchema.parse(reqBody);
  const saved = await treatmentService.create(prisma, authContext, input);
  return { statusCode: 201, data: mapTreatmentToDTO(saved) };
};
```

- ✅ Validate input, authorize, call services, map the DTO, shape the response.
- ❌ Heavy business rules, multi-step transactions (push those into a service).
- ❌ Direct AWS SDK calls for anything non-trivial — go through `lib/`.

Return shape: `{ statusCode?, data?, headers?, cookies? }`. `dispatchRoute` + the handler merge headers and wrap with `respond`.

### 3.5 Service

A service = **business logic that coordinates data**. Add a `services/` folder the moment a controller starts orchestrating >1 data source, applying domain rules, or getting past ~60 lines.

```js
// services/treatment.service.mjs
export const create = async (prisma, authCtx, input) => {
  assertCanCreate(authCtx);
  const normalized = normalizeTreatmentInput(input);
  return prisma.$transaction(async (tx) => {
    const treatment = await tx.treatment.create({ data: normalized });
    await indexTreatment(treatment); // OpenSearch
    await emitTreatmentCreated(treatment); // EventBridge
    return treatment;
  });
};
```

- ✅ Business rules, transactions, cross-store coordination (Postgres + DynamoDB + OpenSearch + SQS).
- ❌ HTTP concerns (status codes, headers, cookies) — that's the controller's job.
- ❌ Formatting, string helpers, one-liners.

### 3.6 Lib (Infrastructure / Setup)

`lambdaLayer/nodejs/lib/*` and `modules/<domain>/lib/*` = **wrappers around external systems and cross-cutting plumbing**. NOT "miscellaneous code".

Shared layer responsibilities:

- `lib/api/utils.mjs` → `dispatchRoute`, `cors`, `options`, `getOrigin`, `resolveEnvStage`.
- `lib/api/parseBody.mjs` → body parsing + decryption.
- `lib/auth/` → `getAuthorizerContext`, token helpers.
- `lib/db/` → DynamoDB document client + repo-style helpers.
- `lib/openSearch/`, `lib/redis/`, `lib/mailer/`, `lib/sqs/`, `lib/eventBridge/`, `lib/socketApi/`, `lib/recaptcha/` → SDK init + thin wrappers.
- `lib/validation/` → shared Zod schemas.
- `lib/config.mjs` → env + SSM parameter loader.
- `lib/ctx.mjs` → AsyncLocalStorage for the per-request context.
- `lib/utils.mjs` → `respond`, `getAuthToken`, `getSessionId`, `runLayerTest` — only truly generic helpers.

Rule: if it wraps an SDK, sets up a client, or is cross-cutting plumbing (CORS, parsing, context), it belongs in `lib/`. Everything else does not.

### 3.7 Services (Shared Layer)

`lambdaLayer/nodejs/services/*` holds **shared service clients** that multiple modules instantiate the same way: `prisma/db.mjs`, `auth.mjs`, `db.mjs` (DynamoDB repo), `mailer.mjs`, `location.mjs`. Keep these thin and stateless; per-request state lives in `ctx`.

### 3.8 Utils

A util = **pure function with NO domain knowledge and no I/O**.

```js
formatCurrency(1000);
slugify("Clinic Name");
chunk(array, 50);
```

Rules:

- ❌ No DB, no AWS SDK, no network, no business logic.
- ❌ No "domain-shaped" helpers. `getClinicDisplayName(clinic)` → domain → belongs in `modules/cosmediate-clinics/lib/utils/`.
- Live under `modules/<domain>/lib/utils/` when domain-scoped, or the shared layer's `lib/utils.mjs` when truly generic.

### 3.9 Config

Config = **static values that define system behavior**. Dynamic config (per-env URLs, secrets) is loaded by `lib/config.mjs` from env + SSM; do not hard-code.

- ✅ Feature flags, route maps, static option lists, retry/timeout tunables.
- ❌ Functions, business logic, request-scoped data.

### 3.10 Constants (Scoped)

- **Global** (shared layer): statuses, roles, provider names (`google`, `facebook`, `apple`), event names.
- **Module-local**: limits, enum values, field lists that only one domain cares about — live next to the domain under `lib/utils/` or `lib/constants.mjs`.

Rule: shared across modules → shared layer; specific to one module → inside the module.

---

## 4. Mappers (Critical — Read This)

A **mapper** transforms data between representations. It is a **decoupling layer**.

### Why

The backend juggles multiple shapes of the same entity:

- **DB shape** — Prisma row or DynamoDB item (snake_case keys, join tables, PKs/SKs).
- **Internal shape** — domain object used by services.
- **API shape (DTO)** — what the BFF / frontend consumes.
- **Index shape** — denormalized document written to OpenSearch.
- **Event shape** — payload put on SQS / EventBridge.

Mixing them directly → tight coupling, fragile migrations. **Mappers break the coupling.**

### Example

```js
// treatment.mapper.mjs
export const mapTreatmentRowToDomain = (row) => ({ ... });
export const mapTreatmentToDTO      = (treatment) => ({ ... });
export const mapTreatmentToIndexDoc = (treatment) => ({ ... });
export const mapDTOToTreatmentInput = (dto) => ({ ... });
```

### Naming + Location

- File: `<entity>.mapper.mjs`.
- Functions: `map<From>To<To>` (`mapUserRowToDomain`, `mapTreatmentToDTO`, `mapReviewToIndexDoc`).
- Location: colocated with the domain → `modules/cosmediate-<domain>/lib/mappers/` (create the folder when you have ≥1 mapper).

Any time data crosses a DB ↔ service ↔ API ↔ index ↔ event boundary, route it through a mapper.

---

## 5. Folder Naming

| Folder type           | Case       | Example                                                  |
| --------------------- | ---------- | -------------------------------------------------------- |
| Lambda module         | kebab-case | `cosmediate-treatments/`, `cosmediate-auth-client-apps/` |
| Shared layer sub-area | camelCase  | `openSearch/`, `socketApi/`, `eventBridge/`              |
| Module sub-folder     | kebab-case | `controllers/`, `services/`, `lib/utils/`                |
| Prisma folder         | fixed      | `prisma/`, `prisma/migrations/`                          |

Rules:

- Lambda module names are **always** `cosmediate-<kebab-domain>`. Do not drop the prefix.
- Existing shared-layer folders use camelCase (`openSearch`, `socketApi`). Keep that convention for consistency — do not rename ad-hoc. New folders should match the style of their siblings.
- Avoid generic dumping grounds: no `helpers/`, no `common/`, no `misc/`.

---

## 6. File Naming

| File type                   | Case / Pattern       | Example                                     |
| --------------------------- | -------------------- | ------------------------------------------- |
| Lambda handler              | fixed                | `index.mjs`                                 |
| Controller                  | camelCase            | `treatments.mjs`, `treatmentSelection.mjs`  |
| Service (business logic)    | `<name>.service.mjs` | `treatment.service.mjs`, `auth.service.mjs` |
| Mapper                      | `<name>.mapper.mjs`  | `treatment.mapper.mjs`                      |
| Validation / schema         | `<name>.schema.mjs`  | `treatment.schema.mjs`                      |
| Routes map                  | fixed                | `routes.mjs`                                |
| Domain util                 | camelCase            | `treatmentSelection.mjs`, `priceData.mjs`   |
| Shared infra client         | camelCase            | `config.mjs`, `parseBody.mjs`               |
| Config module               | `<name>.config.mjs`  | `mailer.config.mjs`, `cors.config.mjs`      |
| Constants (values)          | camelCase            | `providerNames.mjs`, `eventNames.mjs`       |
| Constants (pure primitives) | UPPER_CASE           | `HTTP_STATUS.mjs`, `EVENT_TYPES.mjs`        |
| Types (if/when we TS)       | `<name>.types.ts`    | `treatment.types.ts`                        |
| Tests                       | `<name>.test.mjs`    | `treatment.service.test.mjs`                |

### The `<name>.<role>.mjs` pattern

Scales cleanly:

```
treatment.service.mjs
treatment.mapper.mjs
treatment.schema.mjs
mailer.config.mjs
auth.validation.mjs
```

- `.service.mjs` → business logic
- `.mapper.mjs` → transformations
- `.schema.mjs` → Zod / validation schema
- `.config.mjs` → static config
- `.validation.mjs` → validation rules/guards
- `.types.ts` → shared type definitions

### Existing code

The current codebase uses plain `treatments.mjs` / `brand.mjs` inside `controllers/` and `lib/utils/`. That is acceptable for controllers and domain utils because the parent folder already encodes the role. Use `<name>.<role>.mjs` the moment a file mixes roles or you introduce a service/mapper/schema sibling.

### Don't overdo UPPER_CASE filenames

`eventNames.mjs` beats `EVENT_NAMES.mjs` unless every export in the file is a `const` primitive.

### Extensions

- Runtime Lambda code: `.mjs` (ESM). Do not introduce `.cjs` or `.js`.
- Future TypeScript: `.ts` / `.mts`. Keep `.ts` off the runtime until a migration plan is agreed.

---

## 7. Quick Decision Guide

When you create a file, ask in order:

1. **Is it tied to one domain/module?** → `modules/cosmediate-<domain>/...`
2. **Is it the Lambda entrypoint?** → `index.mjs` (glue only).
3. **Is it routing?** → `lib/routes.mjs`.
4. **Is it request orchestration?** → `controllers/<resource>.mjs`.
5. **Is it business logic / cross-store coordination?** → `services/<name>.service.mjs`.
6. **Is it a data-shape transform?** → `lib/mappers/<entity>.mapper.mjs`.
7. **Is it external SDK wiring / cross-cutting plumbing?** → `lambdaLayer/nodejs/lib/<area>/`.
8. **Is it pure reusable logic, no domain knowledge?** → `lib/utils.mjs` (shared layer) or module `lib/utils/`.
9. **Is it static configuration?** → `<name>.config.mjs`.
10. **Is it a fixed value set?** → `constants/` or an `eventNames.mjs`-style file.

---

## 8. Request Flow (Canonical)

```
API Gateway event
  → index.mjs (handler)
      → resolveEnvStage → loadConfig
      → parseBody / parse query / parse path
      → build clients (prisma, opsClient, redis, …)
      → getAuthorizerContext / getAuthToken / getSessionId
      → runWithCtx(ctx)
          → dispatchRoute(event, env, ROUTES)
              → controller
                  → schema.parse(input)
                  → service(...)             # business logic, tx, cross-store
                      → prisma / dynamo / opensearch / sqs / eventBridge
                      → mapper (DB → Domain)
                  → mapper (Domain → DTO)
                  → return { statusCode, data, headers?, cookies? }
      → respond({ statusCode, payload, headers, cookies })
```

Any deviation (logic in handler, DB calls in controller, SDK calls outside `lib/`) is a code-smell and should be refactored in the same PR.

---

## 9. Request Context (`ctx`)

`ctx` is built in the handler and stashed via `runWithCtx` (AsyncLocalStorage). Controllers/services read it with `getCtx()`:

- ✅ Put on `ctx`: `env`, `config`, `authContext`, `authToken`, `sessionId`, `reqBody`, `queryParams`, `baseHeaders`, `prisma`, `opsClient`, and other per-request clients.
- ❌ Do not put on `ctx`: module-level singletons, static constants, things that never change between requests.
- ❌ Do not mutate `ctx` mid-request. Treat it as read-only after the handler hands off.
- Never `console.log(ctx)` in production paths — it leaks tokens. The existing `console.log("ctx", ctx)` calls in some handlers are a known debt; remove when touching those files.

---

## 10. API Payload Casing

Match the frontend contract:

- **OAuth / OIDC spec fields** (`client_id`, `redirect_uri`, `code`, `state`, `grant_type`, `scope`, `token_type`, …) → **snake_case**. Follow the RFC.
- **Internal JSON** between BFF ↔ Lambda ↔ other internal services → **camelCase**.
- **DB-shaped fields** (Prisma snake_case columns, DynamoDB attribute names) stay in their native shape inside repositories; translate to camelCase DTOs in the mapper, not ad-hoc in the controller.
- **OpenSearch index docs** use camelCase (they are internal). Versioned index mappings live under `modules/cosmediate-opensearch-mapping/`.

If you need translation, put it in a mapper. Never in the controller, never in the handler.

---

## 11. Response Contract

Standard JSON shapes returned by Lambda (consumed by BFF / frontend):

```js
// Success
{ success: true, ...data }

// Error
{ success: false, error: "error_code_snake_case", message: "Human-readable" }
```

Rules:

- `error` is a **stable machine code** (`token_exchange_failed`, `unauthorized`, `invalid_session`, `treatment_not_found`). Change = breaking.
- `message` is human-readable for logs/dev only. UIs resolve their own copy from the code — never surface `message` raw.
- HTTP status code is set via the controller's returned `statusCode` and applied by `respond`. Use meaningful codes: `400` validation, `401` unauthenticated, `403` authorized-but-forbidden, `404` not found, `409` conflict, `422` semantic validation, `429` rate-limited, `5xx` server.
- **Never return redirects from a Lambda POST route.** Redirects are a BFF/GET concern.
- Never leak stack traces, Prisma error internals, or raw AWS SDK errors. Normalize in the handler's `catch` + a shared error mapper.

---

## 12. Validation

- Validate **every** controller input with a schema (Zod preferred). Schemas live in `modules/<domain>/lib/validation/` (module-local) or `lambdaLayer/nodejs/lib/validation/` (shared).
- Schema files are `<name>.schema.mjs` and export both the schema and a narrow `Input`/`Output` type (once we move to TS).
- `.parse()` throws; the handler's `catch` converts it into a `400` with `error: "validation_error"`.
- Do not `safeParse` + silently continue unless you have an explicit fallback path and have logged the reason.

---

## 13. Auth & Authorization

- Authentication (who is this?) → `getAuthorizerContext(event)` in the handler. Never re-parse JWTs in controllers.
- Authorization (can they do X?) → in the **service**, not the controller. Write `assertCan*` guards and call them at the top of each service method.
- Never trust `reqBody.userId` / `reqBody.clinicId` for identity. Identity comes from `authContext`; body IDs are only inputs to be authorized against.
- Multi-provider linking rules, Cognito pre-triggers, and OAuth linking logic live inside the relevant module (`cosmediate-authentication/`, `cosmediate-pre-auth-signup/`, …). Do not leak linking logic into other modules.

---

## 14. Imports

- Imports **always** at the top of the file. No mid-file `import` / `require`.
- Group order:
  1. External packages (`@aws-sdk/*`, `zod`, `prisma`, …).
  2. Lambda Layer imports (`/opt/nodejs/lib/...`, `/opt/nodejs/services/...`).
  3. Module-local relative imports (`./`, `../`).
- Never import **across modules** (`modules/cosmediate-treatments` must not import from `modules/cosmediate-clinics`). If two modules need the same thing, promote it to the Lambda Layer.
- No circular dependencies between controllers/services/mappers in the same module.

---

## 15. Logging

- Use `console.log` / `console.error` with a **prefix** identifying the module + route/function: `[treatments:createTreatment]`, `[auth:oauthCallback]`. Keep this consistent — log aggregation depends on it.
- Production paths: structured logs only. Log IDs, not payloads. **Never** log tokens, cookies, auth headers, full user objects, PII, passwords, reCAPTCHA secrets, or Cognito client secrets.
- Verbose/dev logs: gate behind a feature flag (`process.env.DEBUG_AUTH === "true"`, `DEBUG_TREATMENTS`, …). Do not ship `console.log("ctx", ctx)` to production.
- Errors: `console.error("[module:fn] <short message>", { errorCode, errorMessage, ...safeContext })`. Do not log the raw `Error` object if it might carry a stack with secrets.

---

## 16. Secrets & Config

- All secrets come from SSM / env via `lib/config.mjs`. No secret literals in code, no secrets in `.env.example`.
- `.env.*` files are for local dev placeholders only. Never commit real credentials.
- Keys with IAM scope (Cognito, SES, OpenSearch, S3, …) are provisioned at the Lambda role level — do not embed access keys.
- When adding a new config value: update `.env.example`, `.env.development`, `.env.production` placeholders, `lib/config.mjs`, and document it in `docs/`.

---

## 17. Database & Indexing

- **Postgres (Prisma)**: schema in `prisma/schema.prisma`. Migrations are generated, reviewed, and checked in. Never edit a migration after it has shipped to any environment.
- **DynamoDB**: access only through `lambdaLayer/nodejs/lib/db/` (or the shared `services/db.mjs`). Do not instantiate `DynamoDBClient` inside a controller.
- **OpenSearch**: index mappings live in `modules/cosmediate-opensearch-mapping/`. Writes go through `modules/cosmediate-opensearch-indexing/` or `modules/cosmediate-db-stream-handler/`. Controllers/services call an index helper, not the client directly.
- Streams / async fan-out: DynamoDB Streams → `cosmediate-db-stream-handler`; queue consumers (`cosmediate-hubspot-consumer`, `cosmediate-review-consumer`) own their own idempotency.
- Every write that changes search-visible state must either be in a transaction with, or idempotently followed by, the index update.

---

## 18. Events, Queues, WebSockets

- EventBridge / SQS publishers: use the helpers in `lib/eventBridge/` and `lib/sqs/`. Event names are centralized constants — never free-text.
- Consumers live in their own module (`cosmediate-*-consumer`). A consumer must be idempotent (same event delivered twice → same end-state).
- WebSocket connect/disconnect and broadcast use `cosmediate-websocket-connect`, `cosmediate-websocket-disconnect`, and `lib/socketApi/`. The socket handler module's hardcoded table names (`cosmedium_sockets`) are known tech-debt; do not add new hardcoded tables — route new ones through config.

---

## 19. Error Handling

- Controllers throw. Services throw. The **handler** is the only place that translates a thrown error into an HTTP response.
- Throw errors that carry both a `statusCode` and a stable `code`:

  ```js
  class AppError extends Error {
    constructor(code, message, statusCode = 400, details = null) {
      super(message);
      this.code = code;
      this.statusCode = statusCode;
      this.details = details;
    }
  }
  ```

- The handler catches, logs with a safe context, and responds `{ success: false, error: code, message }`.
- Never swallow errors silently. If you catch to add context, rethrow.

---

## 20. Testing

- Unit tests live next to the file under test as `<name>.test.mjs` (or in a sibling `__tests__/` folder if the module prefers that). Pick one per module and stay consistent.
- Services are the primary unit-test target. Mock `prisma`, `opsClient`, AWS SDK clients — never hit real AWS in unit tests.
- Mappers must have round-trip tests (DB → DTO → DB input) for any non-trivial transform.
- Integration tests that hit AWS run against the `dev` stage only and are marked as such.

---

## 21. Module Checklist (New Lambda)

When you add a new `modules/cosmediate-<domain>/`:

- [ ] `index.mjs` — handler only, no business logic.
- [ ] `lib/routes.mjs` — `ROUTES` Map ordered by resource + verb.
- [ ] `controllers/<resource>.mjs` — one per resource, thin.
- [ ] `services/<name>.service.mjs` — the moment logic > trivial.
- [ ] `lib/mappers/<entity>.mapper.mjs` — when crossing DB/API/index/event boundaries.
- [ ] `lib/validation/<name>.schema.mjs` — every controller input validated.
- [ ] Registered in deployment config (API Gateway + IAM role + env vars).
- [ ] `.env.example` updated.
- [ ] `docs/` entry or README section for the module.

---

## 22. Review Checklist (Pull Requests)

- [ ] File lives in the correct layer (module / handler / routes / controller / service / mapper / lib / config / constants).
- [ ] File and folder naming match Sections 5–6.
- [ ] Handler stays glue-only — no business logic added to `index.mjs`.
- [ ] Controllers don't reach into AWS SDKs directly; they go through `lib/`.
- [ ] Mappers used when crossing DB ↔ Domain ↔ DTO ↔ Index ↔ Event boundaries.
- [ ] Inputs validated via a schema, not ad-hoc `if` checks.
- [ ] Auth checks live in services (`assertCan*`), not controllers.
- [ ] Response follows the `{ success, error, message }` contract in Section 11.
- [ ] HTTP status code is meaningful.
- [ ] No cross-module imports between `modules/*`; shared code promoted to the Lambda Layer.
- [ ] Imports grouped per Section 14. No mid-file imports.
- [ ] No secrets or PII in logs. Verbose logs gated by a debug flag.
- [ ] No commented-out code.
- [ ] `.env.example` + `config.mjs` updated for any new config key.
- [ ] Prisma schema + migration included for any DB change. OpenSearch mapping updated when the index shape changes.
- [ ] Tests added/updated for services and non-trivial mappers.

---

## 23. Comments & Dead Code

- No commented-out code in committed files. Delete it.
- Comments explain **why**, not **what**. The code says what.
- TODOs include an owner/ticket: `// TODO(fahad): replace hardcoded cosmedium_sockets table with config lookup`.

---

_Changes to this doc require the same scrutiny as code changes — open a PR, don't just edit in place._
