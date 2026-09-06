import { getRequestContext } from "/opt/nodejs/lib/context/request-context.mjs";
import { rethrowOrInternal } from "/opt/nodejs/lib/errors/http-error.mjs";

import {
  getAuthMe as getAuthMeService,
  getAuthMeMethods as getAuthMeMethodsService,
} from "../services/me.service.mjs";

export const getAuthMe = async () => {
  try {
    return await getAuthMeService(getRequestContext());
  } catch (error) {
    console.error("[auth] me", error);
    rethrowOrInternal(error);
  }
};

export const getAuthMeMethods = async () => {
  try {
    return await getAuthMeMethodsService(getRequestContext());
  } catch (error) {
    console.error("[auth] me methods", error);
    rethrowOrInternal(error);
  }
};
