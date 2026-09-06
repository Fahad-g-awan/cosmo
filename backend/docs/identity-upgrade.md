# Identity Upgrade — Implementation Plan

**Status:** Locked, ready to execute
**Pre-condition:** No production users → clean-cut migration. No backfill. No dual-write. No feature flags.
**Estimated effort:** 1 focused work-week if no scope creep.
**Out of scope (parked):** see [Appendix A](#appendix-a--out-of-scope).

---

## Summary

Move authentication concerns from four scattered role tables (`Admin`, `User`, `Specialist`, `ClinicManager`) into a single `Identity` table. Profile tables become pure domain data. Add `role` + `entityId` hint columns on `Identity` so the identity-resolution path is bounded to ≤ 2 queries. Rename `User` → `Patient`. Drop `ClinicManager` ownership in favor of access-based multi-clinic via `ClinicManagerLink`.

Final shape:

```
Cognito (sub)
   │
   ▼
Identity   ← all auth fields (cognitoSub, email, status, perms, providers...)
   │       ← + role + entityId hint (denormalized pointer; source-of-truth is the FK)
   │
   │ identityId
   ├──► Admin           (1:1)
   ├──► Specialist      (1:1)
   ├──► ClinicManager   (1:1) ──► ClinicManagerLink ──► Clinic[]
   └──► Patient         (1:1)
```

---

## Locked decisions

| #   | Decision                                                                                                                                                                                                     | Rationale                                                                                                                                                                                                    |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | **No `IdentityRole` table. Ever in this PR.**                                                                                                                                                                | Today one human = one role. Manager multi-clinic is same-role-multi-context (solved by `ClinicManagerLink`), not multi-role. Migration to `IdentityRole` later is ~half a day of work if ever needed. YAGNI. |
| 2   | `Identity.cognitoSub` (not `sub`)                                                                                                                                                                            | Removes ambiguity.                                                                                                                                                                                           |
| 3   | `User` → `Patient` (model + enum value)                                                                                                                                                                      | Domain-correct naming.                                                                                                                                                                                       |
| 4   | Drop `CLINIC` from `ROLE` enum + drop `Clinic.role` field                                                                                                                                                    | Clinic is an org, not a human identity.                                                                                                                                                                      |
| 5   | `ClinicManager.parentClinicId` removed                                                                                                                                                                       | Multi-clinic access via existing `ClinicManagerLink`. No "owner" concept.                                                                                                                                    |
| 6   | Soft delete kept everywhere                                                                                                                                                                                  | Cascade semantics deferred to separate doc.                                                                                                                                                                  |
| 7   | No "primary role" resolution. No `X-Active-Role` header.                                                                                                                                                     | Manager endpoints take explicit `clinicId`.                                                                                                                                                                  |
| 8   | Auth fields live ONLY on `Identity`                                                                                                                                                                          | `cognitoSub`, `email`, `phone`, `status`, `defaultPasswordUsed`, `passwordSet`, `linkedProviders`, `perms`.                                                                                                  |
| 9   | `Identity.role` + `Identity.entityId` hint columns                                                                                                                                                           | Identity-resolution path bounded to ≤ 2 queries. Hint is a denormalized pointer, not source-of-truth — FK via `identityId` is authoritative.                                                                 |
| 10  | Hint columns match authorizer `ctx` vocabulary exactly                                                                                                                                                       | `ctx.role = identity.role`, `ctx.entityId = identity.entityId`. Zero field-name translation.                                                                                                                 |
| 11  | Profile tables keep `identityId @unique` reverse pointer                                                                                                                                                     | Enables 1-query JOIN reads on typed routes AND serves as drift-recovery fallback.                                                                                                                            |
| 12  | Hint-column writes restricted to two service functions, always inside `$transaction`                                                                                                                         | Prevents drift. Dev integrity SQL in Phase 8 catches any leaks.                                                                                                                                              |
| 13  | `ROLE` enum kept (not renamed to `PROFILE_TYPE`)                                                                                                                                                             | Cosmetic-only rename; defer to post-upgrade standalone PR to minimize churn.                                                                                                                                 |
| 14  | `ClinicManagerLink` is the manager-RBAC surface — all future manager authorization scope (per-link perms, grantedBy, expiresAt, revokedAt) extends this table only. Do not create a parallel RBAC structure. | Future scope (per-link perms, grantedBy, expiresAt, revokedAt) extends this table, not a parallel structure.                                                                                                 |
| 15  | Dev migration = `prisma migrate reset`                                                                                                                                                                       | No backfill. No live data.                                                                                                                                                                                   |
| 16  | **Org boundary lives on the clinic side, not on `ClinicManager`** — a manager belongs to exactly one org, and that org is *derived* from `Clinic.parentClinicId` of the clinics they're linked to. No `ClinicManager.parentClinicId` column. | Single source of truth: `Clinic.parentClinicId` already models the org tree. Adding a redundant column on the manager re-creates the dual-write bug we just removed. Deriving from the link table keeps the schema clean and lets the bootstrap case ("first link defines the org") fall out naturally. |

---

## Phases

| Phase                                         | Title                                               | Output                                                                     |
| --------------------------------------------- | --------------------------------------------------- | -------------------------------------------------------------------------- |
| [0](#phase-0--audit--prep)                    | Audit & prep                                        | Inventory of impacted files. No code changes.                              |
| [1](#phase-1--schema--migration)              | Schema & migration                                  | `prisma/schema.prisma` rewritten. DB reset. Prisma client regenerated.     |
| [2](#phase-2--lambda-layer-service)           | Lambda layer service                                | `services/prisma/identity.mjs` + helpers. UNION hack deleted.              |
| [3](#phase-3--authorizer)                     | Authorizer rewrite                                  | `cosmediate-api-authorizer` uses Pattern A.                                |
| [4](#phase-4--authentication-module)          | Authentication module                               | Signup/login/OAuth/password/permissions go through `Identity`.             |
| [5](#phase-5--domain-modules)                 | Domain modules: Admins / Specialists / Patients     | CRUD wraps `Identity` + profile in `$transaction`.                         |
| [6](#phase-6--clinics--clinicmanager)         | Clinics + ClinicManager                             | Multi-clinic access via `ClinicManagerLink`. Manager-creates-manager flow. |
| [6.5](#phase-65--org-scoped-manager-picker)   | Org-scoped manager picker                           | Re-derive the manager↔org boundary from the clinic tree (no schema change). |
| [7](#phase-7--pre-auth-triggers--projections) | Pre-auth triggers + stream / OpenSearch projections | Email-uniqueness check, identity-aware indexing.                           |
| [8](#phase-8--smoke-test--cleanup)            | Smoke test & cleanup                                | All flows verified. Dead code removed.                                     |

Each phase ends with explicit acceptance criteria. Do not start phase N+1 until phase N is green.

---

## Phase 0 — Audit & prep

**Status:** Completed inline below.
**Goal:** Concrete inventory of every file that will change, so Phases 1–8 are deterministic.

### 0.1 `prisma.user.*` → `prisma.patient.*` rename sites (Phase 5)

Files using `prisma.user.*`:

| File                                                        | Ops                                                                            |
| ----------------------------------------------------------- | ------------------------------------------------------------------------------ |
| `modules/cosmediate-users/lib/utils.mjs`                    | `findUnique` (email), `findFirst` (id), `findMany` (ids), `findMany` (generic) |
| `modules/cosmediate-users/controllers/user.mjs`             | `create`, `update`, `update` (soft delete)                                     |
| `modules/cosmediate-reviews/lib/utils.mjs`                  | `findUnique` (id) — `getAuthorById`                                            |
| `modules/cosmediate-reviews/controllers/reviews.mjs`        | commented reference only                                                       |
| `modules/cosmediate-opensearch-indexing/services/users.mjs` | `findUnique` (indexing lookup)                                                 |
| `modules/cosmediate-authentication/lib/utils.mjs`           | `findFirst` (email), `findFirst` (id), `findMany` (ids)                        |
| `modules/cosmediate-authentication/controllers/*.mjs`       | Multiple call sites — see §0.4 for auth-field writes                           |

**Action (Phase 5):** every `prisma.user.` → `prisma.patient.`. Validation schemas referencing `User` also renamed.

### 0.2 `getUserBySub` callers (Phase 2 deletes the function; all these migrate)

Real callers (uncommented):

| File                                                        | Line-ish | Migration target                                      |
| ----------------------------------------------------------- | -------- | ----------------------------------------------------- |
| `modules/cosmediate-pre-auth-token-gen/index.mjs`           | ~97      | `getIdentityByCognitoSub`                             |
| `modules/cosmediate-specialists/controllers/specialist.mjs` | ~157     | `getIdentityWithProfile` (needs `entityId` for audit) |

All other hits are **commented-out** blocks (dead code from the DDB era). Clean them up opportunistically during Phases 4–6.

Also: `getUserBySub` is imported from `/opt/nodejs/services/db.mjs` in many modules but not called. Those import statements need removal once the function is deleted. Grep target: `import { ... getUserBySub ... } from "/opt/nodejs/services/db.mjs"`.

### 0.3 Role-table auth-field writes (Phase 4 + 5 + 6 move to `Identity`)

Writers of `defaultPasswordUsed` / `passwordSet` / `linkedProviders` on role tables:

| File                                                                | Target role                                                             |
| ------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| `modules/cosmediate-users/controllers/user.mjs:142-148`             | `User` creation (→ `Patient` creation, via `createIdentityWithProfile`) |
| `modules/cosmediate-specialists/controllers/specialist.mjs:255-261` | `Specialist` creation                                                   |
| `modules/cosmediate-clinics/controllers/manager.mjs:249-256`        | `ClinicManager` creation                                                |
| `modules/cosmediate-authentication/lib/utils.mjs:118-148`           | Generic creator (`createUser`-style helper)                             |
| `modules/cosmediate-authentication/lib/utils.mjs:395-428`           | `updateUser_DefaultPasswordUsed_Status`                                 |

**Action:** all writes move to `Identity` via `createIdentityWithProfile` / `updateIdentity`. Role tables never touch these fields after Phase 1.

### 0.4 `parentClinicId` — two separate usages

**`ClinicManager.parentClinicId` (dropped in Phase 1):**

| File                                                                                   | Usage                                            |
| -------------------------------------------------------------------------------------- | ------------------------------------------------ |
| `prisma/schema.prisma:227-240`                                                         | Field + relation definition                      |
| `modules/cosmediate-clinics/controllers/manager.mjs:256`                               | Write on manager create                          |
| `modules/cosmediate-clinics/lib/utils/manager.mjs:104`                                 | Read on manager select                           |
| `modules/cosmediate-opensearch-indexing/services/clinic/clinic.mjs:252, 260, 296, 319` | Indexing logic                                   |
| `modules/cosmediate-opensearch-mapping/lib/mappings.mjs:371`                           | ClinicManager index mapping — keep field removal |
| `modules/cosmediate-db-stream-handler/opsIndexing/lib/mappings.mjs:234`                | Stream-to-OpenSearch projection                  |

**Action (Phase 6):** replace all `parentClinicId` logic on manager with `ClinicManagerLink` membership checks. Drop the column.

**`Specialist.parentClinicId` (KEPT — full-time-at-clinic semantic):**

| File                                                                                                   | Usage                             |
| ------------------------------------------------------------------------------------------------------ | --------------------------------- |
| `prisma/schema.prisma:348-357`                                                                         | Field + relation definition       |
| `modules/cosmediate-specialists/controllers/specialist.mjs` (many lines)                               | Full-time creation + update flows |
| `modules/cosmediate-specialists/services/ops.mjs:167`                                                  | Clinic-scoped search              |
| `modules/cosmediate-treatments/controllers/treatmentSelection.mjs:337`                                 | Eligibility filter                |
| `modules/cosmediate-opensearch-indexing/services/specialist.mjs:111-194`                               | Indexing                          |
| `modules/cosmediate-users/services/ops.mjs:88`, `modules/cosmediate-clinics/services/ops.mjs:207, 226` | Search filters                    |

**Action:** no change. Document that `Specialist.parentClinicId` is unrelated to the manager-ownership drop.

### 0.5 `Review.authorId` / `Review.authorRole` (OUT OF SCOPE — deferred)

Schema: `prisma/schema.prisma:577-578, 600, 616-617, 638`.

Controllers / libs:

- `modules/cosmediate-reviews/controllers/reviews.mjs` — multiple usages (create, update, delete, ownership check)
- `modules/cosmediate-reviews/controllers/replies.mjs` — same pattern, plus author-role discriminator logic with `"CLINIC"` strings
- `modules/cosmediate-reviews/lib/utils.mjs` — `validateReviewOwnership`, `validateReplyOwnership`, `getAuthorById`
- `modules/cosmediate-reviews/services/ops.mjs` — `authorId` filter

**Action:** NO changes in this upgrade. But note `replies.mjs:62-76` uses hardcoded `"CLINIC"` author role — this will still work post-upgrade because we're not touching `Review*` models. Follow-up PR adds `authorIdentityId`.

### 0.6 `ROLE.CLINIC` / `Clinic.role` usages

- Schema: `prisma/schema.prisma` — `Clinic.role ROLE @default(CLINIC)` (to be dropped Phase 1).
- `LEAD_TYPE.CLINIC` is a different enum — **unrelated, keep**.
- No code reads `Clinic.role` as a discriminator (confirmed via grep). Safe to drop.
- `Review.authorRole = "CLINIC"` string literal in `replies.mjs` — unrelated to the `ROLE` enum. Keep.

**Action:** Phase 1 drops `Clinic.role` field and removes `CLINIC` from `ROLE` enum. Zero downstream consumers break.

### 0.7 Authorizer `ctx` consumers

**Current shape** (observed in commented code in `cosmediate-api-authorizer/index.mjs:86-95`):

```js
ctx = { sub, email, role, userId, perms };
```

All downstream controllers access via `authContext.sub`, `authContext.userId`, `authContext.role`, `authContext.perms` (grep shows ~80+ uses across modules, all read-only).

**Mapping to new shape (Phase 3):**

| Old field                        | New field                | Source                     |
| -------------------------------- | ------------------------ | -------------------------- |
| `authContext.sub`                | `authContext.cognitoSub` | `identity.cognitoSub`      |
| `authContext.userId`             | `authContext.entityId`   | `identity.entityId`        |
| `authContext.email`              | `authContext.email`      | `identity.email`           |
| `authContext.role`               | `authContext.role`       | `identity.role`            |
| `authContext.perms`              | `authContext.perms`      | `identity.perms.join(" ")` |
| _(new)_ `authContext.identityId` | `identity.id`            |

**Two renames required across all consumers:**

- `authContext.sub` → `authContext.cognitoSub` — ~20-30 call sites (mostly in the commented `getUserBySub(..., authContext.sub)` blocks that are being deleted anyway).
- `authContext.userId` → `authContext.entityId` — ~5-10 active call sites (mostly `authContext.userId === id` self-delete guards in Admin/User/Specialist/Leads delete controllers).

**Action (Phase 3):** global rename with `multi_edit` or equivalent. Trivial.

### 0.8 OpenSearch projections (Phase 7)

Files that currently project role-table auth fields into search docs:

| File                                                                | Doc types                                                                                                                                      |
| ------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `modules/cosmediate-opensearch-mapping/lib/mappings.mjs`            | Admin (89-96), ?(123-131), ClinicManager (365-376), Specialist (569-577) — all include `linkedProviders`, `defaultPasswordUsed`, `passwordSet` |
| `modules/cosmediate-db-stream-handler/opsIndexing/lib/mappings.mjs` | Admin (28-36), ?(58-66), ClinicManager (234-238), Specialist (362-366) — same projections                                                      |
| `modules/cosmediate-opensearch-indexing/lib/indexing/mappings.mjs`  | Additional projections                                                                                                                         |

**Action (Phase 7):** fields stay in search docs but their source changes — pulled from `identity.*` in the indexing service, not from the role-table row. Also add `identityId` projection. Index re-created on DB reset so no data migration.

### 0.9 Surprises / open items

- **None blocking.** All affected files enumerated.
- **Minor:** many `getUserBySub` callers are in commented blocks (legacy DDB era). Phase 2 can safely delete the imports everywhere — the commented references become orphaned but harmless. Optional tidy-up: uncomment nothing, just delete the import lines.
- **Minor:** `modules/cosmediate-authentication/lib/utils.mjs` has an old `createUser`-style helper with `role`, `perms`, etc. parameters (line 118). It's used by some auth flows. Phase 4 replaces it with `createIdentityWithProfile`.

### 0.10 Acceptance

- ✅ Audit notes exist.
- ✅ No surprises that invalidate the plan.
- ✅ Every phase downstream has a concrete file list.

**Dependencies:** none.
**Rollback:** n/a (no changes made).

---

## Phase 1 — Schema & migration

**Goal:** New schema in place. Database reset. Prisma client regenerated. Code does not compile yet (expected) — that's Phase 2+.

**Files touched:**

- `prisma/schema.prisma` — full rewrite of auth-related models.
- `lambdaLayerPackages/prisma/nodejs/node_modules/.prisma/client/` — regenerated artifact.

**Schema changes:**

### 1.1 New model: `Identity`

```prisma
model Identity {
  id          String   @id @default(cuid())
  cognitoSub  String   @unique
  email       String   @unique
  phone       String?

  status      USER_STATUS @default(UNCONFIRMED)

  defaultPasswordUsed Boolean  @default(false)
  passwordSet         Boolean  @default(false)
  linkedProviders     String[] @default([])
  perms               String[] @default([])

  // Hint columns — denormalized pointer for fast auth-path routing. NOT source of truth.
  // Source of truth = the FK (identityId) on the profile table.
  // Written ONLY by createIdentityWithProfile / removeProfile, always in $transaction.
  role      ROLE?
  entityId  String?

  lastLoginAt DateTime?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  deletedAt   DateTime?
  deleted     Boolean   @default(false)

  admin         Admin?
  specialist    Specialist?
  clinicManager ClinicManager?
  patient       Patient?

  @@index([email])
  @@index([role, entityId])
}
```

### 1.2 Slim profile tables

Apply uniformly to `Admin`, `Specialist`, `ClinicManager`, `Patient`:

- **Add:** `identityId String @unique`, `identity Identity @relation(fields: [identityId], references: [id], onDelete: Cascade)`.
- **Remove:** `sub`, `email`, `phone` (the human one), `status`, `role`, `perms`, `defaultPasswordUsed`, `passwordSet`, `linkedProviders`.
- **Keep:** all profile/domain fields (firstName, lastName, address, ratings, htmlAbout, treatments, etc.).

`Specialist` keeps `parentClinicId` (full-time-at-clinic semantic, unrelated to ownership).

`ClinicManager`: also drop `parentClinicId` and the back-relation on `Clinic`.

### 1.3 Rename `User` → `Patient`

Symbol-level rename in schema. Update every relation name that points to `User`. (Audit Phase 0 lists these.)

### 1.4 `ClinicManagerLink` (existing) — source of truth for access

Already has `(clinicId, managerId)`. No structural change in this phase.

Optional fields to consider adding later (NOT this PR): `perms String[] @default([])`, `grantedByManagerId String?`.

### 1.5 Enum

```prisma
enum ROLE {
  ADMIN
  MANAGER
  SPECIALIST
  PATIENT      // renamed from USER; CLINIC removed
}
```

### 1.6 `Clinic`

- Drop `role ROLE @default(CLINIC)` field.
- Drop the back-relation that pointed at `ClinicManager.parentClinicId`.

**Commands:**

```bash
npx prisma generate
npx prisma migrate reset --force      # dev DB only — wipes data
```

**Acceptance:**

- `npx prisma validate` passes.
- `npx prisma generate` succeeds.
- `npx prisma migrate reset --force` runs clean.
- DB has tables: `Identity`, `Admin`, `Specialist`, `ClinicManager`, `Patient`, `Clinic`, all link tables, no `User` table.
- Application code compiles fail (expected — Phases 2–7 fix this).

**Dependencies:** Phase 0.
**Rollback:** `git revert` schema commit + `prisma migrate reset` again.

---

## Phase 2 — Lambda-layer service

**Goal:** Centralised identity service in the shared layer. UNION hack deleted.

**Files touched:**

- **NEW:** `lambdaLayer/nodejs/services/prisma/identity.mjs`
- **MODIFY:** `lambdaLayer/nodejs/services/prisma/auth.mjs` — remove `getUserBySub`. Keep file for any non-identity auth helpers; delete file if it becomes empty.

**API contract for `identity.mjs`:**

```js
// Read
getIdentityByCognitoSub(dbUrl, cognitoSub)         // → Identity | null   (Pattern A)
getIdentityByEmail(dbUrl, email)                    // → Identity | null
getIdentityById(dbUrl, identityId)                  // → Identity | null
getIdentityWithProfile(dbUrl, cognitoSub)           // → { identity, role, profile } | null   (Pattern B)
getProfileWithIdentity(dbUrl, role, entityId)       // → { identity, role, profile } | null   (Pattern C)

// Create (single $transaction)
createIdentityWithProfile(dbUrl, {
  cognitoSub, email, phone, status,
  role,                              // "ADMIN" | "SPECIALIST" | "MANAGER" | "PATIENT"
  profileData,                       // fields for the target profile table
  defaultPasswordUsed = false,
  passwordSet = false,
  linkedProviders = [],
  perms = [],
})
  → { identity, profile }

// Update
updateIdentity(dbUrl, identityId, patch)            // patches Identity scalars
updateIdentityEmail(dbUrl, identityId, newEmail)    // caller must also update Cognito

// Delete
softDeleteIdentity(dbUrl, identityId)               // sets deleted=true; does NOT cascade
removeProfile(dbUrl, identityId)                    // hard-removes profile + clears hint, in $transaction. Rare.
```

**Lookup patterns (load-bearing — read this if nothing else):**

### Pattern A — auth path (1 query)

```js
const identity = await prisma.identity.findUnique({ where: { cognitoSub } });
if (!identity || identity.deleted) return null;
return identity; // identity.role + identity.entityId already populated
```

### Pattern B — auth path needing full profile (2 queries, with drift-recovery fallback)

```js
const identity = await prisma.identity.findUnique({ where: { cognitoSub } });
if (!identity || identity.deleted) return null;

// Happy path: hint columns valid
if (identity.role && identity.entityId) {
  const profile = await fetchProfile(prisma, identity.role, identity.entityId);
  if (profile) return { identity, role: identity.role, profile };
  // hint pointed at a missing row — drift. Fall through to recovery.
}

// Recovery path (rare): hint is null/stale. Reverse-lookup via FK.
// This is also the path for UNCONFIRMED identities that legitimately have no profile yet.
const recovered = await recoverProfileByIdentityId(prisma, identity.id);
return recovered
  ? { identity, role: recovered.role, profile: recovered.profile }
  : { identity, role: null, profile: null };
```

`recoverProfileByIdentityId` does the 4-way fan-out via `identityId @unique` reverse pointers. It's the drift insurance, not the hot path.

### Pattern C — typed-route domain path (1 query, JOIN)

```js
const profile = await prisma[tableFor(role)].findUnique({
  where: { id: entityId },
  include: { identity: true /*, role-specific extras */ },
});
return profile && { identity: profile.identity, role, profile };
```

**Drift control for hint columns:**

- Only `createIdentityWithProfile` and `removeProfile` write to `Identity.role` / `Identity.entityId`.
- Both write inside `prisma.$transaction`.
- Profile soft-delete does NOT touch hint columns (the row still exists).
- Pattern B has a drift-recovery fallback — a stale/missing hint degrades performance, never correctness.
- Dev integrity check (run manually after smoke tests): rows in `Identity` with `role` NOT NULL whose `entityId` does not exist in the corresponding profile table → must be 0.

**Acceptance:**

- All functions exist with the contracts above.
- Unit-callable from a quick scratch test (or a Lambda console invoke) — verify `getIdentityByCognitoSub` returns null gracefully on missing sub, and `createIdentityWithProfile` writes both rows + hint atomically (verify hint is set after success, and absent on rollback).
- `getUserBySub` is deleted; no callers reference it.

**Dependencies:** Phase 1.
**Rollback:** `git revert` Phase 2 commit. Phase 1 schema can stay; reverting service forces other modules to break, so revert in tandem with Phase 3+ if already deployed.

---

## Phase 3 — Authorizer

**Goal:** `cosmediate-api-authorizer` builds new `ctx` from `Identity` in one query.

**Files touched:**

- `modules/cosmediate-api-authorizer/index.mjs`
- `modules/cosmediate-api-authorizer/lib/utils.mjs` (if `allow`/`deny` shape needs adjustment)

**New `ctx` shape:**

```js
ctx = {
  identityId: identity.id,
  cognitoSub: identity.cognitoSub,
  email: identity.email,
  perms: (identity.perms || []).join(" "),
  role: identity.profileType, // ADMIN | SPECIALIST | MANAGER | PATIENT
  entityId: identity.profileId, // profile-table id
};
```

**Permission gate:** unchanged logic — `required.some(p => have.includes(p))`. Source of `have` is `identity.perms`.

**Manager active-clinic context:** NOT resolved at the authorizer. Manager endpoints receive `clinicId` as a path/body param and verify access in the controller:

```js
const link = await prisma.clinicManagerLink.findUnique({
  where: { clinicId_managerId: { clinicId, managerId: ctx.entityId } },
});
if (!link) return forbidden();
```

**Acceptance:**

- Authorizer makes exactly **one** DB query per request (not counting JWT verification, which is in-memory).
- Unauthenticated/missing-token → `deny`.
- Soft-deleted identity → `deny`.
- Identity with `profileType === null` (signup not finalised) → `deny` with explicit reason.
- Existing route-perm matrix in `lib/auth/registry.mjs` still works; no permission strings change.

**Dependencies:** Phase 2.
**Rollback:** `git revert`.

---

## Phase 4 — Authentication module

**Goal:** All auth flows operate on `Identity`. Profile creation happens in the same `$transaction` as identity creation.

**Files touched:**

- `modules/cosmediate-authentication/controllers/auth.mjs` (signup, login, OAuth callback, refresh)
- `modules/cosmediate-authentication/controllers/password.mjs`
- `modules/cosmediate-authentication/controllers/permissions.mjs`
- `modules/cosmediate-authentication/controllers/verification.mjs` — only if it reads/writes auth fields off role tables.
- `modules/cosmediate-authentication/controllers/tokens.mjs` — only if it embeds role-table fields in claims.
- `modules/cosmediate-authentication/lib/...` — adjust validation schemas.

**Behaviour changes:**

| Flow               | Before                                                               | After                                                                                                                        |
| ------------------ | -------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Signup             | Insert into role table with `sub`, `email`, `passwordSet=false`, ... | `createIdentityWithProfile({ cognitoSub, email, profileType, profileData, passwordSet: false, defaultPasswordUsed: true })`. |
| Login              | Look up role table by `sub`; bump fields.                            | `getIdentityByCognitoSub`; `updateIdentity({ lastLoginAt })`.                                                                |
| OAuth callback     | Update `linkedProviders` on role table.                              | `updateIdentity({ linkedProviders })` on `Identity`.                                                                         |
| Set password       | `passwordSet=true` on role table.                                    | `updateIdentity({ passwordSet: true, defaultPasswordUsed: false })`.                                                         |
| Update permissions | Patch `perms[]` on role table.                                       | `updateIdentity({ perms })`.                                                                                                 |
| Email change       | Update role-table email + Cognito.                                   | `updateIdentityEmail` + Cognito in same flow. Profile tables don't store email.                                              |

**Acceptance:**

- Signup creates exactly one `Identity` row + one profile row + hint columns set, atomically.
- Failed profile insert rolls back the identity (transaction works).
- Email uniqueness violation across all roles surfaces as a clean 409 (no DB-error leakage).
- OAuth linking persists `linkedProviders` on `Identity` — visible in subsequent `/me`.
- Password-set flow flips `passwordSet` on `Identity`.

**Dependencies:** Phases 2 + 3.
**Rollback:** `git revert`.

---

## Phase 5 — Domain modules: Admins / Specialists / Patients

**Goal:** CRUD modules for the three single-profile humans. Same pattern in all three.

**Files touched:**

- `modules/cosmediate-admins/**`
- `modules/cosmediate-specialists/**`
- `modules/cosmediate-users/**` (folder name unchanged — code symbols renamed `User` → `Patient`)

**Pattern per module:**

| Op                                 | Behaviour                                                                                                                                            |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Create                             | `createIdentityWithProfile({ profileType: <ROLE>, profileData })`. Wraps both inserts.                                                               |
| List/search                        | Query the profile table (filter `deleted=false`). Optionally `include: { identity: true }` if response needs auth fields.                            |
| Get by id                          | `getProfileWithIdentity(<ROLE>, id)` (Pattern C, single JOIN).                                                                                       |
| Update profile fields              | `prisma.<table>.update({ where: { id }, data: profileFields })`. Auth fields untouched.                                                              |
| Update auth fields (status, perms) | `updateIdentity(identityId, ...)`. Profile table untouched.                                                                                          |
| Soft delete                        | `prisma.<table>.update({ deleted: true })` AND/OR `softDeleteIdentity(identityId)` depending on intent. Document the chosen semantic in each module. |

**Decision per module:** does "delete admin" mean delete the identity (locks them out across all roles, even hypothetical future ones) or just remove the admin profile? **Default for this phase: both** (in same `$transaction`) since today an identity has exactly one profile. Revisit when multi-role becomes real.

**Acceptance per module:**

- Create endpoint returns the new entity with `identityId` populated.
- List/search endpoints return the same shape as before, plus `identityId` if the response was identity-aware.
- Get-by-id returns identity fields where the old response had auth fields (e.g. `email` now sourced from `identity.email`).
- Soft delete sets `deleted=true` on both rows when applicable.

**Dependencies:** Phases 2 + 4.
**Rollback:** per-module `git revert`.

---

## Phase 6 — Clinics + ClinicManager

**Goal:** Multi-clinic manager access via `ClinicManagerLink`. No "owner". Manager-creates-manager flow works.

**Files touched:**

- `modules/cosmediate-clinics/**` — manager subroutes specifically.

**Behaviour:**

| Op                                                        | Behaviour                                                                                                                                                                            |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Admin creates clinic + first manager                      | `$transaction([createClinic, createIdentityWithProfile(MANAGER), createClinicManagerLink])`.                                                                                         |
| Existing manager grants access to another manager         | Authorize: `ctx.role === "MANAGER" AND ClinicManagerLink(clinicId, ctx.entityId) exists`. Then `prisma.clinicManagerLink.create(...)`.                                               |
| Manager creates a NEW manager (new identity) for a clinic | `$transaction([createIdentityWithProfile(MANAGER, {...}), createClinicManagerLink({ clinicId, managerId: newManager.id })])`. Authorize: granting manager has access to that clinic. |
| Revoke access                                             | `prisma.clinicManagerLink.delete(...)`. Manager's `Identity`/`ClinicManager` rows untouched.                                                                                         |
| List manager's clinics                                    | `prisma.clinicManagerLink.findMany({ where: { managerId }, include: { clinic: true } })`.                                                                                            |
| List clinic's managers                                    | `prisma.clinicManagerLink.findMany({ where: { clinicId }, include: { manager: { include: { identity: true } } } })`.                                                                 |
| Manager-scoped endpoint (e.g. update clinic)              | Verify `ClinicManagerLink(ctx.entityId, clinicId)` before action.                                                                                                                    |

**Acceptance:**

- A single manager identity can be linked to ≥ 2 clinics simultaneously.
- Granting/revoking does not require recreating identities.
- A manager without a link to clinic X is rejected by manager-scoped endpoints for that clinic.
- Removing a clinic cascades the links (existing FK behaviour) but does not delete the manager's identity.

**Dependencies:** Phases 2 + 4 + 5.
**Rollback:** `git revert`.

---

## Phase 6.5 — Org-scoped manager picker

**Goal:** Reintroduce the "managers belong to one org" invariant that Phase 6 dropped, **without** putting a `parentClinicId` column back on `ClinicManager`. The org of a clinic is its root parent (`Clinic.parentClinicId` chain). The org of a manager is derived from `ClinicManagerLink` and enforced to be a singleton at write time. Brand-new managers (zero links) have a null org until their first link is created — which then defines it.

**Why this works without a column:** the org tree already lives on `Clinic`. Storing it again on the manager would re-create the dual-write bug the upgrade just removed. Deriving keeps the schema honest and makes "first link defines org" fall out for free.

**Files touched:**

- `modules/cosmediate-clinics/lib/utils/clinic.mjs` — add `resolveClinicOrgIds(prisma, clinicId) -> { rootId, orgClinicIds }`.
- `modules/cosmediate-clinics/lib/utils/manager.mjs` — add `resolveManagerOrgRootId(prisma, managerId) -> string | null` and `assertManagersInClinicOrg(prisma, managerIds, clinicId)`.
- `modules/cosmediate-clinics/controllers/manager.mjs`:
  - `createManager` — assert all incoming `clinicIds` resolve to a single root before creating.
  - `getManagers` — accept `filters.scopeClinicId` (controller resolves it to `orgClinicIds[]` then forwards to ops). When caller is `MANAGER` and no scope is supplied, auto-scope to their own org root via `resolveManagerOrgRootId(authContext.entityId)`. ADMIN with no scope → unscoped (current behaviour).
  - `grantManagerAccess` — call `assertManagersInClinicOrg` before upserting the link.
- `modules/cosmediate-clinics/controllers/clinic.mjs`:
  - `createClinic` — when `managerIds` provided, assert their orgs match `org(parentClinicId || newClinic-after-create)`. Bootstrap case (creating a brand-new manager via the inline create-manager flow) is naturally allowed — they have zero links until this clinic gets created.
  - `updateClinic` — same check against `org(foundClinic)`.
- `modules/cosmediate-clinics/services/ops.mjs` — consume `filters.scopeClinicIds: string[]` (already resolved by controller) and inject `terms: { clinicIds }` into the manager OS query.
- `modules/cosmediate-opensearch-indexing/services/clinic/manager.mjs` — fetch with `include: { clinics: { select: { clinicId: true } }, identity: { select: ... } }` so `clinicIds[]` is actually populated in the indexed doc. Drop the dead `parentClinicId` projection in `lib/indexing/mappings.mjs`.
- `lambdaLayer/nodejs/lib/validation/schemas/clinic/manager.mjs` — `parentClinicId` no longer required on `ManagerCreate` (it's just merged into `clinicIds` if supplied).

**Validation rule (single-org invariant):**

```
For every manager M being attached to clinic C:
  let mRoot = resolveManagerOrgRootId(M)
  let cRoot = resolveClinicOrgIds(C).rootId
  if mRoot is null   -> allow  (brand-new, first link defines org)
  if mRoot === cRoot -> allow
  otherwise          -> reject 400 "Manager belongs to a different organization"
```

**Behaviour:**

| Op                                                | Behaviour                                                                                                                                                                  |
| ------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Frontend opens "managers" panel on Clinic X       | `POST /clinics/managers/list` with `filters.scopeClinicId = X.id`. Controller expands to `orgClinicIds[]` and OS filters managers whose `clinicIds` intersect that set.    |
| Admin lists all managers system-wide              | Same endpoint with no `scopeClinicId`. Returns everyone. Auth gate keeps non-admins out of this path.                                                                       |
| Manager (not admin) calls list with no scope      | Controller derives their org root from their own links and applies it implicitly. They never see managers outside their own org.                                            |
| Admin creates clinic with `managerIds`            | Each manager validated to share root with the new clinic. Cross-org attach rejected.                                                                                        |
| Admin creates clinic + new manager (bootstrap)    | New manager has zero links → org-null → first link to the new clinic defines their org. No validation conflict.                                                             |
| `grantManagerAccess`                              | Manager already in same org → idempotent upsert. Manager in different org → 400. Brand-new manager (zero links) → allowed (their first link).                                |
| `revokeManagerAccess`                             | Unchanged — already guards against removing the last manager. Revoking down to zero links is allowed for non-last cases; manager becomes "floating" until re-attached.       |

**Acceptance:**

- Frontend manager picker on a clinic page only shows managers whose existing links resolve to the same org root.
- Cross-org `managerIds` arrays are rejected at write time with a clear 400.
- Bootstrap flow (create clinic + new manager) still works.
- Manager OS doc has `clinicIds[]` populated (verify via OS query).
- Admin's system-wide manager list still works.

**Dependencies:** Phase 6.
**Rollback:** `git revert`. No schema change to undo.

---

## Phase 7 — Pre-auth triggers + projections

**Status:** Implemented (`getIdentityByEmail` in PreSignUp; token claims; OpenSearch `identityId` on profile indices; HubSpot `cosmediate_identity_id` when lead has Specialist; stream OPs base doc).

**Goal:** Pre-auth Cognito triggers and downstream projections (OpenSearch, HubSpot) are identity-aware.

**Implementation notes:**

- Profile index upserts flatten `Identity` auth fields onto the document via `mergeIdentityForSearchDoc` so **profile `id` is never overwritten** by `Identity.id` (those values differ); `identityId` holds `Identity.id`.
- Pre-signup Identity lookup failures are **non-blocking** (signup proceeds; log only) so a cold DB does not wedge Cognito forever.
- HubSpot expects a portal custom contact property **`cosmediate_identity_id`** when you want the field visible in CRM UI; omit or create as needed.

**Files touched:**

- `modules/cosmediate-pre-auth-signup/index.mjs` — email uniqueness check uses `getIdentityByEmail`.
- `modules/cosmediate-pre-auth-token-gen/index.mjs` — optionally inject `identityId` as a custom claim.
- `modules/cosmediate-db-stream-handler/**` — when role tables emit DDB-stream events, project `identityId`.
- `modules/cosmediate-opensearch-indexing/**` — index documents include `identityId`. Don't redesign index schemas.
- `modules/cosmediate-hubspot-consumer/**` — payloads include `identityId`.

**Acceptance:**

- Pre-auth-signup rejects an existing email at the `Identity` level (not per-role-table).
- New search docs in OpenSearch carry `identityId`.
- Existing search behaviour unchanged (filters, fuzzy search, sort) — only the document gains a field.

**Dependencies:** Phases 2 + 4–6.
**Rollback:** `git revert`.

---

## Phase 8 — Smoke test & cleanup

**Goal:** Every flow exercised end-to-end. Dead code removed.

**Status (engineering, 2026-05):**

- Live `prisma.user.*` usage in modules: **none** (only comment references in authentication code). Reviews author resolution uses **patient → admin → specialist → clinicManager** with `identity` include.
- **`getUserBySub`:** not present in `lambdaLayer/`; controller imports of a non-existent export were removed earlier. Residual `// const foundActor = await getUserBySub(` blocks are harmless comment noise; strip in a hygiene pass if desired.
- **`lambdaLayer/nodejs/services/db.mjs`** is DynamoDB helpers only — there was nothing to delete for Cognito lookups here.

**Smoke test matrix:**

- [ ] Signup as Admin → confirm Identity row + Admin row + hint columns + Cognito user.
- [ ] Signup as Specialist → same.
- [ ] Signup as Patient → same.
- [ ] Admin creates Clinic + first Manager → confirm 3 rows (Identity, ClinicManager, ClinicManagerLink).
- [ ] Existing Manager grants access to second Manager on same clinic → second link row.
- [ ] Existing Manager creates a brand-new manager identity for a different clinic they manage → success.
- [ ] Manager without link → manager-scoped endpoint returns 403.
- [ ] Login each role → token issued, `lastLoginAt` updated.
- [ ] OAuth (Google) link on existing email-signup identity → `linkedProviders` updated.
- [ ] Password set on default-password account → `passwordSet=true`, `defaultPasswordUsed=false`.
- [ ] Email change on Identity → reflects in subsequent `/me`.
- [ ] Soft-delete an Admin → cannot log in; existing data still queryable for audit.
- [ ] `getIdentityByCognitoSub` integrity check: every `Identity.profileId` corresponds to a real row in the table indicated by `Identity.profileType`. SQL: see Phase 2 drift check.
- [ ] Rejected re-signup with mismatched cognitoSub on existing email → explicit error, no silent merge.

**Cleanup:**

- [x] Remove dead imports / broken references to `getUserBySub` (export never existed on DynamoDB `db.mjs`).
- [ ] Delete dead validation schemas (per-table email/sub fields) — **deferred**: `schemas/user.mjs` is the **Patient** payload API (`UserCreate`/`UserUpdate` naming), not the removed Prisma `User` model; audit separately if redundant with identity-aware routes.
- [x] Lambda layer: no `getUserBySub` helper remains.
- [x] Search for executable `prisma.user.` usage in `modules/**` — **zero**; comment-only strings may still mention `prisma.user` in docs/comments.
- [ ] Update API response examples in any committed docs (if any still show legacy `User` shapes).

**Acceptance:**

- All **smoke tests** pass (manual QA before prod).
- **Engineering** cleanup items above satisfied where marked done.
- No new lint **errors** on touched paths (pre-existing warnings may remain).

**Dependencies:** Phases 1–7.
**Rollback:** at this point, rollback = revert all Phase 1–7 commits + `prisma migrate reset`. Acceptable because no prod users.

---

## Risk register

| Risk                                                                         | Likelihood | Impact                                 | Mitigation                                                                                        |
| ---------------------------------------------------------------------------- | ---------- | -------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Hint columns drift (profileType/profileId out of sync with profile rows)     | Low        | High (auth path returns wrong profile) | All writes gated to two service functions; both transactional; integrity SQL in Phase 8.          |
| Cognito user exists but no `Identity` (e.g. a user signed up before this PR) | n/a        | n/a                                    | Pre-condition: no users. Verified before Phase 1.                                                 |
| Cognito sub recreated for same email                                         | Low        | Medium                                 | Phase 4 signup rejects with explicit error. Manual admin resolution.                              |
| OpenSearch documents without `identityId` (legacy docs)                      | n/a        | n/a                                    | No legacy docs in dev; index is reset with the DB.                                                |
| Multi-role per identity becomes a real requirement post-launch               | Medium     | Medium                                 | Migration to `IdentityRole` is documented and additive (drop hint columns, add table, copy rows). |
| Reviews/replies still reference role-table ids                               | Certain    | Low                                    | Out of scope. Tracked as follow-up: add `authorIdentityId String?`.                               |
| Rename `User` → `Patient` breaks API consumers                               | Medium     | Medium                                 | Frontend refactor is parallel work. Coordinate API contract changes.                              |

---

## Implementation order summary

Phases 0 → 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8. Sequential. Within phases, files can be tackled in parallel.

Each phase ends with **explicit acceptance** before the next starts. Don't optimize the order; the dependency chain is the dependency chain.

---

## Appendix A — Out of scope

Tracked but not in this upgrade:

- `IdentityRole` table (would replace hint columns if multi-role per identity becomes real). Not happening in this PR. Migration path if ever needed: drop `role`/`entityId` columns, add `IdentityRole` table, `INSERT INTO IdentityRole SELECT id, role, entityId FROM Identity WHERE role IS NOT NULL`, update `identity.mjs`. Half a day of work.
- Multi-role per identity. Hint columns intentionally support exactly one profile.
- `ROLE` enum rename to `PROFILE_TYPE`. Pure cognitive cleanup; do as standalone post-upgrade PR.
- Soft-delete cascade semantics across domains (separate doc).
- Lambda-layer barrel-export refactor (single `index.mjs` per namespace).
- Renaming `cosmediate-users/` folder to `cosmediate-patients/`.
- Frontend auth refactor (parallel track).
- Per-clinic permissions on `ClinicManagerLink.perms`.
- `ClinicManagerLink` is the manager-RBAC surface — all future manager authorization scope (per-link perms, grantedBy, expiresAt, revokedAt) extends this table only. Do not create a parallel RBAC structure.

---

## Appendix B — Why `Identity` exists

Not for query reduction. For:

1. **One row per human.** Today email/sub uniqueness is per-table → silent integrity bugs. Fixed.
2. **Auth fields in one place.** MFA, lockout, new providers → one table change.
3. **OAuth linking is coherent.** Single Google account = single identity.
4. **UNION query dies.** `getUserBySub`'s 4-table UNION → one indexed `findUnique`.
5. **Auth decoupled from domain.** Profile rename/split doesn't touch auth.

Query economy is a side benefit, achieved via the `role` / `entityId` hint columns.

---

## Appendix C — Lookup pattern cheat-sheet

| Caller has                                     | Pattern        | Service fn                | Queries                                             |
| ---------------------------------------------- | -------------- | ------------------------- | --------------------------------------------------- |
| `cognitoSub` from JWT, only needs auth context | A              | `getIdentityByCognitoSub` | **1**                                               |
| `cognitoSub`, needs full profile (`/me`)       | B              | `getIdentityWithProfile`  | **2** (happy path) / **2–5** (drift recovery, rare) |
| Profile id + known type (typed route)          | C              | `getProfileWithIdentity`  | **1** (JOIN)                                        |
| `identityId` (rare; admin tools)               | variant of A/B | `getIdentityById`         | **1** or **2**                                      |

The **identity-resolution path** is bounded: 1–2 queries. Controllers may layer additional domain queries on top (business logic, permissions, audit) — that's not part of this budget. The `Identity.role`/`entityId` hint is the reason Pattern A stays at 1 query; the FK reverse pointer is the safety net.

### Hint columns: rules of engagement

**Golden rule:** hint columns are a denormalized routing pointer, never used for correctness.

- Source of truth for "which profile belongs to this identity" is always the FK `profile.identityId`. The hint is a denormalized mirror.
- Only `createIdentityWithProfile` and `removeProfile` write to `Identity.role` / `Identity.entityId`.
- Both write inside `prisma.$transaction`.
- Profile soft-delete does NOT touch hint columns (the row still exists).
- Pattern B has a drift-recovery fallback (see §3 Pattern B). Stale hint → slower, still correct.
- Dev integrity check: rows in `Identity` with `role` NOT NULL whose `entityId` is absent in the target profile table → must be 0.
