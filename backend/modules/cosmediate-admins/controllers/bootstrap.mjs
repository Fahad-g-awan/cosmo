import { getRequestContext } from "/opt/nodejs/lib/context/request-context.mjs";
import { rethrowOrInternal } from "/opt/nodejs/lib/errors/http-error.mjs";

import { bootstrapAdmin } from "../services/bootstrap.service.mjs";

export const bootstrapAdminHandler = async () => {
  try {
    return await bootstrapAdmin(getRequestContext());
  } catch (error) {
    console.error("[admins] bootstrap", error);
    rethrowOrInternal(error);
  }
};
