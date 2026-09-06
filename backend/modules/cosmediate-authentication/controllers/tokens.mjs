import { getRequestContext } from "/opt/nodejs/lib/context/request-context.mjs";
import { rethrowOrInternal } from "/opt/nodejs/lib/errors/http-error.mjs";

import { refreshTokens as refreshTokensService } from "../services/tokens.service.mjs";

export const refreshTokens = async () => {
  try {
    return await refreshTokensService(getRequestContext());
  } catch (error) {
    console.error("[auth] refresh tokens", error);
    rethrowOrInternal(error);
  }
};
