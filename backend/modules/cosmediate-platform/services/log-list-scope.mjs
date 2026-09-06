import { resolveManagerEffectiveClinicIds } from "/opt/nodejs/services/prisma/org/manager/effective-scope.mjs";
import { USER_ROLES } from "/opt/nodejs/constants/auth/roles.constants.mjs";
import { API_ERRORS } from "/opt/nodejs/constants/errors/index.mjs";
import { httpError } from "/opt/nodejs/lib/errors/http-error.mjs";

/**
 * @typedef {"global" | "clinic"} LogListScopeMode
 */

/**
 * @returns {Promise<{
 *   mode: LogListScopeMode,
 *   orgWide?: boolean,
 *   rootId?: string | null,
 *   effectiveClinicIds?: string[],
 *   managerActorOnly?: boolean,
 * }>}
 */
export const resolveLogListScope = async (prisma, authContext) => {
  const role = authContext?.role ?? "";

  if (role === USER_ROLES.ADMIN) {
    return { mode: "global" };
  }

  if (role === USER_ROLES.MANAGER) {
    const managerId = authContext?.entityId ?? "";
    if (!managerId) {
      throw httpError({
        error: API_ERRORS.FORBIDDEN,
        details: ["Manager identity is required to list logs"],
      });
    }

    const { effectiveClinicIds, rootId, orgWide } =
      await resolveManagerEffectiveClinicIds(prisma, managerId);

    if (!effectiveClinicIds.length) {
      throw httpError({
        error: API_ERRORS.FORBIDDEN,
        details: ["Manager is not linked to any clinic"],
      });
    }

    return {
      mode: "clinic",
      orgWide,
      rootId,
      effectiveClinicIds,
      managerActorOnly: true,
    };
  }

  throw httpError({
    error: API_ERRORS.FORBIDDEN,
    details: ["Only admins and managers may access platform logs"],
  });
};

/**
 * @param {object} item
 * @param {Awaited<ReturnType<typeof resolveLogListScope>>} scope
 */
export const assertLogItemVisible = (item, scope) => {
  if (!item) {
    throw httpError({
      error: API_ERRORS.NOT_FOUND,
      details: ["Log record not found"],
    });
  }

  if (scope.mode === "global") {
    return;
  }

  const actorRole = String(item.actorRole ?? "").toUpperCase();
  if (actorRole !== USER_ROLES.MANAGER) {
    throw httpError({
      error: API_ERRORS.FORBIDDEN,
      details: ["This log record is not visible in clinic scope"],
    });
  }

  const clinicId = item.clinicId ? String(item.clinicId) : "";
  if (!clinicId) {
    const orgRootId = item.orgRootId ? String(item.orgRootId) : "";
    if (orgRootId && scope.rootId && orgRootId === scope.rootId) {
      return;
    }

    throw httpError({
      error: API_ERRORS.FORBIDDEN,
      details: ["This log record is outside your clinic scope"],
    });
  }

  if (!scope.effectiveClinicIds?.includes(clinicId)) {
    throw httpError({
      error: API_ERRORS.FORBIDDEN,
      details: ["This log record is outside your clinic scope"],
    });
  }
};
