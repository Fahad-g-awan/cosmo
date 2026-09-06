import { getRequestContext } from "/opt/nodejs/lib/context/request-context.mjs";
import { rethrowOrInternal } from "/opt/nodejs/lib/errors/http-error.mjs";

import { handleLogout as logoutService } from "../services/logout.service.mjs";

export const handleLogout = async () => {
  try {
    return await logoutService(getRequestContext());
  } catch (error) {
    console.error("[auth] logout", error);
    rethrowOrInternal(error);
  }
};
