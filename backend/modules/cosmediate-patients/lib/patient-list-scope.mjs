import {
  assertManagerEffectiveClinicAccess,
  resolveManagerEffectiveClinicIds,
} from "/opt/nodejs/services/prisma/org/manager/effective-scope.mjs";
import { resolveClinicOrgIds } from "/opt/nodejs/services/prisma/org/clinic/org.mjs";
import { USER_ROLES } from "/opt/nodejs/constants/auth/roles.constants.mjs";
import { API_ERRORS } from "/opt/nodejs/constants/errors/index.mjs";
import { httpError } from "/opt/nodejs/lib/errors/http-error.mjs";

/** @param {string|null|undefined} v */
export const normId = (v) => {
  if (v == null) return null;
  const t = String(v).trim();
  return t === "" ? null : t;
};

/**
 * Parses patient list filters + caller role into a normalized scope object.
 * Does not authorize or query the DB — see assertPatientListScope for that.
 *
 * Two clinic-related filter keys (managers especially):
 * - scopeClinicId — workspace anchor (active clinic from clinic dashboard). Used for
 *   manager org auth / org-wide listing, not necessarily as a patient narrow filter.
 * - clinicId — browse UI picker. Narrows results (manager: within org; admin: any clinic).
 *
 * Per role:
 * - ADMIN — optional clinicId / specialistId; omit both for global list.
 * - MANAGER — needs scopeClinicId or clinicId for auth; org-wide when only scopeClinicId;
 *   optional clinicId picker narrows to patients linked to that branch.
 * - SPECIALIST — specialistId is always forced to the caller (cannot list another
 *   specialist's patients or a clinic's full roster). Optional clinicId only narrows
 *   "my patients" to those also linked to that clinic (must be a clinic they work at).
 *
 * @returns {{ clinicId: string|null, specialistId: string|null, scopeClinicId: string|null, role: string, entityId: string }}
 */
export function resolvePatientListScope(authContext, filters = {}) {
  const scopeClinicId = normId(filters?.scopeClinicId);
  let clinicId = normId(filters?.clinicId);
  let specialistId = normId(filters?.specialistId);
  const role = authContext?.role ?? "";
  const entityId = authContext?.entityId ?? "";

  if (role === USER_ROLES.SPECIALIST) {
    specialistId = entityId;
  }

  if (role === USER_ROLES.MANAGER && scopeClinicId) {
    if (!clinicId) {
      clinicId = null;
    }
  }

  return { clinicId, specialistId, scopeClinicId, role, entityId };
}

/**
 * Org-scope authorization for POST /patients/list.
 * Non-admin must pass filters.clinicId and/or filters.specialistId (or specialist auto-scope).
 */
export async function assertPatientListScope(db, authContext, filters = {}) {
  const { clinicId, specialistId, scopeClinicId, role, entityId } =
    resolvePatientListScope(authContext, filters);

  const authClinicId =
    role === USER_ROLES.MANAGER ? (scopeClinicId ?? clinicId) : null;

  if (role !== USER_ROLES.ADMIN && !authClinicId && !specialistId) {
    throw httpError({
      error: API_ERRORS.BAD_REQUEST,
      details: [
        "Non-admin callers must supply filters.scopeClinicId, filters.clinicId, or filters.specialistId",
      ],
    });
  }

  const narrowClinicId =
    role === USER_ROLES.SPECIALIST
      ? clinicId
      : scopeClinicId && clinicId
        ? clinicId
        : null;

  await assertPatientOrgScope(
    db,
    { role, entityId },
    { clinicId: authClinicId, specialistId, narrowClinicId },
  );

  let orgRootId = null;
  if (role === USER_ROLES.MANAGER && authClinicId) {
    const { rootId } = await resolveClinicOrgIds(db, authClinicId);
    orgRootId = rootId;
  }

  const filterClinicId = role === USER_ROLES.ADMIN ? clinicId : narrowClinicId;

  return {
    clinicId: filterClinicId,
    specialistId,
    orgRootId,
    scopeClinicId,
  };
}

/**
 * XOR clinicId / specialistId scope rules for staff patient lists.
 * ADMIN may omit both (global list).
 */
export async function assertPatientOrgScope(
  db,
  { role: roleRaw = "", entityId = "" },
  { clinicId, specialistId, narrowClinicId = null },
) {
  const role = roleRaw || "";

  if (role === USER_ROLES.PATIENT) {
    throw httpError({
      error: API_ERRORS.FORBIDDEN,
      details: [
        "Patient list with org scope is not available to patient-facing roles",
      ],
    });
  }

  const hasClinic = !!clinicId;
  const hasSpec = !!specialistId;

  if (!hasClinic && !hasSpec) {
    if (role !== USER_ROLES.ADMIN) {
      throw httpError({
        error: API_ERRORS.BAD_REQUEST,
        details: [
          "Supply filters.scopeClinicId, filters.clinicId (clinic Patients tab), or filters.specialistId (specialist Patients tab)",
        ],
      });
    }
    return;
  }

  if (role === USER_ROLES.SPECIALIST) {
    if (narrowClinicId) {
      const link = await db.clinicSpecialistLink.findFirst({
        where: {
          specialistId: entityId,
          clinicId: narrowClinicId,
          status: "ACTIVE",
          clinic: { deleted: false },
        },
        select: { clinicId: true },
      });
      if (!link) {
        throw httpError({
          error: API_ERRORS.FORBIDDEN,
          details: ["Specialist is not linked to this clinic"],
        });
      }
    }
    return;
  }

  if (hasClinic && hasSpec) {
    throw httpError({
      error: API_ERRORS.BAD_REQUEST,
      details: [
        "Specify only one scope filter — filters.clinicId or filters.specialistId",
      ],
    });
  }

  if (role === USER_ROLES.ADMIN) return;

  if (!entityId) {
    throw httpError({
      error: API_ERRORS.FORBIDDEN,
      details: ["Missing profile scope for authenticated caller"],
    });
  }

  if (role === USER_ROLES.MANAGER && hasClinic) {
    await assertManagerEffectiveClinicAccess(db, entityId, clinicId);
    return;
  }

  if (role === USER_ROLES.MANAGER && hasSpec) {
    const { effectiveClinicIds } = await resolveManagerEffectiveClinicIds(
      db,
      entityId,
    );
    if (!effectiveClinicIds.length) {
      throw httpError({
        error: API_ERRORS.FORBIDDEN,
        details: ["Manager list scope is empty"],
      });
    }

    const ok = await db.clinicSpecialistLink.findFirst({
      where: {
        specialistId,
        clinicId: { in: effectiveClinicIds },
        status: "ACTIVE",
        clinic: { deleted: false },
        specialist: { deleted: false },
      },
      select: { clinicId: true },
    });
    if (!ok) {
      throw httpError({
        error: API_ERRORS.FORBIDDEN,
        details: ["Manager scope does not overlap this specialist"],
      });
    }
    return;
  }

  if (role === USER_ROLES.SPECIALIST && hasSpec) {
    if (specialistId !== entityId) {
      throw httpError({
        error: API_ERRORS.FORBIDDEN,
        details: ["Specialists may only list their own assigned patients"],
      });
    }
    return;
  }

  throw httpError({
    error: API_ERRORS.FORBIDDEN,
    details: [`Role "${role}" cannot access scoped patient lists`],
  });
}

/**
 * Org-scope authorization for single-patient reads/updates/deletes.
 */
export async function assertPatientRecordScope(db, authContext, patientId) {
  const role = authContext?.role ?? "";
  const entityId = authContext?.entityId ?? "";
  const targetId = normId(patientId);

  if (!targetId) {
    throw httpError({
      error: API_ERRORS.BAD_REQUEST,
      details: ["Patient ID is required"],
    });
  }

  if (role === USER_ROLES.ADMIN || targetId === entityId) return;

  if (role === USER_ROLES.PATIENT) {
    throw httpError({
      error: API_ERRORS.FORBIDDEN,
      details: ["Patients may only access their own profile"],
    });
  }

  if (!entityId) {
    throw httpError({
      error: API_ERRORS.FORBIDDEN,
      details: ["Missing profile scope for authenticated caller"],
    });
  }

  if (role === USER_ROLES.SPECIALIST) {
    const link = await db.patientSpecialist.findFirst({
      where: { patientId: targetId, specialistId: entityId },
      select: { id: true },
    });
    if (!link) {
      throw httpError({
        error: API_ERRORS.FORBIDDEN,
        details: ["Specialist scope does not include this patient"],
      });
    }
    return;
  }

  if (role === USER_ROLES.MANAGER) {
    const { effectiveClinicIds } = await resolveManagerEffectiveClinicIds(
      db,
      entityId,
    );
    if (!effectiveClinicIds.length) {
      throw httpError({
        error: API_ERRORS.FORBIDDEN,
        details: ["Manager scope is empty"],
      });
    }

    const clinicLink = await db.patientClinic.findFirst({
      where: {
        patientId: targetId,
        clinicId: { in: effectiveClinicIds },
      },
      select: { clinicId: true },
    });
    if (clinicLink) return;

    const specialistLink = await db.patientSpecialist.findFirst({
      where: {
        patientId: targetId,
        specialist: {
          deleted: false,
          clinics: {
            some: {
              clinicId: { in: effectiveClinicIds },
              status: "ACTIVE",
              clinic: { deleted: false },
            },
          },
        },
      },
      select: { specialistId: true },
    });
    if (specialistLink) return;

    throw httpError({
      error: API_ERRORS.FORBIDDEN,
      details: ["Manager scope does not include this patient"],
    });
  }

  throw httpError({
    error: API_ERRORS.FORBIDDEN,
    details: [`Role "${role}" cannot access this patient record`],
  });
}
