import { assertManagerEffectiveClinicAccess } from "/opt/nodejs/services/prisma/org/manager/effective-scope.mjs";
import { resolveClinicOrgIds } from "/opt/nodejs/services/prisma/org/clinic/org.mjs";
import { WORKING_TYPES } from "/opt/nodejs/constants/domain/shared.constants.mjs";
import { USER_ROLES } from "/opt/nodejs/constants/auth/roles.constants.mjs";
import { API_ERRORS } from "/opt/nodejs/constants/errors/index.mjs";
import { httpError } from "/opt/nodejs/lib/errors/http-error.mjs";

import { isManagementRoute } from "./route-scope.mjs";
import { resolveParentClinicId } from "../services/specialist.repository.mjs";

const isClinicManagerActor = (authContext, routeKey) =>
  authContext?.role === USER_ROLES.MANAGER && isManagementRoute(routeKey);

/**
 * Clinic-dashboard create rules: managers may only add full-time specialists
 * linked to a clinic in their effective scope (typically active clinic).
 */
export const assertClinicManagerCanCreateSpecialist = async (
  prisma,
  authContext,
  routeKey,
  { workingType, parentClinicId, activeClinicId },
) => {
  if (!isClinicManagerActor(authContext, routeKey)) return;

  if (workingType !== WORKING_TYPES.FULL_TIME) {
    throw httpError({
      error: API_ERRORS.FORBIDDEN,
      details: ["Clinic managers can only create full-time specialists"],
    });
  }

  const homeClinicId = parentClinicId || activeClinicId;
  if (!homeClinicId) {
    throw httpError({
      error: API_ERRORS.BAD_REQUEST,
      details: ["Full-time specialist requires a home clinic"],
    });
  }

  await assertManagerEffectiveClinicAccess(
    prisma,
    authContext.entityId,
    homeClinicId,
  );
};

/**
 * Clinic-dashboard update rules:
 * - Freelance specialists are view-only for managers.
 * - Full-time home clinic may transfer to another clinic in the same org only.
 */
export const assertClinicManagerCanUpdateSpecialist = async (
  prisma,
  authContext,
  routeKey,
  { specialist, parentClinicId, activeClinicId, clinicIds },
) => {
  if (!isClinicManagerActor(authContext, routeKey)) return;

  if (specialist.workingType === WORKING_TYPES.FREELANCE) {
    throw httpError({
      error: API_ERRORS.FORBIDDEN,
      details: ["Freelance specialists are view-only for clinic managers"],
    });
  }

  if (Array.isArray(clinicIds) && clinicIds.length) {
    throw httpError({
      error: API_ERRORS.FORBIDDEN,
      details: ["Clinic managers cannot modify freelance clinic assignments"],
    });
  }

  const anchorClinicId =
    activeClinicId || resolveParentClinicId(specialist.clinics);
  if (!anchorClinicId) return;

  await assertManagerEffectiveClinicAccess(
    prisma,
    authContext.entityId,
    anchorClinicId,
  );

  if (!parentClinicId) return;

  const currentParentId = resolveParentClinicId(specialist.clinics);
  if (parentClinicId === currentParentId) return;

  const { orgClinicIds } = await resolveClinicOrgIds(prisma, anchorClinicId);
  if (!orgClinicIds.includes(parentClinicId)) {
    throw httpError({
      error: API_ERRORS.FORBIDDEN,
      details: [
        "Full-time specialists can only be transferred to a clinic within your organization",
      ],
    });
  }
};
