# Domain relations — roadmap (locked, MVP → appointments)



**Status:** **LOCKED** — **Sprints S1, S6, S5, S2, S3, S4 complete** — **§11** (junction schema, specialist links, manager scope, Postgres patient roster, **`ENTITY_TYPE.PATIENT`** emits + **`users-{env}`** OpenSearch with junction facets).



**Companion:** `docs/identity-upgrade.md` (auth; already shipped).



**Keep in sync:** When product/code diverges from §1–§8 or you finish tasks, update **§4**, **§8**, **§10.1**, and **§11** in the **same PR**.



Historical plans `domain-relations-upgrade.md`, `patient-relations-plan.md`, and `specialist-clinic-relation-cleanup.md` were removed; substantive intent is consolidated here.



---



## 1. Product rules — relations & visibility



### 1.1 Clinic manager ↔ clinics (same org)



- One manager may have **many** `ClinicManagerLink` rows within **one** organisation tree (`Clinic.parentClinicId` chain).

- **Implemented:** links + Phase 6.5 org invariants (`cosmediate-clinics`).



### 1.2 Specialist ↔ clinics



| Mode | Meaning |

|------|--------|

| **Full-time** | One primary clinic — after **§8 Sprint S6** this is **`ClinicSpecialistLink`** (primary/full-time row), **not** `Specialist.parentClinicId`. |

| **Freelance** | Multiple clinics via **`ClinicSpecialistLink`** only. |



Sprint **S6** in **§8** performs the **`parentClinicId` removal** migration.



### 1.3 Patient ↔ none at signup / admin create



- **Self-signup** or platform **admin creates patient:** `Identity` + `Patient` only — no clinic/specialist junction rows yet.



### 1.4 Patient ↔ clinic / specialist — dashboard create (before appointments)



Each `PatientClinic` / `PatientSpecialist` row is explicit about **which** `clinicId` / `specialistId`. Junction rows carry **`PatientRelationSource`** (see §11).



| Creator | Writes |

|---------|--------|

| **Manager (clinic)** | `PatientClinic` for **that** clinic ID only — no specialist link until appointment/other action. |

| **Full-time specialist** | `PatientSpecialist` + `PatientClinic` for **primary clinic** = **`clinicId`** on the specialist’s **primary** **`ClinicSpecialistLink`** row (after **S6** there is no `parentClinicId`). |

| **Freelance specialist** | `PatientSpecialist` **only** — no `PatientClinic` until the patient books (or staff books) at a clinic. |



### 1.5 Patient clinic listing — parent vs branch (strict)



Each **Patients** tab is scoped to **one** `Clinic.id`. There is **no** automatic roll-up across the hierarchy.



| `PatientClinic.clinicId` points to… | Patient appears on… |

|-------------------------------------|------------------------|

| **Parent clinic** (`CLINIC_TYPE.PARENT`) | **Parent’s** Patients tab **only** — **not** on branch tabs. |

| **A branch** (`CLINIC_TYPE.NODE`) | **That branch’s** tab **only** — **not** on parent’s tab, **not** on sibling branches. |



New visibility at another location **only** when a **future appointment** (or explicit product flow) creates a **`PatientClinic` row for that clinic’s id**.



### 1.6 Many clinics / specialists over time



- Multiple **`PatientClinic`** and **`PatientSpecialist`** rows are allowed over time (bookings create additional rows).

- Tabs always filter by **explicit** FK — see §1.5.



### 1.7 Booking (future)



- Treatment / clinic / specialist / time combinations and partial selection (clinic assigns specialist later) deferred to appointment module — design junction upserts around **appointment completion / confirmation** policy when built.



---



## 2. Manager scope vs permissions (**implement with auth**, not junction schema)



Relations stay `ClinicManagerLink` rows. **Effective access** when resolving “which clinics does this manager act for?” follows:



| **`ClinicManagerLink` coverage** | **Effective scope** |

|-----------------------------------|---------------------|

| Includes the **parent** clinic of the org (main manager / granted parent access) | May treat scope as **parent + all descendant branches** in that hierarchy — **“org-wide manager”**. |

| **Only** specific branch clinic IDs (**no** link to parent) | **Exactly** those ids — **not** sibling branches, **not** parent. |



Implement this in **`registry.mjs` helpers / middleware / controllers** when listing tenants, approving actions, or scoping queries — pair with **`ClinicManagerLink`** reads and `resolveClinicOrgIds`-style traversal. Relations work does **not** add extra clone rows; permission layer expands breadth when parent is linked.



---



## 3. Locked decisions



- **Org & managers:** no `ClinicManager.parentClinicId`; Org + links as today plus §2 when permissions are implemented.

- **Patient identity:** `Patient` + `Identity`; junction tables for clinic/specialist association.

- **Freelance specialist creates patient:** specialist link yes; clinic link **only** via booking/event — agreed.

- **Freelance later gains clinic (`ClinicSpecialistLink`): no backfill** of `PatientClinic` for legacy patients unless product explicitly asks later.

- **Hierarchy visibility for patients:** §1.5 — explicit clinic id only, no inheritance between parent and branches without a matching row.



**Open:** approval flows for dashboard-created patients (product, not schema).



---



## 4. Current implementation



| Piece | Status |

|-------|--------|

| Identity, `Patient`, managers, specialists, clinic tree | Shipped |

| `ClinicManagerLink` + org-scoped picker / grants | Shipped |

| Specialist ↔ clinics (**`ClinicSpecialistLink` only** · `associationType` / `isPrimary` / `status`) | ✅ Shipped (**§11** · `20260512221248_unify_specialist_clinic_links`) · search **`parentClinicId`** = primary **`FULL_TIME`** link (**compat**) |

| `PatientClinic` / `PatientSpecialist` schema + FKs + **`PatientRelationSource`** | ✅ Shipped (**§11** · `20260512215719_*`) · **dashboard create writes:** ✅ **§11 · S2** |

| **`Appointment`** | **Not yet** |

| Create-patient branching for MANAGER/SPECIALIST | ✅ **S2** — **`patientDashboardCreate.mjs`** + optional **`clinicId`** for MANAGER |

| Manager **§2** effective clinic scope (**parent-linked → org-wide; branch-only → exact links**) | ✅ Shipped (**§11**) — **`resolveManagerEffectiveClinicIds`** + **`assertManagerEffectiveClinicAccess`**; **`getManagers`**, grant/revoke already wired |

| Postgres **Patients** roster list (**§1.5** XOR **`clinicId` \| `specialistId`**) | ✅ **S3** — **`POST:/users/patients/list`** · **`patientRosterPrisma.mjs`** · **`listPatientsForRoster`** (**ADMIN** may omit filters for paginated **all**) |

| Patient profile **OpenSearch** (`users-{env}`) + **`ENTITY_TYPE.PATIENT`** emits | ✅ **S4** — **`upsertUsers`** loads **`patientClinicIds`** / **`patientSpecialistIds`**; **`cosmediate-users`** + **`cosmediate-authentication`** emit PATIENT (**`entityId`** = **`Patient.id`**) |



---



## 5. MVP sequence (relations) — **see §8 for execution**



Summary labels (mapped to sprints):



- **R1** — Sprint **S1**: Prisma junction models + migrate — ✅ **DONE** (**§11**).  

- **R2** — Sprint **S2**: Patient create junction writes (**§11**) — ✅ **DONE**.  
- **R3** — Sprint **S3**: List patients APIs (exact `clinicId` / `specialistId` scope §1.5) — ✅ **DONE**.  

- **R4** — Sprint **S4**: emits + OpenSearch patient docs (**junction facet arrays**) — ✅ **DONE**.



**Detailed tasks and acceptance gates: §8 Execution plan.**



---



## 6. Specialist–clinic schema cleanup (**Sprint S6**)



Put association metadata on **`ClinicSpecialistLink`**; migrate full‑time specialists from **`parentClinicId`** into link rows; drop **`Specialist.parentClinicId`**; collapse all reads/writes to one path (`specialist.mjs`, treatments, clinics ops, OpenSearch specialists).



**Default schedule:** runs **after S1**, **before S2** patient-create (see **§8**).



---



## 7. Module touchpoints (implementation reference)



`prisma/schema.prisma` · validation schemas · `cosmediate-users/controllers/user.mjs` · list services/ops · `registry.mjs` (entity types / perms) · optional `cosmediate-clinics` / `cosmediate-specialists` list routes · stream + OS indexers · `resolveClinicOrgIds` / manager link checks (reuse clinics utils).



---



## 8. Execution plan — phases, sprints, order



**Sprint length:** team-defined (often **~1–2 weeks** each). Below = **mergeable milestones** with acceptance gates.



### 8.0 Locked execution order (specialist‑first patient path)



**Core sequence:** **S1 → S6 → S2 → S3** — patient junction schema, **then** specialist on **links only**, **then** patient create/lists (full‑time **`PatientClinic`** uses **primary link `clinicId`**, implemented once). **`S4`** (optional): OpenSearch/EventBridge roster indexing after **S3**.



**S5 insertion:** **`S5`** (manager effective clinic scope **§2**) MUST land **before** **`S3`** ships for managers. Recommended full chain:



**`S1 → S6 → S5 → S2 → S3 → [S4 optional]`**



`S5` may run in parallel with **S2** if resourcing prefers, but **not** after **S3**.



```text

S1 junction schema ─► S6 specialist links only ─► S5 manager scope ─► S2 patient create ─► S3 patient lists ─► S4 OS/stream (optional)

```



**Obsolete:** the old **`S1 → S2 → S3 … → S6`** tail was for shipping patient features before specialist migration; **not** the locked plan.



---



### Sprint **S1** — Patient junction schema (maps to **R1**) — ✅ **COMPLETE**



| | |

|--|--|

| **Goal** | Persist `Patient↔Clinic` and `Patient↔Specialist`. |

| **Work** | `PatientClinic`, `PatientSpecialist`; **`PatientRelationSource`** enum (`CLINIC_CREATE`, `SPECIALIST_FULLTIME_CREATE`, `SPECIALIST_FREELANCE_CREATE`, `APPOINTMENT`). Composite uniqueness via `@@unique` pairs; indexes; relations on **`Patient`**, **`Clinic`**, **`Specialist`**. **`Patient.creationSource`** (`PatientCreationSource`) set at profile provision — see [clinic-specialist-rules.md](./clinic-specialist-rules.md). |

| **Deliverables** | Migration `20260512215719_patient_relation_junctions` · **`npx prisma generate`** → `lambdaLayerPackages/prisma/nodejs/node_modules/.prisma/client`. |

| **Acceptance** | ✅ `prisma validate` passes; junction models placed **below** Specialist block in **`schema.prisma`** (Prisma file declaration order vs forward refs — see §11). |



---



### Sprint **S6** — Specialist clinics on **links only** (maps to **§6**) — ✅ **COMPLETE**



Ran **after S1** (before **`S2`**) — see **§11**.



| | |

|--|--|

| **Goal** | Drop **`Specialist.parentClinicId`**; all placements on **`ClinicSpecialistLink`** + metadata (**`associationType`**, **`isPrimary`**, **`status`**, **`updatedAt`**). |

| **Deliverables** | Migration `20260512221248_unify_specialist_clinic_links` · **`specialist.mjs`** FT/FL link writes · **`getSpecialistByIdPrisma`** (`primaryClinicId`, **`parentClinic`**) · **`treatmentSelection`** (ACTIVE **`clinics.some`**) · OpenSearch **`upsertSpecialist`** + clinic aggregate recounts (**`ACTIVE`** links) |

| **Acceptance** | ✅ No **`Specialist.parentClinicId`** · FT yields **ACTIVE** **`FULL_TIME`** + **`isPrimary`** row · freelancers use **`FREELANCE`** link rows (**unchanged UX**, explicit metadata) · OpenSearch **`parentClinicId`** kept for **`term`** filters (**derived**) |



---



### Sprint **S5** — Manager effective scope (**§2**) — ✅ **COMPLETE**



Ran **after S6**, **before S3** (may parallel **S2**).



| | |

|--|--|

| **Goal** | Single resolver: **`managerId` → effective clinic id list**. |

| **Deliverables** | **`modules/cosmediate-clinics/lib/utils/manager.mjs`**: **`resolveManagerEffectiveClinicIds`**, **`assertManagerEffectiveClinicAccess`** (`403` helper for future **S3**). **`manager.mjs`**: MANAGER **`getManagers`** picker scope + **`assertCallerCanManageClinic`** grant/revoke use effective scope (**org-wide parent link** ⇒ all branches **without** redundant link rows). |

| **Acceptance** | ✅ Parent-linked manager → scope = full **`resolveClinicOrgIds`** cluster. ✅ Branch-only → scope = **`Set`** of **`ClinicManagerLink.clinicId`** only. |



---



### Sprint **S2** — Patient create + junction writes (maps to **R2**) — ✅ **COMPLETE**



| | |

|--|--|

| **Goal** | After patient profile exists (same Postgres txn), create correct **`PatientClinic`** / **`PatientSpecialist`** rows per **§1.4**. |

| **Deliverables** | **`applyPatientCreateJunctionWritesInTx`** (`patient-create-junction.mjs`) wired from **`createIdentityWithProfile`** options (`afterProfileWithinTx`) · MANAGER ⇒ **`PatientClinic`** **`CLINIC_CREATE`** + **`assertManagerEffectiveClinicAccess`** · SPECIALIST ⇒ **`PatientSpecialist`** + **`PatientClinic`** (**full-time**) from primary **`FULL_TIME`** link · ADMIN / PATIENT / legacy **`USER`** ⇒ no junctions & reject stray **`clinicId`** |

| **Acceptance** | Role matrix aligns with **§1.4**; cross-org **`clinicId`** rejected via §5 helpers. |



---



### Sprint **S3** — ✅ **COMPLETE** (**`R3`** patient lists)



| | |

|--|--|

| **HTTP** | **`POST:/users/patients/list`** — body **`UserPatientsList`**: optional **`clinicId`** \| **`specialistId`** (**XOR**; **ADMIN** may omit both for paginated **all** **`Patient`** rows); **`skip`**, **`take`** (≤ 100), **`sortDir`** **`asc`|`desc`** · authorizer **`["user:get", "profile:get"]`** |

| **Layer** | **`modules/cosmediate-users/lib/patientRosterPrisma.mjs`** — **`assertPatientRosterAccess`**, **`listPatientsByRosterScope`**, **`parsePatientsListBody`** · **`listPatientsForRoster`** in **`controllers/user.mjs`** · **`CRUD_ACTIONS.USER.LIST_PATIENTS_ROSTER`** + validation registry |

| **Authz** | **MANAGER** **`clinicId`** → **`assertManagerEffectiveClinicAccess`** · **MANAGER** **`specialistId`** → overlap **`resolveManagerEffectiveClinicIds`** + **`ClinicSpecialistLink`** **ACTIVE** · **SPECIALIST** **`clinicId`** tab → **ACTIVE** link to clinic; else **`specialistId`** coerced to **`entityId`** · **ADMIN** unrestricted (omit both = all) |

| **Query** | **`patientClinics.some({ clinicId })`** \| **`patientSpecialists.some({ specialistId })`** · **`deleted: false`** on **`Patient`** only (junction purge policy §10.7 TBD) |

| **Acceptance** | §1.5 strict — branch tab lists only rows keyed to **that** clinic id |



---



### Sprint **S4** — ✅ **COMPLETE** (**`R4`** OpenSearch + emits)



| | |

|--|--|

| **Emits** | **`ENTITY_TYPE.PATIENT`** on **`Patient.id`** — **`modules/cosmediate-users/controllers/user.mjs`** (create / update profile / soft-delete) · **`cosmediate-authentication/lib/utils.mjs`** (**`createUserInDB`**, **`ENTITY_TYPE_FOR_ROLE.PATIENT`**, **`updateIdentityFields`**) · legacy **`ENTITY_TYPE.USER`** unchanged for Dynamo-era streams (**same index**) |

| **Indexer** | **`cosmediate-opensearch-indexing`**: **`ENTITY_TO_BASE.PATIENT` → `users`** · **`opsHandler`** **`PATIENT` → `usersOpsIndexer`** · **`transformToOpsDocument`** **`USER` \| `PATIENT` → `getUserData`** |

| **Facet fields** | **`patientClinicIds`**, **`patientSpecialistIds`** (keyword-style arrays on **`users-{env}`** docs for §1.5-aligned filters alongside text search) |

| **Streams** | **`cosmediate-db-stream-handler`**: **`ENTITY_TO_BASE.PATIENT`**, **`transformToSearchDocument`** **`PATIENT`** branch (parity with **`USER`**) |

| **Infra** | If EventBridge rules filter **`detail.entityType`**, whitelist **`ENTITY_TYPE#PATIENT`** (still indexes to **`users-{env}`**) |



---



---



### Parallel hygiene (between sprints)



| Track | Content |

|-------|---------|

| **H1** | §10.2 dead code (`getUserBySub` blocks, rename identity helpers). |

| **H2** | §10.4 validation sweep after touching patient payloads. |



---



### Program definition of done (MVP lane)



- [x] **S1** — patient junction schema + migration client (**§11**)

- [x] **S6** — specialist links-only (**§11** · `20260512221248_unify_specialist_clinic_links`)

- [x] **S5** — manager effective scope (**§11** · `resolveManagerEffectiveClinicIds`)

- [x] **S2** — patient create + junction **`$transaction`** hook (**§11** · `patientDashboardCreate.mjs`)

- [x] **S3** — Postgres roster **`POST:/users/patients/list`** + **`patientRosterPrisma.mjs`** (**§1.5** scope)

- [ ] QA: §1.4 / §1.5 dashboards end-to-end in staging (post‑S3)  

- [x] **`S6` before `S2`** — specialist links-only shipped (**§11**); **`S2`** must read primary **`clinicId`** **only** from **`ClinicSpecialistLink`**  

- [x] **S4** — **`ENTITY_TYPE.PATIENT`** EventBridge emits + **`users-{env}`** doc facets (**`patientClinicIds`**, **`patientSpecialistIds`**)




---



## 9. Summary





Locked rules: junction-based patient associations (**§1.4 create paths ✅**, **§1.5** roster **✅ `S3`**), **`S4`** OpenSearch patient docs + **`ENTITY_TYPE.PATIENT`** emits (**`entityId`** = **`Patient.id`**), strict per-clinic tab visibility, specialist on **`ClinicSpecialistLink`** (**S6**), manager **`resolveManagerEffectiveClinicIds`** (**S5**). **Patient dashboard create junctions ✅** (**S2**). **Execution order locked:** **`S1 → S6 → S5 → S2 → S3 → [S4]`**. Next focus **staging QA** (§1.4 / §1.5) and **appointment** junction flows (future emits on junction-only deltas).



---



## 10. Consolidated backlog (post–identity-upgrade)



Everything below is the **single** post-upgrade backlog (hygiene, reviews, infra notes, and domain work). Tick items in PRs; trim when done.



### 10.1 Domain relations (tracked in §8 Execution plan)



- **Locked order:** **S1 ✅** → **S6 ✅** → **S5 ✅** → **S2 ✅** → **S3 ✅** → **S4 ✅**

- **S1:** ✅ patient junction schema · **S6:** ✅ specialist links-only · **S5:** ✅ manager §2 scope · **S2:** ✅ **`patientDashboardCreate` + `afterProfileWithinTx`** · **S3:** ✅ **`POST:/users/patients/list`** roster · **S4:** ✅ **`ENTITY_TYPE.PATIENT`** emits + **`users-{env}`** junction facets (`patientClinicIds`, `patientSpecialistIds`)




### 10.2 Code hygiene (single tidy-up PR is fine)



- Strip **commented `getUserBySub`** blocks across controllers (users, specialists, admins, clinics, treatments, leads, reviews, etc.).

- Remove **`getUserBySub` from imports** if any path still references it from `db.mjs`.

- **`lambdaLayer/.../auth.mjs`:** delete if empty after `getUserBySub` removal; else keep only what is used.

- **`createUser`-style legacy helper** in `cosmediate-authentication/lib/utils.mjs` — remove if fully replaced by identity service; grep for callers.

- **`updateUser_DefaultPasswordUsed_Status` / `updateUser_PasswordSet_Status`** — rename to `updateIdentity*` or inline; callers already hit `Identity` in practice.



### 10.3 Schema / folder cosmetics (optional standalone PRs)



- Rename **`ROLE`** → `PROFILE_TYPE` (or keep — cosmetic).

- Rename **`cosmediate-users/`** → **`cosmediate-patients/`** (folder + imports; routes unchanged).

- Rename **`USER_STATUS`** → **`IDENTITY_STATUS`** (cosmetic).



### 10.4 Validation schemas



- Audit **`lambdaLayer/nodejs/lib/validation/schemas/`**: profile-create payloads should match **Identity** vs profile fields post-upgrade.



### 10.5 Reviews



- Add **`authorIdentityId`** on `Review` / `ReviewReply`; migrate read paths; eventually drop polymorphic `authorId` + `authorRole` string.

- Revisit **`replies.mjs`** hardcoded `"CLINIC"` logic when reviews carry identity.



### 10.6 Identity & manager model (only when product requires)



- **`IdentityRole` table** — do **not** build until multi-role-per-human is a real requirement (see `identity-upgrade.md` Appendix A).

- **`ClinicManagerLink` RBAC v2** — single future PR: `perms[]` per link, `grantedBy*`, `expiresAt`, `revokedAt`, index if needed.



### 10.7 Platform docs & data policy



- **`docs/soft-delete-semantics.md`** — policy for Identity vs profile, links on soft-delete, restore, GDPR hard-delete.

- **OpenSearch:** audit whether **`linkedProviders` / password flags** stay in search docs; consider removing (auth state ≠ search).

- **Optional:** dedicated **`IDENTITY` index** for cross-role email search — only if product asks.

- **HubSpot:** ensure portal custom property **`cosmediate_identity_id`** exists where sync runs.



### 10.8 Performance / authorizer (optional)



- **Pre-auth token-gen** already adds claims; optional: **skip authorizer DB lookup** when JWT carries stable `identityId` (measure first).

- **Manager org root:** cache via **denormalized field on link** or **JWT claim** if list throughput requires it (`resolveManagerOrgRootId` today is one query per call).



### 10.9 Phase 6.5 / manager product notes



- **`revokeManagerAccess`:** fine as-is; any future “move manager to another org” tool **must** use org validation helpers, not raw link CRUD.

- **Clinic detail managers list** (Postgres) vs **org-scoped picker** (OpenSearch) — keep both sources; do not merge blindly.

- **Floating manager** (no links after revoke) — acceptable until product complains.

- **Manager creates manager:** align **invite vs default password**, **Cognito cost**, **perm inheritance** — product/UX.



### 10.10 Registry / emits (small rename if not done)



- ✅ **`ENTITY_TYPE.PATIENT`** at patient-profile emit sites (**S4**) — **`entityId`** remains **`Patient.id`**; **`users-{env}`** index unchanged. Further flows that **only** mutate **`PatientClinic` / `PatientSpecialist`** should emit **`PATIENT` `UPDATE`** to refresh facet arrays.



### 10.11 Obsolete notes (no action)



- `Clinic.role` removed in Phase 1; `LEAD_TYPE.CLINIC` unchanged; **`Specialist.workingType` default** — cosmetic only.



---



## 11. Implementation log (living — sync with commits)



Maintain this whenever **§8** milestones merge or tooling changes.



**Cross-module note:** **`clinicOrg.mjs`** (**`resolveClinicOrgIds`**) and **`managerEffectiveScope.mjs`** (§5 **`resolveManagerEffectiveClinicIds`**) live under **`lambdaLayer/nodejs/services/prisma/`** (`/opt`). **`modules/cosmediate-clinics/lib/utils`** imports and re-exports them so older relative imports keep working.



### Sprint **S1** — ✅ **COMPLETE** (schema only)



| Item | Details |

|------|---------|

| **Models / enum** | `PatientClinic`, `PatientSpecialist`, **`PatientRelationSource`** in **`prisma/schema.prisma`** (after Specialist JOIN section — **required** declaration order). |

| **Migration SQL** | `prisma/migrations/20260512215719_patient_relation_junctions/migration.sql` |

| **Client** | `npx prisma generate` → **`lambdaLayerPackages/prisma/nodejs/node_modules/.prisma/client`** |

| **FK cascade** | `ON DELETE CASCADE` on all four FKs — hard-delete of `Patient`, `Clinic`, or `Specialist` removes dependent junction rows (**soft-delete** policy for profiles vs links still TBD in §10.7). |



**Doc sync decision:** Early drafts said “`PatientLinkSource`”; **`PatientRelationSource`** is what shipped (one enum reused by **both** junctions). §1.4 references it.



### Sprint **S6** — ✅ **COMPLETE** (migration + app paths)



| Item | Details |

|------|---------|

| **Models / enums** | **`SPECIALIST_CLINIC_ASSOCIATION`**, **`SPECIALIST_CLINIC_LINK_STATUS`** on **`ClinicSpecialistLink`**. **`Specialist.parentClinicId`** and **`Clinic.fullTimeSpecialists`** removed (**not** **`Clinic.parentClinicId`** hierarchy). |

| **Migration SQL** | **`20260512221248_unify_specialist_clinic_links`** — backfill **`FULL_TIME`** / **`isPrimary`** from **`Specialist.parentClinicId`**, **`ON CONFLICT`** refresh |

| **Runtime** | `specialist.mjs`, `utils.mjs` (**`primaryClinicId`**), **`treatmentSelection`**, OPS **`upsertSpecialist`** + **`onSpecialistUpsert_UpdateClinicAggregates`** (**`ACTIVE`** clinic links only for recounts). |

| **OpenSearch compat** | Index **`parentClinicId`** = primary **`FULL_TIME`** **`clinicId`** (existing **`term`** filters unchanged). |

| **Doc sync** | **`associationType`** shipped (not “`type`” shorthand in older §8 wording). |

| **Client** | `npx prisma generate` → **`lambdaLayerPackages/prisma/nodejs/node_modules/.prisma/client`** |



### Sprint **S5** — ✅ **COMPLETE** (**§2** manager scope)



| Item | Details |

|------|---------|

| **Helpers** | **`resolveManagerEffectiveClinicIds`** (any **`ClinicManagerLink`** to **`PARENT`** → full **`resolveClinicOrgIds`** cluster; **`NODE`**-only links → exact **`clinicId` union**) · **`assertManagerEffectiveClinicAccess`** (**`403`**) for **`S3`**. |

| **Controllers** | **`modules/cosmediate-clinics/controllers/manager.mjs`**: MANAGER **`getManagers`** picker scope · **`assertCallerCanManageClinic`** (grant/revoke aligns with §2 — org-wide PARENT manager may operate on branch clinics). |

| **Tests** | None in-repo (**`package.json`**); §8 QA. |



### Sprint **S2** — ✅ **COMPLETE** (**`R2`** patient junction writes)



| Item | Details |

|------|---------|

| **Txn** | **`afterProfileWithinTx`** on **`createIdentityWithProfile`** — Patient + **`PatientClinic` / `PatientSpecialist`** same **`$transaction`**. |

| **Layer** | **`patientDashboardCreate.mjs`** (**`applyPatientDashboardJunctionWritesInTx`**) · **`schemas/user.mjs`** adds optional **`clinicId`**. **`user.mjs`** passes **`authContext.role`**, **`entityId`**, **`clinicId`**. |




### Sprint **S3** — ✅ **COMPLETE** (**`R3`** patient lists)



| Item | Details |

|------|---------|

| **HTTP** | **`POST:/users/patients/list`** (**`ROUTES`** in **`modules/cosmediate-users/lib/routes.mjs`**) |

| **Roster** | **`patientRosterPrisma.mjs`**: **`assertPatientRosterAccess`**, **`listPatientsByRosterScope`**, **`parsePatientsListBody`** |

| **Auth / validation** | **`auth/registry.mjs`** route perms **`user:get`** \| **`profile:get`** · **`api/registry.mjs`** **`LIST_PATIENTS_ROSTER`** · **`schemas/user.mjs`** **`UserPatientsList`** |

| **Tests** | None in-repo; §8 QA. |




### Sprint **S4** — ✅ **COMPLETE** (**`R4`** OpenSearch + emits)



| Item | Details |

|------|---------|

| **Emits** | **`ENTITY_TYPE.PATIENT`** + **`Patient.id`** as **`entityId`** — **`cosmediate-users`** + **`cosmediate-authentication`** (see §8 Sprint **S4**). |

| **Indexer** | **`services/users.mjs`** **`upsertUsers`**: facet arrays **`patientClinicIds`**, **`patientSpecialistIds`**. **`mappings.mjs`** **`getUserData`**. |

| **Regression** | Legacy **`ENTITY_TYPE#USER`** still maps to **`users`** alias. |




### Ops note



Run **`npm run migrate:deploy`** (or **`migrate:dev`**) **per environment** so migrations **`20260512215719_*`** and **`20260512221248_*`** apply wherever this branch deploys.



### Next milestone



**Appointments module** — junction upserts on booking should **`emitEvent(..., PATIENT, { entityId: patientId })`** (`UPDATE`) so OpenSearch facet arrays stay in sync when **`Patient`** row is unchanged.



**Infra checklist:** EventBridge rules that constrain **`detail.entityType`** must allow **`ENTITY_TYPE#PATIENT`** (targets **`cosmediate-opensearch-indexing`**).




