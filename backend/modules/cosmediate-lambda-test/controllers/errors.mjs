import {
  httpError,
  rethrowOrInternal,
} from "/opt/nodejs/lib/errors/http-error.mjs";
import { getRequestContext } from "/opt/nodejs/lib/context/request-context.mjs";
import { API_ERRORS } from "/opt/nodejs/constants/errors/index.mjs";

/**
 * Intentionally throws httpError when body.intentionalError is true (smoke test for respondError).
 */
export const postErrors = async () => {
  try {
    const { reqBody } = getRequestContext();

    if (reqBody?.intentionalError) {
      throw httpError({
        error: API_ERRORS.BAD_REQUEST,
        details: ["Intentional test error"],
      });
    }

    return {
      statusCode: 200,
      data: {
        success: true,
        message:
          "No error triggered; send { intentionalError: true } to test respondError",
      },
    };
  } catch (error) {
    console.error("Error at postErrors", error);
    rethrowOrInternal(error);
  }
};
