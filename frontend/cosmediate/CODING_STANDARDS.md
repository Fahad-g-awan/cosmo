# Cosmediate — Coding Standards

> **Audience**: Human engineers + AI agents working on this monorepo.
> **Scope**: All 4 apps (`web`, `app`, `auth`, `blog`) + shared packages.
> **Status**: Living document. Update when conventions change.

This document codifies the naming, folder structure, and layering conventions for the Cosmediate frontend monorepo.

---

## 1. Core Principle

> **Classify code by responsibility, not by "type of code".**

- Wrong thinking: "this is a helper → `utils`"
- Right thinking: "this belongs to business logic / infrastructure / shared pure logic"

Every file fits into one of **5 layers**. No exceptions.

---

## 2. The 5 Layers

### 2.1 Feature (Domain)

Where the product lives. Self-contained, per-domain folders.

```
features/
  treatments/
    index.ts
    treatments.service.ts   # business logic
    treatments.api.ts       # backend calls (frontend) or route handlers (backend)
    treatments.mapper.ts    # transform DB ↔ API ↔ UI
    types.ts
    constants.ts            # domain-specific constants only
    hooks/                  # frontend only
    components/             # frontend only
```

Rule: if it only makes sense in "treatments" → it lives here.

### 2.2 Services

A service = **business logic that coordinates data**. Most teams misuse this layer.

```ts
// treatments.service.ts
export const createTreatment = async (input) => {
  const validated = validateInput(input);
  const saved = await prisma.treatment.create(validated);
  return mapTreatmentToDTO(saved);
};
```

- ✅ Business rules, orchestration, DB + API coordination.
- ❌ Formatting, random helpers, constants.

### 2.3 Utils

A util = **pure function with NO domain knowledge**.

```ts
formatCurrency(1000);
capitalize("hello");
generateSlug("clinic name");
```

Rules:

- ❌ No DB, no API, no business logic, no feature knowledge.
- If your util looks like `getClinicDisplayName(clinic)` → that's domain logic → move to `features/clinic`.

### 2.4 Lib (Infrastructure / Setup)

Lib = **wrappers around external systems or core setup**. NOT "miscellaneous code".

```
lib/
  prisma.ts       # backend
  redis.ts        # backend
  opensearch.ts   # backend
  aws.ts          # backend
  apiClient.ts    # frontend (axios)
  authClient.ts   # frontend
```

- ✅ SDK initialization, DB clients, API clients, external integrations.
- ❌ Feature logic, formatting.

### 2.5 Config

Config = **static values that define system behavior**.

```ts
// panelHeader.config.ts
export const panelHeaderConfig = {
  /* ... */
};

// routes.config.ts
export const API_ROUTES = {
  /* ... */
};
```

- ✅ Feature toggles, UI config, route mappings, environment-driven behavior.
- ❌ Functions, business logic, dynamic data.

### 2.6 Constants (Scoped)

Fixed values used repeatedly.

- **Global**: `constants/roles.ts`, `constants/statuses.ts`
- **Feature-local**: `features/treatments/constants.ts`

Rule: shared across app → global; specific to one feature → inside the feature.

---

## 3. Mappers (Critical — Read This)

A **mapper** transforms data between representations. It is a **decoupling layer**.

### Why

The system has multiple shapes of the same data:

- Database shape (DynamoDB / Prisma)
- API response shape
- Frontend UI shape

Mixing them directly → tight coupling, fragile. **Mappers break the coupling.**

### Example

```ts
// user.mapper.ts
export const mapUserToDTO = (user) => ({
  id: user.id,
  fullName: `${user.firstName} ${user.lastName}`,
  avgRating: user.reviewCount ? user.ratingSum / user.reviewCount : 0,
});
```

### Naming

`<entity>.mapper.ts`, exporting functions like `mapXToDTO`, `mapDTOToUI`, `mapUIToApiRequest`.

### Where they live

Inside the relevant feature folder: `features/<domain>/<domain>.mapper.ts`.

---

## 4. Folder Naming

| Folder type                     | Case       | Example                                    |
| ------------------------------- | ---------- | ------------------------------------------ |
| Feature / module                | kebab-case | `search-filter/`, `auth/`                  |
| Next.js route folder            | kebab-case | `clinic-management/`, `treatment-results/` |
| Utility / lib                   | kebab-case | `date-utils/`                              |
| React component folder          | PascalCase | `Counter/`, `ProfileCard/`                 |
| Sub-component folder inside one | PascalCase | `Counter/components/`                      |
| Hooks folder                    | kebab-case | `hooks/`                                   |

### Why kebab-case for features / routes

- Better readability in URLs (Next.js file-system routing).
- Industry standard in Next.js apps.
- Avoids casing ambiguity across OSes.

### Examples

```
✅ search-filter        (feature)
✅ clinic-management    (Next.js route)
❌ searchFilter         (camelCase — ambiguous with a component)
❌ SearchFilter         (PascalCase — looks like a component, not a feature)
```

---

## 5. File Naming

| File type                         | Case                         | Example                                                          |
| --------------------------------- | ---------------------------- | ---------------------------------------------------------------- |
| React component                   | PascalCase                   | `ProfileCard.tsx`, `Counter.tsx`                                 |
| Hook                              | camelCase (must start `use`) | `useAuth.ts`, `useSilentAuth.ts`                                 |
| Utility / helper                  | kebab-case                   | `format-currency.ts`, `parse-url.ts`                             |
| Type file (central)               | PascalCase + `Types` suffix  | `ClinicTypes.ts`, `AuthTypes.ts`                                 |
| Type file (colocated / small)     | `types.ts`                   | `features/treatments/types.ts`                                   |
| Constants (values)                | camelCase                    | `durationOptions.ts`                                             |
| Constants (pure constants, small) | UPPER_CASE                   | `API_ROUTES.ts`, `APP_CONFIG.ts`                                 |
| Config / schema                   | `<name>.<role>.ts`           | `clinic.schema.ts`, `panel.config.ts`                            |
| API / service                     | `<name>.<role>.ts`           | `treatments.api.ts`, `auth.service.ts`                           |
| Mapper                            | `<name>.mapper.ts`           | `review.mapper.ts`                                               |
| Next.js special                   | fixed (don't rename)         | `page.tsx`, `layout.tsx`, `route.ts`, `loading.tsx`, `error.tsx` |

### UI package exception

The `packages/ui/` package uses **snake_case** file names to visually distinguish shared primitives from app-level files (e.g., `profile_card.tsx`). Do not apply this convention outside `packages/ui/`.

### The `<name>.<role>.ts` pattern

Scales cleanly:

```
clinic.schema.ts
review.mapper.ts
user.service.ts
treatments.api.ts
panel.config.ts
auth.validation.ts
```

- `.api.ts` → external calls
- `.service.ts` → business logic
- `.mapper.ts` → transformations
- `.schema.ts` → Zod / validation
- `.config.ts` → static config
- `.validation.ts` → validation rules

### Don't overdo UPPER_CASE filenames

`api-routes.ts` beats `API_ROUTES.ts` for most cases. Reserve UPPER_CASE for truly global, pure-constant modules.

### Types: PascalCase vs `types.ts`

- **Shared / global types** → PascalCase central file: `AuthTypes.ts`, `ClinicTypes.ts`
- **Colocated feature types (small)** → `types.ts` inside the feature folder

Recommendation at this scale: prefer `types.ts` inside features; use PascalCase only for truly shared/global types.

---

## 6. Quick Decision Guide

When you create a file, ask in order:

1. **Is this tied to a feature/domain?** → `features/<domain>/...`
2. **Is it business logic?** → `<name>.service.ts`
3. **Is it pure reusable logic, no domain knowledge?** → `utils/`
4. **Is it external system setup / SDK wiring?** → `lib/`
5. **Is it static configuration?** → `config/` or `<name>.config.ts`
6. **Is it just fixed values?** → `constants/`

---

## 7. Backend-style Flow (Reference)

```
Controller → Service → (Repository / DB) → Mapper → Response
```

Even though this monorepo is frontend-heavy, BFF routes (`/api/auth/*`, `/api/user/*`) should mirror this mental model:

- Route handler (controller) → calls service → service uses lib clients / DB → maps the result → returns a standardized response.

---

## 8. API Payload Casing

Decision locked (see `AUTH_PHASE_2_PLAN.md` N6):

- **OAuth-spec fields** (`client_id`, `redirect_uri`, `code`, `state`, `grant_type`, `scope`, etc.) → stay **snake_case**. Follow the RFC.
- **Internal JSON** between our own services (client BFF ↔ auth BFF, BFF ↔ frontend) → **camelCase**.
- **API response field names** from the Lambda backend → whatever the backend returns (currently camelCase); do NOT translate in the BFF unless necessary.

If you need translation, put it in a mapper, not ad-hoc in the route handler.

---

## 9. Error Response Contract

Standard shape for BFF responses (to be finalized in the "Error Handling Standardization" phase):

```ts
// Success
{ success: true, ...data }

// Error
{ success: false, error: "error_code_snake_case", message: "Human-readable" }
```

- `error` is a stable machine code (e.g., `token_exchange_failed`, `unauthorized`, `invalid_session`).
- `message` is human-readable for logs/dev only. UIs resolve their own copy from the code via a translation layer — do NOT display backend messages raw.
- **POST BFF routes never return redirects.** Always JSON. Redirects belong on GET routes or client-side navigation.

---

## 10. Imports

- Imports **always** at the top of the file. No mid-file imports.
- Group order: external → internal packages (`@cosmediate/*`) → absolute app aliases (`@app/*`, `@web/*`) → relative (`./`, `../`).
- No circular dependencies between feature folders. If two features need each other, either extract shared code to a package or the `shared/` area.

---

## 11. Comments & Dead Code

- No commented-out code in committed files. Delete it.
- Comments explain **why**, not **what**. The code says what.
- TODOs include a ticket/issue reference or a name: `// TODO(fahad): wire up when social login backend lands`.

---

## 12. Logging

- Production paths: structured logs only, never log tokens / secrets / full user objects.
- Dev verbose logs: gated behind `process.env.DEBUG_AUTH === "true"` (or equivalent per-feature flag).
- Log prefixes: `[<app>:<route-or-module>]`, e.g., `[app:/api/auth/exchange]`. Consistent across all 4 apps.

---

## 13. File-System Layout Reminders (per app)

See `AGENTS.md` for the full monorepo structure. TL;DR per client app:

```
src/
  app/                # Next.js App Router
  features/           # Domain features (kebab-case folders)
  components/         # Shared React components (PascalCase folders)
  context/            # React contexts + providers
  layout/             # Layout wrappers
  hooks/              # Shared hooks
  lib/                # Infrastructure (axios, clients)
  config/             # Static config
  constants/          # Global constants
  types/              # App-wide types
  utils/              # Pure utils (if any)
  proxy.ts            # Middleware
```

---

## 14. Review Checklist (Pull Requests)

- [ ] File lives in the correct layer (feature / service / util / lib / config / constants).
- [ ] File name matches the layer's convention (`Section 5`).
- [ ] Folder casing matches (`Section 4`).
- [ ] No `console.log` left unless gated by a debug flag.
- [ ] No commented-out code.
- [ ] Imports at top, no relative reaches into another app's internals.
- [ ] Mappers used when crossing DB ↔ API ↔ UI boundaries.
- [ ] Error responses follow the contract in `Section 9`.
- [ ] New feature folder: kebab-case + has `index.ts`, `types.ts`, and domain files co-located.

---

_Changes to this doc require the same scrutiny as code changes — open a PR, don't just edit in place._
