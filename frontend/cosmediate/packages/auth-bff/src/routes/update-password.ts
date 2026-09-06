import { getAuthProviderUrl } from "@cosmediate/config";
import { NextRequest, NextResponse } from "next/server";

import { authError } from "@cosmediate/type-utils";

import { createCorsHelpers } from "../cors";
import { getPasswordFlowCredentials } from "../password-flow-session";
import type { PasswordRouteHandlerConfig } from "../types";

export function createUpdatePasswordRouteHandlers(
  cfg: PasswordRouteHandlerConfig,
): {
  OPTIONS: (request: NextRequest) => NextResponse;
  POST: (request: NextRequest) => Promise<Response>;
} {
  const { optionsHandler, requestHeader } = createCorsHelpers(
    cfg.allowedOrigins,
  );

  return {
    OPTIONS: (request: NextRequest) => optionsHandler(request),

    POST: async (request: NextRequest) => {
      try {
        const body = (await request.json().catch(() => ({}))) as {
          oldPassword?: string;
          newPassword?: string;
        };

        const { oldPassword, newPassword } = body;

        if (!oldPassword || !newPassword) {
          return authError(
            "invalid_request",
            "Old password and new password are required",
            { init: { headers: requestHeader(request) } },
          );
        }

        let authProviderUrl: string;
        try {
          authProviderUrl = getAuthProviderUrl();
        } catch (err) {
          console.error(cfg.routeLogPrefix, err);
          return authError(
            "server_misconfig",
            "Auth provider environment variables are not configured",
            { init: { headers: requestHeader(request) } },
          );
        }

        const creds = await getPasswordFlowCredentials(request);

        if (!creds) {
          return authError("not_authenticated", "Not authenticated", {
            init: { headers: requestHeader(request) },
          });
        }

        const authRes = await fetch(
          `${authProviderUrl}/api/auth/update-password`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Cookie: request.headers.get("cookie") || "",
            },
            body: JSON.stringify({
              oldPassword,
              newPassword,
              email: creds.email,
              userId: creds.userId,
              accessToken: creds.accessToken,
            }),
          },
        );

        const data = await authRes.json();
        const status = authRes.ok ? 200 : authRes.status;

        return NextResponse.json(data, {
          status,
          headers: requestHeader(request),
        });
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
