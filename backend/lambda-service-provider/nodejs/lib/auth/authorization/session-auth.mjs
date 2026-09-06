import { API_ERRORS } from "../../../constants/errors/index.mjs";
import { httpError } from "../../errors/http-error.mjs";

export const sessionIdsFromAuthContext = (authContext) => ({
  cognitoSub: authContext?.cognitoSub ?? authContext?.sub ?? null,
  identityId: authContext?.identityId ?? null,
});

/** Require a valid authenticated session from API Gateway authorizer context. */
export const requireSessionAuthContext = (authContext) => {
  const { cognitoSub, identityId } = sessionIdsFromAuthContext(authContext);

  if (!cognitoSub || !identityId) {
    throw httpError({
      error: API_ERRORS.UNAUTHORIZED,
      details: ["Valid session required."],
    });
  }

  return { cognitoSub, identityId };
};
