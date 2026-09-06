import { getRequestContext } from "/opt/nodejs/lib/context/request-context.mjs";
import { rethrowOrInternal } from "/opt/nodejs/lib/errors/http-error.mjs";

import { getPlatformNavigation } from "../services/navigation.service.mjs";

export const getNavigationHandler = async () => {
  try {
    return await getPlatformNavigation(getRequestContext().authContext);
  } catch (error) {
    console.error("[platform] navigation", error);
    rethrowOrInternal(error);
  }
};
