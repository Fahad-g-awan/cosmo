import {
  httpError,
  rethrowOrInternal,
} from "/opt/nodejs/lib/errors/http-error.mjs";
import { hasPermission } from "/opt/nodejs/lib/auth/authorization/grant/permissions.utils.mjs";
import { getRequestContext } from "/opt/nodejs/lib/context/request-context.mjs";
import { PERMISSIONS } from "/opt/nodejs/constants/auth/permissions/index.mjs";
import { API_ERRORS } from "/opt/nodejs/constants/errors/index.mjs";

export const postUpload = async () => {
  try {
    const { authContext, reqBody } = getRequestContext();

    if (!authContext?.identityId && !authContext?.cognitoSub) {
      throw httpError({
        error: API_ERRORS.UNAUTHORIZED,
        details: ["Authentication required"],
      });
    }

    if (!hasPermission(authContext, [PERMISSIONS.IMAGE.UPLOAD])) {
      throw httpError({
        error: API_ERRORS.UNAUTHORIZED,
        details: ["image:upload permission required"],
      });
    }

    return {
      statusCode: 200,
      data: {
        success: true,
        upload: reqBody ?? null,
      },
    };
  } catch (error) {
    console.error("Error at postUpload", error);
    rethrowOrInternal(error);
  }
};
