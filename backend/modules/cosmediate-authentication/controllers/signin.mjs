import { getRequestContext } from "/opt/nodejs/lib/context/request-context.mjs";
import { rethrowOrInternal } from "/opt/nodejs/lib/errors/http-error.mjs";

import { signIn as signInService } from "../services/signin.service.mjs";

export const signIn = async () => {
  try {
    return await signInService(getRequestContext());
  } catch (error) {
    console.error("[auth] sign-in", error);
    rethrowOrInternal(error);
  }
};
