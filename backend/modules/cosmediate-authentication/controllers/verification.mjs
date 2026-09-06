import { getRequestContext } from "/opt/nodejs/lib/context/request-context.mjs";
import { rethrowOrInternal } from "/opt/nodejs/lib/errors/http-error.mjs";

import {
  signupConfirmation as signupConfirmationService,
  resendSignupCode as resendSignupCodeService,
} from "../services/verification.service.mjs";

export const signupConfirmation = async () => {
  try {
    return await signupConfirmationService(getRequestContext());
  } catch (error) {
    console.error("[auth] confirm signup", error);
    rethrowOrInternal(error);
  }
};

export const resendSignupCode = async () => {
  try {
    return await resendSignupCodeService(getRequestContext());
  } catch (error) {
    console.error("[auth] resend signup code", error);
    rethrowOrInternal(error);
  }
};
