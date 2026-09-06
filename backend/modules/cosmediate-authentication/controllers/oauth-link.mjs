import { getRequestContext } from "/opt/nodejs/lib/context/request-context.mjs";
import { rethrowOrInternal } from "/opt/nodejs/lib/errors/http-error.mjs";

import {
  oauthLinkStart as oauthLinkStartService,
  linkOAuthCallback as linkOAuthCallbackService,
} from "../services/oauth-link.service.mjs";

export const oauthLinkStart = async () => {
  try {
    return await oauthLinkStartService(getRequestContext());
  } catch (error) {
    console.error("[auth] oauth link start", error);
    rethrowOrInternal(error);
  }
};

export const linkOAuthCallback = async () => {
  try {
    return await linkOAuthCallbackService(getRequestContext());
  } catch (error) {
    console.error("[auth] oauth link callback", error);
    rethrowOrInternal(error);
  }
};
