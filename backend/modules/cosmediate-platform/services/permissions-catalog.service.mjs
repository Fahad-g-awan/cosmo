import {
  getGrantCatalog,
  canRoleGrantPermissions,
  canGrantToTargetRole,
} from "/opt/nodejs/lib/auth/authorization/grant/grant-scope.utils.mjs";
import {
  PERMISSIONS,
  ROLE_RECEIVABLE_GRANTS,
} from "/opt/nodejs/constants/auth/permissions/index.mjs";
import { hasPermission } from "/opt/nodejs/lib/auth/authorization/grant/permissions.utils.mjs";
import { API_ERRORS } from "/opt/nodejs/constants/errors/index.mjs";
import { httpError } from "/opt/nodejs/lib/errors/http-error.mjs";

const hasAuthenticatedContext = (authContext) =>
  Boolean(
    authContext?.identityId || authContext?.cognitoSub || authContext?.sub,
  );

const normalizeTargetRole = (targetRole) => {
  const role = String(targetRole ?? "").trim();
  if (!role || !ROLE_RECEIVABLE_GRANTS[role]) {
    throw httpError({
      error: API_ERRORS.BAD_REQUEST,
      details: [
        "targetRole query param is required",
        `Valid values: ${Object.keys(ROLE_RECEIVABLE_GRANTS).join(", ")}`,
      ],
    });
  }
  return role;
};

export const getPermissionsCatalog = async (
  authContext,
  { targetRole } = {},
) => {
  if (!hasAuthenticatedContext(authContext) || !authContext?.perms) {
    throw httpError({
      error: API_ERRORS.UNAUTHORIZED,
      details: ["Permission denied", "User is not authorized"],
    });
  }

  if (!hasPermission(authContext, [PERMISSIONS.PERMISSIONS.GRANT])) {
    throw httpError({
      error: API_ERRORS.UNAUTHORIZED,
      details: ["Permission denied", "User is not authorized"],
    });
  }

  if (!canRoleGrantPermissions(authContext.role)) {
    throw httpError({
      error: API_ERRORS.FORBIDDEN,
      details: ["This role is not allowed to grant permissions."],
    });
  }

  const resolvedTargetRole = normalizeTargetRole(targetRole);

  if (!canGrantToTargetRole(authContext.role, resolvedTargetRole)) {
    throw httpError({
      error: API_ERRORS.FORBIDDEN,
      details: [
        `Cannot load permission catalog for role ${resolvedTargetRole}.`,
      ],
    });
  }

  const catalog = getGrantCatalog(
    authContext.role,
    authContext.perms?.split?.(" ") ?? [],
    resolvedTargetRole,
  );

  return {
    statusCode: 200,
    data: { success: true, catalog, targetRole: resolvedTargetRole },
  };
};
