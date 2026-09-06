import {
  clearClientSessionCookies,
  getAuthLogoutUrl,
  readClientSessionSnapshot,
} from "@cosmediate/config";
import { NextRequest, NextResponse } from "next/server";

import { authError } from "@cosmediate/type-utils";

import { createCorsHelpers } from "../cors";
import type { LogoutRouteHandlerConfig } from "../types";

export function createLogoutRouteHandlers(cfg: LogoutRouteHandlerConfig): {
  OPTIONS: (request: NextRequest) => NextResponse;
  POST: (request: NextRequest) => Promise<Response>;
} {
  const { optionsHandler, requestHeader } = createCorsHelpers(
    cfg.allowedOrigins,
  );

  return {
    OPTIONS: (request: NextRequest) => optionsHandler(request),

    POST: async (request: NextRequest) => {
      const headers = requestHeader(request);

      try {
        const body = await request.json().catch(() => ({}));
        const access_token =
          typeof body.access_token === "string"
            ? body.access_token
            : typeof body.accessToken === "string"
              ? body.accessToken
              : undefined;

        if (!access_token) {
          console.warn(`${cfg.routeLogPrefix} No access token provided`);
          return authError("not_authenticated", "Access token is required", {
            init: { headers },
          });
        }

        let logoutUrl: string;
        try {
          logoutUrl = getAuthLogoutUrl();
        } catch (err) {
          console.error(cfg.routeLogPrefix, err);
          return authError(
            "server_misconfig",
            "Auth provider environment variables are not configured",
            { init: { headers } },
          );
        }

        const snap = readClientSessionSnapshot(
          (name) => request.cookies.get(name)?.value,
        );

        try {
          const logoutApiRes = await fetch(logoutUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${access_token}`,
            },
            body: JSON.stringify({
              sessionId: snap?.sessionId,
            }),
          });

          if (!logoutApiRes.ok) {
            const errorPayload = await logoutApiRes.json().catch(() => null);
            console.error(
              `${cfg.routeLogPrefix} Auth server logout failed`,
              errorPayload,
            );
          }
        } catch (error) {
          console.error(
            `${cfg.routeLogPrefix} Error calling auth server`,
            error,
          );
        }

        const response = NextResponse.json(
          { success: true },
          {
            status: 200,
            headers,
          },
        );

        clearClientSessionCookies(response);
        return response;
      } catch (error) {
        console.error(`${cfg.routeLogPrefix} Unexpected error`, error);

        const response = authError(
          "server_error",
          error instanceof Error ? error?.message : "Internal server error",
          { init: { headers } },
        );
        clearClientSessionCookies(response);
        return response;
      }
    },
  };
}
