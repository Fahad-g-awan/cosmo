import { rethrowOrInternal } from "/opt/nodejs/lib/errors/http-error.mjs";

import { getRegistry } from "../services/registry.service.mjs";

export const getRegistryHandler = async () => {
  try {
    return await getRegistry();
  } catch (error) {
    console.error("[platform] registry", error);
    rethrowOrInternal(error);
  }
};
