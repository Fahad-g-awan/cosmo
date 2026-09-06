import { getRequestContext } from "/opt/nodejs/lib/context/request-context.mjs";
import { rethrowOrInternal } from "/opt/nodejs/lib/errors/http-error.mjs";

import { signUp as signUpService } from "../services/signup.service.mjs";

export const signUp = async () => {
  try {
    return await signUpService(getRequestContext());
  } catch (error) {
    console.error("[auth] sign-up", error);
    rethrowOrInternal(error);
  }
};
