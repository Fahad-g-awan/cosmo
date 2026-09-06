import {
  httpError,
  rethrowOrInternal,
  isHttpError,
} from "/opt/nodejs/lib/errors/http-error.mjs";
import {
  assertGrantRequest,
  getGrantCatalog,
} from "/opt/nodejs/lib/auth/authorization/grant/grant-scope.utils.mjs";
import { hasPermission } from "/opt/nodejs/lib/auth/authorization/grant/permissions.utils.mjs";
import { validateApiRequest } from "/opt/nodejs/lib/validation/ajv/api-validator.mjs";
import { PERMISSIONS } from "/opt/nodejs/constants/auth/permissions/index.mjs";
import { getRequestContext } from "/opt/nodejs/lib/context/request-context.mjs";
import { CRUD_ACTIONS } from "/opt/nodejs/constants/api/crud-actions/index.mjs";
import { API_ERRORS } from "/opt/nodejs/constants/errors/index.mjs";

export const postGrants = async () => {
  try {
    const { authContext, reqBody } = getRequestContext();

    if (!authContext?.identityId && !authContext?.cognitoSub) {
      throw httpError({
        error: API_ERRORS.UNAUTHORIZED,
        details: ["Authentication required"],
      });
    }

    if (!hasPermission(authContext, [PERMISSIONS.PERMISSIONS.GRANT])) {
      throw httpError({
        error: API_ERRORS.UNAUTHORIZED,
        details: ["permissions:grant required"],
      });
    }

    const { value } = validateApiRequest(
      CRUD_ACTIONS.LAMBDA_TEST.GRANTS,
      reqBody,
    );

    const granterGrants =
      value.granterGrants ??
      (authContext.perms ? authContext.perms.split(" ").filter(Boolean) : []);

    let assertOk = false;
    let assertError = null;

    try {
      assertGrantRequest({
        granterRole: value.granterRole,
        granterGrants,
        targetRole: value.targetRole,
        targetCurrentGrants: value.targetCurrentGrants ?? [],
        requestedGrants: value.requestedGrants,
      });
      assertOk = true;
    } catch (e) {
      assertOk = false;
      assertError = isHttpError(e)
        ? { error: e.error, details: e.details }
        : { message: e?.message };
    }

    const catalog = getGrantCatalog(
      value.granterRole,
      granterGrants,
      value.targetRole,
    );

    return {
      statusCode: 200,
      data: {
        success: true,
        assertOk,
        assertError,
        delegatableCount: catalog.grants?.length ?? 0,
        superAccess: catalog.superAccess ?? null,
      },
    };
  } catch (error) {
    console.error("Error at postGrants", error);
    rethrowOrInternal(error);
  }
};
