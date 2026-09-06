import { NextRequest, NextResponse } from "next/server";

import {
  clearClientSessionCookies,
  getAuthCallbackUrl,
  getAuthTokenUrl,
  parseOAuthTokenSuccessPayload,
  setClientSessionCookies,
} from "@cosmediate/config";
import { authError } from "@cosmediate/type-utils";

import type { ExchangeCodeRouteHandlerConfig } from "../types";
import { createCorsHelpers } from "../cors";

export function createExchangeCodeRouteHandlers(
  cfg: ExchangeCodeRouteHandlerConfig,
): {
  OPTIONS: (request: NextRequest) => NextResponse;
  POST: (request: NextRequest) => Promise<Response>;
} {
  const { optionsHandler, requestHeader } = createCorsHelpers(
    cfg.allowedOrigins,
  );
  const mapRedirect = cfg.exchangeRedirectTransform ?? ((p) => p.redirect_to);

  return {
    OPTIONS: (request: NextRequest) => optionsHandler(request),

    POST: async (request: NextRequest) => {
      try {
        const body = await request.json();
        const { code } = body;

        if (!code) {
          return authError(
            "missing_auth_code",
            "Authorization code is required",
            { init: { headers: requestHeader(request) } },
          );
        }

        const clientId = process.env.AUTH_CLIENT_ID;
        const clientSecret = process.env.AUTH_CLIENT_SECRET;

        if (!clientId || !clientSecret) {
          console.error(`${cfg.routeLogPrefix} Missing auth client creds`);
          return authError(
            "server_misconfig",
            "Auth provider environment variables are not configured",
            { init: { headers: requestHeader(request) } },
          );
        }

        let redirectUri: string;
        let tokenUrl: string;
        try {
          redirectUri = getAuthCallbackUrl(request);
          tokenUrl = getAuthTokenUrl();
        } catch (err) {
          console.error(cfg.routeLogPrefix, err);
          return authError(
            "server_misconfig",
            "Auth provider environment variables are not configured",
            { init: { headers: requestHeader(request) } },
          );
        }

        const reqParams = new URLSearchParams({
          grant_type: "authorization_code",
          code,
          redirect_uri: redirectUri,
          client_id: clientId,
          client_secret: clientSecret,
        });

        const tokenRes = await fetch(tokenUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: reqParams,
        });

        if (!tokenRes.ok) {
          const errorData = await tokenRes.json().catch(() => null);
          console.error(
            `${cfg.routeLogPrefix} Token exchange failed`,
            errorData,
          );

          return authError(
            "token_exchange_failed",
            errorData?.message || "Token exchange failed",
            {
              status: 401,
              details: errorData ?? undefined,
              init: { headers: requestHeader(request) },
            },
          );
        }

        const raw = await tokenRes.json();
        const parsed = parseOAuthTokenSuccessPayload(raw);

        if (!parsed) {
          return authError(
            "token_exchange_failed",
            "Invalid token response from auth provider",
            {
              status: 401,
              init: { headers: requestHeader(request) },
            },
          );
        }

        const redirectTo = mapRedirect(parsed);

        const response = NextResponse.json(
          {
            success: true,
            redirectTo,
          },
          { status: 200, headers: requestHeader(request) },
        );

        clearClientSessionCookies(response);
        setClientSessionCookies(response, {
          session_id: parsed.session_id,
          access_token: parsed.access_token,
          token_exp: parsed.token_exp,
          refresh_exp: parsed.refresh_exp,
          identity_id: parsed.identity_id,
          profile_id: parsed.profile_id,
          user_role: parsed.user_role,
        });

        return response;
      } catch (error) {
        console.error(`${cfg.routeLogPrefix} Unexpected error`, error);

        return authError(
          "server_error",
          error instanceof Error ? error?.message : "Internal server error",
          { init: { headers: requestHeader(request) } },
        );
      }
    },
  };
}
