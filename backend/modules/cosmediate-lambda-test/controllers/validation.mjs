import { CRUD_ACTIONS } from "/opt/nodejs/constants/api/crud-actions/index.mjs";
import { validateApiRequest } from "/opt/nodejs/lib/validation/ajv/api-validator.mjs";
import { getRequestContext } from "/opt/nodejs/lib/context/request-context.mjs";
import { rethrowOrInternal } from "/opt/nodejs/lib/errors/http-error.mjs";

export const postValidate = async () => {
  try {
    const { reqBody } = getRequestContext();
    const result = validateApiRequest(
      CRUD_ACTIONS.LAMBDA_TEST.VALIDATE,
      reqBody,
    );

    return {
      statusCode: 200,
      data: {
        success: true,
        validated: true,
        crudAction: CRUD_ACTIONS.LAMBDA_TEST.VALIDATE,
        body: result.value,
      },
    };
  } catch (error) {
    console.error("Error at postValidate", error);
    rethrowOrInternal(error);
  }
};
