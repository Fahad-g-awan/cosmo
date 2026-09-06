import type { NextRequest } from "next/server";

import {
  storeOAuthContext,
  updateOAuthContext,
  type SessionData,
} from "@auth/lib/oauth-context-store";

export async function buildSpOAuthHandoffUrl(
  request: NextRequest,
  session: SessionData,
  opts: {
    appOrigin: string;
    appClientId: string;
    returnTo: string;
  },
): Promise<string> {
  const appOrigin = opts.appOrigin.replace(/\/$/, "");
  const redirectUri = `${appOrigin}/auth/processing`;

  const oauthCode = await storeOAuthContext(
    {
      client_id: opts.appClientId,
      redirect_uri: redirectUri,
      scope: "openid profile",
      app_origin: appOrigin,
      return_to: opts.returnTo,
    },
    10,
  );

  await updateOAuthContext({
    oauthCode,
    sessionData: session,
  });

  const target = new URL(redirectUri);
  target.searchParams.set("code", oauthCode);
  target.searchParams.set("return_to", opts.returnTo);

  return target.toString();
}
