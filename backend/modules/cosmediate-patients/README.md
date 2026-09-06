# cosmediate-patients

Patient CRUD and OpenSearch list (with org-scope authorization).

## Routes

| Method | Path | Handler |
|--------|------|---------|
| `GET` | `/patients?id=` | Get one patient |
| `POST` | `/patients/list` | OpenSearch list + org scope asserts |
| `POST` | `/patients` | Create patient (+ Cognito, junction links) |
| `PUT` | `/patients` | Update patient |
| `DELETE` | `/patients?id=` | Soft-delete patient |

## Layout

```
controllers/patient.mjs
services/
  patient.service.mjs
  patient-search.service.mjs
  patient.repository.mjs
  patient-cognito.service.mjs
  patient-compliance.service.mjs
lib/
  routes.mjs
  patient-dto.mjs
  patient-list-scope.mjs   — org scope asserts for POST /patients/list
  auth-actor.mjs
index.mjs
```

## OpenSearch list + org scope

`POST /patients/list` runs `assertPatientListScope`, then queries OpenSearch.

Indexed link arrays (updated on patient create/update/delete index events):

- `patientClinicIds`
- `patientSpecialistIds`

**ADMIN** — omit `clinicId` / `specialistId` to search all patients.  
**MANAGER** — pass `filters.clinicId` (clinic Patients tab).  
**SPECIALIST** — omit `clinicId`; scope is always caller’s `specialistId` (patients with `patientSpecialistIds` containing them — e.g. after booking assignment). Specialists cannot list a whole clinic’s patients.

```json
{
  "filters": {
    "status": "ACTIVE",
    "clinicId": "clinic-uuid",
    "userLocation": { "lat": 51.5074, "lon": -0.1278 },
    "distance": 50
  },
  "search": { "query": "jane" },
  "sort": { "by": "distance", "order": "asc" },
  "pagination": { "limit": 20, "nextToken": "..." }
}
```

Pagination uses **limit + 1**. Geo filter targets indexed `location` (geo_point).

## Layer

- Routes: `config/routes/patients.routes.mjs`
- Validation: `validation/api/schemas/patient.mjs`
- Search helpers: `lib/search/list-query.mjs`
