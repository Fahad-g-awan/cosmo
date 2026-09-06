import {
  PLATFORM_NAVIGATION,
  PERMISSIONS,
} from "/opt/nodejs/constants/auth/permissions/index.mjs";
import { hasPermission } from "/opt/nodejs/lib/auth/authorization/grant/permissions.utils.mjs";
import { buildPermissionsRegistryPayload } from "./registry.service.mjs";
import { API_ERRORS } from "/opt/nodejs/constants/errors/index.mjs";
import { httpError } from "/opt/nodejs/lib/errors/http-error.mjs";

const hasAuthenticatedContext = (authContext) =>
  Boolean(
    authContext?.identityId || authContext?.cognitoSub || authContext?.sub,
  );

export const getPlatformNavigation = async (authContext) => {
  if (!hasAuthenticatedContext(authContext) || !authContext?.perms) {
    throw httpError({
      error: API_ERRORS.UNAUTHORIZED,
      details: ["Permission denied", "User is not authorized"],
    });
  }

  if (!authContext?.role) {
    throw httpError({
      error: API_ERRORS.UNAUTHORIZED,
      details: ["Account setup incomplete — profile not linked"],
    });
  }

  if (!hasPermission(authContext, [PERMISSIONS.PLATFORM.NAVIGATION])) {
    throw httpError({
      error: API_ERRORS.UNAUTHORIZED,
      details: ["Permission denied", "User is not authorized"],
    });
  }

  return {
    statusCode: 200,
    data: {
      success: true,
      navigation: PLATFORM_NAVIGATION,
      permissions: buildPermissionsRegistryPayload(),
    },
  };
};
