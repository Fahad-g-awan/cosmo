import { assertManagerEffectiveClinicAccess } from "/opt/nodejs/services/prisma/org/manager/effective-scope.mjs";
import { USER_ROLES } from "/opt/nodejs/constants/auth/roles.constants.mjs";
import { API_ERRORS } from "/opt/nodejs/constants/errors/index.mjs";
import { httpError } from "/opt/nodejs/lib/errors/http-error.mjs";

/**
 * Managers may only sync/list offerings at clinics in their effective scope.
 * Admins bypass branch scope.
 */
export const assertClinicTreatmentClinicAccess = async (
  prisma,
  authContext,
  clinicId,
) => {
  if (!clinicId) {
    throw httpError({
      error: API_ERRORS.BAD_REQUEST,
      details: ["clinicId is required"],
    });
  }

  if (authContext?.role === USER_ROLES.ADMIN) return;

  if (authContext?.role === USER_ROLES.MANAGER) {
    await assertManagerEffectiveClinicAccess(
      prisma,
      authContext.entityId,
      clinicId,
    );
    return;
  }

  throw httpError({
    error: API_ERRORS.FORBIDDEN,
    details: ["Not authorized to manage clinic treatments for this clinic"],
  });
};
