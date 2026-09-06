import { getRequestContext } from "/opt/nodejs/lib/context/request-context.mjs";
import { rethrowOrInternal } from "/opt/nodejs/lib/errors/http-error.mjs";

import {
  updatePassword as updatePasswordService,
  setNewPassword as setNewPasswordService,
  forgotPassword as forgotPasswordService,
  resetPassword as resetPasswordService,
} from "../services/password.service.mjs";

export const updatePassword = async () => {
  try {
    return await updatePasswordService(getRequestContext());
  } catch (error) {
    console.error("[auth] update password", error);
    rethrowOrInternal(error);
  }
};

export const setNewPassword = async () => {
  try {
    return await setNewPasswordService(getRequestContext());
  } catch (error) {
    console.error("[auth] set new password", error);
    rethrowOrInternal(error);
  }
};

export const forgotPassword = async () => {
  try {
    return await forgotPasswordService(getRequestContext());
  } catch (error) {
    console.error("[auth] forgot password", error);
    rethrowOrInternal(error);
  }
};

export const resetPassword = async () => {
  try {
    return await resetPasswordService(getRequestContext());
  } catch (error) {
    console.error("[auth] reset password", error);
    rethrowOrInternal(error);
  }
};
