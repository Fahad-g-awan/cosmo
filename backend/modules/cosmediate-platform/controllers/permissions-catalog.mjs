import { getRequestContext } from "/opt/nodejs/lib/context/request-context.mjs";
import { rethrowOrInternal } from "/opt/nodejs/lib/errors/http-error.mjs";

import { getPermissionsCatalog } from "../services/permissions-catalog.service.mjs";

export const getPermissionsCatalogHandler = async () => {
  try {
    const { authContext, queryParams } = getRequestContext();
    return await getPermissionsCatalog(authContext, {
      targetRole: queryParams?.targetRole,
    });
  } catch (error) {
    console.error("[platform] permissions catalog", error);
    rethrowOrInternal(error);
  }
};
