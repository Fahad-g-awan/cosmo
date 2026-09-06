import { USER_ROLES } from "/opt/nodejs/constants/auth/roles.constants.mjs";

import { resolveManagerEffectiveClinicIds } from "/opt/nodejs/services/prisma/org/manager/effective-scope.mjs";

/**
 * Applies branch-scoped clinic filter for management specialist lists.
 * Managers see specialists linked to their active clinic branch.
 *
 * @param {object} ctx - Request context
 * @param {object} query - Normalized list query body
 * @param {{ isManagementRoute: boolean }} options
 */
export const resolveSpecialistListFilters = async (
  ctx,
  query,
  { isManagementRoute },
) => {
  query.filters = query.filters ?? {};

  if (!isManagementRoute) return query;

  const scopeClinicId = query.filters.scopeClinicId;
  const explicitClinicId =
    query.filters.clinicId ?? query.filters.activeClinicId ?? query.clinicId;

  if (explicitClinicId) {
    query.filters.clinicId = explicitClinicId;
  } else if (scopeClinicId) {
    query.filters.clinicId = scopeClinicId;
  } else if (
    ctx.authContext?.role === USER_ROLES.MANAGER &&
    ctx.authContext?.entityId
  ) {
    const { effectiveClinicIds } = await resolveManagerEffectiveClinicIds(
      ctx.prisma,
      ctx.authContext.entityId,
    );
    if (effectiveClinicIds.length) {
      query.filters.clinicId = effectiveClinicIds[0];
    }
  }

  delete query.filters.scopeClinicId;
  delete query.filters.activeClinicId;

  return query;
};
